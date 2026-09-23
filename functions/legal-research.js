"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const { createLegalResearchService } = require("./legal-research/composition");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

const geminiApiKey = String(process.env.GEMINI_API_KEY || "").trim();

let legalResearchService;

function getLegalResearchService() {
  if (!legalResearchService) {
    legalResearchService = createLegalResearchService({
      geminiApiKey,
    });
  }

  return legalResearchService;
}

const MAX_QUERY_LENGTH = 5000;
const MAX_REQUESTS_PER_MINUTE = 10;
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

function requireAuth(context) {
  if (!context.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Login required."
    );
  }

  return context.auth.uid;
}

async function getAuthorizedOrganizationId(uid, organizationId) {
  if (!organizationId) {
    throw new HttpsError(
      "invalid-argument",
      "Organization ID is required."
    );
  }

  const membershipRef = db
    .collection("organizations")
    .doc(organizationId)
    .collection("members")
    .doc(uid);

  const membershipDoc = await membershipRef.get();

  if (
    !membershipDoc.exists ||
    membershipDoc.data()?.status !== "active"
  ) {
    throw new HttpsError(
      "permission-denied",
      "Active organization membership is required."
    );
  }

  return organizationId;
}

async function checkRateLimit(uid) {
  const oneMinuteAgo = new Date(Date.now() - 60 * 1000);

  const snapshot = await db
    .collection("ai_logs")
    .where("uid", "==", uid)
    .where("createdAt", ">=", oneMinuteAgo)
    .get();

  if (snapshot.size >= MAX_REQUESTS_PER_MINUTE) {
    throw new HttpsError(
      "resource-exhausted",
      "Too many AI requests. Please wait a minute and try again."
    );
  }
}

function validateResearchRequest(data) {
  if (!data || typeof data !== "object" || Array.isArray(data)) {
    throw new HttpsError(
      "invalid-argument",
      "A valid research request is required."
    );
  }

  const query = typeof data.query === "string"
    ? data.query.trim()
    : "";

  if (!query) {
    throw new HttpsError(
      "invalid-argument",
      "Research query is required."
    );
  }

  if (query.length > MAX_QUERY_LENGTH) {
    throw new HttpsError(
      "invalid-argument",
      `Research query exceeds the maximum length of ${MAX_QUERY_LENGTH} characters.`
    );
  }

  const organizationId = typeof data.organizationId === "string"
    ? data.organizationId.trim()
    : "";

  if (!organizationId) {
    throw new HttpsError(
      "invalid-argument",
      "Organization ID is required."
    );
  }

  if (
    data.practiceArea !== undefined &&
    typeof data.practiceArea !== "string"
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Practice area must be a string."
    );
  }

  if (
    data.sources !== undefined &&
    (!Array.isArray(data.sources) ||
      data.sources.some((source) => typeof source !== "string"))
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Sources must be an array of strings."
    );
  }

  if (
    data.jurisdiction !== undefined &&
    (!data.jurisdiction ||
      typeof data.jurisdiction !== "object" ||
      Array.isArray(data.jurisdiction))
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Jurisdiction must be a valid object."
    );
  }

  if (
    data.dateRange !== undefined &&
    (!data.dateRange ||
      typeof data.dateRange !== "object" ||
      Array.isArray(data.dateRange) ||
      typeof data.dateRange.from !== "string" ||
      typeof data.dateRange.to !== "string")
  ) {
    throw new HttpsError(
      "invalid-argument",
      "Date range must contain valid from and to values."
    );
  }

  return {
    query,
    organizationId,
  };
}

function createLegalResearchHandler(dependencies = {}) {
  if (
    !dependencies.researchService ||
    typeof dependencies.researchService.research !== "function"
  ) {
    throw new Error("A valid legal research service is required.");
  }

  const auth = dependencies.requireAuth || requireAuth;
  const authorizeOrganization =
    dependencies.getAuthorizedOrganizationId ||
    getAuthorizedOrganizationId;
  const rateLimit = dependencies.checkRateLimit || checkRateLimit;

  return async (data, context) => {
    const uid = auth(context);

    const validated = validateResearchRequest(data);

    const organizationId = await authorizeOrganization(
      uid,
      validated.organizationId,
    );

    await rateLimit(uid);

    const query = {
      query: validated.query,
      sources: Array.isArray(data.sources) ? data.sources : [],
      ...(data.jurisdiction
        ? { jurisdiction: data.jurisdiction }
        : {}),
      ...(data.practiceArea
        ? { practiceArea: String(data.practiceArea).trim() }
        : {}),
      ...(data.dateRange
        ? { dateRange: data.dateRange }
        : {}),
    };

    return dependencies.researchService.research({
      query,
      organizationId,
    });
  };
}

function createLegalResearchCallableHandler(dependencies = {}) {
  const database = dependencies.db || db;
  const researchService = dependencies.researchService;

  const auth = dependencies.requireAuth || requireAuth;
  const authorizeOrganization =
    dependencies.getAuthorizedOrganizationId ||
    getAuthorizedOrganizationId;
  const rateLimit = dependencies.checkRateLimit || checkRateLimit;

  return async (data, context) => {
    const uid = auth(context);

    const {
      query,
      organizationId: requestedOrganizationId,
    } = validateResearchRequest(data);

    const organizationId = await authorizeOrganization(
      uid,
      requestedOrganizationId,
    );

    await rateLimit(uid);

    const sessionRef = database
      .collection("organizations")
      .doc(organizationId)
      .collection("legalResearchSessions")
      .doc();

    const now = FieldValue.serverTimestamp();

    await sessionRef.set({
      userId: uid,
      organizationId,
      query: {
        query,
        ...(data.jurisdiction
          ? { jurisdiction: data.jurisdiction }
          : {}),
        ...(data.practiceArea
          ? { practiceArea: String(data.practiceArea).trim() }
          : {}),
        ...(data.dateRange
          ? { dateRange: data.dateRange }
          : {}),
        sources: Array.isArray(data.sources) ? data.sources : [],
      },
      status: "queued",
      createdAt: now,
      updatedAt: now,
    });

    try {
      const service = researchService || getLegalResearchService();

      const serviceResult = await service.research({
        query: {
          query,
          sources: Array.isArray(data.sources) ? data.sources : [],
          ...(data.jurisdiction
            ? { jurisdiction: data.jurisdiction }
            : {}),
          ...(data.practiceArea
            ? { practiceArea: String(data.practiceArea).trim() }
            : {}),
          ...(data.dateRange
            ? { dateRange: data.dateRange }
            : {}),
        },
        organizationId,
      });

      const researchResult = serviceResult.research;
      const response = String(researchResult?.summary || "").trim();

      if (!response) {
        throw new Error("Empty legal research response.");
      }

      await sessionRef.update({
        status: "completed",
        results: researchResult,
        updatedAt: FieldValue.serverTimestamp(),
      });

      await database.collection("ai_logs").add({
        uid,
        organizationId,
        prompt: query,
        provider: "gemini",
        model: DEFAULT_GEMINI_MODEL,
        status: "completed",
        createdAt: FieldValue.serverTimestamp(),
      });

      return {
        success: true,
        sessionId: sessionRef.id,
        organizationId,
        query,
        response,
        provider: "gemini",
        model: DEFAULT_GEMINI_MODEL,
        timestamp: Date.now(),
        research: serviceResult.research,
        evidenceSet: serviceResult.evidenceSet,
        retrieval: serviceResult.retrieval,
        verification: serviceResult.verification,
        synthesis: serviceResult.synthesis,
      };
    } catch (error) {
      await sessionRef.update({
        status: "failed",
        updatedAt: FieldValue.serverTimestamp(),
      });

      console.error("Legal research error:", error);

      throw new HttpsError(
        "internal",
        "Legal research request failed.",
      );
    }
  };
}

exports.legalResearch = onCall(
  async (request) => createLegalResearchCallableHandler()(
    request.data,
    request,
  ),
);

module.exports.createLegalResearchHandler = createLegalResearchHandler;
module.exports.createLegalResearchCallableHandler = createLegalResearchCallableHandler;

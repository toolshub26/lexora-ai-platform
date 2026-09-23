"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");
const { GoogleGenAI } = require("@google/genai");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();
const geminiApiKey = String(process.env.GEMINI_API_KEY || "").trim();
const ai = geminiApiKey
  ? new GoogleGenAI({ apiKey: geminiApiKey })
  : null;

const MAX_PROMPT_LENGTH = 5000;
const MAX_REQUESTS_PER_MINUTE = 10;
const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";
const ALLOWED_GEMINI_MODELS = new Set([
  "gemini-2.5-pro",
  "gemini-2.5-flash"
]);

function requireAuth(context) {
  if (!context.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Login required."
    );
  }

  return context.auth.uid;
}

// Resolve the organization ID for a given user ID by checking their memberships.
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

exports.askAI = onCall(async (request) => {
  const data = request.data;
  const context = request;
  const uid = requireAuth(context);

  const prompt = String(data.prompt || "").trim();
  const requestedProvider = String(data.provider || "google").trim().toLowerCase();
  const requestedModel = String(data.model || "").trim();

  if (requestedProvider !== "google" && requestedProvider !== "gemini") {
    throw new HttpsError(
      "invalid-argument",
      "Unsupported AI provider."
    );
  }

  const provider = "gemini";

  const model = requestedModel || DEFAULT_GEMINI_MODEL;

  if (!ALLOWED_GEMINI_MODELS.has(model)) {
    throw new HttpsError(
      "invalid-argument",
      "Unsupported Gemini model."
    );
  }

  if (!prompt) {
    throw new HttpsError(
      "invalid-argument",
      "Prompt is required."
    );
  }

  if (prompt.length > MAX_PROMPT_LENGTH) {
    throw new HttpsError(
      "invalid-argument",
      `Prompt exceeds the maximum length of ${MAX_PROMPT_LENGTH} characters.`
    );
  }

  const organizationId = await getAuthorizedOrganizationId(uid, String(data.organizationId || "").trim());

  const oneMinuteAgo = Date.now() - 60 * 1000;

  const recentRequests = await db
    .collection("ai_logs")
    .where("uid", "==", uid)
    .where("createdAt", ">=", new Date(oneMinuteAgo))
    .get();

  if (recentRequests.size >= MAX_REQUESTS_PER_MINUTE) {
    throw new HttpsError(
      "resource-exhausted",
      "Too many AI requests. Please wait a minute and try again."
    );
  }

  await db.collection("ai_logs").add({
    uid,
    prompt,
    provider,
    model,
    organizationId,
    status: "received",
    createdAt: FieldValue.serverTimestamp()
  });

  if (!ai) {
    throw new HttpsError(
      "failed-precondition",
      "Gemini AI is not configured on the server."
    );
  }

  const result = await ai.models.generateContent({
    model,
    contents: prompt
  });

  return {
    success: true,
    provider,
    model,
    message: "AI response generated successfully.",
    response: result.text,
    timestamp: Date.now()
  };
});

exports.getAIUsage = onCall(async (request) => {
  const data = request.data;
  const context = request;
  const uid = requireAuth(context);
  const organizationId = await getAuthorizedOrganizationId(
    uid,
    String(data.organizationId || "").trim()
  );

  const snapshot = await db
    .collection("ai_logs")
    .where("uid", "==", uid)
    .where("organizationId", "==", organizationId)
    .get();

  return {
    success: true,
    totalRequests: snapshot.size
  };
});

exports.clearAIHistory = onCall(async (request) => {
  const data = request.data;
  const context = request;
  const uid = requireAuth(context);
  const organizationId = await getAuthorizedOrganizationId(
    uid,
    String(data.organizationId || "").trim()
  );

  const snapshot = await db
    .collection("ai_logs")
    .where("uid", "==", uid)
    .where("organizationId", "==", organizationId)
    .get();

  const batch = db.batch();

  snapshot.forEach((doc) => batch.delete(doc.ref));

  await batch.commit();

  return {
    success: true,
    deleted: snapshot.size
  };
});

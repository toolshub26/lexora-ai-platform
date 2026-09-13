import { getFunctions, httpsCallable } from "firebase/functions";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query as firestoreQuery,
} from "firebase/firestore";

import { firebaseApp, db } from "@/lib/firebase";

import type {
  LegalJurisdictionRef,
  LegalResearchQuery,
  LegalResearchResult,
  LegalResearchSession,
  LegalResearchStatus,
  LegalSourceType,
} from "./types";

const functions = getFunctions(firebaseApp);
const COLLECTION = "legalResearchSessions";

interface LegalResearchCallableRequest {
  query: string;
  organizationId: string;
  jurisdiction?: LegalJurisdictionRef;
  practiceArea?: string;
  dateRange?: {
    from: string;
    to: string;
  };
  sources?: LegalSourceType[];
}

interface LegalResearchCallableResponse {
  success: boolean;
  sessionId: string;
  organizationId: string;
  query: string;
  response: string;
  provider: string;
  model: string;
  timestamp: number;
}

function sessionsCollection(organizationId: string) {
  return collection(
    db,
    "organizations",
    organizationId,
    COLLECTION,
  );
}

function sessionDocument(
  organizationId: string,
  sessionId: string,
) {
  return doc(
    db,
    "organizations",
    organizationId,
    COLLECTION,
    sessionId,
  );
}

function mapSession(
  id: string,
  data: Record<string, unknown>,
): LegalResearchSession {
  const rawQuery = data.query;

  const storedQuery =
    typeof rawQuery === "string"
      ? {
          query: rawQuery,
          sources: [] as LegalSourceType[],
        }
      : rawQuery && typeof rawQuery === "object"
        ? (rawQuery as LegalResearchQuery)
        : {
            query: "",
            sources: [] as LegalSourceType[],
          };

  return {
    id,
    userId: String(data.userId || ""),
    organizationId: String(data.organizationId || ""),
    query: {
      query: String(storedQuery.query || ""),
      ...(storedQuery.jurisdiction
        ? { jurisdiction: storedQuery.jurisdiction }
        : {}),
      ...(storedQuery.practiceArea
        ? { practiceArea: storedQuery.practiceArea }
        : {}),
      ...(storedQuery.dateRange
        ? { dateRange: storedQuery.dateRange }
        : {}),
      sources: Array.isArray(storedQuery.sources)
        ? storedQuery.sources
        : [],
    },
    status: data.status as LegalResearchStatus,
    results: data.results
      ? (data.results as LegalResearchResult)
      : undefined,
    createdAt:
      data.createdAt &&
      typeof (data.createdAt as { toDate?: unknown }).toDate === "function"
        ? (data.createdAt as { toDate: () => Date }).toDate()
        : new Date(),
    updatedAt:
      data.updatedAt &&
      typeof (data.updatedAt as { toDate?: unknown }).toDate === "function"
        ? (data.updatedAt as { toDate: () => Date }).toDate()
        : new Date(),
  };
}

export class LegalResearchService {
  async search(
    organizationId: string,
    searchQuery: LegalResearchQuery,
  ): Promise<LegalResearchResult> {
    const normalizedOrganizationId = organizationId.trim();
    const query = searchQuery.query.trim();

    if (!normalizedOrganizationId) {
      throw new Error("Organization ID is required.");
    }

    if (!query) {
      throw new Error("Research query is required.");
    }

    const callable = httpsCallable<
      LegalResearchCallableRequest,
      LegalResearchCallableResponse
    >(functions, "legalResearch");

    const result = await callable({
      query,
      organizationId: normalizedOrganizationId,
      ...(searchQuery.jurisdiction
        ? { jurisdiction: searchQuery.jurisdiction }
        : {}),
      ...(searchQuery.practiceArea
        ? { practiceArea: searchQuery.practiceArea }
        : {}),
      ...(searchQuery.dateRange
        ? {
            dateRange: {
              from: searchQuery.dateRange.from.toISOString(),
              to: searchQuery.dateRange.to.toISOString(),
            },
          }
        : {}),
      sources: searchQuery.sources,
    });

    if (!result.data.success) {
      throw new Error("Legal research request failed.");
    }

    return {
      query: result.data.query,
      sources: [],
      totalResults: 0,
      executionTimeMs: 0,
      completedAt: new Date(result.data.timestamp),
      summary: result.data.response,
    };
  }

  async getSession(
    organizationId: string,
    sessionId: string,
  ): Promise<LegalResearchSession | null> {
    const normalizedOrganizationId = organizationId.trim();
    const normalizedSessionId = sessionId.trim();

    if (!normalizedOrganizationId) {
      throw new Error("Organization ID is required.");
    }

    if (!normalizedSessionId) {
      throw new Error("Session ID is required.");
    }

    const snapshot = await getDoc(
      sessionDocument(
        normalizedOrganizationId,
        normalizedSessionId,
      ),
    );

    if (!snapshot.exists()) {
      return null;
    }

    return mapSession(
      snapshot.id,
      snapshot.data() as Record<string, unknown>,
    );
  }

  async listSessions(
    organizationId: string,
  ): Promise<LegalResearchSession[]> {
    const normalizedOrganizationId = organizationId.trim();

    if (!normalizedOrganizationId) {
      throw new Error("Organization ID is required.");
    }

    const snapshot = await getDocs(
      firestoreQuery(
        sessionsCollection(normalizedOrganizationId),
        orderBy("createdAt", "desc"),
      ),
    );

    return snapshot.docs.map((item) =>
      mapSession(
        item.id,
        item.data() as Record<string, unknown>,
      ),
    );
  }
}

export const legalResearchService = new LegalResearchService();

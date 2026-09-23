import { vi } from "vitest";

const mockCallable = vi.fn();

vi.mock("@/lib/firebase", () => ({
  auth: {
    currentUser: {
      uid: "test-user-id",
    },
  },
  db: {},
  firebaseApp: {},
}));

vi.mock("firebase/functions", () => ({
  getFunctions: vi.fn(() => ({})),
  httpsCallable: vi.fn(() => mockCallable),
}));

vi.mock("firebase/firestore", () => ({
  collection: vi.fn(() => ({ type: "collection" })),
  doc: vi.fn(() => ({ type: "document" })),
  getDoc: vi.fn(),
  getDocs: vi.fn(),
  orderBy: vi.fn(),
  query: vi.fn(() => ({ type: "query" })),
}));

import { legalResearchService } from "@/features/legal-research/service";

describe("LegalResearchService", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should have service instance", () => {
    expect(legalResearchService).toBeDefined();
  });

  it("should have search method", () => {
    expect(typeof legalResearchService.search).toBe("function");
  });

  it("should have getSession method", () => {
    expect(typeof legalResearchService.getSession).toBe("function");
  });

  it("should have listSessions method", () => {
    expect(typeof legalResearchService.listSessions).toBe("function");
  });

  it("search should call the legalResearch backend", async () => {
    mockCallable.mockResolvedValueOnce({
      data: {
        success: true,
        sessionId: "session-1",
        organizationId: "test-org-id",
        query: "test search",
        response: "Research summary",
        provider: "gemini",
        model: "gemini-2.5-flash",
        timestamp: Date.now(),
        research: {
          query: "test search",
          sources: [],
          totalResults: 0,
          executionTimeMs: 10,
          completedAt: new Date(),
          summary: "Research summary",
          citations: [],
        },
        evidenceSet: {
          sources: [],
          evidence: [],
          verifications: [],
          citations: [],
        },
        retrieval: {
          sources: [],
          evidence: [],
          researchSources: [],
          citations: [],
          fetches: [],
        },
        verification: {
          verifications: [],
          citations: [],
        },
        synthesis: {
          summary: "Research summary",
          citationIds: [],
        },
      },
    });

    const result = await legalResearchService.search(
      "test-org-id",
      {
        query: "test search",
        practiceArea: undefined,
        jurisdiction: undefined,
        dateRange: undefined,
        sources: [],
      },
    );

    expect(mockCallable).toHaveBeenCalledTimes(1);
    expect(mockCallable).toHaveBeenCalledWith({
      query: "test search",
      organizationId: "test-org-id",
      sources: [],
    });

    expect(result).toBeDefined();
    expect(result.research.query).toBe("test search");
    expect(result.research.summary).toBe("Research summary");
    expect(Array.isArray(result.research.sources)).toBe(true);
    expect(result.research.sources).toHaveLength(0);
    expect(result.evidenceSet).toBeDefined();
    expect(result.evidenceSet.sources).toHaveLength(0);
    expect(result.evidenceSet.evidence).toHaveLength(0);
    expect(result.retrieval).toBeDefined();
    expect(result.verification).toBeDefined();
    expect(result.synthesis).toBeDefined();
    expect(result.synthesis?.summary).toBe("Research summary");
  });

  it("search should preserve the verified backend research result", async () => {
    const completedAt = new Date("2026-09-16T00:00:00.000Z");

    mockCallable.mockResolvedValueOnce({
      data: {
        success: true,
        sessionId: "session-rich-1",
        organizationId: "test-org-id",
        query: "What is Article 21?",
        response: "Verified legal research summary.",
        provider: "gemini",
        model: "gemini-2.5-flash",
        timestamp: completedAt.getTime(),
        research: {
          query: "What is Article 21?",
          sources: [
            {
              id: "portal:in:supreme-court",
              title: "Supreme Court of India",
              citation: "Supreme Court of India",
              sourceType: "official-publications",
              jurisdictionId: "country:IN",
              authorityId: "court:in:supreme-court",
              authorityName: "Supreme Court of India",
              sourceUrl: "https://www.sci.gov.in/",
              snippet: "Verified legal evidence.",
              relevance: 1,
              verificationStatus: "verified",
              retrievedAt: completedAt,
            },
          ],
          totalResults: 1,
          executionTimeMs: 42,
          completedAt,
          summary: "Verified legal research summary.",
          citations: [
            {
              sourceId: "portal:in:supreme-court",
              citation: "Supreme Court of India",
              verificationStatus: "verified",
            },
          ],
        },
        evidenceSet: {
          sources: [],
          evidence: [
            {
              id: "evidence-1",
              sourceId: "portal:in:supreme-court",
              kind: "excerpt",
              excerpt: "Verified legal evidence.",
              retrievedAt: completedAt,
            },
          ],
          verifications: [
            {
              sourceId: "portal:in:supreme-court",
              status: "verified",
              verifiedAt: completedAt,
              authorityConfirmed: true,
              jurisdictionConfirmed: true,
            },
          ],
          citations: [],
        },
        retrieval: {
          sources: [],
          evidence: [],
          researchSources: [],
          citations: [],
          fetches: [],
        },
        verification: {
          verifications: [],
          citations: [],
        },
        synthesis: {
          summary: "Verified legal research summary.",
          citationIds: ["portal:in:supreme-court"],
        },
      },
    });

    const result = await legalResearchService.search(
      "test-org-id",
      {
        query: "What is Article 21?",
        sources: ["official-publications"],
      },
    );

    expect(result.research.summary).toBe(
      "Verified legal research summary.",
    );
    expect(result.research.totalResults).toBe(1);
    expect(result.research.executionTimeMs).toBe(42);
    expect(result.research.completedAt).toEqual(completedAt);

    expect(result.research.sources).toHaveLength(1);
    expect(result.research.sources[0].id).toBe("portal:in:supreme-court");
    expect(result.research.sources[0].verificationStatus).toBe("verified");

    expect(result.research.citations).toHaveLength(1);
    expect(result.research.citations?.[0].sourceId).toBe(
      "portal:in:supreme-court",
    );

    expect(result.evidenceSet.sources).toHaveLength(0);
    expect(result.evidenceSet.evidence).toHaveLength(1);
    expect(result.evidenceSet.evidence[0].id).toBe("evidence-1");
    expect(result.evidenceSet.verifications).toHaveLength(1);
    expect(result.evidenceSet.verifications[0].status).toBe("verified");

    expect(result.retrieval).toBeDefined();
    expect(result.verification).toBeDefined();
    expect(result.synthesis).toBeDefined();
    expect(result.synthesis?.summary).toBe(
      "Verified legal research summary.",
    );
    expect(result.synthesis?.citationIds).toEqual([
      "portal:in:supreme-court",
    ]);
  });

  it("getSession should retrieve an organization-scoped session", async () => {
    const { getDoc } = await import("firebase/firestore");

    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => true,
      id: "session-1",
      data: () => ({
        userId: "test-user-id",
        organizationId: "test-org-id",
        query: "test search",
        status: "completed",
        createdAt: {
          toDate: () => new Date("2026-01-01T00:00:00.000Z"),
        },
        updatedAt: {
          toDate: () => new Date("2026-01-01T00:01:00.000Z"),
        },
      }),
    } as never);

    const result = await legalResearchService.getSession(
      "test-org-id",
      "session-1",
    );

    expect(result).not.toBeNull();
    expect(result?.id).toBe("session-1");
    expect(result?.organizationId).toBe("test-org-id");
    expect(result?.status).toBe("completed");
  });

  it("getSession should return null when the session does not exist", async () => {
    const { getDoc } = await import("firebase/firestore");

    vi.mocked(getDoc).mockResolvedValueOnce({
      exists: () => false,
    } as never);

    const result = await legalResearchService.getSession(
      "test-org-id",
      "missing-session",
    );

    expect(result).toBeNull();
  });

  it("listSessions should retrieve organization-scoped sessions", async () => {
    const { getDocs } = await import("firebase/firestore");

    vi.mocked(getDocs).mockResolvedValueOnce({
      docs: [
        {
          id: "session-1",
          data: () => ({
            userId: "test-user-id",
            organizationId: "test-org-id",
            query: "first search",
            status: "completed",
            createdAt: {
              toDate: () => new Date("2026-01-01T00:00:00.000Z"),
            },
            updatedAt: {
              toDate: () => new Date("2026-01-01T00:01:00.000Z"),
            },
          }),
        },
      ],
    } as never);

    const result = await legalResearchService.listSessions(
      "test-org-id",
    );

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe("session-1");
    expect(result[0].organizationId).toBe("test-org-id");
  });
});

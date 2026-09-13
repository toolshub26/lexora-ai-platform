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
    expect(result.query).toBe("test search");
    expect(result.summary).toBe("Research summary");
    expect(Array.isArray(result.sources)).toBe(true);
    expect(result.sources).toHaveLength(0);
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

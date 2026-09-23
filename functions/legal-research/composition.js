"use strict";

const {
  ServerLegalSourceRegistry,
} = require("./registry");

const {
  ServerLegalSourceFetcher,
} = require("./source-fetcher");

const {
  ServerLegalSourceDiscoveryProvider,
  ServerLegalDocumentDiscoveryProvider,
} = require("./discovery");

const {
  ServerIndiaCodeDocumentSearcher,
} = require("./india-code-discovery");
const {
  ServerLegalSourceRetriever,
} = require("./retriever");
 const {
  ServerSupremeCourtDocumentSearcher,
} = require("./supreme-court-discovery");
const { request: undiciRequest } = require("undici");
const {
  SupremeCourtJudgmentLocator,
} = require("./supreme-court-locator");
const {
  SupremeCourtJudgmentResolver,
} = require("./supreme-court-resolver");
const {
  SupremeCourtDocumentRetriever,
} = require("./supreme-court-retriever");
const {
  CompositeLegalDocumentRetriever,
} = require("./composite-retriever");
const {
  ServerLegalSourceVerifier,
} = require("./verifier");

const {
  ServerLegalJurisdictionRegistry,
} = require("./jurisdiction-registry");

const {
  ServerLegalAuthorityRegistry,
} = require("./authority-registry");

const {
  ServerLegalSynthesisProvider,
} = require("./synthesis");

const {
  ServerLegalResearchOrchestrator,
} = require("./orchestrator");

const {
  ServerLegalResearchService,
} = require("./service");

const {
  createGeminiLegalSynthesisModel,
} = require("./gemini-client");

const {
  createGeminiLegalSynthesisGenerator,
} = require("./gemini-synthesis");

const DEFAULT_GEMINI_MODEL = "gemini-2.5-flash";

function createLegalResearchService(options = {}) {
  let synthesis = options.synthesis;

  if (!options.orchestrator && !synthesis) {
    const geminiApiKey = String(
      options.geminiApiKey || process.env.GEMINI_API_KEY || "",
    ).trim();

    if (!geminiApiKey) {
      throw new Error("Gemini API key is required.");
    }

    const geminiModel = createGeminiLegalSynthesisModel({
      apiKey: geminiApiKey,
      modelName: options.geminiModelName || DEFAULT_GEMINI_MODEL,
    });

    const geminiGenerator = createGeminiLegalSynthesisGenerator({
      model: geminiModel,
    });

    synthesis = new ServerLegalSynthesisProvider({
      generate: geminiGenerator,
    });
  }

  const jurisdictionRegistry =
    options.jurisdictionRegistry ||
    new ServerLegalJurisdictionRegistry();

  const authorityRegistry =
    options.authorityRegistry ||
    new ServerLegalAuthorityRegistry(
      undefined,
      jurisdictionRegistry,
    );

  const sourceRegistry =
    options.sourceRegistry ||
    new ServerLegalSourceRegistry();

  const sourceFetcher =
    options.sourceFetcher ||
    new ServerLegalSourceFetcher();

  const discovery =
    options.discovery ||
    new ServerLegalSourceDiscoveryProvider({
      registry: sourceRegistry,
    });


    const indiaCodeSearcher = new ServerIndiaCodeDocumentSearcher({
      fetch: (url) => sourceFetcher.fetch({ url }),
    });

    const supremeCourtSearcher =
      options.supremeCourtSearcher ||
      new ServerSupremeCourtDocumentSearcher({
        fetch: undiciRequest,
      });

    const documentDiscovery =
      options.documentDiscovery ||
      new ServerLegalDocumentDiscoveryProvider({
        registry: sourceRegistry,
        searchers: {
          "portal:in:india-code": (request) =>
            indiaCodeSearcher.search(request),
            "portal:in:supreme-court": (request) =>
              supremeCourtSearcher.search(request),
        },
      });

      const genericRetriever =
        options.genericRetriever ||
        new ServerLegalSourceRetriever({
          registry: sourceRegistry,
          fetcher: sourceFetcher,
        });

      const supremeCourtLocator =
        options.supremeCourtLocator ||
        new SupremeCourtJudgmentLocator();

      const supremeCourtResolver =
        options.supremeCourtResolver ||
        new SupremeCourtJudgmentResolver({
          fetch: async (url) => sourceFetcher.fetch({ url }),
        });

      const supremeCourtRetriever =
        options.supremeCourtRetriever ||
        new SupremeCourtDocumentRetriever({
          locator: supremeCourtLocator,
          resolver: supremeCourtResolver,
        });

      const retriever =
        options.retriever ||
        new CompositeLegalDocumentRetriever({
          genericRetriever,
          supremeCourtRetriever,
        });

  const verifier =
    options.verifier ||
    new ServerLegalSourceVerifier({
      authorityRegistry,
      jurisdictionRegistry,
    });

  const orchestrator =
    options.orchestrator ||
    new ServerLegalResearchOrchestrator({
      discovery,
      documentDiscovery,
        retriever,
      verifier,
      synthesis,
    });

  return new ServerLegalResearchService({
    orchestrator,
  });
}

module.exports = {
  createLegalResearchService,
  DEFAULT_GEMINI_MODEL,
};

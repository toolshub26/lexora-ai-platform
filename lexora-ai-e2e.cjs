const { initializeApp } = require("firebase/app");
const {
  getAuth,
  connectAuthEmulator,
  createUserWithEmailAndPassword,
} = require("firebase/auth");
const {
  getFunctions,
  connectFunctionsEmulator,
  httpsCallable,
} = require("firebase/functions");

const app = initializeApp({
  apiKey: "demo-api-key",
  authDomain: "lexora-ai-platform.firebaseapp.com",
  projectId: "lexora-ai-platform",
});

const auth = getAuth(app);
connectAuthEmulator(auth, "http://127.0.0.1:9099", {
  disableWarnings: true,
});

const functions = getFunctions(app, "us-central1");
connectFunctionsEmulator(functions, "127.0.0.1", 5001);

(async () => {
  const email = `ai-v2-${Date.now()}@example.com`;
  const password = "TestPassword123!";

  const credential = await createUserWithEmailAndPassword(
    auth,
    email,
    password,
  );

  console.log("AUTH UID:", credential.user.uid);

  const createOrganization = httpsCallable(
    functions,
    "createOrganization",
  );

  const organizationResult = await createOrganization({
    name: `AI V2 Test ${Date.now()}`,
  });

  const organizationId =
    organizationResult.data.organizationId;

  console.log("ORGANIZATION ID:", organizationId);

  const getAIUsage = httpsCallable(functions, "getAIUsage");

  const usageResult = await getAIUsage({
    organizationId,
  });

  console.log("AI USAGE:", usageResult.data);
  console.log("RESULT: AI V2 AUTH + ORGANIZATION + CALLABLE PASS");
})().catch((error) => {
  console.error("E2E FAILURE:", error);
  process.exitCode = 1;
});

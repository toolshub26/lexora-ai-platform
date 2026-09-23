"use strict";

const fs = require("node:fs");
const assert = require("node:assert/strict");
const test = require("node:test");

const {
  initializeTestEnvironment,
  assertFails,
  assertSucceeds,
} = require("@firebase/rules-unit-testing");

const RULES = fs.readFileSync("../firebase/firestore.rules", "utf8");

let testEnv;

test.before(async () => {
  testEnv = await initializeTestEnvironment({
    projectId: "lexora-ai-platform",
    firestore: {
      host: "127.0.0.1",
      port: 8080,
      rules: RULES,
    },
  });
});

test.after(async () => {
  await testEnv.cleanup();
});

test.beforeEach(async () => {
  await testEnv.clearFirestore();
});

async function seedMember(userId, status = "active", role = "member") {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore()
      .collection("organizations")
      .doc("org-1")
      .collection("members")
      .doc(userId)
      .set({
        userId,
        status,
        role,
      });
  });
}

async function seedLegalResearchSession() {
  await testEnv.withSecurityRulesDisabled(async (context) => {
    await context.firestore()
      .collection("organizations")
      .doc("org-1")
      .collection("legalResearchSessions")
      .doc("session-1")
      .set({
        status: "completed",
      });
  });
}

test("unauthenticated user cannot create a legal research session", async () => {
  const db = testEnv.unauthenticatedContext().firestore();

  await assertFails(
    db.collection("organizations")
      .doc("org-1")
      .collection("legalResearchSessions")
      .doc("session-1")
      .set({ status: "queued" }),
  );
});

test("authenticated non-member cannot read a legal research session", async () => {
  await seedLegalResearchSession();

  const db = testEnv.authenticatedContext("user-1").firestore();

  await assertFails(
    db.collection("organizations")
      .doc("org-1")
      .collection("legalResearchSessions")
      .doc("session-1")
      .get(),
  );
});

test("active organization member can read a legal research session", async () => {
  await seedMember("user-1");
  await seedLegalResearchSession();

  const db = testEnv.authenticatedContext("user-1").firestore();

  await assertSucceeds(
    db.collection("organizations")
      .doc("org-1")
      .collection("legalResearchSessions")
      .doc("session-1")
      .get(),
  );
});

test("active membership with matching userId can be read by that user", async () => {
  await seedMember("user-1");

  const db = testEnv.authenticatedContext("user-1").firestore();

  await assertSucceeds(
    db.collection("organizations")
      .doc("org-1")
      .collection("members")
      .doc("user-1")
      .get(),
  );
});

test("user cannot read another user's membership", async () => {
  await seedMember("user-1");

  const db = testEnv.authenticatedContext("user-2").firestore();

  await assertFails(
    db.collection("organizations")
      .doc("org-1")
      .collection("members")
      .doc("user-1")
      .get(),
  );
});

test("active membership can be read through a collection-group query", async () => {
  await seedMember("user-1");
  const db = testEnv.authenticatedContext("user-1").firestore();
  await assertSucceeds(
    db.collectionGroup("members")
      .where("userId", "==", "user-1")
      .where("status", "==", "active")
      .get(),
  );
});

test("inactive member cannot read a legal research session", async () => {
  await seedMember("user-1", "inactive");
  await seedLegalResearchSession();

  const db = testEnv.authenticatedContext("user-1").firestore();

  await assertFails(
    db.collection("organizations")
      .doc("org-1")
      .collection("legalResearchSessions")
      .doc("session-1")
      .get(),
  );
});

test("active member cannot directly create a legal research session", async () => {
  await seedMember("user-1");

  const db = testEnv.authenticatedContext("user-1").firestore();

  await assertFails(
    db.collection("organizations")
      .doc("org-1")
      .collection("legalResearchSessions")
      .doc("session-2")
      .set({ status: "queued" }),
  );
});

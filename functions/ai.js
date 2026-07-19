
"use strict";

const functions = require("firebase-functions");
const admin = require("firebase-admin");

const db = admin.firestore();

function requireAuth(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Login required."
    );
  }

  return context.auth.uid;
}

exports.askAI = functions.https.onCall(async (data, context) => {
  const uid = requireAuth(context);

  const prompt = String(data.prompt || "").trim();
  const provider = String(data.provider || "openai");
  const model = String(data.model || "gpt-4o");

  if (!prompt) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Prompt is required."
    );
  }

  await db.collection("ai_logs").add({
    uid,
    prompt,
    provider,
    model,
    status: "received",
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    success: true,
    provider,
    model,
    message: "AI request received.",
    response:
      "AI provider integration will generate the final response.",
    timestamp: Date.now()
  };
});

exports.getAIUsage = functions.https.onCall(async (data, context) => {
  const uid = requireAuth(context);

  const snapshot = await db
    .collection("ai_logs")
    .where("uid", "==", uid)
    .get();

  return {
    success: true,
    totalRequests: snapshot.size
  };
});

exports.clearAIHistory = functions.https.onCall(async (data, context) => {
  const uid = requireAuth(context);

  const snapshot = await db
    .collection("ai_logs")
    .where("uid", "==", uid)
    .get();

  const batch = db.batch();

  snapshot.forEach((doc) => batch.delete(doc.ref));

  await batch.commit();

  return {
    success: true,
    deleted: snapshot.size
  };
});

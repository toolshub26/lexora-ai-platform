
"use strict";

const { onCall, HttpsError } = require("firebase-functions/v2/https");
const admin = require("firebase-admin");
const { FieldValue } = require("firebase-admin/firestore");

if (!admin.apps.length) {
  admin.initializeApp();
}

const db = admin.firestore();

function requireAuth(context) {
  if (!context.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Login required."
    );
  }

  return context.auth.uid;
}

exports.getPaymentHistory = onCall(async (request) => {
  const data = request.data;
  const context = request;
  const uid = requireAuth(context);

  const snapshot = await db
    .collection("payments")
    .where("uid", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(100)
    .get();

  const payments = snapshot.docs.map((doc) => ({
    id: doc.id,
    ...doc.data()
  }));

  return {
    success: true,
    payments
  };
});

exports.getSubscription = onCall(async (request) => {
  const data = request.data;
  const context = request;
  const uid = requireAuth(context);

  const doc = await db.collection("subscriptions").doc(uid).get();

  if (!doc.exists) {
    return {
      success: true,
      plan: "FREE",
      active: false
    };
  }

  return {
    success: true,
    ...doc.data()
  };
});

exports.cancelSubscription = onCall(async (request) => {
  const data = request.data;
  const context = request;
  const uid = requireAuth(context);

  await db.collection("subscriptions").doc(uid).set(
    {
      plan: "FREE",
      active: false,
      cancelledAt: FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return {
    success: true,
    message: "Subscription cancelled successfully."
  };
});

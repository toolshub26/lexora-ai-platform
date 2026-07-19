
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

exports.getPaymentHistory = functions.https.onCall(async (data, context) => {
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

exports.getSubscription = functions.https.onCall(async (data, context) => {
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

exports.cancelSubscription = functions.https.onCall(async (data, context) => {
  const uid = requireAuth(context);

  await db.collection("subscriptions").doc(uid).set(
    {
      plan: "FREE",
      active: false,
      cancelledAt: admin.firestore.FieldValue.serverTimestamp()
    },
    { merge: true }
  );

  return {
    success: true,
    message: "Subscription cancelled successfully."
  };
});

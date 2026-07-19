
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

exports.sendNotification = functions.https.onCall(async (data, context) => {
  const uid = requireAuth(context);

  const title = String(data.title || "").trim();
  const body = String(data.body || "").trim();

  if (!title || !body) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Title and body are required."
    );
  }

  await db.collection("notifications").add({
    uid,
    title,
    body,
    read: false,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    success: true,
    message: "Notification saved successfully."
  };
});

exports.getNotifications = functions.https.onCall(async (data, context) => {
  const uid = requireAuth(context);

  const snapshot = await db
    .collection("notifications")
    .where("uid", "==", uid)
    .orderBy("createdAt", "desc")
    .limit(50)
    .get();

  const notifications = snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data()
  }));

  return {
    success: true,
    notifications
  };
});

exports.markNotificationRead = functions.https.onCall(async (data, context) => {
  requireAuth(context);

  const id = String(data.id || "");

  if (!id) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Notification ID is required."
    );
  }

  await db.collection("notifications").doc(id).update({
    read: true,
    readAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    success: true
  };
});

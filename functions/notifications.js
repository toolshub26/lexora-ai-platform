
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

exports.sendNotification = onCall(async (request) => {
  const data = request.data;
  const context = request;
  const uid = requireAuth(context);

  const title = String(data.title || "").trim();
  const body = String(data.body || "").trim();

  if (!title || !body) {
    throw new HttpsError(
      "invalid-argument",
      "Title and body are required."
    );
  }

  await db.collection("notifications").add({
    uid,
    title,
    body,
    read: false,
    createdAt: FieldValue.serverTimestamp()
  });

  return {
    success: true,
    message: "Notification saved successfully."
  };
});

exports.getNotifications = onCall(async (request) => {
  const data = request.data;
  const context = request;
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

exports.markNotificationRead = onCall(async (request) => {
  const data = request.data;
  const context = request;
  const uid = requireAuth(context);

const id = String(data.id || "");

  if (!id) {
    throw new HttpsError(
      "invalid-argument",
      "Notification ID is required."
    );
  }
const docRef = db.collection("notifications").doc(id);
const doc = await docRef.get();

if (!doc.exists) {
  throw new HttpsError(
    "not-found",
    "Notification not found."
  );
}

if (doc.data().uid !== uid) {
  throw new HttpsError(
    "permission-denied",
    "Unauthorized."
  );
}
  await docRef.update({
    read: true,
    readAt: FieldValue.serverTimestamp()
  });

  return {
    success: true
  };
});

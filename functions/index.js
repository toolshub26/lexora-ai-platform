"use strict";

const crypto = require("crypto");
const Razorpay = require("razorpay");

const admin = require("firebase-admin");
const functions = require("firebase-functions");

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

const razorpay = new Razorpay({
    key_id: functions.config().razorpay.key_id,
    key_secret: functions.config().razorpay.key_secret
});

exports.health = functions.https.onRequest((req, res) => {
    res.status(200).json({
        success: true,
        service: "Lexora Cloud Functions",
        version: "1.0.0",
        timestamp: Date.now()
    });
    
});
function getUserId(context) {
  if (!context.auth) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Login required."
    );
  }

  return context.auth.uid;
}

function generateReceipt(uid) {
  return `LEXORA-${uid}-${Date.now()}`;
}

exports.createOrder = functions.https.onCall(async (data, context) => {
  const uid = getUserId(context);

  const { plan } = data;

  if (!plan) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Plan is required."
    );
  }

  const plans = {
    FREE: 0,
    PRO_MONTH: 29900,
    PRO_YEAR: 299900,
    PREMIUM_MONTH: 49900,
    PREMIUM_YEAR: 499900
  };

  if (!(plan in plans)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid plan."
    );
  }

  const amount = plans[plan];

  const order = await razorpay.orders.create({
    amount,
    currency: "INR",
    receipt: generateReceipt(uid),
    notes: {
      uid,
      plan
    }
  });

  await db.collection("orders").doc(order.id).set({
    uid,
    plan,
    amount,
    currency: "INR",
    status: "created",
    razorpayOrderId: order.id,
    createdAt: admin.firestore.FieldValue.serverTimestamp()
  });

  return {
    success: true,
    orderId: order.id,
    amount,
    currency: "INR",
    key: functions.config().razorpay.key_id
  };
});

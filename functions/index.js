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

exports.verifyPayment = functions.https.onCall(async (data, context) => {
  const uid = getUserId(context);

  const {
    razorpay_order_id,
    razorpay_payment_id,
    razorpay_signature
  } = data;

  if (
    !razorpay_order_id ||
    !razorpay_payment_id ||
    !razorpay_signature
  ) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Missing payment details."
    );
  }

  const body =
    razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac(
      "sha256",
      functions.config().razorpay.key_secret
    )
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Invalid payment signature."
    );
  }

  const orderRef = db
    .collection("orders")
    .doc(razorpay_order_id);

  const orderDoc = await orderRef.get();

  if (!orderDoc.exists) {
    throw new functions.https.HttpsError(
      "not-found",
      "Order not found."
    );
  }

  const order = orderDoc.data();

  if (order.uid !== uid) {
    throw new functions.https.HttpsError(
      "permission-denied",
      "Unauthorized."
    );
  }

  if (order.status === "paid") {
    return {
      success: true,
      alreadyVerified: true
    };
  }

await orderRef.update({
  status: "paid",
  razorpayPaymentId: razorpay_payment_id,
  verifiedAt: admin.firestore.FieldValue.serverTimestamp()
});

await db.collection("subscriptions").doc(uid).set({
  plan: order.plan,
  active: order.plan !== "FREE",
  updatedAt: admin.firestore.FieldValue.serverTimestamp()
}, { merge: true });

return {
  success: true,
  plan: order.plan
};

});                                               

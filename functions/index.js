"use strict";

const crypto = require("crypto");
const Razorpay = require("razorpay");

const admin = require("firebase-admin");
const functions = require("firebase-functions");
const { onRequest, onCall, HttpsError } = require("firebase-functions/v2/https");
const { FieldValue } = require("firebase-admin/firestore");

if (!admin.apps.length) {
    admin.initializeApp();
}

const db = admin.firestore();

function getRazorpayClient() {
  const razorpayConfig = functions.config().razorpay || {};
  const razorpayKeyId = String(razorpayConfig.key_id || "").trim();
  const razorpayKeySecret = String(razorpayConfig.key_secret || "").trim();

  if (!razorpayKeyId || !razorpayKeySecret) {
    throw new HttpsError(
      "failed-precondition",
      "Razorpay configuration is missing."
    );
  }

  return {
    client: new Razorpay({
      key_id: razorpayKeyId,
      key_secret: razorpayKeySecret
    }),
    keySecret: razorpayKeySecret
  };
}
const {
  askAI,
  getAIUsage,
  clearAIHistory
} = require("./ai");
const {
  sendNotification,
  getNotifications,
  markNotificationRead
} = require("./notifications");
const {
  getPaymentHistory,
  getSubscription,
  cancelSubscription
} = require("./payment");
exports.health = onRequest((req, res) => {
    res.status(200).json({
        success: true,
        service: "Lexora Cloud Functions",
        version: "1.0.0",
        timestamp: Date.now()
    });
    
});
function getUserId(context) {
  if (!context.auth) {
    throw new HttpsError(
      "unauthenticated",
      "Login required."
    );
  }

  return context.auth.uid;
}

function generateReceipt(uid) {
  return `LEXORA-${uid}-${Date.now()}`;
}

exports.createOrder = onCall(async (request) => {
  const data = request.data;
  const context = request;
  const uid = getUserId(context);

  const { plan } = data;

  if (!plan) {
    throw new HttpsError(
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
    throw new HttpsError(
      "invalid-argument",
      "Invalid plan."
    );
  }

  const amount = plans[plan];
  const { client: razorpay } = getRazorpayClient();

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
    createdAt: FieldValue.serverTimestamp()
  });

  return {
    success: true,
    orderId: order.id,
    amount,
    currency: "INR"
  };
});

exports.verifyPayment = onCall(async (request) => {
  const data = request.data;
  const context = request;
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
    throw new HttpsError(
      "invalid-argument",
      "Missing payment details."
    );
  }

  const body =
    razorpay_order_id + "|" + razorpay_payment_id;

  const { keySecret: razorpayKeySecret } = getRazorpayClient();

  const expectedSignature = crypto
    .createHmac(
      "sha256",
      razorpayKeySecret
    )
    .update(body)
    .digest("hex");

  if (expectedSignature !== razorpay_signature) {
    throw new HttpsError(
      "permission-denied",
      "Invalid payment signature."
    );
  }

  const orderRef = db.collection("orders").doc(razorpay_order_id);
  const paymentRef = db.collection("payments").doc(razorpay_payment_id);

  const orderDoc = await orderRef.get();

  if (!orderDoc.exists) {
    throw new HttpsError(
      "not-found",
      "Order not found."
    );
  }

  const order = orderDoc.data();

  if (order.uid !== uid) {
    throw new HttpsError(
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

  return await db.runTransaction(async (transaction) => {
    const orderDoc = await transaction.get(orderRef);

    if (!orderDoc.exists) {
      throw new HttpsError(
        "not-found",
        "Order not found."
      );
    }

    const orderData = orderDoc.data();

    if (orderData.uid !== uid) {
      throw new HttpsError(
        "permission-denied",
        "Unauthorized."
      );
    }

    if (orderData.status === "paid") {
      return {
        success: true,
        alreadyVerified: true
      };
    }

    const paymentDoc = await transaction.get(paymentRef);

    if (paymentDoc.exists) {
      const paymentData = paymentDoc.data();

      if (
        paymentData.uid !== uid ||
        paymentData.orderId !== razorpay_order_id
      ) {
        throw new HttpsError(
          "permission-denied",
          "Payment is already associated with another order or user."
        );
      }

      return {
        success: true,
        alreadyVerified: true,
        plan: orderData.plan
      };
    }

    transaction.update(orderRef, {
      status: "paid",
      razorpayPaymentId: razorpay_payment_id,
      verifiedAt: FieldValue.serverTimestamp()
    });

    transaction.create(paymentRef, {
      uid,
      orderId: razorpay_order_id,
      paymentId: razorpay_payment_id,
      plan: orderData.plan,
      amount: orderData.amount,
      currency: orderData.currency,
      createdAt: FieldValue.serverTimestamp()
    });

    transaction.set(
      db.collection("subscriptions").doc(uid),
      {
        plan: orderData.plan,
        active: orderData.plan !== "FREE",
        updatedAt: FieldValue.serverTimestamp()
      },
      { merge: true }
    );

    return {
      success: true,
      plan: orderData.plan
    };
  });
});                                               

exports.checkPremium = onCall(async (request) => {
  const data = request.data;
  const context = request;
  const uid = getUserId(context);

  const subRef = db.collection("subscriptions").doc(uid);
  const subDoc = await subRef.get();

  if (!subDoc.exists) {
    return {
      plan: "FREE",
      active: false
    };
  }

  const sub = subDoc.data();
const expiresAt = sub.expiresAt || null;

if (
  expiresAt &&
  expiresAt.toDate &&
  expiresAt.toDate() < new Date()
) {
  await subRef.set(
    {
      active: false
    },
    { merge: true }
  );

  return {
    plan: "FREE",
    active: false,
    expired: true
  };
}
  return {
  success: true,
  plan: sub.plan || "FREE",
  active: !!sub.active,
  expiresAt: sub.expiresAt || null,
  updatedAt: sub.updatedAt || null
};
});

exports.askAI = askAI;
exports.getAIUsage = getAIUsage;
exports.clearAIHistory = clearAIHistory;

exports.sendNotification = sendNotification;
exports.getNotifications = getNotifications;
exports.markNotificationRead = markNotificationRead;
exports.getPaymentHistory = getPaymentHistory;
exports.getSubscription = getSubscription;
exports.cancelSubscription = cancelSubscription;

const {
  createOrganization
} = require("./organization");

exports.createOrganization = createOrganization;

const { legalResearch } = require("./legal-research");
exports.legalResearch = legalResearch;

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

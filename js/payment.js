"use strict";

const Payment = {
  functions: null,

  init() {
    if (
      typeof firebase !== "undefined" &&
      firebase.app &&
      firebase.functions
    ) {
      this.functions = firebase.app().functions();
      console.log("Payment module ready");
    } else {
      console.warn("Firebase Functions not loaded.");
    }
  }
};

document.addEventListener("DOMContentLoaded", () => {
  Payment.init();
});

Payment.createOrder = async function(plan) {
  if (!this.functions) {
    throw new Error("Firebase Functions not initialized.");
  }

  const createOrder = this.functions.httpsCallable("createOrder");
  const result = await createOrder({ plan });

  return result.data;
};

Payment.verifyPayment = async function(paymentData) {
  if (!this.functions) {
    throw new Error("Firebase Functions not initialized.");
  }

  const verifyPayment =
    this.functions.httpsCallable("verifyPayment");

  const result = await verifyPayment(paymentData);

  return result.data;
};

Payment.startPayment = async function(plan) {

  const order = await this.createOrder(plan);

  return new Promise((resolve, reject) => {

    const options = {
      key: order.key,
      amount: order.amount,
      currency: order.currency,
      name: "Lexora AI",
      description: plan,
      order_id: order.orderId,

      handler: async function(response) {
        try {
          await Payment.verifyPayment(response);
          resolve(response);
        } catch (err) {
          reject(err);
        }
      },

      prefill: {
        name: firebase.auth().currentUser?.displayName || "",

        name: window.auth.currentUser?.displayName || "",
        email: window.auth.currentUser?.email || ""
      theme: {
        color: "#2563eb"
      }
    };

    const rzp = new Razorpay(options);

    rzp.on("payment.failed", function(response) {
      reject(response.error);
    });

    rzp.open();

  });

};

window.Payment = Payment;

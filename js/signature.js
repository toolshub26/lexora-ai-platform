"use strict";

/*
=================================
Lexora AI Platform v20
Signature Module
=================================
*/

const Signature = {

  pad: null,

  init(canvasId = "signaturePad") {
    const canvas = document.getElementById(canvasId);
    if (!canvas) return;

    this.resize(canvas);

    this.pad = new SignaturePad(canvas, {
      minWidth: 1,
      maxWidth: 3,
      penColor: "#000"
    });

    window.addEventListener("resize", () => this.resize(canvas));
  },

  resize(canvas) {
    const ratio = Math.max(window.devicePixelRatio || 1, 1);

    canvas.width = canvas.offsetWidth * ratio;
    canvas.height = canvas.offsetHeight * ratio;

    const ctx = canvas.getContext("2d");
    ctx.scale(ratio, ratio);
  },

  clear() {
    if (this.pad) this.pad.clear();
  },

  isEmpty() {
    return this.pad ? this.pad.isEmpty() : true;
  },

  toDataURL() {
    return this.pad ? this.pad.toDataURL("image/png") : "";
  }

};

document.addEventListener("DOMContentLoaded", () => {
  Signature.init();
});

window.Signature = Signature;

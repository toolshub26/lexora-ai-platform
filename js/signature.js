"use strict";

/*
=================================
Lexora AI Platform v20
Professional Signature Module
=================================
*/

const Signature = {

    pad: null,
    canvas: null,
    resizeBound: false,

    init(canvasId = "signaturePad") {

        this.canvas = document.getElementById(canvasId);

        if (!this.canvas) {
            console.warn("Signature canvas not found.");
            return;
        }

        if (typeof SignaturePad === "undefined") {
            console.error("SignaturePad library not loaded.");
            return;
        }

        this.resize();

        if (this.pad) {
            this.pad.off();
            this.pad = null;
        }

        this.pad = new SignaturePad(this.canvas, {
            minWidth: 0.7,
            maxWidth: 2.5,
            penColor: "#000000",
            backgroundColor: "rgba(255,255,255,0)",
            velocityFilterWeight: 0.6
        });

        if (!this.resizeBound) {
            window.addEventListener("resize", () => this.resize());
            this.resizeBound = true;
        }

        console.log("Signature module initialized.");
    },

        resize() {

        if (!this.canvas) return;

        const data = this.pad ? this.pad.toData() : null;

        const ratio = Math.max(window.devicePixelRatio || 1, 1);

        this.canvas.width = this.canvas.offsetWidth * ratio;
        this.canvas.height = this.canvas.offsetHeight * ratio;

        const ctx = this.canvas.getContext("2d");
        ctx.scale(ratio, ratio);

        if (this.pad) {
            this.pad.clear();

            if (data && data.length) {
                this.pad.fromData(data);
            }
        }
    },

    clear() {

        if (this.pad) {
            this.pad.clear();
        }

    },

    undo() {

        if (!this.pad) return;

        const data = this.pad.toData();

        if (data.length > 0) {
            data.pop();
            this.pad.fromData(data);
        }

    },

    isEmpty() {

        return this.pad ? this.pad.isEmpty() : true;

    },

    save(format = "image/png") {

        if (!this.pad || this.isEmpty()) {
            return null;
        }

        return this.pad.toDataURL(format);

    },

    fromData(data) {

        if (this.pad && Array.isArray(data)) {
            this.pad.fromData(data);
        }

    },

    toData() {

        return this.pad ? this.pad.toData() : [];

    },

        exportBlob() {

        if (!this.pad || this.isEmpty()) {
            return null;
        }

        return new Promise((resolve) => {
            this.canvas.toBlob((blob) => {
                resolve(blob);
            }, "image/png");
        });

    }

};

document.addEventListener("DOMContentLoaded", () => {

    Signature.init();

});

window.Signature = Signature;

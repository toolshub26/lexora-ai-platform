
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
            minWidth: 0.8,
            maxWidth: 2.8,
            penColor: "#000000",
            backgroundColor: "rgba(255,255,255,0)"
        });

        window.addEventListener("resize", () => this.resize());

        console.log("Signature Ready");
    },

    resize() {

        if (!this.canvas) return;

        const data = this.pad ? this.pad.toData() : null;

        const ratio = Math.max(window.devicePixelRatio || 1, 1);

        this.canvas.width = this.canvas.offsetWidth * ratio;
        this.canvas.height = this.canvas.offsetHeight * ratio;

        this.canvas.getContext("2d").scale(ratio, ratio);

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

        if (data.length) {

            data.pop();

            this.pad.fromData(data);

        }

    },

    isEmpty() {

        return this.pad ? this.pad.isEmpty() : true;

    },

    save() {

        if (this.isEmpty()) return null;

        return this.pad.toDataURL("image/png");

    }

};

document.addEventListener("DOMContentLoaded", () => {

    Signature.init();

});

window.Signature = Signature;

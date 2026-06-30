"use strict";

/*
====================================================
Lexora AI Platform v21
Enterprise QR Engine
Part 1/4
====================================================
Dependencies
----------------------------------
QRCode.js
html5-qrcode (scanner)
Crypto.subtle
Compatible:
Android
iPhone
PWA
====================================================
*/

const QR = {

    version: "21.0.0",

    initialized: false,

    scanner: null,

    lastResult: "",

    lastHash: "",

    qrInstance: null,

    options: {

        width: 260,

        height: 260,

        colorDark: "#000000",

        colorLight: "#ffffff",

        correctLevel:
            QRCode.CorrectLevel.H

    },

    init() {

        if (this.initialized)
            return;

        this.initialized = true;

        console.log("Lexora QR Engine Ready");

        this.bindUI();

    },

    bindUI() {

        const generateBtn =
            document.getElementById("qrBtn");

        if (generateBtn) {

            generateBtn.addEventListener(

                "click",

                () => this.generate()

            );

        }

        const downloadBtn =
            document.getElementById("downloadQR");

        if (downloadBtn) {

            downloadBtn.addEventListener(

                "click",

                () => this.download()

            );

        }

        const printBtn =
            document.getElementById("printQR");

        if (printBtn) {

            printBtn.addEventListener(

                "click",

                () => this.print()

            );

        }

        const shareBtn =
            document.getElementById("shareQR");

        if (shareBtn) {

            shareBtn.addEventListener(

                "click",

                () => this.share()

            );

        }

    },

    clear() {

        const box =
            document.getElementById("qrPreview");

        if (!box)
            return;

        box.innerHTML = "";

        this.qrInstance = null;

    },

    async sha256(text) {

        const buffer =
            await crypto.subtle.digest(

                "SHA-256",

                new TextEncoder().encode(text)

            );

        return Array
            .from(new Uint8Array(buffer))
            .map(b =>
                b.toString(16)
                 .padStart(2,"0")
            )
            .join("");

    },

    buildPayload() {

        const payload = {

            id:
                document.getElementById("affidavitId")?.value || "",

            user:
                window.Auth?.currentUser?.uid || "",

            country:
                document.getElementById("country")?.value || "",

            language:
                document.getElementById("language")?.value || "",

            purpose:
                document.getElementById("purpose")?.value || "",

            created:
                new Date().toISOString(),

            version:
                this.version

        };

        return payload;

    },

    async generate() {

        try {

            this.clear();

            const payload =
                this.buildPayload();

            payload.hash =
                await this.sha256(
                    JSON.stringify(payload)
                );

            this.lastHash =
                payload.hash;

            const box =
                document.getElementById("qrPreview");

            if (!box)
                return;

            this.qrInstance =
                new QRCode(

                    box,

                    {

                        text:
                            JSON.stringify(payload),

                        width:
                            this.options.width,

                        height:
                            this.options.height,

                        colorDark:
                            this.options.colorDark,

                        colorLight:
                            this.options.colorLight,

                        correctLevel:
                            this.options.correctLevel

                    }

                );

            this.lastResult =
                JSON.stringify(payload);

            console.log(
                "QR Generated"
            );

        }

        catch(error){

            console.error(
                "QR Generate Error",
                error
            );

        }

    },

    getImage() {

        const img =
            document.querySelector(
                "#qrPreview img"
            );

        if(img)
            return img.src;

        const canvas =
            document.querySelector(
                "#qrPreview canvas"
            );

        if(canvas)
            return canvas.toDataURL();

        return null;

    }
};

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        QR.init();

    }

);

window.QR = QR;


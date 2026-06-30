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

/*==========================================================
  PART 2/4
  Enterprise QR Scanner Engine
==========================================================*/

Object.assign(QR, {

    scanning: false,

    currentCamera: "environment",

    async startScanner(elementId = "qrScanner") {

        try {

            if (typeof Html5Qrcode === "undefined") {

                console.error("html5-qrcode library missing.");

                return false;

            }

            if (this.scanning)
                return true;

            this.scanner = new Html5Qrcode(elementId);

            await this.scanner.start(

                {
                    facingMode: this.currentCamera
                },

                {
                    fps: 10,
                    qrbox: {
                        width: 250,
                        height: 250
                    },
                    aspectRatio: 1
                },

                async (decodedText) => {

                    await this.onScan(decodedText);

                },

                (error) => {

                    // Ignore frame errors

                }

            );

            this.scanning = true;

            console.log("QR Scanner Started");

            return true;

        } catch (error) {

            console.error(error);

            return false;

        }

    },

    async stopScanner() {

        try {

            if (!this.scanner)
                return;

            await this.scanner.stop();

            await this.scanner.clear();

            this.scanning = false;

            console.log("QR Scanner Stopped");

        } catch (error) {

            console.error(error);

        }

    },

    async switchCamera() {

        this.currentCamera =

            this.currentCamera === "environment"

                ? "user"

                : "environment";

        if (this.scanning) {

            await this.stopScanner();

            await this.startScanner();

        }

    },

    async onScan(result) {

        if (!result)
            return;

        if (result === this.lastResult)
            return;

        this.lastResult = result;

        try {

            const payload = JSON.parse(result);

            const output =

                document.getElementById(

                    "scanResult"

                );

            if (output) {

                output.textContent =

                    JSON.stringify(

                        payload,

                        null,

                        2

                    );

            }

            if (typeof this.verify === "function") {

                await this.verify(payload);

            }

            console.log("QR Scan Success");

            await this.stopScanner();

        } catch (error) {

            console.error(

                "Invalid QR",

                error

            );

        }

    },

    async scanImage(file) {

        try {

            if (

                typeof Html5Qrcode ===

                "undefined"

            ) {

                return false;

            }

            const scanner =

                new Html5Qrcode(

                    "qrScanner"

                );

            const text =

                await scanner.scanFile(

                    file,

                    true

                );

            await this.onScan(text);

            return true;

        } catch (error) {

            console.error(error);

            return false;

        }

    }

});

/*==========================================================
  Scanner Buttons
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    () => {

        const startBtn =

            document.getElementById(

                "scanBtn"

            );

        if (startBtn) {

            startBtn.addEventListener(

                "click",

                () => QR.startScanner()

            );

        }

        const stopBtn =

            document.getElementById(

                "stopScanBtn"

            );

        if (stopBtn) {

            stopBtn.addEventListener(

                "click",

                () => QR.stopScanner()

            );

        }

        const switchBtn =

            document.getElementById(

                "switchCameraBtn"

            );

        if (switchBtn) {

            switchBtn.addEventListener(

                "click",

                () => QR.switchCamera()

            );

        }

        const imageInput =

            document.getElementById(

                "scanImageInput"

            );

        if (imageInput) {

            imageInput.addEventListener(

                "change",

                (e) => {

                    const file =

                        e.target.files[0];

                    if (file)

                        QR.scanImage(file);

                }

            );

        }

    }

);

/*==========================================================
  PART 3/4
  Enterprise Verification Engine
==========================================================*/

Object.assign(QR,{

    verified:false,

    verificationData:null,

    async verify(payload){

        try{

            if(!payload)
                return false;

            const copy={...payload};

            const hash=copy.hash||"";

            delete copy.hash;

            const calculated=

                await this.sha256(

                    JSON.stringify(copy)

                );

            if(hash!==calculated){

                this.verified=false;

                this.showStatus(

                    "Invalid QR Hash",

                    "error"

                );

                return false;

            }

            this.verified=true;

            this.verificationData=payload;

            this.showStatus(

                "QR Hash Verified",

                "success"

            );

            await this.verifyFirebase(payload);

            return true;

        }

        catch(error){

            console.error(error);

            this.showStatus(

                "Verification Failed",

                "error"

            );

            return false;

        }

    },

    async verifyFirebase(payload){

        try{

            if(

                !window.db ||

                !window.doc ||

                !window.getDoc

            ){

                this.showStatus(

                    "Offline Verification",

                    "warning"

                );

                return false;

            }

            if(!payload.id){

                return false;

            }

            const ref=

                window.doc(

                    window.db,

                    "affidavits",

                    payload.id

                );

            const snap=

                await window.getDoc(ref);

            if(!snap.exists()){

                this.showStatus(

                    "Document Not Found",

                    "error"

                );

                return false;

            }

            const data=snap.data();

            this.compare(data,payload);

            return true;

        }

        catch(error){

            console.error(error);

            this.showStatus(

                "Firebase Error",

                "error"

            );

            return false;

        }

    },

    compare(server,local){

        if(

            server.affidavitId===local.id &&

            server.country===local.country

        ){

            this.showStatus(

                "Authentic Document",

                "success"

            );

        }

        else{

            this.showStatus(

                "Document Mismatch",

                "error"

            );

        }

    },

    showStatus(message,type="info"){

        const box=

            document.getElementById(

                "qrStatus"

            );

        if(box){

            box.className=

                "qr-status "+type;

            box.textContent=message;

        }

        console.log(message);

    },

    async copyResult(){

        if(!this.lastResult)
            return;

        await navigator.clipboard.writeText(

            this.lastResult

        );

        this.showStatus(

            "Copied",

            "success"

        );

    },

    exportJSON(){

        if(!this.lastResult)
            return;

        const blob=new Blob(

            [this.lastResult],

            {

                type:"application/json"

            }

        );

        const url=

            URL.createObjectURL(blob);

        const a=

            document.createElement("a");

        a.href=url;

        a.download="qr-data.json";

        a.click();

        URL.revokeObjectURL(url);

    }

});

/*==========================================================
 Buttons
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    ()=>{

        const copyBtn=

            document.getElementById(

                "copyQRBtn"

            );

        if(copyBtn){

            copyBtn.addEventListener(

                "click",

                ()=>QR.copyResult()

            );

        }

        const exportBtn=

            document.getElementById(

                "exportQRBtn"

            );

        if(exportBtn){

            exportBtn.addEventListener(

                "click",

                ()=>QR.exportJSON()

            );

        }

    }

);


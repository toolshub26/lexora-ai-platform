"use strict";

/*
=========================================
Lexora AI Platform v21
Enterprise PDF Engine
=========================================
Requires:
- html2pdf.js
- html2canvas
- jsPDF
=========================================
*/

const PDF = {

    version: "21.0.0",

    initialized: false,

    options: {

        margin: [10,10,10,10],

        filename: "Lexora-Document.pdf",

        image: {
            type: "jpeg",
            quality: 1
        },

        html2canvas: {
            scale: 3,
            useCORS: true,
            allowTaint: false,
            logging: false,
            backgroundColor: "#ffffff",
            scrollY: 0
        },

        jsPDF: {
            unit: "mm",
            format: "a4",
            orientation: "portrait",
            compress: true
        },

        pagebreak: {
            mode: [
                "css",
                "legacy",
                "avoid-all"
            ]
        }

    },

    init() {

        if (this.initialized) return;

        this.initialized = true;

        if (typeof html2pdf === "undefined") {

            console.error("html2pdf library missing.");

            return;

        }

        console.log("Lexora PDF Engine Ready");

    },

    setFileName(name){

        if(!name) return;

        this.options.filename =
            String(name).trim()+".pdf";

    },

    setOrientation(type="portrait"){

        this.options.jsPDF.orientation=type;

    },

    setPaper(type="a4"){

        this.options.jsPDF.format=type;

    },

      async generate(elementId = "preview") {

        const element = document.getElementById(elementId);

        if (!element) {
            console.error("Preview element not found.");
            return false;
        }

        try {

            if (window.Lexora?.showLoader) {
                Lexora.showLoader();
            }

            await html2pdf()
                .set(this.options)
                .from(element)
                .save();

            return true;

        } catch (error) {

            console.error("PDF Generation Error:", error);
            return false;

        } finally {

            if (window.Lexora?.hideLoader) {
                Lexora.hideLoader();
            }

        }

    },

    async outputBlob(elementId = "preview") {

        const element = document.getElementById(elementId);

        if (!element) return null;

        try {

            return await html2pdf()
                .set(this.options)
                .from(element)
                .outputPdf("blob");

        } catch (error) {

            console.error(error);
            return null;

        }

    },

    async print(elementId = "preview") {

        const blob = await this.outputBlob(elementId);

        if (!blob) return;

        const url = URL.createObjectURL(blob);

        const frame = document.createElement("iframe");

        frame.style.display = "none";
        frame.src = url;

        document.body.appendChild(frame);

        frame.onload = () => {

            frame.contentWindow.focus();
            frame.contentWindow.print();

            setTimeout(() => {

                URL.revokeObjectURL(url);
                frame.remove();

            }, 1000);

        };

    },

    async share(elementId = "preview") {


        const blob = await this.outputBlob(elementId);

        if (!blob) return false;

        const file = new File(
            [blob],
            this.options.filename,
            {
                type: "application/pdf"
            }
        );
if (
    !navigator.share ||
    !navigator.canShare ||
    !navigator.canShare({ files: [file] })
) {
    return false;
}
        await navigator.share({

            title: this.options.filename,
            files: [file]

        });

        return true;

    },

      download(elementId = "preview", fileName = null) {

        if (fileName) {
            this.setFileName(fileName);
        }

        return this.generate(elementId);

    },

    preview(elementId = "preview") {

        const element = document.getElementById(elementId);

        if (!element) {
            console.error("Preview element not found.");
            return;
        }

        element.scrollIntoView({
            behavior: "smooth",
            block: "start"
        });

    }

};

document.addEventListener("DOMContentLoaded", () => {

    PDF.init();

    const pdfBtn = document.getElementById("pdfBtn");

    if (pdfBtn) {

        pdfBtn.addEventListener("click", () => {

            PDF.download();

        });

    }

    const printBtn = document.getElementById("printBtn");

    if (printBtn) {

        printBtn.addEventListener("click", () => {

            PDF.print();

        });

    }

});

window.PDF = PDF;

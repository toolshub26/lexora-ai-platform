"use strict";

/*
====================================
Lexora AI Platform v20
Language Module
====================================
*/

const Language = {

    list: [],

    async init() {
        await this.load();
    },

    async load() {
        try {

            const response = await fetch("data/languages.json");

            if (!response.ok) {
                throw new Error("languages.json not found");
            }

            this.list = await response.json();

            console.log(
                "Languages Loaded:",
                this.list.length
            );

        } catch (err) {

            console.error("Languages Load Error:", err);

            this.list = [];

        }
    },

    getAll() {
        return this.list;
    },

    getByCode(code) {
        return this.list.find(l => l.code === code) || null;
    },

    exists(code) {
        return this.list.some(l => l.code === code);
    },

    getDirection(code) {
        const lang = this.getByCode(code);
        return lang ? (lang.direction || "ltr") : "ltr";
    },

    getNativeName(code) {
        const lang = this.getByCode(code);
        return lang ? (lang.nativeName || lang.name) : "";
    }

};

document.addEventListener("DOMContentLoaded", () => {
    Language.init();
});

window.Language = Language;

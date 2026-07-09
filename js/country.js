"use strict";

/*
========================================
Lexora AI Platform v20
Country Module
========================================
*/

const Country = {

    list: [],

    async init() {
        await this.load();
    },

    async load() {
        try {

            const response = await fetch("data/countries.json");

            if (!response.ok) {
                throw new Error("countries.json not found");
            }

            this.list = await response.json();

            console.log(
                "Countries Loaded:",
                this.list.length
            );

        } catch (err) {

            console.error("Countries Load Error:", err);

            this.list = [];

        }
    },

    getAll() {
        return this.list;
    },

    getByCode(code) {
        return this.list.find(c => c.code === code) || null;
    },

    exists(code) {
        return this.list.some(c => c.code === code);
    }

};

document.addEventListener("DOMContentLoaded", () => {
    Country.init();
});

window.Country = Country;

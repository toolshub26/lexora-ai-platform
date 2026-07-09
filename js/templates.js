"use strict";

/*
=========================================
Lexora AI Platform v20
Templates Module
=========================================
*/

const Templates = {

    list: [],

    async init() {
        await this.load();
    },

    async load() {
        try {

            const response = await fetch("data/templates.json");

            if (!response.ok) {
                throw new Error("templates.json not found");
            }

            this.list = await response.json();

            console.log(
                "Templates Loaded:",
                this.list.length
            );

        } catch (err) {

            console.error("Templates Load Error:", err);

            this.list = [];

        }
    },

    getAll() {
        return this.list;
    },

    getById(id) {
        return this.list.find(t => t.id === id) || null;
    },

    exists(id) {
        return this.list.some(t => t.id === id);
    }

};

document.addEventListener("DOMContentLoaded", () => {
    Templates.init();
});

window.Templates = Templates;

"use strict";

/*
=================================
Lexora AI Platform v20
Utility Module
=================================
*/

const Utils = {

  uuid() {
    return crypto.randomUUID
      ? crypto.randomUUID()
      : "id-" + Date.now() + "-" + Math.random().toString(36).slice(2);
  },

  formatDate(date = new Date()) {
    return new Date(date).toLocaleDateString();
  },

  formatDateTime(date = new Date()) {
    return new Date(date).toLocaleString();
  },

  capitalize(text = "") {
    return String(text)
      .replace(/\b\w/g, c => c.toUpperCase());
  },

  slug(text = "") {
    return String(text)
      .toLowerCase()
      .trim()
      .replace(/\s+/g, "-")
      .replace(/[^\w-]/g, "");
  },

  escapeHTML(text = "") {
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
  },

  copy(text) {
    return navigator.clipboard.writeText(text);
  },

  download(filename, content, type = "text/plain") {
    const blob = new Blob([content], { type });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = filename;
    a.click();

    URL.revokeObjectURL(url);
  }

};

window.Utils = Utils;

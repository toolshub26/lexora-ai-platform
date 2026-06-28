"use strict";

/*
========================================
Lexora AI Platform v20
Validation Module
========================================
*/

const Validation = {

    email(email) {
        return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
    },

    password(password) {
        return typeof password === "string" && password.length >= 8;
    },

    required(value) {
        return value !== null &&
               value !== undefined &&
               String(value).trim() !== "";
    },

    minLength(value, min) {
        return String(value).trim().length >= min;
    },

    maxLength(value, max) {
        return String(value).trim().length <= max;
    },

    number(value) {
        return !isNaN(value);
    },

    mobile(number) {
        return /^[0-9+\-\s]{7,20}$/.test(number);
    },

    validateForm(data, rules) {

        const errors = {};

        Object.keys(rules).forEach(field => {

            const value = data[field];
            const rule = rules[field];

            if (rule.required && !this.required(value)) {
                errors[field] = "Required";
                return;
            }

            if (rule.email && !this.email(value)) {
                errors[field] = "Invalid Email";
                return;
            }

            if (rule.password && !this.password(value)) {
                errors[field] = "Password must be at least 8 characters";
                return;
            }

            if (rule.mobile && !this.mobile(value)) {
                errors[field] = "Invalid Mobile Number";
                return;
            }

            if (rule.minLength && !this.minLength(value, rule.minLength)) {
                errors[field] = `Minimum ${rule.minLength} characters`;
                return;
            }

            if (rule.maxLength && !this.maxLength(value, rule.maxLength)) {
                errors[field] = `Maximum ${rule.maxLength} characters`;
                return;
            }

        });

        return {
            valid: Object.keys(errors).length === 0,
            errors
        };
    }

};

window.Validation = Validation;

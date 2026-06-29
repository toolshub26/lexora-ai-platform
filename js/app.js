"use strict";

/*==========================================================
  Lexora AI Platform v21 Enterprise
  Module 1 : Bootstrap Engine
==========================================================*/

export const APP_VERSION = "21.0.0";
export const APP_NAME = "Lexora AI Platform";
export const BUILD = "Enterprise";

/*==========================================================
  Global Configuration
==========================================================*/

export const CONFIG = Object.freeze({

    DEBUG: true,

    ENV: "production",

    CACHE_VERSION: "21",

    STORAGE_PREFIX: "LEXORA_",

    API_TIMEOUT: 30000,

    AUTO_SAVE_INTERVAL: 30000,

    OFFLINE_MODE: true,

    ENABLE_AI: true,

    ENABLE_QR: true,

    ENABLE_SCANNER: true,

    ENABLE_PDF: true,

    ENABLE_ANALYTICS: true,

    ENABLE_NOTIFICATIONS: true,

    ENABLE_PAYMENT: true,

    ENABLE_SYNC: true

});

/*==========================================================
  Global State
==========================================================*/

export const STATE = {

    initialized: false,

    bootTime: Date.now(),

    currentUser: null,

    language: "en",

    country: "IN",

    theme: "dark",

    online: navigator.onLine,

    loading: false,

    version: APP_VERSION,

    build: BUILD

};

/*==========================================================
  Logger
==========================================================*/

export const Logger = {

    log(...args){

        if(CONFIG.DEBUG)
            console.log("[Lexora]",...args);

    },

    warn(...args){

        console.warn("[Lexora]",...args);

    },

    error(...args){

        console.error("[Lexora]",...args);

    }

};

/*==========================================================
  Performance
==========================================================*/

export const Performance = {

    timers:new Map(),

    start(name){

        this.timers.set(name,performance.now());

    },

    end(name){

        if(!this.timers.has(name)) return;

        const start=this.timers.get(name);

        const end=performance.now();

        Logger.log(

            `${name}: ${(end-start).toFixed(2)} ms`

        );

        this.timers.delete(name);

    }

};

/*==========================================================
  Event Bus
==========================================================*/

export const Events={

    events:new Map(),

    on(event,callback){

        if(!this.events.has(event))
            this.events.set(event,[]);

        this.events.get(event).push(callback);

    },

    emit(event,data){

        if(!this.events.has(event))
            return;

        this.events.get(event)
        .forEach(cb=>cb(data));

    },

    off(event){

        this.events.delete(event);

    }

};

/*==========================================================
  Error Handler
==========================================================*/

window.addEventListener("error",(event)=>{

    Logger.error(

        "Application Error",

        event.error

    );

});

window.addEventListener(

    "unhandledrejection",

    (event)=>{

        Logger.error(

            "Unhandled Promise",

            event.reason

        );

    }

);

/*==========================================================
  Bootstrap
==========================================================*/

export async function bootstrap(){

    if(STATE.initialized)
        return;

    Performance.start("BOOT");

    Logger.log(

        APP_NAME,

        APP_VERSION,

        BUILD

    );

    STATE.initialized=true;

    Performance.end("BOOT");

}

/*==========================================================
  Module 2 : Storage Engine
==========================================================*/

export const Storage = {

    prefix: CONFIG.STORAGE_PREFIX,

    key(name){

        return this.prefix + name;

    },

    save(name,value){

        try{

            localStorage.setItem(

                this.key(name),

                JSON.stringify(value)

            );

            return true;

        }catch(error){

            Logger.error(error);

            return false;

        }

    },

    load(name,defaultValue=null){

        try{

            const data=

                localStorage.getItem(

                    this.key(name)

                );

            return data
                ? JSON.parse(data)
                : defaultValue;

        }catch(error){

            Logger.error(error);

            return defaultValue;

        }

    },

    remove(name){

        localStorage.removeItem(

            this.key(name)

        );

    },

    clear(){

        Object.keys(localStorage)

        .filter(key=>

            key.startsWith(this.prefix)

        )

        .forEach(key=>

            localStorage.removeItem(key)

        );

    }

};

/*==========================================================
  Session Manager
==========================================================*/

export const Session={

    login(user){

        STATE.currentUser=user;

        Storage.save(

            "CURRENT_USER",

            user

        );

        Events.emit(

            "user:login",

            user

        );

    },

    logout(){

        STATE.currentUser=null;

        Storage.remove(

            "CURRENT_USER"

        );

        Events.emit(

            "user:logout"

        );

    },

    restore(){

        STATE.currentUser=

            Storage.load(

                "CURRENT_USER",

                null

            );

        return STATE.currentUser;

    },

    isLoggedIn(){

        return STATE.currentUser!==null;

    }

};

/*==========================================================
  Cache Engine
==========================================================*/

export const Cache={

    memory:new Map(),

    set(key,value){

        this.memory.set(

            key,

            value

        );

    },

    get(key){

        return this.memory.get(key);

    },

    has(key){

        return this.memory.has(key);

    },

    remove(key){

        this.memory.delete(key);

    },

    clear(){

        this.memory.clear();

    }

};

/*==========================================================
  Preferences
==========================================================*/

export const Preferences={

    saveTheme(theme){

        STATE.theme=theme;

        Storage.save(

            "THEME",

            theme

        );

    },

    loadTheme(){

        STATE.theme=

            Storage.load(

                "THEME",

                "dark"

            );

    },

    saveLanguage(lang){

        STATE.language=lang;

        Storage.save(

            "LANGUAGE",

            lang

        );

    },

    loadLanguage(){

        STATE.language=

            Storage.load(

                "LANGUAGE",

                "en"

            );

    },

    saveCountry(country){

        STATE.country=country;

        Storage.save(

            "COUNTRY",

            country

        );

    },

    loadCountry(){

        STATE.country=

            Storage.load(

                "COUNTRY",

                "IN"

            );

    }

};

/*==========================================================
  Module 3 : Theme Manager
==========================================================*/

export const Theme = {

    current: "dark",

    init() {

        this.current = Storage.load("THEME", "dark");

        this.apply(this.current);

    },

    apply(theme) {

        this.current = theme;

        document.documentElement.setAttribute(
            "data-theme",
            theme
        );

        Storage.save("THEME", theme);

        Events.emit("theme:changed", theme);

    },

    toggle() {

        this.apply(

            this.current === "dark"
                ? "light"
                : "dark"

        );

    }

};

/*==========================================================
  Language Manager
==========================================================*/

export const Language = {

    current: "en",

    init() {

        this.current = Storage.load(
            "LANGUAGE",
            "en"
        );

        Events.emit(
            "language:loaded",
            this.current
        );

    },

    set(language) {

        this.current = language;

        Storage.save(
            "LANGUAGE",
            language
        );

        Events.emit(
            "language:changed",
            language
        );

    },

    get() {

        return this.current;

    }

};

/*==========================================================
  Country Manager
==========================================================*/

export const Country = {

    current: "IN",

    init() {

        this.current = Storage.load(
            "COUNTRY",
            "IN"
        );

        Events.emit(
            "country:loaded",
            this.current
        );

    },

    set(country) {

        this.current = country;

        Storage.save(
            "COUNTRY",
            country
        );

        Events.emit(
            "country:changed",
            country
        );

    },

    get() {

        return this.current;

    }

};

/*==========================================================
  Purpose Manager
==========================================================*/

export const Purpose = {

    list: [],

    init(data = []) {

        this.list = Array.isArray(data)
            ? data
            : [];

        Events.emit(
            "purpose:loaded",
            this.list
        );

    },

    all() {

        return this.list;

    },

    find(id) {

        return this.list.find(
            item => item.id === id
        ) || null;

    }

};

/*==========================================================
  UI Bootstrap
==========================================================*/

export function initializeUI() {

    Theme.init();

    Language.init();

    Country.init();

    Purpose.init();

    Logger.log(
        "UI Managers Ready"
    );

}

/*==========================================================
  Module 4 : Authentication Manager
==========================================================*/

import {
    auth
} from "../firebase/firebase.js";

import {

    onAuthStateChanged,

    signOut

} from "https://www.gstatic.com/firebasejs/12.0.0/firebase-auth.js";

/*==========================================================
  User Manager
==========================================================*/

export const User = {

    profile: null,

    uid: null,

    email: null,

    verified: false,

    premium: false,

    role: "user",

    set(user) {

        if (!user) return;

        this.profile = user;

        this.uid = user.uid;

        this.email = user.email;

        this.verified =
            user.emailVerified;

        Session.login(user);

        Events.emit(
            "user:ready",
            user
        );

    },

    clear() {

        this.profile = null;

        this.uid = null;

        this.email = null;

        this.verified = false;

        this.premium = false;

        this.role = "user";

        Session.logout();

    }

};

/*==========================================================
  Authentication
==========================================================*/

export const Authentication = {

    initialized: false,

    init() {

        if (this.initialized)
            return;

        this.initialized = true;

        onAuthStateChanged(

            auth,

            (user) => {

                if (user) {

                    User.set(user);

                    Logger.log(

                        "Authenticated",

                        user.email

                    );

                } else {

                    User.clear();

                }

            }

        );

    },

    async logout() {

        try {

            await signOut(auth);

            User.clear();

            Logger.log(
                "Logout Success"
            );

        } catch (error) {

            Logger.error(error);

        }

    }

};

/*==========================================================
  Profile Helpers
==========================================================*/

export function isLoggedIn() {

    return User.profile !== null;

}

export function currentUser() {

    return User.profile;

}

export function currentUID() {

    return User.uid;

}

/*==========================================================
  Module 5 : Core Initializer
==========================================================*/

export const Core = {

    async initialize() {

        Logger.log("Initializing Core...");

        try {

            Performance.start("CORE");

            /* Restore Session */

            Session.restore();

            /* Preferences */

            Preferences.loadTheme();
            Preferences.loadLanguage();
            Preferences.loadCountry();

            /* Apply Theme */

            Theme.apply(STATE.theme);

            /* Firebase Auth */

            Authentication.init();

            /* Network */

            STATE.online = navigator.onLine;

            window.addEventListener(

                "online",

                () => {

                    STATE.online = true;

                    Events.emit("network:online");

                }

            );

            window.addEventListener(

                "offline",

                () => {

                    STATE.online = false;

                    Events.emit("network:offline");

                }

            );

            /* UI */

            initializeUI();

            /* Boot */

            await bootstrap();

            Performance.end("CORE");

            Logger.log(

                "Core Ready"

            );

            Events.emit(

                "core:ready"

            );

        } catch (error) {

            Logger.error(

                "Core Initialization Failed",

                error

            );

        }

    }

};

/*==========================================================
  DOM Ready
==========================================================*/

document.addEventListener(

    "DOMContentLoaded",

    async () => {

        await Core.initialize();

    }

);

/*==========================================================
  Module 6 : Router Engine
==========================================================*/

export const Router = {

    current: "home",

    routes: new Map(),

    register(name, callback) {

        if (!name || typeof callback !== "function")
            return;

        this.routes.set(name, callback);

    },

    async navigate(name, data = null) {

        if (!this.routes.has(name)) {

            Logger.warn("Route not found:", name);

            return;

        }

        try {

            Performance.start("ROUTE");

            this.current = name;

            await this.routes.get(name)(data);

            Events.emit("route:changed", {

                route: name,

                data

            });

            Performance.end("ROUTE");

        } catch (error) {

            Logger.error(error);

        }

    }

};

/*==========================================================
  Screen Manager
==========================================================*/

export const Screen = {

    active: null,

    show(id) {

        document

            .querySelectorAll("[data-screen]")

            .forEach(screen => {

                screen.classList.add("hidden");

            });

        const screen = document.getElementById(id);

        if (!screen)
            return;

        screen.classList.remove("hidden");

        this.active = id;

        Events.emit(

            "screen:changed",

            id

        );

    },

    current() {

        return this.active;

    }

};

/*==========================================================
  Navigation
==========================================================*/

export const Navigation = {

    init() {

        document

            .querySelectorAll("[data-route]")

            .forEach(button => {

                button.addEventListener(

                    "click",

                    () => {

                        Router.navigate(

                            button.dataset.route

                        );

                    }

                );

            });

    }

};

/*==========================================================
  Default Routes
==========================================================*/

Router.register(

    "home",

    () => {

        Screen.show("homeScreen");

    }

);

Router.register(

    "dashboard",

    () => {

        Screen.show("dashboardScreen");

    }

);

Router.register(

    "settings",

    () => {

        Screen.show("settingsScreen");

    }

);

Router.register(

    "profile",

    () => {

        Screen.show("profileScreen");

    }

);

/*==========================================================
  Router Ready
==========================================================*/

Events.on(

    "core:ready",

    () => {

        Navigation.init();

        Router.navigate("home");

    }

);

/*==========================================================
  Module 7 : Dynamic Module Loader
==========================================================*/

export const ModuleLoader = {

    modules: new Map(),

    loaded: new Set(),

    loading: new Set(),

    register(name, loader) {

        if (!name || typeof loader !== "function") {

            Logger.warn("Invalid module:", name);

            return;

        }

        this.modules.set(name, loader);

    },

    async load(name) {

        if (this.loaded.has(name))
            return true;

        if (this.loading.has(name))
            return false;

        if (!this.modules.has(name)) {

            Logger.warn("Unknown module:", name);

            return false;

        }

        this.loading.add(name);

        Performance.start(name);

        try {

            await this.modules.get(name)();

            this.loaded.add(name);

            Events.emit("module:loaded", name);

            Logger.log(name + " Loaded");

            return true;

        } catch (error) {

            Logger.error(name, error);

            Events.emit("module:error", {

                module: name,

                error

            });

            return false;

        } finally {

            this.loading.delete(name);

            Performance.end(name);

        }

    },

    async loadAll() {

        for (const name of this.modules.keys()) {

            await this.load(name);

        }

    },

    isLoaded(name) {

        return this.loaded.has(name);

    }

};

/*==========================================================
  Enterprise Modules
==========================================================*/

ModuleLoader.register(

    "PDF",

    async () => {

        Logger.log("PDF Engine Ready");

    }

);

ModuleLoader.register(

    "QR",

    async () => {

        Logger.log("QR Engine Ready");

    }

);

ModuleLoader.register(

    "SCANNER",

    async () => {

        Logger.log("Scanner Ready");

    }

);

ModuleLoader.register(

    "AI",

    async () => {

        Logger.log("AI Engine Ready");

    }

);

ModuleLoader.register(

    "PAYMENT",

    async () => {

        Logger.log("Payment Ready");

    }

);

ModuleLoader.register(

    "ANALYTICS",

    async () => {

        Logger.log("Analytics Ready");

    }

);

ModuleLoader.register(

    "NOTIFICATIONS",

    async () => {

        Logger.log("Notifications Ready");

    }

);

/*==========================================================
  Auto Load
==========================================================*/

Events.on(

    "core:ready",

    async () => {

        await ModuleLoader.loadAll();

    }

);

/*==========================================================
  Module 8 : Enterprise UI Engine
==========================================================*/

export const UI = {

    activeModal: null,

    activeLoader: false,

    toastTimer: null

};

/*==========================================================
  Modal Engine
==========================================================*/

UI.openModal = function(id){

    const modal=document.getElementById(id);

    if(!modal) return false;

    modal.classList.remove("hidden");

    modal.setAttribute("aria-hidden","false");

    this.activeModal=id;

    Events.emit("modal:opened",id);

    return true;

};

UI.closeModal=function(id){

    const modal=document.getElementById(id);

    if(!modal) return false;

    modal.classList.add("hidden");

    modal.setAttribute("aria-hidden","true");

    this.activeModal=null;

    Events.emit("modal:closed",id);

    return true;

};

UI.closeAllModals=function(){

    document
        .querySelectorAll(".modal")
        .forEach(modal=>{

            modal.classList.add("hidden");

            modal.setAttribute(
                "aria-hidden",
                "true"
            );

        });

    this.activeModal=null;

};

/*==========================================================
  Loader Engine
==========================================================*/

UI.showLoader=function(text="Loading..."){

    const loader=document.getElementById("globalLoader");

    if(!loader) return;

    loader.classList.remove("hidden");

    const label=

        loader.querySelector(".loader-text");

    if(label)
        label.textContent=text;

    this.activeLoader=true;

};

UI.hideLoader=function(){

    const loader=document.getElementById("globalLoader");

    if(!loader) return;

    loader.classList.add("hidden");

    this.activeLoader=false;

};

/*==========================================================
  Toast Engine
==========================================================*/

UI.toast=function(

    message,

    type="info",

    duration=3000

){

    let toast=

        document.getElementById(

            "lexora-toast"

        );

    if(!toast){

        toast=document.createElement("div");

        toast.id="lexora-toast";

        document.body.appendChild(toast);

    }

    toast.className=

        "toast toast-"+type;

    toast.textContent=message;

    toast.style.display="block";

    clearTimeout(this.toastTimer);

    this.toastTimer=setTimeout(()=>{

        toast.style.display="none";

    },duration);

};

/*==========================================================
  Alert
==========================================================*/

UI.alert=function(message){

    window.alert(message);

};

/*==========================================================
  Confirm
==========================================================*/

UI.confirm=function(message){

    return window.confirm(message);

};

/*==========================================================
  Bottom Sheet
==========================================================*/

UI.openSheet=function(id){

    const sheet=

        document.getElementById(id);

    if(!sheet) return;

    sheet.classList.add("active");

};

UI.closeSheet=function(id){

    const sheet=

        document.getElementById(id);

    if(!sheet) return;

    sheet.classList.remove("active");

};

/*==========================================================
  Keyboard Shortcuts
==========================================================*/

document.addEventListener(

    "keydown",

    event=>{

        if(

            event.key==="Escape" &&

            UI.activeModal

        ){

            UI.closeModal(

                UI.activeModal

            );

        }

    }

);

/*==========================================================
  UI Ready
==========================================================*/

Events.on(

    "core:ready",

    ()=>{

        Logger.log(

            "Enterprise UI Ready"

        );

    }

);


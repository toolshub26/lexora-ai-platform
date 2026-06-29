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


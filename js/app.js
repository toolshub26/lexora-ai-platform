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


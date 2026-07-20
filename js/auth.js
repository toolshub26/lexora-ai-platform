(function (global) {
    "use strict";

    // ========================================================
    // ENCAPSULATION VAULT (WeakMap State Isolation)
    // ========================================================
    const internalState = new WeakMap();

    const AuditEvents = Object.freeze({
        INIT_SUCCESS: "AUTH_INIT_SUCCESS",
        INIT_FAILURE: "AUTH_INIT_FAILURE",
        LOGIN_ATTEMPT: "AUTH_LOGIN_ATTEMPT",
        LOGIN_SUCCESS: "AUTH_LOGIN_SUCCESS",
        LOGIN_FAILURE: "AUTH_LOGIN_FAILURE",
        SIGNUP_ATTEMPT: "AUTH_SIGNUP_ATTEMPT",
        SIGNUP_SUCCESS: "AUTH_SIGNUP_SUCCESS",
        SIGNUP_FAILURE: "AUTH_SIGNUP_FAILURE",
        LOGOUT_SUCCESS: "AUTH_LOGOUT_SUCCESS",
        PASSWORD_RESET_SENT: "AUTH_PASSWORD_RESET_SENT",
        VERIFICATION_SENT: "AUTH_VERIFICATION_SENT",
        LOCK_TRIGGERED: "AUTH_RACE_LOCK_TRIGGERED",
        TOKEN_REFRESH_SUCCESS: "AUTH_TOKEN_REFRESH_SUCCESS",
        USER_RELOADED: "AUTH_USER_RELOADED"
    });

    // ========================================================
    // FIREBASE ADAPTER (Compat & Modular Bridge)
    // ========================================================
    const FirebaseSdkAdapter = {
        hasGlobalModularBindings() {
            return typeof window !== 'undefined' && typeof window.signInWithEmailAndPassword === 'function';
        },

        isCompat() {
            return typeof window !== 'undefined' && !!(window.firebase && typeof window.firebase.auth === 'function');
        },

        getAuthInstance() {
            if (typeof window === 'undefined') return null;
            if (window.auth) return window.auth; 
            if (window.LexoraFirebaseAdapter && window.LexoraFirebaseAdapter.auth) return window.LexoraFirebaseAdapter.auth;
            if (this.isCompat()) return window.firebase.auth(); 
            return null;
        },

        async setPersistence(auth, persistenceRef) {
            if (typeof window !== 'undefined' && typeof window.setPersistence === 'function') {
                return window.setPersistence(auth, persistenceRef);
            }
            if (auth && typeof auth.setPersistence === 'function') {
                return auth.setPersistence(persistenceRef);
            }
            throw new Error("Firebase setPersistence contract signature unresolved.");
        },

        async signIn(auth, email, password) {
            if (this.hasGlobalModularBindings()) return window.signInWithEmailAndPassword(auth, email, password);
            if (auth && typeof auth.signInWithEmailAndPassword === 'function') return auth.signInWithEmailAndPassword(email, password);
            throw new Error("Firebase credentials sign-in mapping signature unresolved.");
        },

        async signUp(auth, email, password) {
            if (typeof window !== 'undefined' && typeof window.createUserWithEmailAndPassword === 'function') {
                return window.createUserWithEmailAndPassword(auth, email, password);
            }
            if (auth && typeof auth.createUserWithEmailAndPassword === 'function') {
                return auth.createUserWithEmailAndPassword(email, password);
            }
            throw new Error("Firebase registration signature mapping unresolved.");
        },

        async signOut(auth) {
            if (typeof window !== 'undefined' && typeof window.signOut === 'function') return window.signOut(auth);
            if (auth && typeof auth.signOut === 'function') return auth.signOut();
            throw new Error("Firebase signOut routine signature unresolved.");
        },

        async signInWithPopup(auth, provider) {
            if (typeof window !== 'undefined' && typeof window.signInWithPopup === 'function') return window.signInWithPopup(auth, provider);
            if (auth && typeof auth.signInWithPopup === 'function') return auth.signInWithPopup(provider);
            throw new Error("Firebase OAuth Popup pipeline unresolved.");
        },

        async sendPasswordReset(auth, email) {
            if (typeof window !== 'undefined' && typeof window.sendPasswordResetEmail === 'function') return window.sendPasswordResetEmail(auth, email);
            if (auth && typeof auth.sendPasswordResetEmail === 'function') return auth.sendPasswordResetEmail(email);
            throw new Error("Firebase password reset system mapping unresolved.");
        }
    };

    const DEFAULT_CONFIG = {
        minPasswordLength: 8,
        requireUppercase: true,
        requireLowercase: true,
        requireNumber: true,
        debug: false,
        persistence: "local", 
        googleScopes: [],
        googleCustomParams: { prompt: "select_account" },
        maskAuditPII: true, 
        maskDomainTLD: false, 
        maxHashCacheSize: 1000, 
        onLoginSuccess: null,
        onSignupSuccess: null,
        onAuthStateChanged: null,
        
        showToast: function(msg, type) { 
            if (window.Lexora && typeof window.Lexora.showToast === 'function') {
                window.Lexora.showToast(msg, type);
            } else {
                console.log(`[UI Toast - ${type.toUpperCase()}]: ${msg}`); 
            }
        },
        emitEvent: function(eventName, detail) {
            if (typeof window !== "undefined") {
                if (typeof window.CustomEvent === "function") {
                    window.dispatchEvent(new CustomEvent(eventName, { detail: detail }));
                } else if (typeof document !== "undefined" && typeof document.createEvent === "function") {
                    const evt = document.createEvent('CustomEvent');
                    evt.initCustomEvent(eventName, true, true, detail);
                    window.dispatchEvent(evt);
                }
            }
        },
        logger: {
            info: function(msg, ...args) { console.log(`[Lexora INFO]: ${msg}`, ...args); },
            warn: function(msg, ...args) { console.warn(`[Lexora WARN]: ${msg}`, ...args); },
            error: function(msg, ...args) { console.error(`[Lexora ERROR]: ${msg}`, ...args); },
            audit: function(eventType, detail) { 
                console.info(`[SECURITY AUDIT] [${eventType}]:`, detail);
            }
        }
    };

    class AuthManager {
        constructor() {
            this.version = "20.0.0";
            this.config = Object.assign({}, DEFAULT_CONFIG);
            this.config.logger = Object.assign({}, DEFAULT_CONFIG.logger);
            
            this.currentUser = null;
            this.isInitialized = false;
            
            // Firebase reference object matching legacy v20 expectation
            this.firebase = {
                auth: null,
                ready: false
            };
            
            internalState.set(this, {
                unsubscribeHandler: null,
                initPromise: null, 
                abortController: null,
                listenerStarted: false,
                locks: { login: false, signup: false, logout: false, google: false, reset: false, verify: false },
                hashCache: new Map() 
            });
        }

        // Backward compatibility getters for legacy property flags
        get initialized() {
            return this.isInitialized;
        }
        set initialized(val) {
            this.isInitialized = !!val;
        }

        configure(options) {
            if (!options || typeof options !== 'object') return;
            const deepMergeTargetKeys = ['logger', 'googleCustomParams'];
            
            for (const key in options) {
                if (Object.prototype.hasOwnProperty.call(DEFAULT_CONFIG, key)) {
                    if (deepMergeTargetKeys.indexOf(key) !== -1 && typeof options[key] === 'object' && options[key] !== null) {
                        this.config[key] = Object.assign({}, this.config[key], options[key]);
                    } else {
                        this.config[key] = options[key];
                    }
                }
            }
        }

        // ========================================================
        // LIFECYCLE TRACKING & REQUIRE ASSERTIONS
        // ========================================================

        _requireInit() {
            if (!this.isInitialized) {
                throw new Error("LexoraAuth Execution Exception: Target pipeline operation rejected. The layer has not been initialized. Call await init() first.");
            }
        }

        // ========================================================
        // PERFORMANCE CAP BOUNDED CRYPTOGRAPHIC MASKING ENGINE
        // ========================================================

        async _generateSafeMaskHash(str) {
            if (!str || typeof str !== 'string') return 'EMPTY';
            
            const state = internalState.get(this);
            if (state && state.hashCache && state.hashCache.has(str)) {
                return state.hashCache.get(str);
            }
            
            let finalHash = '';
            
            if (typeof crypto !== 'undefined' && crypto.subtle && crypto.subtle.digest) {
                try {
                    const msgUint8 = new TextEncoder().encode(str);
                    const hashBuffer = await crypto.subtle.digest('SHA-256', msgUint8);
                    const hashArray = Array.from(new Uint8Array(hashBuffer));
                    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
                    finalHash = 'SECURE_ID_' + hashHex.toUpperCase().substring(0, 16);
                } catch (e) {
                    // Fallback handled below
                }
            }
            
            if (!finalHash) {
                let hashVal = 0;
                for (let i = 0; i < str.length; i++) {
                    hashVal = (hashVal << 5) - hashVal + str.charCodeAt(i);
                    hashVal |= 0;
                }
                finalHash = 'MASKED_ID_' + Math.abs(hashVal).toString(16).toUpperCase();
            }

            // Bounded LRU Cache Implementation (FIFO Eviction)
            if (state && state.hashCache) {
                const maxCacheLimit = this.config.maxHashCacheSize || 1000;
                if (state.hashCache.size >= maxCacheLimit) {
                    const oldestEntryKey = state.hashCache.keys().next().value;
                    state.hashCache.delete(oldestEntryKey);
                }
                state.hashCache.set(str, finalHash);
            }
            
            return finalHash;
        }

        // ========================================================
        // SECURITY AUDIT LOGGING
        // ========================================================

        _auditLog(eventType, rawDetail = {}) {
            const self = this;
            this._executeAsyncAuditPipeline(eventType, rawDetail).catch(function (err) {
                self.config.logger.error("Audit telemetry logging pipeline failed internally.", err);
            });
        }

        async _executeAsyncAuditPipeline(eventType, rawDetail) {
            if (!this.config.maskAuditPII) {
                this.config.logger.audit(eventType, rawDetail);
                return;
            }

            const cleanDetail = Object.assign({}, rawDetail);
            
            if (cleanDetail.email && typeof cleanDetail.email === 'string') {
                const parts = cleanDetail.email.split('@');
                if (parts.length === 2) {
                    const local = parts[0];
                    const domain = parts[1];
                    const maskedLocal = local.length > 2 ? `${local.substring(0, 2)}***` : `${local}***`;
                    
                    const domainParts = domain.split('.');
                    if (domainParts.length >= 1) {
                        const targetDomain = domainParts[0];
                        const maskedDomain = targetDomain.length > 2 ? `${targetDomain.substring(0, 2)}***` : `${targetDomain}***`;
                        domainParts[0] = maskedDomain;
                        
                        if (this.config.maskDomainTLD && domainParts.length > 1) {
                            for (let i = 1; i < domainParts.length; i++) {
                                domainParts[i] = '***';
                            }
                        }
                    }
                    cleanDetail.email = `${maskedLocal}@${domainParts.join('.')}`;
                }
            }
            
            if (cleanDetail.uid && typeof cleanDetail.uid === 'string') {
                cleanDetail.uid = await this._generateSafeMaskHash(cleanDetail.uid);
            }
            
            this.config.logger.audit(eventType, cleanDetail);
        }

        // ========================================================
        // RACE CONDITION & CONCURRENCY LOCKS
        // ========================================================

        _acquireLock(operation) {
            const state = internalState.get(this);
            if (!state) return false;
            if (state.locks[operation]) {
                this._auditLog(AuditEvents.LOCK_TRIGGERED, { operation: operation });
                return false;
            }
            state.locks[operation] = true;
            return true;
        }

        _releaseLock(operation) {
            const state = internalState.get(this);
            if (state && state.locks && Object.prototype.hasOwnProperty.call(state.locks, operation)) {
                state.locks[operation] = false;
            }
        }

        // ========================================================
        // STATE MONITORING & TRACKING INTERFACES
        // ========================================================

        getCurrentUser() { return this.currentUser; }
        currentUser() {
    return this.getCurrentUser();
}
        isAuthenticated() { return this.getCurrentUser() !== null; }
        hasVerifiedEmail() { 
            const user = this.getCurrentUser();
            return user ? user.emailVerified : false; 
        }

        async getIdToken(forceRefresh = false) {
            this._requireInit();
            const user = this.getCurrentUser();
            if (!user) {
                this.config.logger.warn("getIdToken executed without active authenticated identity state tracking.");
                return null;
            }
            try {
                let token = null;
                if (typeof user.getIdToken === 'function') {
                    token = await user.getIdToken(forceRefresh);
                }
                this._auditLog(AuditEvents.TOKEN_REFRESH_SUCCESS, { forceRefresh: forceRefresh });
                return token;
            } catch (error) {
                this.config.logger.error("Failed to fetch current authorization context token.", error);
                throw error;
            }
        }

        async reloadCurrentUser() {
            this._requireInit();
            const authInstance = FirebaseSdkAdapter.getAuthInstance();
            const user = authInstance ? authInstance.currentUser : null;
            if (!user) return;
            
            try {
                if (typeof user.reload === 'function') {
                    await user.reload();
                    this.currentUser = authInstance.currentUser;
                    this._auditLog(AuditEvents.USER_RELOADED, { uid: this.currentUser ? this.currentUser.uid : null });
                    this.config.emitEvent('lexora-auth-state-changed', { user: this.currentUser });
                }
            } catch (error) {
                this.config.logger.error("Failed to re-sync core auth profile attributes from structural servers.", error);
                throw error;
            }
        }

        // ========================================================
        // CREDENTIAL PROCESSING
        // ========================================================

        normalizeEmail(email) {
            if (!email || typeof email !== 'string') return '';
            const normalized = email.trim().toLowerCase();
            return (typeof normalized.normalize === 'function') ? normalized.normalize("NFKC") : normalized;
        }

        validateCredentials(email, password) {
            const cleanEmail = this.normalizeEmail(email);
            const cleanPassword = typeof password === 'string' ? password : '';

            if (!cleanEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(cleanEmail)) {
                return { valid: false, message: "Please enter a valid email address." };
            }
            if (cleanPassword.length < this.config.minPasswordLength) {
                return { valid: false, message: `Password must be at least ${this.config.minPasswordLength} characters.` };
            }
            if (this.config.requireUppercase && !/[A-Z]/.test(cleanPassword)) {
                return { valid: false, message: "Password requires at least one uppercase letter." };
            }
            if (this.config.requireLowercase && !/[a-z]/.test(cleanPassword)) {
                return { valid: false, message: "Password requires at least one lowercase letter." };
            }
            if (this.config.requireNumber && !/\d/.test(cleanPassword)) {
                return { valid: false, message: "Password requires at least one numeric digit." };
            }
            return { valid: true, email: cleanEmail, password: cleanPassword };
        }

        _getFriendlyErrorMessage(error) {
            const code = error && error.code ? String(error.code).toLowerCase() : '';
            switch (code) {
                case 'auth/invalid-email': return "The email address is invalid.";
                case 'auth/user-not-found': return "No account matches this email.";
                case 'auth/wrong-password': return "Incorrect password provided.";
                case 'auth/invalid-credential': return "Invalid credentials provided.";
                case 'auth/email-already-in-use': return "An account already exists with this email.";
                case 'auth/too-many-requests': return "Account temporarily locked due to excessive failed attempts. Please try later.";
                case 'auth/popup-closed-by-user': return "Sign-in window closed before completion.";
                default: return error && error.message ? error.message : "Authentication processing fault.";
            }
        }

        // ========================================================
        // OPERATIONAL LIFECYCLE ROUTINES 
        // ========================================================

        initializeFirebase() {
            const authInstance = FirebaseSdkAdapter.getAuthInstance();
            if (!authInstance && !window.auth) {
                console.warn("Firebase Auth not loaded.");
                this.firebase.ready = false;
                return;
            }
            this.firebase.auth = authInstance || window.auth;
            this.firebase.ready = true;
            console.log("Firebase Authentication Ready");
        }

        isReady() {
            return !!(
                this.firebase &&
                this.firebase.ready &&
                this.firebase.auth
            );
        }

        async init() {
            if (this.isInitialized) return true;

            const state = internalState.get(this);
            // CONCURRENCY VAULT: Return existing Promise if initialization is already in flight
            if (state && state.initPromise) {
                return state.initPromise; 
            }

            const self = this;
            const initTask = (async function () {
                try {
                    console.log("Lexora Auth Initializing");
                    self.initializeFirebase();
                    
                    const authInstance = FirebaseSdkAdapter.getAuthInstance();
                    if (!authInstance) {
                        throw new Error("Target Authentication structural instance layers could not be resolved.");
                    }

                    await self._applyPersistenceStrategy(authInstance);

                    self.bindEvents();

                    // Start the auth state listener (only once)
                    if (state && !state.listenerStarted) {
                        state.listenerStarted = true;
                        self.onAuthStateChanged((user) => {
                            self.currentUser = user;
                            document.dispatchEvent(
                                new CustomEvent("auth-state-changed", { detail: { user } })
                            );
                        });
                    }

                    self.isInitialized = true;
                    self._auditLog(AuditEvents.INIT_SUCCESS, { timestamp: Date.now() });
                    self.config.emitEvent('lexora-auth-initialized');
                    console.log("Lexora Auth Initialized Successfully");
                    return true;
                } catch (err) {
                    self._auditLog(AuditEvents.INIT_FAILURE, { message: err.message });
                    self.config.logger.error("System Initialization baseline routine rejected.", err);
                    const innerState = internalState.get(self);
                    if (innerState) {
                        innerState.listenerStarted = false;
                    }
                    throw err;
                } finally {
                    const innerState = internalState.get(self);
                    if (innerState) {
                        innerState.initPromise = null;
                    }
                }
            })();

            if (state) state.initPromise = initTask;
            return initTask;
        }

        async _applyPersistenceStrategy(authInstance) {
            try {
                const typeKey = this.config.persistence.toLowerCase();
                let typeRef = null;

                if (typeof window !== 'undefined' && typeof window.setPersistence === 'function') {
                    if (typeKey === 'session') typeRef = window.browserSessionPersistence;
                    else if (typeKey === 'none') typeRef = window.inMemoryPersistence; 
                    else typeRef = window.browserLocalPersistence;
                } else if (typeof window !== 'undefined' && window.firebase && window.firebase.auth && window.firebase.auth.Auth) {
                    const pKeys = window.firebase.auth.Auth.Persistence;
                    if (typeKey === 'session') typeRef = pKeys.SESSION;
                    else if (typeKey === 'none') typeRef = pKeys.NONE; 
                    else typeRef = pKeys.LOCAL;
                }

                if (typeRef !== null) {
                    await FirebaseSdkAdapter.setPersistence(authInstance, typeRef);
                }
            } catch (err) {
                this.config.logger.warn("Could not modify SDK state persistence layer layout maps safely.", err);
            }
        }

        bindEvents() {
            console.log("Auth Events Ready");
            const state = internalState.get(this);
            if (typeof AbortController === 'function' && state) {
                if (state.abortController) {
                    state.abortController.abort();
                }
                state.abortController = new AbortController();
            }
            const signal = state && state.abortController ? state.abortController.signal : undefined;

            const loginForm = document.getElementById("loginForm");
            if (loginForm) {
                loginForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    try {
                        const emailInput = document.getElementById("loginEmail");
                        const passInput = document.getElementById("loginPassword");
                        await this.login(
                            emailInput ? emailInput.value : "",
                            passInput ? passInput.value : ""
                        );
                        if (window.Lexora && typeof window.Lexora.closeModal === 'function') {
                            window.Lexora.closeModal("loginModal");
                        }
                        this.config.showToast("Login Successful", "success");
                    } catch (error) {
                        this.config.showToast(error.message, "error");
                    }
                }, { signal });
            }

            const googleLoginBtn = document.getElementById("googleLoginBtn");
            if (googleLoginBtn) {
                googleLoginBtn.addEventListener("click", async () => {
                    try {
                        await this.googleLogin();
                        if (window.Lexora && typeof window.Lexora.closeModal === 'function') {
                            window.Lexora.closeModal("loginModal");
                        }
                        this.config.showToast("Login Successful", "success");
                    } catch (error) {
                        this.config.showToast(error.message, "error");
                    }
                }, { signal });
            }

            const signupForm = document.getElementById("signupForm");
            if (signupForm) {
                signupForm.addEventListener("submit", async (e) => {
                    e.preventDefault();
                    try {
                        const emailInput = document.getElementById("signupEmail");
                        const passInput = document.getElementById("signupPassword");
                        await this.signUp(
                            emailInput ? emailInput.value : "",
                            passInput ? passInput.value : ""
                        );
                        if (window.Lexora && typeof window.Lexora.closeModal === 'function') {
                            window.Lexora.closeModal("signupModal");
                        }
                        this.config.showToast("Account Created", "success");
                    } catch (error) {
                        this.config.showToast(error.message, "error");
                    }
                }, { signal });
            }
        }

        async login(email, password) {
            this._requireInit();
            if (!this._acquireLock('login')) return null;
            this._auditLog(AuditEvents.LOGIN_ATTEMPT, { email: email });
            
            try {
                const validation = this.validateCredentials(email, password);
                if (!validation.valid) {
                    this.config.showToast(validation.message, "error");
                    this._auditLog(AuditEvents.LOGIN_FAILURE, { reason: "validation_failed" });
                    return null;
                }

                const authInstance = FirebaseSdkAdapter.getAuthInstance();
                const userCredential = await FirebaseSdkAdapter.signIn(authInstance, validation.email, validation.password);
                this.currentUser = userCredential.user;
                this.config.showToast("Login successful", "success");
                this._auditLog(AuditEvents.LOGIN_SUCCESS, { uid: userCredential.user ? userCredential.user.uid : "unknown" });
                
                if (typeof this.config.onLoginSuccess === 'function') {
                    await this.config.onLoginSuccess(userCredential);
                }
                return userCredential;
            } catch (error) {
                console.error("Login error:", error.message);
                this.config.showToast(this._getFriendlyErrorMessage(error), "error");
                this._auditLog(AuditEvents.LOGIN_FAILURE, { code: error.code, message: error.message });
                throw error;
            } finally { 
                this._releaseLock('login');
            }
        }

        async signUp(email, password) {
            this._requireInit();
            if (!this._acquireLock('signup')) return null;
            this._auditLog(AuditEvents.SIGNUP_ATTEMPT, { email: email });

            try {
                const validation = this.validateCredentials(email, password);
                if (!validation.valid) {
                    this.config.showToast(validation.message, "error");
                    this._auditLog(AuditEvents.SIGNUP_FAILURE, { reason: "validation_failed" });
                    return null;
                }

                const authInstance = FirebaseSdkAdapter.getAuthInstance();
                const userCredential = await FirebaseSdkAdapter.signUp(authInstance, validation.email, validation.password);
                this.currentUser = userCredential.user;
                console.log("Account Created");
                this.config.showToast("Account Created", "success");
                this._auditLog(AuditEvents.SIGNUP_SUCCESS, { uid: userCredential.user ? userCredential.user.uid : "unknown" });
                
                if (typeof this.config.onSignupSuccess === 'function') {
                    await this.config.onSignupSuccess(userCredential);
                }
                return userCredential;
            } catch (error) {
                console.error("Signup error:", error.message);
                this.config.showToast(this._getFriendlyErrorMessage(error), "error");
                this._auditLog(AuditEvents.SIGNUP_FAILURE, { code: error.code, message: error.message });
                throw error;
            } finally {
                this._releaseLock('signup');
            }
        }

        async logout() {
            this._requireInit();
            if (!this._acquireLock('logout')) return;
            try {
                const authInstance = FirebaseSdkAdapter.getAuthInstance();
                await FirebaseSdkAdapter.signOut(authInstance);
                this.currentUser = null;
                if (window.Lexora && window.Lexora.session) {
    window.Lexora.session.clear();
    }
}
                console.log("User signed out");
                this.config.showToast("Logged out successfully", "success");
                this._auditLog(AuditEvents.LOGOUT_SUCCESS, { timestamp: Date.now() });
            } catch (error) {
                console.error("Logout error:", error.message);
                this.config.showToast("Signout request pipeline failed.", "error");
                throw error;
            } finally {
                this._releaseLock('logout');
            }
        }

        async googleLogin() {
            this._requireInit();
            if (!this._acquireLock('google')) return null;
            try {
                let provider = null;
                if (typeof window !== 'undefined' && window.GoogleAuthProvider) {
                    provider = new window.GoogleAuthProvider();
                } else if (typeof window !== 'undefined' && window.firebase && window.firebase.auth && window.firebase.auth.GoogleAuthProvider) {
                    provider = new window.firebase.auth.GoogleAuthProvider();
                }

                if (!provider) throw new Error("GoogleAuthProvider platform component declaration missing.");

                if (this.config.googleScopes && Array.isArray(this.config.googleScopes)) {
                    const cleanScopes = this.config.googleScopes
                        .filter(s => typeof s === 'string')
                        .map(s => s.trim())
                        .filter(s => s.length > 0);
                        
                    const uniqueScopes = Array.from(new Set(cleanScopes));
                    for (let i = 0; i < uniqueScopes.length; i++) {
                        if (typeof provider.addScope === 'function') provider.addScope(uniqueScopes[i]);
                    }
                }
                
                if (this.config.googleCustomParams && typeof provider.setCustomParameters === 'function') {
                    provider.setCustomParameters(this.config.googleCustomParams);
                }

                const authInstance = FirebaseSdkAdapter.getAuthInstance();
                const result = await FirebaseSdkAdapter.signInWithPopup(authInstance, provider);
                
                this.currentUser = result.user;
                
                this.config.showToast("Login Successful", "success");
                this._auditLog(AuditEvents.LOGIN_SUCCESS, { uid: result.user ? result.user.uid : "oauth", type: "google" });
                
                if (typeof this.config.onLoginSuccess === 'function') {
                    await this.config.onLoginSuccess(result);
                }
                return result.user;
            } catch (error) {
                console.error(error);
                if (error && error.code !== 'auth/popup-closed-by-user') {
                    this.config.showToast(this._getFriendlyErrorMessage(error), "error");
                }
                throw error;
            } finally {
                this._releaseLock('google');
            }
        }

        async resetPassword(email) {
            this._requireInit();
            if (!this._acquireLock('reset')) return false;
            const targetEmail = this.normalizeEmail(email);
            if (!targetEmail) {
                this.config.showToast("Email is required.", "error");
                this._releaseLock('reset');
                return false;
            }

            try {
                const authInstance = FirebaseSdkAdapter.getAuthInstance();
                await FirebaseSdkAdapter.sendPasswordReset(authInstance, targetEmail);
                console.log("Password reset email sent");
                this.config.showToast("Password reset email sent", "success");
                this._auditLog(AuditEvents.PASSWORD_RESET_SENT, { email: targetEmail });
                return true;
            } catch (error) {
                console.error("Password reset error:", error.message);
                this.config.showToast(this._getFriendlyErrorMessage(error), "error");
                throw error;
            } finally {
                this._releaseLock('reset');
            }
        }

        async sendVerificationEmail() {
            this._requireInit();
            if (!this._acquireLock('verify')) return;
            const user = this.getCurrentUser();
            if (!user) {
                this.config.showToast("No active authentication user session framework resolved.", "error");
                this._releaseLock('verify');
                return;
            }

            try {
                if (typeof window !== 'undefined' && typeof window.sendEmailVerification === 'function') {
                    await window.sendEmailVerification(user);
                } else if (typeof user.sendEmailVerification === 'function') {
                    await user.sendEmailVerification();
                } else {
                    throw new Error("sendEmailVerification interface capacity missing.");
                }

                this.config.showToast("Verification identity check issued.", "success");
                this._auditLog(AuditEvents.VERIFICATION_SENT, { uid: user.uid });
            } catch (error) {
                this.config.showToast(this._getFriendlyErrorMessage(error), "error");
                throw error;
            } finally {
                this._releaseLock('verify');
            }
        }

        onAuthStateChanged(callback) {
            try {
                this._requireInit();
            } catch (error) {
                console.warn("onAuthStateChanged called before init/ready. Delaying binding or returning no-op.");
                if (!this.firebase.auth) {
                    this.initializeFirebase();
                }
            }

            const authRef = this.firebase.auth || FirebaseSdkAdapter.getAuthInstance();
            if (!authRef) {
                console.error("Firebase Auth is not ready for onAuthStateChanged.");
                return () => {};
            }

            const handleUserChange = (user) => {
                this.currentUser = user;
                if (user) {
    if (window.Lexora && Lexora.session && typeof Lexora.session.save === "function") {
        Lexora.session.save({
            uid: user.uid,
            email: user.email
        });
    }
}
                } else {
                    if (window.Lexora && Lexora.session && typeof Lexora.session.clear === 'function') {
                        Lexora.session.clear();
                    }
                }
                if (typeof this.config.onAuthStateChanged === 'function') {
                    try { this.config.onAuthStateChanged(user); } catch (e) {}
                }
                if (callback) callback(user);
            };

            let unsubscribeFn = null;
            if (typeof window !== 'undefined' && typeof window.onAuthStateChanged === 'function') {
                unsubscribeFn = window.onAuthStateChanged(authRef, handleUserChange);
            } else if (typeof authRef.onAuthStateChanged === 'function') {
                unsubscribeFn = authRef.onAuthStateChanged(handleUserChange);
            }

            return unsubscribeFn || (() => {});
        }

        // ========================================================
        // LIFECYCLE CLEANUP & TEARDOWN
        // ========================================================

        destroy() {
            const state = internalState.get(this);
            if (state) {
                // 1. Abort DOM Event Listeners
                if (state.abortController) {
                    state.abortController.abort();
                    state.abortController = null;
                }
                // 2. Unsubscribe from auth state listeners
                if (state.unsubscribeHandler) {
                    if (typeof state.unsubscribeHandler === 'function') state.unsubscribeHandler();
                    else if (state.unsubscribeHandler.unsubscribe) state.unsubscribeHandler.unsubscribe();
                    state.unsubscribeHandler = null;
                }
                // 3. Release all locks aggressively
                if (state.locks) {
                    const lockKeys = Object.keys(state.locks);
                    for (let i = 0; i < lockKeys.length; i++) {
                        state.locks[lockKeys[i]] = false;
                    }
                }
                // 4. Purge cryptographic mapping cache
                if (state.hashCache) {
                    state.hashCache.clear();
                }
                // 5. Release concurrency vaults
                state.initPromise = null;
                state.listenerStarted = false;
            }
            
            this.currentUser = null;
            this.isInitialized = false;
            this.firebase.auth = null;
            this.firebase.ready = false;
            
            this.config.logger.info("AuthManager lifecycle destroyed cleanly.");
        }
    }

    // Instantiate and expose globally with backward compatibility bridge
    const enterpriseAuthManager = new AuthManager();

    global.LexoraAuth = enterpriseAuthManager;
    global.Auth = enterpriseAuthManager; // Universal backward compatibility alias for existing code calling window.Auth

    if (typeof document !== 'undefined') {
        document.addEventListener("DOMContentLoaded", () => {
            enterpriseAuthManager.init().catch(err => {
                console.error("Automatic initialization error during DOMContentLoaded:", err);
            });
        });
    }

    console.log("Auth module loaded (Enterprise Architecture with v20 Compatibility Bridge)");

})(typeof window !== "undefined" ? window : globalThis);


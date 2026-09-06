"use strict";

const admin = require("firebase-admin");
const functions = require("firebase-functions");

const db = admin.firestore();

const ROLE_PERMISSIONS = {
  "super-admin": [
    "dashboard:view",
    "profile:view",
    "profile:update",
    "ai:chat",
    "ai:generate",
    "document:create",
    "document:read",
    "document:update",
    "document:delete",
    "user:manage",
    "role:manage",
    "billing:view",
    "billing:manage",
    "settings:manage"
  ],

  admin: [
    "dashboard:view",
    "profile:view",
    "profile:update",
    "ai:chat",
    "ai:generate",
    "document:create",
    "document:read",
    "document:update",
    "document:delete",
    "user:manage",
    "role:manage",
    "billing:view",
    "billing:manage",
    "settings:manage"
  ],

  manager: [
    "dashboard:view",
    "profile:view",
    "profile:update",
    "ai:chat",
    "ai:generate",
    "document:create",
    "document:read",
    "document:update",
    "billing:view"
  ],

  editor: [
    "dashboard:view",
    "profile:view",
    "profile:update",
    "ai:chat",
    "ai:generate",
    "document:create",
    "document:read",
    "document:update"
  ],

  user: [
    "dashboard:view",
    "profile:view",
    "profile:update",
    "ai:chat",
    "document:create",
    "document:read"
  ]
};

const ORGANIZATION_NAME_MAX_LENGTH = 120;
const ORGANIZATION_SLUG_MAX_LENGTH = 63;

function requireAuth(context) {
  if (!context.auth || !context.auth.uid) {
    throw new functions.https.HttpsError(
      "unauthenticated",
      "Authentication is required."
    );
  }

  return context.auth.uid;
}

function normalizeOrganizationName(name) {
  return String(name || "")
    .trim()
    .replace(/\s+/g, " ");
}

function createSlug(value) {
  return value
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, ORGANIZATION_SLUG_MAX_LENGTH);
}

function validateOrganizationName(name) {
  if (!name) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Organization name is required."
    );
  }

  if (name.length > ORGANIZATION_NAME_MAX_LENGTH) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Organization name is too long."
    );
  }
}

function validateSlug(slug) {
  if (!slug || slug.length > ORGANIZATION_SLUG_MAX_LENGTH) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Invalid organization slug."
    );
  }

  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug)) {
    throw new functions.https.HttpsError(
      "invalid-argument",
      "Organization slug contains invalid characters."
    );
  }
}

exports.createOrganization = functions.https.onCall(
  async (data, context) => {
    const uid = requireAuth(context);

    const name = normalizeOrganizationName(data && data.name);
    validateOrganizationName(name);

    const requestedSlug =
      typeof (data && data.slug) === "string"
        ? data.slug.trim().toLowerCase()
        : "";

    const slug = requestedSlug || createSlug(name);

    validateSlug(slug);

    const organizationRef =
      db.collection("organizations").doc();

    const membershipRef =
      organizationRef.collection("members").doc(uid);

    const auditRef =
      organizationRef.collection("auditLogs").doc();

    // Canonical slug registry.
    // One slug can point to only one organization.
    const slugRef =
      db.collection("organizationSlugs").doc(slug);

    const now =
      admin.firestore.FieldValue.serverTimestamp();

    await db.runTransaction(async (transaction) => {
      const existingSlug =
        await transaction.get(slugRef);

      if (existingSlug.exists) {
        throw new functions.https.HttpsError(
          "already-exists",
          "Organization slug is already in use."
        );
      }

      transaction.create(organizationRef, {
        name,
        slug,
        status: "active",
        ownerId: uid,
        createdAt: now,
        updatedAt: now
      });

      transaction.create(membershipRef, {
        userId: uid,
        organizationId: organizationRef.id,
        role: "admin",
        permissions: ROLE_PERMISSIONS.admin,
        status: "active",
        joinedAt: now,
        createdAt: now,
        updatedAt: now
      });

      transaction.create(slugRef, {
        slug,
        organizationId: organizationRef.id,
        status: "active",
        createdAt: now,
        updatedAt: now
      });

      transaction.create(auditRef, {
        action: "organization.created",
        actorId: uid,
        organizationId: organizationRef.id,
        targetId: organizationRef.id,
        metadata: {
          role: "admin",
          slug
        },
        createdAt: now
      });
    });

    return {
      success: true,
      organizationId: organizationRef.id,
      slug
    };
  }
);

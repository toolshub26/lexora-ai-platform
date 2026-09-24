import type {
  UserProfile,
  UserPreferences,
  UserSubscription,
} from "./types";

import { db } from "@/lib/firebase";
import {
  doc,
  setDoc,
  getDoc,
  serverTimestamp,
} from "firebase/firestore";

export class UserService {
  async getProfile(userId: string): Promise<UserProfile | null> {
    const userRef = doc(db, "users", userId);
    const snapshot = await getDoc(userRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();

    return {
      id: data.id || userId,
      email: data.email || "",
      displayName: data.name || "",
      photoURL: data.photoURL,
      createdAt: data.createdAt ? data.createdAt.toDate() : new Date(),
      updatedAt: data.updatedAt ? data.updatedAt.toDate() : new Date(),
    };
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    const userRef = doc(db, "users", profile.id);
    await setDoc(userRef, {
      id: profile.id,
      email: profile.email,
      name: profile.displayName,
      photoURL: profile.photoURL,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }

  async getPreferences(userId: string): Promise<UserPreferences | null> {
    const prefsRef = doc(db, "userPreferences", userId);
    const snapshot = await getDoc(prefsRef);

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();

    return {
      language: data.language ?? "en",
        userId,
      theme: data.theme ?? "system",
      notifications: data.notifications ?? true,
    };
  }

  async updatePreferences(
    preferences: UserPreferences,
  ): Promise<void> {
    const prefsRef = doc(db, "userPreferences", preferences.userId);
    await setDoc(prefsRef, {
      ...preferences,
      updatedAt: serverTimestamp(),
    }, { merge: true });
  }

  async getSubscription(userId: string): Promise<UserSubscription | null> {
    const subRef = doc(db, "subscriptions", userId);
    const snapshot = await getDoc(subRef);

    if (!snapshot.exists()) {
      return {
        plan: "free",
        status: "inactive",
      };
    }

    const data = snapshot.data();

    return {
      plan: data.plan || "free",
      status: data.status || "inactive",
    };
  }

  async toggleSubscription(): Promise<{ success: boolean; plan: string }> {
    // This would be called from the UI to switch plans
    // For now, return a placeholder
    return {
      success: false,
      plan: "free",
    };
  }
}

export const userService = new UserService();
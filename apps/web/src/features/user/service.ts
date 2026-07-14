import type {
  UserProfile,
  UserPreferences,
  UserSubscription,
} from "./types";

export class UserService {
  async getProfile(userId: string): Promise<UserProfile | null> {
    console.log("Get profile:", userId);
    return null;
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    console.log("Update profile:", profile);
  }

  async getPreferences(userId: string): Promise<UserPreferences | null> {
    console.log("Get preferences:", userId);
    return null;
  }

  async updatePreferences(
    preferences: UserPreferences,
  ): Promise<void> {
    console.log("Update preferences:", preferences);
  }

  async getSubscription(
    userId: string,
  ): Promise<UserSubscription | null> {
    console.log("Get subscription:", userId);
    return null;
  }
}

export const userService = new UserService();

import type { UserPreferences } from "./types";

export class UserPreferencesService {
  async getPreferences(
    userId: string,
  ): Promise<UserPreferences | null> {
    console.log("Loading preferences:", userId);
    return null;
  }

  async updatePreferences(
    preferences: UserPreferences,
  ): Promise<void> {
    console.log("Saving preferences:", preferences);
  }

  async resetPreferences(userId: string): Promise<void> {
    console.log("Resetting preferences:", userId);
  }
}

export const userPreferencesService =
  new UserPreferencesService();

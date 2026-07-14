import type { UserProfile } from "./types";

export class UserProfileService {
  async getProfile(userId: string): Promise<UserProfile | null> {
    console.log("Loading profile:", userId);
    return null;
  }

  async updateProfile(profile: UserProfile): Promise<void> {
    console.log("Saving profile:", profile);
  }

  async deleteProfile(userId: string): Promise<void> {
    console.log("Deleting profile:", userId);
  }
}

export const userProfileService = new UserProfileService();

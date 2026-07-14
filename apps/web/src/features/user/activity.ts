export interface UserActivity {
  id: string;
  userId: string;
  action: string;
  resource: string;
  createdAt: Date;
}

export class UserActivityService {
  async getActivities(
    userId: string,
  ): Promise<UserActivity[]> {
    console.log("Loading activities:", userId);
    return [];
  }

  async recordActivity(
    activity: UserActivity,
  ): Promise<void> {
    console.log("Recording activity:", activity);
  }

  async clearActivities(
    userId: string,
  ): Promise<void> {
    console.log("Clearing activities:", userId);
  }
}

export const userActivityService =
  new UserActivityService();

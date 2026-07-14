import type { DashboardActivity } from "./types";

export class DashboardActivityService {
  async getActivities(): Promise<DashboardActivity[]> {
    console.log("Loading dashboard activities");
    return [];
  }

  async recordActivity(
    activity: DashboardActivity,
  ): Promise<void> {
    console.log("Recording dashboard activity:", activity);
  }

  async clearActivities(): Promise<void> {
    console.log("Clearing dashboard activities");
  }
}

export const dashboardActivityService =
  new DashboardActivityService();

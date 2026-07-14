import type { DashboardStats } from "./types";

export class DashboardAnalytics {
  async getAnalytics(): Promise<DashboardStats | null> {
    console.log("Loading dashboard analytics");
    return null;
  }

  async refreshAnalytics(): Promise<void> {
    console.log("Refreshing dashboard analytics");
  }
}

export const dashboardAnalytics = new DashboardAnalytics();

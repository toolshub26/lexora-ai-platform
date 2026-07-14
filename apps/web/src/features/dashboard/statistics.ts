import type { DashboardStats } from "./types";

export class DashboardStatistics {
  async getStatistics(): Promise<DashboardStats | null> {
    console.log("Loading dashboard statistics");
    return null;
  }

  async refreshStatistics(): Promise<void> {
    console.log("Refreshing dashboard statistics");
  }
}

export const dashboardStatistics = new DashboardStatistics();

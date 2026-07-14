import type { DashboardStats } from "./types";

export class DashboardOverviewService {
  async getOverview(): Promise<DashboardStats | null> {
    console.log("Loading dashboard overview");
    return null;
  }

  async refreshOverview(): Promise<void> {
    console.log("Refreshing dashboard overview");
  }
}

export const dashboardOverviewService =
  new DashboardOverviewService();

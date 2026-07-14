import type {
  DashboardActivity,
  DashboardNotification,
  DashboardStats,
  DashboardWidget,
} from "./types";

export class DashboardService {
  async getStats(): Promise<DashboardStats | null> {
    console.log("Loading dashboard stats");
    return null;
  }

  async getWidgets(): Promise<DashboardWidget[]> {
    console.log("Loading dashboard widgets");
    return [];
  }

  async getActivities(): Promise<DashboardActivity[]> {
    console.log("Loading dashboard activities");
    return [];
  }

  async getNotifications(): Promise<DashboardNotification[]> {
    console.log("Loading dashboard notifications");
    return [];
  }

  async refreshDashboard(): Promise<void> {
    console.log("Refreshing dashboard");
  }
}

export const dashboardService = new DashboardService();

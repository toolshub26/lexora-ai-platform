import type { DashboardNotification } from "./types";

export class DashboardNotificationService {
  async getNotifications(): Promise<DashboardNotification[]> {
    console.log("Loading dashboard notifications");
    return [];
  }

  async markAsRead(
    notificationId: string,
  ): Promise<void> {
    console.log("Mark notification as read:", notificationId);
  }

  async markAllAsRead(): Promise<void> {
    console.log("Mark all notifications as read");
  }

  async deleteNotification(
    notificationId: string,
  ): Promise<void> {
    console.log("Delete notification:", notificationId);
  }
}

export const dashboardNotificationService =
  new DashboardNotificationService();

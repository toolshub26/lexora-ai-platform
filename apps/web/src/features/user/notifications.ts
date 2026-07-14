export interface UserNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
  createdAt: Date;
}

export class UserNotificationService {
  async getNotifications(
    userId: string,
  ): Promise<UserNotification[]> {
    console.log("Loading notifications:", userId);
    return [];
  }

  async markAsRead(
    notificationId: string,
  ): Promise<void> {
    console.log("Mark as read:", notificationId);
  }

  async markAllAsRead(
    userId: string,
  ): Promise<void> {
    console.log("Mark all as read:", userId);
  }
}

export const userNotificationService =
  new UserNotificationService();

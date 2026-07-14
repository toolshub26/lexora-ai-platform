export interface DashboardStats {
  totalUsers: number;
  activeUsers: number;
  totalDocuments: number;
  totalRevenue: number;
}

export interface DashboardWidget {
  id: string;
  title: string;
  enabled: boolean;
  order: number;
}

export interface DashboardActivity {
  id: string;
  title: string;
  description: string;
  createdAt: Date;
}

export interface DashboardNotification {
  id: string;
  title: string;
  message: string;
  read: boolean;
}

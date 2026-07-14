export interface DashboardReport {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

export class DashboardReportService {
  async getReports(): Promise<DashboardReport[]> {
    console.log("Loading dashboard reports");
    return [];
  }

  async generateReport(
    reportId: string,
  ): Promise<DashboardReport | null> {
    console.log("Generating report:", reportId);
    return null;
  }

  async deleteReport(
    reportId: string,
  ): Promise<void> {
    console.log("Deleting report:", reportId);
  }
}

export const dashboardReportService =
  new DashboardReportService();

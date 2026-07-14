import type { DashboardWidget } from "./types";

export class DashboardWidgetService {
  async getWidgets(): Promise<DashboardWidget[]> {
    console.log("Loading dashboard widgets");
    return [];
  }

  async saveWidgetOrder(
    widgets: DashboardWidget[],
  ): Promise<void> {
    console.log("Saving widget order:", widgets);
  }

  async enableWidget(
    widgetId: string,
  ): Promise<void> {
    console.log("Enable widget:", widgetId);
  }

  async disableWidget(
    widgetId: string,
  ): Promise<void> {
    console.log("Disable widget:", widgetId);
  }
}

export const dashboardWidgetService =
  new DashboardWidgetService();

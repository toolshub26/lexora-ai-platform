export interface MetricEntry {
  name: string;
  value: number;
  timestamp: number;
}

export class MetricsCollector {
  private readonly metrics: MetricEntry[] = [];

  record(name: string, value: number): void {
    this.metrics.push({
      name,
      value,
      timestamp: Date.now(),
    });
  }

  getAll(): MetricEntry[] {
    return [...this.metrics];
  }

  clear(): void {
    this.metrics.length = 0;
  }
}

export const metricsCollector = new MetricsCollector();

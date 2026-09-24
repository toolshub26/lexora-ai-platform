import {
  collection,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  serverTimestamp,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import type { MatterSummary } from "@/features/matters/types";
import type { ContractSummary } from "@/features/contracts/types";
import type { ComplianceItem, ComplianceSummary } from "@/features/compliance/types";
import type { Document } from "@/features/documents/types";


import { documentService } from "@/features/documents/service";
import { matterService } from "@/features/matters/service";
import { contractService } from "@/features/contracts/service";
import { complianceService } from "@/features/compliance/service";

export interface ReportSummary {
  totalMatters: number;
  activeMatters: number;
  totalContracts: number;
  activeContracts: number;
  totalDocuments: number;
  totalComplianceItems: number;
  upcomingDeadlines: number;
  aiRequestsLast30Days: number;
}

export interface OrganizationReport {
  organizationId: string;
  generatedAt: Date;
  period: { start: Date; end: Date };
  summary: ReportSummary;
  matters: MatterSummary[];
  contracts: ContractSummary[];
  compliance: ComplianceSummary[];
  topKeywords: string[];
}

export class ReportsService {
  async generateOrganizationReport(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<OrganizationReport> {
    const [
      matters,
      contracts,
      complianceItems,
      documents,
    ] = await Promise.all([
      matterService.getMatters(organizationId),
      contractService.getContracts(organizationId),
      complianceService.getItems(organizationId),
      documentService.getDocuments(organizationId),
    ]);

    const matterSummaries = matters.map(
      (m): MatterSummary => ({
        id: m.id,
        title: m.title,
        status: m.status,
        organizationId: m.organizationId,
        caseNumber: m.caseNumber,
        clientName: m.clientName,
        createdAt: m.createdAt,
      }),
    );

    const contractSummaries = contracts.map(
      (c): ContractSummary => ({
        id: c.id,
        title: c.title,
        status: c.status,
        counterpartyName: c.counterpartyName,
        createdAt: c.createdAt,
      }),
    );

    const complianceSummaries = complianceItems.map(
      (c): ComplianceSummary => ({
        id: c.id,
        title: c.title,
        status: c.status,
        deadline: c.deadline,
        category: c.category,
      }),
    );

    const aiRequestsLast30Days = await this.countAiRequests(organizationId, startDate, endDate);

    const upcomingDeadlines = this.countUpcomingDeadlines(complianceItems);

    const topKeywords = this.extractTopKeywords(documents);

    return {
      organizationId,
      generatedAt: new Date(),
      period: { start: startDate, end: endDate },
      summary: {
        totalMatters: matterSummaries.length,
        activeMatters: matterSummaries.filter(
          (m) => m.status === "open",
        ).length,
        totalContracts: contractSummaries.length,
        activeContracts: contractSummaries.filter(
          (c) => c.status === "executed",
        ).length,
        totalDocuments: documents.length,
        totalComplianceItems: complianceItems.length,
        upcomingDeadlines,
        aiRequestsLast30Days,
      },
      matters: matterSummaries,
      contracts: contractSummaries,
      compliance: complianceSummaries,
      topKeywords,
    };
  }

  private async countAiRequests(
    organizationId: string,
    startDate: Date,
    endDate: Date,
  ): Promise<number> {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const snapshot = await getDocs(
      query(
        collection(db, "ai_logs"),
        where("organizationId", "==", organizationId),
        where("createdAt", ">=", sixtyDaysAgo),
        where("createdAt", "<=", now),
      ),
    );

    return snapshot.size;
  }

  private countUpcomingDeadlines(complianceItems: ComplianceItem[]): number {
    const now = new Date();
    const thirtyDaysFromNow = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);
    return complianceItems.filter(
      (item) =>
        item.deadline &&
        item.deadline instanceof Date &&
        item.deadline <= thirtyDaysFromNow &&
        item.deadline >= now &&
        item.status !== "completed",
    ).length;
  }

  private extractTopKeywords(documents: Document[]): string[] {
    const wordFrequency = new Map<string, number>();

    documents.forEach((doc) => {
      const words = (doc.title + " " + (doc.summary || "")).toLowerCase().split(/\s+/);
      words.forEach((word) => {
        const cleaned = word.replace(/[^\w]/g, "");
        if (cleaned.length > 3) {
          wordFrequency.set(
            cleaned,
            (wordFrequency.get(cleaned) || 0) + 1,
          );
        }
      });
    });

    return Array.from(wordFrequency.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map((entry) => entry[0]);
  }
}

export const reportsService = new ReportsService();
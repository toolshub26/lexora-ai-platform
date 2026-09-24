import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";
import type { ComplianceItem, ComplianceSummary } from "./types";

const COLLECTION = "compliance";

function complianceCollection(organizationId: string) {
  return collection(db, "organizations", organizationId, COLLECTION);
}

function complianceDocument(organizationId: string, itemId: string) {
  return doc(
    db,
    "organizations",
    organizationId,
    COLLECTION,
    itemId,
  );
}

export class ComplianceService {
  async create(
    data: Omit<ComplianceItem, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const ref = await addDoc(complianceCollection(data.organizationId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return ref.id;
  }

  async getItems(
    organizationId: string,
  ): Promise<ComplianceItem[]> {
    const snapshot = await getDocs(
      query(
        complianceCollection(organizationId),
        orderBy("deadline", "asc"),
      ),
    );

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<ComplianceItem, "id">),
    }));
  }

  async getItem(
    organizationId: string,
    itemId: string,
  ): Promise<ComplianceItem | null> {
    const snapshot = await getDoc(
      complianceDocument(organizationId, itemId),
    );

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<ComplianceItem, "id">),
    };
  }

  async update(
    organizationId: string,
    itemId: string,
    values: Partial<Omit<ComplianceItem, "id" | "organizationId">>,
  ): Promise<void> {
    await updateDoc(
      complianceDocument(organizationId, itemId),
      {
        ...values,
        updatedAt: serverTimestamp(),
      },
    );
  }

  async remove(
    organizationId: string,
    itemId: string,
  ): Promise<void> {
    await deleteDoc(
      complianceDocument(organizationId, itemId),
    );
  }

  async getSummary(
    organizationId: string,
    itemId: string,
  ): Promise<ComplianceSummary | null> {
    const item = await this.getItem(organizationId, itemId);

    if (!item) return null;

    return {
      id: item.id,
      title: item.title,
      status: item.status,
      deadline: item.deadline,
      category: item.category,
    };
  }
}

export const complianceService = new ComplianceService();

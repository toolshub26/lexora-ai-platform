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
import type { Matter, MatterSummary } from "./types";

const COLLECTION = "matters";

function mattersCollection(organizationId: string) {
  return collection(db, "organizations", organizationId, COLLECTION);
}

function matterDocument(organizationId: string, matterId: string) {
  return doc(
    db,
    "organizations",
    organizationId,
    COLLECTION,
    matterId,
  );
}

export class MatterService {
  async create(
    data: Omit<Matter, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const ref = await addDoc(mattersCollection(data.organizationId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return ref.id;
  }

  async getMatters(
    organizationId: string,
  ): Promise<Matter[]> {
    const snapshot = await getDocs(
      query(
        mattersCollection(organizationId),
        orderBy("updatedAt", "desc"),
      ),
    );

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Matter, "id">),
    }));
  }

  async getMatter(
    organizationId: string,
    matterId: string,
  ): Promise<Matter | null> {
    const snapshot = await getDoc(
      matterDocument(organizationId, matterId),
    );

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Matter, "id">),
    };
  }

  async update(
    organizationId: string,
    matterId: string,
    values: Partial<Omit<Matter, "id" | "organizationId">>,
  ): Promise<void> {
    await updateDoc(
      matterDocument(organizationId, matterId),
      {
        ...values,
        updatedAt: serverTimestamp(),
      },
    );
  }

  async remove(
    organizationId: string,
    matterId: string,
  ): Promise<void> {
    await deleteDoc(
      matterDocument(organizationId, matterId),
    );
  }

  async getMatterSummary(
    organizationId: string,
    matterId: string,
  ): Promise<MatterSummary | null> {
    const matter = await this.getMatter(
      organizationId,
      matterId,
    );

    if (!matter) return null;

    return {
      id: matter.id,
      title: matter.title,
      status: matter.status,
      organizationId: matter.organizationId,
      caseNumber: matter.caseNumber,
      clientName: matter.clientName,
      createdAt: matter.createdAt,
    };
  }
}

export const matterService = new MatterService();

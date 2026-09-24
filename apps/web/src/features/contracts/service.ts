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
import type { Contract, ContractSummary } from "./types";

const COLLECTION = "contracts";

function contractsCollection(organizationId: string) {
  return collection(db, "organizations", organizationId, COLLECTION);
}

function contractDocument(organizationId: string, contractId: string) {
  return doc(
    db,
    "organizations",
    organizationId,
    COLLECTION,
    contractId,
  );
}

export class ContractService {
  async create(
    data: Omit<Contract, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const ref = await addDoc(contractsCollection(data.organizationId), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return ref.id;
  }

  async getContracts(
    organizationId: string,
  ): Promise<Contract[]> {
    const snapshot = await getDocs(
      query(
        contractsCollection(organizationId),
        orderBy("updatedAt", "desc"),
      ),
    );

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Contract, "id">),
    }));
  }

  async getContract(
    organizationId: string,
    contractId: string,
  ): Promise<Contract | null> {
    const snapshot = await getDoc(
      contractDocument(organizationId, contractId),
    );

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Contract, "id">),
    };
  }

  async update(
    organizationId: string,
    contractId: string,
    values: Partial<Omit<Contract, "id" | "organizationId">>,
  ): Promise<void> {
    await updateDoc(
      contractDocument(organizationId, contractId),
      {
        ...values,
        updatedAt: serverTimestamp(),
      },
    );
  }

  async remove(
    organizationId: string,
    contractId: string,
  ): Promise<void> {
    await deleteDoc(
      contractDocument(organizationId, contractId),
    );
  }

  async getContractSummary(
    organizationId: string,
    contractId: string,
  ): Promise<ContractSummary | null> {
    const contract = await this.getContract(
      organizationId,
      contractId,
    );

    if (!contract) return null;

    return {
      id: contract.id,
      title: contract.title,
      status: contract.status,
      counterpartyName: contract.counterpartyName,
      createdAt: contract.createdAt,
    };
  }
}

export const contractService = new ContractService();

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
  where,
} from "firebase/firestore";

import { db } from "../../lib/firebase";

import type {
  Document,
  DocumentHistory,
  DocumentSearchResult,
  DocumentTemplate,
} from "./types";

const DOCUMENTS = "documents";
const TEMPLATES = "documentTemplates";
const HISTORY = "documentHistory";

export class DocumentService {
  async create(
    data: Omit<Document, "id" | "createdAt" | "updatedAt">,
  ): Promise<string> {
    const ref = await addDoc(collection(db, DOCUMENTS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });

    return ref.id;
  }

  async getDocuments(): Promise<Document[]> {
    const snapshot = await getDocs(
      query(
        collection(db, DOCUMENTS),
        orderBy("updatedAt", "desc"),
      ),
    );

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Document, "id">),
    }));
  }

  async getDocument(
    documentId: string,
  ): Promise<Document | null> {
    const snapshot = await getDoc(doc(db, DOCUMENTS, documentId));

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Document, "id">),
    };
  }

  async update(
    documentId: string,
    values: Partial<Document>,
  ): Promise<void> {
    await updateDoc(doc(db, DOCUMENTS, documentId), {
      ...values,
      updatedAt: serverTimestamp(),
    });
  }

  async remove(documentId: string): Promise<void> {
    await deleteDoc(doc(db, DOCUMENTS, documentId));
  }

  async getTemplates(): Promise<DocumentTemplate[]> {
    const snapshot = await getDocs(collection(db, TEMPLATES));

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<DocumentTemplate, "id">),
    }));
  }

  async search(
    queryText: string,
  ): Promise<DocumentSearchResult[]> {
    const snapshot = await getDocs(
      query(
        collection(db, DOCUMENTS),
        where("title", ">=", queryText),
        where("title", "<=", queryText + "\uf8ff"),
      ),
    );

    return snapshot.docs.map((d) => ({
      id: d.id,
      title: (d.data().title as string) ?? "",
      matchedFields: ["title"],
    }));
  }

  async getHistory(
    documentId: string,
  ): Promise<DocumentHistory[]> {
    const snapshot = await getDocs(
      query(
        collection(db, HISTORY),
        where("documentId", "==", documentId),
        orderBy("createdAt", "desc"),
      ),
    );

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<DocumentHistory, "id">),
    }));
  }
}

export const documentService = new DocumentService();

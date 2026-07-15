import {
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
  setDoc,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import type { Document } from "./types";

const COLLECTION = "documentDrafts";

export class DocumentDraftService {
  async getDrafts(): Promise<Document[]> {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        orderBy("updatedAt", "desc"),
      ),
    );

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...(item.data() as Omit<Document, "id">),
    }));
  }

  async getDraft(
    draftId: string,
  ): Promise<Document | null> {
    const snapshot = await getDoc(
      doc(db, COLLECTION, draftId),
    );

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Document, "id">),
    };
  }

  async saveDraft(
    document: Document,
  ): Promise<void> {
    await setDoc(
      doc(db, COLLECTION, document.id),
      {
        ...document,
        status: "draft",
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  }

  async updateDraft(
    document: Document,
  ): Promise<void> {
    await updateDoc(
      doc(db, COLLECTION, document.id),
      {
        ...document,
        updatedAt: serverTimestamp(),
      },
    );
  }

  async deleteDraft(
    draftId: string,
  ): Promise<void> {
    await deleteDoc(
      doc(db, COLLECTION, draftId),
    );
  }
}

export const documentDraftService =
  new DocumentDraftService();

import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import type { DocumentHistory } from "./types";

const COLLECTION = "documentHistory";

export class DocumentHistoryService {
  async getHistory(
    documentId: string,
  ): Promise<DocumentHistory[]> {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        where("documentId", "==", documentId),
        orderBy("createdAt", "desc"),
      ),
    );

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...(item.data() as Omit<DocumentHistory, "id">),
    }));
  }

  async clearHistory(
    documentId: string,
  ): Promise<void> {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        where("documentId", "==", documentId),
      ),
    );

    await Promise.all(
      snapshot.docs.map((item) =>
        deleteDoc(doc(db, COLLECTION, item.id)),
      ),
    );
  }
}

export const documentHistoryService =
  new DocumentHistoryService();

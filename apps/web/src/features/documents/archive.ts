import {
  collection,
  getDocs,
  query,
  serverTimestamp,
  updateDoc,
  doc,
  where,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import type { Document } from "./types";

const COLLECTION = "documents";

export class DocumentArchiveService {
  async archiveDocument(
    document: Document,
  ): Promise<Document> {
    await updateDoc(
      doc(db, COLLECTION, document.id),
      {
        status: "archived",
        isArchived: true,
        updatedAt: serverTimestamp(),
      },
    );

    return {
      ...document,
      status: "archived",
      isArchived: true,
      updatedAt: new Date(),
    };
  }

  async restoreDocument(
    document: Document,
  ): Promise<Document> {
    await updateDoc(
      doc(db, COLLECTION, document.id),
      {
        status: "draft",
        isArchived: false,
        updatedAt: serverTimestamp(),
      },
    );

    return {
      ...document,
      status: "draft",
      isArchived: false,
      updatedAt: new Date(),
    };
  }

  async getArchivedDocuments(): Promise<Document[]> {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        where("isArchived", "==", true),
      ),
    );

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...(item.data() as Omit<Document, "id">),
    }));
  }
}

export const documentArchiveService =
  new DocumentArchiveService();

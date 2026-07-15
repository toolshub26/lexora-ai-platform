import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  query,
  serverTimestamp,
  setDoc,
  where,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import type { Document } from "./types";

const COLLECTION = "documentShares";

export class DocumentSharingService {
  async shareDocument(
    document: Document,
    email: string,
  ): Promise<void> {
    const id = `${document.id}_${email}`;

    await setDoc(doc(db, COLLECTION, id), {
      documentId: document.id,
      email,
      ownerId: document.ownerId,
      createdAt: serverTimestamp(),
    });
  }

  async revokeAccess(
    documentId: string,
    email: string,
  ): Promise<void> {
    const id = `${documentId}_${email}`;

    await deleteDoc(doc(db, COLLECTION, id));
  }

  async getSharedUsers(
    documentId: string,
  ): Promise<string[]> {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        where("documentId", "==", documentId),
      ),
    );

    return snapshot.docs.map(
      (doc) => doc.data().email as string,
    );
  }
}

export const documentSharingService =
  new DocumentSharingService();

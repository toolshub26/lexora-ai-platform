import {
  collection,
  doc,
  getDoc,
  getDocs,
  orderBy,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import type { DocumentTemplate } from "./types";

const COLLECTION = "documentTemplates";

export class DocumentTemplateService {
  async getTemplates(): Promise<DocumentTemplate[]> {
    const snapshot = await getDocs(
      query(collection(db, COLLECTION), orderBy("name")),
    );

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...(item.data() as Omit<DocumentTemplate, "id">),
    }));
  }

  async getTemplate(
    templateId: string,
  ): Promise<DocumentTemplate | null> {
    const snapshot = await getDoc(
      doc(db, COLLECTION, templateId),
    );

    if (!snapshot.exists()) {
      return null;
    }

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<DocumentTemplate, "id">),
    };
  }

  async searchTemplates(
    search: string,
  ): Promise<DocumentTemplate[]> {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        where("name", ">=", search),
        where("name", "<=", search + "\uf8ff"),
      ),
    );

    return snapshot.docs.map((item) => ({
      id: item.id,
      ...(item.data() as Omit<DocumentTemplate, "id">),
    }));
  }
}

export const documentTemplateService =
  new DocumentTemplateService();

import {
  collection,
  getDocs,
  query,
  where,
} from "firebase/firestore";

import { db } from "../../lib/firebase";
import type { DocumentSearchResult } from "./types";

const COLLECTION = "documents";

export class DocumentSearchService {
  async search(
    searchText: string,
  ): Promise<DocumentSearchResult[]> {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        where("title", ">=", searchText),
        where("title", "<=", searchText + "\uf8ff"),
      ),
    );

    return snapshot.docs.map((item) => {
      const data = item.data();

      return {
        id: item.id,
        title: data.title ?? "",
        type: data.type ?? "",
        status: data.status,
        matchedFields: ["title"],
      };
    });
  }

  async searchByCategory(
    category: string,
  ): Promise<DocumentSearchResult[]> {
    const snapshot = await getDocs(
      query(
        collection(db, COLLECTION),
        where("type", "==", category),
      ),
    );

    return snapshot.docs.map((item) => {
      const data = item.data();

      return {
        id: item.id,
        title: data.title ?? "",
        type: data.type ?? "",
        status: data.status,
        matchedFields: ["type"],
      };
    });
  }
}

export const documentSearchService =
  new DocumentSearchService();

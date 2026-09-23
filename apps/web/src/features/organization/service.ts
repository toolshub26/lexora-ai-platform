import {
  collection,
  collectionGroup,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  type DocumentData,
} from "firebase/firestore";

import { getFunctions, httpsCallable } from "firebase/functions";
import { db, firebaseApp } from "@/lib/firebase";
import type {
  Organization,
  OrganizationContext,
  OrganizationMembership,
  OrganizationSummary,
} from "./types";
import {
  ORGANIZATION_COLLECTION,
  ORGANIZATION_SUBCOLLECTIONS,
} from "./constants";
import { teamService } from "@/features/organization/team-service";
function mapOrganization(
  id: string,
  data: DocumentData,
): Organization {
  return {
    id,
    name: data.name,
    slug: data.slug,
    status: data.status,
    ownerId: data.ownerId,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

function mapMembership(
  userId: string,
  organizationId: string,
  data: DocumentData,
): OrganizationMembership {
  return {
    userId,
    organizationId,
    role: data.role,
    permissions: Array.isArray(data.permissions)
      ? data.permissions
      : [],
    status: data.status,
    invitedAt: data.invitedAt,
    joinedAt: data.joinedAt,
    createdAt: data.createdAt,
    updatedAt: data.updatedAt,
  };
}

export class OrganizationService {
  async createOrganization(
    name: string,
    slug?: string,
  ): Promise<{ success: boolean; organizationId: string; slug: string }> {
    const functions = getFunctions(firebaseApp);
    const callable = httpsCallable<
      { name: string; slug?: string },
      { success: boolean; organizationId: string; slug: string }
    >(functions, "createOrganization");

    const result = await callable({
      name,
      ...(slug?.trim() ? { slug: slug.trim() } : {}),
    });

    return result.data;
  }

  async getOrganization(
    organizationId: string,
  ): Promise<Organization | null> {
    const snapshot = await getDoc(
      doc(db, ORGANIZATION_COLLECTION, organizationId),
    );

    if (!snapshot.exists()) {
      return null;
    }

    return mapOrganization(
      snapshot.id,
      snapshot.data(),
    );
  }

  async getMembership(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationMembership | null> {
    const snapshot = await getDoc(
      doc(
        db,
        ORGANIZATION_COLLECTION,
        organizationId,
        ORGANIZATION_SUBCOLLECTIONS.MEMBERS,
        userId,
      ),
    );

    if (!snapshot.exists()) {
      return null;
    }

    const data = snapshot.data();

    if (data.userId !== userId) {
      return null;
    }

    return mapMembership(
      userId,
      organizationId,
      data,
    );
  }

  async getUserOrganizations(
    userId: string,
  ): Promise<OrganizationSummary[]> {
    const membershipQuery = query(
      collectionGroup(
        db,
        ORGANIZATION_SUBCOLLECTIONS.MEMBERS,
      ),
      where("userId", "==", userId),
      where("status", "==", "active"),
    );

    const membershipSnapshot =
      await getDocs(membershipQuery);

    const organizations = await Promise.all(
      membershipSnapshot.docs.map(async (membershipDoc): Promise<OrganizationSummary | null> => {
        const membershipData = membershipDoc.data();

        const organizationRef =
          membershipDoc.ref.parent.parent;

        if (!organizationRef) {
          return null;
        }

        const organizationSnapshot =
          await getDoc(organizationRef);

        if (!organizationSnapshot.exists()) {
          return null;
        }

        const organization =
          mapOrganization(
            organizationSnapshot.id,
            organizationSnapshot.data(),
          );

        if (organization.status !== "active") {
          return null;
        }

        const membership =
          mapMembership(
            userId,
            organization.id,
            membershipData,
          );

        return {
          id: organization.id,
          name: organization.name,
          slug: organization.slug,
          status: organization.status,
          role: membership.role,
        };
      }),
    );

    return organizations.filter(
      (
        organization,
      ): organization is OrganizationSummary =>
        organization !== null,
    );
  }

  async getOrganizationContext(
    organizationId: string,
    userId: string,
  ): Promise<OrganizationContext | null> {
    const [organization, membership] =
      await Promise.all([
        this.getOrganization(organizationId),
        this.getMembership(
          organizationId,
          userId,
        ),
      ]);

    if (!organization || !membership) {
      return null;
    }

    if (
      organization.status !== "active" ||
      membership.status !== "active"
    ) {
      return null;
    }

    return {
      organization,
      membership,
    };
  }
}

export const organizationService =
  new OrganizationService();

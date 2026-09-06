import {
  ORGANIZATION_COLLECTION,
  ORGANIZATION_SUBCOLLECTIONS,
} from "./constants";

export function organizationPath(organizationId: string): string {
  return `${ORGANIZATION_COLLECTION}/${organizationId}`;
}

export function organizationMembersPath(
  organizationId: string,
): string {
  return `${organizationPath(organizationId)}/${ORGANIZATION_SUBCOLLECTIONS.MEMBERS}`;
}

export function membershipPath(
  organizationId: string,
  userId: string,
): string {
  return `${organizationMembersPath(organizationId)}/${userId}`;
}

export function organizationInvitesPath(
  organizationId: string,
): string {
  return `${organizationPath(organizationId)}/${ORGANIZATION_SUBCOLLECTIONS.INVITES}`;
}

export function organizationInvitePath(
  organizationId: string,
  inviteId: string,
): string {
  return `${organizationInvitesPath(organizationId)}/${inviteId}`;
}

export function organizationCollectionPath(
  organizationId: string,
  collection: keyof typeof ORGANIZATION_SUBCOLLECTIONS,
): string {
  return `${organizationPath(organizationId)}/${ORGANIZATION_SUBCOLLECTIONS[collection]}`;
}

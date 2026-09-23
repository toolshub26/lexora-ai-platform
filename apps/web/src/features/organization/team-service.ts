import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getDoc,
  getDocs,
  query,
  where,
  orderBy,
  serverTimestamp,
  updateDoc,
} from "firebase/firestore";

import { db } from "@/lib/firebase";

import type {
  Team,
  TeamRole,
  TeamStatus,
  TeamMember,
  TeamSummary,
} from "./teams";

const ORG_TEAMS = "teams";
const ORG_MEMBERS = "members";

export class TeamService {
  async createTeam(
    organizationId: string,
    data: Omit<Team, "id" | "createdAt" | "updatedAt" | "memberCount">,
  ): Promise<string> {
    const ref = await addDoc(collection(db, ORG_TEAMS, organizationId, ORG_TEAMS), {
      ...data,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      memberCount: 1,
    });

    return ref.id;
  }

  async getTeams(organizationId: string): Promise<Team[]> {
    const snapshot = await getDocs(
      query(
        collection(db, ORG_TEAMS, organizationId, ORG_TEAMS),
        orderBy("createdAt", "desc"),
      ),
    );

    return snapshot.docs.map((d) => ({
      id: d.id,
      ...(d.data() as Omit<Team, "id">),
    }));
  }

  async getTeam(
    organizationId: string,
    teamId: string,
  ): Promise<Team | null> {
    const snapshot = await getDoc(
      doc(db, ORG_TEAMS, organizationId, ORG_TEAMS, teamId),
    );

    if (!snapshot.exists()) return null;

    return {
      id: snapshot.id,
      ...(snapshot.data() as Omit<Team, "id">),
    };
  }

  async updateTeam(
    organizationId: string,
    teamId: string,
    values: Partial<Team>,
  ): Promise<void> {
    await updateDoc(
      doc(db, ORG_TEAMS, organizationId, ORG_TEAMS, teamId),
      {
        ...values,
        updatedAt: serverTimestamp(),
      },
    );
  }

  async removeTeam(organizationId: string, teamId: string): Promise<void> {
    await deleteDoc(
      doc(db, ORG_TEAMS, organizationId, ORG_TEAMS, teamId),
    );
  }

  async addTeamMember(
    organizationId: string,
    teamId: string,
    data: Omit<TeamMember, "joinedAt" | "invitedBy">,
  ): Promise<string> {
    const ref = await addDoc(
      collection(db, ORG_TEAMS, organizationId, ORG_TEAMS, teamId, "members"),
      {
        ...data,
        joinedAt: serverTimestamp(),
      },
    );

    return ref.id;
  }

  async getTeamMembers(
    organizationId: string,
    teamId: string,
  ): Promise<TeamMember[]> {
    const snapshot = await getDocs(
      query(
        collection(db, ORG_TEAMS, organizationId, ORG_TEAMS, teamId, "members"),
        where("status", "==", "active"),
      ),
    );

    return snapshot.docs.map((d) => ({
      userId: d.data().userId,
      organizationId: d.data().organizationId,
      teamId: d.data().teamId,
      role: d.data().role as TeamRole,
      status: d.data().status as TeamStatus,
      joinedAt: d.data().joinedAt.toDate(),
      invitedBy: d.data().invitedBy,
    }));
  }

  async updateTeamMember(
    organizationId: string,
    teamId: string,
    userId: string,
    values: Partial<TeamMember>,
  ): Promise<void> {
    await updateDoc(
      doc(
        db,
        ORG_TEAMS,
        organizationId,
        ORG_TEAMS,
        teamId,
        "members",
        userId,
      ),
      {
        ...values,
      },
    );
  }

  async removeTeamMember(
    organizationId: string,
    teamId: string,
    userId: string,
  ): Promise<void> {
    await deleteDoc(
      doc(
        db,
        ORG_TEAMS,
        organizationId,
        ORG_TEAMS,
        teamId,
        "members",
        userId,
      ),
    );
  }

  async getTeamSummary(
    organizationId: string,
  ): Promise<TeamSummary[]> {
    const teams = await this.getTeams(organizationId);

    return teams.map((team) => {
      const memberCount = team.memberCount || 1;
      return {
        id: team.id,
        name: team.name,
        role: team.role,
        memberCount,
        status: team.status,
      };
    });
  }
}

export const teamService = new TeamService();
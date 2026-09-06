import { notFound } from "next/navigation";
import WorkspaceShell from "@/components/workspace-shell";
import ModuleWorkspace, {
  type ModuleConfig,
} from "@/components/module-workspace";

const pages: Record<string, ModuleConfig> = {
  "ai-assistant": {
    eyebrow: "AI WORKSPACE",
    title: "AI Assistant",
    description:
      "A controlled workspace for legal questions, research, document analysis and drafting.",
    actions: ["New Session", "History", "Saved"],
    sections: ["Ask Lexora", "Recent Sessions", "Saved Work"],
  },

  "legal-research": {
    eyebrow: "LEGAL INTELLIGENCE",
    title: "Legal Research",
    description:
      "Research legal issues, authorities and precedents from one professional workspace.",
    actions: ["New Research", "Saved Research", "Research History"],
    sections: [
      "Research Workspace",
      "Recent Research",
      "Saved Authorities",
    ],
  },

  drafting: {
    eyebrow: "LEGAL WORK",
    title: "Drafting",
    description:
      "Create, organize and manage legal drafts with AI-assisted workflows.",
    actions: ["New Draft", "Templates", "Draft History"],
    sections: ["Draft Workspace", "Recent Drafts", "Templates"],
  },

  matters: {
    eyebrow: "MATTER MANAGEMENT",
    title: "Matters & Cases",
    description:
      "Centralize matters, cases, clients, documents and activity.",
    actions: ["New Matter", "Import Matter", "View Archive"],
    sections: ["Active Matters", "Recent Activity", "Matter Search"],
  },

  documents: {
    eyebrow: "DOCUMENT INTELLIGENCE",
    title: "Documents",
    description:
      "Centralize, search, review and analyze legal documents.",
    actions: ["Upload Document", "New Folder", "Search"],
    sections: ["Document Repository", "Recent Documents", "Collections"],
  },

  contracts: {
    eyebrow: "CONTRACT MANAGEMENT",
    title: "Contracts",
    description:
      "Manage contractual work, review documents and track contract activity.",
    actions: ["New Contract", "Review Contract", "Contract Search"],
    sections: ["Contract Workspace", "Recent Contracts", "Reviews"],
  },

  compliance: {
    eyebrow: "RISK & COMPLIANCE",
    title: "Compliance",
    description:
      "Organize compliance obligations, controls, evidence and activity.",
    actions: ["New Control", "Add Obligation", "View Reports"],
    sections: ["Compliance Overview", "Controls", "Evidence"],
  },

  analytics: {
    eyebrow: "INTELLIGENCE",
    title: "Analytics",
    description:
      "Understand legal operations, AI usage and organizational activity.",
    actions: ["Usage Analytics", "Matter Analytics", "Export"],
    sections: ["Operational Overview", "AI Usage", "Activity Trends"],
  },

  reports: {
    eyebrow: "REPORTING",
    title: "Reports",
    description:
      "Build and review organization-level legal and operational reports.",
    actions: ["New Report", "Report Templates", "Export"],
    sections: ["Report Center", "Recent Reports", "Scheduled Reports"],
  },

  users: {
    eyebrow: "ORGANIZATION",
    title: "Users & Teams",
    description:
      "Manage organization membership, teams, roles and permissions.",
    actions: ["Invite User", "Create Team", "Roles & Permissions"],
    sections: ["Users", "Teams", "Access Control"],
  },

  settings: {
    eyebrow: "ADMINISTRATION",
    title: "Settings",
    description:
      "Configure organization, security, integrations and platform controls.",
    actions: ["Organization", "Security", "Integrations"],
    sections: [
      "Organization Settings",
      "Security Controls",
      "Integrations",
    ],
  },
};

export default async function ModulePage({
  params,
}: {
  params: Promise<{ module: string }>;
}) {
  const { module } = await params;
  const page = pages[module];

  if (!page) {
    notFound();
  }

  return (
    <WorkspaceShell>
      <ModuleWorkspace config={page} />
    </WorkspaceShell>
  );
}

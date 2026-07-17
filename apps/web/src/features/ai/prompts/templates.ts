export interface PromptTemplate {
  id: string;
  title: string;
  template: string;
}

export const PROMPT_TEMPLATES: PromptTemplate[] = [
  {
    id: "legal-advice",
    title: "Legal Advice",
    template:
      "Provide legal guidance about the following issue:\n\n{{input}}",
  },
  {
    id: "affidavit",
    title: "Affidavit Draft",
    template:
      "Draft a legally structured affidavit using the following information:\n\n{{input}}",
  },
  {
    id: "contract-review",
    title: "Contract Review",
    template:
      "Review the following contract and identify important clauses, risks, and recommendations:\n\n{{input}}",
  },
  {
    id: "legal-research",
    title: "Legal Research",
    template:
      "Research the following legal topic and summarize the relevant principles:\n\n{{input}}",
  },
];

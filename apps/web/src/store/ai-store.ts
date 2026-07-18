export interface AIStore {
  provider: string;
  model: string;
  loading: boolean;
}

export const defaultAIStore: AIStore = {
  provider: "openai",
  model: "gpt-4o",
  loading: false,
};

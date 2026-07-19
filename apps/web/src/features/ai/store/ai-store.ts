import type { AIProvider } from "../types/provider";

export interface AIState {
  provider: AIProvider;
  loading: boolean;
  model: string;
  initialized: boolean;
}

class AIStore {
  private state: AIState = {
    provider: "openai",
    loading: false,
    model: "gpt-4.1",
    initialized: false,
  };

  getState(): Readonly<AIState> {
    return this.state;
  }

  initialize(): void {
    this.state.initialized = true;
  }

  setProvider(provider: AIProvider): void {
    this.state.provider = provider;
  }

  setModel(model: string): void {
    this.state.model = model;
  }

  setLoading(loading: boolean): void {
    this.state.loading = loading;
  }

  reset(): void {
    this.state = {
      provider: "openai",
      loading: false,
      model: "gpt-4.1",
      initialized: false,
    };
  }
}

export const aiStore = new AIStore();

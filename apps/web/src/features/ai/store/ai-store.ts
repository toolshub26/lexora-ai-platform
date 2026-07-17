import { AIProvider } from "../types/provider";

export interface AIState {
  provider: AIProvider;
  loading: boolean;
}

class AIStore {
  private state: AIState = {
    provider: "openai",
    loading: false,
  };

  getState(): AIState {
    return this.state;
  }

  setProvider(provider: AIProvider): void {
    this.state.provider = provider;
  }

  setLoading(loading: boolean): void {
    this.state.loading = loading;
  }
}

export const aiStore = new AIStore();

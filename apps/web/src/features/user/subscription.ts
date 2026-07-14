import type { UserSubscription } from "./types";

export class UserSubscriptionService {
  async getSubscription(
    userId: string,
  ): Promise<UserSubscription | null> {
    console.log("Loading subscription:", userId);
    return null;
  }

  async activateSubscription(
    subscription: UserSubscription,
  ): Promise<void> {
    console.log("Activating subscription:", subscription);
  }

  async cancelSubscription(
    userId: string,
  ): Promise<void> {
    console.log("Cancelling subscription:", userId);
  }

  async renewSubscription(
    userId: string,
  ): Promise<void> {
    console.log("Renewing subscription:", userId);
  }
}

export const userSubscriptionService =
  new UserSubscriptionService();

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  photoURL?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserPreferences {
  language: string;
  theme: "light" | "dark" | "system";
  notifications: boolean;
}

export interface UserSubscription {
  plan: "free" | "pro" | "enterprise";
  status: "active" | "inactive" | "expired";
}

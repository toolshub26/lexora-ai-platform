import { getFunctions, httpsCallable } from "firebase/functions";

import { firebaseApp } from "@/lib/firebase";

const functions = getFunctions(firebaseApp);

interface AskAIRequest {
  prompt: string;
}

interface AskAIResponse {
  success: boolean;
  response: string;
  error?: string | null;
}

export class ChatService {
  async sendMessage(message: string): Promise<string> {
    const callable = httpsCallable<AskAIRequest, AskAIResponse>(
      functions,
      "askAI",
    );

    try {
      const result = await callable({
        prompt: message,
      });

      if (!result.data.success) {
        return result.data.error ?? "Unable to generate AI response at this time.";
      }

      return result.data.response || "No response from AI.";
    } catch (error) {
      console.error("Chat service error:", error);
      return "Unable to generate AI response at this time.";
    }
  }
}

export const chatService = new ChatService();

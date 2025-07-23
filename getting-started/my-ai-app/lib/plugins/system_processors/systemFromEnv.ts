import { SystemProcessor,SystemMessage } from "../types";

export const SystemService: SystemProcessor = {
  processSystem(): SystemMessage {
    const systemMessage = process.env.SYSTEM_MESSAGE?.trim() || 
      "You are an intelligent assistant that provides helpful responses to user queries.";

    return { systemMessage };
  }
}
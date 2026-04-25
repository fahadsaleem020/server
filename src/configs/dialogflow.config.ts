import { env } from "@/utils/env.util";
import * as dialogflow from "@google-cloud/dialogflow";

// 1. Configuration using Environment Variables (No local file needed)
const CONFIG = {
  projectId: "testing-9hqa",
  credentials: {
    client_email: env.GOOGLE_CLIENT_EMAIL,
    private_key: env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
  },
};

// 2. Initialize the Dialogflow Sessions Client with the CONFIG object
const sessionClient = new dialogflow.SessionsClient(CONFIG);

// 3. The exported helper function
export const askDialogflow = async (userText: string, sessionId: string): Promise<string> => {
  const sessionPath = sessionClient.projectAgentSessionPath(CONFIG.projectId, sessionId);

  const request: dialogflow.protos.google.cloud.dialogflow.v2.IDetectIntentRequest = {
    session: sessionPath,
    queryInput: {
      text: {
        text: userText,
        languageCode: "en-US",
      },
    },
  };

  try {
    const [response] = await sessionClient.detectIntent(request);
    const result = response.queryResult;
    return result?.fulfillmentText || "I understand the intent, but no response was defined.";
  } catch (error) {
    console.error("Dialogflow Error:", error);
    return "Sorry, I'm having trouble connecting to my brain right now.";
  }
};

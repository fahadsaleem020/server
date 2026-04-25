import * as dialogflow from "@google-cloud/dialogflow";
import path from "node:path";

// 1. Define paths and configuration.

const PROJECT_ID = "testing-9hqa"; // Replace with your actual Project ID from Dialogflow
const KEY_FILENAME = "esflow-key.json";
const KEY_PATH = path.join(process.cwd(), KEY_FILENAME);

const CONFIG = {
  projectId: PROJECT_ID,
  keyFilename: KEY_PATH,
};

// 2. Initialize the Dialogflow Sessions Client
const sessionClient = new dialogflow.SessionsClient(CONFIG);

// 3. The exported helper function for your backend
export const askDialogflow = async (userText: string, sessionId: string): Promise<string> => {
  // Create the session path: projects/PROJECT_ID/agent/sessions/SESSION_ID
  const sessionPath = sessionClient.projectAgentSessionPath(CONFIG.projectId, sessionId);

  // Prepare the request object with explicit types
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
    // Send request and destructure the first response from the array
    const [response] = await sessionClient.detectIntent(request);
    const result = response.queryResult;

    // Return the fulfillment text or a fallback message
    return result?.fulfillmentText || "I understand the intent, but no response was defined.";
  } catch (error) {
    console.error("Dialogflow Error:", error);
    return "Sorry, I'm having trouble connecting to my brain right now.";
  }
};

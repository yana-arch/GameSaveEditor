import { AiConfig, GenerativeModel } from "../types";

// --- Provider Implementations ---

// Using REST API directly for better browser compatibility
function createGeminiModel(config: AiConfig): GenerativeModel {
  if (!config.apiKey) {
    throw new Error("Gemini API key is missing in the configuration.");
  }

  return {
    async generateContent(prompt: string) {
      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${config.modelId}:generateContent?key=${config.apiKey}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }]
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(`${response.status}: ${error.error?.message || 'Unknown error'}`);
      }

      const data = await response.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text;

      if (!text) {
        throw new Error("No response text received from Gemini API");
      }

      return { text };
    },
  };
}

interface OpenAiChatCompletionResponse {
  choices: {
    message: {
      content: string;
    };
  }[];
}

function createOpenAICompatibleModel(
  config: AiConfig,
  defaultBaseURL: string,
  extraHeaders: Record<string, string> = {}
): GenerativeModel {
  const { apiKey, modelId, baseURL } = config;

  const finalBaseURL = baseURL || defaultBaseURL;

  if (!apiKey) {
    throw new Error("API key is missing in the configuration.");
  }

  return {
    async generateContent(prompt: string) {
      const response = await fetch(`${finalBaseURL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
          ...extraHeaders,
        },
        body: JSON.stringify({
          model: modelId,
          messages: [{ role: "user", content: prompt }],
          stream: false,
        }),
      });

      if (!response.ok) {
        let errorBody = 'Could not read error response.';
        try {
            const errorJson = await response.json();
            errorBody = errorJson.error?.message || JSON.stringify(errorJson);
        } catch (e) {
            errorBody = await response.text();
        }
        throw new Error(
          `API request failed with status ${response.status}: ${errorBody}`
        );
      }

      const data: OpenAiChatCompletionResponse = await response.json();
      const text = data.choices?.[0]?.message?.content ?? "";
      if (!text) {
        throw new Error("Received an empty or invalid response from the API.");
      }
      return { text };
    },
  };
}


// --- Model Factory ---

const OPENAI_DEFAULT_BASE_URL = "https://api.openai.com/v1";
const OPENROUTER_DEFAULT_BASE_URL = "https://openrouter.ai/api/v1";

export function getGenerativeModel(
  config: AiConfig
): GenerativeModel {
  switch (config.provider) {
    case "gemini":
      return createGeminiModel(config);
    case "openai":
      return createOpenAICompatibleModel(config, OPENAI_DEFAULT_BASE_URL);
    case "openrouter":
      return createOpenAICompatibleModel(config, OPENROUTER_DEFAULT_BASE_URL, {
        "HTTP-Referer": `https://gamesave.studio`, // Required by OpenRouter
        "X-Title": `GameSave Studio`, // Optional, but good practice
      });
    case "custom":
       if (!config.baseURL) {
        throw new Error("Custom provider requires a Base URL.");
      }
      return createOpenAICompatibleModel(config, config.baseURL);
    default:
      // This should be unreachable if types are correct
      const exhaustiveCheck: never = config.provider;
      throw new Error(`Unsupported provider: ${exhaustiveCheck}`);
  }
}

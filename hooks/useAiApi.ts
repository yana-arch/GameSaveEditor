import { useState, useCallback } from "react";
import { useAiConfig } from "../context/AiConfigContext";
import { getGenerativeModel } from "../services/ai";

export function useAiApi() {
  const { activeConfig } = useAiConfig();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [response, setResponse] = useState<string | null>(null);

  const generate = useCallback(
    async (prompt: string) => {
      if (!prompt) return;

      setLoading(true);
      setError(null);
      setResponse(null);

      if (!activeConfig) {
          setError("No active AI configuration found. Please select or add one in the 'All Data' tab.");
          setLoading(false);
          return;
      }

      try {
        const model = getGenerativeModel(activeConfig);
        const result = await model.generateContent(prompt);
        setResponse(result.text);
      } catch (e: any) {
        console.error(e);
        setError(`An error occurred: ${e.message || 'Please check the console for details.'}`);
      } finally {
        setLoading(false);
      }
    },
    [activeConfig]
  );

  return { generate, loading, error, response };
}

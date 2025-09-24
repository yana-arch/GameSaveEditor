import { GoogleGenAI } from "@google/genai";
import React, { useState, useCallback } from 'react';
import type { RpgData } from '../../types';

// A simple markdown-to-html converter for basic formatting
const SimpleMarkdown: React.FC<{ text: string }> = ({ text }) => {
    const html = text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') // Bold
      .replace(/\*(.*?)\*/g, '<em>$1</em>')     // Italics
      .replace(/`(.*?)`/g, '<code class="bg-gray-800 text-yellow-300 px-1 py-0.5 rounded">$1</code>')       // Inline code
      .replace(/\n/g, '<br />');                   // Newlines
  
    return <div dangerouslySetInnerHTML={{ __html: html }} />;
};

interface GeminiHelperProps {
  rpgData: RpgData;
  apiKey?: string;
}

const GeminiHelper: React.FC<GeminiHelperProps> = ({ rpgData, apiKey: apiKeyProp }) => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const generateDefaultPrompt = useCallback(() => {
    let context = "Here is the current state of my RPG game save data:\n\n";
    if (rpgData.characters && rpgData.characters.length > 0) {
      context += `Characters:\n${rpgData.characters.map(c => `- ${c.name} (Lvl ${c.level}, HP ${c.hp})`).join('\n')}\n\n`;
    }
    if (rpgData.gold) {
      context += `Gold: ${rpgData.gold}\n\n`;
    }
    context += "Based on this, suggest some interesting things I could try to do next in the game, or powerful character builds I could aim for.";
    setPrompt(context);
  }, [rpgData]);

  const handleGenerate = async () => {
    if (!prompt || loading) return;

    setLoading(true);
    setError(null);
    setResponse('');

    try {
      const apiKey = apiKeyProp || (typeof process !== 'undefined' && process.env ? process.env.API_KEY : undefined);

      if (!apiKey) {
        throw new Error("Gemini API key not found. Please add it in the 'All Data' tab to use this feature.");
      }
      const ai = new GoogleGenAI({ apiKey });
      const result = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
      });

      setResponse(result.text);

    } catch (e: any) {
      console.error(e);
      setError(`An error occurred: ${e.message || 'Please check the console for details.'}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4 text-gray-200">
      <h3 className="text-xl font-semibold text-white">Gemini Game Helper</h3>
      <p className="text-gray-400">
        Need ideas? Ask the AI for suggestions on character builds, quest ideas, or what to do next based on your current save data.
      </p>
      
      <div>
        <label htmlFor="gemini-prompt" className="block text-sm font-medium text-gray-300 mb-2">
          Your Request
        </label>
        <textarea
          id="gemini-prompt"
          rows={8}
          className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-200"
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="e.g., 'Suggest a good build for my character named...' or click below to generate a default prompt."
        />
         <button
            onClick={generateDefaultPrompt}
            className="mt-2 text-sm text-blue-400 hover:text-blue-300 transition-colors"
        >
            Generate a prompt based on my save data
        </button>
      </div>

      <button
        onClick={handleGenerate}
        disabled={loading || !prompt}
        className="w-full flex justify-center items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors disabled:bg-gray-500 disabled:cursor-not-allowed"
      >
        {loading ? (
          <>
            <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Thinking...
          </>
        ) : (
          'Get Suggestions'
        )}
      </button>

      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-md">
          <p>{error}</p>
        </div>
      )}

      {response && (
        <div className="bg-gray-700/50 p-4 rounded-lg space-y-3">
           <h4 className="text-lg font-semibold text-white">AI Suggestion:</h4>
           <div className="text-gray-300 leading-relaxed">
             <SimpleMarkdown text={response} />
           </div>
        </div>
      )}
    </div>
  );
};

export default GeminiHelper;
import { ProviderName } from './types';

export const PROVIDERS: { 
    id: ProviderName; 
    name: string; 
    requiresBaseURL: boolean; 
    defaultModel: string;
    notes?: string;
}[] = [
    { 
        id: 'gemini', 
        name: 'Google Gemini', 
        requiresBaseURL: false, 
        defaultModel: 'gemini-2.5-flash',
    },
    {
        id: 'openai',
        name: 'OpenAI',
        requiresBaseURL: false, // Can be overridden in config
        defaultModel: 'gpt-4o-mini',
    },
    {
        id: 'openrouter',
        name: 'OpenRouter',
        requiresBaseURL: false, // Uses a default, but can be overridden
        defaultModel: 'google/gemini-flash-1.5',
        notes: 'Uses the OpenAI-compatible API format. You may need to set your model ID to include the provider, e.g., "google/gemini-flash-1.5".'
    },
    { 
        id: 'custom', 
        name: 'Custom Endpoint (OpenAI format)', 
        requiresBaseURL: true, 
        defaultModel: 'user-defined-model',
    },
];
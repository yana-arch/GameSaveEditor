import { ProviderName } from './types';

export const PROVIDERS: { 
    id: ProviderName; 
    name: string; 
    requiresBaseURL: boolean; 
    defaultModel: string; 
}[] = [
    { 
        id: 'gemini', 
        name: 'Google Gemini', 
        requiresBaseURL: false, 
        defaultModel: 'gemini-2.5-flash' 
    },
    { 
        id: 'custom', 
        name: 'Custom Endpoint (OpenAI format)', 
        requiresBaseURL: true, 
        defaultModel: 'user-defined-model' 
    },
    // Future providers like 'openai', 'anthropic' can be added here
];
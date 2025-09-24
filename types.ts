export enum GameType {
  RPG = 'RPG',
  RPG_MAKER_MV = 'RPG_MAKER_MV',
  VISUAL_NOVEL = 'VISUAL_NOVEL',
  UNKNOWN = 'UNKNOWN',
}

export enum SaveFileFormat {
  JSON = 'JSON',
  BASE64_JSON = 'BASE64_JSON',
  LZ_STRING_BASE64_JSON = 'LZ_STRING_BASE64_JSON',
  LZ_STRING_RAW_JSON = 'LZ_STRING_RAW_JSON',
  ZLIB_JSON = 'ZLIB_JSON',
  BASE64_ZLIB_JSON = 'BASE64_ZLIB_JSON',
  MESSAGEPACK_JSON = 'MESSAGEPACK_JSON',
}

export interface GameSave {
  file: File;
  type: GameType;
  data: any;
}

// FIX: Added missing type definitions for RPG and Visual Novel editors.
export interface RpgCharacter {
  id: number | string;
  name: string;
  level: number;
  hp: number;
  mp: number;
  strength: number;
  agility: number;
  intelligence: number;
}

export interface InventoryItem {
  id: number | string;
  name: string;
  quantity: number;
}

export interface Skill {
  id: number | string;
  name: string;
  description: string;
  learned: boolean;
}

export interface RpgData {
  characters?: RpgCharacter[];
  inventory?: InventoryItem[];
  skills?: Skill[];
  gold?: number;
}

export interface StoryFlag {
  id: string;
  description: string;
  isSet: boolean;
}

export interface VnData {
  playerName?: string;
  currentSceneId?: string;
  loveInterestPoints?: { [characterName: string]: number };
  storyFlags?: StoryFlag[];
}

// --- API Management System Types ---

export type ProviderName = 'gemini' | 'custom'; // Expandable to 'openai', 'anthropic', etc.

export interface AiConfig {
  id: string;             // uuid
  name: string;           // Display name for the configuration
  provider: ProviderName;   // The AI provider
  baseURL?: string;       // Required only for 'custom' provider
  apiKey?: string;        // The API key for the provider
  modelId: string;        // e.g., 'gemini-2.5-flash', 'gpt-4o-mini'
}
export enum GameType {
  RPG = 'RPG',
  RPG_MAKER_MV = 'RPG_MAKER_MV',
  VISUAL_NOVEL = 'VISUAL_NOVEL',
  UNKNOWN = 'UNKNOWN',
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

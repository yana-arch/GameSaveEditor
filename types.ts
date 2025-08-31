
export enum GameType {
  RPG = 'RPG',
  VISUAL_NOVEL = 'VISUAL_NOVEL',
  UNKNOWN = 'UNKNOWN',
}

export interface GameSave {
  file: File;
  type: GameType;
  data: any;
}

// RPG Data Structures
export interface RpgCharacter {
  id: number;
  name: string;
  level: number;
  hp: number;
  maxHp: number;
  mp: number;
  maxMp: number;
  strength: number;
  agility: number;
  intelligence: number;
}

export interface InventoryItem {
  id: number;
  name: string;
  quantity: number;
}

export interface Skill {
  id: number;
  name: string;
  description: string;
  learned: boolean;
}

export interface RpgData {
  characters: RpgCharacter[];
  inventory: InventoryItem[];
  skills: Skill[];
  gold: number;
}

// Visual Novel Data Structures
export interface StoryFlag {
  id: string;
  description: string;
  isSet: boolean;
}

export interface VnData {
  currentSceneId: string;
  playerName: string;
  loveInterestPoints: { [key: string]: number };
  storyFlags: StoryFlag[];
}

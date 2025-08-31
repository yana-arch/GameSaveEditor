
import { GameType } from '../types';
import type { RpgData, VnData } from '../types';

const RPG_EXTENSIONS = ['.rpgsave', '.rvdata2', '.rvdata', '.rxdata', '.lsd', '.sav', '.save', '.rsv'];
const VN_EXTENSIONS = ['.dat', '.sol'];

export const getGameType = (filename: string): GameType => {
  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  if (RPG_EXTENSIONS.includes(extension)) {
    return GameType.RPG;
  }
  if (VN_EXTENSIONS.includes(extension)) {
    return GameType.VISUAL_NOVEL;
  }
  return GameType.UNKNOWN;
};

export const generateMockData = (gameType: GameType): RpgData | VnData | {} => {
  if (gameType === GameType.RPG) {
    return {
      characters: [
        { id: 1, name: 'Alex', level: 10, hp: 150, maxHp: 150, mp: 50, maxMp: 50, strength: 25, agility: 18, intelligence: 15 },
        { id: 2, name: 'Lina', level: 9, hp: 120, maxHp: 120, mp: 80, maxMp: 80, strength: 12, agility: 22, intelligence: 30 },
      ],
      inventory: [
        { id: 1, name: 'Potion', quantity: 15 },
        { id: 2, name: 'Phoenix Down', quantity: 5 },
        { id: 3, name: 'Ether', quantity: 8 },
        { id: 4, name: 'Iron Sword', quantity: 1 },
      ],
      skills: [
          { id: 1, name: 'Fireball', description: 'Hurls a ball of fire.', learned: true },
          { id: 2, name: 'Heal', description: 'Restores a small amount of HP.', learned: true },
          { id: 3, name: 'Ice Lance', description: 'Pierces an enemy with ice.', learned: false },
      ],
      gold: 2500,
    } as RpgData;
  }
  if (gameType === GameType.VISUAL_NOVEL) {
    return {
      currentSceneId: 'CH2_CAFE_MEETING',
      playerName: 'Yuki',
      loveInterestPoints: { 'Haruka': 25, 'Rin': 10 },
      storyFlags: [
        { id: 'MET_HARUKA', description: 'Met Haruka at the library', isSet: true },
        { id: 'FOUND_LOST_CAT', description: 'Helped the old lady find her cat', isSet: true },
        { id: 'ACCEPTED_RIN_INVITATION', description: 'Accepted Rin\'s invitation to the festival', isSet: false },
        { id: 'SECRET_PATH_UNLOCKED', description: 'Discovered the secret path in the forest', isSet: false },
      ],
    } as VnData;
  }
  return {};
};

export const downloadJson = (data: any, filename: string) => {
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(
      JSON.stringify(data, null, 2)
    )}`;
    const link = document.createElement("a");
    link.href = jsonString;
    link.download = filename;
    link.click();
};

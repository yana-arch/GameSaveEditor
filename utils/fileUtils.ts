import { GameType } from '../types';

// Let TypeScript know that LZString is available globally from the script tag in index.html
declare const LZString: any;

const RPG_MAKER_MV_EXTENSIONS = ['.rpgsave'];
const RPG_EXTENSIONS = ['.rvdata2', '.rvdata', '.rxdata', '.lsd', '.sav', '.save', '.rsv'];
const VN_EXTENSIONS = ['.dat', '.sol'];

export const getGameType = (filename: string): GameType => {
  const extension = filename.substring(filename.lastIndexOf('.')).toLowerCase();
  if (RPG_MAKER_MV_EXTENSIONS.includes(extension)) {
    return GameType.RPG_MAKER_MV;
  }
  if (RPG_EXTENSIONS.includes(extension)) {
    return GameType.RPG;
  }
  if (VN_EXTENSIONS.includes(extension)) {
    return GameType.VISUAL_NOVEL;
  }
  return GameType.UNKNOWN;
};

/**
 * Parses the content of a save file, handling different formats.
 * @param file The save file to parse.
 * @returns A promise that resolves with the parsed JSON data.
 */
export const parseSaveFile = async (file: File): Promise<any> => {
    const gameType = getGameType(file.name);
    const fileContent = await file.text();

    if (gameType === GameType.RPG_MAKER_MV) {
        if (typeof LZString === 'undefined') {
            throw new Error("lz-string library is not loaded.");
        }
        const decompressed = LZString.decompressFromBase64(fileContent);
        if (!decompressed) {
            throw new Error("Failed to decompress LZString data. The file might be corrupted or not a valid RPG Maker MV save.");
        }
        return JSON.parse(decompressed);
    }
    
    // Default: try to parse as plain JSON
    return JSON.parse(fileContent);
};

/**
 * Triggers a file download, handling re-compression for specific game types.
 */
export const downloadFile = (data: any, originalFile: File, gameType: GameType) => {
    let fileContent: string;
    let mimeType: string;
    let extension: string;

    if (gameType === GameType.RPG_MAKER_MV) {
        fileContent = LZString.compressToBase64(JSON.stringify(data));
        mimeType = 'text/plain';
        extension = '.rpgsave';
    } else {
        fileContent = JSON.stringify(data, null, 2);
        mimeType = 'application/json';
        extension = '.json';
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    const originalExtension = originalFile.name.substring(originalFile.name.lastIndexOf('.'));
    const baseName = originalFile.name.replace(originalExtension, '');
    link.download = `${baseName}_edited${extension}`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};
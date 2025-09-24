import { GameType, SaveFileFormat } from '../types';

// Let TypeScript know that LZString is available globally from the script tag in index.html
declare const LZString: any;
// Let TypeScript know that pako is available globally from the script tag in index.html
declare const pako: any;
// Let TypeScript know that msgpack is available globally from the script tag in index.html
declare const msgpack: any;

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
 * @returns A promise that resolves with the parsed JSON data and its format.
 */
export const parseSaveFile = async (file: File): Promise<{ data: any, format: SaveFileFormat }> => {
    const arrayBuffer = await file.arrayBuffer();

    // First, try to decode as text and parse text-based formats
    try {
        const fileContent = new TextDecoder('utf-8', { fatal: true }).decode(arrayBuffer);
        
        // Attempt 1: Plain JSON
        try {
            const data = JSON.parse(fileContent);
            return { data, format: SaveFileFormat.JSON };
        } catch (e) { /* continue */ }

        // Attempt 2: Base64 encoded content
        try {
            const cleanedContent = fileContent.replace(/\s/g, '');
            const decodedString = atob(cleanedContent);

            // Attempt 2a: Is the decoded content plain JSON?
            try {
                const data = JSON.parse(decodedString);
                return { data, format: SaveFileFormat.BASE64_JSON };
            } catch (jsonError) {
                // Not plain JSON, proceed to 2b.
            }

            // Attempt 2b: Is the decoded content zlib-compressed JSON?
            if (typeof pako !== 'undefined') {
                try {
                    const uint8array = new Uint8Array(decodedString.length).map((_, i) => decodedString.charCodeAt(i));
                    const decompressed = pako.inflate(uint8array, { to: 'string' });
                    if (decompressed) {
                        const data = JSON.parse(decompressed);
                        return { data, format: SaveFileFormat.BASE64_ZLIB_JSON };
                    }
                } catch (pakoError) {
                    // Failed, continue to next attempts.
                }
            }
        } catch (atobError) {
            // Not valid base64, continue.
        }
        
        // Attempt 3: LZString Base64
        if (typeof LZString !== 'undefined') {
            try {
                const decompressed = LZString.decompressFromBase64(fileContent);
                if (decompressed) {
                    const data = JSON.parse(decompressed);
                    return { data, format: SaveFileFormat.LZ_STRING_BASE64_JSON };
                }
            } catch (e) { /* continue */ }
        }

        // Attempt 4: LZString Raw
        if (typeof LZString !== 'undefined') {
            try {
                const decompressed = LZString.decompress(fileContent);
                if (decompressed) {
                    const data = JSON.parse(decompressed);
                    return { data, format: SaveFileFormat.LZ_STRING_RAW_JSON };
                }
            } catch (e) { /* continue */ }
        }

    } catch (e) {
        // Text decoding failed, file is likely binary. We'll proceed to binary parsers.
    }

    // Now, try binary format parsers
    // Attempt 5: Zlib (pako)
    if (typeof pako !== 'undefined') {
        try {
            let uint8array = new Uint8Array(arrayBuffer);

            // Check for a potential 16-byte RPG Maker MV header ("RPGMV...")
            // and skip it if present, as it's not part of the zlib data.
            if (
                uint8array.length > 16 &&
                uint8array[0] === 82 && // R
                uint8array[1] === 80 && // P
                uint8array[2] === 71 && // G
                uint8array[3] === 77 && // M
                uint8array[4] === 86    // V
            ) {
                uint8array = uint8array.slice(16);
            }

            const decompressed = pako.inflate(uint8array, { to: 'string' });
            if (decompressed) {
                const data = JSON.parse(decompressed);
                return { data, format: SaveFileFormat.ZLIB_JSON };
            }
        } catch (e) { /* continue */ }
    }

    // Attempt 6: MessagePack
    if (typeof msgpack !== 'undefined') {
        try {
            const uint8array = new Uint8Array(arrayBuffer);
            const data = msgpack.decode(uint8array);
            if (typeof data === 'object' && data !== null) {
                 return { data, format: SaveFileFormat.MESSAGEPACK_JSON };
            }
        } catch(e) { /* continue */ }
    }


    throw new Error(`Could not parse file. The file format is unsupported or the file is corrupted.`);
};


/**
 * Triggers a file download, handling re-encoding based on original format.
 */
export const downloadFile = (data: any, originalFile: File, gameType: GameType, format: SaveFileFormat) => {
    let fileContent: string | Uint8Array;
    let mimeType = 'application/octet-stream';
    const originalExtension = originalFile.name.substring(originalFile.name.lastIndexOf('.'));
    let downloadExtension = originalExtension;

    switch (format) {
        case SaveFileFormat.BASE64_ZLIB_JSON: {
            const jsonString = JSON.stringify(data);
            const compressed = pako.deflate(jsonString);
            let binaryString = '';
            compressed.forEach(byte => {
                binaryString += String.fromCharCode(byte);
            });
            fileContent = btoa(binaryString);
            mimeType = 'text/plain';
            if (gameType === GameType.RPG_MAKER_MV) {
                downloadExtension = '.rpgsave';
            }
            break;
        }
        case SaveFileFormat.ZLIB_JSON:
            fileContent = pako.deflate(JSON.stringify(data));
            if (gameType === GameType.RPG_MAKER_MV) {
                downloadExtension = '.rpgsave';
            }
            break;
        case SaveFileFormat.LZ_STRING_BASE64_JSON:
            fileContent = LZString.compressToBase64(JSON.stringify(data));
            mimeType = 'text/plain';
            if (gameType === GameType.RPG_MAKER_MV) {
                downloadExtension = '.rpgsave';
            }
            break;
        case SaveFileFormat.LZ_STRING_RAW_JSON:
            fileContent = LZString.compress(JSON.stringify(data));
            mimeType = 'text/plain';
            break;
        case SaveFileFormat.BASE64_JSON:
            fileContent = btoa(JSON.stringify(data, null, 2));
            mimeType = 'text/plain';
            break;
        case SaveFileFormat.MESSAGEPACK_JSON:
            fileContent = msgpack.encode(data);
            mimeType = 'application/octet-stream';
            break;
        case SaveFileFormat.JSON:
        default:
            fileContent = JSON.stringify(data, null, 2);
            mimeType = 'application/json';
            break;
    }

    const blob = new Blob([fileContent], { type: mimeType });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    
    const baseName = originalFile.name.replace(originalExtension, '');
    link.download = `${baseName}_edited${downloadExtension}`;
    
    document.body.appendChild(link);
    link.click();
    
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
};
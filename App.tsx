import React, { useState, useCallback } from 'react';
import { HomePage } from './components/HomePage';
import { EditorLayout } from './components/EditorLayout';
import { GenericJsonEditor } from './components/GenericJsonEditor';
import { RpgEditor, normalizeRpgData } from './components/RpgEditor';
import { VnEditor } from './components/VnEditor';
import { FileParseError } from './components/FileParseError';
import { GameType, SaveFileFormat } from './types';
import { getGameType, parseSaveFile, downloadFile } from './utils/fileUtils';
import { AiConfigProvider } from './context/AiConfigContext';

const App: React.FC = () => {
  const [gameSave, setGameSave] = useState<{ file: File; type: GameType; rawData: any; format: SaveFileFormat; } | null>(null);
  const [parseError, setParseError] = useState<File | null>(null);

  const handleFileAccepted = useCallback(async (file: File) => {
    setParseError(null);
    setGameSave(null);
    
    try {
      const { data: parsedData, format } = await parseSaveFile(file);
      const gameType = getGameType(file.name);
      setGameSave({ file, type: gameType, rawData: parsedData, format });
    } catch (error) {
      console.error("Error parsing save file:", error);
      setParseError(file);
    }
  }, []);

  const handleDataChange = (updatedData: any) => {
    if (!gameSave) return;
    setGameSave({ ...gameSave, rawData: updatedData });
  };

  const handleGoBack = () => {
    setGameSave(null);
    setParseError(null);
  };
  
  const handleDownload = () => {
    if (gameSave) {
        downloadFile(gameSave.rawData, gameSave.file, gameSave.type, gameSave.format);
        alert(`Your edited save data is being downloaded. You can re-upload the edited file to continue editing.`);
    }
  };

  const renderEditor = () => {
    if (!gameSave) {
      return null;
    }

    switch (gameSave.type) {
      case GameType.RPG:
      case GameType.RPG_MAKER_MV:
        return <RpgEditor data={gameSave.rawData} onChange={handleDataChange} />;
      case GameType.VISUAL_NOVEL:
        return <VnEditor data={gameSave.rawData} onChange={handleDataChange} />;
      default:
        return <GenericJsonEditor data={gameSave.rawData} onChange={handleDataChange} />;
    }
  };

  if (parseError) {
    return <FileParseError fileName={parseError.name} onGoBack={handleGoBack} />;
  }

  if (!gameSave) {
    return <HomePage onFileAccepted={handleFileAccepted} />;
  }

  // Only show AI chat for RPG games for now
  const rpgData = gameSave.type === 'RPG' || gameSave.type === 'RPG_MAKER_MV' ? normalizeRpgData(gameSave.rawData) : undefined;

  return (
    <AiConfigProvider>
        <EditorLayout
          file={gameSave.file}
          type={gameSave.type}
          onGoBack={handleGoBack}
          onDownload={handleDownload}
          rpgData={rpgData}
        >
          {renderEditor()}
        </EditorLayout>
    </AiConfigProvider>
  );
};

export default App;

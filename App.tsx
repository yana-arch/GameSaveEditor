import React, { useState, useCallback } from 'react';
import { HomePage } from './components/HomePage';
import { EditorLayout } from './components/EditorLayout';
import { GenericJsonEditor } from './components/GenericJsonEditor';
import { FileParseError } from './components/FileParseError';
import { GameType } from './types';
import { getGameType, parseSaveFile, downloadFile } from './utils/fileUtils';

const App: React.FC = () => {
  const [gameSave, setGameSave] = useState<{ file: File; type: GameType; rawData: any; } | null>(null);
  const [parseError, setParseError] = useState<File | null>(null);

  const handleFileAccepted = useCallback(async (file: File) => {
    setParseError(null);
    setGameSave(null);
    
    try {
      const parsedData = await parseSaveFile(file);
      const gameType = getGameType(file.name);
      setGameSave({ file, type: gameType, rawData: parsedData });
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
        downloadFile(gameSave.rawData, gameSave.file, gameSave.type);
        alert(`Your edited save data is being downloaded. You can re-upload the edited file to continue editing.`);
    }
  };

  if (parseError) {
    return <FileParseError fileName={parseError.name} onGoBack={handleGoBack} />;
  }

  if (!gameSave) {
    return <HomePage onFileAccepted={handleFileAccepted} />;
  }

  return (
    <EditorLayout 
      file={gameSave.file}
      type={gameSave.type}
      onGoBack={handleGoBack}
      onDownload={handleDownload}
    >
      <GenericJsonEditor data={gameSave.rawData} onChange={handleDataChange} />
    </EditorLayout>
  );
};

export default App;
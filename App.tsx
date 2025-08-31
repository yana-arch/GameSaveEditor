
import React, { useState, useCallback } from 'react';
import { HomePage } from './components/HomePage';
import { EditorLayout } from './components/EditorLayout';
import { GenericJsonEditor } from './components/GenericJsonEditor';
import type { GameSave } from './types';
import { GameType } from './types';
import { getGameType, generateMockData } from './utils/fileUtils';

const App: React.FC = () => {
  const [gameSave, setGameSave] = useState<GameSave | null>(null);

  const handleFileAccepted = useCallback((file: File) => {
    const gameType = getGameType(file.name);
    // Even if the type is unknown, we can still try to parse it as JSON
    // if (gameType === GameType.UNKNOWN) {
    //   alert("Unsupported file type. Please upload a supported game save file.");
    //   return;
    // }

    const reader = new FileReader();

    reader.onload = (event) => {
      try {
        if (typeof event.target?.result !== 'string') {
          throw new Error("Failed to read file as text.");
        }
        const parsedData = JSON.parse(event.target.result);
        setGameSave({ file, type: gameType, data: parsedData });
      } catch (error) {
        console.error("Error parsing save file:", error);
        alert("Could not read the save file as JSON. It might be in an unsupported format or corrupted. Displaying sample data instead.");
        // Fallback to mock data if parsing fails
        const mockData = generateMockData(gameType !== GameType.UNKNOWN ? gameType : GameType.RPG); // Default to RPG mock
        setGameSave({ file, type: gameType, data: mockData });
      }
    };

    reader.onerror = () => {
      console.error("FileReader error.");
      alert("An error occurred while reading the file. Displaying sample data instead.");
      const mockData = generateMockData(gameType !== GameType.UNKNOWN ? gameType : GameType.RPG);
      setGameSave({ file, type: gameType, data: mockData });
    };

    reader.readAsText(file);
  }, []);

  const handleDataChange = (updatedData: any) => {
    if (gameSave) {
      setGameSave({ ...gameSave, data: updatedData });
    }
  };

  const handleGoBack = () => {
    setGameSave(null);
  };

  if (!gameSave) {
    return <HomePage onFileAccepted={handleFileAccepted} />;
  }

  return (
    <EditorLayout gameSave={gameSave} onGoBack={handleGoBack}>
      <GenericJsonEditor data={gameSave.data} onChange={handleDataChange} />
    </EditorLayout>
  );
};

export default App;

import React from 'react';
import type { GameSave } from '../types';
import { downloadJson } from '../utils/fileUtils';
import { BackIcon, DownloadIcon, SaveIcon } from './icons';

interface EditorLayoutProps {
  children: React.ReactNode;
  gameSave: GameSave;
  onGoBack: () => void;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({ children, gameSave, onGoBack }) => {
  const handleDownload = () => {
    const originalExtension = gameSave.file.name.substring(gameSave.file.name.lastIndexOf('.'));
    const baseName = gameSave.file.name.replace(originalExtension, '');
    const newFilename = `${baseName}_edited.json`;
    downloadJson(gameSave.data, newFilename);
    alert(`Your edited save data has been downloaded as "${newFilename}". You can re-upload this JSON file to continue editing.`);
  };

  const handleSaveChanges = () => {
    // In a real app, this might post to a server or update local storage.
    // For this demo, we'll just show an alert.
    alert("Changes saved in current session. Download the file to keep your edits.");
  };

  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 font-sans p-4 sm:p-6">
      <div className="max-w-7xl mx-auto">
        <header className="mb-6 flex flex-col sm:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <button onClick={onGoBack} className="p-2 rounded-full bg-gray-700 hover:bg-gray-600 transition-colors">
              <BackIcon className="w-6 h-6 text-gray-300" />
              <span className="sr-only">Go Back</span>
            </button>
            <div>
              <h1 className="text-2xl font-bold text-white">Save Editor</h1>
              <p className="text-sm text-gray-400 font-mono">{gameSave.file.name} <span className="text-blue-400">({gameSave.type})</span></p>
            </div>
          </div>
          <div className="flex items-center gap-3">
             <button onClick={handleSaveChanges} className="flex items-center gap-2 bg-gray-700 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-600 transition-colors">
              <SaveIcon className="w-5 h-5" />
              <span>Save Changes</span>
            </button>
            <button onClick={handleDownload} className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">
              <DownloadIcon className="w-5 h-5" />
              <span>Download Edited File</span>
            </button>
          </div>
        </header>
        <main className="bg-gray-800 border border-gray-700 rounded-xl p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
};

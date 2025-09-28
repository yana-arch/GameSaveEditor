import React, { useState } from 'react';
import type { GameType, RpgData } from '../types';
import { BackIcon, DownloadIcon, SaveIcon, UndoIcon, RedoIcon } from './icons';
import { AiChat } from './AiChat';

interface EditorLayoutProps {
  children: React.ReactNode;
  file: File;
  type: GameType;
  onGoBack: () => void;
  onDownload: () => void;
  rpgData?: RpgData;
}

export const EditorLayout: React.FC<EditorLayoutProps> = ({
  children,
  file,
  type,
  onGoBack,
  onDownload,
  rpgData,
}) => {
  const [showSaveNotification, setShowSaveNotification] = useState(false);

  const handleSaveChanges = () => {
    // In future: implement actual save functionality with change tracking
    setShowSaveNotification(true);
    setTimeout(() => setShowSaveNotification(false), 3000);
  };

  const handleUndo = () => {
    // Placeholder for undo functionality
    console.log('Undo action');
  };

  const handleRedo = () => {
    // Placeholder for redo functionality
    console.log('Redo action');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-gray-200 font-sans">
      {/* Background Pattern */}
      <div className="absolute inset-0 opacity-20">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/3 to-purple-500/3"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(120,119,198,0.1),transparent_70%)]"></div>
      </div>

      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="backdrop-blur-sm bg-gray-900/80 border-b border-gray-700/50 sticky top-0 z-20">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
            <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
              <div className="flex items-center gap-4">
                <button
                  onClick={onGoBack}
                  className="group p-3 rounded-xl bg-gray-800/80 hover:bg-gray-700/80 border border-gray-600/50 hover:border-gray-500/50 transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5"
                  aria-label="Go Back"
                >
                  <BackIcon className="w-6 h-6 text-gray-300 group-hover:text-white transition-colors duration-300" />
                  <span className="sr-only">Go Back</span>
                </button>
                <div className="min-w-0 flex-1">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">
                    Save Editor
                  </h1>
                  <div className="flex flex-col sm:flex-row sm:items-center gap-2 mt-1">
                    <p className="text-sm text-gray-400 font-mono truncate max-w-sm lg:max-w-lg">
                      {file.name}
                    </p>
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-blue-500/20 to-purple-500/20 text-blue-300 border border-blue-500/30">
                      {type}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-3 flex-wrap">
                {/* Action buttons */}
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-800/50 rounded-lg border border-gray-700/50">
                  <button
                    onClick={handleUndo}
                    className="p-1.5 rounded-md text-gray-400 hover:text-gray-300 hover:bg-gray-700/50 transition-colors duration-200"
                    aria-label="Undo"
                  >
                    <UndoIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={handleRedo}
                    disabled
                    className="p-1.5 rounded-md text-gray-600 hover:text-gray-500 transition-colors duration-200 disabled:cursor-not-allowed"
                    aria-label="Redo"
                  >
                    <RedoIcon className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSaveChanges}
                    className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-gray-700 to-gray-600 hover:from-gray-600 hover:to-gray-500 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 border border-gray-500/50"
                  >
                    <SaveIcon className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                  <button
                    onClick={onDownload}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-500 hover:to-blue-600 text-white font-medium rounded-lg transition-all duration-300 hover:shadow-lg hover:-translate-y-0.5 shadow-lg"
                  >
                    <DownloadIcon className="w-4 h-4" />
                    <span>Download File</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Success Notification */}
        {showSaveNotification && (
          <div className="fixed top-20 right-4 z-30 animate-fadeIn">
            <div className="bg-green-500/90 backdrop-blur-sm text-white px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 border border-green-400/50">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
              <span className="font-medium">Changes saved locally!</span>
            </div>
          </div>
        )}

        {/* Main Content */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          <div className="overflow-auto h-screen bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-2xl p-6 shadow-xl">
            {children}
          </div>
        </main>

        {/* AI Chat - only show in editor with RPG data */}
        {rpgData && (
          <AiChat rpgData={rpgData} isInEditor={true} />
        )}
      </div>
    </div>
  );
};

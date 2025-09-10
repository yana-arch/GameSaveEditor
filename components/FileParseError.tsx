import React from 'react';
import { WarningIcon } from './icons';

interface FileParseErrorProps {
  fileName: string;
  onGoBack: () => void;
}

export const FileParseError: React.FC<FileParseErrorProps> = ({ fileName, onGoBack }) => {
  return (
    <div className="min-h-screen bg-gray-900 text-gray-200 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-800 border border-gray-700 rounded-lg max-w-lg">
        <WarningIcon className="w-16 h-16 text-red-400 mb-4" />
        <h3 className="text-2xl font-bold text-white mb-2">Error Parsing File</h3>
        <p className="font-mono text-sm text-red-300 bg-red-900/50 px-2 py-1 rounded mb-4 break-all">{fileName}</p>
        <p className="max-w-md text-gray-400">
          This file could not be read as valid JSON. It is likely in an unsupported binary format or is corrupted.
        </p>
        <p className="mt-2 text-gray-400">
          This editor can only open save files that are stored in a plain text JSON format.
        </p>
        <button
          onClick={onGoBack}
          className="mt-6 bg-blue-600 text-white font-bold py-2 px-6 rounded-lg hover:bg-blue-700 transition-colors"
        >
          Try Another File
        </button>
      </div>
    </div>
  );
};

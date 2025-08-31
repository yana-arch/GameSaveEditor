import React from 'react';
import { WarningIcon } from './icons';

export const EmptyEditorState: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 bg-gray-700/50 rounded-lg min-h-[300px]">
      <WarningIcon className="w-16 h-16 text-yellow-400 mb-4" />
      <h3 className="text-2xl font-bold text-white mb-2">No Editable Data Found</h3>
      <p className="max-w-md text-gray-400">
        The uploaded file was parsed, but it does not contain any recognizable data for this editor. 
        It might be empty, from a different game, or in a format whose structure we don't understand.
      </p>
      <p className="mt-2 text-gray-400">
        Please go back and try a different save file.
      </p>
    </div>
  );
};

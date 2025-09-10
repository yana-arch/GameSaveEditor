import React from 'react';
import type { VnData, StoryFlag } from '../types';
import { EmptyEditorState } from './EmptyEditorState';

interface VnEditorProps {
  data: VnData;
  onChange: (data: VnData) => void;
}

export const VnEditor: React.FC<VnEditorProps> = ({ data, onChange }) => {
  // Defensively handle potentially missing or malformed data properties
  const loveInterestPoints = data?.loveInterestPoints ?? {};
  const storyFlags = Array.isArray(data?.storyFlags) ? data.storyFlags : [];

  const isEmpty = storyFlags.length === 0 && Object.keys(loveInterestPoints).length === 0 && data?.playerName === undefined && data?.currentSceneId === undefined;

  if (isEmpty) {
    return <EmptyEditorState />;
  }

  const handleFlagToggle = (flagIndex: number) => {
    const newFlags = [...storyFlags];
    const flagToUpdate = { ...newFlags[flagIndex] };
    flagToUpdate.isSet = !flagToUpdate.isSet;
    newFlags[flagIndex] = flagToUpdate;
    onChange({ ...data, storyFlags: newFlags });
  };
  
  const handleFieldChange = <K extends keyof VnData,>(field: K, value: VnData[K]) => {
    onChange({ ...data, [field]: value });
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="md:col-span-1 space-y-4">
        <h3 className="text-xl font-semibold text-white">Game Progress</h3>
        <div className="bg-gray-700/50 p-4 rounded-lg">
            <div>
                <label htmlFor="playerName" className="text-sm text-gray-400">Player Name</label>
                {/* FIX: Use nullish coalescing operator to avoid treating valid falsy values like empty strings incorrectly. */}
                <input id="playerName" type="text" value={data.playerName ?? ''} onChange={e => handleFieldChange('playerName', e.target.value)} className="w-full mt-1 bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
            <div className="mt-4">
                <label htmlFor="currentScene" className="text-sm text-gray-400">Current Scene ID</label>
                {/* FIX: Use nullish coalescing operator to avoid treating valid falsy values like 0 incorrectly and fix typing error. */}
                <input id="currentScene" type="text" value={data.currentSceneId ?? ''} onChange={e => handleFieldChange('currentSceneId', e.target.value)} className="w-full mt-1 bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
            </div>
        </div>
        <div className="bg-gray-700/50 p-4 rounded-lg">
            <h4 className="text-lg font-semibold text-gray-200 mb-3">Affection Points</h4>
            {Object.entries(loveInterestPoints).map(([name, points]) => (
                <div key={name} className="flex items-center justify-between mb-2">
                    <span className="text-gray-300">{name}</span>
                    <input 
                        type="number" 
                        value={points}
                        onChange={e => handleFieldChange('loveInterestPoints', { ...loveInterestPoints, [name]: parseInt(e.target.value, 10) || 0 })}
                        className="w-20 text-center bg-gray-900/50 border border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-2 focus:ring-blue-500" 
                    />
                </div>
            ))}
        </div>
      </div>
      <div className="md:col-span-2">
        <h3 className="text-xl font-semibold text-white mb-4">Story Flags</h3>
        <div className="bg-gray-700/50 p-4 rounded-lg space-y-3 max-h-96 overflow-y-auto">
            {storyFlags.map((flag, index) => (
                <div key={flag.id} className="bg-gray-900/50 p-3 rounded-lg flex justify-between items-center">
                    <div>
                        <p className="font-mono text-sm text-blue-300">{flag.id}</p>
                        <p className="text-gray-400">{flag.description}</p>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" checked={flag.isSet} onChange={() => handleFlagToggle(index)} className="sr-only peer" />
                        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>
            ))}
        </div>
      </div>
    </div>
  );
};
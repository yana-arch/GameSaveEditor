import React, { useState } from 'react';
import type { RpgData, RpgCharacter, InventoryItem, Skill } from '../types';
import { EmptyEditorState } from './EmptyEditorState';

interface RpgEditorProps {
  data: RpgData;
  onChange: (data: RpgData) => void;
}

type EditorTab = 'characters' | 'inventory' | 'skills';

const StatInput: React.FC<{ label: string; value: number; onChange: (val: number) => void; }> = ({ label, value, onChange }) => (
    <div className="flex flex-col">
        <label className="text-sm text-gray-400 mb-1">{label}</label>
        <div className="flex items-center">
            <button onClick={() => onChange(value - 1)} className="px-2 py-1 bg-gray-600 rounded-l-md hover:bg-gray-500">-</button>
            <input type="number" value={value} onChange={e => onChange(parseInt(e.target.value, 10) || 0)} className="w-20 text-center bg-gray-700 border-y border-gray-600 focus:outline-none focus:ring-2 focus:ring-blue-500"/>
            <button onClick={() => onChange(value + 1)} className="px-2 py-1 bg-gray-600 rounded-r-md hover:bg-gray-500">+</button>
        </div>
    </div>
);

export const RpgEditor: React.FC<RpgEditorProps> = ({ data, onChange }) => {
  const [activeTab, setActiveTab] = useState<EditorTab>('characters');

  // Defensively handle potentially missing or malformed data properties
  const characters = Array.isArray(data?.characters) ? data.characters : [];
  const inventory = Array.isArray(data?.inventory) ? data.inventory : [];
  const skills = Array.isArray(data?.skills) ? data.skills : [];
  
  const isEmpty = characters.length === 0 && inventory.length === 0 && skills.length === 0 && data?.gold === undefined;

  if (isEmpty) {
    return <EmptyEditorState />;
  }
  
  const handleCharacterChange = <K extends keyof RpgCharacter,>(charIndex: number, field: K, value: RpgCharacter[K]) => {
    const newCharacters = [...characters];
    newCharacters[charIndex] = { ...newCharacters[charIndex], [field]: value };
    onChange({ ...data, characters: newCharacters });
  };
  
  const handleInventoryChange = (itemIndex: number, newQuantity: number) => {
    const newInventory = [...inventory];
    newInventory[itemIndex] = { ...newInventory[itemIndex], quantity: Math.max(0, newQuantity) };
    onChange({ ...data, inventory: newInventory });
  };
  
  const handleSkillToggle = (skillIndex: number) => {
    const newSkills = [...skills];
    const skillToUpdate = { ...newSkills[skillIndex] };
    skillToUpdate.learned = !skillToUpdate.learned;
    newSkills[skillIndex] = skillToUpdate;
    onChange({ ...data, skills: newSkills });
  };

  return (
    <div>
      <div className="border-b border-gray-600 mb-6">
        <nav className="-mb-px flex space-x-6">
          <button onClick={() => setActiveTab('characters')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'characters' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Characters</button>
          <button onClick={() => setActiveTab('inventory')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'inventory' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Inventory</button>
          <button onClick={() => setActiveTab('skills')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'skills' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Skills</button>
        </nav>
      </div>

      {activeTab === 'characters' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {characters.map((char, index) => (
            <div key={char.id} className="bg-gray-700/50 p-4 rounded-lg">
                <div className="mb-4">
                    <label htmlFor={`charName-${char.id}`} className="text-sm text-gray-400">Character Name</label>
                    <input id={`charName-${char.id}`} type="text" value={char.name} onChange={e => handleCharacterChange(index, 'name', e.target.value)} className="w-full mt-1 bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                </div>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
                    <StatInput label="Level" value={char.level} onChange={v => handleCharacterChange(index, 'level', v)} />
                    <StatInput label="HP" value={char.hp} onChange={v => handleCharacterChange(index, 'hp', v)} />
                    <StatInput label="MP" value={char.mp} onChange={v => handleCharacterChange(index, 'mp', v)} />
                    <StatInput label="Strength" value={char.strength} onChange={v => handleCharacterChange(index, 'strength', v)} />
                    <StatInput label="Agility" value={char.agility} onChange={v => handleCharacterChange(index, 'agility', v)} />
                    <StatInput label="Intelligence" value={char.intelligence} onChange={v => handleCharacterChange(index, 'intelligence', v)} />
                </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'inventory' && (
        <div>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                {inventory.map((item, index) => (
                    <div key={item.id} className="bg-gray-700/50 p-3 rounded-lg flex flex-col justify-between">
                        <p className="font-semibold text-gray-200">{item.name}</p>
                        <div className="mt-2">
                             <StatInput label="Quantity" value={item.quantity} onChange={v => handleInventoryChange(index, v)} />
                        </div>
                    </div>
                ))}
            </div>
        </div>
      )}
      
      {activeTab === 'skills' && (
        <div className="space-y-3">
          {skills.map((skill, index) => (
            <div key={skill.id} className="bg-gray-700/50 p-3 rounded-lg flex justify-between items-center">
                <div>
                    <p className="font-semibold text-gray-200">{skill.name}</p>
                    <p className="text-sm text-gray-400">{skill.description}</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                    <input type="checkbox" checked={skill.learned} onChange={() => handleSkillToggle(index)} className="sr-only peer" />
                    <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                </label>
            </div>
          ))}
        </div>
      )}

    </div>
  );
};
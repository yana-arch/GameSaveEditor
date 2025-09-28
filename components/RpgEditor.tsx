import React, { useState, useMemo, useEffect } from 'react';
import type { RpgData, RpgCharacter, InventoryItem, Skill } from '../types';
import { EmptyEditorState } from './EmptyEditorState';
import { GenericJsonEditor } from './GenericJsonEditor';
import { setAtPath } from '../utils/jsonUtils';
import { AiConfigManager } from './AiConfigManager';

interface RpgEditorProps {
  data: any; // Raw data from file
  onChange: (data: any) => void;
}

// A function to normalize incoming raw data into a consistent RpgData format for the editor UI
export const normalizeRpgData = (rawData: any): RpgData => {
  if (!rawData) return {};

  // First, check if the data is already in our clean, abstract format
  if (rawData.characters || rawData.inventory || rawData.skills || rawData.gold !== undefined) {
    return {
      characters: Array.isArray(rawData.characters) ? rawData.characters : [],
      inventory: Array.isArray(rawData.inventory) ? rawData.inventory : [],
      skills: Array.isArray(rawData.skills) ? rawData.skills : [],
      gold: typeof rawData.gold === 'number' ? rawData.gold : undefined,
    };
  }
  
  // If not, check for the common RPG Maker MV format
  const characters: RpgCharacter[] = (rawData.$gameActors?._data ?? [])
    .filter(Boolean) // RPG Maker actor arrays often have a null at index 0
    .map((actor: any, index: number) => ({
      id: actor._actorId ?? `actor_${index + 1}`,
      name: actor._name ?? 'Unknown',
      level: actor._level ?? 1,
      hp: actor._hp ?? 0,
      mp: actor._mp ?? 0,
      // Map from _paramPlus bonus stats for simplicity
      strength: actor._paramPlus?.[2] ?? 0, // ATK bonus
      agility: actor._paramPlus?.[4] ?? 0,  // AGI bonus
      intelligence: actor._paramPlus?.[6] ?? 0, // MAT bonus
    }));

  const inventory: InventoryItem[] = Object.entries(rawData.$gameParty?._items ?? {})
    .map(([id, quantity]) => ({
      id: parseInt(id, 10),
      name: `Item ID: ${id}`, // Save files don't contain item names, so we use their ID
      quantity: quantity as number,
    }));
    
  const gold = rawData.$gameParty?._gold;
  
  // Skills are complex to map reliably from this format, so we'll omit them
  const skills: Skill[] = [];

  return { characters, inventory, skills, gold };
};


type EditorTab = 'characters' | 'inventory' | 'skills' | 'all_data';

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

export const RpgEditor: React.FC<RpgEditorProps> = ({ data: rawData, onChange: onRawChange }) => {
  const normalizedData = useMemo(() => normalizeRpgData(rawData), [rawData]);
  const { characters = [], inventory = [], skills = [] } = normalizedData;

  const hasCharacters = characters.length > 0;
  const hasInventory = inventory.length > 0 || normalizedData.gold !== undefined;
  const hasSkills = skills.length > 0;

  const getInitialTab = (): EditorTab => {
    if (hasCharacters) return 'characters';
    if (hasInventory) return 'inventory';
    if (hasSkills) return 'skills';
    return 'all_data';
  };
  
  const [activeTab, setActiveTab] = useState<EditorTab>(getInitialTab());

  useEffect(() => {
    // If the active tab becomes invalid due to data changes, switch to a valid one.
    if (activeTab === 'characters' && !hasCharacters) setActiveTab(getInitialTab());
    if (activeTab === 'inventory' && !hasInventory) setActiveTab(getInitialTab());
    if (activeTab === 'skills' && !hasSkills) setActiveTab(getInitialTab());
  }, [hasCharacters, hasInventory, hasSkills, activeTab]);
  
  if (!rawData || Object.keys(rawData).length === 0) {
    return <EmptyEditorState />;
  }
  
  // This function takes changes to the normalized data and maps them back to the original raw data structure
  const handleNormalizedDataChange = (updatedNormalizedData: RpgData) => {
    // If the original format was our clean, abstract one, we can just merge the changes
    if (rawData.characters || rawData.inventory || rawData.skills || rawData.gold !== undefined) {
      onRawChange({ ...rawData, ...updatedNormalizedData });
      return;
    }
    
    // If the original format was RPG Maker, we need to map the changes back carefully
    let updatedRawData = { ...rawData };

    // Map characters back
    if (updatedNormalizedData.characters && rawData.$gameActors?._data) {
        updatedNormalizedData.characters.forEach(char => {
            const actorIndex = rawData.$gameActors._data.findIndex((a: any) => a && a._actorId === char.id);
            if (actorIndex > -1) {
                const actorPath = ['$gameActors', '_data', actorIndex];
                updatedRawData = setAtPath(updatedRawData, [...actorPath, '_name'], char.name);
                updatedRawData = setAtPath(updatedRawData, [...actorPath, '_level'], char.level);
                updatedRawData = setAtPath(updatedRawData, [...actorPath, '_hp'], char.hp);
                updatedRawData = setAtPath(updatedRawData, [...actorPath, '_mp'], char.mp);
                updatedRawData = setAtPath(updatedRawData, [...actorPath, '_paramPlus', 2], char.strength);
                updatedRawData = setAtPath(updatedRawData, [...actorPath, '_paramPlus', 4], char.agility);
                updatedRawData = setAtPath(updatedRawData, [...actorPath, '_paramPlus', 6], char.intelligence);
            }
        });
    }

    // Map inventory back
    if (updatedNormalizedData.inventory && rawData.$gameParty?._items) {
        const newItems = updatedNormalizedData.inventory.reduce((acc, item) => {
            if (typeof item.id === 'number') {
               acc[item.id] = item.quantity;
            }
            return acc;
        }, {} as { [key: string]: number });
        updatedRawData = setAtPath(updatedRawData, ['$gameParty', '_items'], newItems);
    }
    
    // Map gold back
    if (updatedNormalizedData.gold !== undefined && rawData.$gameParty) {
        updatedRawData = setAtPath(updatedRawData, ['$gameParty', '_gold'], updatedNormalizedData.gold);
    }

    onRawChange(updatedRawData);
  };
  
  const handleCharacterChange = <K extends keyof RpgCharacter,>(charIndex: number, field: K, value: RpgCharacter[K]) => {
    const newCharacters = [...characters];
    newCharacters[charIndex] = { ...newCharacters[charIndex], [field]: value };
    handleNormalizedDataChange({ ...normalizedData, characters: newCharacters });
  };
  
  const handleInventoryChange = (itemIndex: number, newQuantity: number) => {
    const newInventory = [...inventory];
    newInventory[itemIndex] = { ...newInventory[itemIndex], quantity: Math.max(0, newQuantity) };
    handleNormalizedDataChange({ ...normalizedData, inventory: newInventory });
  };
  
  const handleSkillToggle = (skillIndex: number) => {
    const newSkills = [...skills];
    const skillToUpdate = { ...newSkills[skillIndex] };
    skillToUpdate.learned = !skillToUpdate.learned;
    newSkills[skillIndex] = skillToUpdate;
    handleNormalizedDataChange({ ...normalizedData, skills: newSkills });
  };

  return (
    <div>
      <div className="border-b border-gray-600 mb-6">
        <nav className="-mb-px flex space-x-6">
          {hasCharacters && <button onClick={() => setActiveTab('characters')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'characters' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Characters</button>}
          {hasInventory && <button onClick={() => setActiveTab('inventory')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'inventory' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Inventory</button>}
          {hasSkills && <button onClick={() => setActiveTab('skills')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'skills' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>Skills</button>}
          <button onClick={() => setActiveTab('all_data')} className={`py-3 px-1 border-b-2 font-medium text-sm transition-colors ${activeTab === 'all_data' ? 'border-blue-500 text-blue-400' : 'border-transparent text-gray-400 hover:text-gray-200 hover:border-gray-500'}`}>All Data</button>
        </nav>
      </div>

      {activeTab === 'characters' && hasCharacters && (
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
                    <StatInput label="STR Bonus" value={char.strength} onChange={v => handleCharacterChange(index, 'strength', v)} />
                    <StatInput label="AGI Bonus" value={char.agility} onChange={v => handleCharacterChange(index, 'agility', v)} />
                    <StatInput label="INT Bonus" value={char.intelligence} onChange={v => handleCharacterChange(index, 'intelligence', v)} />
                </div>
            </div>
          ))}
        </div>
      )}

      {activeTab === 'inventory' && hasInventory && (
        <div>
            {normalizedData.gold !== undefined && (
                 <div className="mb-6 bg-gray-700/50 p-4 rounded-lg max-w-sm">
                    <h3 className="text-lg font-semibold text-white mb-2">Gold</h3>
                    <StatInput label="Current Gold" value={normalizedData.gold} onChange={v => handleNormalizedDataChange({ ...normalizedData, gold: v })} />
                 </div>
            )}
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
      
      {activeTab === 'skills' && hasSkills && (
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

      {activeTab === 'all_data' && (
        <>
            <div className="mb-6">
                <AiConfigManager />
            </div>
            <GenericJsonEditor data={rawData} onChange={onRawChange} />
        </>
      )}

    </div>
  );
};

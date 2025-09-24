import React, { useState } from 'react';
import { useAiConfig } from '../context/AiConfigContext';
import { AiConfigModal } from './modals/AiConfigModal';
import { AiConfig } from '../types';
import { PlusIcon, TrashIcon } from './icons';

export const AiConfigManager: React.FC = () => {
    const { configs, activeConfigId, setActiveConfigId, deleteConfig } = useAiConfig();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [configToEdit, setConfigToEdit] = useState<AiConfig | null>(null);

    const handleAddNew = () => {
        setConfigToEdit(null);
        setIsModalOpen(true);
    };

    const handleEdit = (config: AiConfig) => {
        setConfigToEdit(config);
        setIsModalOpen(true);
    };
    
    const handleDelete = (id: string) => {
        if (window.confirm('Are you sure you want to delete this configuration?')) {
            deleteConfig(id);
        }
    };

    return (
        <div className="bg-gray-700/50 p-4 rounded-lg">
            <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">AI Configurations</h3>
                <button
                    onClick={handleAddNew}
                    className="flex items-center gap-2 bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <PlusIcon className="w-5 h-5" />
                    <span>Add New</span>
                </button>
            </div>

            {configs.length === 0 ? (
                <p className="text-gray-400 text-center py-4">No AI configurations found. Add one to use the Gemini Helper.</p>
            ) : (
                <div className="space-y-2">
                    {configs.map(config => (
                        <div key={config.id} className="bg-gray-900/50 p-3 rounded-lg flex items-center gap-4">
                            <input
                                type="radio"
                                id={`config-radio-${config.id}`}
                                name="active-config"
                                checked={activeConfigId === config.id}
                                onChange={() => setActiveConfigId(config.id)}
                                className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
                            />
                            <label htmlFor={`config-radio-${config.id}`} className="flex-grow">
                                <p className="font-semibold text-gray-200">{config.name}</p>
                                <p className="text-sm text-gray-400 font-mono">{config.provider} | {config.modelId}</p>
                            </label>
                            <div className="flex items-center gap-2">
                                <button onClick={() => handleEdit(config)} className="text-gray-400 hover:text-white transition-colors">Edit</button>
                                <button onClick={() => handleDelete(config.id)} className="p-1 text-gray-400 hover:text-red-400 transition-colors">
                                    <TrashIcon className="w-4 h-4" />
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {isModalOpen && (
                <AiConfigModal
                    configToEdit={configToEdit}
                    onClose={() => setIsModalOpen(false)}
                />
            )}
        </div>
    );
};
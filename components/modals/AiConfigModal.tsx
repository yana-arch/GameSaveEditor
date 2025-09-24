import React, { useState, useEffect } from 'react';
import { useAiConfig } from '../../context/AiConfigContext';
import { AiConfig, ProviderName } from '../../types';
import { PROVIDERS } from '../../constants';

interface AiConfigModalProps {
  configToEdit?: AiConfig | null;
  onClose: () => void;
}

export const AiConfigModal: React.FC<AiConfigModalProps> = ({ configToEdit, onClose }) => {
  const { addConfig, updateConfig } = useAiConfig();
  const [formData, setFormData] = useState<Omit<AiConfig, 'id'>>({
    name: '',
    provider: 'gemini',
    modelId: 'gemini-2.5-flash',
    apiKey: '',
    baseURL: '',
  });
  
  const [selectedProvider, setSelectedProvider] = useState(PROVIDERS[0]);

  useEffect(() => {
    if (configToEdit) {
      setFormData({
          name: configToEdit.name,
          provider: configToEdit.provider,
          modelId: configToEdit.modelId,
          apiKey: configToEdit.apiKey ?? '',
          baseURL: configToEdit.baseURL ?? '',
      });
      setSelectedProvider(PROVIDERS.find(p => p.id === configToEdit.provider) || PROVIDERS[0]);
    }
  }, [configToEdit]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (name === 'provider') {
        const provider = PROVIDERS.find(p => p.id === value) || PROVIDERS[0];
        setSelectedProvider(provider);
        // Reset modelId to default when provider changes
        setFormData(prev => ({ ...prev, provider: value as ProviderName, modelId: provider.defaultModel }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (configToEdit) {
      updateConfig({ ...formData, id: configToEdit.id });
    } else {
      addConfig(formData);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" aria-modal="true" role="dialog">
      <div className="bg-gray-800 border border-gray-700 rounded-lg shadow-xl w-full max-w-lg">
        <form onSubmit={handleSubmit}>
            <div className="p-6">
                <h2 className="text-xl font-bold text-white mb-4">{configToEdit ? 'Edit' : 'Add'} AI Configuration</h2>
                <div className="space-y-4">
                     <div>
                        <label htmlFor="name" className="block text-sm font-medium text-gray-300 mb-1">Configuration Name</label>
                        <input type="text" name="name" id="name" value={formData.name} onChange={handleChange} required className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="e.g., My Gemini Key" />
                    </div>
                    <div>
                        <label htmlFor="provider" className="block text-sm font-medium text-gray-300 mb-1">AI Provider</label>
                        <select name="provider" id="provider" value={formData.provider} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500">
                           {PROVIDERS.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                        </select>
                    </div>
                     {selectedProvider.requiresBaseURL && (
                        <div>
                            <label htmlFor="baseURL" className="block text-sm font-medium text-gray-300 mb-1">Base URL</label>
                            <input type="url" name="baseURL" id="baseURL" value={formData.baseURL} onChange={handleChange} required className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="https://api.example.com/v1" />
                        </div>
                     )}
                     <div>
                        <label htmlFor="modelId" className="block text-sm font-medium text-gray-300 mb-1">Model ID</label>
                        <input type="text" name="modelId" id="modelId" value={formData.modelId} onChange={handleChange} required className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" />
                    </div>
                     <div>
                        <label htmlFor="apiKey" className="block text-sm font-medium text-gray-300 mb-1">API Key</label>
                        <input type="password" name="apiKey" id="apiKey" value={formData.apiKey} onChange={handleChange} className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500" placeholder="Paste your API key here" />
                    </div>
                </div>
            </div>
            <div className="bg-gray-700/50 px-6 py-3 flex justify-end gap-3 rounded-b-lg">
                <button type="button" onClick={onClose} className="bg-gray-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-gray-500 transition-colors">Cancel</button>
                <button type="submit" className="bg-blue-600 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-700 transition-colors">{configToEdit ? 'Save Changes' : 'Add Configuration'}</button>
            </div>
        </form>
      </div>
    </div>
  );
};
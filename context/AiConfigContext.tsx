import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { AiConfig } from '../types';

interface AiConfigContextType {
  configs: AiConfig[];
  activeConfigId: string | null;
  setActiveConfigId: (id: string | null) => void;
  addConfig: (config: Omit<AiConfig, 'id'>) => void;
  updateConfig: (config: AiConfig) => void;
  deleteConfig: (id: string) => void;
  getConfigById: (id: string) => AiConfig | undefined;
  activeConfig: AiConfig | null;
}

const AiConfigContext = createContext<AiConfigContextType | undefined>(undefined);

const CONFIGS_STORAGE_KEY = 'gameSaveStudio_aiConfigs';
const ACTIVE_CONFIG_ID_STORAGE_KEY = 'gameSaveStudio_activeAiConfigId';

export const AiConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [configs, setConfigs] = useState<AiConfig[]>([]);
  const [activeConfigId, setActiveConfigIdState] = useState<string | null>(null);

  useEffect(() => {
    try {
      const storedConfigs = localStorage.getItem(CONFIGS_STORAGE_KEY);
      if (storedConfigs) {
        setConfigs(JSON.parse(storedConfigs));
      }
      const storedActiveId = localStorage.getItem(ACTIVE_CONFIG_ID_STORAGE_KEY);
      if (storedActiveId) {
        setActiveConfigIdState(storedActiveId);
      }
    } catch (error) {
      console.error("Failed to load AI configs from localStorage", error);
    }
  }, []);

  const setActiveConfigId = useCallback((id: string | null) => {
    setActiveConfigIdState(id);
    if (id) {
        localStorage.setItem(ACTIVE_CONFIG_ID_STORAGE_KEY, id);
    } else {
        localStorage.removeItem(ACTIVE_CONFIG_ID_STORAGE_KEY);
    }
  }, []);
  
  const saveConfigs = (newConfigs: AiConfig[]) => {
      setConfigs(newConfigs);
      localStorage.setItem(CONFIGS_STORAGE_KEY, JSON.stringify(newConfigs));
  };

  const addConfig = (config: Omit<AiConfig, 'id'>) => {
    const newConfig = { ...config, id: crypto.randomUUID() };
    const newConfigs = [...configs, newConfig];
    saveConfigs(newConfigs);
    // If it's the first config, make it active
    if (configs.length === 0) {
        setActiveConfigId(newConfig.id);
    }
  };

  const updateConfig = (updatedConfig: AiConfig) => {
    const newConfigs = configs.map(c => (c.id === updatedConfig.id ? updatedConfig : c));
    saveConfigs(newConfigs);
  };

  const deleteConfig = (id: string) => {
    const newConfigs = configs.filter(c => c.id !== id);
    saveConfigs(newConfigs);
    if (activeConfigId === id) {
      setActiveConfigId(newConfigs.length > 0 ? newConfigs[0].id : null);
    }
  };

  const getConfigById = (id: string) => {
    return configs.find(c => c.id === id);
  };
  
  const activeConfig = activeConfigId ? configs.find(c => c.id === activeConfigId) ?? null : null;

  const value = {
    configs,
    activeConfigId,
    setActiveConfigId,
    addConfig,
    updateConfig,
    deleteConfig,
    getConfigById,
    activeConfig,
  };

  return (
    <AiConfigContext.Provider value={value}>
      {children}
    </AiConfigContext.Provider>
  );
};

export const useAiConfig = (): AiConfigContextType => {
  const context = useContext(AiConfigContext);
  if (context === undefined) {
    throw new Error('useAiConfig must be used within an AiConfigProvider');
  }
  return context;
};
import React, { useState, useMemo, useEffect } from 'react';
import { setAtPath } from '../utils/jsonUtils';
import { ChevronRightIcon, PlusIcon, TrashIcon, SearchIcon } from './icons';

type JsonValue = string | number | boolean | null | { [key: string]: JsonValue } | JsonValue[];
type Path = (string | number)[];

interface GenericJsonEditorProps {
  data: any;
  onChange: (newData: any) => void;
}

interface JsonNodeProps {
  nodeKey: string | number;
  value: JsonValue;
  path: Path;
  onValueChange: (path: Path, value: JsonValue) => void;
  defaultExpanded?: boolean;
  handleDeleteItem?: () => void;
  searchTerm: string;
}

const getDataType = (value: JsonValue): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

const nodeAndChildrenMatch = (key: string | number, value: JsonValue, query: string): boolean => {
    if (!query) return true;
    
    const lowerCaseQuery = query.toLowerCase();

    if (key.toString().toLowerCase().includes(lowerCaseQuery)) {
        return true;
    }

    if (typeof value !== 'object' || value === null) {
        return String(value).toLowerCase().includes(lowerCaseQuery);
    }
    
    for (const childKey in value) {
        if (Object.prototype.hasOwnProperty.call(value, childKey)) {
            if (nodeAndChildrenMatch(childKey, (value as any)[childKey], query)) {
                return true;
            }
        }
    }

    return false;
};

const PrimitiveEditor: React.FC<{ value: string | number | boolean; onChange: (newValue: any) => void }> = ({ value, onChange }) => {
  if (typeof value === 'string') {
    return <input type="text" value={value} onChange={e => onChange(e.target.value)} className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-green-300" />;
  }
  if (typeof value === 'number') {
    return <input type="number" value={value} onChange={e => onChange(parseFloat(e.target.value) || 0)} className="w-full bg-gray-900/50 border border-gray-600 rounded-md py-1 px-2 focus:outline-none focus:ring-1 focus:ring-blue-500 font-mono text-purple-300" />;
  }
  if (typeof value === 'boolean') {
    return (
      <label className="relative inline-flex items-center cursor-pointer">
        <input type="checkbox" checked={value} onChange={e => onChange(e.target.checked)} className="sr-only peer" />
        <div className="w-11 h-6 bg-gray-600 rounded-full peer peer-focus:ring-2 peer-focus:ring-blue-500 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-0.5 after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
      </label>
    );
  }
  return null;
};

const JsonNode: React.FC<JsonNodeProps> = ({ nodeKey, value, path, onValueChange, defaultExpanded = false, handleDeleteItem, searchTerm }) => {
  const shouldRender = useMemo(() => nodeAndChildrenMatch(nodeKey, value, searchTerm), [nodeKey, value, searchTerm]);
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);

  useEffect(() => {
    if (searchTerm) {
      setIsExpanded(true);
    } else {
      setIsExpanded(defaultExpanded);
    }
  }, [searchTerm, defaultExpanded]);

  if (!shouldRender) {
      return null;
  }
  
  const dataType = getDataType(value);
  const isExpandable = dataType === 'object' || dataType === 'array';
  const entries = isExpandable ? Object.entries(value as object) : [];
  const itemCount = entries.length;

  return (
    <div className="font-mono text-sm">
      <div className="flex items-center space-x-2 py-1 group">
        {isExpandable && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-0.5 rounded-sm hover:bg-gray-600">
            <ChevronRightIcon className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
          </button>
        )}
        <span className={`font-semibold ${Array.isArray(value) ? 'text-yellow-300' : 'text-cyan-300'}`}>{nodeKey}:</span>
        
        {handleDeleteItem && (
            <button onClick={handleDeleteItem} className="ml-2 p-1 rounded-full text-gray-500 hover:bg-red-900/50 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity" title="Delete item">
                <TrashIcon className="w-3.5 h-3.5" />
            </button>
        )}

        {!isExpandable ? (
          <div className="flex-grow">
            <PrimitiveEditor value={value as any} onChange={(newValue) => onValueChange(path, newValue)} />
          </div>
        ) : (
          <span className="text-gray-500">{isExpanded ? (Array.isArray(value) ? '[' : '{') : `${Array.isArray(value) ? '[...]' : '{...}'} (${itemCount} items)`}</span>
        )}
      </div>

      {isExpanded && isExpandable && (
        <div className="pl-6 border-l border-gray-700">
          {entries.map(([key, childValue]) => {
             const childPath = [...path, Array.isArray(value) ? parseInt(key, 10) : key];
             return (
                <JsonNode
                    key={key}
                    nodeKey={key}
                    value={childValue}
                    path={childPath}
                    onValueChange={onValueChange}
                    searchTerm={searchTerm}
                    handleDeleteItem={Array.isArray(value) ? () => {
                        if (window.confirm('Are you sure you want to delete this item? This action cannot be undone.')) {
                            const newArray = (value as JsonValue[]).filter((_, i) => i !== parseInt(key, 10));
                            onValueChange(path, newArray);
                        }
                    } : undefined}
                />
             );
          })}
          {Array.isArray(value) && (
              <div className="pl-4 pt-2">
                <button
                  onClick={() => {
                    const array = value as JsonValue[];
                    let newItem: JsonValue = null;
                    if (array.length > 0) {
                      const firstItem = array[0];
                      const type = getDataType(firstItem);
                      if (type === 'string') newItem = '';
                      else if (type === 'number') newItem = 0;
                      else if (type === 'boolean') newItem = false;
                      else if (type === 'object' && firstItem) {
                        newItem = Object.keys(firstItem).reduce((acc, k) => ({ ...acc, [k]: null }), {});
                      }
                    }
                    const newArray = [...array, newItem];
                    onValueChange(path, newArray);
                  }}
                  className="flex items-center gap-1.5 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                >
                  <PlusIcon className="w-4 h-4" />
                  <span>Add Item</span>
                </button>
              </div>
          )}
           <div className="text-gray-500">{Array.isArray(value) ? ']' : '}'}</div>
        </div>
      )}
    </div>
  );
};

export const GenericJsonEditor: React.FC<GenericJsonEditorProps> = ({ data, onChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  
  const handleValueChange = (path: Path, value: JsonValue) => {
    const newData = setAtPath(data, path, value);
    onChange(newData);
  };
  
  if (typeof data !== 'object' || data === null) {
      return (
          <div className="text-gray-400">
              The save file does not contain a valid JSON object.
          </div>
      )
  }

  return (
    <div className="bg-gray-900/50 p-4 rounded-lg">
      <div className="relative mb-4">
        <span className="absolute inset-y-0 left-0 flex items-center pl-3">
          <SearchIcon className="w-5 h-5 text-gray-400" />
        </span>
        <input
          type="text"
          placeholder="Search key or value..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-gray-700 border border-gray-600 rounded-md py-2 pl-10 pr-4 text-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
      {Object.entries(data).map(([key, value]) => (
        <JsonNode
          key={key}
          nodeKey={key}
          value={value as JsonValue}
          path={[key]}
          onValueChange={handleValueChange}
          defaultExpanded={true}
          searchTerm={searchTerm}
        />
      ))}
    </div>
  );
};

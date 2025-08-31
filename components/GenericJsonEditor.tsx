import React, { useState } from 'react';
import { setAtPath } from '../utils/jsonUtils';
import { ChevronRightIcon } from './icons';

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
}

const getDataType = (value: JsonValue): string => {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
};

// Fix: The original implementation had type narrowing issues. Using `typeof value` directly in the `if` conditions resolves these errors by ensuring TypeScript correctly narrows the type of `value` in each branch.
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

const JsonNode: React.FC<JsonNodeProps> = ({ nodeKey, value, path, onValueChange, defaultExpanded = false }) => {
  const [isExpanded, setIsExpanded] = useState(defaultExpanded);
  const dataType = getDataType(value);

  const isExpandable = dataType === 'object' || dataType === 'array';
  const entries = isExpandable ? Object.entries(value as object) : [];
  const itemCount = entries.length;

  return (
    <div className="font-mono text-sm">
      <div className="flex items-center space-x-2 py-1">
        {isExpandable && (
          <button onClick={() => setIsExpanded(!isExpanded)} className="p-0.5 rounded-sm hover:bg-gray-600">
            <ChevronRightIcon className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : 'rotate-0'}`} />
          </button>
        )}
        <span className={`font-semibold ${Array.isArray(value) ? 'text-yellow-300' : 'text-cyan-300'}`}>{nodeKey}:</span>
        
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
          {entries.map(([key, childValue]) => (
            <JsonNode
              key={key}
              nodeKey={key}
              value={childValue}
              path={[...path, Array.isArray(value) ? parseInt(key, 10) : key]}
              onValueChange={onValueChange}
            />
          ))}
           <div className="text-gray-500">{Array.isArray(value) ? ']' : '}'}</div>
        </div>
      )}
    </div>
  );
};

export const GenericJsonEditor: React.FC<GenericJsonEditorProps> = ({ data, onChange }) => {
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
      {Object.entries(data).map(([key, value]) => (
        <JsonNode
          key={key}
          nodeKey={key}
          value={value as JsonValue}
          path={[key]}
          onValueChange={handleValueChange}
          defaultExpanded={true}
        />
      ))}
    </div>
  );
};
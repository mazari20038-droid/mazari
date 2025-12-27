
import React from 'react';
import { Layer } from '../types';
import { Icon } from './Icon';

interface LayerPanelProps {
  layers: Layer[];
  selectedLayerId: string | null;
  onSelectLayer: (id: string) => void;
  onToggleVisibility: (id: string) => void;
  onToggleLock: (id: string) => void;
  onDeleteLayer: (id: string) => void;
  onReorder: (id: string, direction: 'up' | 'down') => void;
}

export const LayerPanel: React.FC<LayerPanelProps> = ({
  layers,
  selectedLayerId,
  onSelectLayer,
  onToggleVisibility,
  onToggleLock,
  onDeleteLayer,
  onReorder
}) => {
  const sortedLayers = [...layers].sort((a, b) => b.zIndex - a.zIndex);

  return (
    <div className="w-64 bg-gray-900 border-l border-gray-800 flex flex-col">
      <div className="p-4 border-b border-gray-800 flex items-center justify-between">
        <h3 className="font-bold text-sm">الطبقات (Layers)</h3>
        <span className="text-xs text-gray-500">{layers.length} عناصر</span>
      </div>
      
      <div className="flex-1 overflow-y-auto custom-scrollbar">
        {sortedLayers.map((layer) => (
          <div 
            key={layer.id}
            onClick={() => onSelectLayer(layer.id)}
            className={`group flex items-center gap-3 p-3 transition-colors cursor-pointer border-b border-gray-800/50 ${
              selectedLayerId === layer.id ? 'bg-blue-600/20' : 'hover:bg-gray-800'
            }`}
          >
            <button 
              onClick={(e) => { e.stopPropagation(); onToggleVisibility(layer.id); }}
              className={`transition-colors ${layer.visible ? 'text-gray-400' : 'text-gray-600'}`}
            >
              <Icon name={layer.visible ? 'Eye' : 'EyeOff'} size={14} />
            </button>
            
            <div className="flex-1 min-w-0">
              <div className="text-xs font-medium truncate">
                {layer.type === 'text' ? layer.content : `طبقة ${layer.type}`}
              </div>
            </div>

            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
              <button 
                onClick={(e) => { e.stopPropagation(); onToggleLock(layer.id); }}
                className={`p-1 hover:text-white ${layer.locked ? 'text-blue-500' : 'text-gray-500'}`}
              >
                <Icon name={layer.locked ? 'Lock' : 'Unlock'} size={12} />
              </button>
              <button 
                onClick={(e) => { e.stopPropagation(); onDeleteLayer(layer.id); }}
                className="p-1 text-gray-500 hover:text-red-500"
              >
                <Icon name="Trash2" size={12} />
              </button>
            </div>
          </div>
        ))}
        {layers.length === 0 && (
          <div className="p-8 text-center text-gray-500 text-xs italic">
            لا توجد طبقات بعد
          </div>
        )}
      </div>
    </div>
  );
};

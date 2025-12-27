
import React, { useRef, useEffect, useState } from 'react';
import { Layer } from '../types';

interface CanvasProps {
  layers: Layer[];
  width: number;
  height: number;
  selectedLayerId: string | null;
  onSelectLayer: (id: string | null) => void;
  onUpdateLayer: (id: string, updates: Partial<Layer>) => void;
}

export const Canvas: React.FC<CanvasProps> = ({ 
  layers, 
  width, 
  height, 
  selectedLayerId,
  onSelectLayer,
  onUpdateLayer
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [scale, setScale] = useState(1);

  useEffect(() => {
    const updateScale = () => {
      if (containerRef.current) {
        const { offsetWidth, offsetHeight } = containerRef.current;
        const padding = 40;
        const scaleW = (offsetWidth - padding) / width;
        const scaleH = (offsetHeight - padding) / height;
        setScale(Math.min(scaleW, scaleH, 1));
      }
    };

    updateScale();
    window.addEventListener('resize', updateScale);
    return () => window.removeEventListener('resize', updateScale);
  }, [width, height]);

  const handleLayerClick = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    onSelectLayer(id);
  };

  const sortedLayers = [...layers].sort((a, b) => a.zIndex - b.zIndex);

  return (
    <div 
      ref={containerRef}
      className="flex-1 bg-gray-800 flex items-center justify-center overflow-hidden relative"
      onClick={() => onSelectLayer(null)}
    >
      <div 
        className="bg-white shadow-2xl relative transition-all duration-300"
        style={{
          width: width * scale,
          height: height * scale,
          backgroundImage: 'radial-gradient(#d1d5db 1px, transparent 1px)',
          backgroundSize: '20px 20px',
        }}
      >
        {sortedLayers.map((layer) => (
          layer.visible && (
            <div
              key={layer.id}
              onClick={(e) => handleLayerClick(e, layer.id)}
              className={`absolute cursor-pointer transition-all ${
                selectedLayerId === layer.id ? 'outline outline-2 outline-blue-500 z-50' : ''
              }`}
              style={{
                left: layer.x * scale,
                top: layer.y * scale,
                width: layer.width * scale,
                height: layer.height * scale,
                transform: `rotate(${layer.rotation}deg)`,
                opacity: layer.opacity / 100,
                color: layer.color,
                zIndex: layer.zIndex,
              }}
            >
              {layer.type === 'text' && (
                <div style={{ 
                  fontSize: (layer.fontSize || 24) * scale,
                  fontFamily: layer.fontFamily || 'Cairo',
                  fontWeight: layer.fontWeight || '400',
                  lineHeight: 1,
                  whiteSpace: 'pre-wrap',
                }}>
                  {layer.content}
                </div>
              )}
              {layer.type === 'image' && (
                <img 
                  src={layer.content} 
                  alt="layer" 
                  className="w-full h-full object-cover select-none pointer-events-none"
                />
              )}
              {layer.type === 'shape' && (
                <div 
                  style={{ backgroundColor: layer.color || '#3b82f6' }}
                  className={`w-full h-full ${layer.content === 'circle' ? 'rounded-full' : ''}`}
                />
              )}
            </div>
          )
        ))}
      </div>
      
      {/* Scale Indicator */}
      <div className="absolute bottom-4 right-4 bg-gray-900/80 px-3 py-1 rounded text-xs text-gray-400">
        Zoom: {Math.round(scale * 100)}% | {width}x{height}
      </div>
    </div>
  );
};


import React from 'react';
import { Tool } from '../types';
import { Icon } from './Icon';

interface SidebarProps {
  activeTool: Tool;
  onToolSelect: (tool: Tool) => void;
}

const tools = [
  { id: 'template', icon: 'LayoutTemplate', label: 'قوالب' },
  { id: 'element', icon: 'Shapes', label: 'عناصر' },
  { id: 'image', icon: 'Image', label: 'صور' },
  { id: 'text', icon: 'Type', label: 'نص' },
  { id: 'ai', icon: 'Sparkles', label: 'ذكاء اصطناعي' },
  { id: 'brush', icon: 'Pencil', label: 'رسم' },
  { id: 'upload', icon: 'UploadCloud', label: 'رفع' },
] as const;

export const Sidebar: React.FC<SidebarProps> = ({ activeTool, onToolSelect }) => {
  return (
    <div className="w-20 bg-gray-950 flex flex-col items-center py-4 gap-4 border-l border-gray-800 z-50">
      <div className="mb-4 text-blue-500">
        <Icon name="Framer" size={32} />
      </div>
      
      {tools.map((tool) => (
        <button
          key={tool.id}
          onClick={() => onToolSelect(tool.id as any)}
          className={`flex flex-col items-center gap-1 w-full py-3 transition-all relative group ${
            activeTool === tool.id ? 'text-blue-500' : 'text-gray-500 hover:text-gray-300'
          }`}
        >
          {activeTool === tool.id && (
            <div className="absolute right-0 top-0 bottom-0 w-1 bg-blue-500 rounded-l" />
          )}
          <Icon name={tool.icon as any} size={24} />
          <span className="text-[10px] font-medium">{tool.label}</span>
          
          {/* Tooltip on hover */}
          <div className="absolute right-full mr-2 px-2 py-1 bg-gray-800 text-white text-[10px] rounded opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity whitespace-nowrap z-[100]">
            {tool.label}
          </div>
        </button>
      ))}
    </div>
  );
};

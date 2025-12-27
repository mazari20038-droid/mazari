
export type LayerType = 'text' | 'image' | 'shape' | 'drawing';

export interface Layer {
  id: string;
  type: LayerType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number;
  content: string; // text string, image URL, or SVG path
  color?: string;
  opacity: number;
  visible: boolean;
  locked: boolean;
  fontSize?: number;
  fontWeight?: string;
  fontFamily?: string;
  zIndex: number;
}

// Added 'element' and 'upload' to support all sidebar navigation states
export type Tool = 'select' | 'text' | 'image' | 'shape' | 'brush' | 'ai' | 'template' | 'element' | 'upload';

export interface Project {
  id: string;
  name: string;
  width: number;
  height: number;
  layers: Layer[];
  lastModified: number;
}

export enum Language {
  AR = 'ar',
  EN = 'en',
  FR = 'fr'
}
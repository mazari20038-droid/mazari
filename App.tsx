
import React, { useState, useCallback, useRef } from 'react';
import { Layer, Tool, Project } from './types';
import { Sidebar } from './components/Sidebar';
import { Canvas } from './components/Canvas';
import { LayerPanel } from './components/LayerPanel';
import { Icon } from './components/Icon';
import * as GeminiService from './services/geminiService';

const App: React.FC = () => {
  const [project, setProject] = useState<Project>({
    id: 'p1',
    name: 'مشروع جديد',
    width: 800,
    height: 800,
    layers: [],
    lastModified: Date.now()
  });
  
  const [activeTool, setActiveTool] = useState<Tool>('template');
  const [selectedLayerId, setSelectedLayerId] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiPrompt, setAiPrompt] = useState('');
  
  const addLayer = (type: Layer['type'], content: string, overrides: Partial<Layer> = {}) => {
    const newLayer: Layer = {
      id: Math.random().toString(36).substr(2, 9),
      type,
      content,
      x: (project.width / 2) - 100,
      y: (project.height / 2) - 50,
      width: type === 'text' ? 300 : 200,
      height: type === 'text' ? 100 : 200,
      rotation: 0,
      opacity: 100,
      visible: true,
      locked: false,
      zIndex: project.layers.length,
      color: type === 'text' ? '#000000' : undefined,
      ...overrides
    };
    
    setProject(prev => ({
      ...prev,
      layers: [...prev.layers, newLayer],
      lastModified: Date.now()
    }));
    setSelectedLayerId(newLayer.id);
  };

  const updateLayer = (id: string, updates: Partial<Layer>) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.map(l => l.id === id ? { ...l, ...updates } : l),
      lastModified: Date.now()
    }));
  };

  const deleteLayer = (id: string) => {
    setProject(prev => ({
      ...prev,
      layers: prev.layers.filter(l => l.id !== id),
      lastModified: Date.now()
    }));
    if (selectedLayerId === id) setSelectedLayerId(null);
  };

  const handleAiGenerate = async () => {
    if (!aiPrompt.trim()) return;
    setIsGenerating(true);
    try {
      const imageUrl = await GeminiService.generateDesignFromPrompt(aiPrompt);
      if (imageUrl) {
        addLayer('image', imageUrl, { 
          width: project.width * 0.8, 
          height: project.height * 0.8,
          x: project.width * 0.1,
          y: project.height * 0.1 
        });
      }
    } finally {
      setIsGenerating(false);
      setAiPrompt('');
    }
  };

  const handleBgRemove = async () => {
    const selected = project.layers.find(l => l.id === selectedLayerId);
    if (!selected || selected.type !== 'image') return;
    
    setIsGenerating(true);
    try {
      const newUrl = await GeminiService.removeBackground(selected.content);
      if (newUrl) {
        updateLayer(selected.id, { content: newUrl });
      }
    } finally {
      setIsGenerating(false);
    }
  };

  const exportProject = (format: string) => {
    alert(`تم البدء في تصدير المشروع بصيغة ${format.toUpperCase()}`);
    // Real implementation would use canvas toBlob and download
  };

  return (
    <div className="flex h-screen w-full bg-gray-950 font-['Cairo']" dir="rtl">
      {/* Sidebar Tool Navigator */}
      <Sidebar activeTool={activeTool} onToolSelect={setActiveTool} />
      
      {/* Tool Sidebar Content */}
      <div className="w-80 bg-gray-900 border-l border-gray-800 flex flex-col z-40">
        <div className="p-4 border-b border-gray-800">
          <h2 className="text-sm font-bold text-gray-400 uppercase tracking-wider">
            {activeTool === 'template' && 'القوالب المقترحة'}
            {activeTool === 'element' && 'العناصر والأشكال'}
            {activeTool === 'image' && 'مكتبة الصور'}
            {activeTool === 'text' && 'أدوات النصوص'}
            {activeTool === 'ai' && 'الذكاء الاصطناعي'}
            {activeTool === 'brush' && 'أدوات الرسم'}
            {activeTool === 'upload' && 'رفع الملفات'}
          </h2>
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          {activeTool === 'ai' && (
            <div className="space-y-6">
              <div className="p-4 bg-blue-600/10 border border-blue-500/20 rounded-xl space-y-3">
                <div className="flex items-center gap-2 text-blue-400">
                  <Icon name="Sparkles" size={20} />
                  <span className="font-bold text-sm">Creavo AI</span>
                </div>
                <p className="text-xs text-gray-400">أوصف التصميم الذي تحلم به وسيقوم الذكاء الاصطناعي بإنشائه لك في ثوانٍ.</p>
                <textarea 
                  value={aiPrompt}
                  onChange={(e) => setAiPrompt(e.target.value)}
                  placeholder="مثال: بوست إنستغرام لشركة تقنية، ألوان زرقاء، تصميم عصري..."
                  className="w-full h-32 bg-gray-800 border border-gray-700 rounded-lg p-3 text-xs focus:ring-1 focus:ring-blue-500 outline-none resize-none"
                />
                <button 
                  onClick={handleAiGenerate}
                  disabled={isGenerating || !aiPrompt}
                  className="w-full bg-blue-600 hover:bg-blue-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm py-2 rounded-lg font-bold transition-colors flex items-center justify-center gap-2"
                >
                  {isGenerating ? (
                    <Icon name="Loader2" className="animate-spin" size={16} />
                  ) : (
                    <Icon name="Zap" size={16} />
                  )}
                  {isGenerating ? 'جاري التصميم...' : 'إنشاء التصميم'}
                </button>
              </div>

              <div className="space-y-4">
                <h4 className="text-xs font-bold text-gray-500">أدوات ذكية سريعة</h4>
                <button 
                  onClick={handleBgRemove}
                  className="w-full bg-gray-800 hover:bg-gray-700 p-4 rounded-xl flex items-center gap-4 transition-all"
                >
                  <div className="p-2 bg-purple-600/20 text-purple-400 rounded-lg">
                    <Icon name="Eraser" size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold">إزالة الخلفية</div>
                    <div className="text-[10px] text-gray-500">بنقرة واحدة من أي صورة</div>
                  </div>
                </button>
                <button className="w-full bg-gray-800 hover:bg-gray-700 p-4 rounded-xl flex items-center gap-4 transition-all opacity-50 cursor-not-allowed">
                  <div className="p-2 bg-green-600/20 text-green-400 rounded-lg">
                    <Icon name="Maximize" size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold">تحسين الجودة (Upscale)</div>
                    <div className="text-[10px] text-gray-500">زيادة دقة الصور القديمة</div>
                  </div>
                </button>
              </div>
            </div>
          )}

          {activeTool === 'text' && (
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => addLayer('text', 'عنوان رئيسي', { fontSize: 48, fontWeight: '700' })}
                className="w-full text-right p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span className="text-2xl font-bold">إضافة عنوان رئيسي</span>
              </button>
              <button 
                onClick={() => addLayer('text', 'عنوان فرعي', { fontSize: 24, fontWeight: '600' })}
                className="w-full text-right p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span className="text-lg font-semibold">إضافة عنوان فرعي</span>
              </button>
              <button 
                onClick={() => addLayer('text', 'نص فقرة صغير هنا...', { fontSize: 16 })}
                className="w-full text-right p-4 bg-gray-800 rounded-lg hover:bg-gray-700 transition-colors"
              >
                <span className="text-sm">إضافة نص فقرة</span>
              </button>
            </div>
          )}

          {activeTool === 'element' && (
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => addLayer('shape', 'square')} className="aspect-square bg-gray-800 rounded-lg hover:bg-gray-700 flex items-center justify-center p-4">
                <div className="w-full h-full bg-gray-600" />
              </button>
              <button onClick={() => addLayer('shape', 'circle')} className="aspect-square bg-gray-800 rounded-lg hover:bg-gray-700 flex items-center justify-center p-4">
                <div className="w-full h-full bg-gray-600 rounded-full" />
              </button>
              {[1, 2, 3, 4].map(i => (
                <div key={i} className="aspect-square bg-gray-800/50 rounded-lg border border-dashed border-gray-700 flex items-center justify-center">
                  <Icon name="Plus" size={16} className="text-gray-600" />
                </div>
              ))}
            </div>
          )}
          
          {activeTool === 'template' && (
            <div className="space-y-4">
              {[
                { name: 'بوست إنستغرام', dim: '1080x1080', icon: 'Instagram' },
                { name: 'قصص إنستغرام', dim: '1080x1920', icon: 'Smartphone' },
                { name: 'غلاف فيسبوك', dim: '820x312', icon: 'Facebook' },
                { name: 'بطاقة أعمال', dim: '1050x600', icon: 'Contact' }
              ].map((tmp, i) => (
                <button 
                  key={i} 
                  className="w-full bg-gray-800 hover:bg-gray-700 p-4 rounded-xl flex items-center gap-4 transition-all"
                  onClick={() => setProject(p => ({ ...p, width: parseInt(tmp.dim.split('x')[0]), height: parseInt(tmp.dim.split('x')[1]) }))}
                >
                  <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg">
                    <Icon name={tmp.icon as any} size={20} />
                  </div>
                  <div className="text-right">
                    <div className="text-xs font-bold">{tmp.name}</div>
                    <div className="text-[10px] text-gray-500">{tmp.dim} بكسل</div>
                  </div>
                </button>
              ))}
            </div>
          )}
          
          {(activeTool === 'image' || activeTool === 'upload') && (
            <div className="grid grid-cols-2 gap-2">
              {[1, 2, 3, 4, 5, 6].map(i => (
                <button 
                  key={i}
                  onClick={() => addLayer('image', `https://picsum.photos/seed/${i + 10}/800/800`)}
                  className="aspect-square overflow-hidden rounded-lg group relative"
                >
                  <img src={`https://picsum.photos/seed/${i + 10}/200/200`} className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-opacity">
                    <Icon name="Plus" size={24} className="text-white" />
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex-1 flex flex-col h-full bg-gray-800 relative">
        {/* Top bar */}
        <div className="h-16 bg-gray-900 border-b border-gray-800 flex items-center justify-between px-6 z-30">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-3">
              <Icon name="ChevronRight" className="text-gray-500 cursor-pointer" />
              <input 
                type="text" 
                value={project.name}
                onChange={(e) => setProject(p => ({ ...p, name: e.target.value }))}
                className="bg-transparent font-bold text-sm text-gray-200 outline-none border-b border-transparent hover:border-gray-700 focus:border-blue-500 py-1 transition-colors"
              />
            </div>
            
            <div className="h-6 w-[1px] bg-gray-800" />
            
            <div className="flex items-center gap-2">
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all" title="تراجع">
                <Icon name="Undo" size={18} />
              </button>
              <button className="p-2 text-gray-400 hover:text-white hover:bg-gray-800 rounded-lg transition-all" title="إعادة">
                <Icon name="Redo" size={18} />
              </button>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-bold text-gray-400 hover:text-white transition-all flex items-center gap-2">
              <Icon name="Share2" size={16} />
              <span>مشاركة</span>
            </button>
            
            <div className="relative group">
              <button 
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-2 rounded-lg text-sm font-bold shadow-lg shadow-blue-500/20 transition-all flex items-center gap-2"
              >
                <span>تنزيل</span>
                <Icon name="ChevronDown" size={14} />
              </button>
              
              <div className="absolute left-0 top-full mt-2 w-48 bg-gray-900 border border-gray-800 rounded-xl shadow-2xl p-2 opacity-0 group-hover:opacity-100 pointer-events-none group-hover:pointer-events-auto transition-all">
                {['png', 'jpeg', 'pdf', 'svg', 'mp4'].map(fmt => (
                  <button 
                    key={fmt}
                    onClick={() => exportProject(fmt)}
                    className="w-full text-right px-4 py-2 hover:bg-gray-800 rounded-lg text-xs font-bold uppercase"
                  >
                    تصدير كـ {fmt}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area */}
        <Canvas 
          layers={project.layers}
          width={project.width}
          height={project.height}
          selectedLayerId={selectedLayerId}
          onSelectLayer={setSelectedLayerId}
          onUpdateLayer={updateLayer}
        />
        
        {/* Layer Controls context toolbar */}
        {selectedLayerId && (
          <div className="absolute top-20 left-1/2 -translate-x-1/2 bg-gray-900 border border-gray-800 px-4 py-2 rounded-xl shadow-2xl flex items-center gap-4 z-50">
            {project.layers.find(l => l.id === selectedLayerId)?.type === 'text' && (
              <>
                <div className="flex items-center gap-2">
                  <button className="p-2 hover:bg-gray-800 rounded">B</button>
                  <button className="p-2 hover:bg-gray-800 rounded italic">I</button>
                  <button className="p-2 hover:bg-gray-800 rounded underline">U</button>
                </div>
                <div className="h-4 w-[1px] bg-gray-800" />
              </>
            )}
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-gray-800 rounded text-red-400" onClick={() => deleteLayer(selectedLayerId)}>
                <Icon name="Trash2" size={18} />
              </button>
              <button className="p-2 hover:bg-gray-800 rounded text-gray-400" onClick={() => setSelectedLayerId(null)}>
                <Icon name="X" size={18} />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Layers Panel */}
      <LayerPanel 
        layers={project.layers}
        selectedLayerId={selectedLayerId}
        onSelectLayer={setSelectedLayerId}
        onToggleVisibility={(id) => updateLayer(id, { visible: !project.layers.find(l => l.id === id)?.visible })}
        onToggleLock={(id) => updateLayer(id, { locked: !project.layers.find(l => l.id === id)?.locked })}
        onDeleteLayer={deleteLayer}
        onReorder={(id, dir) => {
          const idx = project.layers.findIndex(l => l.id === id);
          if (dir === 'up' && idx < project.layers.length - 1) {
             const newLayers = [...project.layers];
             [newLayers[idx].zIndex, newLayers[idx+1].zIndex] = [newLayers[idx+1].zIndex, newLayers[idx].zIndex];
             setProject(p => ({ ...p, layers: newLayers }));
          }
        }}
      />

      {/* Global Processing State */}
      {isGenerating && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex flex-col items-center justify-center">
          <div className="bg-gray-900 p-8 rounded-3xl border border-gray-800 flex flex-col items-center gap-6 max-w-sm text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-blue-600/20 border-t-blue-500 rounded-full animate-spin" />
              <Icon name="Sparkles" className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-blue-400" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-xl font-bold">Creavo AI يعمل الآن</h3>
              <p className="text-sm text-gray-500">نحن نقوم بتحويل خيالك إلى حقيقة... قد يستغرق الأمر بضع ثوانٍ ليظهر السحر!</p>
            </div>
            <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
              <div className="bg-blue-600 h-full w-1/2 animate-[shimmer_2s_infinite]" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default App;

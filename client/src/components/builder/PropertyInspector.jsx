import React from 'react';
import {
  Type,
  Palette,
  Maximize2,
  Sliders,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Code,
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown
} from 'lucide-react';

const PropertyInspector = ({
  selectedElement,
  selectedSection,
  onUpdateElement,
  onUpdateSection,
  onDeleteElement,
  onDuplicateElement,
  onMoveElement
}) => {
  if (!selectedElement && !selectedSection) {
    return (
      <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center text-center text-slate-400 select-none shrink-0">
        <Sliders className="w-10 h-10 mb-3 opacity-40" />
        <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
          No Element Selected
        </h4>
        <p className="text-[11px] max-w-[200px]">
          Click on any element or section in the center canvas to customize typography, colors, padding, and layout.
        </p>
      </div>
    );
  }

  // ELEMENT PROPERTIES
  if (selectedElement) {
    const { id, type, content = {}, styles = {} } = selectedElement;

    const handleContentChange = (key, value) => {
      onUpdateElement(id, {
        content: { ...content, [key]: value }
      });
    };

    const handleStyleChange = (key, value) => {
      onUpdateElement(id, {
        styles: { ...styles, [key]: value }
      });
    };

    return (
      <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 flex flex-col h-full shrink-0 select-none overflow-y-auto">
        {/* Header */}
        <div className="p-4 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
              Element Inspector
            </span>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white capitalize">
              {type} Properties
            </h3>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => onDuplicateElement(id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Duplicate"
            >
              <Copy className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onDeleteElement(id)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/30"
              title="Delete"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        <div className="p-4 space-y-6">
          
          {/* SECTION 1: CONTENT SETTINGS */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Content
            </h4>

            {(type === 'heading' || type === 'paragraph' || type === 'badge' || type === 'button') && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Text Content
                </label>
                <textarea
                  rows="3"
                  value={content.text || ''}
                  onChange={(e) => handleContentChange('text', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {type === 'heading' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  HTML Heading Tag
                </label>
                <select
                  value={content.level || 'h1'}
                  onChange={(e) => handleContentChange('level', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                >
                  <option value="h1">H1 — Main Page Title</option>
                  <option value="h2">H2 — Section Header</option>
                  <option value="h3">H3 — Subtitle</option>
                  <option value="h4">H4 — Small Header</option>
                </select>
              </div>
            )}

            {type === 'button' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Button Link / URL
                </label>
                <input
                  type="text"
                  value={content.link || '#'}
                  onChange={(e) => handleContentChange('link', e.target.value)}
                  placeholder="https://... or #checkout"
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {type === 'image' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Image URL
                </label>
                <input
                  type="text"
                  value={content.url || ''}
                  onChange={(e) => handleContentChange('url', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {type === 'video' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Video Embed URL (YouTube/Vimeo)
                </label>
                <input
                  type="text"
                  value={content.embedUrl || ''}
                  onChange={(e) => handleContentChange('embedUrl', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            )}

            {type === 'countdown' && (
              <div>
                <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Timer Label
                </label>
                <input
                  type="text"
                  value={content.label || ''}
                  onChange={(e) => handleContentChange('label', e.target.value)}
                  className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
                />
              </div>
            )}
          </div>

          {/* SECTION 2: TYPOGRAPHY & ALIGNMENT */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Typography & Alignment
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Font Size ({styles.fontSize || 'default'})
              </label>
              <input
                type="range"
                min="12"
                max="72"
                value={parseInt(styles.fontSize) || 18}
                onChange={(e) => handleStyleChange('fontSize', `${e.target.value}px`)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Font Weight
              </label>
              <select
                value={styles.fontWeight || '400'}
                onChange={(e) => handleStyleChange('fontWeight', e.target.value)}
                className="w-full px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white"
              >
                <option value="400">Regular (400)</option>
                <option value="500">Medium (500)</option>
                <option value="600">Semibold (600)</option>
                <option value="700">Bold (700)</option>
                <option value="800">Extra Bold (800)</option>
                <option value="900">Black (900)</option>
              </select>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Alignment
              </label>
              <div className="grid grid-cols-3 gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-lg">
                {['left', 'center', 'right'].map((align) => (
                  <button
                    key={align}
                    onClick={() => handleStyleChange('textAlign', align)}
                    className={`py-1 text-xs rounded-md font-semibold capitalize transition-colors ${
                      styles.textAlign === align
                        ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs'
                        : 'text-slate-600 dark:text-slate-400'
                    }`}
                  >
                    {align}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* SECTION 3: COLORS & BACKGROUND */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Colors & Styling
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Text Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styles.color || '#0f172a'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.color || '#0f172a'}
                  onChange={(e) => handleStyleChange('color', e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Background Color
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={styles.backgroundColor || '#ffffff'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="w-8 h-8 rounded border border-slate-300 cursor-pointer"
                />
                <input
                  type="text"
                  value={styles.backgroundColor || 'transparent'}
                  onChange={(e) => handleStyleChange('backgroundColor', e.target.value)}
                  className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Border Radius ({styles.borderRadius || '0px'})
              </label>
              <input
                type="range"
                min="0"
                max="32"
                value={parseInt(styles.borderRadius) || 0}
                onChange={(e) => handleStyleChange('borderRadius', `${e.target.value}px`)}
                className="w-full"
              />
            </div>
          </div>

          {/* SECTION 4: SPACING & PADDING */}
          <div className="space-y-3 pt-4 border-t border-slate-100 dark:border-slate-800">
            <h4 className="text-xs font-bold uppercase text-slate-400 tracking-wider">
              Spacing & Margins
            </h4>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Margin Bottom ({styles.marginBottom || '0px'})
              </label>
              <input
                type="range"
                min="0"
                max="64"
                value={parseInt(styles.marginBottom) || 0}
                onChange={(e) => handleStyleChange('marginBottom', `${e.target.value}px`)}
                className="w-full"
              />
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Padding ({styles.padding || '0px'})
              </label>
              <input
                type="range"
                min="0"
                max="40"
                value={parseInt(styles.padding) || 0}
                onChange={(e) => handleStyleChange('padding', `${e.target.value}px`)}
                className="w-full"
              />
            </div>
          </div>

        </div>
      </div>
    );
  }

  // SECTION PROPERTIES
  if (selectedSection) {
    const { id, name, styles = {} } = selectedSection;

    const handleSectionStyle = (key, value) => {
      onUpdateSection(id, {
        styles: { ...styles, [key]: value }
      });
    };

    return (
      <div className="w-80 bg-white dark:bg-slate-900 border-l border-slate-200 dark:border-slate-800 p-4 flex flex-col h-full shrink-0 select-none overflow-y-auto">
        <div className="pb-3 border-b border-slate-200 dark:border-slate-800 mb-4">
          <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
            Section Inspector
          </span>
          <h3 className="text-sm font-bold text-slate-900 dark:text-white">
            {name || 'Section'} Styles
          </h3>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Background Color
            </label>
            <div className="flex items-center gap-2">
              <input
                type="color"
                value={styles.backgroundColor || '#ffffff'}
                onChange={(e) => handleSectionStyle('backgroundColor', e.target.value)}
                className="w-8 h-8 rounded border cursor-pointer"
              />
              <input
                type="text"
                value={styles.backgroundColor || '#ffffff'}
                onChange={(e) => handleSectionStyle('backgroundColor', e.target.value)}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 font-mono"
              />
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Vertical Padding ({styles.padding || '40px'})
            </label>
            <input
              type="range"
              min="10"
              max="140"
              value={parseInt(styles.padding) || 40}
              onChange={(e) => handleSectionStyle('padding', `${e.target.value}px 20px`)}
              className="w-full"
            />
          </div>
        </div>
      </div>
    );
  }

  return null;
};

export default PropertyInspector;


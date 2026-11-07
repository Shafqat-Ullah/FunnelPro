import React, { useState, useEffect } from 'react';
import {
  Trash2,
  Copy,
  ArrowUp,
  ArrowDown,
  Clock,
  CheckCircle2,
  Star,
  ChevronDown,
  ShoppingBag
} from 'lucide-react';

const CanvasRenderer = ({
  sections,
  selectedElementId,
  selectedSectionId,
  onSelectElement,
  onSelectSection,
  onDeleteElement,
  onDuplicateElement,
  onMoveElement,
  isPreview = false
}) => {
  // Live countdown timer state for demo
  const [timeLeft, setTimeLeft] = useState({ hours: 14, minutes: 32, seconds: 48 });

  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev.seconds > 0) return { ...prev, seconds: prev.seconds - 1 };
        if (prev.minutes > 0) return { ...prev, minutes: 59, seconds: 59 };
        if (prev.hours > 0) return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        return prev;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const renderElement = (el, sectionId, colId, elIndex, totalElements) => {
    const isSelected = !isPreview && selectedElementId === el.id;
    const { type, content = {}, styles = {} } = el;

    const baseStyle = {
      ...styles,
      transition: 'all 0.15s ease'
    };

    let innerComponent = null;

    switch (type) {
      case 'heading': {
        const Tag = content.level || 'h1';
        innerComponent = (
          <Tag style={baseStyle} className="leading-tight">
            {content.text || 'Heading Title'}
          </Tag>
        );
        break;
      }
      case 'paragraph':
        innerComponent = (
          <p style={baseStyle} className="leading-relaxed">
            {content.text || 'Paragraph text content.'}
          </p>
        );
        break;
      case 'badge':
        innerComponent = (
          <span
            style={{
              backgroundColor: content.bgColor || '#eef2ff',
              color: content.color || '#6366f1',
              ...baseStyle
            }}
            className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider"
          >
            {content.text || 'SPECIAL BADGE'}
          </span>
        );
        break;
      case 'button':
        innerComponent = (
          <div style={{ textAlign: styles.textAlign || 'center' }}>
            <button
              style={{
                backgroundColor: styles.backgroundColor || '#6366f1',
                color: styles.color || '#ffffff',
                borderRadius: styles.borderRadius || '10px',
                padding: styles.padding || '14px 32px',
                fontSize: styles.fontSize || '16px',
                fontWeight: styles.fontWeight || '700',
                ...baseStyle
              }}
              className="shadow-lg hover:opacity-95 active:scale-95 transition-all inline-block"
            >
              {content.text || 'Click To Continue'}
            </button>
          </div>
        );
        break;
      case 'form':
        innerComponent = (
          <div
            style={{
              maxWidth: styles.maxWidth || '440px',
              margin: styles.margin || '0 auto',
              ...baseStyle
            }}
            className="p-6 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-200 dark:border-slate-800"
          >
            <div className="space-y-3">
              {(content.fields || [{ placeholder: 'First Name' }, { placeholder: 'Email Address' }]).map((f, i) => (
                <input
                  key={i}
                  type={f.type || 'text'}
                  placeholder={f.placeholder || 'Enter value...'}
                  disabled={!isPreview}
                  className="w-full px-4 py-3 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 focus:outline-none"
                />
              ))}
              <button
                type="button"
                className="w-full py-3.5 px-6 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md transition-all"
              >
                {content.buttonText || 'Submit Form'}
              </button>
            </div>
          </div>
        );
        break;
      case 'countdown':
        innerComponent = (
          <div
            style={baseStyle}
            className="inline-flex flex-col items-center justify-center p-4 bg-slate-900 text-white rounded-2xl shadow-lg border border-slate-800"
          >
            {content.label && (
              <span className="text-[11px] uppercase tracking-wider text-indigo-400 font-bold mb-2">
                {content.label}
              </span>
            )}
            <div className="flex items-center gap-3 text-center">
              <div className="px-3 py-1.5 bg-slate-800 rounded-lg min-w-[48px]">
                <span className="text-xl font-black">{String(timeLeft.hours).padStart(2, '0')}</span>
                <span className="text-[9px] block text-slate-400 uppercase">Hours</span>
              </div>
              <span className="text-xl font-bold text-slate-600">:</span>
              <div className="px-3 py-1.5 bg-slate-800 rounded-lg min-w-[48px]">
                <span className="text-xl font-black">{String(timeLeft.minutes).padStart(2, '0')}</span>
                <span className="text-[9px] block text-slate-400 uppercase">Mins</span>
              </div>
              <span className="text-xl font-bold text-slate-600">:</span>
              <div className="px-3 py-1.5 bg-slate-800 rounded-lg min-w-[48px]">
                <span className="text-xl font-black text-rose-400">{String(timeLeft.seconds).padStart(2, '0')}</span>
                <span className="text-[9px] block text-slate-400 uppercase">Secs</span>
              </div>
            </div>
          </div>
        );
        break;
      case 'image':
        innerComponent = (
          <div style={{ textAlign: styles.textAlign || 'center' }}>
            <img
              src={content.url || 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=800'}
              alt={content.alt || 'Visual'}
              style={{
                borderRadius: styles.borderRadius || '16px',
                maxWidth: styles.maxWidth || '100%',
                margin: '0 auto',
                ...baseStyle
              }}
              className="shadow-xl"
            />
          </div>
        );
        break;
      case 'video':
        innerComponent = (
          <div
            style={{
              maxWidth: styles.maxWidth || '720px',
              margin: '0 auto',
              ...baseStyle
            }}
            className="aspect-video rounded-2xl overflow-hidden shadow-2xl border border-slate-200 dark:border-slate-800 bg-black"
          >
            <iframe
              src={content.embedUrl || 'https://www.youtube.com/embed/dQw4w9WgXcQ'}
              title="Video"
              className="w-full h-full"
              allowFullScreen
            />
          </div>
        );
        break;
      case 'testimonial':
        innerComponent = (
          <div
            style={{
              maxWidth: styles.maxWidth || '640px',
              margin: styles.margin || '0 auto',
              ...baseStyle
            }}
            className="p-6 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-left"
          >
            <div className="flex items-center gap-1 text-amber-400 mb-3">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="w-4 h-4 fill-amber-400" />
              ))}
            </div>
            <p className="text-sm font-medium text-slate-700 dark:text-slate-300 italic mb-4">
              "{content.quote || 'This platform completely transformed our online sales flow!'}"
            </p>
            <div className="flex items-center gap-3">
              <img
                src={content.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100'}
                alt={content.author || 'Reviewer'}
                className="w-10 h-10 rounded-full object-cover border border-slate-200"
              />
              <div>
                <h5 className="text-xs font-bold text-slate-900 dark:text-white">
                  {content.author || 'Marcus Vance'}
                </h5>
                <p className="text-[11px] text-slate-400">
                  {content.role || 'Founder & CEO'}
                </p>
              </div>
            </div>
          </div>
        );
        break;
      case 'pricing':
        innerComponent = (
          <div
            style={{
              maxWidth: styles.maxWidth || '400px',
              margin: '0 auto',
              ...baseStyle
            }}
            className="p-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-indigo-600 shadow-2xl text-center relative overflow-hidden"
          >
            <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider py-1 px-4 rounded-bl-xl">
              Most Popular
            </span>
            <h4 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
              {content.planName || 'Growth Mastermind'}
            </h4>
            <div className="flex items-baseline justify-center gap-1 mb-6">
              <span className="text-4xl font-black text-slate-900 dark:text-white">
                ${content.price || 97}
              </span>
              <span className="text-xs text-slate-400">{content.period || '/month'}</span>
            </div>
            <ul className="space-y-3 text-left text-xs text-slate-600 dark:text-slate-300 mb-6">
              {(content.features || ['Unlimited Pages', 'Stripe Integration', 'Analytics']).map((feat, i) => (
                <li key={i} className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
                  <span>{feat}</span>
                </li>
              ))}
            </ul>
            <button className="w-full py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm shadow-md">
              Start Your 14-Day Free Trial
            </button>
          </div>
        );
        break;
      case 'faq':
        innerComponent = (
          <div
            style={{
              maxWidth: styles.maxWidth || '600px',
              margin: '0 auto',
              ...baseStyle
            }}
            className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-left"
          >
            <div className="flex items-center justify-between font-bold text-sm text-slate-900 dark:text-white">
              <span>{content.question || 'Frequently Asked Question'}</span>
              <ChevronDown className="w-4 h-4 text-slate-400" />
            </div>
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              {content.answer || 'Detailed answer addressing customer objections and specifications.'}
            </p>
          </div>
        );
        break;
      case 'product-card':
        innerComponent = (
          <div
            style={{
              maxWidth: styles.maxWidth || '360px',
              margin: '0 auto',
              ...baseStyle
            }}
            className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xl text-left"
          >
            <img
              src={content.image || 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600'}
              alt={content.name}
              className="w-full h-48 object-cover rounded-xl mb-4"
            />
            <h4 className="text-base font-bold text-slate-900 dark:text-white mb-1">
              {content.name || 'Digital Accelerator'}
            </h4>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">
                ${content.price || 149}
              </span>
              {content.comparePrice && (
                <span className="text-xs text-slate-400 line-through">
                  ${content.comparePrice}
                </span>
              )}
            </div>
            <button className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white dark:bg-indigo-600 dark:hover:bg-indigo-500 font-semibold text-xs flex items-center justify-center gap-2">
              <ShoppingBag className="w-4 h-4" />
              Order Now
            </button>
          </div>
        );
        break;
      case 'html':
        innerComponent = (
          <div
            style={baseStyle}
            dangerouslySetInnerHTML={{ __html: content.code || '<div>Custom HTML</div>' }}
          />
        );
        break;
      default:
        innerComponent = <div style={baseStyle}>{content.text || 'Block'}</div>;
    }

    if (isPreview) {
      return (
        <div key={el.id} className="relative my-2">
          {innerComponent}
        </div>
      );
    }

    return (
      <div
        key={el.id}
        onClick={(e) => {
          e.stopPropagation();
          onSelectElement(el);
        }}
        className={`relative group my-2 cursor-pointer transition-all rounded-lg ${
          isSelected
            ? 'ring-2 ring-indigo-600 ring-offset-2 dark:ring-offset-slate-900'
            : 'hover:ring-1 hover:ring-indigo-400/60'
        }`}
      >
        {/* Floating Action Toolbar (When selected or hovered) */}
        {isSelected && (
          <div className="absolute -top-7 right-2 z-30 flex items-center gap-0.5 bg-indigo-600 text-white rounded-lg shadow-lg px-1.5 py-0.5 text-[10px] animate-fade-in">
            <span className="font-bold uppercase tracking-wider mr-1 px-1">
              {type}
            </span>
            <button
              disabled={elIndex === 0}
              onClick={(e) => {
                e.stopPropagation();
                onMoveElement(sectionId, colId, elIndex, 'up');
              }}
              className="p-1 hover:bg-indigo-700 rounded disabled:opacity-40"
              title="Move Up"
            >
              <ArrowUp className="w-3 h-3" />
            </button>
            <button
              disabled={elIndex === totalElements - 1}
              onClick={(e) => {
                e.stopPropagation();
                onMoveElement(sectionId, colId, elIndex, 'down');
              }}
              className="p-1 hover:bg-indigo-700 rounded disabled:opacity-40"
              title="Move Down"
            >
              <ArrowDown className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDuplicateElement(el.id);
              }}
              className="p-1 hover:bg-indigo-700 rounded"
              title="Duplicate"
            >
              <Copy className="w-3 h-3" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                onDeleteElement(el.id);
              }}
              className="p-1 hover:bg-rose-600 rounded"
              title="Delete"
            >
              <Trash2 className="w-3 h-3" />
            </button>
          </div>
        )}

        {innerComponent}
      </div>
    );
  };

  return (
    <div className="min-h-full w-full">
      {sections.length === 0 ? (
        <div className="py-24 text-center text-slate-400">
          <p className="text-sm font-semibold">Your canvas is empty.</p>
          <p className="text-xs mt-1">Select an element or section template from the left palette to get started.</p>
        </div>
      ) : (
        sections.map((section) => {
          const isSectionSelected = !isPreview && selectedSectionId === section.id;
          const sectionStyles = section.styles || { backgroundColor: '#ffffff', padding: '40px 20px' };

          return (
            <div
              key={section.id}
              onClick={() => !isPreview && onSelectSection(section)}
              style={sectionStyles}
              className={`relative transition-all ${
                isSectionSelected && !isPreview
                  ? 'outline outline-2 outline-indigo-500 -outline-offset-2'
                  : ''
              }`}
            >
              {/* Section label in edit mode */}
              {!isPreview && isSectionSelected && (
                <div className="absolute top-2 left-2 z-20 px-2 py-0.5 bg-indigo-600 text-white rounded text-[10px] font-bold uppercase tracking-wider">
                  {section.name || 'Section'}
                </div>
              )}

              {/* Rows */}
              <div className="max-w-6xl mx-auto w-full">
                {(section.rows || []).map((row) => (
                  <div key={row.id} className="w-full">
                    {/* Columns */}
                    <div className="flex flex-col md:flex-row gap-4 items-center justify-center">
                      {(row.columns || []).map((col) => (
                        <div
                          key={col.id}
                          style={{ width: col.width || '100%' }}
                          className="w-full flex-1"
                        >
                          {(col.elements || []).map((el, elIdx) =>
                            renderElement(el, section.id, col.id, elIdx, (col.elements || []).length)
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          );
        })
      )}
    </div>
  );
};

export default CanvasRenderer;


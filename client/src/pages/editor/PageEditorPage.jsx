import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { pageService } from '../../api/services';
import ElementPalette from '../../components/builder/ElementPalette';
import PropertyInspector from '../../components/builder/PropertyInspector';
import CanvasRenderer from '../../components/builder/CanvasRenderer';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import {
  ArrowLeft,
  Monitor,
  Tablet,
  Smartphone,
  Undo2,
  Redo2,
  Eye,
  EyeOff,
  Save,
  Globe,
  ExternalLink,
  Sparkles,
  CheckCircle2
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';

const PageEditorPage = () => {
  const { id } = useParams();

  const [page, setPage] = useState(null);
  const [sections, setSections] = useState([]);
  const [loading, setLoading] = useState(true);

  // Selection state
  const [selectedElement, setSelectedElement] = useState(null);
  const [selectedSection, setSelectedSection] = useState(null);

  // Viewport mode
  const [viewport, setViewport] = useState('desktop'); // 'desktop' | 'tablet' | 'mobile'

  // Preview Mode
  const [isPreview, setIsPreview] = useState(false);

  // Undo / Redo History
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  // Save states
  const [saving, setSaving] = useState(false);
  const [lastSavedTime, setLastSavedTime] = useState(null);

  const fetchPage = async () => {
    try {
      const res = await pageService.getById(id);
      if (res.data?.success) {
        const p = res.data.data;
        setPage(p);
        const initialSections = p.sections && p.sections.length > 0 ? p.sections : [];
        setSections(initialSections);
        setHistory([JSON.stringify(initialSections)]);
        setHistoryIndex(0);
      }
    } catch (err) {
      console.error('Failed to load page in editor:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPage();
  }, [id]);

  // Record history snapshot
  const pushHistory = (newSections) => {
    const json = JSON.stringify(newSections);
    const newHist = history.slice(0, historyIndex + 1);
    newHist.push(json);
    setHistory(newHist);
    setHistoryIndex(newHist.length - 1);
    setSections(newSections);
  };

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prev = history[historyIndex - 1];
      setHistoryIndex(historyIndex - 1);
      setSections(JSON.parse(prev));
      setSelectedElement(null);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const next = history[historyIndex + 1];
      setHistoryIndex(historyIndex + 1);
      setSections(JSON.parse(next));
      setSelectedElement(null);
    }
  };

  // Add Element to current section/column or create one if none exist
  const handleAddElement = (type, defaultContent) => {
    const newEl = {
      id: uuidv4(),
      type,
      content: defaultContent,
      styles: {
        fontSize: type === 'heading' ? '36px' : '16px',
        fontWeight: type === 'heading' ? '800' : '400',
        textAlign: 'center',
        marginBottom: '16px'
      }
    };

    let updated = [...sections];
    if (updated.length === 0) {
      updated = [{
        id: uuidv4(),
        name: 'Main Section',
        styles: { backgroundColor: '#ffffff', padding: '60px 20px', textAlign: 'center' },
        rows: [{
          id: uuidv4(),
          columns: [{
            id: uuidv4(),
            width: '100%',
            elements: [newEl]
          }]
        }]
      }];
    } else {
      // Append to the first column of the last section
      const targetSec = updated[updated.length - 1];
      if (!targetSec.rows || targetSec.rows.length === 0) {
        targetSec.rows = [{ id: uuidv4(), columns: [{ id: uuidv4(), width: '100%', elements: [] }] }];
      }
      targetSec.rows[0].columns[0].elements.push(newEl);
    }

    pushHistory(updated);
    setSelectedElement(newEl);
    setSelectedSection(null);
  };

  // Add Section Preset
  const handleAddSectionTemplate = (templateData) => {
    const newSec = {
      id: uuidv4(),
      name: templateData.name,
      styles: templateData.styles,
      rows: [{
        id: uuidv4(),
        columns: [{
          id: uuidv4(),
          width: '100%',
          elements: (templateData.elements || []).map(el => ({
            ...el,
            id: uuidv4()
          }))
        }]
      }]
    };

    const updated = [...sections, newSec];
    pushHistory(updated);
    setSelectedSection(newSec);
    setSelectedElement(null);
  };

  // Update selected element
  const handleUpdateElement = (elId, updates) => {
    const updated = sections.map(sec => ({
      ...sec,
      rows: (sec.rows || []).map(row => ({
        ...row,
        columns: (row.columns || []).map(col => ({
          ...col,
          elements: (col.elements || []).map(el => {
            if (el.id === elId) {
              const merged = { ...el, ...updates };
              setSelectedElement(merged);
              return merged;
            }
            return el;
          })
        }))
      }))
    }));
    pushHistory(updated);
  };

  // Update selected section
  const handleUpdateSection = (secId, updates) => {
    const updated = sections.map(sec => {
      if (sec.id === secId) {
        const merged = { ...sec, ...updates };
        setSelectedSection(merged);
        return merged;
      }
      return sec;
    });
    pushHistory(updated);
  };

  // Delete element
  const handleDeleteElement = (elId) => {
    const updated = sections.map(sec => ({
      ...sec,
      rows: (sec.rows || []).map(row => ({
        ...row,
        columns: (row.columns || []).map(col => ({
          ...col,
          elements: (col.elements || []).filter(el => el.id !== elId)
        }))
      }))
    }));
    pushHistory(updated);
    setSelectedElement(null);
  };

  // Duplicate element
  const handleDuplicateElement = (elId) => {
    let duplicatedItem = null;
    const updated = sections.map(sec => ({
      ...sec,
      rows: (sec.rows || []).map(row => ({
        ...row,
        columns: (row.columns || []).map(col => {
          const newElements = [];
          (col.elements || []).forEach(el => {
            newElements.push(el);
            if (el.id === elId) {
              const clone = {
                ...JSON.parse(JSON.stringify(el)),
                id: uuidv4()
              };
              duplicatedItem = clone;
              newElements.push(clone);
            }
          });
          return { ...col, elements: newElements };
        })
      }))
    }));

    if (duplicatedItem) {
      pushHistory(updated);
      setSelectedElement(duplicatedItem);
    }
  };

  // Move section up or down
  const handleMoveSection = (index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= sections.length) return;
    const newSecs = [...sections];
    const [moved] = newSecs.splice(index, 1);
    newSecs.splice(targetIdx, 0, moved);
    pushHistory(newSecs);
  };

  // Duplicate section
  const handleDuplicateSection = (secId) => {
    const sec = sections.find(s => s.id === secId);
    if (!sec) return;
    const cloned = JSON.parse(JSON.stringify(sec));
    cloned.id = uuidv4();
    cloned.name = `${cloned.name} (Copy)`;
    if (cloned.rows) {
      cloned.rows.forEach(r => {
        r.id = uuidv4();
        if (r.columns) {
          r.columns.forEach(c => {
            c.id = uuidv4();
            if (c.elements) {
              c.elements.forEach(e => {
                e.id = uuidv4();
              });
            }
          });
        }
      });
    }
    const idx = sections.findIndex(s => s.id === secId);
    const updated = [...sections];
    updated.splice(idx + 1, 0, cloned);
    pushHistory(updated);
    setSelectedSection(cloned);
  };

  // Delete section
  const handleDeleteSection = (secId) => {
    if (sections.length <= 1) {
      alert('Pages must have at least one section');
      return;
    }
    const updated = sections.filter(s => s.id !== secId);
    pushHistory(updated);
    setSelectedSection(null);
  };

  // Move element up or down
  const handleMoveElement = (secId, colId, index, direction) => {
    const targetIdx = direction === 'up' ? index - 1 : index + 1;
    const updated = sections.map(sec => {
      if (sec.id !== secId) return sec;
      return {
        ...sec,
        rows: (sec.rows || []).map(row => ({
          ...row,
          columns: (row.columns || []).map(col => {
            if (col.id !== colId) return col;
            const elements = [...(col.elements || [])];
            if (targetIdx < 0 || targetIdx >= elements.length) return col;
            const [moved] = elements.splice(index, 1);
            elements.splice(targetIdx, 0, moved);
            return { ...col, elements };
          })
        }))
      };
    });
    pushHistory(updated);
  };

  // Save changes to backend MongoDB
  const handleSavePage = async () => {
    setSaving(true);
    try {
      const res = await pageService.save(id, {
        sections
      });
      if (res.data?.success) {
        setPage(res.data.data);
        setLastSavedTime(new Date().toLocaleTimeString());
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving page');
    } finally {
      setSaving(false);
    }
  };

  // Toggle publish
  const handlePublish = async () => {
    try {
      await handleSavePage();
      const res = await pageService.togglePublish(id);
      if (res.data?.success) {
        setPage(res.data.data);
        alert(`Page published successfully! Access live at public URL.`);
      }
    } catch (err) {
      alert('Failed to publish page');
    }
  };

  if (loading) {
    return <div className="py-24 text-center text-slate-400">Loading Visual Editor Studio...</div>;
  }

  const publicLink = page?.funnel && page?.step
    ? `/f/${page.funnel.slug}/${page.step.slug}`
    : `/p/${page?.slug}`;

  // Viewport width styling
  const viewportWidths = {
    desktop: 'w-full max-w-full',
    tablet: 'max-w-[768px]',
    mobile: 'max-w-[390px]'
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-slate-100 dark:bg-slate-950 overflow-hidden">
      
      {/* Studio Top Control Bar */}
      <div className="h-14 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between px-4 shrink-0 select-none z-30">
        
        {/* Left: Back & Title */}
        <div className="flex items-center gap-3">
          <Link
            to={page?.funnelId ? `/funnels/${page.funnelId}` : '/landing-pages'}
            className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
            title="Exit Editor"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-slate-900 dark:text-white truncate max-w-[200px]">
              {page?.title}
            </span>
            <Badge variant={page?.status === 'published' ? 'emerald' : 'slate'} size="xs">
              {page?.status}
            </Badge>
          </div>
        </div>

        {/* Center: Viewport Switcher & History */}
        <div className="flex items-center gap-3">
          
          {/* Viewport controls */}
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-slate-800 rounded-xl">
            <button
              onClick={() => setViewport('desktop')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === 'desktop' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Desktop View (100%)"
            >
              <Monitor className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('tablet')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === 'tablet' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Tablet View (768px)"
            >
              <Tablet className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewport('mobile')}
              className={`p-1.5 rounded-lg transition-colors ${
                viewport === 'mobile' ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-white shadow-xs' : 'text-slate-400 hover:text-slate-600'
              }`}
              title="Mobile View (390px)"
            >
              <Smartphone className="w-4 h-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:border-slate-800" />

          {/* Undo / Redo */}
          <div className="flex items-center gap-1">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-lg text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-30"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          <div className="h-5 w-px bg-slate-200 dark:border-slate-800" />

          {/* Preview Toggle */}
          <button
            onClick={() => {
              setIsPreview(!isPreview);
              setSelectedElement(null);
            }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-colors ${
              isPreview
                ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                : 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
            }`}
          >
            {isPreview ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            <span>{isPreview ? 'Exit Preview' : 'Live Preview'}</span>
          </button>
        </div>

        {/* Right: Save & Publish */}
        <div className="flex items-center gap-2">
          {lastSavedTime && (
            <span className="hidden md:inline-block text-[11px] text-slate-400">
              Saved at {lastSavedTime}
            </span>
          )}

          <Button
            variant="secondary"
            size="sm"
            onClick={handleSavePage}
            loading={saving}
            icon={Save}
          >
            Save Changes
          </Button>

          <Button
            variant="primary"
            size="sm"
            onClick={handlePublish}
            icon={Globe}
          >
            Publish Live
          </Button>

          <a href={publicLink} target="_blank" rel="noreferrer">
            <button className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500" title="Open Public Page">
              <ExternalLink className="w-4 h-4" />
            </button>
          </a>
        </div>

      </div>

      {/* 3-Panel Studio Layout */}
      <div className="flex-1 flex overflow-hidden">
        
        {/* Left: Element & Section Palette */}
        {!isPreview && (
          <ElementPalette
            onAddElement={handleAddElement}
            onAddSectionTemplate={handleAddSectionTemplate}
          />
        )}

        {/* Center: Live WYSIWYG Canvas Frame */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-950 overflow-y-auto p-4 sm:p-8 flex justify-center items-start">
          <div
            className={`bg-white dark:bg-slate-900 shadow-2xl transition-all duration-300 min-h-[90vh] rounded-2xl overflow-hidden border border-slate-300 dark:border-slate-800 ${
              viewportWidths[viewport]
            }`}
          >
            <CanvasRenderer
              sections={sections}
              selectedElementId={selectedElement?.id}
              selectedSectionId={selectedSection?.id}
              onSelectElement={(el) => {
                setSelectedElement(el);
                setSelectedSection(null);
              }}
              onSelectSection={(sec) => {
                setSelectedSection(sec);
                setSelectedElement(null);
              }}
              onDeleteElement={handleDeleteElement}
              onDuplicateElement={handleDuplicateElement}
              onMoveElement={handleMoveElement}
              onMoveSection={handleMoveSection}
              onDuplicateSection={handleDuplicateSection}
              onDeleteSection={handleDeleteSection}
              isPreview={isPreview}
            />
          </div>
        </div>

        {/* Right: Property & Styling Inspector */}
        {!isPreview && (
          <PropertyInspector
            selectedElement={selectedElement}
            selectedSection={selectedSection}
            onUpdateElement={handleUpdateElement}
            onUpdateSection={handleUpdateSection}
            onDeleteElement={handleDeleteElement}
            onDuplicateElement={handleDuplicateElement}
            onMoveElement={handleMoveElement}
          />
        )}

      </div>
    </div>
  );
};

export default PageEditorPage;


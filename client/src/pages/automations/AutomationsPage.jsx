import React, { useState, useEffect } from 'react';
import { automationService } from '../../api/services';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import Modal from '../../components/common/Modal';
import {
  Zap,
  Plus,
  Play,
  Pause,
  ArrowDown,
  Mail,
  Tag,
  Clock,
  Bell,
  Trash2,
  Edit,
  Sparkles,
  CheckCircle2
} from 'lucide-react';

const NODE_TYPES = {
  trigger: { label: 'Trigger', color: 'border-indigo-500 bg-indigo-50/50 dark:bg-indigo-950/30 text-indigo-700 dark:text-indigo-300' },
  action: { label: 'Action', color: 'border-emerald-500 bg-emerald-50/50 dark:bg-emerald-950/30 text-emerald-700 dark:text-emerald-300' },
  delay: { label: 'Delay', color: 'border-amber-500 bg-amber-50/50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-300' }
};

const AutomationsPage = () => {
  const [automations, setAutomations] = useState([]);
  const [selectedAuto, setSelectedAuto] = useState(null);
  const [loading, setLoading] = useState(true);

  // New Automation Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [autoName, setAutoName] = useState('');
  const [autoDesc, setAutoDesc] = useState('');
  const [creating, setCreating] = useState(false);

  // Add Node Modal
  const [isAddNodeOpen, setIsAddNodeOpen] = useState(false);
  const [nodeType, setNodeType] = useState('action');
  const [nodeTitle, setNodeTitle] = useState('');
  const [nodeSubtitle, setNodeSubtitle] = useState('');

  const fetchAutomations = async () => {
    setLoading(true);
    try {
      const res = await automationService.getAll();
      if (res.data?.success) {
        setAutomations(res.data.data);
        if (res.data.data.length > 0 && !selectedAuto) {
          setSelectedAuto(res.data.data[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching automations:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAutomations();
  }, []);

  const handleCreateAutomation = async (e) => {
    e.preventDefault();
    if (!autoName) return;
    setCreating(true);

    try {
      const res = await automationService.create({
        name: autoName,
        description: autoDesc
      });
      if (res.data?.success) {
        setIsCreateOpen(false);
        setAutoName('');
        setAutoDesc('');
        setSelectedAuto(res.data.data);
        fetchAutomations();
      }
    } catch (err) {
      alert('Error creating automation');
    } finally {
      setCreating(false);
    }
  };

  const handleToggleStatus = async (id) => {
    try {
      const res = await automationService.toggle(id);
      if (res.data?.success) {
        setSelectedAuto(res.data.data);
        fetchAutomations();
      }
    } catch (err) {
      alert('Error toggling status');
    }
  };

  const handleAddNode = () => {
    if (!nodeTitle || !selectedAuto) return;
    const newNode = {
      id: `node-${Date.now()}`,
      type: nodeType,
      title: nodeTitle,
      subtitle: nodeSubtitle || '',
      position: { x: 250, y: (selectedAuto.nodes?.length || 0) * 120 + 50 }
    };

    const newNodes = [...(selectedAuto.nodes || []), newNode];
    let newEdges = [...(selectedAuto.edges || [])];
    if (newNodes.length > 1) {
      const prevNode = newNodes[newNodes.length - 2];
      newEdges.push({
        id: `edge-${prevNode.id}-${newNode.id}`,
        source: prevNode.id,
        target: newNode.id
      });
    }

    const updated = { ...selectedAuto, nodes: newNodes, edges: newEdges };
    setSelectedAuto(updated);
    automationService.update(selectedAuto._id, updated);
    setIsAddNodeOpen(false);
    setNodeTitle('');
    setNodeSubtitle('');
  };

  const handleDeleteNode = (nodeId) => {
    const newNodes = selectedAuto.nodes.filter(n => n.id !== nodeId);
    const newEdges = selectedAuto.edges.filter(e => e.source !== nodeId && e.target !== nodeId);
    const updated = { ...selectedAuto, nodes: newNodes, edges: newEdges };
    setSelectedAuto(updated);
    automationService.update(selectedAuto._id, updated);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Marketing Automations & Workflows
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Build event-driven customer nurture sequences, automatic tagging, and email triggers
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="primary"
            size="md"
            icon={Plus}
            onClick={() => setIsCreateOpen(true)}
          >
            New Workflow
          </Button>
        </div>
      </div>

      {/* Main Studio View (Left list, Right interactive canvas) */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
        
        {/* Left: Workflows List */}
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 space-y-2">
          <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">
            Workflows ({automations.length})
          </h3>
          {automations.map(a => (
            <div
              key={a._id}
              onClick={() => setSelectedAuto(a)}
              className={`p-3 rounded-xl cursor-pointer border transition-all ${
                selectedAuto?._id === a._id
                  ? 'border-indigo-600 bg-indigo-50/50 dark:bg-indigo-950/40 shadow-xs'
                  : 'border-slate-200 dark:border-slate-800 hover:border-slate-300'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <Badge variant={a.status === 'active' ? 'emerald' : 'slate'} size="xs">
                  {a.status.toUpperCase()}
                </Badge>
                <span className="text-[10px] text-slate-400">{a.nodes?.length || 0} nodes</span>
              </div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                {a.name}
              </h4>
              <p className="text-[11px] text-slate-400 truncate mt-0.5">
                {a.description || 'Event trigger sequence'}
              </p>
            </div>
          ))}
        </div>

        {/* Right: Visual Canvas */}
        <div className="lg:col-span-3 bg-slate-900 rounded-3xl border border-slate-800 p-6 sm:p-8 text-white relative min-h-[560px] flex flex-col justify-between overflow-hidden">
          <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

          {selectedAuto ? (
            <>
              {/* Canvas Top Bar */}
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 pb-6 border-b border-slate-800 relative z-10">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-bold text-white">
                      {selectedAuto.name}
                    </h3>
                    <Badge variant={selectedAuto.status === 'active' ? 'emerald' : 'slate'} size="xs">
                      {selectedAuto.status.toUpperCase()}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Executed {selectedAuto.executionCount || 0} times across active funnels
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant={selectedAuto.status === 'active' ? 'secondary' : 'success'}
                    size="sm"
                    onClick={() => handleToggleStatus(selectedAuto._id)}
                    icon={selectedAuto.status === 'active' ? Pause : Play}
                  >
                    {selectedAuto.status === 'active' ? 'Pause Workflow' : 'Activate Workflow'}
                  </Button>
                  <Button
                    variant="primary"
                    size="sm"
                    icon={Plus}
                    onClick={() => setIsAddNodeOpen(true)}
                  >
                    Add Step Node
                  </Button>
                </div>
              </div>

              {/* Vertical Workflow Nodes Display */}
              <div className="flex-1 py-8 flex flex-col items-center relative z-10 space-y-4">
                {(selectedAuto.nodes || []).map((node, idx) => {
                  const typeMeta = NODE_TYPES[node.type] || NODE_TYPES.action;
                  return (
                    <React.Fragment key={node.id}>
                      <div className={`w-full max-w-md p-4 rounded-2xl border-2 ${typeMeta.color} shadow-xl backdrop-blur-md relative group flex items-start justify-between gap-4 transition-all hover:scale-[1.02]`}>
                        <div>
                          <span className="text-[10px] font-black uppercase tracking-wider block opacity-75">
                            {typeMeta.label}
                          </span>
                          <h4 className="text-sm font-bold text-white mt-0.5">
                            {node.title}
                          </h4>
                          {node.subtitle && (
                            <p className="text-xs opacity-75 mt-0.5">
                              {node.subtitle}
                            </p>
                          )}
                        </div>

                        {idx > 0 && (
                          <button
                            onClick={() => handleDeleteNode(node.id)}
                            className="p-1 rounded text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                            title="Delete Node"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>

                      {idx < (selectedAuto.nodes || []).length - 1 && (
                        <div className="flex flex-col items-center py-0.5">
                          <div className="w-0.5 h-4 bg-indigo-500" />
                          <div className="p-1 rounded-full bg-indigo-600 text-white shadow-sm">
                            <ArrowDown className="w-3 h-3" />
                          </div>
                          <div className="w-0.5 h-4 bg-indigo-500" />
                        </div>
                      )}
                    </React.Fragment>
                  );
                })}
              </div>

              <div className="pt-4 border-t border-slate-800 text-center text-xs text-slate-400 relative z-10">
                Triggered automatically on live funnel interactions
              </div>
            </>
          ) : (
            <div className="py-24 text-center text-slate-400">
              Select or create an automation to open the visual workflow canvas.
            </div>
          )}
        </div>

      </div>

      {/* New Automation Modal */}
      <Modal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
        title="Create New Automation"
      >
        <form onSubmit={handleCreateAutomation} className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Workflow Name *</label>
            <input
              type="text"
              required
              value={autoName}
              onChange={(e) => setAutoName(e.target.value)}
              placeholder="e.g. VIP Buyer Welcome & Tagging Flow"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Description</label>
            <textarea
              rows="2"
              value={autoDesc}
              onChange={(e) => setAutoDesc(e.target.value)}
              placeholder="Triggered on purchase completion..."
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsCreateOpen(false)}>Cancel</Button>
            <Button type="submit" variant="primary" loading={creating}>Create Workflow</Button>
          </div>
        </form>
      </Modal>

      {/* Add Step Node Modal */}
      <Modal
        isOpen={isAddNodeOpen}
        onClose={() => setIsAddNodeOpen(false)}
        title="Add Action or Delay Node"
      >
        <div className="space-y-3.5 text-xs">
          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Node Type</label>
            <select
              value={nodeType}
              onChange={(e) => setNodeType(e.target.value)}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            >
              <option value="action">Action (Send Email, Add Tag, Notify Admin)</option>
              <option value="delay">Time Delay (Wait X Days or Hours)</option>
            </select>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Title *</label>
            <input
              type="text"
              required
              value={nodeTitle}
              onChange={(e) => setNodeTitle(e.target.value)}
              placeholder={nodeType === 'delay' ? 'Wait 2 Days' : 'Send Welcome Sequence Email'}
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div>
            <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">Details / Subtitle</label>
            <input
              type="text"
              value={nodeSubtitle}
              onChange={(e) => setNodeSubtitle(e.target.value)}
              placeholder="e.g. Tag: 'course-purchased'"
              className="w-full px-3 py-2 text-sm rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950"
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsAddNodeOpen(false)}>Cancel</Button>
            <Button variant="primary" onClick={handleAddNode}>Attach Node</Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default AutomationsPage;


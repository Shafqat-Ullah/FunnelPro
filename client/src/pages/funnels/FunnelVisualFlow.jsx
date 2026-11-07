import React from 'react';
import { useNavigate } from 'react-router-dom';
import Badge from '../../components/common/Badge';
import Button from '../../components/common/Button';
import {
  ArrowDown,
  ArrowRight,
  Edit,
  ExternalLink,
  Plus,
  TrendingUp,
  Eye,
  CheckCircle2,
  DollarSign,
  Gift,
  FileText
} from 'lucide-react';

const STEP_ICONS = {
  optin: FileText,
  sales: DollarSign,
  checkout: DollarSign,
  confirmation: CheckCircle2,
  upsell: TrendingUp,
  downsell: Gift,
  thankyou: CheckCircle2,
  'webinar-reg': Eye,
  'webinar-sales': DollarSign,
  leadgen: FileText
};

const STEP_COLORS = {
  optin: 'from-blue-500 to-indigo-600',
  sales: 'from-indigo-600 to-violet-600',
  checkout: 'from-emerald-500 to-teal-600',
  confirmation: 'from-emerald-600 to-green-700',
  upsell: 'from-amber-500 to-orange-600',
  downsell: 'from-rose-500 to-pink-600',
  thankyou: 'from-teal-500 to-emerald-600',
  'webinar-reg': 'from-purple-500 to-indigo-600',
  'webinar-sales': 'from-indigo-600 to-purple-600',
  leadgen: 'from-sky-500 to-blue-600'
};

const FunnelVisualFlow = ({ funnel, steps, onAddStep }) => {
  const navigate = useNavigate();

  return (
    <div className="p-6 bg-slate-900 rounded-3xl border border-slate-800 text-white relative overflow-hidden">
      {/* Background Grid Pattern */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#6366f1_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

      <div className="relative z-10 flex flex-col items-center">
        <div className="text-center max-w-lg mb-10">
          <Badge variant="indigo" size="sm" className="mb-2">
            Visual Customer Journey
          </Badge>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            {funnel.name} — Flow Diagram
          </h2>
          <p className="text-xs text-slate-400 mt-1">
            Visual progression of visitors through your opt-in, sales, checkout, and post-purchase offers.
          </p>
        </div>

        {/* Vertical Nodes Journey */}
        <div className="w-full max-w-xl flex flex-col items-center space-y-6">
          {steps.map((step, index) => {
            const Icon = STEP_ICONS[step.stepType] || FileText;
            const gradient = STEP_COLORS[step.stepType] || 'from-indigo-600 to-violet-600';
            const pageId = step.pageId || step.page?._id;

            return (
              <React.Fragment key={step._id}>
                {/* Node Card */}
                <div className="w-full bg-slate-800/90 backdrop-blur-md rounded-2xl border border-slate-700/80 p-5 shadow-xl hover:border-indigo-500/80 transition-all group">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${gradient} flex items-center justify-center text-white shadow-lg shrink-0`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider">
                            Step {index + 1} · {step.stepType}
                          </span>
                        </div>
                        <h4 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                          {step.name}
                        </h4>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">
                          /f/{funnel.slug}/{step.slug}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {pageId && (
                        <button
                          onClick={() => navigate(`/editor/${pageId}`)}
                          className="px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-md shadow-indigo-600/30 transition-colors"
                        >
                          <Edit className="w-3.5 h-3.5" />
                          Edit Page
                        </button>
                      )}
                      <a
                        href={`/f/${funnel.slug}/${step.slug}`}
                        target="_blank"
                        rel="noreferrer"
                        className="p-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-300 hover:text-white transition-colors"
                        title="Preview Public Page"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>

                  {/* Step Conversion Metrics */}
                  <div className="grid grid-cols-3 gap-3 mt-4 pt-3 border-t border-slate-700/60 text-center">
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Views</span>
                      <p className="text-xs font-bold text-white">{step.stats?.views || 0}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Conversions</span>
                      <p className="text-xs font-bold text-white">{step.stats?.conversions || 0}</p>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 uppercase font-semibold">Conversion Rate</span>
                      <p className="text-xs font-bold text-emerald-400">{step.stats?.conversionRate || 0}%</p>
                    </div>
                  </div>
                </div>

                {/* Arrow connecting to next step */}
                {index < steps.length - 1 && (
                  <div className="flex flex-col items-center py-1">
                    <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-500 to-indigo-700" />
                    <div className="p-1 rounded-full bg-indigo-600 text-white shadow-md">
                      <ArrowDown className="w-3.5 h-3.5" />
                    </div>
                    <div className="w-0.5 h-6 bg-gradient-to-b from-indigo-700 to-slate-700" />
                  </div>
                )}
              </React.Fragment>
            );
          })}

          {/* Add Step Node */}
          <div className="pt-4 w-full flex justify-center">
            <button
              onClick={onAddStep}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 border-dashed border-slate-700 hover:border-indigo-500 bg-slate-800/50 hover:bg-slate-800 text-xs font-bold text-slate-300 hover:text-white transition-all shadow-md group"
            >
              <Plus className="w-4 h-4 text-indigo-400 group-hover:scale-125 transition-transform" />
              <span>Add Funnel Step To Journey</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FunnelVisualFlow;


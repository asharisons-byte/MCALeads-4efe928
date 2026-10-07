import React, { useState } from 'react';
import {
  X,
  Sliders,
  Eye,
  EyeOff,
  MoveUp,
  MoveDown,
  RotateCcw,
  Check,
} from 'lucide-react';
import {
  CommandCenterWidgetConfig,
  DEFAULT_WIDGET_CONFIGS,
} from '../../services/commandCenterService';

interface DashboardCustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  configs: CommandCenterWidgetConfig[];
  onSaveConfigs: (configs: CommandCenterWidgetConfig[]) => void;
}

export const DashboardCustomizerModal: React.FC<DashboardCustomizerModalProps> = ({
  isOpen,
  onClose,
  configs,
  onSaveConfigs,
}) => {
  const [localConfigs, setLocalConfigs] = useState<CommandCenterWidgetConfig[]>(configs);

  if (!isOpen) return null;

  const toggleVisibility = (id: string) => {
    setLocalConfigs((prev) =>
      prev.map((c) => (c.id === id ? { ...c, visible: !c.visible } : c))
    );
  };

  const moveItem = (index: number, direction: 'up' | 'down') => {
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= localConfigs.length) return;

    const copy = [...localConfigs];
    const temp = copy[index];
    copy[index] = copy[targetIndex];
    copy[targetIndex] = temp;

    // re-assign orders
    const updated = copy.map((item, idx) => ({ ...item, order: idx + 1 }));
    setLocalConfigs(updated);
  };

  const handleReset = () => {
    setLocalConfigs(DEFAULT_WIDGET_CONFIGS);
  };

  const handleSave = () => {
    onSaveConfigs(localConfigs);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-mca-hover/50 backdrop-blur-xs p-4">
      <div className="bg-mca-card rounded-xl max-w-xl w-full p-6 shadow-xl border border-white/10 space-y-4 max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between pb-3 border-b border-white/5 shrink-0">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-950/50 border border-indigo-800/50 flex items-center justify-center text-indigo-400">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-base text-white">
                Customize Command Center Layout
              </h3>
              <p className="text-xs text-slate-400">
                Toggle widgets and reorder sections to prioritize your daily executive workflow
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-500 hover:text-slate-300 hover:bg-mca-hover transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Scrollable list of widgets */}
        <div className="flex-1 overflow-y-auto space-y-2 pr-1">
          {localConfigs.map((cfg, idx) => (
            <div
              key={cfg.id}
              className={`p-3 rounded-xl border flex items-center justify-between transition-all ${
                cfg.visible
                  ? 'bg-mca-card border-white/10'
                  : 'bg-mca-void/40 border-white/10 opacity-60'
              }`}
            >
              <div className="flex items-center gap-3">
                <button
                  onClick={() => toggleVisibility(cfg.id)}
                  className={`p-1.5 rounded-lg border transition-colors ${
                    cfg.visible
                      ? 'bg-indigo-950/50 border-indigo-800/50 text-indigo-300'
                      : 'bg-mca-hover border-white/10 text-slate-500'
                  }`}
                  title={cfg.visible ? 'Hide widget' : 'Show widget'}
                >
                  {cfg.visible ? <Eye className="w-4 h-4" /> : <EyeOff className="w-4 h-4" />}
                </button>
                <div>
                  <div className="text-xs font-bold text-slate-100">{cfg.label}</div>
                  <div className="text-[10px] text-slate-500 uppercase tracking-wide">
                    {cfg.category}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <button
                  disabled={idx === 0}
                  onClick={() => moveItem(idx, 'up')}
                  className="p-1 rounded hover:bg-mca-hover text-slate-400 disabled:opacity-30"
                  title="Move up"
                >
                  <MoveUp className="w-4 h-4" />
                </button>
                <button
                  disabled={idx === localConfigs.length - 1}
                  onClick={() => moveItem(idx, 'down')}
                  className="p-1 rounded hover:bg-mca-hover text-slate-400 disabled:opacity-30"
                  title="Move down"
                >
                  <MoveDown className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>

        {/* Footer actions */}
        <div className="pt-3 border-t border-white/5 flex items-center justify-between shrink-0">
          <button
            onClick={handleReset}
            className="px-3 py-1.5 rounded-lg border border-white/10 hover:bg-mca-void/40 text-slate-300 text-xs font-medium flex items-center gap-1.5 transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Defaults
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={onClose}
              className="px-4 py-1.5 rounded-lg border border-white/10 hover:bg-mca-void/40 text-slate-200 text-xs font-medium transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              className="px-4 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold flex items-center gap-1.5 transition-colors"
            >
              <Check className="w-3.5 h-3.5" />
              Save Layout
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

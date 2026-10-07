import React from 'react';

interface QuickActionDockProps {
  alertsCount: number;
  onNewLead: () => void;
  onSophiaCall: () => void;
  onOpenDialer: () => void;
  onEmail: () => void;
  onSMS: () => void;
  onDataQuality: () => void;
  onExport: () => void;
  onSearchCRM: () => void;
  onAlerts: () => void;
}

/**
 * QuickActionDock — Stitch "QuickActionFloatDock" footer.
 * Persistent bottom bar with the five primary outbound actions + CRM utilities.
 */
export const QuickActionDock: React.FC<QuickActionDockProps> = ({
  alertsCount,
  onNewLead,
  onSophiaCall,
  onOpenDialer,
  onEmail,
  onSMS,
  onDataQuality,
  onExport,
  onSearchCRM,
  onAlerts,
}) => (
  <footer
    id="mca-quick-action-dock"
    className="border-t border-mca-border bg-mca-void/90 backdrop-blur px-5 py-2 flex flex-wrap items-center justify-between gap-y-2 text-xs z-30 flex-shrink-0"
    data-purpose="quick-action-dock"
  >
    {/* Dock Quick Action Buttons */}
    <div className="flex items-center gap-2 flex-wrap">
      <span className="text-[10px] font-mono text-slate-500 uppercase tracking-wider mr-1">QUICK ACTIONS:</span>
      <button
        onClick={onNewLead}
        className="px-2.5 py-1 rounded bg-blue-600 hover:bg-blue-500 text-white font-semibold flex items-center gap-1.5 transition"
      >
        <i className="fa-solid fa-plus text-[10px]"></i>
        <span>New Lead</span>
      </button>
      <button
        onClick={onSophiaCall}
        className="px-2.5 py-1 rounded bg-purple-900/70 hover:bg-purple-800 border border-purple-600/40 text-purple-200 flex items-center gap-1.5 transition"
      >
        <i className="fa-solid fa-wand-magic-sparkles text-cyan-300 text-[10px]"></i>
        <span>Sophia AI Call</span>
      </button>
      <button
        onClick={onOpenDialer}
        className="px-2.5 py-1 rounded bg-mca-card hover:bg-mca-hover border border-white/10 text-slate-300 flex items-center gap-1.5 transition"
      >
        <i className="fa-solid fa-phone text-[10px]"></i>
        <span>Open Dialer</span>
      </button>
      <button
        onClick={onEmail}
        className="px-2.5 py-1 rounded bg-mca-card hover:bg-mca-hover border border-white/10 text-slate-300 flex items-center gap-1.5 transition"
      >
        <i className="fa-solid fa-envelope text-[10px]"></i>
        <span>Email</span>
      </button>
      <button
        onClick={onSMS}
        className="px-2.5 py-1 rounded bg-mca-card hover:bg-mca-hover border border-white/10 text-slate-300 flex items-center gap-1.5 transition"
      >
        <i className="fa-solid fa-comment-sms text-[10px]"></i>
        <span>SMS</span>
      </button>
    </div>

    {/* Dock Telemetry Extras */}
    <div className="flex items-center gap-2 text-slate-400 font-mono text-[11px]">
      <button onClick={onDataQuality} className="hover:text-white px-2 py-1">
        <i className="fa-solid fa-shield-halved text-cyan-400 mr-1"></i> Data Quality
      </button>
      <button onClick={onExport} className="hover:text-white px-2 py-1">
        <i className="fa-solid fa-file-export text-slate-400 mr-1"></i> Export
      </button>
      <button onClick={onSearchCRM} className="hover:text-white px-2 py-1">
        <i className="fa-solid fa-magnifying-glass text-slate-400 mr-1"></i> Search CRM
      </button>
      <span className="text-slate-600">|</span>
      <button onClick={onAlerts} className="text-mca-neonGreen flex items-center gap-1 hover:brightness-125">
        <span className="w-1.5 h-1.5 rounded-full bg-mca-neonGreen animate-ping"></span>
        Agency Action Alerts ({alertsCount})
      </button>
    </div>
  </footer>
);

import React from 'react';
import { LeadsTable } from './LeadsTable';
import { Lead } from '../types';

interface LeadsPageProps {
  leads: Lead[];
  onSelectLead: (lead: Lead) => void;
  onOpenImport: (mode?: 'upload' | 'sheets' | 'paste' | 'preset') => void;
  onOpenAddLead: () => void;
  onBulkUpdateStage: (leadIds: string[], stage: string) => Promise<void>;
  onBulkDelete: (leadIds: string[]) => Promise<void>;
  onTriggerAIEnrichment: (leadIds: string[]) => Promise<void>;
  onClearAllLeads: () => Promise<void>;
  onOpenDialer: (lead: Lead) => void;
  onOpenAICall: (lead: Lead) => void;
  onImportComplete: () => void;
  currentPage: number;
  onPageChange: (page: number) => void;
}

export const LeadsPage: React.FC<LeadsPageProps> = (props) => {
  return (
    // Full-width, full-height flex column — no max-width cap so the table uses all available space
    <div className="flex flex-col w-full h-full px-4 py-4 gap-0">
      <LeadsTable {...props} />
    </div>
  );
};

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
    <div className="p-4 w-full">
      <LeadsTable {...props} />
    </div>
  );
};

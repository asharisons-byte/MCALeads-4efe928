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
}

export const LeadsPage: React.FC<LeadsPageProps> = (props) => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <LeadsTable {...props} />
    </div>
  );
};

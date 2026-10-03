import React, { useState } from 'react';
import { LeadsTable } from './LeadsTable';
import { BulkActionsToolbar } from './BulkActionsToolbar';
import { BulkTagModal } from './BulkTagModal';
import { BulkProgressOverlay, BulkOperationProgress } from './BulkProgressOverlay';
import { Lead } from '../types';

interface LeadsPageProps {
  leads: Lead[];
  selectedLeadIds: Set<string>;
  onSelectionChange: (ids: Set<string>) => void;
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
  const [activeBulkOperation, setActiveBulkOperation] = useState<BulkOperationProgress | null>(null);
  const [showTagModal, setShowTagModal] = useState(false);

  return (
    // Full-width, full-height flex column — no max-width cap so the table uses all available space
    <div className="flex flex-col w-full h-full px-4 py-4 gap-0">
      <BulkActionsToolbar
        selectedCount={props.selectedLeadIds.size}
        onBulkAssign={() => console.log('TODO: Bulk Assign')}
        onBulkMoveStage={() => console.log('TODO: Bulk Move Stage')}
        onBulkEnrich={() => props.onTriggerAIEnrichment(Array.from(props.selectedLeadIds))}
        onBulkDelete={() => props.onBulkDelete(Array.from(props.selectedLeadIds))}
        onBulkAICall={() => setActiveBulkOperation({ id: '1', type: 'AI Call', total: props.selectedLeadIds.size, processed: 0, successful: 0, failed: 0, status: 'running' })}
        onBulkSMS={() => setActiveBulkOperation({ id: '2', type: 'SMS', total: props.selectedLeadIds.size, processed: 0, successful: 0, failed: 0, status: 'running' })}
        onBulkEmail={() => setActiveBulkOperation({ id: '3', type: 'Email', total: props.selectedLeadIds.size, processed: 0, successful: 0, failed: 0, status: 'running' })}
        onBulkTag={() => setShowTagModal(true)}
        onBulkManualCall={() => setActiveBulkOperation({ id: '4', type: 'AI Call', total: props.selectedLeadIds.size, processed: 0, successful: 0, failed: 0, status: 'running' })}
      />
      {activeBulkOperation && (
        <BulkProgressOverlay
          operation={activeBulkOperation}
          onClose={() => setActiveBulkOperation(null)}
        />
      )}
      <BulkTagModal
        isOpen={showTagModal}
        onClose={() => setShowTagModal(false)}
        onConfirm={(tag) => console.log(`Applying tag ${tag} to leads:`, props.selectedLeadIds)}
        selectedCount={props.selectedLeadIds.size}
      />
      <LeadsTable {...props} />
    </div>
  );
};

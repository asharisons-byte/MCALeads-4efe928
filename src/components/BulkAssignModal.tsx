import React, { useState, useEffect } from 'react';
import { X, UserCheck, AlertCircle, Bot } from 'lucide-react';

interface TeamMember {
  id: number;
  displayName: string;
  role: string;
}

interface BulkAssignModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedLeadIds: string[];
  onAssigned: () => void;
}

async function getAuthToken(): Promise<string | null> {
  try {
    const { auth } = await import('../lib/firebase.js');
    return auth.currentUser ? await auth.currentUser.getIdToken() : null;
  } catch {
    return null;
  }
}

export const BulkAssignModal: React.FC<BulkAssignModalProps> = ({
  isOpen,
  onClose,
  selectedLeadIds,
  onAssigned,
}) => {
  const [teamMembers, setTeamMembers] = useState<TeamMember[]>([]);
  const [selectedTarget, setSelectedTarget] = useState<string>('');
  const [isLoadingMembers, setIsLoadingMembers] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) {
      setSelectedTarget('');
      setError(null);
      return;
    }

    let isMounted = true;
    setIsLoadingMembers(true);
    setError(null);

    (async () => {
      try {
        const token = await getAuthToken();
        const res = await fetch('/api/users', {
          headers: token ? { Authorization: `Bearer ${token}` } : {},
        });
        if (res.ok) {
          const data = await res.json();
          if (isMounted) {
            const rawUsers: any[] = data.users || [];
            // Map members with clear role titles and IDs
            const members: TeamMember[] = rawUsers
              .filter((u: any) => u.status !== 'suspended')
              .map((u: any) => ({
                id: u.id,
                displayName: u.displayName || u.firstName || `User #${u.id}`,
                role: u.role || 'Sales Rep',
              }));
            setTeamMembers(members);
          }
        } else {
          const errData = await res.json().catch(() => ({}));
          if (isMounted) setError(errData.error || `Failed to fetch team members (${res.status})`);
        }
      } catch (err: any) {
        if (isMounted) setError(err.message || 'Error loading team members');
      } finally {
        if (isMounted) setIsLoadingMembers(false);
      }
    })();

    return () => {
      isMounted = false;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleAssignSubmit = async () => {
    if (!selectedTarget || selectedLeadIds.length === 0) return;
    setIsSubmitting(true);
    setError(null);

    try {
      const token = await getAuthToken();
      const res = await fetch('/api/leads/reassign-bulk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          leadIds: selectedLeadIds,
          targetMemberId: selectedTarget,
        }),
      });

      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setError(data.error || `Reassignment failed (${res.status})`);
        setIsSubmitting(false);
        return;
      }

      onAssigned();
      onClose();
    } catch (err: any) {
      setError(err?.message || 'Network error during bulk reassignment');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/75 backdrop-blur-xs z-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-[var(--surface-container-lowest)] border border-[var(--hud-border-base)] rounded-xl p-6 shadow-2xl space-y-4">
        <div className="flex items-center justify-between border-b border-[var(--hud-border-base)] pb-3">
          <div>
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <UserCheck className="w-4 h-4 text-sky-400" />
              Bulk Assign {selectedLeadIds.length} Leads
            </h3>
            <p className="text-xs text-[var(--outline)] mt-0.5">
              Reassign selected leads to a team member or Sophia AI
            </p>
          </div>
          <button onClick={onClose} className="text-[var(--outline)] hover:text-white p-1 rounded-lg">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-3">
          <label className="text-xs text-slate-300 font-semibold block">Select Team Member:</label>
          {isLoadingMembers ? (
            <p className="text-xs text-slate-400 italic">Loading active team members...</p>
          ) : (
            <select
              value={selectedTarget}
              onChange={(e) => setSelectedTarget(e.target.value)}
              className="w-full bg-[var(--surface-container)] border border-[var(--hud-border-bright)] rounded-lg p-2.5 text-xs text-[var(--on-surface)] focus:outline-none focus:border-indigo-500"
            >
              <option value="">— Choose a representative or agent —</option>
              <option value="SOPHIA">Sophia (AI Autonomous Sales Rep)</option>
              {teamMembers.map((m) => (
                <option key={m.id} value={String(m.id)}>
                  {m.displayName} — {m.role} (ID: {m.id})
                </option>
              ))}
            </select>
          )}

          <div className="p-2.5 rounded-lg bg-sky-950/30 border border-sky-800/40 text-[11px] text-sky-200">
            Selected leads will have their primary internal ownership and display assignment updated in PostgreSQL.
          </div>
        </div>

        {error && (
          <div className="flex items-center gap-2 text-xs text-rose-400 bg-rose-950/40 border border-rose-800/50 rounded-lg px-3 py-2">
            <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="flex justify-end gap-2 pt-2">
          <button
            onClick={onClose}
            className="px-3 py-1.5 rounded-lg bg-[var(--surface-container)] text-[var(--on-surface-variant)] text-xs font-semibold hover:bg-[var(--surface-container-high)]"
          >
            Cancel
          </button>
          <button
            disabled={!selectedTarget || isSubmitting}
            onClick={handleAssignSubmit}
            className="px-4 py-1.5 rounded-lg bg-sky-600 text-white text-xs font-semibold hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1.5"
          >
            {isSubmitting ? (
              <>
                <span className="animate-spin inline-block w-3 h-3 border-2 border-white/30 border-t-white rounded-full" />
                Assigning...
              </>
            ) : (
              <>
                <UserCheck className="w-3.5 h-3.5" />
                Confirm Assignment
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

import React, { useState, useEffect, useCallback } from 'react';
import {
  Box,
  Typography,
  Card,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Tabs,
  Tab,
  Chip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  IconButton,
  Checkbox,
  TablePagination,
  Alert,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import SmartToyIcon from '@mui/icons-material/SmartToy';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIndIcon from '@mui/icons-material/AssignmentInd';
import InviteMemberModal from './InviteMemberModal';

import { auth } from '../lib/firebase';
import { AppRole, ROLE_DISPLAY_TITLES, canAccessTeamManagement } from '../utils/roleUtils.js';

interface User {
  id: number;
  uid: string;
  displayName: string;
  email: string;
  firstName: string | null;
  lastName: string | null;
  role: AppRole;
  status: string;
  lastLoginAt: Date | null;
  createdAt: Date;
}

interface TeamPerformanceData {
  members: any[];
  summary: {
    totalMembers: number;
    activeMembers: number;
    totalLeads: number;
    totalDeals: number;
    totalRevenue: number;
  };
}

interface AccessLog {
  id: string;
  userName: string;
  feature: string;
  action: string;
  timestamp: string;
}

interface Lead {
  lead_id: string;
  business_name: string;
  businessName?: string;
  gmb_status?: string;
  gmbLink?: string;
  gaps?: string[];
  marketingGaps?: string;
  lead_score?: number;
  opportunityScore?: number;
  estimated_retainer?: number;
  estRetainer?: number;
  owner?: string;
  assignedTo?: string;
  pipeline_stage?: string;
}

interface TeamPageProps {
  currentUserRole: AppRole;
}

// ── Always use Firebase token – never localStorage ──────────────────────────
async function getCurrentToken(): Promise<string> {
  try {
    return auth.currentUser ? await auth.currentUser.getIdToken() : '';
  } catch {
    return '';
  }
}

const SALES_ROLES = ['SDR', 'ACCOUNT_EXECUTIVE', 'APPOINTMENT_SETTER', 'OUTREACH_SPECIALIST', 'Sales', 'Account Manager'];

const TeamPage: React.FC<TeamPageProps> = ({ currentUserRole }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [performance, setPerformance] = useState<TeamPerformanceData | null>(null);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  // Lead Assignment tab state
  const [assignLeads, setAssignLeads] = useState<Lead[]>([]);
  const [leadsLoading, setLeadsLoading] = useState(false);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [leadToReassign, setLeadToReassign] = useState<Lead | null>(null);
  const [newAssigneeId, setNewAssigneeId] = useState<string>('');
  const [assigning, setAssigning] = useState(false);
  const [assignError, setAssignError] = useState<string | null>(null);
  const [assignSuccess, setAssignSuccess] = useState<string | null>(null);

  // Auto-assign config (Sophia by default, management-only toggle)
  const [sophiaAutoAssign, setSophiaAutoAssign] = useState(true);

  // Pagination
  const [memberPage, setMemberPage] = useState(0);
  const [memberRowsPerPage, setMemberRowsPerPage] = useState(10);
  const [performancePage, setPerformancePage] = useState(0);
  const [performanceRowsPerPage, setPerformanceRowsPerPage] = useState(10);
  const [leadsPage, setLeadsPage] = useState(0);
  const [leadsRowsPerPage, setLeadsRowsPerPage] = useState(20);
  const [leadsFilter, setLeadsFilter] = useState<'all' | 'sophia' | 'unassigned' | 'assigned'>('all');
  const [leadsSearch, setLeadsSearch] = useState('');

  const canInvite = currentUserRole === 'AGENCY_DIRECTOR' || currentUserRole === 'SALES_MANAGER';
  const isManagement = ['AGENCY_DIRECTOR', 'SALES_MANAGER'].includes(currentUserRole as string);
  const periods = ['Today', 'This Week', 'This Month', 'Last Month', 'All Time'];

  // ── Data fetching ────────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    try {
      const token = await getCurrentToken();
      const response = await fetch('/api/users', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  }, []);

  const fetchPerformance = useCallback(async () => {
    try {
      const token = await getCurrentToken();
      const response = await fetch(`/api/team/performance?period=${encodeURIComponent(selectedPeriod)}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.ok) {
        const data = await response.json();
        setPerformance(data.performance || null);
      }
    } catch (error) {
      console.error('Failed to fetch performance:', error);
    } finally {
      setLoading(false);
    }
  }, [selectedPeriod]);

  const fetchLeads = useCallback(async () => {
    setLeadsLoading(true);
    try {
      const token = await getCurrentToken();
      const res = await fetch('/api/leads?limit=2000', {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const d = await res.json();
        setAssignLeads(d.leads || []);
      }
    } catch (e) {
      console.error('Failed to fetch leads', e);
    } finally {
      setLeadsLoading(false);
    }
  }, []);

  const fetchLogs = useCallback(async () => {
    setLogs([
      { id: '1', userName: 'John Doe', feature: 'Lead Management', action: 'Delete Lead', timestamp: new Date().toISOString() },
      { id: '2', userName: 'Jane Smith', feature: 'Client Portal', action: 'View Document', timestamp: new Date().toISOString() },
    ]);
  }, []);

  useEffect(() => {
    fetchUsers();
    fetchPerformance();
    fetchLogs();
  }, [fetchUsers, fetchPerformance, fetchLogs]);

  useEffect(() => {
    if (activeTab === 3) fetchLeads();
  }, [activeTab, fetchLeads]);

  // ── Lead assignment helpers ──────────────────────────────────────────────
  const getLeadOwner = (lead: Lead) => lead.owner || lead.assignedTo || '';
  const getLeadName = (lead: Lead) => lead.business_name || lead.businessName || '—';
  const getLeadScore = (lead: Lead) => lead.lead_score ?? lead.opportunityScore ?? '—';
  const getLeadRetainer = (lead: Lead) => lead.estimated_retainer ?? lead.estRetainer ?? 0;
  const getLeadId = (lead: Lead) => lead.lead_id;

  const isSophiaOwned = (lead: Lead) => {
    const o = getLeadOwner(lead).toLowerCase();
    return o.includes('sophia');
  };

  // Filtered leads for the assignment table
  const filteredAssignLeads = assignLeads.filter((l) => {
    const owner = getLeadOwner(l);
    if (leadsFilter === 'sophia' && !isSophiaOwned(l)) return false;
    if (leadsFilter === 'unassigned' && owner && !isSophiaOwned(l)) return false;
    if (leadsFilter === 'assigned' && (!owner || isSophiaOwned(l))) return false;
    if (leadsSearch.trim()) {
      const q = leadsSearch.toLowerCase();
      if (!getLeadName(l).toLowerCase().includes(q) && !owner.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const paginatedLeads = filteredAssignLeads.slice(leadsPage * leadsRowsPerPage, leadsPage * leadsRowsPerPage + leadsRowsPerPage);
  const unassignedCount = assignLeads.filter((l) => !getLeadOwner(l) || isSophiaOwned(l)).length;
  const sophiaCount = assignLeads.filter(isSophiaOwned).length;
  const assignedCount = assignLeads.filter((l) => getLeadOwner(l) && !isSophiaOwned(l)).length;
  const salesMembers = users.filter((u) => SALES_ROLES.includes(u.role as string));

  const handleAssignLead = async (leadId: string, memberId: string) => {
    try {
      const token = await getCurrentToken();
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ assigned_user: { id: Number(memberId) } }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAssignError(data.error || 'Failed to assign lead');
        return false;
      }
      return true;
    } catch (e: any) {
      setAssignError(e.message || 'Network error');
      return false;
    }
  };

  const handleBulkAssign = async () => {
    if (!selectedMemberId || selectedLeads.length === 0) return;
    setAssigning(true);
    setAssignError(null);
    setAssignSuccess(null);
    try {
      const token = await getCurrentToken();
      const response = await fetch('/api/leads/reassign-bulk', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ leadIds: selectedLeads, targetMemberId: Number(selectedMemberId) }),
      });
      const data = await response.json();
      if (!response.ok) {
        setAssignError(data.error || 'Failed to assign leads');
        return;
      }
      setAssignSuccess(`Successfully assigned ${selectedLeads.length} leads.`);
      setSelectedLeads([]);
      setSelectedMemberId('');
      await fetchLeads();
    } catch (e: any) {
      setAssignError(e.message || 'Network error during assignment');
    } finally {
      setAssigning(false);
    }
  };

  const handleReassignConfirm = async () => {
    if (!leadToReassign || !newAssigneeId) return;
    setAssigning(true);
    setAssignError(null);
    const ok = await handleAssignLead(getLeadId(leadToReassign), newAssigneeId);
    setAssigning(false);
    if (ok) {
      setLeadToReassign(null);
      setNewAssigneeId('');
      await fetchLeads();
    }
  };

  // ── Role / status helpers ────────────────────────────────────────────────
  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const token = await getCurrentToken();
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ role: newRole }),
      });
      if (response.ok) fetchUsers();
      else {
        const data = await response.json();
        alert(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      const token = await getCurrentToken();
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
        body: JSON.stringify({ status: newStatus }),
      });
      if (response.ok) fetchUsers();
      else {
        const data = await response.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getStatusColor = (status: string) => {
    if (status === 'active') return 'success';
    if (status === 'invited') return 'warning';
    if (status === 'suspended') return 'error';
    return 'default';
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  // ── Render ───────────────────────────────────────────────────────────────
  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Team Management</Typography>
        <Button variant="contained" onClick={() => setInviteModalOpen(true)} disabled={!canInvite}>
          Invite Member
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Members" />
          <Tab label="Performance" />
          <Tab label="Access Logs" />
          <Tab label="Lead Assignment" />
        </Tabs>
      </Card>

      {/* ─── TAB 0: MEMBERS ─────────────────────────────────────────────── */}
      {activeTab === 0 && (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell>Email</TableCell>
                <TableCell>Role</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Last Login</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users
                .slice(memberPage * memberRowsPerPage, memberPage * memberRowsPerPage + memberRowsPerPage)
                .map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        {user.displayName}
                        <Chip label={ROLE_DISPLAY_TITLES[user.role] || user.role} size="small" color="primary" variant="outlined" />
                      </Box>
                    </TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>
                      <FormControl size="small" sx={{ minWidth: 200 }}>
                        <Select
                          value={user.role}
                          onChange={(e) => handleRoleChange(user.id, e.target.value)}
                          disabled={user.status === 'suspended' || !canInvite}
                        >
                          {Object.entries(ROLE_DISPLAY_TITLES).map(([value, label]) => (
                            <MenuItem key={value} value={value}>{label}</MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </TableCell>
                    <TableCell>
                      <Chip label={user.status} color={getStatusColor(user.status) as any} size="small" />
                    </TableCell>
                    <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                    <TableCell>
                      <IconButton
                        size="small"
                        onClick={() => handleStatusChange(user.id, user.status === 'active' ? 'suspended' : 'active')}
                        disabled={user.status === 'invited' || !canInvite}
                      >
                        {user.status === 'active' ? <BlockIcon fontSize="small" /> : <CheckCircleIcon fontSize="small" color="success" />}
                      </IconButton>
                      {user.status === 'invited' && canInvite && (
                        <Button size="small" variant="outlined" color="success" onClick={() => handleStatusChange(user.id, 'active')} sx={{ ml: 1, fontSize: '0.7rem', py: 0.3 }}>
                          Activate
                        </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
            </TableBody>
          </Table>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={users.length}
            rowsPerPage={memberRowsPerPage}
            page={memberPage}
            onPageChange={(e, p) => setMemberPage(p)}
            onRowsPerPageChange={(e) => { setMemberRowsPerPage(parseInt(e.target.value, 10)); setMemberPage(0); }}
          />
        </Card>
      )}

      {/* ─── TAB 1: PERFORMANCE ─────────────────────────────────────────── */}
      {activeTab === 1 && performance && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Period</InputLabel>
              <Select value={selectedPeriod} label="Period" onChange={(e) => setSelectedPeriod(e.target.value)}>
                {periods.map((p) => <MenuItem key={p} value={p}>{p}</MenuItem>)}
              </Select>
            </FormControl>
          </Box>
          <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 2, display: 'flex', gap: 3, flexWrap: 'wrap' }}>
              {[
                { label: 'Total Members', value: performance.summary?.totalMembers ?? 0 },
                { label: 'Active Members', value: performance.summary?.activeMembers ?? 0 },
                { label: 'Total Leads', value: performance.summary?.totalLeads ?? 0 },
                { label: 'Closed Deals', value: performance.summary?.totalDeals ?? 0 },
                { label: 'Total Revenue', value: `$${(performance.summary?.totalRevenue ?? 0).toLocaleString()}` },
              ].map((s) => (
                <Box key={s.label}>
                  <Typography variant="h6">{s.value}</Typography>
                  <Typography variant="body2" color="text.secondary">{s.label}</Typography>
                </Box>
              ))}
            </Box>
          </Card>
          <Card>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Member</TableCell>
                  <TableCell>Role</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Login</TableCell>
                  <TableCell>Assigned Leads</TableCell>
                  <TableCell>Contacted</TableCell>
                  <TableCell>Appointments</TableCell>
                  <TableCell>Won</TableCell>
                  <TableCell>Conversion</TableCell>
                  <TableCell>Calls</TableCell>
                  <TableCell>Talk Time</TableCell>
                  <TableCell>SMS</TableCell>
                  <TableCell>MRR</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {performance.members
                  ?.slice(performancePage * performanceRowsPerPage, performancePage * performanceRowsPerPage + performanceRowsPerPage)
                  .map((member: any, index: number) => (
                    <TableRow key={member.id || index}>
                      <TableCell>{member.firstName} {member.lastName}</TableCell>
                      <TableCell>{ROLE_DISPLAY_TITLES[member.role as AppRole] || member.role}</TableCell>
                      <TableCell>{member.status}</TableCell>
                      <TableCell>{formatDate(member.lastLogin)}</TableCell>
                      <TableCell>{member.assignedLeads}</TableCell>
                      <TableCell>{member.contacted}</TableCell>
                      <TableCell>{member.appointments}</TableCell>
                      <TableCell>{member.won}</TableCell>
                      <TableCell>{member.conversion}%</TableCell>
                      <TableCell>{member.calls}</TableCell>
                      <TableCell>{Math.round(member.talkTime)} min</TableCell>
                      <TableCell>{member.sms}</TableCell>
                      <TableCell>${member.mrr?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
            <TablePagination
              rowsPerPageOptions={[5, 10, 25]}
              component="div"
              count={performance.members?.length || 0}
              rowsPerPage={performanceRowsPerPage}
              page={performancePage}
              onPageChange={(e, p) => setPerformancePage(p)}
              onRowsPerPageChange={(e) => { setPerformanceRowsPerPage(parseInt(e.target.value, 10)); setPerformancePage(0); }}
            />
          </Card>
        </>
      )}

      {/* ─── TAB 2: ACCESS LOGS ─────────────────────────────────────────── */}
      {activeTab === 2 && (
        <Card>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>User</TableCell>
                <TableCell>Feature</TableCell>
                <TableCell>Action</TableCell>
                <TableCell>Timestamp</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {logs.map((log, index) => (
                <TableRow key={log.id || index}>
                  <TableCell>{log.userName}</TableCell>
                  <TableCell>{log.feature}</TableCell>
                  <TableCell>{log.action}</TableCell>
                  <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {/* ─── TAB 3: LEAD ASSIGNMENT ─────────────────────────────────────── */}
      {activeTab === 3 && (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>

          {/* ── Sophia Auto-Assign Config (Management only) ── */}
          {isManagement && (
            <Card sx={{ p: 2, background: 'linear-gradient(135deg, #1a1040 0%, #0d1117 100%)', border: '1px solid #4c1d95' }}>
              <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                  <SmartToyIcon sx={{ color: '#a78bfa' }} />
                  <Box>
                    <Typography variant="subtitle1" sx={{ color: '#e9d5ff', fontWeight: 700 }}>
                      Sophia Auto-Assignment
                    </Typography>
                    <Typography variant="caption" sx={{ color: '#a78bfa' }}>
                      Management control — every new lead auto-assigned to Sophia (AI Sales Rep)
                    </Typography>
                  </Box>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <Box sx={{ display: 'flex', gap: 1 }}>
                    <Chip icon={<SmartToyIcon />} label={`${sophiaCount} with Sophia`} sx={{ bgcolor: '#4c1d95', color: '#e9d5ff' }} size="small" />
                    <Chip icon={<PeopleIcon />} label={`${assignedCount} assigned to team`} color="success" size="small" />
                    <Chip label={`${unassignedCount} in queue`} color="warning" size="small" />
                  </Box>
                  <Tooltip title={sophiaAutoAssign ? 'Sophia auto-assigns all new leads. Click to disable.' : 'New leads go to pool. Click to enable Sophia.'}>
                    <Button
                      variant={sophiaAutoAssign ? 'contained' : 'outlined'}
                      size="small"
                      color={sophiaAutoAssign ? 'secondary' : 'inherit'}
                      onClick={() => setSophiaAutoAssign(!sophiaAutoAssign)}
                      startIcon={<SmartToyIcon />}
                    >
                      {sophiaAutoAssign ? 'Sophia ON' : 'Sophia OFF'}
                    </Button>
                  </Tooltip>
                </Box>
              </Box>
              {sophiaAutoAssign && (
                <Alert severity="info" sx={{ mt: 1.5, fontSize: '0.75rem' }}>
                  All new leads are auto-assigned to <strong>Sophia (AI Sales Rep)</strong>.
                  Use the table below to bulk-reassign batches to your sales team. Only management (Agency Director / Sales Manager) can change this setting.
                </Alert>
              )}
            </Card>
          )}

          {/* ── Bulk Assign Controls ── */}
          <Card sx={{ p: 2 }}>
            <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', flexWrap: 'wrap', mb: 2 }}>
              <Typography variant="subtitle2" sx={{ fontWeight: 700, minWidth: 120 }}>
                Bulk Reassign
              </Typography>
              <FormControl size="small" sx={{ minWidth: 260 }}>
                <InputLabel>Assign to Sales Member</InputLabel>
                <Select
                  value={selectedMemberId}
                  label="Assign to Sales Member"
                  onChange={(e) => setSelectedMemberId(e.target.value as string)}
                >
                  <MenuItem value=""><em>— Select member —</em></MenuItem>
                  {salesMembers.map((u) => (
                    <MenuItem key={u.id} value={String(u.id)}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <AssignmentIndIcon fontSize="small" />
                        {u.displayName} ({ROLE_DISPLAY_TITLES[u.role] || u.role})
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              <Button
                variant="contained"
                color="primary"
                disabled={selectedLeads.length === 0 || !selectedMemberId || assignLeads.length === 0 || assignLeads.length === 0}
                startIcon={assignLeads.length === 0 ? <CircularProgress size={14} color="inherit" /> : <AssignmentIndIcon />}
                onClick={handleBulkAssign}
              >
                {assignLeads.length === 0 ? 'Assigning…' : `Assign ${selectedLeads.length || ''} Leads`}
              </Button>
              {selectedLeads.length > 0 && (
                <Typography variant="caption" color="text.secondary">
                  {selectedLeads.length} lead{selectedLeads.length !== 1 ? 's' : ''} selected
                </Typography>
              )}
            </Box>

            {assignError && <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setAssignError(null)}>{assignError}</Alert>}
            {assignSuccess && <Alert severity="success" sx={{ mb: 1.5 }} onClose={() => setAssignSuccess(null)}>{assignSuccess}</Alert>}

            {/* Filter + search bar */}
            <Box sx={{ display: 'flex', gap: 1.5, alignItems: 'center', mb: 2, flexWrap: 'wrap' }}>
              {(['all', 'sophia', 'assigned', 'unassigned'] as const).map((f) => (
                <Chip
                  key={f}
                  label={f === 'all' ? `All (${assignLeads.length})` : f === 'sophia' ? `Sophia (${sophiaCount})` : f === 'assigned' ? `Team (${assignedCount})` : `Unassigned (${unassignedCount})`}
                  onClick={() => { setLeadsFilter(f); setLeadsPage(0); }}
                  color={leadsFilter === f ? 'primary' : 'default'}
                  variant={leadsFilter === f ? 'filled' : 'outlined'}
                  size="small"
                  clickable
                />
              ))}
              <input
                type="text"
                placeholder="Search leads or owner…"
                value={leadsSearch}
                onChange={(e) => { setLeadsSearch(e.target.value); setLeadsPage(0); }}
                style={{ marginLeft: 'auto', padding: '4px 10px', borderRadius: 6, border: '1px solid #444', background: '#1e293b', color: '#e2e8f0', fontSize: 12, width: 220 }}
              />
              {leadsLoading && <CircularProgress size={18} />}
            </Box>

            <Box sx={{ maxHeight: '55vh', overflowY: 'auto' }}>
              <Table stickyHeader size="small">
                <TableHead>
                  <TableRow>
                    <TableCell padding="checkbox">
                      <Checkbox
                        indeterminate={selectedLeads.length > 0 && selectedLeads.length < filteredAssignLeads.length}
                        checked={filteredAssignLeads.length > 0 && selectedLeads.length === filteredAssignLeads.length}
                        onChange={(e) => {
                          setSelectedLeads(e.target.checked ? filteredAssignLeads.map((l) => getLeadId(l)) : []);
                        }}
                      />
                    </TableCell>
                    <TableCell>Business Name</TableCell>
                    <TableCell>GMB Status</TableCell>
                    <TableCell>Score</TableCell>
                    <TableCell>Est. Retainer</TableCell>
                    <TableCell>Assigned To</TableCell>
                    <TableCell>Actions</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {paginatedLeads.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} align="center" sx={{ py: 4, color: 'text.secondary' }}>
                        {leadsLoading ? 'Loading leads…' : 'No leads match current filter.'}
                      </TableCell>
                    </TableRow>
                  ) : (
                    paginatedLeads.map((lead: Lead, index: number) => {
                      const leadId = getLeadId(lead);
                      const owner = getLeadOwner(lead);
                      const isSophia = isSophiaOwned(lead);
                      return (
                        <TableRow key={leadId || index} hover>
                          <TableCell padding="checkbox">
                            <Checkbox
                              checked={selectedLeads.includes(leadId)}
                              onChange={(e) => {
                                setSelectedLeads(e.target.checked
                                  ? [...selectedLeads, leadId]
                                  : selectedLeads.filter((id) => id !== leadId)
                                );
                              }}
                            />
                          </TableCell>
                          <TableCell sx={{ fontWeight: 600, maxWidth: 200 }}>
                            <Tooltip title={getLeadName(lead)}>
                              <span style={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 190 }}>
                                {getLeadName(lead)}
                              </span>
                            </Tooltip>
                          </TableCell>
                          <TableCell>
                            {lead.gmb_status || lead.gmbLink || '—'}
                          </TableCell>
                          <TableCell>{getLeadScore(lead)}</TableCell>
                          <TableCell>${Number(getLeadRetainer(lead)).toLocaleString()}/mo</TableCell>
                          <TableCell>
                            <Chip
                              label={owner || 'Unassigned'}
                              size="small"
                              icon={isSophia ? <SmartToyIcon fontSize="small" /> : undefined}
                              color={isSophia ? 'secondary' : owner ? 'success' : 'warning'}
                              variant={isSophia ? 'filled' : 'outlined'}
                              sx={{ fontSize: '0.7rem', maxWidth: 160 }}
                            />
                          </TableCell>
                          <TableCell>
                            {isManagement && (
                              <Button size="small" variant="outlined" onClick={() => { setLeadToReassign(lead); setNewAssigneeId(''); }}>
                                Reassign
                              </Button>
                            )}
                          </TableCell>
                        </TableRow>
                      );
                    })
                  )}
                </TableBody>
              </Table>
            </Box>
            <TablePagination
              rowsPerPageOptions={[10, 20, 50, 100]}
              component="div"
              count={filteredAssignLeads.length}
              rowsPerPage={leadsRowsPerPage}
              page={leadsPage}
              onPageChange={(e, p) => setLeadsPage(p)}
              onRowsPerPageChange={(e) => { setLeadsRowsPerPage(parseInt(e.target.value, 10)); setLeadsPage(0); }}
            />
          </Card>
        </Box>
      )}

      {/* ── Invite Modal ──────────────────────────────────────────────────── */}
      <InviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => { fetchUsers(); setInviteModalOpen(false); }}
      />

      {/* ── Reassign Dialog ───────────────────────────────────────────────── */}
      {leadToReassign && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.75)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1300 }}>
          <Card sx={{ p: 3, width: 420, maxWidth: '95vw' }}>
            <Typography variant="h6" sx={{ mb: 0.5 }}>Reassign Lead</Typography>
            <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
              {getLeadName(leadToReassign)} → currently assigned to <strong>{getLeadOwner(leadToReassign) || 'nobody'}</strong>
            </Typography>
            {assignError && <Alert severity="error" sx={{ mb: 1.5 }} onClose={() => setAssignError(null)}>{assignError}</Alert>}
            <FormControl fullWidth sx={{ mt: 1 }}>
              <InputLabel>New Assignee</InputLabel>
              <Select value={newAssigneeId} onChange={(e) => setNewAssigneeId(e.target.value as string)} label="New Assignee">
                <MenuItem value=""><em>— Select member —</em></MenuItem>
                {salesMembers.map((u) => (
                  <MenuItem key={u.id} value={String(u.id)}>
                    {u.displayName} ({ROLE_DISPLAY_TITLES[u.role] || u.role})
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
              <Button onClick={() => { setLeadToReassign(null); setAssignError(null); }}>Cancel</Button>
              <Button
                variant="contained"
                disabled={!newAssigneeId || assignLeads.length === 0}
                startIcon={assignLeads.length === 0 ? <CircularProgress size={14} color="inherit" /> : undefined}
                onClick={handleReassignConfirm}
              >
                {assignLeads.length === 0 ? 'Saving…' : 'Confirm Reassign'}
              </Button>
            </Box>
          </Card>
        </Box>
      )}
    </Box>
  );
};

export default TeamPage;

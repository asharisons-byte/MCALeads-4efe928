import React, { useState, useEffect } from 'react';
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
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
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

interface TeamPageProps {
  currentUserRole: AppRole;
}

const TeamPage: React.FC<TeamPageProps> = ({ currentUserRole }) => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [performance, setPerformance] = useState<TeamPerformanceData | null>(null);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');
  const canInvite = currentUserRole === 'AGENCY_DIRECTOR' || currentUserRole === 'SALES_MANAGER';
  const isAgencyDirector = currentUserRole === 'AGENCY_DIRECTOR';
  const canAssignReassign = ['AGENCY_DIRECTOR', 'SALES_MANAGER'].includes(currentUserRole);

  const handleMarkNoConnect = async (leadId: string) => {
    // Logic to mark as 'No Connect' and potentially auto-reassign
    alert('Lead marked as No Connect. Please reassign.');
    // In a real app, call /api/leads/${leadId}/no-connect
  };

  const periods = ['Today', 'This Week', 'This Month', 'Last Month', 'All Time'];

  useEffect(() => {
    fetchUsers();
    fetchPerformance();
    fetchLogs();
  }, [selectedPeriod]);

  const fetchUsers = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch('/api/users', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      }
    } catch (error) {
      console.error('Failed to fetch users:', error);
    }
  };

  const fetchPerformance = async () => {
    try {
      const currentUser = auth.currentUser;
      if (!currentUser) return;
      const token = await currentUser.getIdToken();

      const response = await fetch(`/api/team/performance?period=${encodeURIComponent(selectedPeriod)}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
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
  };

  const fetchLogs = async () => {
    // In a real app, fetch from /api/access-logs
    setLogs([
      { id: '1', userName: 'John Doe', feature: 'Lead Management', action: 'Delete Lead', timestamp: new Date().toISOString() },
      { id: '2', userName: 'Jane Smith', feature: 'Client Portal', action: 'View Document', timestamp: new Date().toISOString() },
    ]);
  };

  const handleRoleChange = async (userId: number, newRole: string) => {
    try {
      const token = localStorage.getItem('firebaseToken');
      const response = await fetch(`/api/users/${userId}/role`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ role: newRole }),
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update role');
      }
    } catch (error) {
      console.error('Failed to update role:', error);
    }
  };

  const handleStatusChange = async (userId: number, newStatus: string) => {
    try {
      const token = localStorage.getItem('firebaseToken');
      const response = await fetch(`/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        fetchUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to update status');
      }
    } catch (error) {
      console.error('Failed to update status:', error);
    }
  };

  const getRoleBadge = (role: string) => {
    if (['AGENCY_DIRECTOR', 'SALES_MANAGER'].includes(role)) {
      return { label: 'Admin', color: 'error' as const };
    }
    if (['ACCOUNT_EXECUTIVE', 'CLIENT_SUCCESS', 'OPERATIONS_ANALYST'].includes(role)) {
      return { label: 'Editor', color: 'primary' as const };
    }
    return { label: 'Viewer', color: 'success' as const };
  };

  const getRoleTitle = (role: string) => {
    return ROLE_DISPLAY_TITLES[role as AppRole] || role;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'invited':
        return 'warning';
      case 'suspended':
        return 'error';
      default:
        return 'default';
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return 'Never';
    return new Date(date).toLocaleDateString();
  };

  const ROLES = [
    { value: 'AGENCY_DIRECTOR', label: 'Agency Director' },
    { value: 'SALES_MANAGER', label: 'Sales Manager' },
    { value: 'SDR', label: 'Sales Development Rep' },
    { value: 'ACCOUNT_EXECUTIVE', label: 'Account Executive' },
    { value: 'APPOINTMENT_SETTER', label: 'Appointment Setter' },
    { value: 'OUTREACH_SPECIALIST', label: 'Outreach Specialist' },
    { value: 'CLIENT_SUCCESS', label: 'Client Success Manager' },
    { value: 'OPERATIONS_ANALYST', label: 'Operations Analyst' },
  ];

  const [assignLeads, setAssignLeads] = useState<any[]>([]);
  const [selectedMemberId, setSelectedMemberId] = useState<string>('');
  const [selectedLeads, setSelectedLeads] = useState<string[]>([]);
  const [leadToReassign, setLeadToReassign] = useState<any>(null);
  const [newAssigneeId, setNewAssigneeId] = useState<string>('');

  async function getCurrentToken() {
    return auth.currentUser ? await auth.currentUser.getIdToken() : '';
  }

  useEffect(() => {
    if (activeTab === 3) {
      getCurrentToken().then(token => {
        fetch('/api/leads?limit=1000', {
          headers: { Authorization: `Bearer ${token}` }
        }).then(r => r.json()).then(d => setAssignLeads(d.leads || []));
      });
    }
  }, [activeTab]);

  const handleAssignLead = async (leadId: string, memberId: string) => {
    console.log('[DEBUG] Assigning lead:', { leadId, memberId });
    try {
      const token = await getCurrentToken();
      const response = await fetch(`/api/leads/${leadId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ assigned_user: { id: memberId } }),
      });
      const data = await response.json();
      console.log('[DEBUG] Assign lead response:', { ok: response.ok, data });
      if (response.ok) {
        // Refresh leads
        const leadsRes = await fetch('/api/leads?limit=1000', {
            headers: { Authorization: `Bearer ${token}` }
        });
        const d = await leadsRes.json();
        setAssignLeads(d.leads || []);
      } else {
        alert(data.error || 'Failed to assign lead');
      }
    } catch (e) {
      console.error(e);
      alert('Error assigning lead');
    }
  };

  if (loading && activeTab === 1) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <Typography>Loading team data...</Typography>
      </Box>
    );
  }

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

      {activeTab === 3 && (
        <Card sx={{ p: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, alignItems: 'center', mb: 2 }}>
            <FormControl fullWidth>
              <InputLabel>Select Team Member</InputLabel>
              <Select
                value={selectedMemberId}
                label="Select Team Member"
                onChange={(e) => setSelectedMemberId(e.target.value as string)}
              >
                {users
                  .filter(u => ['SDR', 'ACCOUNT_EXECUTIVE'].includes(u.role))
                  .map(u => (
                    <MenuItem key={u.id} value={String(u.id)}>
                      {u.displayName} ({u.role})
                    </MenuItem>
                  ))
                }
              </Select>
            </FormControl>
            <Button
              variant="contained"
              disabled={selectedLeads.length === 0 || !selectedMemberId}
              onClick={async () => {
                for (const leadId of selectedLeads) {
                  await handleAssignLead(leadId, selectedMemberId);
                }
                setSelectedLeads([]);
              }}
            >
              Assign Selected
            </Button>
          </Box>
          <Box sx={{ maxHeight: '600px', overflowY: 'auto' }}>
            <Table stickyHeader>
              <TableHead>
                <TableRow>
                  <TableCell padding="checkbox">
                    <Checkbox
                      indeterminate={selectedLeads.length > 0 && selectedLeads.length < assignLeads.filter(l => !l.assignedTo).length}
                      checked={selectedLeads.length === assignLeads.filter(l => !l.assignedTo).length && selectedLeads.length > 0}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedLeads(assignLeads.filter(l => !l.assignedTo).map(l => l.lead_id));
                        } else {
                          setSelectedLeads([]);
                        }
                      }}
                    />
                  </TableCell>
                  <TableCell>Business Name</TableCell>
                  <TableCell>GMB</TableCell>
                  <TableCell>Website</TableCell>
                  <TableCell>Marketing Gaps</TableCell>
                  <TableCell>Opportunity Score</TableCell>
                  <TableCell>Est. Retainer</TableCell>
                  <TableCell>Assigned To</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {assignLeads.map((lead: any, index) => (
                  <TableRow key={lead.lead_id || index}>
                    <TableCell padding="checkbox">
                      <Checkbox
                        disabled={!!lead.assignedTo}
                        checked={selectedLeads.includes(lead.lead_id)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLeads([...selectedLeads, lead.lead_id]);
                          } else {
                            setSelectedLeads(selectedLeads.filter(id => id !== lead.lead_id));
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{lead.businessName}</TableCell>
                    <TableCell>{lead.gmbLink || 'N/A'}</TableCell>
                    <TableCell>{lead.website || 'N/A'}</TableCell>
                    <TableCell>{lead.marketingGaps || 'N/A'}</TableCell>
                    <TableCell>{lead.opportunityScore || 'N/A'}</TableCell>
                    <TableCell>${lead.estRetainer || '0'}</TableCell>
                    <TableCell>
                      {lead.assignedTo ? (
                        <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                          {lead.assignedTo}
                          {canAssignReassign && (
                            <Button size="small" onClick={() => setLeadToReassign(lead)}>
                              Reassign
                            </Button>
                          )}
                        </Box>
                      ) : (
                        <Button
                          variant="contained"
                          size="small"
                          disabled={!selectedMemberId}
                          onClick={() => handleAssignLead(lead.lead_id, selectedMemberId)}
                        >
                          Assign
                        </Button>
                      )}
                    </TableCell>
                    <TableCell>
                      {lead.assignedTo && (
                          <Button size="small" color="error" onClick={() => handleMarkNoConnect(lead.lead_id)}>
                            No Connect
                          </Button>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Box>
        </Card>
      )}

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
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      {user.displayName}
                      <Chip
                        label={getRoleTitle(user.role)}
                        size="small"
                        color="primary"
                        variant="outlined"
                      />
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
                          <MenuItem key={value} value={value}>
                            {label}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={user.status}
                      color={getStatusColor(user.status) as any}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>{formatDate(user.lastLoginAt)}</TableCell>
                  <TableCell>
                    <IconButton
                      size="small"
                      onClick={() =>
                        handleStatusChange(
                          user.id,
                          user.status === 'active' ? 'suspended' : 'active'
                        )
                      }
                      disabled={user.status === 'invited' || !canInvite}
                    >
                      {user.status === 'active' ? (
                        <BlockIcon fontSize="small" />
                      ) : (
                        <CheckCircleIcon fontSize="small" color="success" />
                      )}
                    </IconButton>
                    {user.status === 'invited' && canInvite && (
                      <Button
                        size="small"
                        variant="outlined"
                        color="success"
                        onClick={() => handleStatusChange(user.id, 'active')}
                        sx={{ ml: 1, fontSize: '0.7rem', py: 0.3 }}
                      >
                        Activate
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Card>
      )}

      {activeTab === 1 && performance && (
        <>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 2 }}>
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Period</InputLabel>
              <Select
                value={selectedPeriod}
                label="Period"
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                {periods.map((period) => (
                  <MenuItem key={period} value={period}>
                    {period}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>

          <Card sx={{ mb: 3 }}>
            <Box sx={{ p: 2, display: 'flex', gap: 3 }}>
              <Box>
                <Typography variant="h6">{performance.summary?.totalMembers ?? 0}</Typography>
                <Typography>Total Members</Typography>
              </Box>
              <Box>
                <Typography variant="h6">{performance.summary?.activeMembers ?? 0}</Typography>
                <Typography>Active Members</Typography>
              </Box>
              <Box>
                <Typography variant="h6">{performance.summary?.totalLeads ?? 0}</Typography>
                <Typography>Total Leads</Typography>
              </Box>
              <Box>
                <Typography variant="h6">{performance.summary?.totalDeals ?? 0}</Typography>
                <Typography>Closed Deals</Typography>
              </Box>
              <Box>
                <Typography variant="h6">
                  ${(performance.summary?.totalRevenue ?? 0).toLocaleString()}
                </Typography>
                <Typography>Total Revenue</Typography>
              </Box>
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
                {performance.members?.map((member: any, index) => (
                  <TableRow key={member.id || index}>
                    <TableCell>{member.firstName} {member.lastName}</TableCell>
                    <TableCell>{getRoleTitle(member.role)}</TableCell>
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
                    <TableCell>${member.mrr.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Card>
        </>
      )}

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

      <InviteMemberModal
        open={inviteModalOpen}
        onClose={() => setInviteModalOpen(false)}
        onSuccess={() => {
          fetchUsers();
          setInviteModalOpen(false);
        }}
      />
      {/* Reassign Dialog */}
      {leadToReassign && (
        <Box sx={{ position: 'fixed', inset: 0, bgcolor: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
            <Card sx={{ p: 3, width: 400 }}>
                <Typography variant="h6">Reassign {leadToReassign.businessName}</Typography>
                <FormControl fullWidth sx={{ mt: 2 }}>
                    <InputLabel>New Assignee</InputLabel>
                    <Select value={newAssigneeId} onChange={e => setNewAssigneeId(e.target.value as string)}>
                        {users.filter(u => ['SDR', 'ACCOUNT_EXECUTIVE'].includes(u.role)).map(u => (
                            <MenuItem key={u.id} value={String(u.id)}>{u.displayName}</MenuItem>
                        ))}
                    </Select>
                </FormControl>
                <Box sx={{ mt: 3, display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
                    <Button onClick={() => setLeadToReassign(null)}>Cancel</Button>
                    <Button variant="contained" disabled={!newAssigneeId} onClick={async () => {
                        await handleAssignLead(leadToReassign.lead_id, newAssigneeId);
                        setLeadToReassign(null);
                        setNewAssigneeId('');
                    }}>Confirm Reassign</Button>
                </Box>
            </Card>
        </Box>
      )}
    </Box>
  );
};

export default TeamPage;

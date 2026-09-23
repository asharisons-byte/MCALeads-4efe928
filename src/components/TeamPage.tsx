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
} from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import InviteMemberModal from './InviteMemberModal';

import { AppRole, ROLE_DISPLAY_TITLES } from '../utils/roleUtils.js';
import { canAccess } from '../utils/roleUtils.js';

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

const TeamPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [users, setUsers] = useState<User[]>([]);
  const [performance, setPerformance] = useState<TeamPerformanceData | null>(null);
  const [logs, setLogs] = useState<AccessLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [inviteModalOpen, setInviteModalOpen] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState('This Month');

  const periods = ['Today', 'This Week', 'This Month', 'Last Month', 'All Time'];

  useEffect(() => {
    fetchUsers();
    fetchPerformance();
    fetchLogs();
  }, [selectedPeriod]);

  const fetchUsers = async () => {
    try {
      const token = localStorage.getItem('firebaseToken');
      if (!token) return;

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
      const token = localStorage.getItem('firebaseToken');
      if (!token) return;

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
        <Button variant="contained" onClick={() => setInviteModalOpen(true)}>
          Invite Member
        </Button>
      </Box>

      <Card sx={{ mb: 3 }}>
        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
          <Tab label="Members" />
          <Tab label="Performance" />
          <Tab label="Access Logs" />
        </Tabs>
      </Card>

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
                      {canManageTeam(user.role) && (
                        <Chip
                          label={getRoleBadge(user.role).label}
                          color={getRoleBadge(user.role).color as any}
                          size="small"
                        />
                      )}
                    </Box>
                  </TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>
                    <FormControl size="small" sx={{ minWidth: 200 }}>
                      <Select
                        value={user.role}
                        onChange={(e) => handleRoleChange(user.id, e.target.value)}
                        disabled={user.status === 'suspended'}
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
                      disabled={user.status === 'invited'}
                    >
                      {user.status === 'active' ? (
                        <BlockIcon fontSize="small" />
                      ) : (
                        <CheckCircleIcon fontSize="small" color="success" />
                      )}
                    </IconButton>
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
                <Typography variant="h6">{performance.summary.totalMembers}</Typography>
                <Typography>Total Members</Typography>
              </Box>
              <Box>
                <Typography variant="h6">{performance.summary.activeMembers}</Typography>
                <Typography>Active Members</Typography>
              </Box>
              <Box>
                <Typography variant="h6">{performance.summary.totalLeads}</Typography>
                <Typography>Total Leads</Typography>
              </Box>
              <Box>
                <Typography variant="h6">{performance.summary.totalDeals}</Typography>
                <Typography>Closed Deals</Typography>
              </Box>
              <Box>
                <Typography variant="h6">
                  ${performance.summary.totalRevenue.toLocaleString()}
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
                {performance.members.map((member: any) => (
                  <TableRow key={member.id}>
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
              {logs.map((log) => (
                <TableRow key={log.id}>
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
    </Box>
  );
};

export default TeamPage;

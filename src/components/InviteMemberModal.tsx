import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  IconButton,
} from '@mui/material';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';

interface InviteMemberModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

interface FormData {
  email: string;
  firstName: string;
  lastName: string;
  role: string;
}

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

const InviteMemberModal: React.FC<InviteMemberModalProps> = ({ open, onClose, onSuccess }) => {
  const [formData, setFormData] = useState<FormData>({
    email: '',
    firstName: '',
    lastName: '',
    role: 'SDR',
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError(null);
  };

  const handleRoleChange = (e: any) => {
    setFormData((prev) => ({ ...prev, role: e.target.value }));
    setError(null);
  };

  const handleSubmit = async () => {
    if (!formData.email || !formData.firstName || !formData.role) {
      setError('Email, first name, and role are required');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const token = localStorage.getItem('firebaseToken');
      if (!token) {
        setError('Authentication required. Please log in again.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/users/invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send invite');
      }

      setInviteLink(data.inviteLink);
      onSuccess?.();
    } catch (err: any) {
      setError(err.message || 'Failed to send invite');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyLink = () => {
    if (inviteLink) {
      const fullUrl = `${window.location.origin}${inviteLink}`;
      navigator.clipboard.writeText(fullUrl);
    }
  };

  const handleClose = () => {
    setFormData({ email: '', firstName: '', lastName: '', role: 'SDR' });
    setError(null);
    setInviteLink(null);
    onClose();
  };

  return (
    <Dialog open={open} onClose={handleClose} maxWidth="sm" fullWidth>
      <DialogTitle>Invite Team Member</DialogTitle>
      <DialogContent>
        {!inviteLink ? (
          <>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 1 }}>
              <TextField
                name="firstName"
                label="First Name"
                value={formData.firstName}
                onChange={handleChange}
                fullWidth
                required
              />
              <TextField
                name="lastName"
                label="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                name="email"
                label="Email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                fullWidth
                required
              />
              <FormControl fullWidth required>
                <InputLabel>Role</InputLabel>
                <Select
                  name="role"
                  value={formData.role}
                  label="Role"
                  onChange={handleRoleChange}
                >
                  {ROLES.map((role) => (
                    <MenuItem key={role.value} value={role.value}>
                      {role.label}
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
              {error && (
                <Typography color="error" variant="body2">
                  {error}
                </Typography>
              )}
            </Box>
          </>
        ) : (
          <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2, color: 'success.main' }}>
              Invite Sent Successfully!
            </Typography>
            <Typography variant="body2" sx={{ mb: 1 }}>
              Share this link with the team member:
            </Typography>
            <Box
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                p: 1,
                bgcolor: 'background.paper',
                border: '1px solid',
                borderColor: 'divider',
                borderRadius: 1,
              }}
            >
              <Typography variant="body2" sx={{ flexGrow: 1, wordBreak: 'break-all' }}>
                {window.location.origin}{inviteLink}
              </Typography>
              <IconButton onClick={handleCopyLink} size="small">
                <ContentCopyIcon fontSize="small" />
              </IconButton>
            </Box>
          </Box>
        )}
      </DialogContent>
      <DialogActions>
        {!inviteLink ? (
          <>
            <Button onClick={handleClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSubmit} variant="contained" disabled={loading}>
              {loading ? 'Sending...' : 'Send Invite'}
            </Button>
          </>
        ) : (
          <Button onClick={handleClose} variant="contained">
            Done
          </Button>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default InviteMemberModal;

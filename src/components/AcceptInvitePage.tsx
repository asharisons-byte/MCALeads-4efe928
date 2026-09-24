import React, { useState, useEffect } from 'react';
import { Box, Typography, TextField, Button, CircularProgress, Card } from '@mui/material';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../lib/firebase';

const AcceptInvitePage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [inviteData, setInviteData] = useState<any>(null);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    password: '',
    confirmPassword: '',
  });

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    if (!token) {
      setError('Invalid invite token');
      setLoading(false);
      return;
    }

    fetch(`/api/users/invite/accept?token=${token}`)
      .then(res => res.json())
      .then(data => {
        if (data.error) throw new Error(data.error);
        setInviteData(data);
        setFormData(prev => ({ ...prev, firstName: data.firstName, lastName: data.lastName }));
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    setSubmitting(true);
    setError(null);
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, inviteData.email, formData.password);
      const firebaseUid = userCredential.user.uid;
      const params = new URLSearchParams(window.location.search);

      const res = await fetch('/api/users/invite/complete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: params.get('token'), firebaseUid }),
      });

      if (!res.ok) throw new Error('Failed to activate account');
      window.location.href = '/';
    } catch (err: any) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <Box sx={{ display: 'flex', justifyContent: 'center', p: 5 }}><CircularProgress /></Box>;
  if (error) return <Box sx={{ color: 'error.main', p: 5 }}>{error}</Box>;

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: '#111827' }}>
      <Card sx={{ p: 4, width: '100%', maxWidth: 400, bgcolor: '#1f2937', color: 'white' }}>
        <Typography variant="h5" sx={{ mb: 2 }}>Accept Team Invitation</Typography>
        <form onSubmit={handleSubmit}>
          <TextField fullWidth disabled label="Email" value={inviteData.email} margin="normal" sx={{ input: { color: 'white' } }} />
          <TextField fullWidth label="First Name" value={formData.firstName} onChange={e => setFormData({ ...formData, firstName: e.target.value })} margin="normal" required sx={{ input: { color: 'white' } }} />
          <TextField fullWidth label="Last Name" value={formData.lastName} onChange={e => setFormData({ ...formData, lastName: e.target.value })} margin="normal" required sx={{ input: { color: 'white' } }} />
          <TextField fullWidth type="password" label="Password" value={formData.password} onChange={e => setFormData({ ...formData, password: e.target.value })} margin="normal" required sx={{ input: { color: 'white' } }} />
          <TextField fullWidth type="password" label="Confirm Password" value={formData.confirmPassword} onChange={e => setFormData({ ...formData, confirmPassword: e.target.value })} margin="normal" required sx={{ input: { color: 'white' } }} />
          {error && <Typography color="error" sx={{ mt: 1 }}>{error}</Typography>}
          <Button type="submit" variant="contained" fullWidth sx={{ mt: 3 }} disabled={submitting}>
            {submitting ? <CircularProgress size={24} /> : 'Complete Setup'}
          </Button>
        </form>
      </Card>
    </Box>
  );
};

export default AcceptInvitePage;

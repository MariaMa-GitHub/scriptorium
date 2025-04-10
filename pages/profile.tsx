import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TextField, Button, Paper, Typography, Box, Alert, Container } from '@mui/material';
import { useRouter } from 'next/router';
import { withAuth } from '@/components/WithAuth';

function Profile() {
  const { user, updateProfile, isLoading } = useAuth();
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    avatar: '',
    password: ''
  });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    if (!isLoading && !user) {
      router.push('/login');
    } else if (user) {
      setFormData({
        email: user.email,
        firstName: user.firstName.trim(),
        lastName: user.lastName.trim(),
        phoneNumber: user.phoneNumber || '',
        avatar: user.avatar || '',
        password: ''
      });
    }
  }, [user, isLoading, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.name === 'firstName' || e.target.name === 'lastName' 
        ? e.target.value.trim() 
        : e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    
    try {
      const updateData = { ...formData } as Partial<typeof formData>;
      if (!updateData.password) {
        delete updateData.password;
      }
      await updateProfile(updateData);
      setSuccess('Profile updated successfully');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Profile update failed');
    }
  };

  if (isLoading || !user) {
    return null;
  }

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom textAlign="center">
            {user?.role === 'ADMIN' ? 'Admin Profile Settings' : 'Profile Settings'}
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          {success && (
            <Alert severity="success" sx={{ mb: 2 }}>
              {success}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <TextField
              label="First Name"
              name="firstName"
              fullWidth
              margin="normal"
              value={formData.firstName}
              onChange={handleChange}
              required
            />
            
            <TextField
              label="Last Name"
              name="lastName"
              fullWidth
              margin="normal"
              value={formData.lastName}
              onChange={handleChange}
              required
            />
            
            <TextField
              label="Email"
              name="email"
              type="email"
              fullWidth
              margin="normal"
              value={formData.email}
              onChange={handleChange}
              required
            />
            
            <TextField
              label="New Password (leave blank to keep current)"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              helperText="At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character"
            />
            
            <TextField
              label="Phone Number"
              name="phoneNumber"
              type="tel"
              fullWidth
              margin="normal"
              value={formData.phoneNumber}
              onChange={handleChange}
            />
            
            <TextField
              label="Avatar URL"
              name="avatar"
              fullWidth
              margin="normal"
              value={formData.avatar}
              onChange={handleChange}
            />
            
            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ mt: 3 }}
            >
              Update Profile
            </Button>
          </form>
        </Paper>
      </Box>
    </Container>
  );
}

export default withAuth(Profile);
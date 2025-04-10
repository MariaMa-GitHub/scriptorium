import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { TextField, Button, Paper, Typography, Box, Alert, Container } from '@mui/material';
import Link from 'next/link';
import { useRouter, } from 'next/router';
export default function Signup() {

  const router = useRouter();
  const { role } = router.query;
  const isAdminSignup = role === 'admin' || role === 'ADMIN';

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    avatar: '',
    role: isAdminSignup ? 'ADMIN' : 'USER',
    adminSecret: ''
  });

  useEffect(() => {
    if (isAdminSignup) {
      setFormData(prev => ({
        ...prev,
        role: 'ADMIN'
      }));
    }
  }, [role, isAdminSignup]);

  const [error, setError] = useState('');
  const { signup } = useAuth();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    
    try {
      if (isAdminSignup && !formData.adminSecret) {
        throw new Error('Admin secret is required for administrator registration');
      }
      await signup(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Signup failed');
    }
  };

  return (
    <Container maxWidth="sm">
      <Box sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Typography variant="h5" component="h1" gutterBottom textAlign="center">
            Create an Account
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
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
              label="Password"
              name="password"
              type="password"
              fullWidth
              margin="normal"
              value={formData.password}
              onChange={handleChange}
              required
              helperText="At least 8 characters, 1 uppercase, 1 lowercase, 1 number, 1 special character"
            />
            
            <TextField
              label="Phone Number"
              name="phoneNumber"
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

            {isAdminSignup && (
              <TextField
                label="Admin Secret"
                name="adminSecret"
                type="password"
                fullWidth
                margin="normal"
                value={formData.adminSecret}
                onChange={handleChange}
                required
                helperText="Enter the administrator secret key to create an admin account"
              />
            )}

            <Button 
              type="submit" 
              variant="contained" 
              fullWidth 
              sx={{ mt: 3, mb: 2 }}
            >
              Sign Up
            </Button>
            
            <Typography textAlign="center">
              Already have an account?{' '}
              <Link href="/login" passHref>
                <Typography component="span" color="primary" sx={{ cursor: 'pointer' }}>
                  Login
                </Typography>
              </Link>
            </Typography>
          </form>
          
        </Paper>
      </Box>
    </Container>
  );
}
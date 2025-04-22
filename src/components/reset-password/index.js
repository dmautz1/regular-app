import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/system';
import { updatePassword } from '../../utils/auth';

const PageContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '20px'
}));

const ResetContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '500px',
  padding: '32px',
  display: 'flex',
  flexDirection: 'column',
  gap: '24px',
  backgroundColor: '#202B3E',
  borderRadius: '16px',
  boxShadow: '0 8px 32px rgba(0, 0, 0, 0.2)'
}));

const FormField = styled(TextField)(({ theme }) => ({
  marginBottom: '16px',
  '.MuiOutlinedInput-root': {
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: '8px',
    '&:hover .MuiOutlinedInput-notchedOutline': {
      borderColor: 'rgba(138, 78, 252, 0.5)',
    },
    '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
      borderColor: '#8A4EFC',
    }
  },
  '.MuiOutlinedInput-notchedOutline': {
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  '.MuiInputLabel-root': {
    color: 'rgba(255, 255, 255, 0.6)',
    '&.Mui-focused': {
      color: '#8A4EFC'
    }
  },
  '.MuiInputBase-input': {
    color: '#EEE'
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(to right, #D81E58, #8A4EFC)',
  color: 'white',
  padding: '10px 16px',
  borderRadius: '8px',
  fontWeight: '600',
  textTransform: 'none',
  transition: 'all 0.3s ease',
  marginTop: '16px',
  '&:hover': {
    background: 'linear-gradient(to right, #8A4EFC, #D81E58)',
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(138, 78, 252, 0.3)'
  },
  '&:disabled': {
    background: 'rgba(255, 255, 255, 0.12)',
    color: 'rgba(255, 255, 255, 0.3)'
  }
}));

function ResetPassword() {
  const navigate = useNavigate();
  
  const [state, setState] = useState({
    password: '',
    confirmPassword: '',
    loading: false,
    error: null,
    success: false
  });

  // Validate form input
  const validateForm = () => {
    if (state.password.length < 8) {
      setState(prev => ({ ...prev, error: 'Password must be at least 8 characters' }));
      return false;
    }
    
    if (state.password !== state.confirmPassword) {
      setState(prev => ({ ...prev, error: 'Passwords do not match' }));
      return false;
    }
    
    setState(prev => ({ ...prev, error: null }));
    return true;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setState(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await updatePassword(state.password);

      if (error) {
        throw new Error(error.message);
      }
      
      setState(prev => ({ ...prev, loading: false, success: true }));
      
      // Redirect to login after 3 seconds
      setTimeout(() => {
        navigate('/login', { 
          state: { passwordResetSuccess: true },
          replace: true 
        });
      }, 3000);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to reset password' 
      }));
    }
  };

  return (
    <PageContainer maxWidth="md">
      <ResetContainer>
        <Typography variant="h4" component="h1" color="#EEE" align="center">
          Reset Your Password
        </Typography>
        
        {state.error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {state.error}
          </Alert>
        )}
        
        {state.success ? (
          <Alert severity="success">
            Password reset successful! Redirecting to login...
          </Alert>
        ) : (
          <form onSubmit={handleSubmit}>
            <Typography color="#A4B1CD" paragraph>
              Please enter your new password below.
            </Typography>
            
            <FormField
              label="New Password"
              name="password"
              type="password"
              value={state.password}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              margin="normal"
              required
              disabled={state.loading}
            />
            
            <FormField
              label="Confirm New Password"
              name="confirmPassword"
              type="password"
              value={state.confirmPassword}
              onChange={handleChange}
              fullWidth
              variant="outlined"
              margin="normal"
              required
              disabled={state.loading}
            />
            
            <GradientButton
              type="submit"
              fullWidth
              disabled={state.loading}
            >
              {state.loading ? <CircularProgress size={24} color="inherit" /> : 'Reset Password'}
            </GradientButton>
          </form>
        )}
        
        <Box mt={2} textAlign="center">
          <Button 
            color="primary" 
            onClick={() => navigate('/login')}
            sx={{ color: '#61759b' }}
          >
            Back to Login
          </Button>
        </Box>
      </ResetContainer>
    </PageContainer>
  );
}

export default ResetPassword; 
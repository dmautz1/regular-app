import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Button,
  Alert,
  CircularProgress,
  Box
} from '@mui/material';
import { styled } from '@mui/system';
import { loadReCaptcha } from "react-recaptcha-v3";
import { requestPasswordReset } from '../../utils/auth';

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

const ForgotPasswordDialog = ({ open, onClose }) => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);
  
  useEffect(() => {
    // Initialize reCAPTCHA v3
    loadReCaptcha(process.env.REACT_APP_RECAPTCHA_SITE_KEY);
  }, []);
  
  const handleChange = (e) => {
    setEmail(e.target.value);
    setError(null);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setError('Please enter your email address');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const { error } = await requestPasswordReset(email, await window.grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, { action: 'forgot_password' }));

      if (error) {
        throw new Error(error.message);
      }

      setSuccess(true);
      setLoading(false);
    } catch (error) {
      setError(error.message || 'Failed to send reset link');
      setLoading(false);
    }
  };
  
  const handleClose = () => {
    // Reset the form state
    setEmail('');
    setError(null);
    setSuccess(false);
    setLoading(false);
    onClose();
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={handleClose}
      PaperProps={{
        sx: { 
          borderRadius: '16px',
          backgroundColor: '#202B3E'
        }
      }}
    >
      <DialogTitle sx={{ color: '#EEE' }}>
        Forgot Your Password?
      </DialogTitle>
      <DialogContent>
        {success ? (
          <Alert severity="success" sx={{ mt: 2 }}>
            If an account exists with this email, a password reset link has been sent!
          </Alert>
        ) : (
          <>
            <DialogContentText sx={{ color: '#A4B1CD', mb: 2 }}>
              Enter your email address below and we'll send you a link to reset your password.
            </DialogContentText>
            
            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}
            
            <FormField
              autoFocus
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={email}
              onChange={handleChange}
              disabled={loading}
            />
          </>
        )}
      </DialogContent>
      <DialogActions sx={{ p: 3, pt: 0 }}>
        <Button 
          onClick={handleClose}
          sx={{ 
            color: '#A4B1CD',
            '&:hover': {
              backgroundColor: 'rgba(138, 78, 252, 0.08)',
              color: '#8A4EFC'
            }
          }}
        >
          {success ? 'Close' : 'Cancel'}
        </Button>
        {!success && (
          <GradientButton
            onClick={handleSubmit}
            disabled={loading || !email}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
          </GradientButton>
        )}
      </DialogActions>
    </Dialog>
  );
};

export default ForgotPasswordDialog; 
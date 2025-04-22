import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { useApi } from "../../utils/api";
import { useSignIn } from 'react-auth-kit';
import ForgotPasswordDialog from "./forgot-password";
import ReCAPTCHA from "react-google-recaptcha";
import {
  Container,
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Alert,
  CircularProgress,
  Divider
} from '@mui/material';
import { styled } from '@mui/system';

// Styled components for consistent design with the app
const PageContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  alignItems: 'center',
  minHeight: '100vh',
  padding: '20px'
}));

const LoginContainer = styled(Paper)(({ theme }) => ({
  width: '100%',
  maxWidth: '450px',
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
  },
  '.MuiFormHelperText-root': {
    color: '#eb5d5d'
  }
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(to right, #D81E58, #8A4EFC)',
  color: 'white',
  padding: '12px 16px',
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

const TextButton = styled(Button)(({ theme }) => ({
  color: '#61759b',
  textTransform: 'none',
  fontWeight: '500',
  '&:hover': {
    backgroundColor: 'rgba(138, 78, 252, 0.08)',
    color: '#8A4EFC'
  }
}));

function Login() {
  const [showForgotPasswordDialog, setShowForgotPasswordDialog] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const navigate = useNavigate();
  const signIn = useSignIn();
  const api = useApi();
  const location = useLocation();
  
  // Check if we're coming from registration or password reset
  const registrationSuccess = location.state?.registrationSuccess;
  const passwordResetSuccess = location.state?.passwordResetSuccess;
  const sessionExpired = location.state?.sessionExpired;

  const formik = useFormik({
    initialValues: {
      email: "",
      password: ""
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().required('Password is required')
    }),
    onSubmit: async (values) => {
      if (!recaptchaToken) {
        setError("Please complete the reCAPTCHA verification");
        return;
      }

      setError("");
      setLoading(true);

      try {
        const response = await api.post("/auth/login", {
          email: values.email,
          password: values.password,
          recaptchaToken
        });
        
        signIn({
          token: response.token,
          expiresIn: 720, // 12 hours in minutes
          tokenType: "Bearer",
          authState: response.user
        });
        
        setLoading(false);
        navigate("/");
      } catch (err) {
        setLoading(false);
        setError(err.message || "Login failed. Please try again.");
      }
    },
  });

  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token || "");
    // Clear error message if it was about reCAPTCHA
    if (error && error.includes("reCAPTCHA")) {
      setError("");
    }
  };

  const handleRecaptchaExpired = () => {
    setRecaptchaToken("");
  };

  // Debug the site key
  useEffect(() => {
    console.log('ReCAPTCHA Site Key:', process.env.REACT_APP_RECAPTCHA_SITE_KEY);
  }, []);

  return (
    <PageContainer maxWidth="lg">
      <LoginContainer>
        <Typography variant="h4" component="h1" color="#EEE" align="center" fontWeight="600">
          Sign in to Regular
        </Typography>
        
        {sessionExpired && (
          <Alert severity="info" sx={{ mt: 1 }}>
            Your session has expired. Please sign in again.
          </Alert>
        )}
        
        {registrationSuccess && (
          <Alert severity="success" sx={{ mt: 1 }}>
            Registration successful! Please sign in with your new account.
          </Alert>
        )}
        
        {passwordResetSuccess && (
          <Alert severity="success" sx={{ mt: 1 }}>
            Password has been reset successfully! Please sign in with your new password.
          </Alert>
        )}
        
        {error && (
          <Alert severity="error" sx={{ mt: 1 }}>
            {error}
          </Alert>
        )}
        
        <Box component="form" onSubmit={formik.handleSubmit}>          
          <FormField
            label="Email Address"
            name="email"
            type="email"
            value={formik.values.email}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.email && Boolean(formik.errors.email)}
            helperText={formik.touched.email && formik.errors.email}
            fullWidth
            variant="outlined"
            margin="normal"
            required
            autoFocus
            disabled={loading}
          />
          
          <FormField
            label="Password"
            name="password"
            type="password"
            value={formik.values.password}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.password && Boolean(formik.errors.password)}
            helperText={formik.touched.password && formik.errors.password}
            fullWidth
            variant="outlined"
            margin="normal"
            required
            disabled={loading}
          />
          
          {/* Add reCAPTCHA */}
          <Box display="flex" justifyContent="center" sx={{ my: 2 }}>
            <ReCAPTCHA
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY}
              onChange={handleRecaptchaChange}
              onExpired={handleRecaptchaExpired}
              theme="dark"
            />
          </Box>
          
          <GradientButton
            type="submit"
            fullWidth
            disabled={loading || formik.isSubmitting || !recaptchaToken}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign In'}
          </GradientButton>
          
          <Box mt={2} display="flex" justifyContent="flex-end">
            <TextButton onClick={() => setShowForgotPasswordDialog(true)}>
              Forgot Password?
            </TextButton>
          </Box>
          
          <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          
          <Box textAlign="center">
            <Typography color="#A4B1CD" sx={{ mb: 1 }}>
              Don't have an account?
            </Typography>
            <TextButton 
              onClick={() => navigate("/register")}
              variant="outlined"
              sx={{
                borderColor: 'rgba(138, 78, 252, 0.3)',
                borderRadius: '8px',
                padding: '8px 16px'
              }}
            >
              Sign Up
            </TextButton>
          </Box>
        </Box>
      </LoginContainer>

      <ForgotPasswordDialog
        open={showForgotPasswordDialog}
        onClose={() => setShowForgotPasswordDialog(false)}
      />
    </PageContainer>
  );
}

export default Login;
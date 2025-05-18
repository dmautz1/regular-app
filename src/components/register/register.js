import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useFormik } from "formik";
import * as Yup from 'yup';
import { useApi } from "../../utils/api";
import { loadReCaptcha } from "react-recaptcha-v3";
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

const RegisterContainer = styled(Paper)(({ theme }) => ({
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

function Register() {
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();
  const api = useApi();

  useEffect(() => {
    // Initialize reCAPTCHA v3
    loadReCaptcha(process.env.REACT_APP_RECAPTCHA_SITE_KEY);
    // Set data-page attribute
    document.body.setAttribute('data-page', 'signup');
    // Cleanup
    return () => {
      document.body.removeAttribute('data-page');
    };
  }, []);

  const formik = useFormik({
    initialValues: {
      email: "",
      password: "",
      passwordConfirmation: ""
    },
    validationSchema: Yup.object().shape({
      email: Yup.string().email('Invalid email address').required('Required'),
      password: Yup.string().min(8, 'Password must be at least 8 characters').required('Password is required'),
      passwordConfirmation: Yup.string().oneOf([Yup.ref('password'), null], 'Passwords must match').required('Please confirm your password')
    }),
    onSubmit: async (values) => {
      setError("");
      setLoading(true);

      try {
        await api.post("/auth/register", {
          ...values,
          recaptchaToken: await window.grecaptcha.execute(process.env.REACT_APP_RECAPTCHA_SITE_KEY, { action: 'register' })
        });
        setLoading(false);
        // Success - navigate to login with success message
        navigate("/login", { 
          state: { registrationSuccess: true },
          replace: true 
        });
      } catch (err) {
        setLoading(false);
        setError(err.message || "Registration failed. Please try again.");
      }
    },
  });

  return (
    <PageContainer>
      <RegisterContainer>
        <Typography variant="h4" component="h1" color="#EEE" align="center" fontWeight="600">
          Create Your Account
        </Typography>
        
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
          
          <FormField
            label="Confirm Password"
            name="passwordConfirmation"
            type="password"
            value={formik.values.passwordConfirmation}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            error={formik.touched.passwordConfirmation && Boolean(formik.errors.passwordConfirmation)}
            helperText={formik.touched.passwordConfirmation && formik.errors.passwordConfirmation}
            fullWidth
            variant="outlined"
            margin="normal"
            required
            disabled={loading}
          />
          
          <GradientButton
            type="submit"
            fullWidth
            disabled={loading || formik.isSubmitting}
          >
            {loading ? <CircularProgress size={24} color="inherit" /> : 'Sign Up'}
          </GradientButton>
          
          <Divider sx={{ my: 3, backgroundColor: 'rgba(255,255,255,0.1)' }} />
          
          <Box textAlign="center">
            <Typography color="#A4B1CD" sx={{ mb: 1 }}>
              Already have an account?
            </Typography>
            <TextButton 
              onClick={() => navigate("/login")}
              variant="outlined"
              sx={{
                borderColor: 'rgba(138, 78, 252, 0.3)',
                borderRadius: '8px',
                padding: '8px 16px'
              }}
            >
              Sign In
            </TextButton>
          </Box>
        </Box>
      </RegisterContainer>
    </PageContainer>
  );
}

export default Register;
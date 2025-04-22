import React, { useState, useEffect, useRef } from "react";
import { useAuthUser, useSignOut } from 'react-auth-kit';
import { useNavigate } from "react-router-dom";
import { RouterBottomNavigation } from "../navigation/nav";
import ReCAPTCHA from "react-google-recaptcha";
import {
  Container,
  Box,
  Typography,
  Button,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Chip,
  Avatar,
  TextField,
  Paper,
  IconButton,
  Alert,
  Snackbar,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  CircularProgress
} from "@mui/material";
import { styled } from '@mui/system';
import {
  Lock,
  Logout,
  Star,
  AccessTime,
  Edit,
  Save,
  Cancel,
  PhotoCamera
} from "@mui/icons-material";
import { useApi } from "../../utils/api";
import { createClient } from '@supabase/supabase-js';
import { updatePassword } from '../../utils/auth';

// Styled components for consistent look and feel
const PageContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 0 0',
  height: '100vh',
  position: 'relative',
  overflow: 'hidden',
  paddingBottom: '112px' // Add space for bottom navigation
}));

// Adding ScrollableContent component for consistent scrolling behavior across the app
const ScrollableContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  height: '100%',
  padding: '16px',
  scrollBehavior: 'smooth', // For smooth scrolling
  '&::-webkit-scrollbar': {
    width: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(138, 78, 252, 0.3)',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'rgba(138, 78, 252, 0.5)',
    }
  }
}));

const StyledPaper = styled(Paper)(({ theme }) => ({
  padding: '20px',
  marginBottom: '20px',
  borderRadius: '12px',
  backgroundColor: '#202B3E',
  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
}));

const ProfileSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: '20px',
}));

const AvatarContainer = styled(Box)(({ theme }) => ({
  position: 'relative',
  marginBottom: '16px',
}));

const StyledAvatar = styled(Avatar)(({ theme }) => ({
  width: 120,
  height: 120,
  margin: '0 auto 16px',
  border: '4px solid #131A26',
  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  cursor: 'pointer',
  '&:hover': {
    opacity: 0.9,
  },
}));

const AvatarEditButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  bottom: 20,
  right: -10,
  backgroundColor: '#8A4EFC',
  color: '#fff',
  '&:hover': {
    backgroundColor: '#7B44E5',
  },
}));

const FormField = styled(TextField)(({ theme }) => ({
  marginBottom: '16px',
  '& .MuiOutlinedInput-root': {
    color: '#EEE',
    '& fieldset': {
      borderColor: 'rgba(97, 117, 155, 0.5)',
    },
    '&:hover fieldset': {
      borderColor: 'rgba(97, 117, 155, 0.8)',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#8A4EFC',
    },
  },
  '& .MuiInputLabel-root': {
    color: '#61759b',
  },
  '& .MuiInputLabel-root.Mui-focused': {
    color: '#8A4EFC',
  },
}));

const GradientButton = styled(Button)(({ theme }) => ({
  background: 'linear-gradient(to right, #D81E58, #8A4EFC)',
  color: 'white',
  padding: '10px 20px',
  borderRadius: '30px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.2)',
  '&:hover': {
    background: 'linear-gradient(to right, #8A4EFC, #D81E58)',
  },
}));

const SettingsSectionTitle = styled(Typography)(({ theme }) => ({
  color: '#fff',
  fontWeight: '600',
  marginBottom: '16px',
  position: 'relative',
  paddingLeft: '12px',
  '&::before': {
    content: '""',
    position: 'absolute',
    left: 0,
    top: '50%',
    transform: 'translateY(-50%)',
    height: '20px',
    width: '4px',
    background: 'linear-gradient(to bottom, #D81E58, #8A4EFC)',
    borderRadius: '4px',
  },
}));

const VisuallyHiddenInput = styled('input')({
  clip: 'rect(0 0 0 0)',
  clipPath: 'inset(50%)',
  height: 1,
  overflow: 'hidden',
  position: 'absolute',
  bottom: 0,
  left: 0,
  whiteSpace: 'nowrap',
  width: 1,
});

// New styled component for the reCAPTCHA dialog
const RecaptchaContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'center',
  margin: '16px 0',
}));

function Settings() {
  const authUser = useAuthUser();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const api = useApi();
  const fileInputRef = useRef(null);
  const initialDataLoaded = useRef(false); // Track if we've already loaded the data

  // State variables
  const [creatorDialogOpen, setCreatorDialogOpen] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [avatar, setAvatar] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [userInfo, setUserInfo] = useState({
    name: '',
    email: '',
    bio: ''
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const [isLoading, setIsLoading] = useState(false);

  // Add new state variables for the password reset dialog
  const [resetDialogOpen, setResetDialogOpen] = useState(false);
  const [recaptchaToken, setRecaptchaToken] = useState("");
  const recaptchaRef = useRef(null);

  const [state, setState] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
    loading: false,
    error: null,
    success: false
  });

  // Define fetchUserData outside useEffect so it can be called manually if needed
  const fetchUserData = async (force = false) => {
    // Don't fetch if we've already loaded the data or are currently loading, unless forced
    if ((initialDataLoaded.current && !force) || isLoading) return;
    
    try {
      setIsLoading(true);
      
      const userData = await api.get(`/users/profile`);
      
      // Update state with fetched data - ensure we handle null/undefined fields
      setUserInfo({
        name: userData.name || '',
        email: userData.email || '',
        bio: userData.bio || '' // Ensure bio is never null/undefined
      });
      
      // If user has an avatar, set the preview
      if (userData.avatarUrl) {
        // Add the base URL if avatarUrl is a relative path
        const avatarFullUrl = userData.avatarUrl.startsWith('http') 
          ? userData.avatarUrl 
          : `${process.env.REACT_APP_API_URL || 'http://localhost:3001'}${userData.avatarUrl}`;
        setAvatarPreview(avatarFullUrl);
      } else {
        setAvatarPreview(null);
      }
      
      // Store original data for comparison when saving
      localStorage.setItem('originalUserData', JSON.stringify({
        name: userData.name || '',
        bio: userData.bio || '',
        avatarUrl: userData.avatarUrl || null
      }));
      
      // Mark that we've loaded the initial data
      initialDataLoaded.current = true;
      
      setIsLoading(false);
    } catch (error) {
      // Handle errors, but don't set initialDataLoaded to true on error
      console.error('Failed to fetch user data:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load user information',
        severity: 'error'
      });
      setIsLoading(false);
    }
  };

  // Fetch user data on component mount only
  useEffect(() => {
    // Only fetch if we have a user ID and haven't already loaded the data
    if (authUser && authUser() && !initialDataLoaded.current) {
      fetchUserData();
    }
    
    // Cleanup function to prevent memory leaks and stale data
    return () => {
      // Reset when component unmounts
      initialDataLoaded.current = false;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  
  // Reset initialDataLoaded when user changes (logout/login)
  useEffect(() => {
    if (authUser && !authUser()) {
      // User logged out
      initialDataLoaded.current = false;
    }
  }, [authUser]);

  // Handle dialog open/close
  const handleCreatorDialogOpen = () => setCreatorDialogOpen(true);
  const handleCreatorDialogClose = () => setCreatorDialogOpen(false);

  const handleSignOut = () => {
    // Clear any stored data
    localStorage.removeItem('originalUserData');
    
    // Use the auth kit's signOut function
    signOut();
    
    // Navigate to login
    navigate('/login');
  };

  // Handle edit mode toggle
  const toggleEditMode = () => {
    if (editMode) {
      // Only save if there are actual changes
      if (hasUserInfoChanged()) {
        saveUserInfo();
      } else {
        // If no changes, just exit edit mode
        setEditMode(false);
      }
    } else {
      // Entering edit mode
      setEditMode(true);
    }
  };

  // Check if user info has changed
  const hasUserInfoChanged = () => {
    // Implement actual logic to check if data changed
    const originalData = JSON.parse(localStorage.getItem('originalUserData') || '{}');
    return (
      originalData.name !== userInfo.name ||
      originalData.bio !== userInfo.bio ||
      avatar !== null // Changed if new avatar is selected
    );
  };

  // Avatar handling
  const handleAvatarClick = () => {
    if (editMode) {
      fileInputRef.current.click();
    }
  };

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setAvatar(file);
      
      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);
      
      event.target.value = null; // Reset input
    }
  };

  // Form handling
  const handleUserInfoChange = (e) => {
    const { name, value } = e.target;
    setUserInfo(prev => ({
      ...prev,
      [name]: value
    }));
  };

  // API calls
  const saveUserInfo = async () => {
    try {
      // Validate inputs before saving
      if (!userInfo.name.trim()) {
        setSnackbar({
          open: true,
          message: 'Name cannot be empty',
          severity: 'error'
        });
        return;
      }
      
      setIsLoading(true);
      
      // Store updated data payload - ensure bio is a string
      const updatedData = {
        name: userInfo.name.trim(),
        bio: (userInfo.bio || '').trim()
      };
      
      // Create form data for both profile and avatar
      const formData = new FormData();
      formData.append('name', updatedData.name);
      formData.append('bio', updatedData.bio);
      
      // If avatar was changed, add it to the form data
      if (avatar) {
        formData.append('avatar', avatar);
      }
      
      // Make a single request to update both profile and avatar
      const updateResult = await api.patch(`/users/profile`, formData);
      
      // Update the preview with the new avatar URL if available
      if (updateResult.avatar_url) {
        setAvatarPreview(updateResult.avatar_url);
      }
      
      // Show success message
      setSnackbar({
        open: true,
        message: 'Profile updated successfully',
        severity: 'success'
      });
      
      // Store the new state as original data after successful save
      const newOriginalData = {
        ...updatedData,
        avatarUrl: updateResult.avatar_url
      };
      localStorage.setItem('originalUserData', JSON.stringify(newOriginalData));
      
      setAvatar(null); // Reset avatar state after successful upload
      setIsLoading(false);
      setEditMode(false);
    } catch (error) {
      console.error('Failed to update profile:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to update profile. Please try again.',
        severity: 'error'
      });
      setIsLoading(false);
    }
  };

  const cancelEdit = () => {
    // Load original data from storage or re-fetch
    const originalData = JSON.parse(localStorage.getItem('originalUserData') || '{}');
    
    // Reset to original values
    setUserInfo(prev => ({
      ...prev,
      name: originalData.name || prev.name,
      bio: originalData.bio || prev.bio
    }));
    
    // Reset avatar preview to original or null
    if (originalData.avatarUrl) {
      setAvatarPreview(originalData.avatarUrl);
    }
    
    setAvatar(null);
    setEditMode(false);
  };

  // Handle dialog open/close
  const handleResetDialogOpen = () => setResetDialogOpen(true);
  const handleResetDialogClose = () => {
    setResetDialogOpen(false);
    setRecaptchaToken("");
    // Reset reCAPTCHA when dialog closes
    if (recaptchaRef.current) {
      recaptchaRef.current.reset();
    }
  };

  // Handle reCAPTCHA change
  const handleRecaptchaChange = (token) => {
    setRecaptchaToken(token || "");
  };

  // Handle reCAPTCHA expiry
  const handleRecaptchaExpired = () => {
    setRecaptchaToken("");
  };

  const handleRequestPasswordReset = async () => {
    try {
      setIsLoading(true);
      
      if (!recaptchaToken) {
        setSnackbar({
          open: true,
          message: 'Please complete the reCAPTCHA verification',
          severity: 'error'
        });
        setIsLoading(false);
        return;
      }

      // Create a Supabase client using environment variables
      const supabase = createClient(
        process.env.REACT_APP_SUPABASE_URL,
        process.env.REACT_APP_SUPABASE_ANON_KEY
      );

      // Request password reset using Supabase
      const { error } = await supabase.auth.resetPasswordForEmail(userInfo.email, {
        redirectTo: `${process.env.REACT_APP_CLIENT_URL}/reset-password`
      });

      if (error) {
        throw new Error(error.message);
      }
      
      // Close dialog after successful request
      handleResetDialogClose();
      
      setSnackbar({
        open: true,
        message: 'Password reset link has been sent to your email',
        severity: 'success'
      });
      
      setIsLoading(false);
    } catch (error) {
      console.error('Failed to request password reset:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to request password reset',
        severity: 'error'
      });
      setIsLoading(false);
    }
  };

  // Get initials for avatar fallback
  const getInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Function to get random color based on name
  const getAvatarColor = (name) => {
    const colors = ['#D81E58', '#8A4EFC', '#00BCD4', '#FF9800', '#4CAF50'];
    const letter = (name || 'A')[0].toUpperCase();
    const index = letter.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Handle snackbar close
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setState(prev => ({ ...prev, loading: true, error: null }));
    
    try {
      const { error } = await updatePassword(state.newPassword);

      if (error) {
        throw new Error(error.message);
      }
      
      setState(prev => ({ ...prev, loading: false, success: true }));
      
      // Clear form after successful update
      setTimeout(() => {
        setState(prev => ({ 
          ...prev, 
          currentPassword: '',
          newPassword: '',
          confirmPassword: '',
          success: false 
        }));
      }, 3000);
    } catch (error) {
      setState(prev => ({ 
        ...prev, 
        loading: false, 
        error: error.message || 'Failed to update password' 
      }));
    }
  };

  const validateForm = () => {
    // Implement form validation logic
    return true; // Placeholder, actual implementation needed
  };

  return (
    <PageContainer maxWidth="sm">
      <ScrollableContent>
        {/* Profile Section */}
        <StyledPaper>
          <SettingsSectionTitle variant="h6">
            Profile
          </SettingsSectionTitle>
          
          <ProfileSection>
            <AvatarContainer>
              <StyledAvatar 
                src={avatarPreview} 
                alt={userInfo.name || 'User'} 
                onClick={handleAvatarClick}
                sx={{ bgcolor: getAvatarColor(userInfo.name) }}
              >
                {!avatarPreview && getInitials(userInfo.name)}
              </StyledAvatar>
              
              {editMode && (
                <AvatarEditButton size="small" onClick={handleAvatarClick}>
                  <PhotoCamera fontSize="small" />
                </AvatarEditButton>
              )}
              
              <VisuallyHiddenInput
                type="file"
                accept="image/*"
                ref={fileInputRef}
                onChange={handleFileChange}
              />
            </AvatarContainer>
            
            {!editMode ? (
              <Box sx={{ textAlign: 'center', mb: 2 }}>
                <Typography variant="h6" sx={{ color: '#EEE', mb: 0.5 }}>
                  {userInfo.name || 'User'}
                </Typography>
                <Typography variant="body2" sx={{ color: '#61759b', mb: 1 }}>
                  {userInfo.email}
                </Typography>
                {userInfo.bio && (
                  <Typography variant="body1" sx={{ color: '#A4B1CD', mt: 2, fontStyle: 'italic' }}>
                    "{userInfo.bio}"
                  </Typography>
                )}
              </Box>
            ) : (
              <Box sx={{ width: '100%', maxWidth: 400 }}>
                <FormField
                  label="Name"
                  name="name"
                  value={userInfo.name}
                  onChange={handleUserInfoChange}
                  fullWidth
                  variant="outlined"
                />
                <FormField
                  label="Bio"
                  name="bio"
                  value={userInfo.bio}
                  onChange={handleUserInfoChange}
                  fullWidth
                  multiline
                  rows={3}
                  variant="outlined"
                />
              </Box>
            )}
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              {editMode ? (
                <>
                  <Button 
                    variant="outlined" 
                    color="error" 
                    startIcon={<Cancel />}
                    onClick={cancelEdit}
                  >
                    Cancel
                  </Button>
                  <GradientButton 
                    startIcon={<Save />}
                    onClick={saveUserInfo}
                    disabled={isLoading}
                  >
                    {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Save Changes'}
                  </GradientButton>
                </>
              ) : (
                <GradientButton 
                  startIcon={<Edit />}
                  onClick={toggleEditMode}
                >
                  Edit Profile
                </GradientButton>
              )}
            </Box>
          </ProfileSection>
        </StyledPaper>
        
        {/* Settings List */}
        <StyledPaper>
          <SettingsSectionTitle variant="h6">
            Account Settings
          </SettingsSectionTitle>
          
          <List sx={{ width: '100%' }}>
            <ListItem button onClick={handleResetDialogOpen}>
              <ListItemIcon>
                <Lock sx={{ color: '#8A4EFC' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Reset Password" 
                secondary="Get a password reset link via email"
                primaryTypographyProps={{ sx: { color: '#EEE' } }}
                secondaryTypographyProps={{ sx: { color: '#61759b' } }}
              />
            </ListItem>
            
            <Divider sx={{ my: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            
            <ListItem button onClick={handleCreatorDialogOpen}>
              <ListItemIcon>
                <Star sx={{ color: '#8A4EFC' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Creator Platform" 
                secondary="Create and share your programs"
                primaryTypographyProps={{ sx: { color: '#EEE' } }}
                secondaryTypographyProps={{ sx: { color: '#61759b' } }}
              />
              <Chip
                size="small"
                icon={<AccessTime />}
                label="Coming Soon"
                sx={{ 
                  bgcolor: 'rgba(138, 78, 252, 0.2)', 
                  color: '#8A4EFC',
                  borderRadius: '12px',
                  '& .MuiChip-icon': { color: '#8A4EFC' }
                }}
              />
            </ListItem>
            
            <Divider sx={{ my: 1, backgroundColor: 'rgba(255, 255, 255, 0.1)' }} />
            
            <ListItem button onClick={handleSignOut}>
              <ListItemIcon>
                <Logout sx={{ color: '#D81E58' }} />
              </ListItemIcon>
              <ListItemText 
                primary="Logout" 
                secondary="Sign out of your account"
                primaryTypographyProps={{ sx: { color: '#EEE' } }}
                secondaryTypographyProps={{ sx: { color: '#61759b' } }}
              />
            </ListItem>
          </List>
        </StyledPaper>
      </ScrollableContent>

      {/* Creator Dialog */}
      <Dialog
        open={creatorDialogOpen}
        onClose={handleCreatorDialogClose}
        PaperProps={{
          sx: { 
            borderRadius: '16px',
            backgroundColor: '#202B3E'
          }
        }}
      >
        <DialogTitle sx={{ color: '#EEE' }}>
          Creator Platform Coming Soon
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#A4B1CD' }}>
            We're working hard to bring you our Creator Platform! Soon, you'll be able to create 
            and share your own programs with others. The platform will let you customize programs, 
            add activities, and track user subscriptions.
            <br /><br />
            Stay tuned for this exciting new feature!
          </DialogContentText>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button 
            onClick={handleCreatorDialogClose} 
            sx={{ color: '#61759b' }}
          >
            Close
          </Button>
        </DialogActions>
      </Dialog>

      {/* Password Reset Dialog */}
      <Dialog 
        open={resetDialogOpen} 
        onClose={handleResetDialogClose}
        PaperProps={{
          sx: { 
            borderRadius: '16px',
            backgroundColor: '#202B3E'
          }
        }}
      >
        <DialogTitle sx={{ color: '#EEE' }}>
          Reset Password
        </DialogTitle>
        <DialogContent>
          <DialogContentText sx={{ color: '#A4B1CD', mb: 2 }}>
            Enter your email address below and we'll send you a link to reset your password.
          </DialogContentText>
          
          <TextField
            autoFocus
            margin="dense"
            label="Email Address"
            type="email"
            fullWidth
            variant="outlined"
            value={userInfo.email}
            disabled={true}
            sx={{
              '.MuiOutlinedInput-root': {
                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                borderRadius: '8px',
              },
              '.MuiOutlinedInput-notchedOutline': {
                borderColor: 'rgba(255, 255, 255, 0.2)',
              },
              '.MuiInputLabel-root': {
                color: 'rgba(255, 255, 255, 0.6)',
              },
              '.MuiInputBase-input': {
                color: '#EEE'
              }
            }}
          />

          {/* reCAPTCHA */}
          <RecaptchaContainer>
            <ReCAPTCHA
              ref={recaptchaRef}
              sitekey={process.env.REACT_APP_RECAPTCHA_SITE_KEY || "YOUR_RECAPTCHA_SITE_KEY"}
              onChange={handleRecaptchaChange}
              onExpired={handleRecaptchaExpired}
              theme="dark"
            />
          </RecaptchaContainer>
        </DialogContent>
        <DialogActions sx={{ padding: '16px' }}>
          <Button 
            onClick={handleResetDialogClose} 
            sx={{ color: '#61759b' }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleRequestPasswordReset}
            disabled={isLoading || !recaptchaToken}
            sx={{
              background: 'linear-gradient(to right, #D81E58, #8A4EFC)',
              color: 'white',
              '&:hover': {
                background: 'linear-gradient(to right, #8A4EFC, #D81E58)',
              },
              '&:disabled': {
                background: 'rgba(255, 255, 255, 0.12)',
                color: 'rgba(255, 255, 255, 0.3)'
              }
            }}
          >
            {isLoading ? <CircularProgress size={24} color="inherit" /> : 'Send Reset Link'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Feedback Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={handleSnackbarClose} 
          severity={snackbar.severity} 
          variant="filled"
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
      
      <RouterBottomNavigation />
    </PageContainer>
  );
}

export default Settings; 
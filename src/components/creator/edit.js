import React, { useState, useEffect } from 'react';
import { useAuthHeader, useAuthUser } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';
import { Container } from '../commons';
import { 
  Typography, 
  TextField, 
  Button, 
  Box,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  IconButton,
  Avatar
} from '@mui/material';
import { ArrowBack, CloudUpload } from '@mui/icons-material';
import { useApi } from '../../utils/api.js';

function CreatorEdit() {
  const authHeader = useAuthHeader();
  const authUser = useAuthUser();
  const navigate = useNavigate();
  const api = useApi();
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    link: ''
  });
  const [profileImage, setProfileImage] = useState(null);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [currentImagePath, setCurrentImagePath] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Load creator profile
    loadCreatorProfile();
  }, []);

  const loadCreatorProfile = async () => {
    setLoading(true);
    setError('');
    
    try {
      const profileData = await api.get('/users/creator/profile');
      
      // Set form data from profile
      setFormData({
        name: profileData.name || '',
        description: profileData.description || '',
        link: profileData.link || ''
      });
      
      // Set current image
      if (profileData.image && profileData.image.path) {
        setCurrentImagePath(profileData.image.path);
        setPreviewUrl(`http://localhost:3001/${profileData.image.path}`);
      }
      
    } catch (error) {
      setError(error.message);
      console.error('Error loading creator profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    
    if (file) {
      setProfileImage(file);
      // Create a preview URL
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess(false);
    
    try {
      // Create form data to send with the image
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('link', formData.link);
      
      if (profileImage) {
        submitData.append('image', profileImage);
      }
      
      await api.upload('/users/creator/profile', submitData);
      setSuccess(true);
      
    } catch (error) {
      setError(error.message);
      console.error('Error updating creator profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Container>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </Container>
    );
  }

  return (
    <Container>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/creator/dashboard')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Edit Creator Profile
        </Typography>
      </Box>
      
      <Paper elevation={3} sx={{ p: 3, maxWidth: 600, mx: 'auto' }}>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            Creator profile updated successfully!
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12} sx={{ textAlign: 'center' }}>
              <Avatar 
                src={previewUrl}
                sx={{ width: 120, height: 120, margin: '0 auto', mb: 2 }}
              />
              
              <Box sx={{ mb: 2 }}>
                <input
                  accept="image/*"
                  style={{ display: 'none' }}
                  id="profile-image-upload"
                  type="file"
                  onChange={handleImageChange}
                />
                <label htmlFor="profile-image-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<CloudUpload />}
                  >
                    Change Profile Image
                  </Button>
                </label>
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                label="Creator Name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                variant="outlined"
                helperText="This will be displayed as your creator name"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                variant="outlined"
                multiline
                rows={4}
                helperText="Tell others about yourself and your programs"
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Website or Social Media Link"
                name="link"
                value={formData.link}
                onChange={handleChange}
                variant="outlined"
                helperText="Optional: Add a link to your website or social media"
              />
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={!formData.name || saving}
                sx={{ mt: 2 }}
              >
                {saving ? <CircularProgress size={24} /> : 'Save Changes'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export { CreatorEdit }; 
import React, { useState } from 'react';
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
  IconButton
} from '@mui/material';
import { ArrowBack, CloudUpload } from '@mui/icons-material';
import { useApi } from '../../utils/api.js';

function CreatorSetup() {
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
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

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
      // Create a preview URL for the selected image
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewUrl(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Create form data to send with the image
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('description', formData.description);
      submitData.append('link', formData.link);
      
      if (profileImage) {
        submitData.append('image', profileImage);
      }
      
      await api.upload('/users/become-creator', submitData);
      setSuccess(true);
      
      // Redirect to creator dashboard after a delay
      setTimeout(() => {
        navigate('/creator/dashboard');
      }, 2000);
      
    } catch (error) {
      setError(error.message);
      console.error('Error creating creator profile:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <IconButton onClick={() => navigate('/settings')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Become a Creator
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
            Creator profile created successfully! Redirecting...
          </Alert>
        )}
        
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={3}>
            <Grid item xs={12}>
              <Typography variant="body1" gutterBottom>
                Fill out the information below to set up your creator profile.
              </Typography>
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
              <Box sx={{ textAlign: 'center', mb: 2 }}>
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
                    Upload Profile Image
                  </Button>
                </label>
              </Box>
              
              {previewUrl && (
                <Box 
                  sx={{ 
                    width: 150, 
                    height: 150, 
                    margin: '0 auto', 
                    borderRadius: '50%',
                    backgroundImage: `url(${previewUrl})`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center',
                    border: '1px solid #ccc'
                  }} 
                />
              )}
            </Grid>
            
            <Grid item xs={12}>
              <Button
                type="submit"
                fullWidth
                variant="contained"
                color="primary"
                size="large"
                disabled={!formData.name || loading}
                sx={{ mt: 2 }}
              >
                {loading ? <CircularProgress size={24} /> : 'Create Creator Profile'}
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
    </Container>
  );
}

export { CreatorSetup }; 
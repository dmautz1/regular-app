import React, { useEffect, useState } from 'react';
import { useAuthHeader, useAuthUser } from 'react-auth-kit';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Box,
  TextField,
  Button,
  Grid,
  Paper,
  Typography,
  Stack,
  FormGroup,
  FormControl,
  FormControlLabel,
  InputLabel,
  Select,
  Switch,
  MenuItem,
  Tooltip,
  Alert,
  Snackbar,
  CircularProgress
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { useDropzone } from 'react-dropzone';
import { useApi } from '../../utils/api.js';

const ProgramEdit = () => {
  const authHeader = useAuthHeader();
  const authUser = useAuthUser();
  const navigate = useNavigate();
  const programId = useLocation().pathname.split("/")[2];
  const [program, setProgram] = useState({
    title: '',
    image: null,
    existingImage: null,
    link: '',
    description: '',
    category: '',
    isPrivate: false
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });
  const api = useApi();

  useEffect(() => {
    if (programId) {
      getProgram();
    } else {
      setIsLoading(false);
    }
  }, [programId]);

  // Generate the correct image URL
  const getProgramImageUrl = (imagePath, filename) => {
    if (!imagePath || !filename) {
      return null;
    }
    
    // Check if the path is already a full URL
    if (imagePath.startsWith('http')) {
      return imagePath;
    }
    
    // Check if the path is the new format
    if (imagePath.includes('/public/assets/programs/')) {
      return `http://localhost:3001${imagePath}`;
    }
    
    // Handle the old format
    return `http://localhost:3001/assets/uploads/${filename}`;
  };

  const getProgram = async () => {
    try {
      setIsLoading(true);
      const data = await api.get(`/programs/${programId}`);
      
      // If user is not the creator, redirect to programs page
      if (data.creator._id !== authUser().id) {
        setSnackbar({
          open: true,
          message: 'You can only edit your own programs',
          severity: 'error'
        });
        
        // Redirect after a short delay
        setTimeout(() => {
          navigate('/programs');
        }, 2000);
        
        return;
      }
      
      setProgram({
        title: data.title,
        existingImage: getProgramImageUrl(data.image.path, data.image.filename),
        description: data.description,
        category: data.category,
        link: data.link,
        isPrivate: data.isPrivate
      });
    } catch (error) {
      console.error('Error fetching program:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Failed to load program details',
        severity: 'error'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProgram({ ...program, [name]: value });
  };

  const handleCategoryChange = (e) => {
    setProgram({ ...program, category: e.target.value });
  };

  const handlePrivateChange = (e) => {
    setProgram({ ...program, isPrivate: e.target.checked });
  };

  const onDrop = (acceptedFiles) => {
    // Set the uploaded image in the program state
    if (acceptedFiles.length > 0) {
      setProgram({ ...program, image: acceptedFiles[0] });
    }
  };

  const { getRootProps, getInputProps } = useDropzone({
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif']
    },
    onDrop,
    maxFiles: 1, // Allow only one file to be uploaded
    maxSize: 5 * 1024 * 1024 // 5MB limit
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const formData = new FormData();
      formData.append('title', program.title);
      formData.append('description', program.description || '');
      formData.append('category', program.category);
      formData.append('link', program.link || '');
      formData.append('isPrivate', program.isPrivate);
      
      if (program.image) {
        formData.append('image', program.image);
      }

      const data = await api.upload(`/programs/${programId}/edit`, formData);
      
      setSnackbar({
        open: true,
        message: 'Program updated successfully',
        severity: 'success'
      });
      
      // Update existingImage if a new image was uploaded
      if (program.image) {
        setProgram({
          ...program,
          image: null,
          existingImage: getProgramImageUrl(data.image.path, data.image.filename)
        });
      }
    } catch (error) {
      console.error('Failed to update program:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Error updating program. Please try again.',
        severity: 'error'
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  const handleSnackbarClose = () => {
    setSnackbar(prev => ({
      ...prev,
      open: false
    }));
  };

  if (isLoading) {
    return (
      <Grid container justifyContent="center" alignItems="center" height="100vh">
        <CircularProgress />
      </Grid>
    );
  }

  return (
    <Grid container justifyContent="center" alignItems="center" height="100vh">
      <Grid item xs={12} sm={8} md={8} lg={8}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
            Edit Program
          </Typography>
          <form onSubmit={handleSubmit}>
            <Stack spacing={2}>
              <TextField
                label="Title"
                name="title"
                variant="outlined"
                fullWidth
                value={program.title}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <Box component="span" sx={{ p: 2, border: '1px dashed grey' }}>
                <div {...getRootProps()} style={{ cursor: isSubmitting ? 'default' : 'pointer' }}>
                    <input {...getInputProps()} disabled={isSubmitting} />
                    {program.image || program.existingImage
                        ? (<img
                            src={program.image ? URL.createObjectURL(program.image) : program.existingImage}
                            alt="Selected"
                            style={{ maxWidth: '100%', maxHeight: '350px' }}
                            />)
                        : (<Typography variant='caption' sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
                            <AddIcon fontSize='large' color='action' />
                            Add Image (Max 5MB)
                            </Typography>)
                    }
                </div>
              </Box>
              <TextField
                label="Description"
                name="description"
                variant="outlined"
                fullWidth
                multiline
                rows={4}
                value={program.description}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
              <FormControl fullWidth>
                <InputLabel id="category-label">Category</InputLabel>
                <Select
                    labelId="category-label"
                    label="Category"
                    name="category"
                    variant="outlined"
                    fullWidth
                    value={program.category}
                    onChange={handleCategoryChange}
                    required
                    disabled={isSubmitting}
                >
                    <MenuItem value="cooking">Cooking</MenuItem>
                    <MenuItem value="fitness">Fitness</MenuItem>
                    <MenuItem value="mindfulness">Mindfulness</MenuItem>
                    <MenuItem value="productivity">Productivity</MenuItem>
                    <MenuItem value="self-improvement">Self-Improvement</MenuItem>
                </Select>
              </FormControl>
              <TextField
                label="External URL"
                name="link"
                variant="outlined"
                fullWidth
                value={program.link}
                onChange={handleChange}
                disabled={isSubmitting}
              />
              <FormGroup>
                <FormControlLabel
                  control={
                    <Switch 
                      checked={program.isPrivate} 
                      onChange={handlePrivateChange} 
                      name="isPrivate"
                      disabled={isSubmitting} 
                    />
                  }
                  label={
                    <Tooltip title="Private programs don't show up in search or browse for other users." placement='top'>
                      <span>Private</span>
                    </Tooltip>
                  }
                  labelPlacement='start'
                />
              </FormGroup>
              
              <Button 
                type="submit" 
                variant="contained" 
                fullWidth
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <CircularProgress size={24} color="inherit" />
                ) : (
                  "Save Changes"
                )}
              </Button>
            </Stack>
          </form>
        </Paper>
      </Grid>
      
      {/* Snackbar for feedback */}
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
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Grid>
  );
};

export { ProgramEdit };
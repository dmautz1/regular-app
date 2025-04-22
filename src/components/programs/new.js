import React, { useState } from 'react';
import { useAuthHeader, useAuthUser } from 'react-auth-kit';
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

const ProgramNew = (programId) => {
  const authHeader = useAuthHeader();
  const authUser = useAuthUser();
  const api = useApi();
  const [program, setProgram] = useState({
    title: '',
    image: null,
    link: '',
    description: '',
    category: '',
    isPrivate: false
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'info'
  });

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
    
    // Validate inputs
    if (!program.title.trim()) {
      setSnackbar({
        open: true,
        message: 'Title is required',
        severity: 'error'
      });
      return;
    }
    
    if (!program.category) {
      setSnackbar({
        open: true,
        message: 'Category is required',
        severity: 'error'
      });
      return;
    }
    
    if (!program.image && !program.existingImage) {
      setSnackbar({
        open: true,
        message: 'Program image is required',
        severity: 'error'
      });
      return;
    }
    
    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append('title', program.title);
    formData.append('description', program.description || '');
    formData.append('category', program.category);
    formData.append('link', program.link || '');
    formData.append('isPrivate', program.isPrivate);
    
    // Only append image if a new one was uploaded
    if (program.image) {
      formData.append('image', program.image);
    }
    
    // Add programId if editing
    if (programId) {
      formData.append('programId', programId);
    }

    try {
      const postTo = programId 
        ? `/programs/${programId}/edit`
        : "/programs/new";

      const data = await api.upload(postTo, formData);
      
      setSnackbar({
        open: true,
        message: programId ? 'Program updated successfully' : 'Program created successfully',
        severity: 'success'
      });
      
      // Reset form if creating new program
      if (!programId) {
        setProgram({
          title: '',
          image: null,
          link: '',
          description: '',
          category: '',
          isPrivate: false
        });
      }
    } catch (error) {
      console.error('Failed to save program:', error);
      setSnackbar({
        open: true,
        message: error.message || 'Error saving program. Please try again.',
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

  return (
    <Grid container justifyContent="center" alignItems="center" height="100vh">
      <Grid item xs={12} sm={8} md={8} lg={8}>
        <Paper elevation={3} sx={{ p: 3 }}>
          <Typography variant="h4" align="center" gutterBottom>
            {programId ? "Edit Program" : "Add a New Program"}
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
                  programId ? "Save Program" : "Add Program"
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

export { ProgramNew };
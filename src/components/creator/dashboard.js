import React, { useState, useEffect } from 'react';
import { useAuthHeader, useAuthUser } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';
import { Container } from '../commons';
import { RouterBottomNavigation } from '../navigation/nav';
import { 
  Typography, 
  Button, 
  Box,
  Paper,
  Tabs,
  Tab,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActions,
  IconButton,
  Fab,
  CircularProgress,
  Divider,
  Avatar,
  Alert
} from '@mui/material';
import { 
  Add, 
  Edit, 
  Delete, 
  ArrowBack,
  BarChart,
  People
} from '@mui/icons-material';
import { useApi } from '../../utils/api';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`creator-tabpanel-${index}`}
      aria-labelledby={`creator-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ p: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

function CreatorDashboard() {
  const authUser = useAuthUser();
  const navigate = useNavigate();
  const api = useApi(); // Using the new API client
  
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [creatorProfile, setCreatorProfile] = useState(null);
  const [creatorPrograms, setCreatorPrograms] = useState([]);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    // Load creator profile and programs
    loadCreatorData();
  }, []);

  const loadCreatorData = async () => {
    setLoading(true);
    setError('');
    
    try {
      // Fetch creator profile using the API client
      const profileData = await api.get('/users/creator/profile');
      setCreatorProfile(profileData);
      
      // Fetch creator's programs using the API client
      const programsData = await api.get('/programs/creator');
      setCreatorPrograms(programsData);
      
    } catch (error) {
      setError(error.message);
      console.error('Error loading creator data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleCreateProgram = () => {
    navigate('/programs/new');
  };

  const handleEditProgram = (programId) => {
    navigate(`/programs/${programId}/edit`);
  };

  const handleDeleteProgram = async (programId) => {
    if (window.confirm('Are you sure you want to delete this program?')) {
      try {
        // Delete program using the API client
        await api.delete(`/programs/${programId}`);
        
        // Remove the deleted program from the list
        setCreatorPrograms(creatorPrograms.filter(program => program.id !== programId));
        
      } catch (error) {
        setError(error.message);
        console.error('Error deleting program:', error);
      }
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
        <IconButton onClick={() => navigate('/settings')} sx={{ mr: 1 }}>
          <ArrowBack />
        </IconButton>
        <Typography variant="h4" component="h1">
          Creator Dashboard
        </Typography>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error}
        </Alert>
      )}
      
      {creatorProfile && (
        <Paper elevation={3} sx={{ p: 3, mb: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
            <Avatar 
              src={`http://localhost:3001/${creatorProfile.image.path}`}
              sx={{ width: 70, height: 70, mr: 2 }}
            />
            <Box>
              <Typography variant="h5" component="h2">
                {creatorProfile.name}
              </Typography>
              {creatorProfile.description && (
                <Typography variant="body2" color="text.secondary">
                  {creatorProfile.description}
                </Typography>
              )}
            </Box>
            <Box sx={{ ml: 'auto' }}>
              <Button 
                variant="outlined" 
                size="small"
                startIcon={<Edit />}
                onClick={() => navigate('/creator/edit')}
              >
                Edit Profile
              </Button>
            </Box>
          </Box>
        </Paper>
      )}
      
      <Paper elevation={3} sx={{ mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="My Programs" />
          <Tab label="Analytics" />
        </Tabs>
        
        <TabPanel value={tabValue} index={0}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
            <Typography variant="h6" component="h3">
              Your Programs
            </Typography>
            <Button 
              variant="contained" 
              color="primary"
              startIcon={<Add />}
              onClick={handleCreateProgram}
            >
              Create Program
            </Button>
          </Box>
          
          {creatorPrograms.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                You haven't created any programs yet.
              </Typography>
              <Button 
                variant="contained" 
                color="primary"
                startIcon={<Add />}
                onClick={handleCreateProgram}
                sx={{ mt: 2 }}
              >
                Create Your First Program
              </Button>
            </Box>
          ) : (
            <Grid container spacing={3}>
              {creatorPrograms.map(program => (
                <Grid item xs={12} sm={6} md={4} key={program.id}>
                  <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                    <CardMedia
                      component="img"
                      height="140"
                      image={`http://localhost:3001/${program.image.path}`}
                      alt={program.title}
                    />
                    <CardContent sx={{ flexGrow: 1 }}>
                      <Typography variant="h6" component="h3" gutterBottom>
                        {program.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {program.description || 'No description available'}
                      </Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <People fontSize="small" sx={{ mr: 0.5 }} />
                        <Typography variant="body2" color="text.secondary">
                          {program.subscribers || 0} subscribers
                        </Typography>
                      </Box>
                    </CardContent>
                    <CardActions>
                      <Button 
                        size="small" 
                        onClick={() => handleEditProgram(program.id)}
                      >
                        Edit
                      </Button>
                      <IconButton 
                        size="small" 
                        color="error"
                        onClick={() => handleDeleteProgram(program.id)}
                        sx={{ ml: 'auto' }}
                      >
                        <Delete fontSize="small" />
                      </IconButton>
                    </CardActions>
                  </Card>
                </Grid>
              ))}
            </Grid>
          )}
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', flexDirection: 'column', py: 4 }}>
            <BarChart sx={{ fontSize: 60, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6" color="text.secondary" gutterBottom>
              Analytics Coming Soon
            </Typography>
            <Typography variant="body2" color="text.secondary" align="center">
              In the future, you'll be able to see statistics about your programs,
              subscribers, and more.
            </Typography>
          </Box>
        </TabPanel>
      </Paper>

      <RouterBottomNavigation />
      
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 100, right: 20 }}
        onClick={handleCreateProgram}
      >
        <Add />
      </Fab>
    </Container>
  );
}

export { CreatorDashboard }; 
import React, { useState, useEffect, useCallback, useRef } from "react";
import { useAuthUser } from "react-auth-kit";
import { useNavigate } from "react-router-dom";
import { RouterBottomNavigation } from "../navigation/nav";
import { useApi } from "../../utils/api";
import { 
  Container,
  Typography, 
  Box, 
  Paper, 
  Grid,
  LinearProgress,
  Button
} from '@mui/material';
import { styled } from '@mui/system';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import EventNoteIcon from '@mui/icons-material/EventNote';
import WhatshotIcon from '@mui/icons-material/Whatshot';
import ProgramsCards from "../programs/cards";

// Styled components
const PageContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 0 0',
  height: '100vh',
  position: 'relative',
  alignItems: 'stretch',
  overflow: 'hidden', // Prevent outer container from scrolling
  paddingBottom: '112px' // Space for bottom navigation
}));

const ScrollableContent = styled(Box)(({ theme }) => ({
  flex: 1,
  overflowY: 'auto', // Enable scrolling for content
  overflowX: 'hidden',
  padding: '20px 0 32px', // Increased bottom padding
  display: 'flex',
  flexDirection: 'column',
  WebkitOverflowScrolling: 'touch', // Smooth scrolling on iOS
  '&::-webkit-scrollbar': {
    width: '8px'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(138, 78, 252, 0.2)',
    borderRadius: '4px'
  },
  '& > *': {
    marginBottom: '16px', // Add space between all direct children
    width: '100%' // Ensure all children take full width
  }
}));

const SectionCard = styled(Paper)(({ theme }) => ({
  padding: '20px',
  marginBottom: '24px',
  borderRadius: '12px',
  backgroundColor: '#202B3E',
  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
  transition: 'all 0.3s ease',
  overflow: 'hidden',
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.2)'
  }
}));

const SectionHeader = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  marginBottom: '16px',
}));

const ProgressSection = styled(Box)(({ theme }) => ({
  marginTop: '12px',
  marginBottom: '12px',
}));

const StyledLinearProgress = styled(LinearProgress)(({ theme }) => ({
  height: '10px',
  borderRadius: '5px',
  backgroundColor: 'rgba(97, 117, 155, 0.2)',
  '& .MuiLinearProgress-bar': {
    backgroundImage: 'linear-gradient(to right, #D81E58, #8A4EFC)',
  }
}));

const StatsCard = styled(Paper)(({ theme }) => ({
  padding: '16px',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  borderRadius: '12px',
  backgroundColor: 'rgba(32, 43, 62, 0.8)',
  transition: 'all 0.3s ease',
  '&:hover': {
    backgroundColor: 'rgba(32, 43, 62, 1)',
    transform: 'translateY(-2px)',
  }
}));

const QuickAddButton = styled(Button)(({ theme }) => ({
  textTransform: 'none',
  backgroundImage: 'linear-gradient(to right, #D81E58, #8A4EFC)',
  borderRadius: '30px',
  padding: '10px 20px',
  color: 'white',
  fontWeight: 'bold',
  marginTop: '10px',
  '&:hover': {
    backgroundImage: 'linear-gradient(to right, #8A4EFC, #D81E58)',
  }
}));

function Dashboard() {
  const navigate = useNavigate();
  const authUser = useAuthUser();
  const apiInstance = useApi();
  // Create a stable reference to the API
  const apiRef = useRef(apiInstance);
  
  const [todayTasks, setTodayTasks] = useState([]);
  const [stats, setStats] = useState({
    weeklyCompleted: 0,
    programCount: 0,
    completionRate: 0,
    streak: 0
  });
  const [newPrograms, setNewPrograms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // State for dialog handling
  const [selectedProgram, setSelectedProgram] = useState(null);
  
  // Use a stable callback for data fetching
  const fetchData = useCallback(async () => {
    let isMounted = true;
    
    try {
      setLoading(true);
      setError(null);
      
      // Ensure we have a valid API instance
      if (!apiRef.current) {
        console.error("API instance not available");
        throw new Error("API instance not available");
      }
      
      const api = apiRef.current;
      
      // Get today's date in the format used by the API
      const today = new Date();
      const formattedToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;
      
      // Fetch today's tasks using the secure endpoint
      const tasksData = await api.get(`/tasks?day=${formattedToday}`);
      if (!isMounted) return;
      setTodayTasks(Array.isArray(tasksData) ? tasksData : []);
      
      // Fetch user stats with today's date
      const statsData = await api.get(`/users/stats?today=${formattedToday}`);
      if (!isMounted) return;
      
      setStats({
        weeklyCompleted: statsData.weeklyCompleted || 0,
        programCount: statsData.programCount || 0,
        completionRate: statsData.completionRate || 0,
        streak: statsData.streak || 0
      });
      
      // Fetch latest programs
      try {
        const programsData = await api.get('/programs/feed');
        if (!isMounted) return;
        
        // Make sure we're handling the response properly
        if (Array.isArray(programsData) && programsData.length > 0) {
          setNewPrograms(programsData.slice(0, 3)); // Take just the first 3
        } else {
          setNewPrograms([]);
        }
      } catch (programError) {
        console.error("Error fetching programs:", programError);
        if (!isMounted) return;
        setNewPrograms([]);
      }
      
      if (!isMounted) return;
      setLoading(false);
    } catch (error) {
      console.error("Error fetching home data:", error);
      if (!isMounted) return;
      
      setError("Failed to load data. Please try again later.");
      setLoading(false);
    }
    
    return () => {
      isMounted = false;
    };
  }, []);
  
  // Trigger data fetch on mount
  useEffect(() => {
    fetchData();
  }, [fetchData]);
  
  const getMotivationalMessage = (completionRate) => {
    if (todayTasks.length === 0) return "No tasks for today. Add some tasks to get started!";
    if (completionRate === 100) return "All tasks completed! Amazing job!";
    if (completionRate >= 75) return "Almost there! Keep going!";
    if (completionRate >= 50) return "Halfway there! You're doing great!";
    if (completionRate >= 25) return "Good start! Keep the momentum going!";
    return "Let's start checking off some tasks!";
  };
  
  const navigateToTasks = () => {
    navigate("/tasks");
  };

  const navigateToPrograms = () => {
    navigate("/programs");
  };

  const completedTasksCount = todayTasks.filter(task => task.is_completed).length;
  const taskCompletionRate = todayTasks.length > 0 
    ? Math.round((completedTasksCount / todayTasks.length) * 100) 
    : 0;

  // Handle program selection
  const handleSelectProgram = async (programId) => {
    if (!programId) return;
    
    try {
      const api = apiRef.current;
      const programDetails = await api.get(`/programs/${programId}`);
      if (programDetails && programDetails.program) {
        setSelectedProgram(programDetails.program);
      }
    } catch (error) {
      console.error("Error fetching program details:", error);
    }
  };
  
  // Handle program subscription 
  const subscribeProgram = async (programId) => {
    if (!programId) return;
    
    try {
      const api = apiRef.current;
      await api.post(`/programs/subscribe/${programId}`);
      
      // Refresh programs after subscribing
      const programsData = await api.get('/programs');
      if (Array.isArray(programsData) && programsData.length > 0) {
        setNewPrograms(programsData.slice(0, 3));
      }
      
      // Update user programs count for stats
      const userPrograms = await api.get(`/programs/user`);
      if (Array.isArray(userPrograms)) {
        setStats(prev => ({
          ...prev,
          programCount: userPrograms.length
        }));
      }
    } catch (error) {
      console.error("Error subscribing to program:", error);
    }
  };
  
  // Handle program unsubscription
  const unsubscribeProgram = async (programId) => {
    if (!programId) return;
    
    try {
      const api = apiRef.current;
      await api.post(`/programs/${programId}/unsubscribe`);
      
      // Refresh programs after unsubscribing
      const programsData = await api.get('/programs');
      if (Array.isArray(programsData) && programsData.length > 0) {
        setNewPrograms(programsData.slice(0, 3));
      }
      
      // Update user programs count for stats
      const userPrograms = await api.get(`/programs/user`);
      if (Array.isArray(userPrograms)) {
        setStats(prev => ({
          ...prev,
          programCount: userPrograms.length
        }));
      }
    } catch (error) {
      console.error("Error unsubscribing from program:", error);
    }
  };

  return (
    <PageContainer maxWidth="lg">
      <ScrollableContent>        
        {/* Error message if any */}
        {error && (
          <Box sx={{ mx: 2, mb: 3, p: 2, bgcolor: 'rgba(255, 0, 0, 0.1)', borderRadius: 2 }}>
            <Typography color="error">{error}</Typography>
          </Box>
        )}
        
        {/* Daily Progress Summary */}
        <Box sx={{ px: 2 }}>
          <SectionCard>
            <SectionHeader>
              <CheckCircleIcon sx={{ color: '#8A4EFC', mr: 1.5, fontSize: '1.5rem' }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Today's Progress
              </Typography>
            </SectionHeader>
            
            <ProgressSection>
              {loading ? (
                <Box sx={{ py: 2 }}>
                  <LinearProgress />
                  <Typography variant="body2" sx={{ color: '#A4B1CD', mt: 2, textAlign: 'center' }}>
                    Loading today's tasks...
                  </Typography>
                </Box>
              ) : todayTasks.length === 0 ? (
                <Box sx={{ 
                  py: 3, 
                  display: 'flex', 
                  flexDirection: 'column', 
                  alignItems: 'center',
                  backgroundColor: 'rgba(32, 43, 62, 0.5)',
                  borderRadius: '12px'
                }}>
                  <Typography variant="body1" sx={{ color: '#A4B1CD', textAlign: 'center', mb: 2 }}>
                    No tasks scheduled for today.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" sx={{ color: '#A4B1CD' }}>
                      {completedTasksCount} of {todayTasks.length} tasks completed
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#D81E58', fontWeight: 600 }}>
                      {taskCompletionRate}%
                    </Typography>
                  </Box>
                  
                  <StyledLinearProgress variant="determinate" value={taskCompletionRate} />
                  
                  <Typography variant="body1" sx={{ color: 'white', mt: 2, fontWeight: 500 }}>
                    {getMotivationalMessage(taskCompletionRate)}
                  </Typography>
                </>
              )}
              
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                <QuickAddButton onClick={navigateToTasks}>
                  {todayTasks.length === 0 ? 'Add Tasks' : 'View All Tasks'}
                </QuickAddButton>
              </Box>
            </ProgressSection>
          </SectionCard>
        </Box>
        
        {/* Quick Stats */}
        <Box sx={{ px: 2 }}>
          <SectionHeader sx={{ mb: 2 }}>
            <TrendingUpIcon sx={{ color: '#8A4EFC', mr: 1.5, fontSize: '1.5rem' }} />
            <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
              Quick Stats
            </Typography>
          </SectionHeader>
          
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <StatsCard>
                {loading ? (
                  <Box sx={{ py: 2 }}>
                    <LinearProgress />
                  </Box>
                ) : (
                  <>
                    <Typography variant="h4" sx={{ color: '#D81E58', fontWeight: 700 }}>
                      {stats.weeklyCompleted}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#A4B1CD', textAlign: 'center' }}>
                      Tasks Completed This Week
                    </Typography>
                  </>
                )}
              </StatsCard>
            </Grid>
            
            <Grid item xs={6}>
              <StatsCard>
                {loading ? (
                  <Box sx={{ py: 2 }}>
                    <LinearProgress />
                  </Box>
                ) : (
                  <>
                    <Typography variant="h4" sx={{ color: '#8A4EFC', fontWeight: 700 }}>
                      {stats.programCount}
                    </Typography>
                    <Typography variant="body2" sx={{ color: '#A4B1CD', textAlign: 'center' }}>
                      Programs Subscribed
                    </Typography>
                  </>
                )}
              </StatsCard>
            </Grid>
            
            <Grid item xs={6}>
              <StatsCard>
                {loading ? (
                  <Box sx={{ py: 2 }}>
                    <LinearProgress />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#00BCD4', fontWeight: 700 }}>
                        {stats.completionRate}%
                      </Typography>
                    </Box>
                    <Typography variant="body2" sx={{ color: '#A4B1CD', textAlign: 'center' }}>
                      Weekly Completion Rate
                    </Typography>
                  </>
                )}
              </StatsCard>
            </Grid>
            
            <Grid item xs={6}>
              <StatsCard>
                {loading ? (
                  <Box sx={{ py: 2 }}>
                    <LinearProgress />
                  </Box>
                ) : (
                  <>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="h4" sx={{ color: '#FF9800', fontWeight: 700 }}>
                        {stats.streak}
                      </Typography>
                      <WhatshotIcon sx={{ color: '#FF9800', ml: 0.5 }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: '#A4B1CD', textAlign: 'center' }}>
                      Day Streak
                    </Typography>
                  </>
                )}
              </StatsCard>
            </Grid>
          </Grid>
        </Box>
        
        {/* Recently Added Programs */}
        <Box sx={{ px: 2 }}>
          <SectionHeader sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <EventNoteIcon sx={{ color: '#8A4EFC', mr: 1.5, fontSize: '1.5rem' }} />
              <Typography variant="h6" sx={{ color: 'white', fontWeight: 600 }}>
                Newest Programs
              </Typography>
            </Box>
            <Button 
              sx={{ 
                color: '#8A4EFC', 
                textTransform: 'none',
                '&:hover': { backgroundColor: 'rgba(138, 78, 252, 0.08)' }
              }}
              onClick={navigateToPrograms}
            >
              View All
            </Button>
          </SectionHeader>
          
          {loading ? (
            <Box sx={{ py: 4, display: 'flex', justifyContent: 'center' }}>
              <LinearProgress sx={{ width: '80%' }} />
            </Box>
          ) : newPrograms.length > 0 ? (
            <Box sx={{ mt: 2 }}>
              <ProgramsCards 
                programs={newPrograms}
                selectedProgram={selectedProgram}
                handleSelectProgram={handleSelectProgram}
                subscribeProgram={subscribeProgram}
                unsubscribeProgram={unsubscribeProgram}
              />
            </Box>
          ) : (
            <Box sx={{ 
              py: 4, 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center',
              backgroundColor: 'rgba(32, 43, 62, 0.5)',
              borderRadius: '12px'
            }}>
              <Typography variant="body1" sx={{ color: '#A4B1CD', textAlign: 'center', mb: 2 }}>
                No programs available yet.
              </Typography>
              <Button 
                sx={{ 
                  color: '#8A4EFC', 
                  textTransform: 'none',
                  '&:hover': { backgroundColor: 'rgba(138, 78, 252, 0.08)' }
                }}
                onClick={navigateToPrograms}
              >
                Browse Programs
              </Button>
            </Box>
          )}
        </Box>
        
        {/* Add bottom padding to ensure all content is visible above the nav */}
        <Box sx={{ height: '40px' }} />
      </ScrollableContent>
      
      <RouterBottomNavigation />
    </PageContainer>
  );
}

export default Dashboard;
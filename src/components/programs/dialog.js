import * as React from 'react';
import { useState, useEffect } from "react";
import { Grid } from '@mui/material';
import { useAuthHeader, useAuthUser } from 'react-auth-kit'
import { useApi } from '../../utils/api';
import { 
  Typography, 
  Box, 
  Tabs, 
  Tab,
  Button, 
  IconButton,
  Dialog, 
  DialogContent, 
  DialogActions,
  Avatar,
  Chip,
  Fade,
  Paper,
  Stack,
  Skeleton
} from '@mui/material';
import { styled } from '@mui/system';
import LinkIcon from '@mui/icons-material/Link';
import CloseIcon from '@mui/icons-material/Close';
import OpenInNewIcon from '@mui/icons-material/OpenInNew';
import InfoIcon from '@mui/icons-material/Info';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import DoneAllIcon from '@mui/icons-material/DoneAll';
import RemoveDoneIcon from '@mui/icons-material/RemoveDone';
import CategoryIcon from '@mui/icons-material/Category';
import ScheduleIcon from '@mui/icons-material/Schedule';
import PeopleIcon from '@mui/icons-material/People';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
import cronParser from 'cron-parser';
import ActivityForm from './ActivityForm';

// Styled components for consistent design
const StyledDialog = styled(Dialog)(({ theme }) => ({
  '& .MuiDialog-paper': {
    borderRadius: '16px',
    backgroundColor: '#131A26',
    backgroundImage: 'linear-gradient(rgba(32, 43, 62, 0.8) 0%, rgba(19, 26, 38, 1) 100%)',
    maxWidth: '800px',
    overflowX: 'hidden',
    display: 'flex',
    flexDirection: 'column',
    height: '85vh', // Set consistent height
    maxHeight: '900px'
  }
}));

const DialogHeader = styled(Box)(({ theme }) => ({
  position: 'relative',
  height: '240px',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-end',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  '&::after': {
    content: '""',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    background: 'linear-gradient(transparent 30%, rgba(19, 26, 38, 0.8) 80%, #131A26 100%)',
    zIndex: 1
  }
}));

const HeaderContent = styled(Box)(({ theme }) => ({
  padding: '24px',
  position: 'relative',
  zIndex: 2,
  display: 'flex',
  flexDirection: 'column',
  gap: '8px'
}));

const CloseButton = styled(IconButton)(({ theme }) => ({
  position: 'absolute',
  top: 16,
  right: 16,
  color: 'white',
  backgroundColor: 'rgba(19, 26, 38, 0.6)',
  zIndex: 10,
  '&:hover': {
    backgroundColor: 'rgba(19, 26, 38, 0.8)'
  }
}));

const CategoryChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(138, 78, 252, 0.2)',
  color: '#8A4EFC',
  fontWeight: '500',
  height: '28px',
  borderRadius: '14px',
  '& .MuiChip-icon': {
    color: '#8A4EFC',
  }
}));

const AvatarStyled = styled(Avatar)(({ theme, src, bgcolor }) => ({
  backgroundColor: bgcolor,
  width: 40,
  height: 40,
  marginRight: 12,
  backgroundImage: src ? `url(${src})` : 'none',
  backgroundSize: 'cover',
  backgroundPosition: 'center'
}));

const TabContainer = styled(Box)(({ theme }) => ({
  background: '#202B3E',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
}));

const StyledTabs = styled(Tabs)(({ theme }) => ({
  '& .MuiTabs-indicator': {
    backgroundColor: '#D81E58'
  },
  '& .MuiTab-root': {
    color: '#61759b',
    fontWeight: '500',
    fontSize: '0.95rem',
    '&.Mui-selected': {
      color: '#fff'
    }
  }
}));

const StyledDialogContent = styled(DialogContent)(({ theme }) => ({
  padding: 0,
  backgroundColor: '#131A26',
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  position: 'relative',
  minHeight: '300px',
}));

const TabPanel = styled(Box)(({ theme, $isLoading }) => ({
  padding: 24,
  height: '100%',
  width: '100%',
  display: 'flex',
  flexDirection: 'column',
  overflowY: $isLoading ? 'hidden' : 'auto', // Only enable scroll after content is loaded
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

const PlaceholderContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  minHeight: '300px',
  width: '100%',
  flex: 1
}));

const ActionButton = styled(Button)(({ theme, variant }) => ({
  borderRadius: '30px',
  padding: '10px 24px',
  fontWeight: 'bold',
  textTransform: 'none',
  ...(variant === 'contained' && {
    background: 'linear-gradient(90deg, #D81E58, #8A4EFC)',
    color: 'white',
    '&:hover': {
      background: 'linear-gradient(90deg, #8A4EFC, #D81E58)'
    }
  }),
  ...(variant === 'outlined' && {
    borderColor: '#D81E58',
    color: '#D81E58',
    '&:hover': {
      borderColor: '#8A4EFC',
      color: '#8A4EFC',
      backgroundColor: 'rgba(138, 78, 252, 0.04)'
    }
  })
}));

const ScheduleContainer = styled(Paper)(({ theme }) => ({
  backgroundColor: '#202B3E',
  borderRadius: '12px',
  marginBottom: '8px',
  overflow: 'visible' // Ensure content overflow is visible
}));

const ScheduleRow = styled(Box)(({ theme, isActive }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: '0',
  backgroundColor: isActive ? 'rgba(138, 78, 252, 0.08)' : 'transparent',
  borderLeft: isActive ? '3px solid #8A4EFC' : '3px solid transparent',
  transition: 'all 0.2s ease',
}));

const TimeSlot = styled(Box)(({ theme }) => ({
  width: '90px',
  minWidth: '90px',
  padding: '16px 20px',
  backgroundColor: 'rgba(19, 26, 38, 0.3)',
  borderRadius: '6px',
  marginRight: '16px',
  textAlign: 'center',
}));

const WeekdayGridContainer = styled(Box)(({ theme }) => ({
  display: 'grid',
  gridTemplateColumns: 'repeat(7, 1fr)',
  gap: 0,
  borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
}));

const WeekdayGridItem = styled(Box)(({ theme, isActive }) => ({
  cursor: 'pointer',
  padding: '10px 2px',
  textAlign: 'center',
  backgroundColor: isActive ? 'rgba(138, 78, 252, 0.15)' : 'transparent',
  color: isActive ? '#fff' : '#A4B1CD',
  borderBottom: isActive ? '2px solid #8A4EFC' : '2px solid transparent',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: isActive ? 'rgba(138, 78, 252, 0.2)' : 'rgba(32, 43, 62, 0.5)',
  }
}));

const EmptyDay = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  padding: '40px 20px',
  color: '#61759b',
  textAlign: 'center',
  borderRadius: '0 0 12px 12px',
}));

const StyledDialogActions = styled(DialogActions)(({ theme }) => ({
  backgroundColor: 'rgba(19, 26, 38, 0.8)',
  borderTop: '1px solid rgba(255, 255, 255, 0.1)',
  padding: '16px 24px',
  justifyContent: 'center'
}));

// Add a new styled component for the subscribers chip
const SubscribersChip = styled(Chip)(({ theme }) => ({
  backgroundColor: 'rgba(216, 30, 88, 0.15)',
  color: '#D81E58',
  fontWeight: '500',
  height: '28px',
  borderRadius: '14px',
  '& .MuiChip-icon': {
    color: '#D81E58',
  },
  marginRight: '8px'
}));

export default function ProgramDialog({ selectedProgram, isDialogOpened, handleCloseDialog, handleSubscribe, handleUnsubscribe }) {
  const [tabValue, setTabValue] = useState(0);
  const [activeDay, setActiveDay] = useState(new Date().getDay());
  const [isTabLoading, setIsTabLoading] = useState(false);
  const [tabTransitioning, setTabTransitioning] = useState(false);
  const [isActivityFormOpen, setIsActivityFormOpen] = useState(false);
  const [selectedActivity, setSelectedActivity] = useState(null);
  const [activities, setActivities] = useState([]);
  const authHeader = useAuthHeader();
  const api = useApi();
  
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const shortWeekdays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  useEffect(() => {
    if (selectedProgram?.activities) {
      setActivities(selectedProgram.activities);
    }
  }, [selectedProgram]);

  useEffect(() => {
    // Reset to current day's tab when dialog opens
    if (isDialogOpened) {
      setActiveDay(new Date().getDay());
      setTabValue(0);
    }
  }, [isDialogOpened]);

  // Effect to handle tab transitions
  useEffect(() => {
    if (isDialogOpened) {
      setTabTransitioning(true);
      setIsTabLoading(true);
      
      // Short delay for transition to start
      const transitionTimer = setTimeout(() => {
        // Longer delay for content to load
        const loadingTimer = setTimeout(() => {
          setIsTabLoading(false);
          
          // Final delay to ensure transitions are complete before enabling scroll
          setTimeout(() => {
            setTabTransitioning(false);
          }, 100);
        }, 300);
        
        return () => clearTimeout(loadingTimer);
      }, 50);
      
      return () => clearTimeout(transitionTimer);
    }
  }, [tabValue, isDialogOpened]);

  // Effect to reset scrolling when changing days in the schedule
  useEffect(() => {
    if (tabValue === 1 && !isTabLoading && !tabTransitioning) {
      // Reset scroll position when day changes
      const schedulePanel = document.getElementById('schedule-tab-panel');
      if (schedulePanel) {
        schedulePanel.scrollTop = 0;
      }
    }
  }, [activeDay, isTabLoading, tabTransitioning, tabValue]);

  const handleClose = () => {
    handleCloseDialog(false);
  };

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const getActivities = (day) => {
    if (!selectedProgram || !selectedProgram.activities || !Array.isArray(selectedProgram.activities)) {
      console.log('No activities found for program:', selectedProgram);
      return [];
    }
    
    const activities = [];
    selectedProgram.activities.forEach((activity) => {
      if (!activity.cron) return;
      
      try {
        const interval = cronParser.parseExpression(activity.cron);
        // Convert day to cron day format (0-6 to 0-6, where 0 is Sunday)
        const cronDay = day;
        if (interval.fields.dayOfWeek.includes(cronDay)) {
          activities.push(activity);
        }
      } catch (error) {
        console.error('Error parsing cron expression:', error);
      }
    });
    
    // Sort activities by time
    return activities.sort((a, b) => {
      const [minuteA, hourA] = a.cron.split(' ').slice(0, 2).map(Number);
      const [minuteB, hourB] = b.cron.split(' ').slice(0, 2).map(Number);
      
      // Compare hours first
      if (hourA !== hourB) {
        return hourA - hourB;
      }
      // If hours are the same, compare minutes
      return minuteA - minuteB;
    });
  };

  const formatTimeFromCron = (cron) => {
    const [minute, hour] = cron.split(' ');
    const date = new Date();
    date.setHours(parseInt(hour), parseInt(minute));
    return date.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' });
  };

  // Function to get avatar color based on initial letter
  const getAvatarColor = (name) => {
    const colors = ['#D81E58', '#8A4EFC', '#00BCD4', '#FF9800', '#4CAF50'];
    const letter = (name || 'A')[0].toUpperCase();
    const index = letter.charCodeAt(0) % colors.length;
    return colors[index];
  };

  // Helper to get first name or display name from creator
  const getDisplayName = (creator) => {
    // If creator has first_name and last_name, use them
    if (creator.first_name && creator.last_name) {
      return `${creator.first_name} ${creator.last_name}`;
    }
    // If creator has only first_name, use it
    if (creator.first_name) {
      return creator.first_name;
    }
    // Otherwise fallback to email-based name
    if (!creator.email) return 'User';
    
    // Try to extract a name from the email
    const namePart = creator.email.split('@')[0];
    // Capitalize first letter and return
    return namePart.charAt(0).toUpperCase() + namePart.slice(1);
  };

  // Get avatar based on user info
  const getAvatarInfo = (creator) => {
    if (!creator) return { src: null, initials: 'U', color: getAvatarColor('User') };
    
    let avatarSrc = null;
    let initials = 'U';
    
    // If user has avatar_url, use it
    if (creator.avatar_url) {
      avatarSrc = creator.avatar_url.startsWith('http') 
        ? creator.avatar_url 
        : `http://localhost:3001${creator.avatar_url}`;
    }
    
    // Get initials for avatar fallback
    if (creator.first_name && creator.last_name) {
      // Use first letter of first and last name
      initials = `${creator.first_name[0]}${creator.last_name[0]}`.toUpperCase();
    } else if (creator.first_name) {
      // Use first letter of first name
      initials = creator.first_name[0].toUpperCase();
    } else if (creator.email) {
      // Use first letter of email
      initials = creator.email[0].toUpperCase();
    }
    
    return { 
      src: avatarSrc, 
      initials, 
      color: getAvatarColor(creator.first_name || creator.email || 'User')
    };
  };

  // Generate the correct image URL
  const getProgramImageUrl = (program) => {
    if (!program || !program.image_url) {
      return 'default-personal-program.jpg';
    }
    
    // Check if the path is already a full URL
    if (program.image_url.startsWith('http')) {
      return program.image_url;
    }
    
    // Otherwise, construct the URL from the path
    return program.image_url;
  };

  // Loading placeholder for about tab
  const AboutTabPlaceholder = () => (
    <PlaceholderContainer>
      <Skeleton variant="rounded" width="150px" height="32px" sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
      <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
      <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
      <Skeleton variant="text" width="100%" height={24} sx={{ mb: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
      <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
      <Skeleton variant="text" width="95%" height={24} sx={{ mb: 1, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
      <Skeleton variant="text" width="85%" height={24} sx={{ mb: 3, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
      <Skeleton variant="rounded" width="200px" height="40px" sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
    </PlaceholderContainer>
  );

  // Loading placeholder for schedule tab
  const ScheduleTabPlaceholder = () => (
    <PlaceholderContainer sx={{ alignItems: 'stretch' }}>
      <Skeleton variant="text" width="100%" height={24} sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
      <Skeleton variant="rounded" width="100%" height={50} sx={{ mb: 2, bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
      <Skeleton variant="rounded" width="100%" height={200} sx={{ bgcolor: 'rgba(255, 255, 255, 0.1)' }} />
    </PlaceholderContainer>
  );

  const handleEditActivity = (activity) => {
    setSelectedActivity(activity);
    setIsActivityFormOpen(true);
  };

  const handleAddActivity = () => {
    setSelectedActivity(null);
    setIsActivityFormOpen(true);
  };

  const handleActivitySubmit = async (activityData) => {
    try {
      if (selectedActivity) {
        // Edit existing activity
        const updatedActivity = await api.patch(`/activities/${selectedActivity.id}`, activityData);
      } else {
        // Create new activity
        const newActivity = await api.post('/activities', {
          programId: selectedProgram.id,
          activities: [activityData]
        });
      }
      
      // Reload the program to get fresh data
      const updatedProgram = await api.get(`/programs/${selectedProgram.id}`);
      if (updatedProgram) {
        // Update both the activities state and the selectedProgram
        setActivities(updatedProgram.activities);
        // Update the parent component's program data
        if (typeof handleCloseDialog === 'function') {
          handleCloseDialog(false, updatedProgram);
        }
      }

      setIsActivityFormOpen(false);
      setSelectedActivity(null);
    } catch (error) {
      console.error('Error saving activity:', error);
    }
  };

  if (!selectedProgram) return null;

  return (
    <StyledDialog
        onClose={handleClose}
        open={isDialogOpened}
        fullWidth
      maxWidth="md"
      scroll="paper"
    >
      <CloseButton onClick={handleClose} size="small">
        <CloseIcon fontSize="small" />
      </CloseButton>
      
      <DialogHeader style={{ backgroundImage: `url(${getProgramImageUrl(selectedProgram)})` }}>
        <HeaderContent>
          <Typography variant="h5" component="h2" sx={{ color: 'white', fontWeight: 600 }}>
            {selectedProgram.title}
          </Typography>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <AvatarStyled 
              src={getAvatarInfo(selectedProgram.creator).src}
              bgcolor={getAvatarInfo(selectedProgram.creator).color}
              alt={getDisplayName(selectedProgram.creator)}
            >
              {getAvatarInfo(selectedProgram.creator).initials}
            </AvatarStyled>
            <Box>
              <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                {getDisplayName(selectedProgram.creator)}
              </Typography>
              <Typography variant="caption" sx={{ color: '#A4B1CD' }}>
                {selectedProgram.creator.bio ? selectedProgram.creator.bio.substring(0, 30) + (selectedProgram.creator.bio.length > 30 ? '...' : '') : 'Creator'}
              </Typography>
            </Box>
          </Box>
        </HeaderContent>
      </DialogHeader>
      
      <TabContainer>
        <StyledTabs
          value={tabValue}
          onChange={handleTabChange}
          variant="fullWidth"
          aria-label="program information tabs"
        >
          <Tab sx={{ minHeight: '32px' }} icon={<InfoIcon sx={{ mr: 1 }} />} label="About" iconPosition="start" />
          <Tab sx={{ minHeight: '32px' }} icon={<CalendarMonthIcon sx={{ mr: 1 }} />} label="Schedule" iconPosition="start" />
        </StyledTabs>
      </TabContainer>

      <StyledDialogContent dividers>
        {/* About Tab */}
        <Fade in={tabValue === 0} unmountOnExit>
          <TabPanel $isLoading={isTabLoading || tabTransitioning}>
            {isTabLoading ? (
              <AboutTabPlaceholder />
            ) : (
              <>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                    <SubscribersChip 
                      icon={<PeopleIcon />}
                      label={`${selectedProgram.subscriberCount || 0} subscribers`}
                      size="medium"
                    />
                  </Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mt: 1, mb: 1 }}>
                    <CategoryChip 
                      icon={<CategoryIcon />} 
                      label={selectedProgram.category || 'General'} 
                      size="medium" 
                      sx={{ marginLeft: '8px' }}
                    />
                  </Box>
                </Box>
                <Typography variant="body1" sx={{ color: '#EEE', mb: 3, lineHeight: 1.6 }}>
                        {selectedProgram.description}
                    </Typography>
                
                {selectedProgram.link && (
                  <Button 
                    variant="outlined" 
                    startIcon={<LinkIcon />} 
                    endIcon={<OpenInNewIcon fontSize="small" />}
                    href={selectedProgram.link}
                    target="_blank"
                    rel="noopener noreferrer"
                    sx={{ 
                      textTransform: 'none', 
                      borderRadius: '8px',
                      borderColor: 'rgba(138, 78, 252, 0.5)',
                      color: '#8A4EFC',
                      '&:hover': {
                        borderColor: '#8A4EFC',
                        backgroundColor: 'rgba(138, 78, 252, 0.04)'
                      }
                    }}
                  >
                    View Program Resources
                </Button>
                )}
              </>
            )}
          </TabPanel>
        </Fade>
        
        {/* Schedule Tab */}
        <Fade in={tabValue === 1} unmountOnExit>
          <TabPanel id="schedule-tab-panel" $isLoading={isTabLoading || tabTransitioning}>
            {isTabLoading ? (
              <ScheduleTabPlaceholder />
            ) : (             
                <ScheduleContainer elevation={0}>
                  <WeekdayGridContainer>
                    {weekdays.map((day, index) => (
                      <WeekdayGridItem 
                        key={index} 
                        isActive={activeDay === index}
                        onClick={() => setActiveDay(index)}
                      >
                        <Typography variant="body2" sx={{ fontWeight: activeDay === index ? 600 : 400 }}>
                          {shortWeekdays[index]}
                          {new Date().getDay() === index && (
                            <Typography component="span" sx={{ 
                              display: 'block', 
                              fontSize: '0.65rem', 
                              color: '#8A4EFC',
                              mt: '2px' 
                            }}>
                              Today
                            </Typography>
                          )}
                        </Typography>
                      </WeekdayGridItem>
                    ))}
                  </WeekdayGridContainer>
                  
                  <Box sx={{ p: 2, bgcolor: '#202B3E' }}>                
                    {getActivities(activeDay).length === 0 ? (
                      <EmptyDay>
                        <Typography variant="body1" sx={{ color: '#EEE', mb: 1 }}>
                          No Tasks Scheduled
                        </Typography>
                        <Typography variant="caption" sx={{ color: '#61759b' }}>
                          There are no tasks scheduled for {weekdays[activeDay]}
                        </Typography>
                      </EmptyDay>
                    ) : (
                      <Stack spacing={2}>
                        {getActivities(activeDay).map((activity, actIndex) => (
                          <Paper 
                            key={actIndex}
                            elevation={0}
                            sx={{ 
                              bgcolor: 'rgba(19, 26, 38, 0.5)', 
                              borderRadius: '8px',
                              overflow: 'hidden',
                              p: 0
                            }}
                          >
                            <ScheduleRow>
                              <TimeSlot>
                                <Typography variant="caption" sx={{ color: '#A4B1CD', display: 'block', fontSize: '0.7rem' }}>
                                  TIME
                                </Typography>
                                <Typography variant="body2" sx={{ color: 'white', fontWeight: 500 }}>
                                  {formatTimeFromCron(activity.cron)}
                                </Typography>
                              </TimeSlot>
                              
                              <Box sx={{ flex: 1, ml: 2 }}>
                                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                                  <Typography variant="body1" sx={{ color: 'white', fontWeight: 500, mb: 0.5 }}>
                                    {activity.title}
                                  </Typography>
                                  {selectedProgram.is_personal && (
                                    <IconButton 
                                      size="small" 
                                      onClick={() => handleEditActivity(activity)}
                                      sx={{ color: '#8A4EFC' }}
                                    >
                                      <EditIcon fontSize="small" />
                                    </IconButton>
                                  )}
                                </Box>
                                {activity.description && (
                                  <Typography variant="body2" sx={{ color: '#A4B1CD', fontSize: '0.85rem' }}>
                                    {activity.description}
                                  </Typography>
                                )}
                              </Box>
                            </ScheduleRow>
                          </Paper>
                        ))}
                      </Stack>
                    )}
                  </Box>
                </ScheduleContainer>
            )}
          </TabPanel>
        </Fade>
      </StyledDialogContent>
      
      <StyledDialogActions>
        {selectedProgram.isSubscribed ? (
          !selectedProgram.is_personal && (
            <ActionButton variant="outlined" onClick={() => handleUnsubscribe(selectedProgram.id)} startIcon={<RemoveDoneIcon />}>
              Unsubscribe from Program
            </ActionButton>
          )
        ) : (
          <ActionButton variant="contained" onClick={() => handleSubscribe(selectedProgram.id)} startIcon={<DoneAllIcon />}>
            Subscribe to Program
          </ActionButton>
        )}
        {selectedProgram.is_personal && (
          <ActionButton variant="contained" onClick={handleAddActivity} startIcon={<AddIcon />}>
            Add Scheduled Task
          </ActionButton>
        )}
      </StyledDialogActions>

      <ActivityForm
        open={isActivityFormOpen}
        onClose={() => {
          setIsActivityFormOpen(false);
          setSelectedActivity(null);
        }}
        onSubmit={handleActivitySubmit}
        initialActivity={selectedActivity}
        mode={selectedActivity ? 'edit' : 'add'}
      />
    </StyledDialog>
  );
}
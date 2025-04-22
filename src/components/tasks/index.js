import React, { useState, useEffect } from "react";
import { useAuthUser } from 'react-auth-kit';
import { RouterBottomNavigation } from "../navigation/nav";
import { useApi } from "../../utils/api";
import Checkbox from "../shared/checkbox";
import { 
  Container, 
  Box, 
  Typography, 
  Paper, 
  IconButton, 
  Button, 
  TextField, 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  Grow,
  Tooltip,
  FormControlLabel,
  Checkbox as MuiCheckbox,
  FormGroup,
  FormLabel,
  Divider,
  Snackbar,
  Alert,
  CircularProgress
} from '@mui/material';
import { styled } from '@mui/system';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import CelebrationOverlay from "./CelebrationOverlay";

// Styled components
const PageContainer = styled(Container)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  padding: '20px 0 0',
  height: '100vh',
  position: 'relative',
  overflow: 'hidden', // Prevent page scrolling
  paddingBottom: '92px' // Add space for bottom navigation
}));

const TaskContainer = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  flex: 1,
  height: 'calc(100vh - 240px)', // Match the StyledTabPanel from programs page
  overflow: 'hidden', // Hide overflow in the container itself
  position: 'relative'
}));

const DateNavigation = styled(Box)(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: '20px',
  background: 'linear-gradient(to right, #D81E58, #8A4EFC)',
  borderRadius: '12px',
  padding: '10px 15px',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.1)',
  flexShrink: 0
}));

// Content section for scrollable tasks
const TaskContentSection = styled(Box)(({ theme }) => ({
  flexGrow: 1,
  overflowY: 'auto',
  overflowX: 'hidden',
  display: 'flex',
  flexDirection: 'column',
  paddingBottom: '20px',
  '&::-webkit-scrollbar': {
    width: '8px',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
    borderRadius: '4px'
  },
  '&::-webkit-scrollbar-thumb': {
    backgroundColor: 'rgba(138, 78, 252, 0.3)',
    borderRadius: '4px',
    '&:hover': {
      backgroundColor: 'rgba(138, 78, 252, 0.5)',
    }
  },
  // Add smooth scrolling for better user experience
  scrollBehavior: 'smooth'
}));

// This component adapts the MUI Paper to have the original 'item' class needed for checkbox animations
const TaskItem = styled(Paper)(({ theme, completed }) => ({
  marginBottom: '12px',
  borderRadius: '12px',
  backgroundColor: completed ? 'rgba(32, 43, 62, 0.7)' : '#202B3E',
  transition: 'all 0.3s ease',
  position: 'relative',
  boxShadow: '0 3px 8px rgba(0, 0, 0, 0.15)',
  overflow: 'hidden', // Prevent child content from affecting border radius
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)'
  }
}));

const TaskTitle = styled(Typography)(({ theme, completed }) => ({
  flexGrow: 1,
  marginLeft: '16px',
  fontSize: '1.1rem',
  textDecoration: completed ? 'line-through' : 'none',
  color: completed ? '#61759b' : '#EEE',
  transition: 'all 0.3s ease'
}));

const AddButton = styled(IconButton)(({ theme }) => ({
  position: 'fixed',
  bottom: '120px',
  right: '30px',
  backgroundColor: '#8A4EFC',
  color: '#fff',
  width: '60px',
  height: '60px',
  boxShadow: '0 4px 12px rgba(138, 78, 252, 0.4)',
  zIndex: 900,
  '&:hover': {
    backgroundColor: '#7B44E5'
  }
}));

const EmptyState = styled(Box)(({ theme }) => ({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100%',
  padding: '30px',
  textAlign: 'center'
}));

function Dashboard() {
  const authUser = useAuthUser();
  const api = useApi();
  
  const [day, setDay] = useState(new Date().toLocaleDateString().replace(/\//g, '-'));
  const [tasks, setTasks] = useState([]);
  const [popupActive, setPopupActive] = useState(false);
  const [newTask, setNewTask] = useState("");
  const [showCelebration, setShowCelebration] = useState(false);
  const [hasCelebratedToday, setHasCelebratedToday] = useState(false);
  const [taskToDelete, setTaskToDelete] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringDays, setRecurringDays] = useState({
    0: false, // Sunday
    1: false, // Monday
    2: false, // Tuesday
    3: false, // Wednesday
    4: false, // Thursday
    5: false, // Friday
    6: false  // Saturday
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' // 'success', 'error', 'warning', 'info'
  });
  const [isLoading, setIsLoading] = useState(false);
  

  // Check if celebration has already happened for this day and user in this session
  useEffect(() => {
    // Create a key specific to this user and day
    const celebrationKey = `celebrated_${authUser()._id}_${day}`;
    // Check if we have already celebrated today in this session
    const hasCelebrated = sessionStorage.getItem(celebrationKey) === 'true';
    setHasCelebratedToday(hasCelebrated);
  }, [day, authUser]);

  useEffect(() => {
    populateTasks();
  }, [day]);

  // Check if all tasks are completed
  useEffect(() => {
    // Only show celebration if:
    // 1. There are tasks
    // 2. All tasks are complete
    // 3. We haven't already celebrated today in this session
    // 4. We're not already showing the celebration
    if (tasks.length > 0 && 
        tasks.every(task => task.is_completed) && 
        !hasCelebratedToday && 
        !showCelebration) {
      // Small delay to ensure animation of the last checkbox completes
      const timer = setTimeout(() => {
        setShowCelebration(true);
        setHasCelebratedToday(true);
        
        // Store in sessionStorage that we've celebrated for this day and user
        const celebrationKey = `celebrated_${authUser()._id}_${day}`;
        sessionStorage.setItem(celebrationKey, 'true');
      }, 600);
      
      return () => clearTimeout(timer);
    }
  }, [tasks, showCelebration, hasCelebratedToday, day, authUser]);

  const changeDay = (offset) => {
    const newDate = new Date(day);
    newDate.setDate(newDate.getDate() + offset);
    setDay(newDate.toLocaleDateString().replace(/\//g, '-'));
  };

  const fetchTasks = async (date) => {
    try {
      console.log(`Fetching tasks for date: ${date}`);
      const data = await api.get(`/tasks?day=${date}`);
      console.log(`Received ${data ? data.length : 0} tasks from API:`, data);
      
      if (Array.isArray(data)) {
        setTasks(data);
      } else {
        console.error("API did not return an array of tasks:", data);
        setTasks([]);
      }
    } catch (err) {
      console.error("Error fetching tasks:", err);
      setSnackbar({
        open: true,
        message: `Error loading tasks: ${err.message}`,
        severity: "error"
      });
      setTasks([]);
    }
  };

  const populateTasks = async () => {
    setIsLoading(true);
    try {
      // Check if the requested day is in the past
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const dayDate = new Date(day);
      dayDate.setHours(0, 0, 0, 0);
      
      if (dayDate >= today) {
        console.log(`Populating tasks for date: ${day}`);
        
        const result = await api.post(`/tasks/populate`, { 
          day: day 
        });
        console.log(`Population result:`, result);
      }
      
      // After populating tasks, fetch them again
      await fetchTasks(day);
    } catch (err) {
      console.error("Error populating tasks:", err);
      setSnackbar({
        open: true,
        message: `Error populating tasks: ${err.message}`,
        severity: "error"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const completeTask = async (id) => {
    // Find the task to check its date
    const taskToComplete = tasks.find(task => task.id === id);
    
    // Get today's date at midnight for comparison
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todayString = today.toISOString().split('T')[0];
    
    // If task is in the future, don't allow completion
    if (taskToComplete.due_date > todayString) {
      return;
    }
    
    try {
      const data = await api.patch(`/tasks/${id}/complete`);
      
      setTasks(tasks => tasks.map(task => {
        if (task.id === data.id) {
          task.is_completed = data.is_completed;
        }
        return task;
      }));
    } catch (err) {
      console.error("Error completing task:", err);
      setSnackbar({
        open: true,
        message: `Error completing task: ${err.message}`,
        severity: "error"
      });
    }
  };

  const deleteTask = async (id) => {
    try {
      await api.delete(`/tasks/${id}/delete`);
      
      // Whether the task was soft-deleted or hard-deleted, we remove it from the UI
    setTasks(tasks => tasks.filter(task => task.id !== id));
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
      
      // Add success notification
      setSnackbar({
        open: true,
        message: "Task deleted successfully",
        severity: "success"
      });
    } catch (err) {
      console.error("Error deleting task:", err);
      
      // Add error notification
      setSnackbar({
        open: true,
        message: `Error deleting task: ${err.message}`,
        severity: "error"
      });
    }
  };

  const addTask = async () => {
    try {
      if (!newTask.trim()) {
        setSnackbar({
          open: true,
          message: "Task title cannot be empty",
          severity: "error"
        });
        return;
      }

      if (isRecurring) {
        // Handle recurring task creation
        const selectedDays = Object.entries(recurringDays)
          .filter(([_, isSelected]) => isSelected)
          .map(([day]) => parseInt(day));

        if (selectedDays.length === 0) {
          setSnackbar({
            open: true,
            message: "Please select at least one day for recurring tasks",
            severity: "error"
          });
          return;
        }

        await api.post("/tasks/new", {
          title: newTask,
          dueDate: day,
          isRecurring: true,
          recurringDays: selectedDays
        });

        setSnackbar({
          open: true,
          message: "Recurring task created successfully",
          severity: "success"
        });
      } else {
        // Handle regular non-recurring task
        console.log(`Creating regular task "${newTask}" for date: ${day}`);
        
        await api.post("/tasks/new", {
          title: newTask,
          dueDate: day
        });
        
        setSnackbar({
          open: true,
          message: "Task created successfully",
          severity: "success"
        });
      }
      
      setPopupActive(false);
      setNewTask("");
      setIsRecurring(false);
      setRecurringDays({
        0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false
      });

      // After creating the task, populate tasks for the day
      await populateTasks();
    } catch (err) {
      console.error("Error adding task:", err);
      setSnackbar({
        open: true,
        message: `Error adding task: ${err.message}`,
        severity: "error"
      });
    }
  };

  // Helper function to handle recurring day selection
  const handleRecurringDayChange = (day) => {
    setRecurringDays({
      ...recurringDays,
      [day]: !recurringDays[day]
    });
  };

  const handleDismissCelebration = () => {
    setShowCelebration(false);
    // We already have hasCelebratedToday as true and stored in sessionStorage
    // so it won't show again for this day during this session
  };

  // Handler for initiating task deletion
  const handleDeleteClick = (taskId) => {
    setTaskToDelete(taskId);
    setShowDeleteConfirm(true);
  };

  // Handler for canceling task deletion
  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  // Handle snackbar close
  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  return (
    <PageContainer maxWidth="sm">
      <TaskContainer>
        <DateNavigation>
          <IconButton color="inherit" onClick={() => changeDay(-1)}>
            <ChevronLeftIcon />
          </IconButton>
          
          <Typography variant="h6" component="h2" sx={{ flex: 1, textAlign: 'center', color: 'white' }}>
            <CalendarTodayIcon sx={{ mr: 1, verticalAlign: 'middle', fontSize: '1.2rem' }} />
            {day}
          </Typography>
          
          <IconButton color="inherit" onClick={() => changeDay(1)}>
            <ChevronRightIcon />
          </IconButton>
        </DateNavigation>

        <TaskContentSection>
          {isLoading ? (
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              alignItems: 'center', 
              justifyContent: 'center',
              height: '100%',
              py: 4
            }}>
              <CircularProgress sx={{ color: '#8A4EFC', mb: 2 }} />
              <Typography variant="body1" sx={{ color: '#A4B1CD' }}>
                Loading tasks...
              </Typography>
            </Box>
          ) : (
            <>
              {tasks.length > 0 ? (
                tasks.map((task, index) => (
                  <Grow
                    in={true}
                    style={{ transformOrigin: '0 0 0' }}
                    timeout={(index + 1) * 100}
                    key={task.id}
                  >
                    <TaskItem completed={task.is_completed}>
                      {/* Restore the original 'item' class that's needed for the checkbox animation to work */}
                      <div className={`item ${task.is_completed ? "is-complete" : ""}`} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '16px',
                          width: '100%',
                          margin: 0 // Add this to override the margin from the .item class
                        }}
                      >
                        {/* Determine if task is in the future */}
                        {(() => {
                          const today = new Date();
                          today.setHours(0, 0, 0, 0);
                          const todayString = today.toISOString().split('T')[0];
                          const isFutureTask = task.due_date > todayString;
                          
                          return isFutureTask ? (
                            <Tooltip title="This task is scheduled for the future and cannot be completed yet" arrow placement="top">
                              <span>
                                <Checkbox 
                                  handleClick={() => completeTask(task.id)} 
                                  isChecked={task.is_completed} 
                                  disabled={isFutureTask}
                                />
                              </span>
                            </Tooltip>
                          ) : (
                            <Checkbox 
                              handleClick={() => completeTask(task.id)} 
                              isChecked={task.is_completed} 
                              disabled={false}
                            />
                          );
                        })()}
                        <TaskTitle 
                          completed={task.is_completed}
                          sx={{
                            opacity: (() => {
                              const today = new Date();
                              today.setHours(0, 0, 0, 0);
                              const todayString = today.toISOString().split('T')[0];
                              return task.due_date > todayString ? 0.7 : 1;
                            })()
                          }}
                        >
                          {task.title}
                        </TaskTitle>
                        <IconButton 
                          size="small" 
                          onClick={() => handleDeleteClick(task.id)}
                          sx={{ 
                            color: '#AF1E3D',
                            outline: 'none',
                            border: 'none',
                            boxShadow: 'none',
                            '&:focus': {
                              outline: 'none !important',
                              boxShadow: 'none !important',
                              border: 'none !important'
                            },
                            '&:hover': {
                              outline: 'none',
                              boxShadow: 'none'
                            },
                            '&::after': {
                              display: 'none'
                            },
                            '&.MuiButtonBase-root': {
                              outline: 'none'
                            },
                            '& .MuiTouchRipple-root': {
                              display: 'none'
                            }
                          }}
                          disableRipple={true}
                          disableFocusRipple={true}
                          disableTouchRipple={true}
                        >
                          <CancelIcon />
                        </IconButton>
                      </div>
                    </TaskItem>
                  </Grow>
                ))
              ) : (
                <EmptyState>
                  <EventBusyIcon sx={{ fontSize: '4rem', color: '#61759b', mb: 2 }} />
                  <Typography variant="h6" sx={{ color: '#eee', mb: 1 }}>
                    No Tasks for Today
                  </Typography>
                  <Typography variant="body2" sx={{ color: '#61759b' }}>
                    Add a new task or check back tomorrow for your scheduled activities.
                  </Typography>
                </EmptyState>
              )}
            </>
          )}
        </TaskContentSection>
      </TaskContainer>

      <AddButton color="primary" onClick={() => setPopupActive(true)}>
        <AddIcon />
      </AddButton>

      <Dialog 
        open={popupActive} 
        onClose={() => setPopupActive(false)}
        PaperProps={{
          sx: { 
            borderRadius: '16px',
            backgroundColor: '#EEE'
          }
        }}
      >
        <DialogTitle sx={{ 
          fontWeight: 'medium', 
          textTransform: 'uppercase', 
          color: '#131A26',
          textAlign: 'center'
        }}>
          Add New Task
        </DialogTitle>
        
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Task Name"
            type="text" 
            fullWidth
            variant="outlined"
            value={newTask}
            onChange={(e) => setNewTask(e.target.value)} 
            sx={{ mt: 1 }}
          />
          
          <FormControlLabel
            control={
              <MuiCheckbox
                checked={isRecurring}
                onChange={() => setIsRecurring(!isRecurring)}
                color="primary"
              />
            }
            label="This is a recurring task"
            sx={{ mt: 2 }}
          />
          
          {isRecurring && (
            <Box sx={{ mt: 2 }}>
              <Divider sx={{ my: 1 }} />
              <FormLabel component="legend" sx={{ mb: 1 }}>Repeat on:</FormLabel>
              <FormGroup row>
                <FormControlLabel
                  control={<MuiCheckbox checked={recurringDays[0]} onChange={() => handleRecurringDayChange(0)} />}
                  label="Sun"
                />
                <FormControlLabel
                  control={<MuiCheckbox checked={recurringDays[1]} onChange={() => handleRecurringDayChange(1)} />}
                  label="Mon"
                />
                <FormControlLabel
                  control={<MuiCheckbox checked={recurringDays[2]} onChange={() => handleRecurringDayChange(2)} />}
                  label="Tue"
                />
                <FormControlLabel
                  control={<MuiCheckbox checked={recurringDays[3]} onChange={() => handleRecurringDayChange(3)} />}
                  label="Wed"
                />
                <FormControlLabel
                  control={<MuiCheckbox checked={recurringDays[4]} onChange={() => handleRecurringDayChange(4)} />}
                  label="Thu"
                />
                <FormControlLabel
                  control={<MuiCheckbox checked={recurringDays[5]} onChange={() => handleRecurringDayChange(5)} />}
                  label="Fri"
                />
                <FormControlLabel
                  control={<MuiCheckbox checked={recurringDays[6]} onChange={() => handleRecurringDayChange(6)} />}
                  label="Sat"
                />
              </FormGroup>
            </Box>
          )}
        </DialogContent>
        
        <DialogActions sx={{ pb: 3, px: 3, justifyContent: 'center' }}>
          <Button 
            onClick={() => setPopupActive(false)} 
            color="primary"
            variant="outlined"
            sx={{ borderRadius: '20px', px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={addTask}
            variant="contained"
            disabled={isRecurring && !Object.values(recurringDays).some(v => v)}
            sx={{ 
              borderRadius: '20px', 
              px: 3,
              background: 'linear-gradient(to right, #D81E58, #8A4EFC)',
              '&:hover': {
                background: 'linear-gradient(to right, #8A4EFC, #D81E58)',
              }
            }}
          >
            Create Task
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={showDeleteConfirm}
        onClose={handleCancelDelete}
        PaperProps={{
          sx: { 
            borderRadius: '16px',
            backgroundColor: '#EEE'
          }
        }}
      >
        <DialogTitle sx={{ 
          color: '#131A26',
          textAlign: 'center',
          pt: 3
        }}>
          Confirm Deletion
        </DialogTitle>
        
        <DialogContent>
          <Typography>
            Are you sure you want to delete this task?
          </Typography>
        </DialogContent>
        
        <DialogActions sx={{ pb: 3, px: 3, justifyContent: 'center' }}>
          <Button 
            onClick={handleCancelDelete} 
            variant="outlined"
            sx={{ borderRadius: '20px', px: 3 }}
          >
            Cancel
          </Button>
          <Button 
            onClick={() => taskToDelete && deleteTask(taskToDelete)}
            variant="contained"
            color="error"
            sx={{ 
              borderRadius: '20px', 
              px: 3,
              ml: 2
            }}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {showCelebration && (
        <CelebrationOverlay onDismiss={handleDismissCelebration} />
      )}

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

export { Dashboard };
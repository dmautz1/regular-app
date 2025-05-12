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
  CircularProgress,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import { styled } from '@mui/system';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import CancelIcon from '@mui/icons-material/Cancel';
import AddIcon from '@mui/icons-material/Add';
import CalendarTodayIcon from '@mui/icons-material/CalendarToday';
import EventBusyIcon from '@mui/icons-material/EventBusy';
import InfoIcon from '@mui/icons-material/Info';
import PushPinIcon from '@mui/icons-material/PushPin';
import MoreVertIcon from '@mui/icons-material/MoreVert';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import CelebrationOverlay from "./CelebrationOverlay";
import TaskForm from './TaskForm';
import RepeatIcon from '@mui/icons-material/Repeat';

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
  minHeight: '64px', // Add minimum height
  '&:hover': {
    transform: 'translateY(-2px)',
    boxShadow: '0 6px 12px rgba(0, 0, 0, 0.2)'
  },
  '& .item': {
    minHeight: '64px', // Ensure inner content also has minimum height
    display: 'flex',
    alignItems: 'center',
    padding: '16px',
    width: '100%',
    margin: 0
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
  console.log(authUser());
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
  const [isSticky, setIsSticky] = useState(false);
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
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedTask, setSelectedTask] = useState(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [editTask, setEditTask] = useState({
    title: '',
    description: '',
    dueDate: '',
    isSticky: false,
    isRecurring: false,
    recurringDays: {
      0: false, // Sunday
      1: false, // Monday
      2: false, // Tuesday
      3: false, // Wednesday
      4: false, // Thursday
      5: false, // Friday
      6: false  // Saturday
    }
  });
  const [isProgramTask, setIsProgramTask] = useState(false);
  const [addDialogOpen, setAddDialogOpen] = useState(false);
  

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

  useEffect(() => {
    if (!isLoading && 
        tasks.length > 0 && 
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
  }, [tasks, showCelebration, hasCelebratedToday, day, authUser, isLoading]);

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
        // Sort tasks: sticky tasks first, then by creation date
        const sortedTasks = [...data].sort((a, b) => {
          // First sort by sticky status
          if (a.is_sticky && !b.is_sticky) return -1;
          if (!a.is_sticky && b.is_sticky) return 1;
          // If both are sticky or both are not sticky, sort by creation date
          return new Date(a.created_at) - new Date(b.created_at);
        });
        setTasks(sortedTasks);
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
    const taskToComplete = tasks.find(task => task.id === id);
    
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
      
      setTasks(tasks => tasks.filter(task => task.id !== id));
      setShowDeleteConfirm(false);
      setTaskToDelete(null);
      
      setSnackbar({
        open: true,
        message: "Task deleted successfully",
        severity: "success"
      });
    } catch (err) {
      console.error("Error deleting task:", err);
      
      setSnackbar({
        open: true,
        message: `Error deleting task: ${err.message}`,
        severity: "error"
      });
    }
  };

  const handleEditClick = () => {
    if (selectedTask) {
      const isProgram = selectedTask.activity_id && selectedTask.program_id;
      setIsProgramTask(isProgram);
      setEditDialogOpen(true);
      setAnchorEl(null); // Only clear the anchor element, not the selected task
    }
  };

  const handleAddTask = async (taskData) => {
    try {
      if (!taskData.title.trim()) {
        setSnackbar({
          open: true,
          message: "Task title cannot be empty",
          severity: "error"
        });
        return;
      }

      if (taskData.isRecurring && taskData.isSticky) {
        setSnackbar({
          open: true,
          message: "A task cannot be both recurring and sticky",
          severity: "error"
        });
        return;
      }

      if (taskData.isRecurring) {
        // Handle recurring task creation
        const selectedDays = Object.entries(taskData.recurringDays)
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
          title: taskData.title,
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
        await api.post("/tasks/new", {
          title: taskData.title,
          description: taskData.description,
          dueDate: day,
          isSticky: taskData.isSticky
        });
        
        setSnackbar({
          open: true,
          message: "Task created successfully",
          severity: "success"
        });
      }
      
      setAddDialogOpen(false);
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

  const handleEditTask = async (taskData) => {
    try {
      if (!selectedTask) return;

      const updateData = {
        title: taskData.title,
        description: taskData.description,
        dueDate: taskData.dueDate,
        isSticky: taskData.isSticky
      };

      // If editing recurrence, include the recurrence data
      if (taskData.isEditingRecurrence) {
        updateData.isEditingRecurrence = true;
        updateData.recurringDays = taskData.recurringDays;
      }

      const updatedTask = await api.patch(`/tasks/${selectedTask.id}/update`, updateData);
      
      setTasks(tasks => tasks.map(task => {
        if (task.id === selectedTask.id) {
          return {
            ...task,
            ...updatedTask
          };
        }
        return task;
      }));

      setEditDialogOpen(false);
      setSelectedTask(null);

      // Repopulate tasks for the current day to ensure the list is up to date
      await populateTasks();
      
      setSnackbar({
        open: true,
        message: taskData.isEditingRecurrence ? 
          "Task and all future recurring instances updated successfully" : 
          "Task updated successfully",
        severity: "success"
      });
    } catch (err) {
      console.error("Error updating task:", err);
      setSnackbar({
        open: true,
        message: `Error updating task: ${err.message}`,
        severity: "error"
      });
    }
  };

  const handleDismissCelebration = () => {
    setShowCelebration(false);
  };

  const handleDeleteClick = () => {
    if (selectedTask) {
      setTaskToDelete(selectedTask.id);
      setShowDeleteConfirm(true);
    }
    handleMenuClose();
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(false);
    setTaskToDelete(null);
  };

  const handleSnackbarClose = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbar({ ...snackbar, open: false });
  };

  const handleMenuClick = (event, task) => {
    setAnchorEl(event.currentTarget);
    setSelectedTask(task);
    console.log(selectedTask);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
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
                      <div className={`item ${task.is_completed ? "is-complete" : ""}`} 
                        style={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          padding: '16px',
                          width: '100%',
                          margin: 0
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
                        
                        <Box sx={{ flexGrow: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                          <TaskTitle completed={task.is_completed}>
                            {task.title}
                          </TaskTitle>
                          <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                            {task.is_sticky && (
                              <Tooltip title="This is a sticky task - it will continue day to day until it is completed." arrow placement="top">
                                <PushPinIcon sx={{ fontSize: '1rem', color: '#8A4EFC', marginRight: '4px' }} />
                              </Tooltip>
                            )}
                            {task.activity_id && task.activity?.cron && (
                              <Tooltip title="This is a recurring task" arrow placement="top">
                                <RepeatIcon sx={{ fontSize: '1rem', color: '#8A4EFC', marginRight: '4px' }} />
                              </Tooltip>
                            )}
                          </Box>
                        </Box>
                        
                        <IconButton 
                          onClick={(e) => handleMenuClick(e, task)}
                          sx={{ color: 'text.secondary', ml: 1 }}
                        >
                          <MoreVertIcon />
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

      <AddButton color="primary" onClick={() => setAddDialogOpen(true)}>
        <AddIcon />
      </AddButton>

      {/* Add Task Form */}
      <TaskForm
        open={addDialogOpen}
        onClose={() => setAddDialogOpen(false)}
        onSubmit={handleAddTask}
        mode="add"
        defaultDueDate={day}
      />

      {/* Edit Task Form */}
      <TaskForm
        open={editDialogOpen}
        onClose={() => {
          setEditDialogOpen(false);
          setSelectedTask(null);
        }}
        onSubmit={handleEditTask}
        mode="edit"
        initialTask={selectedTask}
        isProgramTask={isProgramTask}
      />

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

      {/* Task Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
      >
        <Box sx={{ position: 'relative' }}>
          <MenuItem 
            onClick={handleEditClick}
            disabled={selectedTask?.program_id && selectedTask?.program?.creator_id !== authUser()?._id && !selectedTask?.program?.is_personal}
          >
            <ListItemIcon>
              <EditIcon fontSize="small" />
            </ListItemIcon>
            <ListItemText>Edit Task</ListItemText>
          </MenuItem>
          {selectedTask?.program_id && selectedTask?.program?.creator_id !== authUser()?._id && !selectedTask?.program?.is_personal && (
            <Tooltip 
              title="This task is part of a program created by another user and cannot be edited" 
              arrow
              placement="right"
              sx={{ position: 'absolute', right: 0, top: '50%', transform: 'translateY(-50%)' }}
            >
              <InfoIcon sx={{ position: 'absolute', right: 8, top: '50%', transform: 'translateY(-50%)', fontSize: '1rem', color: 'text.secondary' }} />
            </Tooltip>
          )}
        </Box>
        <MenuItem onClick={handleDeleteClick}>
          <ListItemIcon>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete Task</ListItemText>
        </MenuItem>
      </Menu>

      <RouterBottomNavigation />
    </PageContainer>
  );
}

export { Dashboard };
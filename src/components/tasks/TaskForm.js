import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Button,
  Box,
  FormControlLabel,
  Checkbox as MuiCheckbox,
  FormGroup,
  FormLabel,
  Divider,
  Typography,
  Tooltip,
  Alert
} from '@mui/material';
import InfoIcon from '@mui/icons-material/Info';
import { format } from 'date-fns';

const TaskForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  mode = 'add', // 'add' or 'edit'
  initialTask = null,
  isProgramTask = false,
  defaultDueDate = new Date()
}) => {
  const [task, setTask] = useState({
    title: '',
    description: '',
    dueDate: format(new Date(defaultDueDate), 'yyyy-MM-dd'),
    isSticky: false,
    isRecurring: false,
    editRecurrence: false,
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

  useEffect(() => {
    if (mode === 'edit' && initialTask) {
      console.log('Initial task data:', initialTask);
      const isRecurring = initialTask.activity_id && initialTask.activity && initialTask.activity.cron;
      const isPersonalProgram = initialTask.program?.is_personal;
      console.log('Is recurring:', isRecurring);
      console.log('Is personal program:', isPersonalProgram);
      setTask({
        title: initialTask.title,
        description: initialTask.description || '',
        dueDate: initialTask.due_date,
        isSticky: initialTask.is_sticky,
        isRecurring: isRecurring,
        editRecurrence: false,
        recurringDays: isRecurring ? parseCronToDays(initialTask.activity.cron) : {
          0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false
        }
      });
    } else if (mode === 'add') {
      setTask({
        title: '',
        description: '',
        dueDate: format(new Date(defaultDueDate), 'yyyy-MM-dd'),
        isSticky: false,
        isRecurring: false,
        editRecurrence: false,
        recurringDays: {
          0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false
        }
      });
    }
  }, [mode, initialTask]);

  // Add new useEffect to handle defaultDueDate changes
  useEffect(() => {
    if (mode === 'add' && open) {
      setTask(prevTask => ({
        ...prevTask,
        dueDate: format(new Date(defaultDueDate), 'yyyy-MM-dd')
      }));
    }
  }, [defaultDueDate, mode, open]);

  const parseCronToDays = (cron) => {
    if (!cron) return { 0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false };
    const daysPart = cron.split(' ')[4];
    if (daysPart === '*') {
      return {
        0: true, 1: true, 2: true, 3: true, 4: true, 5: true, 6: true
      };
    }
    const days = daysPart.split(',').map(Number);
    return {
      0: days.includes(0),
      1: days.includes(1),
      2: days.includes(2),
      3: days.includes(3),
      4: days.includes(4),
      5: days.includes(5),
      6: days.includes(6)
    };
  };

  const handleRecurringDayChange = (day) => {
    setTask({
      ...task,
      recurringDays: {
        ...task.recurringDays,
        [day]: !task.recurringDays[day]
      }
    });
  };

  const handleSubmit = () => {
    if (task.isRecurring && (mode === 'add' || task.editRecurrence)) {
      const selectedDays = Object.entries(task.recurringDays)
        .filter(([_, isSelected]) => isSelected)
        .map(([day]) => parseInt(day));

      if (selectedDays.length === 0) {
        return;
      }
    }

    onSubmit({
      ...task,
      isEditingRecurrence: mode === 'edit' && task.editRecurrence
    });
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
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
        {mode === 'add' ? 'Add New Task' : 'Edit Task'}
      </DialogTitle>
      
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Task Name"
          type="text" 
          fullWidth
          variant="outlined"
          value={task.title}
          onChange={(e) => setTask({...task, title: e.target.value})} 
          sx={{ mt: 1 }}
        />
        
        <TextField
          margin="dense"
          label="Description"
          type="text" 
          fullWidth
          variant="outlined"
          multiline
          rows={3}
          value={task.description}
          onChange={(e) => setTask({...task, description: e.target.value})} 
          sx={{ mt: 2 }}
        />
        
        <TextField
          margin="dense"
          label="Due Date"
          type="date"
          fullWidth
          variant="outlined"
          value={task.dueDate}
          onChange={(e) => setTask({...task, dueDate: e.target.value})}
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 2 }}
        />
        
        <FormControlLabel
          control={
            <MuiCheckbox
              checked={task.isSticky}
              onChange={(e) => setTask({...task, isSticky: e.target.checked})}
              color="primary"
            />
          }
          label={
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <span>Make this task sticky</span>
              <Tooltip 
                title="Sticky tasks will automatically move to the next day until completed."
                arrow
                placement="top"
              >
                <InfoIcon sx={{ ml: 1, fontSize: '1rem', color: 'text.secondary' }} />
              </Tooltip>
            </Box>
          }
          sx={{ mt: 2 }}
        />
        
        <br />
        
        {mode === 'add' ? (
          <FormControlLabel
            control={
              <MuiCheckbox
                checked={task.isRecurring}
                onChange={(e) => setTask({...task, isRecurring: e.target.checked})}
                color="primary"
              />
            }
            label="This is a recurring task"
            sx={{ mt: 2 }}
          />
        ) : task.isRecurring && (!isProgramTask || initialTask?.program?.is_personal) && (
          <FormControlLabel
            control={
              <MuiCheckbox
                checked={task.editRecurrence}
                onChange={(e) => setTask({...task, editRecurrence: e.target.checked})}
                color="primary"
              />
            }
            label="Edit recurrence"
            sx={{ mt: 2 }}
          />
        )}

        {(task.isRecurring && mode === 'add') || (task.isRecurring && task.editRecurrence && (!isProgramTask || initialTask?.program?.is_personal)) ? (
          <Box sx={{ mt: 2 }}>
            <Divider sx={{ my: 1 }} />
            {isProgramTask && !initialTask?.program?.is_personal ? (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                This is a program task. Recurring settings cannot be modified.
              </Typography>
            ) : (
              <>
                {mode === 'edit' && task.editRecurrence && (
                  <Alert severity="info" sx={{ mb: 2 }}>
                    Editing recurrence will update all future associated tasks.
                  </Alert>
                )}
                <FormLabel component="legend" sx={{ mb: 1 }}>Repeat on:</FormLabel>
                <FormGroup row>
                  <FormControlLabel
                    control={<MuiCheckbox checked={task.recurringDays[0]} onChange={() => handleRecurringDayChange(0)} />}
                    label="Sun"
                  />
                  <FormControlLabel
                    control={<MuiCheckbox checked={task.recurringDays[1]} onChange={() => handleRecurringDayChange(1)} />}
                    label="Mon"
                  />
                  <FormControlLabel
                    control={<MuiCheckbox checked={task.recurringDays[2]} onChange={() => handleRecurringDayChange(2)} />}
                    label="Tue"
                  />
                  <FormControlLabel
                    control={<MuiCheckbox checked={task.recurringDays[3]} onChange={() => handleRecurringDayChange(3)} />}
                    label="Wed"
                  />
                  <FormControlLabel
                    control={<MuiCheckbox checked={task.recurringDays[4]} onChange={() => handleRecurringDayChange(4)} />}
                    label="Thu"
                  />
                  <FormControlLabel
                    control={<MuiCheckbox checked={task.recurringDays[5]} onChange={() => handleRecurringDayChange(5)} />}
                    label="Fri"
                  />
                  <FormControlLabel
                    control={<MuiCheckbox checked={task.recurringDays[6]} onChange={() => handleRecurringDayChange(6)} />}
                    label="Sat"
                  />
                </FormGroup>
              </>
            )}
          </Box>
        ) : null}
      </DialogContent>
      
      <DialogActions sx={{ pb: 3, px: 3, justifyContent: 'center' }}>
        <Button 
          onClick={onClose} 
          variant="outlined"
          sx={{ borderRadius: '20px', px: 3 }}
        >
          Cancel
        </Button>
        <Button 
          onClick={handleSubmit}
          variant="contained"
          sx={{ 
            borderRadius: '20px', 
            px: 3,
            ml: 2
          }}
        >
          {mode === 'add' ? 'Add Task' : 'Save Changes'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm; 
import React, { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogTitle, 
  DialogContent, 
  DialogActions,
  TextField,
  Button,
  Box,
  FormLabel,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Typography,
  Alert
} from '@mui/material';
import { format } from 'date-fns';

const ActivityForm = ({ 
  open, 
  onClose, 
  onSubmit, 
  initialActivity = null,
  mode = 'edit' // 'edit' or 'add'
}) => {
  const [activity, setActivity] = useState({
    title: '',
    description: '',
    cron: '',
    dueTime: '',
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
    if (mode === 'edit' && initialActivity) {
      const cronParts = initialActivity.cron ? initialActivity.cron.split(' ') : [];
      const time = cronParts.length >= 2 ? `${cronParts[1]}:${cronParts[0]}` : '';
      setActivity({
        title: initialActivity.title,
        description: initialActivity.description || '',
        cron: initialActivity.cron || '',
        dueTime: time,
        recurringDays: parseCronToDays(initialActivity.cron)
      });
    } else if (mode === 'add') {
      setActivity({
        title: '',
        description: '',
        cron: '',
        dueTime: '',
        recurringDays: {
          0: false, 1: false, 2: false, 3: false, 4: false, 5: false, 6: false
        }
      });
    }
  }, [mode, initialActivity]);

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
    setActivity({
      ...activity,
      recurringDays: {
        ...activity.recurringDays,
        [day]: !activity.recurringDays[day]
      }
    });
  };

  const handleSubmit = () => {
    const selectedDays = Object.entries(activity.recurringDays)
      .filter(([_, isSelected]) => isSelected)
      .map(([day]) => parseInt(day));

    if (selectedDays.length === 0) {
      return;
    }

    if (!activity.dueTime) {
      return;
    }

    // Create cron expression using the selected time
    const [hours, minutes] = activity.dueTime.split(':');
    const cronExpression = `${minutes} ${hours} * * ${selectedDays.join(',')}`;

    onSubmit({
      ...activity,
      cron: cronExpression
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
        {mode === 'add' ? 'Add Scheduled Task' : 'Edit Scheduled Task'}
      </DialogTitle>
      
      <DialogContent>
        <TextField
          autoFocus
          margin="dense"
          label="Task Name"
          type="text" 
          fullWidth
          variant="outlined"
          value={activity.title}
          onChange={(e) => setActivity({...activity, title: e.target.value})} 
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
          value={activity.description}
          onChange={(e) => setActivity({...activity, description: e.target.value})} 
          sx={{ mt: 2 }}
        />

        <TextField
          margin="dense"
          label="Time"
          type="time"
          fullWidth
          variant="outlined"
          value={activity.dueTime}
          onChange={(e) => setActivity({...activity, dueTime: e.target.value})}
          InputLabelProps={{ shrink: true }}
          sx={{ mt: 2 }}
        />
        
        <Box sx={{ mt: 2 }}>
          <FormLabel component="legend" sx={{ mb: 1 }}>Repeat on:</FormLabel>
          <FormGroup row>
            <FormControlLabel
              control={<Checkbox checked={activity.recurringDays[0]} onChange={() => handleRecurringDayChange(0)} />}
              label="Sun"
            />
            <FormControlLabel
              control={<Checkbox checked={activity.recurringDays[1]} onChange={() => handleRecurringDayChange(1)} />}
              label="Mon"
            />
            <FormControlLabel
              control={<Checkbox checked={activity.recurringDays[2]} onChange={() => handleRecurringDayChange(2)} />}
              label="Tue"
            />
            <FormControlLabel
              control={<Checkbox checked={activity.recurringDays[3]} onChange={() => handleRecurringDayChange(3)} />}
              label="Wed"
            />
            <FormControlLabel
              control={<Checkbox checked={activity.recurringDays[4]} onChange={() => handleRecurringDayChange(4)} />}
              label="Thu"
            />
            <FormControlLabel
              control={<Checkbox checked={activity.recurringDays[5]} onChange={() => handleRecurringDayChange(5)} />}
              label="Fri"
            />
            <FormControlLabel
              control={<Checkbox checked={activity.recurringDays[6]} onChange={() => handleRecurringDayChange(6)} />}
              label="Sat"
            />
          </FormGroup>
        </Box>
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

export default ActivityForm; 
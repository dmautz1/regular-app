import React, { useState, useEffect } from 'react';
import { useAuthHeader, useAuthUser } from 'react-auth-kit'
import {
  Box,
  TextField,
  Button, 
  Paper,
  Typography,
  Stack,
  Select,
  MenuItem,
  IconButton,
  FormControl,
  InputLabel
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import CloseIcon from '@mui/icons-material/Close';
import { useApi } from '../../utils/api.js';

const ActivitiesForm = () => {
  const authHeader = useAuthHeader();
  const authUser = useAuthUser();
  const api = useApi();
  const [programs, setPrograms] = useState([]);
  const [program, setProgram] = useState({
    id: null,
    activities: []
  });

  useEffect(() => {
    getPrograms();
  }, []);

  const getPrograms = async () => {
    try {
      const data = await api.get('/programs');
      setPrograms(data);
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  const handleChange = async (event) => {
    try {
      const data = await api.get(`/programs/${event.target.value}`);
      setProgram({id: data._id, activities: data.activities});
    } catch (err) {
      console.log("Error: ", err);
    }
  };

  const addActivity = () => {
    const newActivity = {
      _id: null,
      title: '',
      description: '',
      cron: '',
    };
    setProgram({
      ...program,
      activities: [...program.activities, newActivity],
    });
  };

  const handleActivityChange = (index, e) => {
    const { name, value } = e.target;
    const updatedActivities = [...program.activities];
    updatedActivities[index] = {
      ...updatedActivities[index],
      [name]: value,
    };
    setProgram({ ...program, activities: updatedActivities });
  };

  const removeActivity = (index) => {
    const updatedActivities = [...program.activities];
    updatedActivities.splice(index, 1);
    setProgram({ ...program, activities: updatedActivities });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const data = await api.post('/activities/new', {
        programId: program.id,
        activities: program.activities
      });
      console.log(data);
    } catch (err) {
      console.error("Error submitting activities:", err);
    }
  };

  return (
    <Box>
    <FormControl fullWidth>
      <InputLabel>Select Program</InputLabel>
      <Select
        value={program.id}
        onChange={handleChange}
        label="Select Program"
      >
        {programs.map((program, index) => (
          <MenuItem key={index} value={program.id}>{program.title}</MenuItem>
        ))}
      </Select>
    </FormControl>
    <form onSubmit={handleSubmit}>
        <Typography variant="h4" align="center" gutterBottom>
        Program Activities
        </Typography>
        {program.activities.map((activity, index) => (
            <Paper elevation={3} sx={{m:2, p:2}} key={index}>
            <Stack spacing={2}>
                <Typography variant="h6" gutterBottom>
                    <IconButton
                    color="secondary"
                    size="small"
                    onClick={() => removeActivity(index)}
                    >
                    <CloseIcon />
                    </IconButton>
                </Typography>
                <TextField
                    label="Name"
                    name="title"
                    variant="outlined"
                    fullWidth
                    value={activity.title}
                    required
                    onChange={(e) => handleActivityChange(index, e)}
                />
                <TextField
                    label="Description"
                    name="description"
                    variant="outlined"
                    fullWidth
                    multiline
                    rows={4}
                    value={activity.description}
                    onChange={(e) => handleActivityChange(index, e)}
                />
                <TextField
                    label="Cron Schedule"
                    name="cron"
                    variant="outlined"
                    fullWidth
                    value={activity.cron}
                    required
                    onChange={(e) => handleActivityChange(index, e)}
                />
            </Stack>
            </Paper>
        ))}
        <IconButton
            onClick={addActivity}
            color="primary"
            size="small"
            style={{ alignSelf: 'flex-start' }}
        >
            <AddIcon /> Add Activity
        </IconButton>
        <Button type="submit" variant="contained" fullWidth>
            Save
        </Button>
    </form>
    </Box>
  );

};

export { ActivitiesForm };

import React, { useState } from 'react';
import {
  ListItem,
  ListItemText,
  Collapse,
  Typography,
  Box,
  Divider,
  Paper,
  Chip,
  IconButton
} from '@mui/material';
import {
  ExpandMore as ExpandMoreIcon,
  AccessTime as AccessTimeIcon,
  Info as InfoIcon
} from '@mui/icons-material';
import { getTimeFromCron, formatCronToHumanReadable } from '../../utils/cronHelper';

/**
 * Displays a single activity item with expandable details
 */
function ActivityItem({ activity, isLast }) {
  const [expanded, setExpanded] = useState(false);

  const handleToggleExpand = () => {
    setExpanded(!expanded);
  };

  return (
    <>
      <ListItem 
        alignItems="flex-start"
        divider={!isLast && !expanded}
        secondaryAction={
          <IconButton edge="end" onClick={handleToggleExpand}>
            <ExpandMoreIcon 
              sx={{ 
                transform: expanded ? 'rotate(180deg)' : 'rotate(0deg)',
                transition: '0.2s'
              }} 
            />
          </IconButton>
        }
      >
        <ListItemText
          primary={
            <Typography variant="subtitle1" component="div" fontWeight="medium">
              {activity.title}
            </Typography>
          }
          secondary={
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
              <AccessTimeIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: '1rem' }} />
              <Typography variant="body2" color="text.secondary">
                {getTimeFromCron(activity.cron)}
              </Typography>
            </Box>
          }
          onClick={handleToggleExpand}
          sx={{ cursor: 'pointer' }}
        />
      </ListItem>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <Paper variant="outlined" sx={{ mx: 2, my: 1, p: 2, bgcolor: 'background.paper' }}>
          {activity.description ? (
            <Typography variant="body2" paragraph>
              {activity.description}
            </Typography>
          ) : (
            <Typography variant="body2" color="text.secondary" paragraph>
              No description available
            </Typography>
          )}
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Chip 
              icon={<InfoIcon />} 
              label={formatCronToHumanReadable(activity.cron)} 
              variant="outlined" 
              size="small" 
            />
          </Box>
        </Paper>
        {!isLast && <Divider />}
      </Collapse>
    </>
  );
}

export default ActivityItem; 
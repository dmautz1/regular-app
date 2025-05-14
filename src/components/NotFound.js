import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper 
} from '@mui/material';
import { 
  SentimentDissatisfied, 
  Dashboard 
} from '@mui/icons-material';

/**
 * 404 Not Found page component
 * Displays when a user tries to access a route that doesn't exist
 */
function NotFound() {
  const navigate = useNavigate();

  return (
    <Container maxWidth="md">
      <Paper 
        elevation={3} 
        sx={{ 
          p: 5, 
          mt: 10, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center', 
          textAlign: 'center' 
        }}
      >
        <SentimentDissatisfied sx={{ fontSize: 100, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h3" component="h1" gutterBottom>
          404: Page Not Found
        </Typography>
        
        <Typography variant="h6" color="text.secondary" paragraph>
          Oops! The page you're looking for doesn't exist.
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: '80%' }}>
          The page you requested could not be found. It might have been removed,
          renamed, or the URL might be incorrect.
        </Typography>
        
        <Box sx={{ mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<Dashboard />}
            onClick={() => navigate('/')}
          >
            Go to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export { NotFound }; 
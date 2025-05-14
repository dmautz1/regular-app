import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Paper,
  Chip
} from '@mui/material';
import { 
  Construction,
  AccessTime, 
  ArrowBack
} from '@mui/icons-material';

/**
 * Coming Soon page component
 * Used to temporarily replace features that are under development
 */
function ComingSoon() {
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
        <Chip 
          icon={<AccessTime />} 
          label="Coming Soon" 
          color="primary" 
          variant="outlined" 
          sx={{ mb: 2, fontSize: '1rem', px: 2, py: 3 }}
        />
        
        <Construction sx={{ fontSize: 80, color: 'text.secondary', mb: 2 }} />
        
        <Typography variant="h3" component="h1" gutterBottom>
          Creator Platform
        </Typography>
        
        <Typography variant="h6" color="text.secondary" paragraph>
          We're working hard to bring you the Creator Platform!
        </Typography>
        
        <Typography variant="body1" color="text.secondary" paragraph sx={{ maxWidth: '80%' }}>
          Our team is developing exciting new features that will allow you to create 
          and share your own programs. This functionality will be available soon.
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            startIcon={<ArrowBack />}
            onClick={() => navigate('/')}
          >
            Back to Dashboard
          </Button>
        </Box>
      </Paper>
    </Container>
  );
}

export { ComingSoon }; 
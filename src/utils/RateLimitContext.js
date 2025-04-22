import React, { createContext, useState, useContext } from 'react';
import { Snackbar, Alert } from '@mui/material';

// Create context
const RateLimitContext = createContext({
  setRateLimitExceeded: () => {},
  isRateLimited: false
});

/**
 * Provider component that wraps the app and provides rate limit state
 */
export const RateLimitProvider = ({ children }) => {
  const [rateLimitAlert, setRateLimitAlert] = useState(false);

  const setRateLimitExceeded = (isExceeded) => {
    setRateLimitAlert(isExceeded);
  };

  const handleCloseAlert = () => {
    setRateLimitAlert(false);
  };

  return (
    <RateLimitContext.Provider value={{ 
      setRateLimitExceeded, 
      isRateLimited: rateLimitAlert 
    }}>
      {children}
      <Snackbar
        open={rateLimitAlert}
        autoHideDuration={6000}
        onClose={handleCloseAlert}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseAlert}
          severity="warning"
          sx={{
            width: '100%',
            backgroundColor: 'rgba(255, 152, 0, 0.9)',
            color: 'white',
            '& .MuiAlert-icon': { color: 'white' }
          }}
        >
          Rate limit exceeded. Please wait a moment before making more requests.
        </Alert>
      </Snackbar>
    </RateLimitContext.Provider>
  );
};

/**
 * Hook to use the rate limit context
 */
export const useRateLimit = () => {
  const context = useContext(RateLimitContext);
  if (context === undefined) {
    throw new Error('useRateLimit must be used within a RateLimitProvider');
  }
  return context;
}; 
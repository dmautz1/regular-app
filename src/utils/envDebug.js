/**
 * Utility to debug environment variables
 */

export const logEnvironmentVariables = () => {
  console.log('Environment Variables:');
  console.log('NODE_ENV:', process.env.NODE_ENV);
  console.log('REACT_APP_API_URL:', process.env.REACT_APP_API_URL);
  console.log('REACT_APP_RECAPTCHA_SITE_KEY:', process.env.REACT_APP_RECAPTCHA_SITE_KEY);
  
  // Check if env vars are defined
  console.log('Is REACT_APP_RECAPTCHA_SITE_KEY defined:', !!process.env.REACT_APP_RECAPTCHA_SITE_KEY);
  
  // Check if env vars are being loaded from the correct file
  if (process.env.NODE_ENV === 'development') {
    console.log('Development environment should use .env.development');
  } else if (process.env.NODE_ENV === 'production') {
    console.log('Production environment should use .env.production');
  }
};

// Export a debug function to use in browser console
if (typeof window !== 'undefined') {
  window.debugEnv = logEnvironmentVariables;
} 
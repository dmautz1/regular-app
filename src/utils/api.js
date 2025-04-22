import { useState, useCallback } from 'react';
import { useAuthHeader, useSignOut } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';
import { useRateLimit } from './RateLimitContext';

// Base API URL
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

/**
 * Custom hook that provides an API client with authentication and error handling
 * 
 * This hook:
 * 1. Automatically adds auth headers to requests
 * 2. Handles 401 Unauthorized responses by signing out and redirecting to login
 * 3. Provides a simple interface for making API requests
 * 4. Handles CSRF token management
 */
export const useApi = () => {
  const authHeader = useAuthHeader();
  const signOut = useSignOut();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(false);
  const { setRateLimitExceeded } = useRateLimit();
  const [csrfToken, setCsrfToken] = useState(null);
  const [isGettingToken, setIsGettingToken] = useState(false);

  /**
   * Get a new CSRF token from the server
   */
  const getCsrfToken = useCallback(async () => {
    // Prevent multiple simultaneous token requests
    if (isGettingToken) {
      return csrfToken;
    }

    try {
      setIsGettingToken(true);
      const response = await fetch(`${API_BASE_URL}/csrf-token`, {
        credentials: 'include'
      });
      
      if (!response.ok) {
        throw new Error('Failed to get CSRF token');
      }
      
      const data = await response.json();
      setCsrfToken(data.csrfToken);
      return data.csrfToken;
    } catch (error) {
      console.error('Error getting CSRF token:', error);
      throw error;
    } finally {
      setIsGettingToken(false);
    }
  }, [csrfToken, isGettingToken]);

  /**
   * Handle HTTP errors from API responses
   */
  const handleError = useCallback((response) => {
    if (response.status === 401) {
      // Unauthorized: token expired or invalid
      console.log('Session expired. Redirecting to login.');
      signOut();
      navigate('/login', { state: { sessionExpired: true } });
      throw new Error('Your session has expired. Please log in again.');
    }
    
    if (response.status === 429) {
      // Rate limit exceeded
      console.log('Rate limit exceeded');
      setRateLimitExceeded(true);
      throw new Error('Rate limit exceeded. Please try again later.');
    }
    
    if (!response.ok) {
      // Handle other error responses
      return response.json().then(data => {
        throw new Error(data.message || 'Something went wrong');
      });
    }
    
    return response;
  }, [signOut, navigate, setRateLimitExceeded]);

  /**
   * Make a request to the API with the specified method
   */
  const request = useCallback(async (endpoint, method = 'GET', data = null) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    setIsLoading(true);
    
    try {
      // Get CSRF token if needed (for non-GET requests)
      let currentToken = csrfToken;
      if (method !== 'GET' && !currentToken) {
        currentToken = await getCsrfToken();
      }

      const options = {
        method,
        headers: {
          Authorization: authHeader() || '',
        },
        credentials: 'include'
      };

      // Add CSRF token for non-GET requests
      if (method !== 'GET' && currentToken) {
        options.headers['CSRF-Token'] = currentToken;
      }

      // Handle FormData differently from JSON
      if (data) {
        if (data instanceof FormData) {
          // Don't set Content-Type for FormData, let the browser set it with boundary
          options.body = data;
        } else {
          options.headers['Content-Type'] = 'application/json';
          options.body = JSON.stringify(data);
        }
      }

      const response = await fetch(url, options);
      const handledResponse = await handleError(response);
      
      if (method === 'DELETE') {
        return true; // Just return success for DELETE operations
      }
      
      return await handledResponse.json();
    } catch (error) {
      // If CSRF token error, try to get a new token and retry once
      if (error.message.includes('CSRF token')) {
        const newToken = await getCsrfToken();
        // Retry with new token
        const retryOptions = {
          method,
          headers: {
            Authorization: authHeader() || '',
            'CSRF-Token': newToken
          },
          credentials: 'include'
        };
        if (data) {
          if (data instanceof FormData) {
            retryOptions.body = data;
          } else {
            retryOptions.headers['Content-Type'] = 'application/json';
            retryOptions.body = JSON.stringify(data);
          }
        }
        const retryResponse = await fetch(url, retryOptions);
        const handledRetryResponse = await handleError(retryResponse);
        return await handledRetryResponse.json();
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authHeader, handleError, csrfToken, getCsrfToken]);

  /**
   * Specialized request methods for different HTTP methods
   */
  const get = useCallback((endpoint) => request(endpoint, 'GET'), [request]);
  
  const post = useCallback((endpoint, data) => request(endpoint, 'POST', data), [request]);
  
  const put = useCallback((endpoint, data) => request(endpoint, 'PUT', data), [request]);
  
  const patch = useCallback((endpoint, data) => request(endpoint, 'PATCH', data), [request]);
  
  const del = useCallback((endpoint) => request(endpoint, 'DELETE'), [request]);

  /**
   * Upload a file with optional JSON data
   */
  const upload = useCallback(async (endpoint, formData) => {
    const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
    
    setIsLoading(true);
    
    try {
      // Get CSRF token if needed
      let currentToken = csrfToken;
      if (!currentToken) {
        currentToken = await getCsrfToken();
      }

      const options = {
        method: 'POST',
        headers: {
          Authorization: authHeader() || '',
        },
        credentials: 'include',
        body: formData,
      };

      // Add CSRF token
      if (currentToken) {
        options.headers['CSRF-Token'] = currentToken;
      }

      const response = await fetch(url, options);
      const handledResponse = await handleError(response);
      
      return await handledResponse.json();
    } catch (error) {
      // If CSRF token error, try to get a new token and retry once
      if (error.message.includes('CSRF token')) {
        const newToken = await getCsrfToken();
        // Retry with new token
        const retryOptions = {
          method: 'POST',
          headers: {
            Authorization: authHeader() || '',
            'CSRF-Token': newToken
          },
          credentials: 'include',
          body: formData
        };
        const retryResponse = await fetch(url, retryOptions);
        const handledRetryResponse = await handleError(retryResponse);
        return await handledRetryResponse.json();
      }
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [authHeader, handleError, csrfToken, getCsrfToken]);

  return {
    get,
    post,
    put,
    patch,
    delete: del,
    upload,
    isLoading
  };
}; 
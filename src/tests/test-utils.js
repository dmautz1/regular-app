import React from 'react';
import { render } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from 'react-auth-kit';

/**
 * Custom render function that includes providers
 * @param {React.ReactElement} ui - Component to render
 * @param {Object} options - Render options
 * @returns {Object} Rendered components with test utilities
 */
export function renderWithProviders(ui, options = {}) {
  const Wrapper = ({ children }) => {
    return (
      <AuthProvider 
        authType={'cookie'} 
        authName={'_auth'} 
        cookieDomain={window.location.hostname}
        cookieSecure={window.location.protocol === "http:"}
      >
        <BrowserRouter>
          {children}
        </BrowserRouter>
      </AuthProvider>
    );
  };

  return render(ui, { wrapper: Wrapper, ...options });
}

/**
 * Creates a mock for fetch with success response
 * @param {*} data - Response data
 * @returns {Function} Mock implementation
 */
export function mockFetchSuccess(data) {
  return jest.fn().mockImplementation(() => 
    Promise.resolve({
      ok: true,
      json: () => Promise.resolve(data)
    })
  );
}

/**
 * Creates a mock for fetch with error response
 * @param {string} error - Error message
 * @returns {Function} Mock implementation
 */
export function mockFetchError(error) {
  return jest.fn().mockImplementation(() =>
    Promise.resolve({
      ok: false,
      status: 400,
      json: () => Promise.resolve({ message: error })
    })
  );
}

/**
 * Mock data for tasks
 */
export const mockTasks = [
  {
    _id: 'task1',
    title: 'Test Task 1',
    complete: false,
    dueDate: new Date().toISOString().split('T')[0],
    user: 'user1'
  },
  {
    _id: 'task2',
    title: 'Test Task 2',
    complete: true,
    dueDate: new Date().toISOString().split('T')[0],
    user: 'user1'
  }
]; 
import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import ResetPassword from './index';
import { useApi } from '../../utils/api';
import { useNavigate, useParams } from 'react-router-dom';

// Mock the hooks
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn(),
  useParams: jest.fn()
}));

jest.mock('../../utils/api', () => ({
  useApi: jest.fn()
}));

describe('ResetPassword Component', () => {
  // Setup common mocks
  const mockNavigate = jest.fn();
  const mockPost = jest.fn();
  
  beforeEach(() => {
    // Reset mocks
    jest.clearAllMocks();
    
    // Setup fake timers
    jest.useFakeTimers();
    
    // Setup default mocks
    useNavigate.mockReturnValue(mockNavigate);
    useParams.mockReturnValue({ token: 'valid-token' });
    useApi.mockReturnValue({
      post: mockPost
    });
  });
  
  afterEach(() => {
    // Clean up fake timers
    jest.useRealTimers();
  });
  
  test('renders reset password form', () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    expect(screen.getByText('Reset Your Password')).toBeInTheDocument();
    expect(screen.getByLabelText(/New Password/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Confirm New Password/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
  });
  
  test('validates password length', async () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    // Enter a short password
    const passwordInput = screen.getByLabelText(/New Password/i);
    fireEvent.change(passwordInput, { target: { value: 'short' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/Password must be at least 8 characters/i)).toBeInTheDocument();
    });
    
    // API should not be called
    expect(mockPost).not.toHaveBeenCalled();
  });
  
  test('validates password match', async () => {
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    // Enter different passwords
    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    
    fireEvent.change(passwordInput, { target: { value: 'password123' } });
    fireEvent.change(confirmInput, { target: { value: 'password456' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/Passwords do not match/i)).toBeInTheDocument();
    });
    
    // API should not be called
    expect(mockPost).not.toHaveBeenCalled();
  });
  
  test('submits form with valid data', async () => {
    // Mock successful API response
    mockPost.mockResolvedValueOnce({ success: true });
    
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    // Enter matching passwords
    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    
    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'ValidPassword123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);
    
    // Check that API was called with correct data
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/reset-password', {
        token: 'valid-token',
        password: 'ValidPassword123'
      });
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/Password reset successful/i)).toBeInTheDocument();
    });
    
    // Should redirect after timeout
    jest.advanceTimersByTime(3000);
    expect(mockNavigate).toHaveBeenCalledWith('/login', { 
      state: { passwordResetSuccess: true }, 
      replace: true 
    });
  });
  
  test('handles API errors', async () => {
    // Mock API error
    mockPost.mockRejectedValueOnce({ message: 'Invalid or expired token' });
    
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    // Enter valid passwords
    const passwordInput = screen.getByLabelText(/New Password/i);
    const confirmInput = screen.getByLabelText(/Confirm New Password/i);
    
    fireEvent.change(passwordInput, { target: { value: 'ValidPassword123' } });
    fireEvent.change(confirmInput, { target: { value: 'ValidPassword123' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });
    fireEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Invalid or expired token/i)).toBeInTheDocument();
    });
    
    // Should not redirect
    expect(mockNavigate).not.toHaveBeenCalled();
  });
  
  test('redirects if no token provided', () => {
    // Mock no token in URL
    useParams.mockReturnValueOnce({ token: undefined });
    
    render(
      <BrowserRouter>
        <ResetPassword />
      </BrowserRouter>
    );
    
    // Should redirect to home
    expect(mockNavigate).toHaveBeenCalledWith('/');
  });
}); 
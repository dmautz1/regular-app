import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ForgotPasswordDialog from './forgot-password';
import { useApi } from '../../utils/api';

// Mock the API hook
jest.mock('../../utils/api', () => ({
  useApi: jest.fn()
}));

describe('ForgotPasswordDialog Component', () => {
  const mockOnClose = jest.fn();
  const mockPost = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    useApi.mockReturnValue({
      post: mockPost
    });
  });
  
  test('renders the dialog when open', () => {
    render(<ForgotPasswordDialog open={true} onClose={mockOnClose} />);
    
    expect(screen.getByText('Forgot Your Password?')).toBeInTheDocument();
    expect(screen.getByLabelText(/Email Address/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Send Reset Link/i })).toBeInTheDocument();
  });
  
  test('does not render the dialog when closed', () => {
    render(<ForgotPasswordDialog open={false} onClose={mockOnClose} />);
    
    expect(screen.queryByText('Forgot Your Password?')).not.toBeInTheDocument();
  });
  
  test('validates email input', async () => {
    render(<ForgotPasswordDialog open={true} onClose={mockOnClose} />);
    
    // Try to submit without email
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitButton);
    
    // Check for validation error
    await waitFor(() => {
      expect(screen.getByText(/Please enter your email address/i)).toBeInTheDocument();
    });
    
    // API should not be called
    expect(mockPost).not.toHaveBeenCalled();
  });
  
  test('submits form with valid email', async () => {
    // Mock successful API response
    mockPost.mockResolvedValueOnce({ success: true });
    
    render(<ForgotPasswordDialog open={true} onClose={mockOnClose} />);
    
    // Enter email
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitButton);
    
    // Check that API was called with correct data
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/request-password-reset', { 
        email: 'test@example.com' 
      });
    });
    
    // Check for success message
    await waitFor(() => {
      expect(screen.getByText(/a password reset link has been sent/i)).toBeInTheDocument();
    });
  });
  
  test('handles API errors', async () => {
    // Mock API error
    mockPost.mockRejectedValueOnce({ message: 'Failed to send reset email' });
    
    render(<ForgotPasswordDialog open={true} onClose={mockOnClose} />);
    
    // Enter email
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    fireEvent.click(submitButton);
    
    // Check for error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to send reset email/i)).toBeInTheDocument();
    });
  });
  
  test('closes dialog with Close button', () => {
    render(<ForgotPasswordDialog open={true} onClose={mockOnClose} />);
    
    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);
    
    expect(mockOnClose).toHaveBeenCalled();
  });
  
  test('resets form state when closed', () => {
    const { rerender } = render(<ForgotPasswordDialog open={true} onClose={mockOnClose} />);
    
    // Enter email
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    
    // Close dialog
    rerender(<ForgotPasswordDialog open={false} onClose={mockOnClose} />);
    
    // Reopen dialog
    rerender(<ForgotPasswordDialog open={true} onClose={mockOnClose} />);
    
    // Email field should be reset
    expect(screen.getByLabelText(/Email Address/i).value).toBe('');
  });
}); 
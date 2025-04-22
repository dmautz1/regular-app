import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import Settings from './index';
import { useApi } from '../../utils/api';
import { useAuthUser, useSignOut } from 'react-auth-kit';
import { useNavigate } from 'react-router-dom';
import { RouterBottomNavigation } from "../navigation/nav";

// Mock the necessary hooks and components
jest.mock('../../utils/api', () => ({
  useApi: jest.fn()
}));

jest.mock('react-auth-kit', () => ({
  useAuthUser: jest.fn(),
  useSignOut: jest.fn()
}));

jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: jest.fn()
}));

jest.mock('../navigation/nav', () => ({
  RouterBottomNavigation: jest.fn().mockReturnValue(<div data-testid="nav" />)
}));

describe('Settings Component', () => {
  // Common mocks
  const mockNavigate = jest.fn();
  const mockSignOut = jest.fn();
  const mockGet = jest.fn();
  const mockPost = jest.fn();
  const mockPut = jest.fn();
  const mockUpload = jest.fn();
  
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Configure default mocks
    useNavigate.mockReturnValue(mockNavigate);
    useSignOut.mockReturnValue(mockSignOut);
    useAuthUser.mockReturnValue(() => ({ id: 'user123' }));
    
    useApi.mockReturnValue({
      get: mockGet,
      post: mockPost,
      put: mockPut,
      upload: mockUpload,
      isLoading: false
    });
    
    // Mock API responses
    mockGet.mockResolvedValue({
      _id: 'user123',
      name: 'Test User',
      email: 'test@example.com',
      bio: 'This is a test bio',
      avatarUrl: null
    });
  });
  
  test('renders the settings page', async () => {
    render(<Settings />);
    
    // Verify core elements rendered
    expect(screen.getByText('Settings')).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Account Settings')).toBeInTheDocument();
    
    // Wait for user data to load
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalledWith('/users/user123');
    });
  });
  
  test('requesting password reset', async () => {
    // Mock successful response
    mockPost.mockResolvedValueOnce({ success: true });
    
    render(<Settings />);
    
    // Wait for user data to load
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });
    
    // Find and click the reset password button
    const resetButton = screen.getByText('Reset Password');
    fireEvent.click(resetButton);
    
    // Verify the API was called
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/request-password-reset', {
        email: 'test@example.com'
      });
    });
    
    // Should show success message
    await waitFor(() => {
      expect(screen.getByText(/Password reset link has been sent to your email/i)).toBeInTheDocument();
    });
  });
  
  test('handles password reset error', async () => {
    // Mock error response
    mockPost.mockRejectedValueOnce({ message: 'Failed to request password reset' });
    
    render(<Settings />);
    
    // Wait for user data to load
    await waitFor(() => {
      expect(mockGet).toHaveBeenCalled();
    });
    
    // Find and click the reset password button
    const resetButton = screen.getByText('Reset Password');
    fireEvent.click(resetButton);
    
    // Verify the API was called
    await waitFor(() => {
      expect(mockPost).toHaveBeenCalledWith('/auth/request-password-reset', {
        email: 'test@example.com'
      });
    });
    
    // Should show error message
    await waitFor(() => {
      expect(screen.getByText(/Failed to request password reset/i)).toBeInTheDocument();
    });
  });
  
  test('sign out functionality', async () => {
    render(<Settings />);
    
    // Find and click the logout button
    const logoutButton = screen.getByText('Logout');
    fireEvent.click(logoutButton);
    
    // Verify functions were called
    expect(mockSignOut).toHaveBeenCalled();
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
}); 
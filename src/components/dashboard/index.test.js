import React from 'react';
import { screen, fireEvent } from '@testing-library/react';
import { renderWithProviders } from '../../tests/test-utils';
import { Dashboard } from './index';
import { useSignOut, useNavigate } from 'react-auth-kit';

// Mock the navigation and auth hooks
jest.mock('react-auth-kit', () => ({
  ...jest.requireActual('react-auth-kit'),
  useSignOut: jest.fn(),
  useNavigate: jest.fn()
}));

describe('Dashboard Component', () => {
  beforeEach(() => {
    // Setup mocks
    const mockSignOut = jest.fn();
    useSignOut.mockReturnValue(mockSignOut);
  });

  it('renders without crashing', () => {
    renderWithProviders(<Dashboard />);
    
    // Check that the title is rendered
    expect(screen.getByText('Daily Task App')).toBeInTheDocument();
    
    // Check that the logout button is rendered
    expect(screen.getByText('Logout')).toBeInTheDocument();
  });

  it('handles logout correctly', () => {
    const mockSignOut = jest.fn();
    const mockNavigate = jest.fn();
    
    useSignOut.mockReturnValue(mockSignOut);
    useNavigate.mockReturnValue(mockNavigate);
    
    renderWithProviders(<Dashboard />);
    
    // Click the logout button
    fireEvent.click(screen.getByText('Logout'));
    
    // Verify that signOut was called
    expect(mockSignOut).toHaveBeenCalled();
    
    // Verify that navigate was called with the correct route
    expect(mockNavigate).toHaveBeenCalledWith('/login');
  });
}); 
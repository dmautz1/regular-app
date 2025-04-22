// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock the AuthProvider context
jest.mock('react-auth-kit', () => ({
  useAuthHeader: jest.fn().mockReturnValue('Bearer test-token'),
  useAuthUser: jest.fn().mockReturnValue({ id: 'test-user-id' }),
  useSignOut: jest.fn().mockReturnValue(jest.fn()),
  useIsAuthenticated: jest.fn().mockReturnValue(true),
  AuthProvider: ({ children }) => children,
  RequireAuth: ({ children }) => children,
}));

// Mock navigation
jest.mock('react-router-dom', () => ({
  ...jest.requireActual('react-router-dom'),
  useNavigate: () => jest.fn(),
  useParams: () => ({ id: 'test-id' }),
}));

// Reset all mocks after each test
afterEach(() => {
  jest.clearAllMocks();
}); 
import React, { useEffect } from "react";
import "./index.css";
import styled from "styled-components";
import { Route, Routes } from "react-router-dom";
import Login from "./components/login/login";
import Register from "./components/register/register";
import Dashboard from "./components/dashboard";
import { Tasks } from "./components/tasks";
import { Programs } from "./components/programs";
import { ProgramNew } from "./components/programs/new";
import { ProgramEdit } from "./components/programs/edit";
import { ActivitiesForm } from "./components/programs/activities";
import Settings from "./components/settings";
import ResetPassword from "./components/reset-password";
import { NotFound } from './components/NotFound';
import { ComingSoon } from './components/ComingSoon';
import Redirect from './components/Redirect';
import ProtectedRoute from "./components/shared/ProtectedRoute";
import PublicRoute from "./components/shared/PublicRoute";
import { useIsAuthenticated, useAuthUser } from 'react-auth-kit';
import { debugAuth } from "./utils/debugAuth";
import { logEnvironmentVariables } from "./utils/envDebug";
import { RateLimitProvider } from "./utils/RateLimitContext";

const AppContainer = styled.div`
  width: 100%;
  height: 100%;
`;

function App() {
  const isAuthenticated = useIsAuthenticated();
  const auth = useAuthUser();
  
  // Log authentication state on app mount
  useEffect(() => {
    console.log('App mounted - Authentication check:', { 
      isAuthenticated: isAuthenticated(), 
      hasAuth: !!auth()
    });
    
    // Run debug utilities
    debugAuth();
    logEnvironmentVariables();
  }, [isAuthenticated, auth]);

  return (
    <RateLimitProvider>
      <AppContainer>
        <Routes>
          {/* Public routes - redirect to home if already authenticated */}
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          
          <Route path="/signup" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          
          <Route path="/reset-password" element={
            <PublicRoute>
              <ResetPassword />
            </PublicRoute>
          } />
          
          {/* Root path - redirect to login or home based on auth status */}
          <Route path="/" element={<Redirect />} />
          
          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          
          <Route path="/tasks" element={
            <ProtectedRoute>
              <Tasks />
            </ProtectedRoute>
          } />
          
          <Route path="/programs" element={
            <ProtectedRoute>
              <Programs />
            </ProtectedRoute>
          } />
          
          <Route path="/programs/new" element={
            <ProtectedRoute>
              <ProgramNew />
            </ProtectedRoute>
          } />
          
          <Route path="/programs/:id/edit" element={
            <ProtectedRoute>
              <ProgramEdit />
            </ProtectedRoute>
          } />
          
          <Route path="/programs/activities" element={
            <ProtectedRoute>
              <ActivitiesForm />
            </ProtectedRoute>
          } />
          
          <Route path="/settings" element={
            <ProtectedRoute>
              <Settings />
            </ProtectedRoute>
          } />
          
          {/* Creator Routes - Temporarily disabled with ComingSoon */}
          <Route path="/creator/*" element={
            <ProtectedRoute>
              <ComingSoon />
            </ProtectedRoute>
          } />
          
          {/* 404 route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppContainer>
    </RateLimitProvider>
  );
}

export default App;

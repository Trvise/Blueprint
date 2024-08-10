import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';

function ProtectedRoute({ children }) {
    const { userLoggedIn } = useAuth();

    return userLoggedIn ? children : <Navigate to="/login" />;
}

export { ProtectedRoute };
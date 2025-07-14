import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/authContext';
import Login from '../AuthComponents/Login';
import MyProjects from '../pages/MyProjects';

function ProtectedRoute({ children }) {
    const { userLoggedIn } = useAuth();

    return userLoggedIn ? children : <Navigate to="/login" />;
}

function ProtectedLogin() {
    const { userLoggedIn } = useAuth();

    return userLoggedIn ? <MyProjects />: <Login />;
}

export { ProtectedRoute, ProtectedLogin};
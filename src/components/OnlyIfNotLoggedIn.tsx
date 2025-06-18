import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function OnlyIfNotLoggedIn({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    return user ? <Navigate to="/" replace /> : <>{children}</>;
}

export function OnlyIfLoggedIn({ children }: { children: React.ReactNode }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div>Loading...</div>;
    }

    return user ? <>{children}</> : <Navigate to="/Authenticacion/Login" replace />;
}

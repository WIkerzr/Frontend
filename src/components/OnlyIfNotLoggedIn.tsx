import React from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export function OnlyIfNotLoggedIn({ children }: { children: React.ReactNode }) {
    const { user } = useAuth();
    return user ? <Navigate to="/" replace /> : <>{children}</>;
}

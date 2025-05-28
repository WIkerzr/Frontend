import { PropsWithChildren } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children }: PropsWithChildren) => {
    const { user, loading } = useAuth();
    if (loading) return <div>Cargando...</div>;
    return user ? children : <Navigate to="/Authenticacion/Login" replace />;
};

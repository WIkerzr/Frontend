import React from 'react';
import { useSelector } from 'react-redux';
import { Navigate, Outlet } from 'react-router-dom';
import { IRootState } from '../store';

const ProtectedRoute: React.FC = () => {
    const user = useSelector((state: IRootState) => state.auth.user);

    if (!user) {
        return <Navigate to="/Authenticacion/Login" replace />;
    }

    return <Outlet />;
};

export default ProtectedRoute;

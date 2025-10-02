/* eslint-disable no-unused-vars */
import { createContext, useContext, useEffect, useState } from 'react';
import { UserID, UserRole } from '../types/users';
import { ModoDevEdicionTotal } from '../components/Utils/data/controlDev';
import { useAuth } from './AuthContext';

interface UserContextType {
    user: UserID | null;
    setUser: (user: UserID | null) => void;
    rol: UserRole;
    recordarSesion: boolean;
    setRecordarSesion: (value: boolean) => void;
    lockedHazi: boolean;
}

const defaultUser = (): UserID | null => {
    try {
        const stored = sessionStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Error al leer usuario de sessionStorage', error);
        return null;
    }
};

const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => {},
    rol: 'GOBIERNOVASCO',
    recordarSesion: false,
    setRecordarSesion: () => {},
    lockedHazi: false,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUserState] = useState<UserID | null>(defaultUser());
    const [rol, setRol] = useState<UserRole>('GOBIERNOVASCO');
    const [recordarSesion, setRecordarSesion] = useState<boolean>(true);
    const { login } = useAuth();

    const setUser = (newUser: UserID | null) => {
        setUserState(newUser);
        if (newUser) {
            sessionStorage.setItem('user', JSON.stringify(newUser));
        } else {
            sessionStorage.removeItem('user');
        }
    };
    useEffect(() => {
        const token = sessionStorage.getItem('access_token');
        if (!token) return;
        const rolUsuario = user!.role as string;
        setRol(rolUsuario.toUpperCase() as UserRole);
    }, [login]);

    const lockedHazi = ModoDevEdicionTotal ? false : !!(user && user.role !== 'ADR');

    return <UserContext.Provider value={{ user, setUser, rol, recordarSesion, setRecordarSesion, lockedHazi }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);

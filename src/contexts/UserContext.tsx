/* eslint-disable no-unused-vars */
import { createContext, useContext, useState } from 'react';
import { UserID } from '../types/users';
import { ModoDevEdicionTotal } from '../components/Utils/data/controlDev';

interface UserContextType {
    user: UserID | null;
    setUser: (user: UserID | null) => void;
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
    recordarSesion: false,
    setRecordarSesion: () => {},
    lockedHazi: false,
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUserState] = useState<UserID | null>(defaultUser());
    const [recordarSesion, setRecordarSesion] = useState<boolean>(true);

    const setUser = (newUser: UserID | null) => {
        setUserState(newUser);
        if (newUser) {
            sessionStorage.setItem('user', JSON.stringify(newUser));
        } else {
            sessionStorage.removeItem('user');
        }
    };
    const lockedHazi = ModoDevEdicionTotal ? false : !!(user && user.role !== 'ADR');

    return <UserContext.Provider value={{ user, setUser, recordarSesion, setRecordarSesion, lockedHazi }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);

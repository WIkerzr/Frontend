/* eslint-disable no-unused-vars */
import { createContext, useContext, useState } from 'react';
import { UserID } from '../types/users';

interface UserContextType {
    user: UserID | null;
    setUser: (user: UserID | null) => void;
    recordarSesion: boolean;
    setRecordarSesion: (value: boolean) => void;
}

const defaultUser = (): UserID | null => {
    try {
        const stored = localStorage.getItem('user');
        return stored ? JSON.parse(stored) : null;
    } catch (error) {
        console.error('Error al leer usuario de localStorage', error);
        return null;
    }
};

const UserContext = createContext<UserContextType>({
    user: null,
    setUser: () => {},
    recordarSesion: false,
    setRecordarSesion: () => {},
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUserState] = useState<UserID | null>(defaultUser());
    const [recordarSesion, setRecordarSesion] = useState<boolean>(true);

    const setUser = (newUser: UserID | null) => {
        setUserState(newUser);
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('user');
        }
    };

    return <UserContext.Provider value={{ user, setUser, recordarSesion, setRecordarSesion }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);

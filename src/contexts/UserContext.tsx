import { createContext, useContext, useState } from 'react';

export interface InterfaceUser {
    name: string;
    email: string;
    role: string;
}

interface UserContextType {
    user: InterfaceUser | null;
    setUser: (user: InterfaceUser | null) => void;
}

const defaultUser = (): InterfaceUser | null => {
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
});

export const UserProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUserState] = useState<InterfaceUser | null>(defaultUser());

    const setUser = (newUser: InterfaceUser | null) => {
        setUserState(newUser);
        if (newUser) {
            localStorage.setItem('user', JSON.stringify(newUser));
        } else {
            localStorage.removeItem('user');
        }
    };

    return <UserContext.Provider value={{ user, setUser }}>{children}</UserContext.Provider>;
};

export const useUser = () => useContext(UserContext);

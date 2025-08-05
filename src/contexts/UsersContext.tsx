/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useRegionContext } from './RegionContext';
import { useTranslation } from 'react-i18next';
import { ApiTarget } from '../components/Utils/gets/controlDev';
import { actualizarFechaLLamada, FetchConRefreshRetry, formateaConCeroDelante, obtenerFechaLlamada } from '../components/Utils/utils';
import { UserIDList, UserRegionId } from '../types/users';

interface UsersContextType {
    users: UserIDList[];
    setUsers: React.Dispatch<React.SetStateAction<UserIDList[]>>;
    loading: boolean;
    error: string | null;
    fechaUltimoActualizadoBBDD: Date;
    agregarUsuario: (nuevo: UserIDList) => void;
    listadoUsuarios: (dataArray: UserIDList[]) => void;
    actualizarUsuario: (usuarioActualizado: UserIDList) => void;
    llamadaBBDDUsers: (primeraLLamada?: boolean) => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
    const { regiones } = useRegionContext();
    const { t, i18n } = useTranslation();

    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fechaUltimoActualizadoBBDD, setFechaUltimoActualizadoBBDD] = useState<Date>(() => {
        const fechaStr = obtenerFechaLlamada('users');
        return fechaStr ? new Date(fechaStr) : new Date();
    });

    const [users, setUsers] = useState<UserIDList[]>([]);

    useEffect(() => {
        const saved = localStorage.getItem('users');
        setUsers(saved ? JSON.parse(saved) : []);
    }, []);

    useEffect(() => {
        actualizarFechaLLamada('users');
    }, [fechaUltimoActualizadoBBDD]);

    const actualizarUsers = (nuevoUsers: UserIDList[]) => {
        nuevoUsers.forEach((user) => {
            if (user.role === 'ADR') {
                if (!user.RegionName?.trim()) {
                    const region = regiones.find((r) => `${r.RegionId}` === formateaConCeroDelante(user.RegionId as string | number));
                    if (region) {
                        user.RegionName = i18n.language === 'es' ? region.NameEs : region.NameEu;
                    } else {
                        user.RegionName = 'Desconocido';
                        console.error(`Usuario con ID ${user.id} no tiene RegionName ni coincidencia en regiones.`);
                    }
                }
            }
        });
        localStorage.setItem('users', JSON.stringify(nuevoUsers));
        setUsers(nuevoUsers);
    };

    const agregarUsuario = (nuevo: UserIDList) => {
        setUsers((prevUsers) => {
            const nuevaLista = [...prevUsers, nuevo];
            localStorage.setItem('users', JSON.stringify(nuevaLista));
            return nuevaLista;
        });
    };

    const listadoUsuarios = (dataArray: UserIDList[]) => actualizarUsers(dataArray);

    const actualizarUsuario = (usuarioActualizado: UserIDList) => {
        actualizarUsers(users.map((u) => (u.id === usuarioActualizado.id ? usuarioActualizado : u)));
    };

    const llamadaBBDDUsers = (primeraLLamada?: boolean) => {
        const storedUsers = localStorage.getItem('users');

        if (!primeraLLamada || !storedUsers) {
            const token = sessionStorage.getItem('access_token');
            setLoading(true);
            const fetchUsers = async () => {
                try {
                    const res = await FetchConRefreshRetry(`${ApiTarget}/users`, {
                        headers: {
                            Authorization: `Bearer ` + token,
                            'Content-Type': 'application/json',
                        },
                    });
                    const data = await res.json();
                    if (!res.ok) throw new Error(data.message || t('errorObtenerUsuarios') + `: ${data.Message}`);

                    const usuariosConRegion = data.map((user: UserRegionId) => {
                        const region = regiones.find((r) => `${r.RegionId}` === `${user.RegionId}`.padStart(2, '0'));

                        return {
                            ...user,
                            RegionName: region ? (i18n.language === 'es' ? region.NameEs : region.NameEu) : '-',
                        };
                    });

                    setFechaUltimoActualizadoBBDD(new Date());
                    const dataArray: UserIDList[] = Array.isArray(usuariosConRegion) ? usuariosConRegion : Object.values(usuariosConRegion);
                    listadoUsuarios(dataArray);
                    localStorage.setItem('users', JSON.stringify(dataArray));
                } catch (err: unknown) {
                    if (err instanceof Error) {
                        setError(err.message);
                    } else {
                        console.error('Error desconocido', err);
                    }
                } finally {
                    setLoading(false);
                }
            };
            fetchUsers();
        }
    };

    return (
        <UsersContext.Provider
            value={{
                users,
                setUsers,
                loading,
                error,
                fechaUltimoActualizadoBBDD,
                agregarUsuario,
                listadoUsuarios,
                actualizarUsuario,
                llamadaBBDDUsers,
            }}
        >
            {children}
        </UsersContext.Provider>
    );
};

export const useUsers = (): UsersContextType => {
    const context = useContext(UsersContext);
    if (!context) {
        throw new Error('useUsers debe usarse dentro de un UsersProvider');
    }
    return context;
};

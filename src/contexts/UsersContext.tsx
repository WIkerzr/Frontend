/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiTarget } from '../components/Utils/data/controlDev';
import { actualizarFechaLLamada, FetchConRefreshRetry, formateaConCeroDelante, gestionarErrorServidor, obtenerFechaLlamada } from '../components/Utils/utils';
import { UserIDList, UserRegionId } from '../types/users';
import { RegionInterface } from '../components/Utils/data/getRegiones';

interface UsersContextType {
    users: UserIDList[];
    setUsers: React.Dispatch<React.SetStateAction<UserIDList[]>>;
    loading: boolean;
    fechaUltimoActualizadoBBDD: Date;
    agregarUsuario: (nuevo: UserIDList) => void;
    listadoUsuarios: (dataArray: UserIDList[]) => void;
    actualizarUsuario: (usuarioActualizado: UserIDList) => void;
    errorMessage: string | null;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
    llamadaBBDDUsers: (primeraLLamada?: boolean) => void;
}

const UsersContext = createContext<UsersContextType | undefined>(undefined);

export const UsersProvider = ({ children }: { children: ReactNode }) => {
    const { i18n } = useTranslation();
    const regiones: RegionInterface[] = (() => {
        const item = sessionStorage.getItem('regiones');
        if (!item) return [];
        try {
            return JSON.parse(item);
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (error) {
            return [];
        }
    })();
    const [loading, setLoading] = useState(false);
    const [fechaUltimoActualizadoBBDD, setFechaUltimoActualizadoBBDD] = useState<Date>(() => {
        const fechaStr = obtenerFechaLlamada('users');
        return fechaStr ? new Date(fechaStr) : new Date();
    });

    const [users, setUsers] = useState<UserIDList[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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

        if (primeraLLamada) {
            setErrorMessage(null);
        }

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
                    if (!res.ok) {
                        const errorInfo = gestionarErrorServidor(res, data);
                        setErrorMessage(errorInfo.mensaje);
                        return;
                    }

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
                    const errorInfo = gestionarErrorServidor(err);
                    setErrorMessage(errorInfo.mensaje);
                    return;
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
                fechaUltimoActualizadoBBDD,
                agregarUsuario,
                listadoUsuarios,
                actualizarUsuario,
                errorMessage,
                setErrorMessage,
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

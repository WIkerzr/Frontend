/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { UserID, UserRegionId } from '../../types/users';
import { useTranslation } from 'react-i18next';
import { ErrorMessage, Loading } from '../../components/Utils/animations';
import { useRegionContext } from '../../contexts/RegionContext';
import { ApiTarget } from '../../components/Utils/gets/controlDev';
import { UsersTable } from './componentesUser';
import { formateaConCeroDelante, obtenerFechaLlamada } from '../../components/Utils/utils';

export const useUsers = (onChange?: (users: UserID[]) => void) => {
    const { regiones } = useRegionContext();
    const { t, i18n } = useTranslation();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [fechaUltimoActualizadoBBDD, setFechaUltimoActualizadoBBDD] = useState<Date>(() => {
        const fechaStr = obtenerFechaLlamada('users');
        return fechaStr ? new Date(fechaStr) : new Date();
    });

    const [users, setUsers] = useState<UserID[]>(() => {
        const saved = localStorage.getItem('users');
        return saved ? JSON.parse(saved) : [];
    });

    const actualizarUsers = (nuevoUsers: UserID[]) => {
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

    const refrescarUsuarios = () => {
        const saved = localStorage.getItem('users');
        const parsed = saved ? JSON.parse(saved) : [];
        setUsers(parsed);
        if (onChange) onChange(parsed);
    };

    const agregarUsuario = (nuevo: UserID) => actualizarUsers([...users, nuevo]);
    const listadoUsuarios = (dataArray: UserID[]) => actualizarUsers(dataArray);
    const eliminarUsuario = (id: string) => {
        actualizarUsers(users.filter((u) => u.id !== id));
    };
    const actualizarUsuario = (usuarioActualizado: UserID) => {
        actualizarUsers(users.map((u) => (u.id === usuarioActualizado.id ? usuarioActualizado : u)));
    };

    const llamadaBBDDUsers = (primeraLLamada?: boolean) => {
        const storedUsers = localStorage.getItem('users');

        if (!primeraLLamada || !storedUsers) {
            const token = sessionStorage.getItem('token');
            setLoading(true);
            const fetchUsers = async () => {
                try {
                    const res = await fetch(`${ApiTarget}/users`, {
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
                            RegionName: region ? region.NameEs : '-',
                        };
                    });
                    setFechaUltimoActualizadoBBDD(new Date());
                    const dataArray: UserID[] = Array.isArray(usuariosConRegion) ? usuariosConRegion : Object.values(usuariosConRegion);
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

    return { users, agregarUsuario, listadoUsuarios, eliminarUsuario, actualizarUsuario, refrescarUsuarios, fechaUltimoActualizadoBBDD, llamadaBBDDUsers, loading, error };
};

const Index = () => {
    const { users, loading, error, llamadaBBDDUsers } = useUsers();

    useEffect(() => {
        llamadaBBDDUsers(true);
    }, []);

    if (loading) return <Loading />;
    if (error) return <ErrorMessage message={error} />;
    if (users && Object.keys(users).length === 0) return <div>No hay datos para mostrar</div>;

    return (
        <div className="flex w-full gap-5">
            <div className="panel h-full w-full">
                <UsersTable />
            </div>
        </div>
    );
};

export default Index;

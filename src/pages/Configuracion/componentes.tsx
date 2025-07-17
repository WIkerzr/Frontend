/* eslint-disable @typescript-eslint/no-explicit-any */
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { sortBy } from 'lodash';
import { UserID } from '../../types/users';
import Tippy from '@tippyjs/react';
import { forwardRef, ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';

import { User } from '../../types/users';
import UserDataForm from '../profile/userDateForm';
import IconTrash from '../../components/Icon/IconTrash';
import IconPencil from '../../components/Icon/IconPencil';
import 'mantine-datatable/styles.layer.css';
import '@mantine/core/styles.css';
import { useUsers } from './Usuarios';
import { useRegionContext } from '../../contexts/RegionContext';
import { EstadosLoading } from '../../types/GeneralTypes';
import { NewModal } from '../../components/Utils/utils';

export const newUser: UserID = {
    name: '',
    lastName: '',
    secondSurname: '',
    role: 'ADR',
    email: '',
    ambit: '',
    status: true,
    id: '0',
};

interface BaseProps {
    recargeToSave?: () => void;
}

export const updateUserInLocalStorage = (updatedUser: UserID, accion: 'editar' | 'nuevo' | 'eliminar') => {
    try {
        const usersRaw = localStorage.getItem('users');
        const users: UserID[] = usersRaw ? JSON.parse(usersRaw) : [];

        let updatedUsers: UserID[] = [...users];

        switch (accion) {
            case 'editar': {
                const exists = users.some((user) => user.email === updatedUser.email);
                if (!exists) {
                    throw new Error(`No se encontró el usuario con email: ${updatedUser.email}`);
                }
                updatedUsers = users.map((user) => (user.email === updatedUser.email ? { ...user, ...updatedUser } : user));
                break;
            }

            case 'nuevo': {
                const exists = users.some((user) => user.email === updatedUser.email);
                if (exists) {
                    throw new Error(`El usuario con email ${updatedUser.email} ya existe`);
                }
                updatedUsers = [...users, updatedUser];
                break;
            }

            case 'eliminar': {
                const exists = users.some((user) => user.email === updatedUser.email);
                if (!exists) {
                    throw new Error(`No se puede eliminar: usuario con email ${updatedUser.email} no encontrado`);
                }
                updatedUsers = users.filter((user) => user.email !== updatedUser.email);
                break;
            }

            default:
                throw new Error(`Acción no reconocida: ${accion}`);
        }
        localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (e) {
        console.error('Error en updateUserInLocalStorage:', e);
    }
};

interface EditarProps extends BaseProps {
    accion: 'editar';
    userData: UserID;
    onClose: () => void;
    title?: boolean;
}

interface NuevoProps extends BaseProps {
    accion: 'nuevo';
    userData?: User;
    onClose: () => void;
    title?: boolean;
}

type UserDataProps = EditarProps | NuevoProps;

export const UsersDateModalLogic: React.FC<UserDataProps> = ({ userData, accion, onClose, title = true }) => {
    const getInitialUserData = (): UserID => {
        const usersRaw = localStorage.getItem('users');
        try {
            const users: UserID[] = JSON.parse(usersRaw!);

            const matched = users.find((user) => user.email === userData!.email);
            if (matched) {
                return {
                    name: matched.name || '',
                    email: matched.email || '',
                    lastName: matched.lastName || '',
                    secondSurname: matched.secondSurname || '',
                    role: matched.role || 'gobiernoVasco',
                    ambit: matched.RegionId || '-',
                    status: matched.status || false,
                    id: matched.id || '9999',
                };
            }
        } catch (e) {
            console.error('Error parsing localStorage user:', e);
        }

        return {
            name: '',
            lastName: '',
            secondSurname: '',
            role: 'GOBIERNOVASCO',
            email: '',
            RegionId: '-',
            id: '9999',
            status: false,
        };
    };
    const { agregarUsuario, actualizarUsuario } = useUsers();
    const { regiones } = useRegionContext();

    const initialData = accion === 'editar' ? getInitialUserData() : { ...newUser };
    const [UserData, setUserData] = useState(initialData);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState<EstadosLoading>('idle');

    const { t, i18n } = useTranslation();

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        if (isSubmitting) {
            setErrorMessage(null);
            setSuccessMessage(null);
        }
    };

    const handleCloseModal = async () => {
        setTimeout(() => {
            setTimeout(() => {
                setSuccessMessage(null);
                onClose();
                setFadeOut(false);
                setIsLoading('idle');
            }, 1000);
        }, 1000);
    };

    const handleSubmitUser = async (e: React.FormEvent) => {
        const token = sessionStorage.getItem('token');
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        let response: Response | null = null;
        try {
            setIsLoading('loading');
            if (accion === 'editar') {
                if ('id' in UserData) {
                    response = await fetch('https://localhost:44300/api/user', {
                        method: 'PUT',
                        headers: {
                            Authorization: `Bearer ${token}`,
                            Accept: 'application/json',
                            'Content-Type': 'application/json',
                        },
                        body: JSON.stringify({
                            name: UserData.name,
                            lastName: UserData.lastName,
                            secondSurname: UserData.secondSurname,
                            role: initialData.role,
                            email: UserData.email,
                            RegionId: UserData.ambit,
                            id: UserData.id,
                            status: UserData.status,
                        }),
                    });
                    if (response.ok) {
                        const data = await response.json();
                        const region = regiones.find((r) => r.RegionId === data.data.RegionId);
                        const datosUsuario = {
                            ...data.data,
                            RegionName: region ? (i18n.language === 'es' ? region.NameEs : region.NameEu) : 'Desconocido',
                        };
                        actualizarUsuario(datosUsuario);
                    }
                }
            } else if (accion === 'nuevo') {
                response = await fetch('https://localhost:44300/api/newUser', {
                    method: 'PUT',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: UserData.name,
                        lastName: UserData.lastName,
                        secondSurname: UserData.secondSurname,
                        role: UserData.role,
                        email: UserData.email,
                        ambit: UserData.ambit,
                        RegionId: UserData.ambit,
                        id: UserData.id,
                        status: true,
                    }),
                });
                const data = await response.json();
                if (response.ok) {
                    agregarUsuario(data.data);
                }
            }

            if (response && !response.ok) {
                setIsLoading('error');
                throw new Error(t('errorEnviarServidor'));
            } else {
                setSuccessMessage(t('CambiosGuardados'));
                setIsLoading('success');
            }
        } catch (err: any) {
            setIsLoading('error');
            setErrorMessage(err.message || 'Error inesperado');
        } finally {
            setIsSubmitting(false);
        }
    };
    let mensajeAMostrar = '';
    if (isLoading === 'success') {
        mensajeAMostrar = successMessage ? successMessage : '';
    } else if (isLoading === 'error') {
        mensajeAMostrar = errorMessage ? errorMessage : '';
    }
    return (
        <>
            <LoadingOverlay isLoading={isLoading} message={mensajeAMostrar} onComplete={() => handleCloseModal()} />
            <UserDataForm
                onSubmit={handleSubmitUser}
                userData={UserData}
                onChange={handleUserChange}
                errorMessage={errorMessage}
                successMessage={successMessage}
                fadeOut={fadeOut}
                roleDisabled={false}
                isNewUser={accion === 'nuevo'}
                title={title}
            />
        </>
    );
};

interface EditUserProps {
    user: UserID;
    onChange: () => void;
}

export const EditUser = forwardRef<HTMLButtonElement, EditUserProps>(({ user, onChange }, ref) => {
    const { t } = useTranslation();

    const [showModal, setShowModal] = useState(false);
    const handleOpen = () => setShowModal(true);
    const handleClose = () => {
        onChange();
        setTimeout(() => {
            setShowModal(false);
        }, 300);
    };

    return (
        <>
            <button type="button" onClick={handleOpen} ref={ref}>
                <IconPencil />
            </button>
            <NewModal open={showModal} onClose={() => setShowModal(false)} title={t('datosUsuarios')}>
                <UsersDateModalLogic accion="editar" userData={user} onClose={() => handleClose()} title={false} />
            </NewModal>
        </>
    );
});

export const DeleteUser = forwardRef<HTMLButtonElement, EditUserProps>(({ user, onChange }, ref) => {
    const { t } = useTranslation();
    const { eliminarUsuario } = useUsers();
    const handleDelete = async () => {
        const confirmDelete = window.confirm(t('¿Estás seguro de que deseas eliminar este usuario?'));
        const token = sessionStorage.getItem('token');

        if (!confirmDelete) return;

        try {
            const response = await fetch('https://localhost:44300/api/deleteUser', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: user.id }),
            });

            if (!response.ok) {
                throw new Error(t('noSePudoEliminarUsuario'));
            }

            alert(t('usuarioEliminadoCorrectamente'));

            if (response.ok) {
                eliminarUsuario(user.id);
                onChange();
            }
        } catch (error: any) {
            alert(error.message || t('errorEliminarUsuario'));
        }
    };

    return (
        <button type="button" onClick={handleDelete} ref={ref} title={t('Eliminar usuario')}>
            <IconTrash />
        </button>
    );
});
interface ChangeStatusProps {
    value: UserID;
    onSuccess?: () => void;
}

export const ChangeStatus: React.FC<ChangeStatusProps> = ({ value, onSuccess }) => {
    const { t } = useTranslation();
    const [localStatus, setLocalStatus] = useState<boolean>(!!value.status);

    const handleToggle = async () => {
        const token = sessionStorage.getItem('token');
        const newStatus = !localStatus;
        setLocalStatus(newStatus);

        const datosUsuario = {
            name: value.name,
            lastName: value.lastName,
            secondSurname: value.secondSurname,
            role: value.role,
            email: value.email,
            ambit: value.ambit,
            status: newStatus,
            id: value.id,
        };
        try {
            await fetch('https://localhost:44300/api/user', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...datosUsuario,
                    id: value.id,
                }),
            });
            updateUserInLocalStorage(datosUsuario, 'editar');
            onSuccess?.();
        } catch (err) {
            console.error('Error actualizando el estado:', err);
            setLocalStatus(!newStatus);
        }
    };

    return (
        <button type="button" onClick={handleToggle} className="cursor-pointer" title={t('cambiarEstado')}>
            {localStatus ? '🟢' : '🔴'}
        </button>
    );
};

interface ElimarUserProps {
    onChange: () => void;
}

export const NewUser = forwardRef<HTMLDivElement, ElimarUserProps>(({ onChange }, ref) => {
    const { t } = useTranslation();

    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        setTimeout(() => {
            handleClose();
        }, 1500);
    }, []);

    const handleOpen = () => setShowModal(true);
    const handleClose = () => {
        setTimeout(() => {
            setShowModal(false);
            onChange();
        }, 300);
    };

    return (
        <>
            <div className="flex-grow" ref={ref}></div>
            <button type="button" className="btn btn-primary w-1/4 " onClick={handleOpen}>
                {t('agregarUsuario')}
            </button>

            <NewModal open={showModal} onClose={() => setShowModal(false)} title={t('datosUsuarios')}>
                <UsersDateModalLogic accion="nuevo" onClose={() => handleClose()} title={false} />
            </NewModal>
        </>
    );
});

export const UsersTable = forwardRef<HTMLButtonElement>(() => {
    const { users, refrescarUsuarios } = useUsers();

    const { t } = useTranslation();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 15, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus<UserID>>({ columnAccessor: 'id', direction: 'asc' });

    const [datosMostrar, setDatosMostrar] = useState<UserID[]>([]);
    const [recordsPaginados, setRecordsPaginados] = useState<UserID[]>([]);

    useEffect(() => {
        let data = [...users];

        if (search.trim()) {
            const s = search.toLowerCase();
            data = data.filter(
                (item) =>
                    (item.status && String(item.status).toLowerCase().includes(s)) ||
                    (item.name as string).toLowerCase().includes(s) ||
                    (item.lastName as string).toLowerCase().includes(s) ||
                    (item.secondSurname as string).toLowerCase().includes(s) ||
                    (item.email as string).toLowerCase().includes(s) ||
                    (item.role as string).toLowerCase().includes(s) ||
                    (item.RegionName && (item.RegionName as string).toLowerCase().includes(s))
            );
        }

        data = sortBy(data, sortStatus.columnAccessor);
        if (sortStatus.direction === 'desc') data = data.reverse();

        setDatosMostrar(data);
        setPage(1);
    }, [users, search, sortStatus]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsPaginados(datosMostrar.slice(from, to));
    }, [datosMostrar, page, pageSize]);

    return (
        <div>
            <div className="flex items-center space-x-4 mb-5 w-[100%]">
                <input type="text" className="border border-gray-300 rounded p-2 w-full max-w-xs" placeholder={t('buscarUsuario')} value={search} onChange={(e) => setSearch(e.target.value)} />
                <NewUser onChange={() => refrescarUsuarios()} />
            </div>
            <div className="panel mt-6">
                <div className="datatables">
                    <DataTable<UserID>
                        records={recordsPaginados}
                        totalRecords={datosMostrar.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        highlightOnHover
                        className={`${isRtl ? 'whitespace-nowrap table-hover' : 'whitespace-nowrap table-hover'}`}
                        columns={[
                            {
                                accessor: 'status',
                                title: '',
                                render: (row) => <ChangeStatus key={`status-${row.email}`} value={row} />,
                            },
                            { accessor: 'name', title: t('name'), sortable: true },
                            { accessor: 'lastName', title: t('lastName'), sortable: true },
                            { accessor: 'secondSurname', title: t('secondSurname'), sortable: true },
                            { accessor: 'email', title: t('email'), sortable: true },
                            {
                                accessor: 'role',
                                title: t('role'),
                                sortable: true,
                                render: (row): React.ReactNode => {
                                    const map: Record<string, string> = {
                                        GV: 'Inst. Pública',
                                    };
                                    const role = row.role as string;
                                    return map[role] || role;
                                },
                            },
                            { accessor: 'RegionName', title: t('ambit'), sortable: true },
                            {
                                accessor: 'vacio2',
                                title: '',
                                render: (row) => (
                                    <div className="flex justify-end space-x-3">
                                        <Tippy content={t('editar')}>
                                            <EditUser user={row} onChange={() => refrescarUsuarios()} />
                                        </Tippy>
                                        <Tippy content={t('borrar')}>
                                            <DeleteUser user={row} onChange={() => refrescarUsuarios()} />
                                        </Tippy>
                                    </div>
                                ),
                            },
                        ]}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => t('paginacion', { from: `${from}`, to: `${to}`, totalRecords: `${totalRecords}` })}
                        recordsPerPageLabel={t('recorsPerPage')}
                    />
                </div>
            </div>
        </div>
    );
});
interface PanelEjesProps {
    titulo: ReactNode;
    zonaBtn?: ReactNode;
    zonaExplicativa?: ReactNode;
    zonaExtra?: ReactNode;
}

export const ZonaTitulo: React.FC<PanelEjesProps> = ({ titulo, zonaBtn, zonaExplicativa, zonaExtra }) => {
    return (
        <>
            <div className="flex flex-col justify-between mb-6 ">
                <div className="flex items-center justify-between mb-6 h-[48px]">
                    {titulo}
                    <div className="flex items-end space-x-4">{zonaBtn}</div>
                </div>
                {zonaExplicativa && (
                    <div className="w-full rounded inline-flex items-center mb-6">
                        <div className="w-full flex flex-col  text-warning bg-warning-light dark:bg-warning-dark-light p-3.5">{zonaExplicativa}</div>
                    </div>
                )}
                {zonaExtra && <>{zonaExtra}</>}
            </div>
        </>
    );
};

interface LoadingOverlayProps {
    isLoading: EstadosLoading;
    message?: string;
    onComplete?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message, onComplete }) => {
    useEffect(() => {
        if (isLoading === 'success' || isLoading === 'error') {
            const timeout = setTimeout(() => {
                if (onComplete) onComplete();
            }, 1500);
            return () => clearTimeout(timeout);
        }
    }, [isLoading, onComplete]);

    if (isLoading === 'idle') {
        return null;
    }

    const Loading = () => {
        return (
            <div role="status" aria-live="polite" aria-busy={'true'} className="fixed inset-0 flex justify-center items-center cursor-wait z-50 rounded-lg">
                <>
                    {/* <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div> */}
                    {/* <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div> */}
                    {/* <span className="animate-spin border-8 border-[#f1f2f3] border-l-primary rounded-full w-14 h-14 inline-block align-middle m-auto"></span> */}
                    <span className="w-16 h-16 border-8 animate-[spin_2s_linear_infinite] border-[#f1f2f3] border-l-primary border-r-primary rounded-full inline-block align-middle"></span>
                </>
            </div>
        );
    };

    const Success = () => {
        return (
            <div role="status" aria-live="polite" aria-busy={'false'} className="backdrop-blur-sm fixed inset-0 flex justify-center items-center cursor-wait z-50 rounded-lg">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="mt-2 text-green-600 font-semibold bg-white">{message}</p>
                </div>
            </div>
        );
    };
    const Error = () => {
        return (
            <div role="status" aria-live="polite" aria-busy={'false'} className="backdrop-blur-sm bg-opacity-20 fixed inset-0 flex justify-center items-center cursor-wait z-50 rounded-lg">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                    </div>
                    <p className="mt-2 text-red-600 font-semibold bg-white">{message}</p>
                </div>
            </div>
        );
    };

    switch (isLoading) {
        case 'loading':
            break;

        default:
            break;
    }
    return (
        <>
            {isLoading === 'loading' && <Loading />}
            {isLoading === 'success' && <Success />}
            {isLoading === 'error' && <Error />}
        </>
    );
};

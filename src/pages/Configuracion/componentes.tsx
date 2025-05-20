import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { setPageTitle } from '../../store/themeConfigSlice';
import { sortBy } from 'lodash';
import { UserID } from '../../types/users';
import Tippy from '@tippyjs/react';
import { forwardRef, useEffect, useState } from 'react';
import { Indicador } from '../../types/Indicadores';
import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';

import { PublicUser, TableUsersHazi } from '../../types/users';
import UserDataForm from '../profile/userDateForm';
import IconTrash from '../../components/Icon/IconTrash';
import IconPencil from '../../components/Icon/IconPencil';

const newUser: PublicUser = {
    name: '',
    lastName: '',
    secondSurname: '',
    role: 'gobiernoVasco',
    email: '',
    ambit: '',
    status: true,
};

interface BaseProps {
    recargeToSave?: () => void;
}

interface EditarProps extends BaseProps {
    accion: 'editar';
    userData: PublicUser;
}

interface NuevoProps extends BaseProps {
    accion: 'nuevo';
    userData?: undefined;
}

type UserDataProps = EditarProps | NuevoProps;

export const updateUserInLocalStorage = (updatedUser: PublicUser, accion: 'editar' | 'nuevo' | 'eliminar') => {
    try {
        const usersRaw = localStorage.getItem('users');
        const users: PublicUser[] = usersRaw ? JSON.parse(usersRaw) : [];

        let updatedUsers: PublicUser[];

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

export const UsersDateModalLogic: React.FC<UserDataProps> = ({ userData, accion, recargeToSave }) => {
    const getInitialUserData = (): PublicUser => {
        const usersRaw = localStorage.getItem('users');
        try {
            const users: PublicUser[] = JSON.parse(usersRaw!);

            const matched = users.find((user) => user.email === userData!.email);
            if (matched) {
                return {
                    name: matched.name || '',
                    lastName: matched.lastName || '',
                    secondSurname: matched.secondSurname || '',
                    role: matched.role || 'gobiernoVasco',
                    email: matched.email || '',
                    ambit: matched.ambit || '-',
                    status: matched.status || false,
                };
            }
        } catch (e) {
            console.error('Error parsing localStorage user:', e);
        }

        return {
            name: '',
            lastName: '',
            secondSurname: '',
            role: 'gobiernoVasco',
            email: '',
            ambit: '-',
            status: false,
        };
    };

    const initialData = accion === 'editar' ? getInitialUserData() : newUser;
    const [UserData, setUserData] = useState(initialData);
    const [idEmail] = useState(initialData.email);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();

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

    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        let response: Response | null = null;

        try {
            if (accion === 'editar') {
                response = await fetch('/api/user', {
                    method: 'PUT',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: UserData.name,
                        lastName: UserData.lastName,
                        secondSurname: UserData.secondSurname,
                        role: initialData.role,
                        email: UserData.email,
                        ambit: UserData.ambit,
                        idEmail,
                    }),
                });
                if (response.ok) {
                    updateUserInLocalStorage(UserData, 'editar');
                }
            } else if (accion === 'nuevo') {
                response = await fetch('/api/newUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: UserData.name,
                        lastName: UserData.lastName,
                        secondSurname: UserData.secondSurname,
                        role: UserData.role,
                        email: UserData.email,
                        ambit: UserData.ambit,
                        status: true,
                    }),
                });
                if (response.ok) {
                    updateUserInLocalStorage(UserData, 'nuevo');
                }
            }

            if (response && !response.ok) {
                throw new Error(t('errorEnviarServidor'));
            } else {
                setSuccessMessage(t('CambiosGuardados'));

                setTimeout(() => {
                    setFadeOut(true);
                    setTimeout(() => {
                        setSuccessMessage(null);
                        setFadeOut(false);
                    }, 1000);
                }, 5000);
                return recargeToSave && recargeToSave();
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Error inesperado');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <UserDataForm onSubmit={handleSubmitUser} userData={UserData} onChange={handleUserChange} errorMessage={errorMessage} successMessage={successMessage} fadeOut={fadeOut} roleDisabled={false} />
    );
};

export const ModalNuevoIndicador: React.FC<{ texto: string; datosIndicador: string | undefined; tipoIndicador: 'realizacion' | 'resultado'; onGuardar: (nuevoIndicador: Indicador) => void }> = ({
    texto,
    datosIndicador,
    tipoIndicador,
    onGuardar,
}) => {
    const { t } = useTranslation();

    const [isOpen, setIsOpen] = useState(false);
    const [descripcionEditable, setDescripcionEditable] = useState('');
    const [ano, setAno] = useState(2025);
    const [tipo, setTipo] = useState<'realizacion' | 'resultado'>(tipoIndicador);

    const [mensaje, setMensaje] = useState('');

    const getSiguienteCodigo = () => {
        const prefijo = datosIndicador!.slice(0, 2);
        const numero = parseInt(datosIndicador!.slice(2, 4), 10);
        const siguienteNumero = numero + 1;
        const siguienteCodigo = `${prefijo}${String(siguienteNumero).padStart(2, '0')}.`;
        return siguienteCodigo;
    };

    let siguienteIndicador = getSiguienteCodigo();

    const handleGuardar = async () => {
        const descripcionFinal = `${siguienteIndicador ?? ''} ${descripcionEditable}`.trim();

        const response = await fetch('/api/nuevoIndicador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion: descripcionFinal, ano, tipo }),
        });

        const data = await response.json();

        if (response.ok) {
            setMensaje(t('correctoIndicadorGuardado'));
            setDescripcionEditable('');
            setAno(2025);
            setTipo(tipoIndicador);
            onGuardar(data.indicador);
            setTimeout(() => {
                setMensaje('');
                setIsOpen(false);
            }, 1000);
        } else {
            setMensaje(t('errorGuardar') + data.message);
        }
    };

    return (
        <div className="flex justify-center mb-5">
            <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 btn btn-primary w-1/2">
                {texto}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
                        <button className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl" onClick={() => setIsOpen(false)}>
                            ×
                        </button>

                        <h2 className="text-xl font-bold mb-4">{t('newIndicador')}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-medium">{t('Descripcion')}</label>
                                <div className="flex">
                                    <span className="p-2 bg-gray-100 border border-r-0 rounded-l text-gray-700 whitespace-nowrap">{siguienteIndicador}</span>
                                    <input type="text" className="w-full p-2 border rounded-r" value={descripcionEditable} onChange={(e) => setDescripcionEditable(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium">{t('Ano')}</label>
                                <input type="number" className="w-full p-2 border rounded" value={ano} onChange={(e) => setAno(Number(e.target.value))} />
                            </div>

                            <div>
                                <label className="block font-medium">{t('Tipo')}</label>
                                <select className="w-full p-2 border rounded" value={tipo} onChange={(e) => setTipo(e.target.value as 'realizacion' | 'resultado')}>
                                    <option value="realizacion">{t('Realizacion')}</option>
                                    <option value="resultado">{t('Resultado')}</option>
                                </select>
                            </div>

                            <button onClick={handleGuardar} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full">
                                {t('guardar')}
                            </button>

                            {mensaje && <p className="text-sm text-center mt-2">{mensaje}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

interface EditUserProps {
    user: PublicUser;
    recargeToSave: () => void;
}

interface NewUserProps {
    recargeToSave: () => void;
}

interface ChangeStatusProps {
    value: TableUsersHazi;
    onSuccess?: () => void;
}

export const EditUser = forwardRef<HTMLButtonElement, EditUserProps>(({ user, recargeToSave }, ref) => {
    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            handleClose();
        }, 1500);
    }, [recargeToSave]);

    const handleOpen = () => setShowModal(true);
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowModal(false);
            setIsClosing(false);
        }, 300);
    };

    return (
        <>
            <button type="button" onClick={handleOpen} ref={ref}>
                <IconPencil />
            </button>

            {showModal && (
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                    onClick={handleClose}
                >
                    <div
                        className={`bg-white p-5 rounded-lg max-w-md w-full transform transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <UsersDateModalLogic accion="editar" userData={user} recargeToSave={recargeToSave} />
                    </div>
                </div>
            )}
        </>
    );
});

export const ChangeStatus = forwardRef<HTMLTableCellElement, ChangeStatusProps>(({ value, onSuccess }, ref) => {
    const { t } = useTranslation();
    const [localStatus, setLocalStatus] = useState<boolean>(!!value.status);

    const handleToggle = async () => {
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
        };
        try {
            await fetch('/api/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...datosUsuario,
                    idEmail: value.email,
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
});

export const DeleteUser = forwardRef<HTMLButtonElement, EditUserProps>(({ user, recargeToSave }, ref) => {
    const { t } = useTranslation();

    const handleDelete = async () => {
        const confirmDelete = window.confirm(t('¿Estás seguro de que deseas eliminar este usuario?'));

        if (!confirmDelete) return;

        try {
            const response = await fetch('/api/deleteUser', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ idEmail: user.email }),
            });

            if (!response.ok) {
                throw new Error(t('noSePudoEliminarUsuario'));
            }

            const data = await response.json();

            if (data.success && recargeToSave) {
                recargeToSave();
            }
            updateUserInLocalStorage(user, 'eliminar');

            alert(t('usuarioEliminadoCorrectamente'));
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

export const NewUser = forwardRef<HTMLButtonElement, NewUserProps>(({ recargeToSave }, ref) => {
    const { t } = useTranslation();

    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            handleClose();
        }, 1500);
    }, [recargeToSave]);

    const handleOpen = () => setShowModal(true);
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowModal(false);
            setIsClosing(false);
        }, 300);
    };

    return (
        <>
            <button type="button" className="btn btn-primary w-1/2" onClick={handleOpen}>
                {t('agregarUsuario')}
            </button>

            {showModal && (
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                    onClick={handleClose}
                >
                    <div
                        className={`bg-white p-5 rounded-lg max-w-md w-full transform transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <UsersDateModalLogic accion="nuevo" recargeToSave={recargeToSave} />
                    </div>
                </div>
            )}
        </>
    );
});

interface tableProps {
    users: UserID[];
    onSuccess: () => void;
}

export const UsersTable = forwardRef<HTMLButtonElement, tableProps>(({ users, onSuccess }, ref) => {
    const { t } = useTranslation();
    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Order Sorting Table'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(users, 'id'));
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            return users.filter((item) => {
                return item.status || item.name || item.lastName || item.secondSurname || item.email || item.role || item.ambit;
            });
        });
    }, [search, users]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);
    return (
        <div>
            <div className="panel mt-6">
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className={`${isRtl ? 'whitespace-nowrap table-hover' : 'whitespace-nowrap table-hover'}`}
                        records={recordsData}
                        columns={[
                            {
                                accessor: 'status',
                                title: '',
                                render: (row) => <ChangeStatus key={`status-${row.email}`} value={row} />,
                            },
                            { accessor: 'name', title: t('name'), sortable: true },
                            { accessor: 'lastName', title: t('lastName'), sortable: true },
                            { accessor: 'secondSurname', title: t('secondSurname'), sortable: true },
                            { accessor: 'email', sortable: true },
                            { accessor: 'role', title: t('role'), sortable: true },
                            { accessor: 'ambit', title: t('ambit'), sortable: true },
                            {
                                accessor: 'vacio2',
                                title: '',
                                render: (row) => (
                                    <div className="flex justify-end space-x-3">
                                        <Tippy content={t('editar')}>
                                            <EditUser user={row} recargeToSave={onSuccess} />
                                        </Tippy>
                                        <Tippy content={t('borrar')}>
                                            <DeleteUser user={row} recargeToSave={onSuccess} />
                                        </Tippy>
                                    </div>
                                ),
                            },
                        ]}
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => t('paginacion', { from: `${from}`, to: `${to}`, totalRecords: `${totalRecords}` })}
                        recordsPerPageLabel={t('recorsPerPage')}
                    />
                </div>
            </div>
        </div>
    );
});

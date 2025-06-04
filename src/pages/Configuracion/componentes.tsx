import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { sortBy } from 'lodash';
import { UserID } from '../../types/users';
import Tippy from '@tippyjs/react';
import { forwardRef, ReactNode, useEffect, useState } from 'react';
import { Indicador } from '../../types/Indicadores';
import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';

import { User } from '../../types/users';
import UserDataForm from '../profile/userDateForm';
import IconTrash from '../../components/Icon/IconTrash';
import IconPencil from '../../components/Icon/IconPencil';
import 'mantine-datatable/styles.layer.css';
import '@mantine/core/styles.css';

const newUser: User = {
    name: '',
    lastName: '',
    secondSurname: '',
    role: 'GV',
    email: '',
    ambit: '',
    status: true,
    password: '',
};

interface BaseProps {
    recargeToSave?: () => void;
}

interface EditarProps extends BaseProps {
    accion: 'editar';
    userData: UserID;
}

interface NuevoProps extends BaseProps {
    accion: 'nuevo';
    userData?: User;
}

type UserDataProps = EditarProps | NuevoProps;

export const updateUserInLocalStorage = (updatedUser: UserID | User, accion: 'editar' | 'nuevo' | 'eliminar') => {
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
                if ('id' in updatedUser) {
                    updatedUsers = [...users, updatedUser];
                }
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
    const getInitialUserData = (): UserID => {
        const usersRaw = localStorage.getItem('users');
        try {
            const users: UserID[] = JSON.parse(usersRaw!);

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
                    id: matched.id || 9999,
                };
            }
        } catch (e) {
            console.error('Error parsing localStorage user:', e);
        }

        return {
            name: '',
            lastName: '',
            secondSurname: '',
            role: 'GV',
            email: '',
            ambit: '-',
            id: 9999,
            status: false,
        };
    };

    const initialData = accion === 'editar' ? getInitialUserData() : newUser;
    const [UserData, setUserData] = useState(initialData);
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
                if ('id' in UserData) {
                    response = await fetch('https://localhost:44300/api/user', {
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
                            id: UserData.id,
                            status: UserData.status,
                        }),
                    });
                    if (response.ok) {
                        updateUserInLocalStorage(UserData, 'editar');
                    }
                }
            } else if (accion === 'nuevo') {
                response = await fetch('https://localhost:44300/api/newUser', {
                    method: 'PUT',
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

type ModalNuevoIndicadorProps = {
    isOpen: boolean;
    onClose: () => void;
    accion: 'Editar' | 'Nuevo';
    datosIndicador: Indicador;
    tipoIndicador: 'realizacion' | 'resultado';
    onGuardar: (nuevoIndicador: Indicador) => void;
};

export const ModalNuevoIndicador: React.FC<ModalNuevoIndicadorProps> = ({ isOpen, onClose, accion, datosIndicador, tipoIndicador, onGuardar }) => {
    const { t } = useTranslation();

    const [descripcionEditable, setDescripcionEditable] = useState('');
    const [ano, setAno] = useState(2025);
    const [tipo, setTipo] = useState<'realizacion' | 'resultado'>(tipoIndicador);
    const [mensaje, setMensaje] = useState('');
    const [unidad, setUnidad] = useState('');
    const [ejes, setEjes] = useState('');
    const [definicion, setDefinicion] = useState('');
    const [variables, setVariables] = useState('');
    const [metodologia, setMetodologia] = useState('');

    const getSiguienteCodigo = () => {
        if (!datosIndicador) return '';
        const prefijo = datosIndicador.descripcion.slice(0, 2);
        const numero = parseInt(datosIndicador.descripcion.slice(2, 4), 10);
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
            body: JSON.stringify({
                descripcion: descripcionFinal,
                ano,
                tipo,
                unidad,
                ejes,
                definicion,
                variables,
                metodologia,
            }),
        });

        const data = await response.json();

        if (response.ok) {
            setMensaje(t('correctoIndicadorGuardado'));
            setDescripcionEditable('');
            setAno(2025);
            setTipo(tipoIndicador);
            setUnidad('');
            setEjes('');
            setDefinicion('');
            setVariables('');
            setMetodologia('');
            onGuardar(data.indicador);
            setTimeout(() => {
                setMensaje('');
                onClose();
            }, 1000);
        } else {
            setMensaje(t('errorGuardar') + data.message);
        }
    };
    const [mostrarResultadoRelacionado, setMostrarResultadoRelacionado] = useState(false);
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div
                className={`bg-white p-6 rounded-xl shadow-lg relative transition-all duration-300 flex
          ${mostrarResultadoRelacionado ? 'w-full max-w-4xl' : 'w-full max-w-md'}
        `}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Panel principal */}
                <div className={`flex-1 transition-all duration-300 ${mostrarResultadoRelacionado ? 'pr-8' : ''}`}>
                    <button className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl" onClick={onClose}>
                        ×
                    </button>

                    <h2 className="text-xl font-bold mb-4">{t('newIndicador', { tipo: t('Realizacion') })}</h2>

                    <div className="space-y-4">
                        <RellenoIndicador
                            numNextIndi={accion === 'Nuevo' ? siguienteIndicador : datosIndicador.descripcion.slice(0, 5)}
                            valorCampo1={accion === 'Editar' ? datosIndicador.descripcion.slice(5) : descripcionEditable}
                        />

                        {mostrarResultadoRelacionado ? (
                            <button onClick={() => setMostrarResultadoRelacionado(false)} className="btn btn-danger mx-auto block">
                                {t('sinIndicadorResultadoRelacionado')}
                            </button>
                        ) : (
                            <button onClick={() => setMostrarResultadoRelacionado(true)} className="btn btn-primary mx-auto block">
                                {t('agregarIndicadorResultadoRelacionado')}
                            </button>
                        )}
                        <button onClick={handleGuardar} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full">
                            {t('guardar')}
                        </button>

                        {mensaje && <p className="text-sm text-center mt-2">{mensaje}</p>}
                    </div>
                </div>

                {/* Panel derecho */}
                {mostrarResultadoRelacionado && (
                    <>
                        <div className="w-px bg-gray-300 mx-4 self-stretch" />
                        <div className="flex-1 min-w-[300px]">
                            <h2 className="text-xl font-bold mb-4">
                                {t('Indicadores')} {t('Resultado')}
                            </h2>
                            <div>
                                <SelectorOCreador />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
//numNextIndi= {accion === 'Nuevo' ? siguienteIndicador : datosIndicador.descripcion.slice(0, 5)}
//valorCampo1=accion === 'Editar' ? datosIndicador.descripcion.slice(5) : descripcionEditable
type RellenoIndicadorProps = {
    numNextIndi: string;
    valorCampo1: string;
};
const RellenoIndicador: React.FC<RellenoIndicadorProps> = ({ numNextIndi, valorCampo1 }) => {
    const { t } = useTranslation();

    return (
        <>
            <div>
                <div className="flex gap-4">
                    <div className="w-1/2">
                        <label className="block font-medium">{t('Nombre Indicador')}</label>
                        <div className="flex">
                            <span className="p-2 bg-gray-100 border border-r-0 rounded-l text-gray-700 whitespace-nowrap">{numNextIndi}</span>
                            <input
                                type="text"
                                className="w-full p-2 border rounded-r"
                                value={valorCampo1}
                                //onChange={(e) => setDescripcionEditable(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="w-1/2">
                        <label className="block font-medium">{t('unitMed')}</label>
                        <select className="w-full p-2 border rounded">
                            <option>NUMERO</option>
                            <option>OTro</option>
                        </select>
                    </div>
                </div>
            </div>
            <div>
                <label className="block font-medium">{t('Ejes relacionados')}</label>
                <div className="flex">
                    <input
                        type="text"
                        className="w-full p-2 border rounded-r"
                        //value={descripcionEditable}
                        //onChange={(e) => setDescripcionEditable(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label className="block font-medium">{t('Definicion')}</label>
                <div className="flex">
                    <input
                        type="text"
                        className="w-full p-2 border rounded-r"
                        // value={descripcionEditable}
                        // onChange={(e) => setDescripcionEditable(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label className="block font-medium">{t('Variables de desagregacion')}</label>
                <div className="flex">
                    <input
                        type="text"
                        className="w-full p-2 border rounded-r"
                        // value={descripcionEditable}
                        // onChange={(e) => setDescripcionEditable(e.target.value)}
                    />
                </div>
            </div>
            <div>
                <label className="block font-medium">{t('Metologia de calculo')}</label>
                <div className="flex">
                    <input
                        type="text"
                        className="w-full p-2 border rounded-r"
                        // value={descripcionEditable}
                        // onChange={(e) => setDescripcionEditable(e.target.value)}
                    />
                </div>
            </div>
        </>
    );
};

const opcionesIniciales = ['Opción A', 'Opción B', 'Opción C'];

function SelectorOCreador() {
    const [opciones, setOpciones] = useState(opcionesIniciales);
    const [seleccion, setSeleccion] = useState('');
    const [modoCrear, setModoCrear] = useState(false);
    const [nuevaOpcion, setNuevaOpcion] = useState('');

    const agregarNuevaOpcion = () => {
        if (nuevaOpcion.trim()) {
            setOpciones([...opciones, nuevaOpcion]);
            setSeleccion(nuevaOpcion);
            setNuevaOpcion('');
            setModoCrear(false);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 rounded space-y-4">
            {!modoCrear ? (
                <>
                    <label className="block font-bold mb-2">Selecciona una opción:</label>
                    <div className="flex gap-2">
                        <select className="flex-1 border p-2 rounded" value={seleccion} onChange={(e) => setSeleccion(e.target.value)}>
                            <option value="" disabled>
                                Elige una opción
                            </option>
                            {opciones.map((op) => (
                                <option key={op} value={op}>
                                    {op}
                                </option>
                            ))}
                        </select>
                        <button className="bg-blue-500 text-white px-3 py-2 rounded" onClick={() => setModoCrear(true)} type="button">
                            Crear nueva
                        </button>
                    </div>
                </>
            ) : (
                <div className="flex gap-2">
                    <div className="space-y-4">
                        <RellenoIndicador numNextIndi={'1'} valorCampo1={''} />
                        <button className="bg-gray-400 text-white px-3 py-2 rounded" onClick={() => setModoCrear(false)} type="button">
                            Cancelar
                        </button>
                        <button className="btn-primary px-3 py-2 rounded" onClick={() => setModoCrear(false)} type="button">
                            Crear indicador relacionado
                        </button>
                    </div>
                </div>
            )}

            {seleccion && <div className="mt-2 text-green-700 font-semibold">Seleccionado: {seleccion}</div>}
        </div>
    );
}

interface EditUserProps {
    user: UserID;
    recargeToSave: () => void;
}

interface NewUserProps {
    recargeToSave: () => void;
}

interface ChangeStatusProps {
    value: UserID;
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
            id: value.id,
        };
        try {
            await fetch('https://localhost:44300/api/user', {
                method: 'PUT',
                headers: {
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
});

export const DeleteUser = forwardRef<HTMLButtonElement, EditUserProps>(({ user, recargeToSave }, ref) => {
    const { t } = useTranslation();

    const handleDelete = async () => {
        const confirmDelete = window.confirm(t('¿Estás seguro de que deseas eliminar este usuario?'));

        if (!confirmDelete) return;

        try {
            const response = await fetch('https://localhost:44300/api/deleteUser', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: user.id }),
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
            <button type="button" className="btn btn-primary w-1/4" onClick={handleOpen}>
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
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 15, 20, 30, 50, 100];
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
            if (!search.trim()) return sortBy(users, 'id');
            const s = search.toLowerCase();
            return users.filter(
                (item) =>
                    (item.status && String(item.status).toLowerCase().includes(s)) ||
                    (item.name && item.name.toLowerCase().includes(s)) ||
                    (item.lastName && item.lastName.toLowerCase().includes(s)) ||
                    (item.secondSurname && item.secondSurname.toLowerCase().includes(s)) ||
                    (item.email && item.email.toLowerCase().includes(s)) ||
                    (item.role && item.role.toLowerCase().includes(s)) ||
                    (item.RegionName && item.RegionName.toLowerCase().includes(s))
            );
        });
    }, [search, users]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);
    return (
        <div>
            <div className="flex items-center space-x-4 mb-5">
                <input type="text" className="border border-gray-300 rounded p-2 w-full max-w-xs" placeholder={t('Buscar usuario...')} value={search} onChange={(e) => setSearch(e.target.value)} />
                <NewUser recargeToSave={onSuccess} />
            </div>
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
                            { accessor: 'RegionName', title: t('ambit'), sortable: true },
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
interface PanelEjesProps {
    titulo: ReactNode;
    zonaBtn?: ReactNode;
    zonaExplicativa?: ReactNode;
    zonaExtra?: ReactNode;
}

export const ZonaTitulo: React.FC<PanelEjesProps> = ({ titulo, zonaBtn, zonaExplicativa, zonaExtra }) => {
    const { t } = useTranslation();
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

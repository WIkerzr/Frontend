import Tippy from '@tippyjs/react';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { forwardRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import { ApiTarget } from '../../components/Utils/gets/controlDev';
import { Aviso, gestionarErrorServidor, NewModal } from '../../components/Utils/utils';
import { IRootState } from '../../store';
import { UserID } from '../../types/users';
import { UsersDateModalLogic, updateUserInLocalStorage } from './componentes';
import { useUser } from '../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { useUsers } from './Usuarios';
import { useAuth } from '../../contexts/AuthContext';

interface EditUserProps {
    editUser: UserID;
    onChange: () => void;
}

const EditUser = forwardRef<HTMLButtonElement, EditUserProps>(({ editUser, onChange }, ref) => {
    const { t } = useTranslation();
    const { user } = useUser();
    const [showModal, setShowModal] = useState(false);
    const navigate = useNavigate();
    const handleOpen = () => setShowModal(true);
    const handleClose = () => {
        onChange();
        setTimeout(() => {
            setShowModal(false);
        }, 300);
    };

    return (
        <>
            <button type="button" onClick={() => (editUser.id === user?.id ? navigate('/profile') : handleOpen())} ref={ref}>
                <IconPencil />
            </button>
            <NewModal open={showModal} onClose={() => setShowModal(false)} title={t('datosUsuarios')}>
                <UsersDateModalLogic accion="editar" userData={editUser} onClose={() => handleClose()} title={false} />
            </NewModal>
        </>
    );
});

interface DeleteUserProps {
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
    editUser: UserID;
    onChange: () => void;
}

const DeleteUser = forwardRef<HTMLButtonElement, DeleteUserProps>(({ editUser, setErrorMessage, onChange }, ref) => {
    const { t } = useTranslation();
    const { eliminarUsuario } = useUsers();

    const { user } = useUser();
    const { logout } = useAuth();
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/Authenticacion/Login');
    };

    const handleDelete = async () => {
        let mensaje = t('confirmacionEliminarUsuario');
        if (user && editUser.id === user.id) {
            mensaje = t('confirmacionEliminateUsuario');
        }
        const confirmDelete = window.confirm(mensaje);
        const token = sessionStorage.getItem('token');

        if (!confirmDelete) return;

        try {
            const response = await fetch(`${ApiTarget}/deleteUser`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: editUser.id }),
            });

            if (response && !response.ok) {
                const errorInfo = gestionarErrorServidor(response);
                setErrorMessage(errorInfo.mensaje);
                return;
            }

            alert(t('usuarioEliminadoCorrectamente'));

            if (response.ok) {
                eliminarUsuario(editUser.id);
                onChange();
                if (user && editUser.id === user.id) {
                    handleLogout();
                }
            }
        } catch (error) {
            const errorInfo = gestionarErrorServidor(error);
            setErrorMessage(errorInfo.mensaje);
            return null;
        }
    };

    return (
        <button type="button" onClick={handleDelete} ref={ref} title={t('EliminarUsuario')}>
            <IconTrash />
        </button>
    );
});

interface ChangeStatusProps {
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
    value: UserID;
    onSuccess?: () => void;
}

const ChangeStatus: React.FC<ChangeStatusProps> = ({ value, onSuccess, setErrorMessage }) => {
    const { t } = useTranslation();
    const [localStatus, setLocalStatus] = useState<boolean>(!!value.status);
    const { user } = useUser();
    const { logout } = useAuth();

    const handleToggle = async () => {
        const token = sessionStorage.getItem('token');
        const newStatus = !localStatus;
        setLocalStatus(newStatus);
        if (user?.id === value.id) {
            const confirmar = window.confirm(t('autoDesabilitando'));
            if (!confirmar) return;
        }

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
            const response = await fetch(`${ApiTarget}/user`, {
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
            if (response && !response.ok) {
                const errorInfo = gestionarErrorServidor(response);
                setErrorMessage(errorInfo.mensaje);
                return;
            }
            updateUserInLocalStorage(datosUsuario, 'editar');
            onSuccess?.();
            if (user?.id === value.id) {
                logout();
            }
        } catch (err) {
            const errorInfo = gestionarErrorServidor(err);
            setErrorMessage(errorInfo.mensaje);
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

const NewUser = forwardRef<HTMLDivElement, ElimarUserProps>(({ onChange }, ref) => {
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
                    {errorMessage && <Aviso textoAviso={errorMessage} tipoAviso="error" />}
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
                                render: (row) => <ChangeStatus key={`status-${row.email}`} setErrorMessage={setErrorMessage} value={row} />,
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
                                            <EditUser editUser={row} onChange={() => refrescarUsuarios()} />
                                        </Tippy>
                                        <Tippy content={t('borrar')}>
                                            <DeleteUser editUser={row} setErrorMessage={setErrorMessage} onChange={() => refrescarUsuarios()} />
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

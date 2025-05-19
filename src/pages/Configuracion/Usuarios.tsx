import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrash from '../../components/Icon/IconTrash';
import IconPencil from '../../components/Icon/IconPencil';
import { useTranslation } from 'react-i18next';
import React, { forwardRef, useEffect, useState } from 'react';
import { TableUsersHazi, User } from '../../types/users';
import { ErrorMessage, Loading } from '../../components/Utils/animations';
import UserDateFormLogic from '../profile/userDateFormLogic';
import { updateUser } from '../../components/Utils/llamada';

interface EditUserProps {
    refIdEmail: string;
    recargeToSave: () => void;
}

interface NewUserProps {
    recargeToSave: () => void;
}

const EditUser = forwardRef<HTMLButtonElement, EditUserProps>(({ refIdEmail, recargeToSave }, ref) => {
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
                        <UserDateFormLogic refIdEmail={refIdEmail} roleDisabled={false} recargeToSave={recargeToSave} />
                    </div>
                </div>
            )}
        </>
    );
});

interface ChangeStatusProps {
    keyName: keyof TableUsersHazi;
    value: TableUsersHazi;
    onSuccess?: () => void;
}

const ChangeStatus = forwardRef<HTMLTableCellElement, ChangeStatusProps>(({ keyName, value, onSuccess }, ref) => {
    const { t } = useTranslation();
    const [localStatus, setLocalStatus] = useState<boolean>(!!value.status);

    const handleToggle = async () => {
        const newStatus = !localStatus;
        setLocalStatus(newStatus);

        try {
            await updateUser({
                ...value,
                status: newStatus,
                idEmail: value.email,
            });
            onSuccess?.();
        } catch (err) {
            console.error('Error actualizando el estado:', err);
            setLocalStatus(!newStatus);
        }
    };

    return (
        <td ref={ref} className="whitespace-nowrap">
            {keyName === 'status' ? (
                <button type="button" onClick={handleToggle} className="cursor-pointer" title={t('cambiarEstado')}>
                    {localStatus ? '🟢' : '🔴'}
                </button>
            ) : (
                String(value[keyName] ?? '')
            )}
        </td>
    );
});

const DeleteUser = forwardRef<HTMLButtonElement, EditUserProps>(({ refIdEmail, recargeToSave }, ref) => {
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
                body: JSON.stringify({ idEmail: refIdEmail }),
            });

            if (!response.ok) {
                throw new Error(t('noSePudoEliminarUsuario'));
            }

            const data = await response.json();

            if (data.success && recargeToSave) {
                recargeToSave();
            }

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

const NewUser = forwardRef<HTMLButtonElement, NewUserProps>(({ recargeToSave }, ref) => {
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
                        {/* <UserDateFormLogic refIdEmail={'newEmail'} roleDisabled={false} recargeToSave={recargeToSave}/> */}
                    </div>
                </div>
            )}
        </>
    );
});

const Index = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<TableUsersHazi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };
    useEffect(() => {
        setLoading(true);
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || t('errorObtenerUsuarios'));
                setUsers(data.users);
                localStorage.setItem('users', JSON.stringify(data.users));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, [refreshKey]);

    if (loading) return <Loading />;
    if (error) return <ErrorMessage message={error} />;
    if (users.length === 0) return <div>No hay datos para mostrar</div>;

    const headers = Object.keys(users[0]) as (keyof TableUsersHazi)[];
    const headersOrdered = [...headers].sort((a, b) => {
        if (a === 'status') return -1;
        if (b === 'status') return 1;
        return 0;
    });

    return (
        <div className="flex w-full gap-5">
            <div className="panel h-full w-full">
                <div className="flex justify-center mb-5">
                    <NewUser recargeToSave={handleRefresh} />
                </div>
                <div className="table-responsive mb-5">
                    <table>
                        <thead>
                            <tr>
                                {headersOrdered.map((key) => (
                                    <th key={key as string}>{key === 'status' ? '' : t(key)}</th>
                                ))}
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((row) => (
                                <tr key={row.email}>
                                    {headersOrdered.map((key) => (
                                        <ChangeStatus key={`${row.email}-${key}`} keyName={key} value={row} onSuccess={handleRefresh} />
                                    ))}
                                    <td className="text-center">
                                        <div className="flex justify-end space-x-3">
                                            <Tippy content={t('editar')}>
                                                <EditUser refIdEmail={row.email} recargeToSave={handleRefresh} />
                                            </Tippy>
                                            <Tippy content={t('borrar')}>
                                                <DeleteUser refIdEmail={row.email} recargeToSave={handleRefresh} />
                                            </Tippy>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Index;

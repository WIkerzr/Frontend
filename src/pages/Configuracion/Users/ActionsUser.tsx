import { forwardRef, useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrash from '../../../components/Icon/IconTrash';
import { ApiTarget } from '../../../components/Utils/data/controlDev';
import { FetchConRefreshRetry, gestionarErrorServidor, NewModal } from '../../../components/Utils/utils';
import { UserID } from '../../../types/users';
import { UsersDateModalLogic, updateUserInLocalStorage } from './componentes';
import { useUser } from '../../../contexts/UserContext';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../contexts/AuthContext';

interface EditUserProps {
    editUser: UserID;
    onChange: () => void;
}

export const EditUser = forwardRef<HTMLButtonElement, EditUserProps>(({ editUser, onChange }, ref) => {
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

export const DeleteUser = forwardRef<HTMLButtonElement, DeleteUserProps>(({ editUser, setErrorMessage, onChange }, ref) => {
    const { t } = useTranslation();

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
        const token = sessionStorage.getItem('access_token');

        if (!confirmDelete) return;

        try {
            const response = await FetchConRefreshRetry(`${ApiTarget}/deleteUser`, {
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

export const ChangeStatus: React.FC<ChangeStatusProps> = ({ value, onSuccess, setErrorMessage }) => {
    const { t } = useTranslation();
    const [localStatus, setLocalStatus] = useState<boolean>(!!value.status);
    const { user } = useUser();
    const { logout } = useAuth();

    const handleToggle = async () => {
        const token = sessionStorage.getItem('access_token');
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
            const response = await FetchConRefreshRetry(`${ApiTarget}/user`, {
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

export const NewUser = () => {
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
        }, 300);
    };

    return (
        <>
            <div className="flex-grow"></div>
            <button type="button" className="btn btn-primary w-1/4 " onClick={handleOpen}>
                {t('agregarUsuario')}
            </button>

            <NewModal open={showModal} onClose={() => setShowModal(false)} title={t('datosUsuarios')}>
                <UsersDateModalLogic accion="nuevo" onClose={() => handleClose()} title={false} />
            </NewModal>
        </>
    );
};

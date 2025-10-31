import { useLocation, useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import IconLogout from '../../components/Icon/IconLogout';
import { useAuth } from '../../contexts/AuthContext'; // Asegúrate de que la ruta es correcta
import { RootContext } from '../../main';
import { useContext } from 'react';

const LogoutItem = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const { t } = useTranslation();
    const { logout } = useAuth();
    const { handleLogout } = useContext(RootContext);

    const logoutNav = () => {
        logout();
        navigate('/Authenticacion/Login');
        handleLogout?.();
    };
    const handleLogoutLastPass = () => {
        const partesRuta = location.pathname.split('/').filter(Boolean);

        if (partesRuta.length > 2 && partesRuta[0] != 'configuracion') {
            const confirmar = window.confirm(t('object:cambioPagina'));
            if (confirmar) {
                logoutNav();
            }
        } else {
            logoutNav();
        }
    };

    return (
        <li className="border-t border-white-light dark:border-white-light/10">
            <button onClick={handleLogoutLastPass} className="text-danger !py-3 flex items-center w-full text-left">
                <IconLogout className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" />
                <span>{t('cerrarSesion')}</span>
            </button>
        </li>
    );
};

export default LogoutItem;

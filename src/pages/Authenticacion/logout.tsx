import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import IconLogout from '../../components/Icon/IconLogout';
import { useAuth } from '../../contexts/AuthContext'; // Asegúrate de que la ruta es correcta

const LogoutItem = () => {
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/Authenticacion/Login');
    };

    return (
        <li className="border-t border-white-light dark:border-white-light/10">
            <button onClick={handleLogout} className="text-danger !py-3 flex items-center w-full text-left">
                <IconLogout className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" />
                <span>{t('cerrarSesion')}</span>
            </button>
        </li>
    );
};

export default LogoutItem;

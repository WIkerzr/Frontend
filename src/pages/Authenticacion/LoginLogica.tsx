import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '../../store/authSlice';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserID, UserRole } from '../../types/users';
import { ApiTargetToken } from '../../components/Utils/data/controlDev';
import { gestionarErrorServidor } from '../../components/Utils/utils';
import { useTranslation } from 'react-i18next';
import { HomeComponent } from '../../router/routes';
import { useRegionContext } from '../../contexts/RegionContext';

const useLogin = () => {
    const { setRegionSeleccionada } = useRegionContext();
    const { t, i18n } = useTranslation();

    const { login } = useAuth();
    const { setUser, recordarSesion } = useUser();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');

    const [DefaultPath] = HomeComponent;

    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();
        localStorage.removeItem('users');
        try {
            const response = await fetch(ApiTargetToken, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'password',
                    username: email,
                    password: password,
                    client_id: 'webApp',
                    idioma: i18n.language,
                }).toString(),
            });

            interface BackendResponse {
                ambit: string;
                apellido1: string;
                apellido2: string;
                emailConfirmed: string;
                nombre: string;
                userName: string;
                rol: string;
                message: string;
                access_token: string;
                refresh_token: string;
                userId: string;
            }
            interface BackendError {
                error: string;
                error_description: string;
            }

            function isBackendError(result: BackendResponse | BackendError): result is BackendError {
                return (result as BackendError).error !== undefined;
            }

            const result: BackendResponse | BackendError = await response.json();

            if (response && !response.ok) {
                if (isBackendError(result)) {
                    if (result.error === 'invalid_grant1') {
                        setError(t('error:errorCorreoUsuarioNoValido'));
                    } else if (result.error === 'invalid_grant2') {
                        setError(t('error:errorContrasenaUsuarioNoValido'));
                    } else if (result.error === 'invalid_grant3') {
                        setError(t('error:El usuario esta deshabilitado'));
                    }
                } else {
                    const errorInfo = gestionarErrorServidor(response);
                    setError(errorInfo.mensaje);
                }

                return;
            }
            if (!isBackendError(result)) {
                const isUserRole = (value: string): value is UserRole => {
                    const allowedRoles: string[] = ['HAZI', 'GOBIERNOVASCO', 'ADR'];
                    return typeof value === 'string' && allowedRoles.includes(value.toUpperCase());
                };
                const user: UserID = {
                    name: result.nombre,
                    lastName: result.apellido1,
                    secondSurname: result.apellido2,
                    email: result.userName,
                    role: isUserRole(result.rol) ? result.rol : 'GOBIERNOVASCO',
                    ambit: result.ambit != '' ? result.ambit : parseInt(result.ambit, 10),
                    password: '',
                    status: result.emailConfirmed === 'True',
                    id: result.userId,
                };

                const token = result.access_token;
                const refreshToken = result.refresh_token;
                if (Number(user.ambit) > 0) {
                    setRegionSeleccionada(Number(user.ambit));
                }

                login({ user });

                setUser(user);
                const authUser = {
                    name: result.nombre,
                    email: result.userName,
                };
                dispatch(setAuthUser({ user: authUser, token }));

                sessionStorage.setItem('access_token', token);
                if (recordarSesion) {
                    sessionStorage.setItem('refresh_token', refreshToken);
                }

                setTimeout(() => {
                    navigate(DefaultPath);
                }, 200);
            }
        } catch (err) {
            const errorInfo = gestionarErrorServidor(err);
            setError(errorInfo.mensaje);
        }
    };

    return { email, setEmail, password, setPassword, submitForm, error };
};

export default useLogin;

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '../../store/authSlice';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';
import { useRegionContext } from '../../contexts/RegionContext';
import { UserID, UserRole } from '../../types/users';
import { useTranslation } from 'react-i18next';
import { ApiTargetToken } from '../../components/Utils/gets/controlDev';

const useLogin = () => {
    const { t } = useTranslation();
    const { setRegionSeleccionada } = useRegionContext();

    const { login } = useAuth();
    const { setUser } = useUser();
    const dispatch = useDispatch();
    const navigate = useNavigate();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const submitForm = async (e: React.FormEvent) => {
        e.preventDefault();

        try {
            const response = await fetch(ApiTargetToken, {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    grant_type: 'password',
                    username: email,
                    password: password,
                    client_id: 'webApp',
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
                userId: string;
            }

            ////////////////////////////////
            const result: BackendResponse = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error desconocido');
            }

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
            setRegionSeleccionada(Number(user.ambit));

            login({ user });

            setUser(user);
            const authUser = {
                name: result.nombre,
                email: result.userName,
            };
            dispatch(setAuthUser({ user: authUser, token }));

            localStorage.setItem('token', token);
            sessionStorage.setItem('token', token);

            setTimeout(() => {
                navigate('/');
            }, 200);
        } catch (err) {
            if (err instanceof Error) {
                setError(t('error:errorNoSePudoConectarServidor'));
            } else {
                setError('Ocurrió un error inesperado');
            }
        }
    };

    return { email, setEmail, password, setPassword, submitForm, error };
};

export default useLogin;

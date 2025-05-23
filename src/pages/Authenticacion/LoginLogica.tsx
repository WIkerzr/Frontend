import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { setAuthUser } from '../../store/authSlice';
import { useUser } from '../../contexts/UserContext';
import { useAuth } from '../../contexts/AuthContext';

const useLogin = () => {
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
            // const loginData = {
            //     userName: email,
            //     password: password,
            //     useRefreshTokens: true,
            // };

            // authlogin(loginData)
            //     .then((response) => {
            //         console.log('Login exitoso:', response);
            //     })
            //     .catch((error) => {
            //         console.error('Error al hacer login:', error);
            //     });

            const response = await fetch('https://localhost:44300/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.message || 'Error desconocido');
            }

            const token = result.token;
            const user = result.user;

            login({ user });

            setUser(user);
            dispatch(setAuthUser({ user, token }));

            navigate('/');
        } catch (err) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('Ocurrió un error inesperado');
            }
        }
    };

    return { email, setEmail, password, setPassword, submitForm, error };
};

export default useLogin;

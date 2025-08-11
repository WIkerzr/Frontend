import axios from 'axios';
import { ApiTarget } from '../components/Utils/data/controlDev';

const api = axios.create({
    baseURL: ApiTarget,
});

api.interceptors.request.use(
    (config) => {
        if (config.url?.includes('/token')) {
            return config;
        }
        const token = sessionStorage.getItem('access_token');
        const idioma = localStorage.getItem('i18nextLng') || 'es';

        if (token) {
            config.headers.Authorization = `Bearer ${token}`;
        }

        config.headers['Accept-Language'] = idioma;

        return config;
    },
    (error) => {
        return Promise.reject(error);
    }
);

// Interceptor de respuestas: redirige si token ha expirado
api.interceptors.response.use(
    (response) => response,
    (error) => {
        const is401 = error.response?.status === 401;
        const isInLoginPage = window.location.pathname === '/Authenticacion/Login';

        if (is401 && !isInLoginPage) {
            sessionStorage.removeItem('access_token');

            setTimeout(() => {
                window.location.href = '/Authenticacion/Login';
            }, 1500);
        }

        return Promise.reject(error);
    }
);
export default api;

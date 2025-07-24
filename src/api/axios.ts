import axios from 'axios';

const api = axios.create({
    baseURL: '/api',
});

api.interceptors.request.use(
    (config) => {
        if (config.url?.includes('/token')) {
            return config;
        }
        const token = localStorage.getItem('token');
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
        if (error.response?.status === 401) {
            localStorage.removeItem('token');
            window.location.href = '/login'; // Redirige al login
        }

        return Promise.reject(error);
    }
);

export default api;

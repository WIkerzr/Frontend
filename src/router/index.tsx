import { createBrowserRouter } from 'react-router-dom';
import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { routes } from './routes';
import { ProtectedRoute } from '../components/ProtectedRoute'; // Asegúrate de tener este componente
import { worker } from '../mocks/browser';

if (process.env.NODE_ENV === 'development') {
    worker.stop();
}

const protectedPaths = [
    '/',
    '/adr/CuadroMando',
    '/adr/acciones',
    '/adr/accionesAccesorias',
    '/adr/memoriasAnuales',
    '/adr/planesGestion',
    '/adr/servicios',
    '/configuracion/indicadores',
    '/configuracion/usuarios',
    '/profile',
];
const finalRoutes = routes.map((route) => {
    const elementWithLayout = route.layout === 'blank' ? <BlankLayout>{route.element}</BlankLayout> : <DefaultLayout>{route.element}</DefaultLayout>;
    const isProtected = protectedPaths.includes(route.path);

    return {
        ...route,
        element: isProtected ? <ProtectedRoute>{elementWithLayout}</ProtectedRoute> : elementWithLayout,
    };
});
const router = createBrowserRouter(finalRoutes);

export default router;

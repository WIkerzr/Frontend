import { createBrowserRouter, RouteObject } from 'react-router-dom';

import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { routes } from './routes';

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

const finalRoutes = routes.map((route) => ({
    ...route,
    element: route.layout === 'blank' ? <BlankLayout>{route.element}</BlankLayout> : <DefaultLayout>{route.element}</DefaultLayout>,
}));

const routerRoutes: RouteObject[] = finalRoutes.map((route) => {
    return {
        path: route.path,
        element: route.element,
    };
});

const router = createBrowserRouter(routerRoutes);

export default router;

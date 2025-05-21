import React from 'react';
import { createBrowserRouter, RouteObject } from 'react-router-dom';

import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { routes } from './routes';
import ProtectedRoute from '../components/ProtectedRoute';

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
    if (protectedPaths.includes(route.path)) {
        return {
            path: route.path,
            element: <ProtectedRoute />, // Envolvemos con protección
            children: [
                {
                    path: '',
                    element: route.element,
                },
            ],
        };
    }

    // Rutas públicas sin protección (ej: login)
    return {
        path: route.path,
        element: route.element,
    };
});

const router = createBrowserRouter(routerRoutes);

export default router;

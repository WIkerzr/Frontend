import { createBrowserRouter } from 'react-router-dom';
import BlankLayout from '../components/Layouts/BlankLayout';
import { routes } from './routes';
import { ProtectedRoute } from '../components/ProtectedRoute'; // Asegúrate de tener este componente
import React, { Suspense } from 'react';
const DefaultLayout = React.lazy(() => import('../components/Layouts/DefaultLayout'));

// import { worker } from '../mocks/browser';

// if (process.env.NODE_ENV === 'development') {
// worker.start();
// }

const protectedPaths = [
    '/',
    '/configuracion/indicadores',
    '/configuracion/usuarios',
    '/configuracion/CuadroMando',
    '/configuracion/indicadoresImpacto',
    '/configuracion/indicadoresADR',
    '/configuracion/PCDR',
    '/configuracion/informes',
    '/adr/Ejes',
    '/adr/acciones',
    '/adr/acciones/editando',
    '/adr/accionesYproyectos',
    '/adr/accionesYproyectos/editando',
    '/adr/servicios',
    '/adr/servicios/editando',
    '/adr/planesGestion',
    '/adr/planesGestion/gestionEnvio',
    '/adr/memoriasAnuales',
    '/adr/memoriasAnuales/gestionEnvio',
    '/profile',
];
const finalRoutes = routes.map((route) => {
    const elementWithLayout =
        route.layout === 'blank' ? (
            <BlankLayout>{route.element}</BlankLayout>
        ) : (
            <Suspense>
                <DefaultLayout>{route.element}</DefaultLayout>
            </Suspense>
        );
    const isProtected = protectedPaths.includes(route.path);

    return {
        ...route,
        element: isProtected ? <ProtectedRoute>{elementWithLayout}</ProtectedRoute> : elementWithLayout,
        errorElement: route.errorElement,
    };
});
const router = createBrowserRouter(finalRoutes);

export default router;

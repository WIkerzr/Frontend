import { createBrowserRouter } from 'react-router-dom';
import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { routes } from './routes';
import { ProtectedRoute } from '../components/ProtectedRoute'; // Asegúrate de tener este componente
// import { worker } from '../mocks/browser';

// if (process.env.NODE_ENV === 'development') {
// worker.start();
// }

const protectedPaths = [
    '/',
    '/configuracion/indicadores',
    '/configuracion/usuarios',
    '/configuracion/CuadroMando',
    '/configuracion/indicadoresInpacto',
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
    const elementWithLayout = route.layout === 'blank' ? <BlankLayout>{route.element}</BlankLayout> : <DefaultLayout>{route.element}</DefaultLayout>;
    const isProtected = protectedPaths.includes(route.path);

    return {
        ...route,
        element: isProtected ? <ProtectedRoute>{elementWithLayout}</ProtectedRoute> : elementWithLayout,
        errorElement: route.errorElement,
    };
});
const router = createBrowserRouter(finalRoutes);

export default router;

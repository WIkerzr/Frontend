import { lazy } from 'react';
import { OnlyIfNotLoggedIn } from '../components/OnlyIfNotLoggedIn';
const CuadroMando = lazy(() => import('../pages/ADR/CuadroMando'));
const Ejes = lazy(() => import('../pages/ADR/Ejes'));
const Acciones = lazy(() => import('../pages/ADR/Acciones'));
const EditarAccion = lazy(() => import('../pages/ADR/Acciones/EditarAccion'));
const AccionesAccesorias = lazy(() => import('../pages/ADR/AccionesAccesorias'));
const MemoriasAnuales = lazy(() => import('../pages/ADR/MemoriasAnuales'));
const PlanesGestion = lazy(() => import('../pages/ADR/Plan/PlanesGestion'));
const PlanesGestionEnvio = lazy(() => import('../pages/ADR/Plan/PlanesGestionEnvio'));
const Servicios = lazy(() => import('../pages/ADR/Servicios'));
const Login = lazy(() => import('../pages/Authenticacion/LoginBoxed'));
const Profile = lazy(() => import('../pages/profile/profile'));

const Indicadores = lazy(() => import('../pages/Configuracion/Indicadores'));
const Usuarios = lazy(() => import('../pages/Configuracion/Usuarios'));

const routes = [
    {
        path: '/',
        element: <CuadroMando />,
        layout: 'default',
    },
    {
        path: '/adr/CuadroMando',
        element: <CuadroMando />,
        layout: 'CuadroMando',
    },
    {
        path: '/adr/Ejes',
        element: <Ejes />,
        layout: 'Ejes',
    },
    {
        path: '/adr/acciones',
        element: <Acciones />,
        layout: 'Acciones',
    },
    {
        path: '/adr/acciones/editando',
        element: <EditarAccion />,
        layout: 'EditarAccion',
    },
    {
        path: '/adr/accionesAccesorias',
        element: <AccionesAccesorias />,
        layout: 'AccionesAccesorias',
    },
    {
        path: '/adr/memoriasAnuales',
        element: <MemoriasAnuales />,
        layout: 'MemoriasAnuales',
    },
    {
        path: '/adr/planesGestion',
        element: <PlanesGestion />,
        layout: 'PlanesGestion',
    },
    {
        path: '/adr/planesGestionEnvio',
        element: <PlanesGestionEnvio />,
        layout: 'PlanesGestionEnvio',
    },
    {
        path: '/adr/servicios',
        element: <Servicios />,
        layout: 'Servicios',
    },
    {
        path: '/configuracion/indicadores',
        element: <Indicadores />,
        layout: 'indicadores',
    },
    {
        path: '/configuracion/usuarios',
        element: <Usuarios />,
        layout: 'Usuarios',
    },
    {
        path: '/Authenticacion/Login',
        element: (
            <OnlyIfNotLoggedIn>
                <Login />
            </OnlyIfNotLoggedIn>
        ),
        layout: 'blank',
    },
    {
        path: '/profile',
        element: <Profile />,
        layout: 'Profile',
    },
];

export { routes };

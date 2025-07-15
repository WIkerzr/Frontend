import { lazy } from 'react';
import { OnlyIfLoggedIn, OnlyIfNotLoggedIn } from '../components/OnlyIfNotLoggedIn';
import NotFound from './NotFound';
const CuadroMando = lazy(() => import('../pages/Configuracion/CuadroMando'));
const Informes = lazy(() => import('../pages/Configuracion/Informes'));
const Ejes = lazy(() => import('../pages/ADR/Ejes'));
const Acciones = lazy(() => import('../pages/ADR/Acciones'));
const EditarAccion = lazy(() => import('../pages/ADR/Acciones/EditarAccion'));
const AccionesAccesorias = lazy(() => import('../pages/ADR/AccionesAccesorias'));
const MemoriasAnuales = lazy(() => import('../pages/ADR/MemoriasAnuales'));
const IndicadoresInpacto = lazy(() => import('../pages/Configuracion/IndicadoresInpacto'));
const IndicadoresADR = lazy(() => import('../pages/Configuracion/IndicadoresADR'));
const PCDR = lazy(() => import('../pages/Configuracion/PCDR'));
const PlanesGestion = lazy(() => import('../pages/ADR/Plan/PlanesGestion'));
const GestionEnvio = lazy(() => import('../pages/ADR/Plan/GestionEnvio'));
const Servicios = lazy(() => import('../pages/ADR/Servicios'));
const EditarServicios = lazy(() => import('../pages/ADR/EditarServicios'));
const Login = lazy(() => import('../pages/Authenticacion/LoginBoxed'));
const Profile = lazy(() => import('../pages/profile/profile'));

const Indicadores = lazy(() => import('../pages/Configuracion/Indicadores'));
const Usuarios = lazy(() => import('../pages/Configuracion/Usuarios'));

const routes = [
    {
        path: '/',
        element: (
            <OnlyIfLoggedIn>
                <CuadroMando />
            </OnlyIfLoggedIn>
        ),
        errorElement: <NotFound />,
        layout: 'default',
    },
    {
        path: '/configuracion/CuadroMando',
        element: (
            <OnlyIfLoggedIn>
                <CuadroMando />
            </OnlyIfLoggedIn>
        ),
        layout: 'CuadroMando',
    },
    {
        path: '/configuracion/indicadores',
        element: (
            <OnlyIfLoggedIn>
                <Indicadores />
            </OnlyIfLoggedIn>
        ),
        layout: 'indicadores',
    },
    {
        path: '/configuracion/usuarios',
        element: (
            <OnlyIfLoggedIn>
                <Usuarios />
            </OnlyIfLoggedIn>
        ),
        layout: 'Usuarios',
    },
    {
        path: '/configuracion/indicadoresInpacto',
        element: (
            <OnlyIfLoggedIn>
                <IndicadoresInpacto />
            </OnlyIfLoggedIn>
        ),
        layout: 'IndicadoresInpacto',
    },
    {
        path: '/configuracion/indicadoresADR',
        element: (
            <OnlyIfLoggedIn>
                <IndicadoresADR />
            </OnlyIfLoggedIn>
        ),
        layout: 'IndicadoresADR',
    },
    {
        path: '/configuracion/PCDR',
        element: (
            <OnlyIfLoggedIn>
                <PCDR />
            </OnlyIfLoggedIn>
        ),
        layout: 'PCDR',
    },
    {
        path: '/configuracion/informes',
        element: (
            <OnlyIfLoggedIn>
                <Informes />
            </OnlyIfLoggedIn>
        ),
        layout: 'Informes',
    },
    {
        path: '/adr/Ejes',
        element: (
            <OnlyIfLoggedIn>
                <Ejes />
            </OnlyIfLoggedIn>
        ),
        layout: 'Ejes',
    },
    {
        path: '/adr/acciones',
        element: (
            <OnlyIfLoggedIn>
                <Acciones />
            </OnlyIfLoggedIn>
        ),
        layout: 'Acciones',
    },
    {
        path: '/adr/acciones/editando',
        element: (
            <OnlyIfLoggedIn>
                <EditarAccion />
            </OnlyIfLoggedIn>
        ),
        layout: 'EditarAccion',
    },
    {
        path: '/adr/accionesAccesorias',
        element: (
            <OnlyIfLoggedIn>
                <AccionesAccesorias />
            </OnlyIfLoggedIn>
        ),
        layout: 'AccionesAccesorias',
    },
    {
        path: '/adr/servicios',
        element: (
            <OnlyIfLoggedIn>
                <Servicios />
            </OnlyIfLoggedIn>
        ),
        layout: 'Servicios',
    },
    {
        path: '/adr/servicios/editando',
        element: (
            <OnlyIfLoggedIn>
                <EditarServicios />
            </OnlyIfLoggedIn>
        ),
        layout: 'EditarServicios',
    },
    {
        path: '/adr/planesGestion',
        element: (
            <OnlyIfLoggedIn>
                <PlanesGestion />
            </OnlyIfLoggedIn>
        ),
        layout: 'PlanesGestion',
    },
    {
        path: '/adr/planesGestion/gestionEnvio',
        element: (
            <OnlyIfLoggedIn>
                <GestionEnvio />
            </OnlyIfLoggedIn>
        ),
        layout: 'planesGestion/GestionEnvio',
    },
    {
        path: '/adr/memoriasAnuales',
        element: (
            <OnlyIfLoggedIn>
                <MemoriasAnuales />
            </OnlyIfLoggedIn>
        ),
        layout: 'MemoriasAnuales',
    },

    {
        path: '/adr/memoriasAnuales/gestionEnvio',
        element: (
            <OnlyIfLoggedIn>
                <GestionEnvio />
            </OnlyIfLoggedIn>
        ),
        layout: 'memoriasAnuales/GestionEnvio',
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
        element: (
            <OnlyIfLoggedIn>
                <Profile />
            </OnlyIfLoggedIn>
        ),
        layout: 'Profile',
    },
];

export { routes };

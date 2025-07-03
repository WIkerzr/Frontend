import { lazy } from 'react';
import { OnlyIfLoggedIn, OnlyIfNotLoggedIn } from '../components/OnlyIfNotLoggedIn';
const CuadroMando = lazy(() => import('../pages/ADR/CuadroMando'));
const Ejes = lazy(() => import('../pages/ADR/Ejes'));
const Acciones = lazy(() => import('../pages/ADR/Acciones'));
const EditarAccion = lazy(() => import('../pages/ADR/Acciones/EditarAccion'));
const AccionesAccesorias = lazy(() => import('../pages/ADR/AccionesAccesorias'));
const MemoriasAnuales = lazy(() => import('../pages/ADR/MemoriasAnuales'));
const IndicadoresADR = lazy(() => import('../pages/ADR/IndicadoresADR'));
const PlanesGestion = lazy(() => import('../pages/ADR/Plan/PlanesGestion'));
const PlanesGestionEnvio = lazy(() => import('../pages/ADR/Plan/PlanesGestionEnvio'));
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
        layout: 'default',
    },
    {
        path: '/adr/CuadroMando',
        element: (
            <OnlyIfLoggedIn>
                <CuadroMando />
            </OnlyIfLoggedIn>
        ),
        layout: 'CuadroMando',
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
        path: '/adr/indicadoresADR',
        element: (
            <OnlyIfLoggedIn>
                <IndicadoresADR />
            </OnlyIfLoggedIn>
        ),
        layout: 'IndicadoresADR',
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
        path: '/adr/planesGestion',
        element: (
            <OnlyIfLoggedIn>
                <PlanesGestion />
            </OnlyIfLoggedIn>
        ),
        layout: 'PlanesGestion',
    },
    {
        path: '/adr/planesGestionEnvio',
        element: (
            <OnlyIfLoggedIn>
                <PlanesGestionEnvio />
            </OnlyIfLoggedIn>
        ),
        layout: 'PlanesGestionEnvio',
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

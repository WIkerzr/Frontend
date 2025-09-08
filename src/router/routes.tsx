import { lazy } from 'react';
import { OnlyIfLoggedIn } from '../components/OnlyIfNotLoggedIn';
import { Fases } from '../components/Utils/data/controlDev';
const CuadroMando = lazy(() => import('../pages/Configuracion/CuadroMando'));
const Informes = lazy(() => import('../pages/Configuracion/Informes'));
const Ejes = lazy(() => import('../pages/ADR/Ejes'));
const Acciones = lazy(() => import('../pages/ADR/Acciones/Acciones'));
const EditarAccion = lazy(() => import('../pages/ADR/Acciones/EditarAccion/EditarAccion'));
const EditarServicios = lazy(() => import('../pages/ADR/Servicios/EditarServicios'));
const AccionesAccesorias = lazy(() => import('../pages/ADR/Acciones/AccionesAccesorias'));
const MemoriasAnuales = lazy(() => import('../pages/ADR/PlanMemoria/MemoriasAnuales'));
const IndicadoresInpacto = lazy(() => import('../pages/Configuracion/indicadoresImpacto/IndicadoresInpacto'));
const IndicadoresADR = lazy(() => import('../pages/Configuracion/Indicadores/IndicadoresADR'));
const PCDR = lazy(() => import('../pages/Configuracion/PCDR'));
const PlanesGestion = lazy(() => import('../pages/ADR/PlanMemoria/PlanesGestion'));
const GestionEnvio = lazy(() => import('../pages/ADR/PlanMemoria/GestionEnvio'));
const Servicios = lazy(() => import('../pages/ADR/Servicios/Servicios'));
const Login = lazy(() => import('../pages/Authenticacion/LoginBoxed'));
const Profile = lazy(() => import('../pages/profile/profile'));
const Indicadores = lazy(() => import('../pages/Configuracion/Indicadores/Indicadores'));
const Usuarios = lazy(() => import('../pages/Configuracion/Users/Usuarios'));

export const DefaultPath = Fases < 2 ? '/configuracion/usuarios' : '/configuracion/indicadoresADR';

const fase1 = [
    {
        path: '/profile',
        element: (
            <OnlyIfLoggedIn>
                <Profile />
            </OnlyIfLoggedIn>
        ),
        layout: 'Profile',
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
];
const fase2 = [
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
        path: '/adr/Ejes',
        element: (
            <OnlyIfLoggedIn>
                <Ejes />
            </OnlyIfLoggedIn>
        ),
        layout: 'Ejes',
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
];
const fase3 = [
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
];
const fase4 = [
    {
        path: '/adr/accionesYproyectos',
        element: (
            <OnlyIfLoggedIn>
                <AccionesAccesorias />
            </OnlyIfLoggedIn>
        ),
        layout: 'AccionesAccesorias',
    },
    {
        path: '/adr/accionesYproyectos/editando',
        element: (
            <OnlyIfLoggedIn>
                <EditarAccion />
            </OnlyIfLoggedIn>
        ),
        layout: 'EditarAccion',
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
];
const fase5 = [
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
];
const fase6 = [
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
];

const inicial = [
    {
        path: '/',
        element: (
            //<OnlyIfNotLoggedIn>
            <Login />
            //</OnlyIfNotLoggedIn>
        ),
        layout: 'blank',
    },
    {
        path: '/Authenticacion/Login',
        element: (
            //<OnlyIfNotLoggedIn>
            <Login />
            //</OnlyIfNotLoggedIn>
        ),
        layout: 'blank',
    },
    {
        path: '/Authenticacion/Login/Recuperar/*',
        element: <Login />,
        layout: 'blank',
    },
];
const todasLasFases = [fase1, fase2, fase3, fase4, fase5, fase6];
const fasesActivas = todasLasFases.slice(0, Fases);
const rutasDeFases = fasesActivas.flat();
const routes = [...inicial, ...rutasDeFases];

export { routes };

/* eslint-disable no-undef */
import { lazy } from 'react';
import { OnlyIfLoggedIn } from '../components/OnlyIfNotLoggedIn';
import NotFound from './NotFound';
import { Fases } from '../components/Utils/data/controlDev';
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
const Login = lazy(() => import('../pages/Authenticacion/LoginBoxed'));
const Profile = lazy(() => import('../pages/profile/profile'));
const Indicadores = lazy(() => import('../pages/Configuracion/Indicadores'));
const Usuarios = lazy(() => import('../pages/Configuracion/Usuarios'));

const paginaPorDefectoPorFases: { [key: number]: JSX.Element } = {
    1: <Usuarios />,
    2: <IndicadoresADR />,
    3: <Acciones />,
    4: <AccionesAccesorias />,
    5: <PlanesGestion />,
    6: <IndicadoresInpacto />,
};

const paginaPorDefectoPorFasesPath: { [key: number]: string } = {
    1: '/configuracion/usuarios',
    2: '/configuracion/indicadoresADR',
    3: '/adr/acciones',
    4: '/adr/accionesYproyectos',
    5: '/adr/planesGestion',
    6: '/configuracion/indicadoresInpacto',
};

export const HomeComponent: [string, JSX.Element] = [paginaPorDefectoPorFasesPath[Fases] || '/configuracion/CuadroMando', paginaPorDefectoPorFases[Fases] || <CuadroMando />];
const [DefaultPath, DefaultPage] = HomeComponent;

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
                <EditarAccion />
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
        path: DefaultPath,
        element: <OnlyIfLoggedIn>{DefaultPage}</OnlyIfLoggedIn>,
        errorElement: <NotFound />,
        layout: 'default',
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

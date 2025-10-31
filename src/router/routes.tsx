import { lazy } from 'react';
import { OnlyIfLoggedIn } from '../components/OnlyIfNotLoggedIn';
import { ModoDev } from '../components/Utils/data/controlDev';
import CuadroMando from '../pages/Configuracion/CuadroMando/CuadroMando';
import { ErrorPage } from './ErrorPage';
import Informes from '../pages/Configuracion/Informes/Informes';

const Ejes = lazy(() => import('../pages/ADR/Ejes'));
const Acciones = lazy(() => import('../pages/ADR/Acciones/Acciones'));
const EditarAccion = lazy(() => import('../pages/ADR/Acciones/EditarAccion/EditarAccion'));
const EditarAccionYProyectos = lazy(() => import('../pages/ADR/Acciones/EditarAccion/EditarAccion'));
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
const Plantillas = lazy(() => import('../pages/Configuracion/Plantillas'));
const Anualidad = lazy(() => import('../pages/Configuracion/Anualidad'));

const routes = [
    {
        path: '/profile',
        element: (
            <OnlyIfLoggedIn>
                <Profile />
            </OnlyIfLoggedIn>
        ),
        layout: 'Profile',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/configuracion/usuarios',
        element: (
            <OnlyIfLoggedIn>
                <Usuarios />
            </OnlyIfLoggedIn>
        ),
        layout: 'Usuarios',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/configuracion/indicadores',
        element: (
            <OnlyIfLoggedIn>
                <Indicadores />
            </OnlyIfLoggedIn>
        ),
        layout: 'indicadores',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/adr/Ejes',
        element: (
            <OnlyIfLoggedIn>
                <Ejes />
            </OnlyIfLoggedIn>
        ),
        layout: 'Ejes',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/configuracion/indicadoresADR',
        element: (
            <OnlyIfLoggedIn>
                <IndicadoresADR />
            </OnlyIfLoggedIn>
        ),
        layout: 'IndicadoresADR',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/adr/acciones',
        element: (
            <OnlyIfLoggedIn>
                <Acciones />
            </OnlyIfLoggedIn>
        ),
        layout: 'Acciones',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/adr/acciones/editando',
        element: (
            <OnlyIfLoggedIn>
                <EditarAccion />
            </OnlyIfLoggedIn>
        ),
        layout: 'EditarAccion',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/adr/accionesYproyectos',
        element: (
            <OnlyIfLoggedIn>
                <AccionesAccesorias />
            </OnlyIfLoggedIn>
        ),
        layout: 'AccionesAccesorias',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/adr/accionesYproyectos/editando',
        element: (
            <OnlyIfLoggedIn>
                <EditarAccionYProyectos />
            </OnlyIfLoggedIn>
        ),
        layout: 'EditarAccion',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/adr/servicios',
        element: (
            <OnlyIfLoggedIn>
                <Servicios />
            </OnlyIfLoggedIn>
        ),
        layout: 'Servicios',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/adr/servicios/editando',
        element: (
            <OnlyIfLoggedIn>
                <EditarServicios />
            </OnlyIfLoggedIn>
        ),
        layout: 'EditarServicios',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/adr/planesGestion',
        element: (
            <OnlyIfLoggedIn>
                <PlanesGestion />
            </OnlyIfLoggedIn>
        ),
        layout: 'PlanesGestion',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/adr/planesGestion/gestionEnvio',
        element: (
            <OnlyIfLoggedIn>
                <GestionEnvio />
            </OnlyIfLoggedIn>
        ),
        layout: 'planesGestion/GestionEnvio',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/adr/memoriasAnuales',
        element: (
            <OnlyIfLoggedIn>
                <MemoriasAnuales />
            </OnlyIfLoggedIn>
        ),
        layout: 'MemoriasAnuales',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },

    {
        path: '/adr/memoriasAnuales/gestionEnvio',
        element: (
            <OnlyIfLoggedIn>
                <GestionEnvio />
            </OnlyIfLoggedIn>
        ),
        layout: 'memoriasAnuales/GestionEnvio',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/configuracion/CuadroMando',
        element: (
            <OnlyIfLoggedIn>
                <CuadroMando />
            </OnlyIfLoggedIn>
        ),
        layout: 'CuadroMando',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/configuracion/indicadoresImpacto',
        element: (
            <OnlyIfLoggedIn>
                <IndicadoresInpacto />
            </OnlyIfLoggedIn>
        ),
        layout: 'IndicadoresInpacto',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/configuracion/plantillas',
        element: (
            <OnlyIfLoggedIn>
                <Plantillas />
            </OnlyIfLoggedIn>
        ),
        layout: 'Plantillas',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/configuracion/anualidad',
        element: (
            <OnlyIfLoggedIn>
                <Anualidad />
            </OnlyIfLoggedIn>
        ),
        layout: 'anualidad',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },

    {
        path: '/configuracion/PCDR',
        element: (
            <OnlyIfLoggedIn>
                <PCDR />
            </OnlyIfLoggedIn>
        ),
        layout: 'PCDR',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/configuracion/informes',
        element: (
            <OnlyIfLoggedIn>
                <Informes />
            </OnlyIfLoggedIn>
        ),
        layout: 'Informes',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/',
        element: (
            //<OnlyIfNotLoggedIn>
            <Login />
            //</OnlyIfNotLoggedIn>
        ),
        layout: 'blank',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/Authenticacion/Login',
        element: (
            //<OnlyIfNotLoggedIn>
            <Login />
            //</OnlyIfNotLoggedIn>
        ),
        layout: 'blank',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
    {
        path: '/Authenticacion/Login/Recuperar/*',
        element: <Login />,
        layout: 'blank',
        errorElement: !ModoDev ? <ErrorPage /> : undefined,
    },
];

export { routes };

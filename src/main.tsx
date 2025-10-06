import React, { Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import { UserProvider } from './contexts/UserContext';
import { MantineProvider } from '@mantine/core';
// Perfect Scrollbar
import 'react-perfect-scrollbar/dist/css/styles.css';

// Tailwind css
import './tailwind.css';

// i18n (needs to be bundled)
import './i18n';

// Router
import { RouterProvider } from 'react-router-dom';
import router from './router/index';

// Redux
import { Provider } from 'react-redux';
import store from './store/index';
import { AuthProvider } from './contexts/AuthContext';
import TableMantineProvider from './contexts/TableMantineContext';
import { RegionDataProvider } from './contexts/DatosAnualContext';
import { IndicadoresProvider } from './contexts/IndicadoresContext';
import { UsersProvider } from './contexts/UsersContext';
import { EstadosProvider } from './contexts/EstadosPorAnioContext';
import { RegionProvider } from './contexts/RegionContext';

export const RootContext = React.createContext<{ handleLogout?: () => void }>({});

function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <UserProvider>
                <AuthProvider>
                    <MantineProvider>
                        <UsersProvider>
                            <RegionProvider>
                                <RegionDataProvider>
                                    <IndicadoresProvider>
                                        <TableMantineProvider>
                                            <EstadosProvider>{children}</EstadosProvider>
                                        </TableMantineProvider>
                                    </IndicadoresProvider>
                                </RegionDataProvider>
                            </RegionProvider>
                        </UsersProvider>
                    </MantineProvider>
                </AuthProvider>
            </UserProvider>
        </Provider>
    );
}

function Root() {
    //const [loading, setLoading] = useState(true);
    // const [mantenimiento, setMantenimiento] = useState(false);
    //const [Caido, setCaido] = useState(false);
    const [key, setKey] = React.useState(0);

    // useEffect(() => {
    //     const controller = new AbortController();
    //     const timeout = setTimeout(() => controller.abort(), 5000);

    //     fetch(`${ApiTarget}/access`, { signal: controller.signal })
    //         .then((res) => {
    //             if (!res.ok) {
    //                 if (res.status === 500) {
    //                     setCaido(true);
    //                 } else {
    //                     setCaido(false);
    //                 }
    //                 setLoading(false);
    //                 return null;
    //             }
    //             return res.json();
    //         })
    //         .then((data) => {
    //             if (data !== null) {
    //                 // setMantenimiento(Boolean(data));
    //                 setCaido(false);
    //                 setLoading(false);
    //             }
    //         })
    //         .catch(() => {
    //             setCaido(true);
    //             setLoading(false);
    //         });

    //     return () => clearTimeout(timeout);
    // }, []);

    // if (loading) return <div>Cargando...</div>;
    // if (mantenimiento) {
    //     return (
    //         <div className="h-screen flex flex-col items-center justify-center text-center">
    //             <h1 className="text-3xl font-bold mb-4">🚧 Página en mantenimiento</h1>
    //             <p>Estamos realizando tareas de mantenimiento.</p>
    //         </div>
    //     );
    // }
    // if (Caido) {
    //     return (
    //         <div className="h-screen flex flex-col items-center justify-center text-center">
    //             <h1 className="text-3xl font-bold mb-4">⚠️ Servidor caído</h1>
    //             <p>El servidor no está disponible en este momento. Inténtalo más tarde.</p>
    //         </div>
    //     );
    // }

    const handleLogout = () => {
        setKey((k) => k + 1);
    };

    return (
        <>
            <RootContext.Provider value={{ handleLogout }}>
                <React.StrictMode>
                    <Suspense fallback={<div>Cargando módulo...</div>}>
                        <AppProviders key={key}>
                            <RouterProvider router={router} />
                        </AppProviders>
                    </Suspense>
                </React.StrictMode>
            </RootContext.Provider>
        </>
    );
}

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(<Root />);

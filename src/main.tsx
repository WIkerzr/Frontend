import React, { Suspense, useContext, useEffect } from 'react';
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
import { RouterProvider, useLocation } from 'react-router-dom';
import router from './router/index';

// Redux
import { Provider } from 'react-redux';
import store from './store/index';
import { AuthProvider } from './contexts/AuthContext';
import TableMantineProvider from './contexts/TableMantineContext';
import { RegionDataProvider } from './contexts/DatosAnualContext';
import { IndicadoresProvider } from './contexts/IndicadoresContext';
import { UsersProvider } from './contexts/UsersContext';
import { RegionEstadosProvider } from './contexts/RegionEstadosContext';

export const RootContext = React.createContext<{ handleLogout?: () => void }>({});
// ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
//     <React.StrictMode>
//         <Suspense>
//             <Provider store={store}>
//                 <UserProvider>
//                     <AuthProvider>
//                         <MantineProvider>
//                             <UsersProvider>
//                                 <RegionDataProvider>
//                                     <IndicadoresProvider>
//                                         <TableMantineProvider>
//                                             <RegionEstadosProvider>
//                                                 <RouterProvider router={router} />
//                                             </RegionEstadosProvider>
//                                         </TableMantineProvider>
//                                     </IndicadoresProvider>
//                                 </RegionDataProvider>
//                             </UsersProvider>
//                         </MantineProvider>
//                     </AuthProvider>
//                 </UserProvider>
//             </Provider>
//         </Suspense>
//     </React.StrictMode>
// );

function AppProviders({ children }: { children: React.ReactNode }) {
    return (
        <Provider store={store}>
            <UserProvider>
                <AuthProvider>
                    <MantineProvider>
                        <UsersProvider>
                            <RegionDataProvider>
                                <IndicadoresProvider>
                                    <TableMantineProvider>
                                        <RegionEstadosProvider>{children}</RegionEstadosProvider>
                                    </TableMantineProvider>
                                </IndicadoresProvider>
                            </RegionDataProvider>
                        </UsersProvider>
                    </MantineProvider>
                </AuthProvider>
            </UserProvider>
        </Provider>
    );
}

function Root() {
    const [key, setKey] = React.useState(0);

    const handleLogout = () => {
        setKey((k) => k + 1);
    };

    return (
        <>
            <RootContext.Provider value={{ handleLogout }}>
                <React.StrictMode>
                    <Suspense>
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

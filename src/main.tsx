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
import { RegionProvider } from './contexts/RegionContext';
import { AuthProvider } from './contexts/AuthContext';
import TableMantineProvider from './contexts/TableMantineContext';
import { EstadosPorAnioProvider } from './contexts/EstadosPorAnioContext';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
    <React.StrictMode>
        <Suspense>
            <Provider store={store}>
                <UserProvider>
                    <AuthProvider>
                        <MantineProvider>
                            <RegionProvider>
                                <TableMantineProvider>
                                    <EstadosPorAnioProvider>
                                        <RouterProvider router={router} />
                                    </EstadosPorAnioProvider>
                                </TableMantineProvider>
                            </RegionProvider>
                        </MantineProvider>
                    </AuthProvider>
                </UserProvider>
            </Provider>
        </Suspense>
    </React.StrictMode>
);

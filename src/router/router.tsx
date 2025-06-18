import { createBrowserRouter, RouteObject } from 'react-router-dom';

import BlankLayout from '../components/Layouts/BlankLayout';
import DefaultLayout from '../components/Layouts/DefaultLayout';
import { routes } from './routes';

const finalRoutes = routes.map((route) => ({
    ...route,
    element: route.layout === 'blank' ? <BlankLayout>{route.element}</BlankLayout> : <DefaultLayout>{route.element}</DefaultLayout>,
}));

const routerRoutes: RouteObject[] = finalRoutes.map((route) => {
    return {
        path: route.path,
        element: route.element,
    };
});

const router = createBrowserRouter(routerRoutes);

export default router;

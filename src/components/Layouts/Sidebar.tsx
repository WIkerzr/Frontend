import AnimateHeight from 'react-animate-height';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../store/themeConfigSlice';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '../Icon/IconCaretsDown';
import IconMinus from '../Icon/IconMinus';

import IconMenuAcciones from '../Icon/Menu/Adr/IconMenuAcciones';
import IconMenuAccionesAccesorias from '../Icon/Menu/Adr/IconMenuAccionesAccesorias';
import IconMenuMemoria from '../Icon/Menu/Adr/IconMenuMemoria';
import IconMenuPlanes from '../Icon/Menu/Adr/IconMenuPlanes';
import IconMenuServicios from '../Icon/Menu/Adr/IconMenuServicios';
import IconMenuConfiguracion from '../Icon/Menu/IconMenuConfiguracion';
import IconCaretDown from '../Icon/IconCaretDown';
import { useUser } from '../../contexts/UserContext';

const Sidebar = () => {
    //IMPORTANT Temporal borrar
    const { user } = useUser();
    const rol = user?.rol;

    const [currentMenu, setCurrentMenu] = useState<string>('');
    //const [errorSubMenu, setErrorSubMenu] = useState(false);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const location = useLocation();
    const dispatch = useDispatch();
    const { t } = useTranslation();
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };
    useEffect(() => {
        const selector = document.querySelector('.sidebar ul a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link') || [];
                if (ele.length) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele.click();
                    });
                }
            }
        }
    }, []);

    useEffect(() => {
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [location]);

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="bg-white dark:bg-black h-full">
                    <div className="flex justify-between items-center px-4 py-3">
                        <NavLink to="/" className="main-logo flex items-center shrink-0">
                            <img className="w-20 ltr:-ml-1 rtl:-mr-1 inline" src="/assets/images/logo.svg" alt="logo" />
                        </NavLink>

                        <button
                            type="button"
                            className="collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-gray-500/10 dark:hover:bg-dark-light/10 dark:text-white-light transition duration-300 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>

                    <PerfectScrollbar className="h-[calc(100vh-80px)] relative">
                        <ul className="relative font-semibold space-y-0.5 p-4 py-0">
                            {/* Configuracion */}
                            {rol === 'hazi' && (
                                <li className="menu nav-item">
                                    <button type="button" className={`${currentMenu === 'auth' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('configuracion')}>
                                        <div className="flex items-center">
                                            <IconMenuConfiguracion className="group-hover:!text-primary shrink-0" />
                                            <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('configuracion')}</span>
                                        </div>

                                        <div className={currentMenu !== 'auth' ? 'rtl:rotate-90 -rotate-90' : ''}>
                                            <IconCaretDown />
                                        </div>
                                    </button>
                                    <AnimateHeight duration={300} height={currentMenu === 'configuracion' ? 'auto' : 0}>
                                        <ul className="sub-menu text-gray-500">
                                            <li>
                                                <NavLink to="/configuracion/indicadores">{t('indicadores')}</NavLink>
                                            </li>
                                            <li>
                                                <NavLink to="/configuracion/usuarios">{t('usuarios')}</NavLink>
                                            </li>
                                        </ul>
                                    </AnimateHeight>
                                </li>
                            )}
                            <h2 className="py-3 px-7 flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1">
                                <IconMinus className="w-4 h-5 flex-none hidden" />
                                <span>{t('adr')}</span>
                            </h2>
                            {/* //ADR */}
                            <li className="nav-item">
                                <ul>
                                    {rol !== 'gobiernovasco' && (
                                        <li className="nav-item">
                                            <NavLink to="/adr/cuadroMando" className="group">
                                                <div className="flex items-center">
                                                    <IconMenuAcciones className="group-hover:!text-primary shrink-0" />
                                                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('CuadroMando')}</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )}
                                    {rol !== 'gobiernovasco' && (
                                        <li className="nav-item">
                                            <NavLink to="/adr/acciones" className="group">
                                                <div className="flex items-center">
                                                    <IconMenuAcciones className="group-hover:!text-primary shrink-0" />
                                                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('Acciones')}</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )}
                                    {rol !== 'gobiernovasco' && (
                                        <li className="nav-item">
                                            <NavLink to="/adr/accionesAccesorias" className="group">
                                                <div className="flex items-center">
                                                    <IconMenuAccionesAccesorias className="group-hover:!text-primary shrink-0" />
                                                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('AccionesAccesorias')}</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )}
                                    {rol !== 'gobiernovasco' && (
                                        <li className="nav-item">
                                            <NavLink to="/adr/servicios" className="group">
                                                <div className="flex items-center">
                                                    <IconMenuServicios className="group-hover:!text-primary shrink-0" />
                                                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('Servicios')}</span>
                                                </div>
                                            </NavLink>
                                        </li>
                                    )}
                                    <li className="nav-item">
                                        <NavLink to="/adr/planesGestion" className="group">
                                            <div className="flex items-center">
                                                <IconMenuPlanes className="group-hover:!text-primary shrink-0" />
                                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('PlanesGestion')}</span>
                                            </div>
                                        </NavLink>
                                    </li>
                                    <li className="nav-item">
                                        <NavLink to="/adr/memoriasAnuales" className="group">
                                            <div className="flex items-center">
                                                <IconMenuMemoria className="group-hover:!text-primary shrink-0" />
                                                <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('memoriasAnuales')}</span>
                                            </div>
                                        </NavLink>
                                    </li>
                                </ul>
                            </li>
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;

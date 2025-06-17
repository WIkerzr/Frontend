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
import IconMenuConfiguracion from '../Icon/Menu/IconMenuConfiguracion.svg';
import IconCaretDown from '../Icon/IconCaretDown';
import IconServiciosPrestados from '../Icon/Menu/IconServiciosPrestados.svg';
import IconAcciones from '../Icon/Menu/IconAcciones.svg';
import IconAccionesAccesorias from '../Icon/Menu/IconAccionesAccesorias.svg';
import IconCuadroMando from '../Icon/Menu/IconCuadroMando.svg';
import IconEjes from '../Icon/Menu/IconEjes.svg';
import IconPlan from '../Icon/Menu/IconPlan.svg';
import IconMemoria from '../Icon/Menu/IconMemoria.svg';
import { useUser } from '../../contexts/UserContext';
import { UserRole } from '../../types/users';
import { useRegionContext } from '../../contexts/RegionContext';
import { TabCard } from '../../pages/ADR/Acciones/EditarAccionComponent';
import { useEstadosPorAnio } from '../../contexts/EstadosPorAnioContext';

const Sidebar = () => {
    const { anio, estados, setAnio } = useEstadosPorAnio();
    const estadoPlan = estados[anio]?.plan ?? 'borrador';
    const estadoMemoria = estados[anio]?.memoria ?? 'cerrado';
    const { user } = useUser();
    const { regiones, regionSeleccionada } = useRegionContext();
    const [role, setRole] = useState<UserRole>();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const semidark = useSelector((state: IRootState) => state.themeConfig.semidark);
    const location = useLocation();
    const dispatch = useDispatch();
    const anioActual = new Date().getFullYear();
    const anios = [anioActual - 1, anioActual];
    const { t } = useTranslation();
    const toggleMenu = (value: string) => {
        setCurrentMenu((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    useEffect(() => {
        const rolUsuario = user!.role as String;
        setRole(rolUsuario.toUpperCase() as UserRole);
    }, []);

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
    }, [location]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        setAnio(Number(e.target.value));
    };

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
                            {role === 'HAZI' && (
                                <li className="menu nav-item">
                                    <button type="button" className={`${currentMenu === 'auth' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('configuracion')}>
                                        <div className="flex items-center">
                                            <img src={IconMenuConfiguracion} alt={t('CuadroMando')} className="w-6 h-6" />
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
                            <h2 className="py-3  flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1 justify-center">
                                <select value={anio} className="py-3  pr-4 w-[80%] uppercase font-extrabold bg-transparent" onChange={handleChange}>
                                    {anios.map((a) => (
                                        <option key={a} value={a}>
                                            {a}
                                        </option>
                                    ))}
                                </select>
                            </h2>
                            <div
                                style={{
                                    opacity: regionSeleccionada ? 1 : 0.5,
                                    pointerEvents: regionSeleccionada ? 'auto' : 'none',
                                    filter: regionSeleccionada ? 'none' : 'grayscale(0.5)',
                                    userSelect: regionSeleccionada ? 'auto' : 'none',
                                }}
                            >
                                <li className="nav-item">
                                    <ul>
                                        {role !== 'GOBIERNOVASCO' && (
                                            <li className="nav-item">
                                                <NavLink to="/adr/cuadroMando" className="group">
                                                    <div className="flex items-center">
                                                        <img src={IconCuadroMando} alt={t('CuadroMando')} className="w-6 h-6" />
                                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('CuadroMando')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                        )}
                                        {role !== 'GOBIERNOVASCO' && (
                                            <li className="nav-item">
                                                <NavLink to="/adr/ejes" className="group">
                                                    <div className="flex items-center">
                                                        <img src={IconEjes} alt={t('Ejes')} className="w-6 h-6" />
                                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('Ejes')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                        )}
                                        {role !== 'GOBIERNOVASCO' && (
                                            <li className="nav-item">
                                                <NavLink to="/adr/acciones" className="group">
                                                    <div className="flex items-center">
                                                        <img src={IconAcciones} alt={t('Acciones')} className="w-6 h-6" />
                                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('Acciones')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                        )}
                                        {role !== 'GOBIERNOVASCO' && (
                                            <li className="nav-item">
                                                <NavLink to="/adr/accionesAccesorias" className="group">
                                                    <div className="flex items-center">
                                                        <img src={IconAccionesAccesorias} alt={t('AccionesAccesorias')} className="w-6 h-6" />
                                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('AccionesAccesorias')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                        )}
                                        {role !== 'GOBIERNOVASCO' && (
                                            <li className="nav-item">
                                                <NavLink to="/adr/servicios" className="group">
                                                    <div className="flex items-center">
                                                        <img src={IconServiciosPrestados} alt={t('Servicios')} className="w-6 h-6" />
                                                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('Servicios')}</span>
                                                    </div>
                                                </NavLink>
                                            </li>
                                        )}
                                        <li className="nav-item">
                                            <NavLink to="/adr/planesGestion" className="group">
                                                <div className="flex items-center">
                                                    <TabCard
                                                        icon={IconPlan}
                                                        label="PlanGestion"
                                                        status={estadoPlan}
                                                        className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark"
                                                    />
                                                </div>
                                            </NavLink>
                                        </li>
                                        <li className="nav-item">
                                            <NavLink to="/adr/memoriasAnuales" className="group">
                                                <div className="flex items-center">
                                                    <TabCard
                                                        icon={IconMemoria}
                                                        label="memoriasAnuales"
                                                        status={estadoMemoria}
                                                        className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark"
                                                    />
                                                </div>
                                            </NavLink>
                                        </li>
                                    </ul>
                                </li>
                            </div>
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;

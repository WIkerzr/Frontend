// Sidebar component
import AnimateHeight from 'react-animate-height';
import PerfectScrollbar from 'react-perfect-scrollbar';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { NavLink, useLocation } from 'react-router-dom';
import { toggleSidebar } from '../../store/themeConfigSlice';
import { IRootState } from '../../store';
import { useState, useEffect } from 'react';
import IconCaretsDown from '../Icon/IconCaretsDown';
import IconMenuConfiguracion from '../Icon/Menu/IconMenuConfiguracion.svg';
import IconIndicadores from '../Icon/Menu/IconIndicadores.svg';
import IconCaretDown from '../Icon/IconCaretDown';
import IconServiciosPrestados from '../Icon/Menu/IconServiciosPrestados.svg';
import IconAcciones from '../Icon/Menu/IconAcciones.svg';
import IconAccionesAccesorias from '../Icon/Menu/IconAccionesAccesorias.svg';
import IconEjes from '../Icon/Menu/IconEjes.svg';
import IconPlan from '../Icon/Menu/IconPlan.svg';
import IconCuadroMando2 from '../Icon/Menu/IconCuadroMando2.svg';
import IconPCDR from '../Icon/Menu/IconPCDR.svg';
import IconInformes from '../Icon/Menu/IconInformes.svg';
import IconUsuarios from '../Icon/Menu/IconUsuarios.svg';
import IconMemoria from '../Icon/Menu/IconMemoria.svg';
import { useUser } from '../../contexts/UserContext';
import { UserRole } from '../../types/users';
import { TabCard } from '../../pages/ADR/Acciones/EditarAccion/EditarAccionComponent';
import { useYear } from '../../contexts/DatosAnualContext';
import { SideBarList } from '../Utils/utils';
import { useEstadosPorAnioContext } from '../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../contexts/RegionContext';
import { Loading } from '../Utils/animations';

const Sidebar = () => {
    const { regionSeleccionada } = useRegionContext();
    const { anioSeleccionada, anios, setAnio } = useEstadosPorAnioContext();
    const { yearData, loadingYearData } = useYear();
    const { user } = useUser();
    const [role, setRole] = useState<UserRole>();
    const [currentMenu, setCurrentMenu] = useState<string>('');
    const [indicadoresOpen, setIndicadoresOpen] = useState<boolean>(false);
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
        const rolUsuario = user!.role as string;
        setRole(rolUsuario.toUpperCase() as UserRole);
    }, []);

    useEffect(() => {
        const path = location.pathname || '';

        if (path.includes('/indicadores/indicadores') || path.includes('/indicadores/indicadoresADR') || path.includes('/indicadores/indicadoresImpacto')) {
            setIndicadoresOpen(true);
            setCurrentMenu('');
            return;
        }

        if (path.includes('/configuracion')) {
            setCurrentMenu('configuracion');
            setIndicadoresOpen(false);
            return;
        }

        setCurrentMenu('');
        setIndicadoresOpen(false);
    }, [location.pathname]);

    useEffect(() => {
        if (window.innerWidth < 1024 && themeConfig.sidebar) {
            dispatch(toggleSidebar());
        }
    }, [location]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedYear = Number(e.target.value);

        if (selectedYear && selectedYear !== anioSeleccionada) {
            sessionStorage.removeItem('DataYear');
            sessionStorage.removeItem('datosAccionModificado');

            setAnio(selectedYear);
        }
    };

    const DespegableConfiguracion = () => {
        return (
            <li className="menu nav-item">
                <button type="button" className={`${currentMenu === 'configuracion' ? 'active' : ''} nav-link group w-full`} onClick={() => toggleMenu('configuracion')}>
                    <div className="flex items-center">
                        <img src={IconMenuConfiguracion} alt={t('CuadroMando')} className="w-6 h-6" />
                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('configuracion')}</span>
                    </div>

                    <div className={`m-auto transition-transform duration-300 ${currentMenu === 'configuracion' ? 'rotate-0' : '-rotate-90'}`}>
                        <IconCaretDown />
                    </div>
                </button>
                <AnimateHeight duration={300} height={currentMenu === 'configuracion' ? 'auto' : 0}>
                    <ul className="sub-menu text-gray-500 text">
                        {role === 'HAZI' && (
                            <>
                                <li>
                                    <NavLink to="/configuracion/plantillas">{t('Plantillas')}</NavLink>
                                </li>
                                <li>
                                    <NavLink to="/configuracion/anualidad">{t('Anualidades')}</NavLink>
                                </li>
                            </>
                        )}
                    </ul>
                </AnimateHeight>
            </li>
        );
    };
    const DespegableIndicadores = () => {
        return (
            <li className="menu nav-item">
                <button type="button" className={`${indicadoresOpen ? 'active' : ''} nav-link group w-full`} onClick={() => setIndicadoresOpen((v) => !v)}>
                    <div className="flex items-center">
                        <img src={IconIndicadores} alt={t('indicadores')} className="w-6 h-6" />
                        <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{t('indicadores')}</span>
                    </div>

                    <div className={`m-auto transition-transform duration-300 ${indicadoresOpen ? 'rotate-0' : '-rotate-90'}`}>
                        <IconCaretDown />
                    </div>
                </button>
                <AnimateHeight duration={300} height={indicadoresOpen ? 'auto' : 0}>
                    <ul className="sub-menu text-gray-500 text">
                        {role === 'HAZI' && (
                            <li>
                                <NavLink to="/indicadores/indicadores">{t('indicadores')}</NavLink>
                            </li>
                        )}
                        <li>
                            <NavLink to="/indicadores/indicadoresADR">{t('indicadores') + ' ' + t('adr')}</NavLink>
                        </li>
                        <li>
                            <NavLink to="/indicadores/indicadoresImpacto">{t('indicadoresImpacto')}</NavLink>
                        </li>
                    </ul>
                </AnimateHeight>
            </li>
        );
    };

    const SelectorAnio = () => {
        return (
            <h2 className="py-3  flex items-center uppercase font-extrabold bg-white-light/30 dark:bg-dark dark:bg-opacity-[0.08] -mx-4 mb-1 justify-center">
                <select
                    value={anioSeleccionada || ''}
                    className={`py-3  pr-4 w-[80%] uppercase font-extrabold bg-transparent ${!regionSeleccionada || anioSeleccionada === null ? 'appearance-none' : ''}`}
                    onChange={handleChange}
                    disabled={(anios && anios.length === 0) || !regionSeleccionada}
                >
                    <option value="" disabled>
                        {anioSeleccionada ? t('seleccionaAnio') : regionSeleccionada ? t('sinAnosSelect') : t('seleccionaComarca')}
                    </option>
                    {anios.length > 0
                        ? anios.map((a) => (
                              <option key={a} value={a}>
                                  {a}
                              </option>
                          ))
                        : null}
                </select>
            </h2>
        );
    };

    const MenuADRLateral = () => {
        if (loadingYearData) return <Loading />;

        return (
            <div
                style={{
                    opacity: anioSeleccionada ? 1 : 0.5,
                    pointerEvents: anioSeleccionada ? 'auto' : 'none',
                    filter: anioSeleccionada ? 'none' : 'grayscale(0.5)',
                    userSelect: anioSeleccionada ? 'auto' : 'none',
                }}
            >
                <li className="nav-item">
                    <ul>
                        <SideBarList texto={t('Ejes')} link="/adr/ejes" src={IconEjes} role={role} />

                        <SideBarList
                            texto={t('AccionesPCDR')}
                            link="/adr/acciones"
                            src={IconAcciones}
                            role={role}
                            disabled={!(yearData.plan.ejesPrioritarios.length > 0 && yearData.plan.ejesPrioritarios.length <= 3)}
                        />
                        <SideBarList texto={t('AccionesAccesorias')} link="/adr/accionesYproyectos" src={IconAccionesAccesorias} role={role} disabled={yearData.plan.ejes.length === 0} />
                        <SideBarList texto={t('Servicios')} link="/adr/servicios" src={IconServiciosPrestados} role={role} />

                        <li className="nav-item">
                            <NavLink to="/adr/planesGestion" className="group">
                                <div className="flex items-center">
                                    <TabCard
                                        icon={IconPlan}
                                        label="PlanGestion"
                                        status={yearData.plan.status}
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
                                        status={yearData.memoria.status}
                                        className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark"
                                    />
                                </div>
                            </NavLink>
                        </li>
                    </ul>
                </li>
            </div>
        );
    };

    return (
        <div className={semidark ? 'dark' : ''}>
            <nav
                className={`sidebar fixed min-h-screen h-full top-0 bottom-0 w-[260px] shadow-[5px_0_25px_0_rgba(94,92,154,0.1)] z-50 transition-all duration-300 ${semidark ? 'text-white-dark' : ''}`}
            >
                <div className="bg-white dark:bg-black h-full">
                    <div className="flex items-center px-4 py-3">
                        <button
                            type="button"
                            className="ml-auto collapse-icon w-8 h-8 rounded-full flex items-center hover:bg-gray-500/10 dark:hover:bg-dark-light/10 dark:text-white-light transition duration-300 rtl:rotate-180"
                            onClick={() => dispatch(toggleSidebar())}
                        >
                            <IconCaretsDown className="m-auto rotate-90" />
                        </button>
                    </div>

                    <PerfectScrollbar className="h-[calc(100vh-80px)] relative">
                        <ul className="relative font-semibold space-y-0.5 p-4 py-0">
                            <SideBarList texto={t('CuadroMando')} link="/cuadroMando" src={IconCuadroMando2} role={role} />
                            {(role === 'HAZI' || role === 'ADR') && <DespegableIndicadores />}
                            <SideBarList texto={t('PCDR')} link="/PCDR" src={IconPCDR} role={role} />
                            <SideBarList texto={t('informes')} link="/informes" src={IconInformes} role={role} />
                            {role === 'HAZI' && <SideBarList texto={t('usuarios')} link="/usuarios" src={IconUsuarios} role={role} />}
                            {role === 'HAZI' && <DespegableConfiguracion />}
                            <SelectorAnio />
                            <MenuADRLateral />
                        </ul>
                    </PerfectScrollbar>
                </div>
            </nav>
        </div>
    );
};

export default Sidebar;

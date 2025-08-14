import { useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link } from 'react-router-dom';
import { IRootState } from '../../store';
import { toggleSidebar } from '../../store/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import Dropdown from '../Dropdown';
import IconMenu from '../Icon/IconMenu';
import IconUser from '../Icon/IconUser';
import { useUser } from '../../contexts/UserContext';
import LogoutItem from '../../pages/Authenticacion/logout';
import { LanguageSelector, RegionSelect } from '../Utils/inputs';
import { UserRole } from '../../types/users';
import { Fases } from '../Utils/data/controlDev';
import { useRegionEstadosContext } from '../../contexts/RegionEstadosContext';
import { LogoIZ_SUP } from './LayoutsComponents';

const Header = () => {
    const { setRegionSeleccionada } = useRegionEstadosContext();
    const { user } = useUser();
    const role: UserRole = user!.role as UserRole;
    const nombreUsuario = user?.name;
    const { t } = useTranslation();

    useEffect(() => {
        if (role.toUpperCase() === 'ADR') {
            setRegionSeleccionada(user!.ambit ? Number(user!.ambit) : null);
        }
    }, []);

    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm">
                <div className="relative bg-white w-full items-center px-5 py-2.5 dark:bg-black flex gap-4">
                    <div className="horizontal-logo flex lg:hidden justify-between items-center ltr:mr-2 rtl:ml-2">
                        <LogoIZ_SUP />
                        <button
                            type="button"
                            className="collapse-icon flex-none dark:text-[#d0d2d6] hover:text-primary dark:hover:text-primary flex lg:hidden ltr:ml-2 rtl:mr-2 p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:bg-white-light/90 dark:hover:bg-dark/60"
                            onClick={() => {
                                dispatch(toggleSidebar());
                            }}
                        >
                            <IconMenu className="w-5 h-5" />
                        </button>
                    </div>

                    {Fases >= 2 &&
                        (role.toUpperCase() != 'ADR' ? (
                            <div>
                                <div className=" text-white-dark min-w-max" style={{ minWidth: 'calc(100% + 10px)' }}>
                                    <RegionSelect header={true} />
                                </div>
                            </div>
                        ) : (
                            <div>
                                <div className=" text-white-dark min-w-max" style={{ minWidth: 'calc(100% + 10px)' }}>
                                    <RegionSelect header={true} disabled />
                                </div>
                            </div>
                        ))}

                    <div className="sm:flex-1 ltr:sm:ml-0 ltr:ml-auto sm:rtl:mr-0 rtl:mr-auto flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]">
                        <div className="flex justify-end w-full overflow-hidden">
                            <img className="mr-5 w-20 ltr:-ml-1 rtl:-mr-1 inline" src="/assets/images/logo.svg" alt="logo" />
                            <img className="mr-5 max-h-[40px] w-auto" src="/assets/images/GobiernoVasco.svg" alt="logo" />
                        </div>
                        <div>
                            <LanguageSelector />
                        </div>
                        <div className="dropdown shrink-0 flex">
                            <Dropdown offset={[0, 8]} btnClassName="relative group block" button={<IconUser className="w-9 h-9 text-gray-500 group-hover:text-primary transition-colors" />}>
                                <ul className="text-dark dark:text-white-dark !py-0 w-[230px] font-semibold dark:text-white-light/90">
                                    <li>
                                        <div className="flex items-center px-4 py-4">
                                            <div className="ltr:pl-4 rtl:pr-4 truncate">
                                                <h4 className="text-base">{nombreUsuario as string}</h4>
                                                <h4 className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">{role!.toUpperCase()}</h4>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <Link to="/profile" className="dark:hover:text-white">
                                            <IconUser className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                                            {t('miPerfil')}
                                        </Link>
                                    </li>
                                    <LogoutItem />
                                </ul>
                            </Dropdown>
                        </div>
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;

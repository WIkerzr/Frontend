import { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Link, useLocation } from 'react-router-dom';
import { IRootState } from '../../store';
import { toggleRTL, toggleTheme, toggleSidebar } from '../../store/themeConfigSlice';
import { useTranslation } from 'react-i18next';
import Dropdown from '../Dropdown';
import IconMenu from '../Icon/IconMenu';
import IconSearch from '../Icon/IconSearch';
import IconXCircle from '../Icon/IconXCircle';
import IconSun from '../Icon/IconSun';
import IconMoon from '../Icon/IconMoon';
import IconLaptop from '../Icon/IconLaptop';
import IconUser from '../Icon/IconUser';
import IconLogout from '../Icon/IconLogout';
import { useUser } from '../../contexts/UserContext';

//IMPORTANT Temporal
const ADRS = [{ adr: 'Añana' }, { adr: 'Busturialdea' }, { adr: 'Cantábrica' }, { adr: 'Debabarrena' }, { adr: 'Debagoiena' }, { adr: 'Donostialdea' }];
//Hasta aqui

const Header = () => {
    const { setUser } = useUser();
    const { user } = useUser();
    const rol = user?.rol.toLowerCase();
    const nombreUsuario = user?.name;

    const location = useLocation();
    useEffect(() => {
        const selector = document.querySelector('ul.horizontal-menu a[href="' + window.location.pathname + '"]');
        if (selector) {
            selector.classList.add('active');
            const all: any = document.querySelectorAll('ul.horizontal-menu .nav-link.active');
            for (let i = 0; i < all.length; i++) {
                all[0]?.classList.remove('active');
            }
            const ul: any = selector.closest('ul.sub-menu');
            if (ul) {
                let ele: any = ul.closest('li.menu').querySelectorAll('.nav-link');
                if (ele) {
                    ele = ele[0];
                    setTimeout(() => {
                        ele?.classList.add('active');
                    });
                }
            }
        }
    }, [location]);
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();

    const { t } = useTranslation();

    return (
        <header className={`z-40 ${themeConfig.semidark && themeConfig.menu === 'horizontal' ? 'dark' : ''}`}>
            <div className="shadow-sm">
                <div className="relative bg-white flex w-full items-center px-5 py-2.5 dark:bg-black flex gap-4">
                    <div className="horizontal-logo flex lg:hidden justify-between items-center ltr:mr-2 rtl:ml-2">
                        <Link to="/" className="main-logo flex items-center shrink-0">
                            <img className="w-20 ltr:-ml-1 rtl:-mr-1 inline" src="/assets/images/logo.svg" alt="logo" />
                        </Link>
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

                    {rol != 'adr' ? (
                        <div>
                            <select id="adr" className="form-select text-white-dark min-w-max" style={{ minWidth: 'calc(100% + 10px)' }}>
                                <option value="notSelect">Sin seleccionar</option>
                                {ADRS.map((item: any) => (
                                    <option key={item.adr} value={item.adr}>
                                        {item.adr}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <div>
                            <div className=" text-white-dark min-w-max" style={{ minWidth: 'calc(100% + 10px)' }}>
                                {rol}
                            </div>
                        </div>
                    )}

                    <div>
                        <span className="text-white-dark min-w-max ">2025</span>
                    </div>
                    <div className="sm:flex-1 ltr:sm:ml-0 ltr:ml-auto sm:rtl:mr-0 rtl:mr-auto flex items-center space-x-1.5 lg:space-x-2 rtl:space-x-reverse dark:text-[#d0d2d6]">
                        <div className="flex justify-end w-full">
                            <img className="mr-20 max-h-[40px] w-auto" src="/assets/images/Mendinet-logo.png" alt="logo" />
                            <img className="mr-20 max-h-[40px] w-auto" src="/assets/images/GobiernoVasco.svg" alt="logo" />
                        </div>
                        {/* Borrar selector rol temporal */}
                        <div>
                            <select
                                value={rol}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    let datos;
                                    switch (value) {
                                        case 'adr':
                                            datos = { email: 'test@adr.com', name: 'Jon', rol: 'adr' };
                                            break;
                                        case 'hazi':
                                            datos = { email: 'test@hazi.com', name: 'Jon', rol: 'hazi' };
                                            break;
                                        case 'gobiernovasco':
                                            datos = { email: 'test@gv.com', name: 'Jon', rol: 'gobiernovasco' };
                                            break;
                                        default:
                                            datos = { email: '', name: '', rol: '' };
                                    }

                                    localStorage.setItem('user', JSON.stringify(datos));
                                    setUser(datos);
                                }}
                                className="form-select text-white-dark"
                                style={{ minWidth: '100px', backgroundColor: '#fff3cd', borderRadius: '8px', border: '1px solid #ffeeba' }}
                            >
                                <option value="adr">ADR</option>
                                <option value="hazi">HAZI</option>
                                <option value="gobiernovasco">GOBIERNO</option>
                            </select>
                        </div>
                        <div>
                            {themeConfig.theme === 'light' ? (
                                <button
                                    className={`${
                                        themeConfig.theme === 'light' &&
                                        'flex items-center p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => {
                                        dispatch(toggleTheme('dark'));
                                    }}
                                >
                                    <IconSun />
                                </button>
                            ) : (
                                ''
                            )}
                            {themeConfig.theme === 'dark' && (
                                <button
                                    className={`${
                                        themeConfig.theme === 'dark' &&
                                        'flex items-center p-2 rounded-full bg-white-light/40 dark:bg-dark/40 hover:text-primary hover:bg-white-light/90 dark:hover:bg-dark/60'
                                    }`}
                                    onClick={() => {
                                        dispatch(toggleTheme('light'));
                                    }}
                                >
                                    <IconMoon />
                                </button>
                            )}
                        </div>
                        <div>
                            <select id="idioma" className="form-select text-white-dark min-w-max mr-5" style={{ minWidth: 'calc(100% + 10px)' }}>
                                <option value="ES">ES</option>
                                <option value="EUS">EUS</option>
                            </select>
                        </div>
                        <div className="dropdown shrink-0 flex">
                            <Dropdown offset={[0, 8]} btnClassName="relative group block" button={<IconUser className="w-9 h-9 text-gray-500 group-hover:text-primary transition-colors" />}>
                                <ul className="text-dark dark:text-white-dark !py-0 w-[230px] font-semibold dark:text-white-light/90">
                                    <li>
                                        <div className="flex items-center px-4 py-4">
                                            <div className="ltr:pl-4 rtl:pr-4 truncate">
                                                <h4 className="text-base">{nombreUsuario}</h4>
                                                <h4 className="text-black/60 hover:text-primary dark:text-dark-light/60 dark:hover:text-white">{rol!.toUpperCase()}</h4>
                                            </div>
                                        </div>
                                    </li>
                                    <li>
                                        <Link to="/perfil" className="dark:hover:text-white">
                                            <IconUser className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 shrink-0" />
                                            Mi perfil
                                        </Link>
                                    </li>
                                    <li className="border-t border-white-light dark:border-white-light/10">
                                        <Link to="/Authenticacion/Login" className="text-danger !py-3">
                                            <IconLogout className="w-4.5 h-4.5 ltr:mr-2 rtl:ml-2 rotate-90 shrink-0" />
                                            <span>{t('cerrarSesion')}</span>
                                        </Link>
                                    </li>
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

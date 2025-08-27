import { PropsWithChildren, useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { IRootState } from './store';
import { toggleRTL, toggleTheme, toggleLocale, toggleMenu, toggleLayout, toggleAnimation, toggleNavbar, toggleSemidark } from './store/themeConfigSlice';
import store from './store';
import { ModoDev } from './components/Utils/data/controlDev';
export const useBrowserWarning = () => {
    const [isIncompatible, setIsIncompatible] = useState(false);

    useEffect(() => {
        const ua = window.navigator.userAgent;
        const isIE = /MSIE |Trident\//.test(ua);
        setIsIncompatible(true);
        if (isIE) {
            setIsIncompatible(true);
        }
    }, []);

    return isIncompatible;
};
const BrowserWarning = () => {
    return (
        <div className="w-full bg-yellow-400 text-center text-black text-xs py-1 shadow-md">
            <p className="font-medium">⚠️ Navegador no compatible. Por favor, utiliza Chrome, Firefox, Edge o Safari actualizado a la última versión.</p>
        </div>
    );
};
const ModoDevWarning = () => {
    return <div className="w-full bg-yellow-400 text-center text-black text-xs py-1 shadow-md">⚠️ MODO DESARROLLO</div>;
};

function App({ children }: PropsWithChildren) {
    const themeConfig = useSelector((state: IRootState) => state.themeConfig);
    const dispatch = useDispatch();
    const isBrowserIncompatible = useBrowserWarning();

    useEffect(() => {
        dispatch(toggleTheme(localStorage.getItem('theme') || themeConfig.theme));
        dispatch(toggleMenu(localStorage.getItem('menu') || themeConfig.menu));
        dispatch(toggleLayout(localStorage.getItem('layout') || themeConfig.layout));
        dispatch(toggleRTL(localStorage.getItem('rtlClass') || themeConfig.rtlClass));
        dispatch(toggleAnimation(localStorage.getItem('animation') || themeConfig.animation));
        dispatch(toggleNavbar(localStorage.getItem('navbar') || themeConfig.navbar));
        dispatch(toggleLocale(localStorage.getItem('i18nextLng') || themeConfig.locale));
        dispatch(toggleSemidark(localStorage.getItem('semidark') || themeConfig.semidark));
    }, [dispatch, themeConfig.theme, themeConfig.menu, themeConfig.layout, themeConfig.rtlClass, themeConfig.animation, themeConfig.navbar, themeConfig.locale, themeConfig.semidark]);

    const espaciado = (isBrowserIncompatible ? 5 : 0) + (ModoDev ? 5 : 0);

    return (
        <div
            className={`${(store.getState().themeConfig.sidebar && 'toggle-sidebar') || ''} ${themeConfig.menu} ${themeConfig.layout} ${
                themeConfig.rtlClass
            } main-section antialiased relative font-nunito text-sm font-normal`}
        >
            <div className="fixed top-0 left-0 right-0 z-50 flex flex-col items-center space-y-0.5">
                {isBrowserIncompatible && <BrowserWarning />}
                {ModoDev && <ModoDevWarning />}
            </div>

            <div className={`pt-${espaciado}`}>{children}</div>
        </div>
    );
}

export default App;

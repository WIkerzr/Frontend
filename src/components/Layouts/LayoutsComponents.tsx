import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { toggleSidebar } from '../../store/themeConfigSlice';
import { useRegionEstadosContext } from '../../contexts/RegionEstadosContext';

const logosToComarcas: Record<string, string> = {
    1: 'AÑANA HORIZONTAL EUSKERA', // seguro
    2: 'LAUTADA HORIZONTAL EUSKERA', // seguro
    3: 'MAIRUELEGORRETA HORIZONTAL EUSKERA', // probable
    4: 'ARABAKO ERRIOXA HORIZONTAL EUSKERA', // seguro
    5: 'GORBEIALDE HORIZONTAL EUSKERA', // seguro
    6: 'TOLOMENDI HORIZONTAL EUSKERA', // seguro
    7: 'URREMENDI HORIZONTAL EUSKERA', // probable
    8: 'DEBEMEN HORIZONTAL EUSKERA', // probable (Bajo Deba)
    9: 'DEBA GARAIA HORIZONTAL EUSKERA', // probable (Alto Deba)
    10: 'URKIOLA HORIZONTAL EUSKERA', // probable
    11: 'GOIMEN HORIZONTAL EUSKERA', // probable
    12: 'BEHEMENDI HORIZONTAL EUSKERA', // dudoso
    13: 'VITORIA-GASTEIZ HORIZONTAL EUSKERA', // seguro
    14: 'URKOME HORIZONTAL EUSKERA', // probable
    15: 'ENKARTERRIALDE HORIZONTAL EUSKERA', // seguro
    16: 'LEA ARTIBAI HORIZONTAL EUSKERA', // seguro
    17: 'JATA-ONDO HORIZONTAL EUSKERA', // probable
};

export const LogoIZ_SUP = () => {
    const dispatch = useDispatch();
    const { regionSeleccionada } = useRegionEstadosContext();
    if (regionSeleccionada) {
        return (
            <NavLink
                to="/"
                className="main-logo flex items-center shrink-0"
                onClick={() => {
                    dispatch(toggleSidebar());
                }}
            >
                <img className="w-30 h-20" src={`/assets/images/ADR/${logosToComarcas[Number(regionSeleccionada)]}.jpg`} alt="logo" />
            </NavLink>
        );
    } else {
        return (
            <NavLink
                to="/"
                className="main-logo flex items-center shrink-0"
                onClick={() => {
                    dispatch(toggleSidebar());
                }}
            >
                <img className="w-32" src="/assets/images/meneko.png" alt="logo" />
            </NavLink>
        );
    }
};

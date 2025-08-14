import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { toggleSidebar } from '../../store/themeConfigSlice';
import { useRegionEstadosContext } from '../../contexts/RegionEstadosContext';

const logosToComarcas: Record<string, string> = {
    0: 'AÑANA HORIZONTAL EUSKERA', // seguro
    1: 'LAUTADA HORIZONTAL EUSKERA', // seguro
    2: 'MAIRUELEGORRETA HORIZONTAL EUSKERA', // probable
    3: 'ARABAKO ERRIOXA HORIZONTAL EUSKERA', // seguro
    4: 'GORBEIALDE HORIZONTAL EUSKERA', // seguro
    5: 'TOLOMENDI HORIZONTAL EUSKERA', // seguro
    6: 'URREMENDI HORIZONTAL EUSKERA', // probable
    7: 'DEBEMEN HORIZONTAL EUSKERA', // probable (Bajo Deba)
    8: 'DEBA GARAIA HORIZONTAL EUSKERA', // probable (Alto Deba)
    9: 'URKIOLA HORIZONTAL EUSKERA', // probable
    10: 'GOIMEN HORIZONTAL EUSKERA', // probable
    11: 'BEHEMENDI HORIZONTAL EUSKERA', // dudoso
    12: 'VITORIA-GASTEIZ HORIZONTAL EUSKERA', // seguro
    13: 'URKOME HORIZONTAL EUSKERA', // probable
    14: 'ENKARTERRIALDE HORIZONTAL EUSKERA', // seguro
    15: 'LEA ARTIBAI HORIZONTAL EUSKERA', // seguro
    16: 'JATA-ONDO HORIZONTAL EUSKERA', // probable
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
                <img className="w-10 h-10" src="/assets/images/menekoSort.png" alt="logo" />
            </NavLink>
        );
    }
};

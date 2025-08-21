import { useDispatch } from 'react-redux';
import { NavLink } from 'react-router-dom';
import { toggleSidebar } from '../../store/themeConfigSlice';
import { useRegionEstadosContext } from '../../contexts/RegionEstadosContext';

const logosToComarcas: Record<string, string> = {
    1: 'AÑANA HORIZONTAL EUSKERA',
    2: 'LAUTADA HORIZONTAL EUSKERA',
    3: 'IZKI HORIZONTAL EUSKERA',
    4: 'ARABAKO ERRIOXA HORIZONTAL EUSKERA',
    5: 'MAIRUELEGORRETA HORIZONTAL EUSKERA',
    6: 'TOLOMENDI HORIZONTAL EUSKERA',
    7: 'URKOME HORIZONTAL EUSKERA',
    8: 'DEBEMEN HORIZONTAL EUSKERA',
    9: 'DEBA GARAIA HORIZONTAL EUSKERA',
    10: 'URKIOLA HORIZONTAL EUSKERA',
    11: 'GOIMEN HORIZONTAL EUSKERA',
    12: 'ZABAIA HORIZONTAL EUSKERA',
    13: 'URREMENDI HORIZONTAL EUSKERA',
    14: 'VITORIA-GASTEIZ HORIZONTAL EUSKERA',
    15: 'GORBEIALDE HORIZONTAL EUSKERA',
    16: 'BEHEMENDI HORIZONTAL EUSKERA',
    17: 'ENKARTERRIALDE HORIZONTAL EUSKERA',
    18: 'LEA ARTIBAI HORIZONTAL EUSKERA',
    19: 'JATA-ONDO HORIZONTAL EUSKERA',
};

export const LogoIZ_SUP = () => {
    const dispatch = useDispatch();
    const { regionSeleccionada } = useRegionEstadosContext();
    if (regionSeleccionada) {
        return (
            <NavLink
                to="/"
                className="main-logo flex items-center shrink-0 w-fit"
                onClick={() => {
                    dispatch(toggleSidebar());
                }}
            >
                <img className="max-w-[200px] max-h-[50px] h-auto w-full object-contain" src={`/assets/images/ADR/${logosToComarcas[Number(regionSeleccionada)]}.jpg`} alt="logo" />{' '}
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

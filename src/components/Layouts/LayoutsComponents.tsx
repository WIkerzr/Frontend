import { useRegionContext } from '../../contexts/RegionContext';
import { UserRole } from '../../types/users';

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
type LogoProps = {
    role?: UserRole;
};

export const LogoRegion_SUP: React.FC<LogoProps> = ({ role }) => {
    if (!role) {
        return <></>;
    }
    // const dispatch = useDispatch();
    const { regionSeleccionada } = useRegionContext();

    if (role === 'ADR') {
        return <img className="mr-5 max-h-[40px] w-auto" src={`/assets/images/ADR/${logosToComarcas[Number(regionSeleccionada)]}.jpg`} alt="logo" />;
    } else {
        return <img className="mr-5 max-h-[40px] w-auto" src="/assets/images/menekoSort.png" alt="logo" />;
    }
};

import { useRegionContext } from '../../contexts/RegionContext';
import { UserRole } from '../../types/users';

export const logosToComarcas: Record<string, string> = {
    AN: 'AÑANA HORIZONTAL EUSKERA',
    AL: 'LAUTADA HORIZONTAL EUSKERA',
    MA: 'IZKI HORIZONTAL EUSKERA',
    RA: 'ARABAKO ERRIOXA HORIZONTAL EUSKERA',
    ED: 'MAIRUELEGORRETA HORIZONTAL EUSKERA',
    TO: 'TOLOMENDI HORIZONTAL EUSKERA',
    UK: 'URKOME HORIZONTAL EUSKERA',
    DE: 'DEBEMEN HORIZONTAL EUSKERA',
    D1: 'DEBA GARAIA HORIZONTAL EUSKERA',
    DU: 'URKIOLA HORIZONTAL EUSKERA',
    GO: 'GOIMEN HORIZONTAL EUSKERA',
    AI: 'ZABAIA HORIZONTAL EUSKERA',
    BU: 'URREMENDI HORIZONTAL EUSKERA',
    VG: 'VITORIA-GASTEIZ HORIZONTAL EUSKERA',
    A1: 'GORBEIALDE HORIZONTAL EUSKERA',
    DB: 'BEHEMENDI HORIZONTAL EUSKERA',
    EE: 'ENKARTERRIALDE HORIZONTAL EUSKERA',
    LA: 'LEA ARTIBAI HORIZONTAL EUSKERA',
    UR: 'JATA-ONDO HORIZONTAL EUSKERA',
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
    const { codRegiones } = useRegionContext();

    const codigo = codRegiones[Number(regionSeleccionada)];

    if (role === 'ADR') {
        return <img className="mr-5 max-h-[40px] w-auto" src={`/assets/images/ADR/${logosToComarcas[codigo]}.jpg`} alt="logo" />;
    } else {
        return <img className="mr-5 max-h-[40px] w-auto" src="/assets/images/menekoSort.png" alt="logo" />;
    }
};

export const SaberLogoEnGenWORD = (): string => {
    const { regionSeleccionada } = useRegionContext();
    const { codRegiones } = useRegionContext();

    const codigo = codRegiones[Number(regionSeleccionada)];
    return `/assets/images/ADR/${logosToComarcas[codigo]}.jpg`;
};

/* eslint-disable no-unused-vars */
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { GetRegionesResponse, RegionInterface } from '../components/Utils/data/getRegiones';
import { useUser } from './UserContext';
import { InitialDataResponse, yearIniciadoVacio } from '../types/tipadoPlan';
import { formateaConCeroDelante } from '../components/Utils/utils';
import { GenerarCodigosRegiones } from '../pages/Configuracion/Indicadores/Components/componentesIndicadores';
import { useTranslation } from 'react-i18next';
import { LlamadasBBDD } from '../components/Utils/data/utilsData';

interface CodRegiones {
    [key: number]: string;
}

type RegionContextType = {
    regiones: RegionInterface[];
    regionActual?: RegionInterface;
    regionData: InitialDataResponse | undefined;
    codRegiones: CodRegiones;
    loading: boolean;
    error: Error | null;
    regionSeleccionada: string | null;
    nombreRegionSeleccionada: string | null;
    setRegionSeleccionada: (id: number | null) => void;
};

const RegionContext = createContext<RegionContextType>({
    regiones: [],
    regionActual: { RegionId: '', NameEs: '', NameEu: '' },
    regionData: undefined,
    codRegiones: {},
    loading: false,
    error: null,
    regionSeleccionada: null,
    nombreRegionSeleccionada: null,
    setRegionSeleccionada: () => {},
});

export const useRegionContext = () => useContext(RegionContext);

export const RegionProvider = ({ children }: { children: ReactNode }) => {
    const [regionData, setRegionData] = useState<InitialDataResponse>();
    const { i18n } = useTranslation();
    const { user } = useUser();

    const token = sessionStorage.getItem('access_token');
    const [regionActual, setRegionActual] = useState<RegionInterface>();
    const [codRegiones, setCodRegiones] = useState<CodRegiones>({});
    const [regiones, setRegiones] = useState<RegionInterface[]>(() => {
        const saved = sessionStorage.getItem('regiones');
        try {
            return saved ? (JSON.parse(saved) as RegionInterface[]) : [];
        } catch {
            return [];
        }
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const savedRegion = sessionStorage.getItem('regionSeleccionada');
    const parsedRegion = savedRegion ? JSON.parse(savedRegion) : null;

    const [regionSeleccionada, setRegionSeleccionadaState] = useState<string | null>(parsedRegion?.id ?? null);
    const [nombreRegionSeleccionada, setNombreRegionSeleccionada] = useState<string | null>(parsedRegion?.nombre ?? null);

    useEffect(() => {
        if (regionSeleccionada !== null && regionSeleccionada !== '') {
            const ultimaRegionSesionStorage = sessionStorage.getItem('regionSeleccionada');
            const ultimaRegion = ultimaRegionSesionStorage ? JSON.parse(ultimaRegionSesionStorage) : null;

            if (!ultimaRegion || (ultimaRegion && ultimaRegion.id !== regionSeleccionada)) {
                sessionStorage.removeItem('ejesRegion');
            }

            sessionStorage.setItem('regionSeleccionada', JSON.stringify({ id: regionSeleccionada, nombre: nombreRegionSeleccionada }));

            const regionCompleta = regiones.find((r) => `${r.RegionId}` === regionSeleccionada);

            if (regionCompleta) {
                setNombreRegionSeleccionada(
                    i18n.language === 'es' ? (regionCompleta.NameEs ? regionCompleta.NameEs : regionCompleta.NameEu) : regionCompleta.NameEu ? regionCompleta.NameEu : regionCompleta.NameEs
                );
                setRegionActual(regionCompleta);
            }
            setRegionData({
                data: [yearIniciadoVacio],
                idRegion: regionSeleccionada ?? '',
            });
        } else {
            sessionStorage.setItem('regionSeleccionada', JSON.stringify({ id: null, nombre: null }));
            const regionCompleta = regiones.find((r) => `${r.RegionId}` === regionSeleccionada);
            if (regionCompleta) {
                setNombreRegionSeleccionada(
                    i18n.language === 'es' ? (regionCompleta.NameEs ? regionCompleta.NameEs : regionCompleta.NameEu) : regionCompleta.NameEu ? regionCompleta.NameEu : regionCompleta.NameEs
                );
                setRegionActual(regionCompleta);
            }
        }
    }, [regionSeleccionada, regiones, i18n.language, nombreRegionSeleccionada]);

    useEffect(() => {
        const codiRegiones = GenerarCodigosRegiones(regiones);
        setCodRegiones(codiRegiones);
    }, [regiones]);

    useEffect(() => {
        if (!token) return;
        if (user) {
            const regionesStr = sessionStorage.getItem('regiones');
            if (!regionesStr) {
                LlamadasBBDD({
                    method: 'GET',
                    url: `/regions`,
                    setLoading,
                    onSuccess: (response: GetRegionesResponse) => {
                        const regiones = response.data;
                        const regionesFiltradas = regiones.filter((r) => r.RegionId !== '00');
                        setRegiones(regionesFiltradas);
                        sessionStorage.setItem('regiones', JSON.stringify(regionesFiltradas));
                    },
                    onError(err) {
                        setError(err);
                    },
                });
                return;
            } else {
                setLoading(false);
            }
        }
    }, [user, token]);

    const setRegionSeleccionada = (id: number | string | null) => {
        if (Number.isNaN(id)) {
            return;
        }
        if (id === null || id === 0) {
            setRegionSeleccionadaState(null);
        } else {
            setRegionSeleccionadaState(formateaConCeroDelante(`${id}`));
        }
    };

    return (
        <RegionContext.Provider
            value={{
                regiones,
                regionActual,
                regionData,
                codRegiones,
                loading,
                error,
                regionSeleccionada,
                nombreRegionSeleccionada,
                setRegionSeleccionada,
            }}
        >
            {children}
        </RegionContext.Provider>
    );
};

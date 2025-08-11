import React, { createContext, useContext, useEffect, useState } from 'react';
import { getRegiones, RegionInterface } from '../components/Utils/data/getRegiones';
import { useUser } from './UserContext';
import { datosRegion, InitialDataResponse } from '../types/tipadoPlan';
import { formateaConCeroDelante } from '../components/Utils/utils';
import { GenerarCodigosRegiones } from '../pages/Configuracion/componentesIndicadores';

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
    // eslint-disable-next-line no-unused-vars
    setRegionSeleccionada: (id: number | null) => void;
    allYears: number[];
};

const RegionContext = createContext<RegionContextType>({
    regiones: [],
    regionActual: {
        RegionId: '',
        NameEs: '',
        NameEu: '',
    },
    regionData: undefined,
    codRegiones: {},
    loading: false,
    error: null,
    regionSeleccionada: null,
    setRegionSeleccionada: () => {},
    allYears: [],
});

export const useRegionContext = () => useContext(RegionContext);

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [regionData, setRegionData] = useState<InitialDataResponse>();

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

    const [regionSeleccionada, setRegionSeleccionadaState] = useState<string | null>(() => {
        const saved = sessionStorage.getItem('regionSeleccionada');
        return saved !== null && !isNaN(Number(saved)) ? saved : null;
    });

    useEffect(() => {
        if (regionSeleccionada !== null && regionSeleccionada != '') {
            sessionStorage.setItem('regionSeleccionada', regionSeleccionada);

            const regionCompleta = regiones.find((r) => `${r.RegionId}` === regionSeleccionada);
            if (regionCompleta) {
                setRegionActual(regionCompleta);
            }

            setRegionData(datosRegion);
        }
    }, [regionSeleccionada]);

    useEffect(() => {
        const codiRegiones = GenerarCodigosRegiones(regiones);
        setCodRegiones(codiRegiones);
    }, [regiones]);

    useEffect(() => {
        if (!token) return;
        if (user) {
            const regionesStr = sessionStorage.getItem('regiones');
            if (!regionesStr) {
                getRegiones()
                    .then((data) => {
                        setRegiones(data);
                        sessionStorage.setItem('regiones', JSON.stringify(data));
                    })
                    .catch(setError)
                    .finally(() => setLoading(false));
                return;
            }
        }
    }, [user]);

    const setRegionSeleccionada = (id: number | string | null) => {
        if (id === null) {
            setRegionSeleccionadaState(null);
        } else {
            setRegionSeleccionadaState(formateaConCeroDelante(`${id}`));
        }
    };

    const allYears = React.useMemo(() => {
        if (!regionData?.data) return [];
        const years = regionData.data.map((item) => item.year);
        return Array.from(new Set(years)).sort();
    }, [regionData]);

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
                setRegionSeleccionada,
                allYears,
            }}
        >
            {children}
        </RegionContext.Provider>
    );
};

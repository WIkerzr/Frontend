import React, { createContext, useContext, useEffect, useState } from 'react';
import { getRegiones, Region } from '../components/Utils/gets/getRegiones';
import { useUser } from './UserContext';
import { datosRegion, InitialDataResponse } from '../types/tipadoPlan';
import { formateaConCeroDelante } from '../components/Utils/utils';

type RegionContextType = {
    regiones: Region[];
    regionActual?: Region;
    regionData: InitialDataResponse | undefined;
    loading: boolean;
    error: Error | null;
    regionSeleccionada: number | null;
    // eslint-disable-next-line no-unused-vars
    setRegionSeleccionada: (id: number | null) => void;
    allYears: number[];
};

const RegionContext = createContext<RegionContextType>({
    regiones: [],
    regionActual: {
        RegionId: 0,
        NameEs: '',
        NameEu: '',
    },
    regionData: undefined,
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
    const [regionActual, setRegionActual] = useState<Region>();
    const [regiones, setRegiones] = useState<Region[]>(() => {
        const saved = sessionStorage.getItem('regiones');
        try {
            return saved ? (JSON.parse(saved) as Region[]) : [];
        } catch {
            return [];
        }
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const [regionSeleccionada, setRegionSeleccionadaState] = useState<number | null>(() => {
        const saved = sessionStorage.getItem('regionSeleccionada');
        return saved !== null && !isNaN(Number(saved)) ? Number(saved) : null;
    });

    useEffect(() => {
        if (regionSeleccionada !== null && !isNaN(regionSeleccionada)) {
            const regionSeleccionadaCon0 = formateaConCeroDelante(regionSeleccionada);
            sessionStorage.setItem('regionSeleccionada', regionSeleccionadaCon0);

            const regionCompleta = regiones.find((r) => `${r.RegionId}` === regionSeleccionadaCon0);
            if (regionCompleta) {
                setRegionActual(regionCompleta);
            }

            setRegionData(datosRegion);
        }
    }, [regionSeleccionada]);

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

    const setRegionSeleccionada = (id: number | null) => {
        setRegionSeleccionadaState(id);
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

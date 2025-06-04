import React, { createContext, useContext, useEffect, useState } from 'react';
import { getRegiones } from '../components/Utils/gets/getRegiones';

export type Region = {
    RegionId: number;
    NameEs: string;
    NameEu: string;
};

type RegionContextType = {
    regiones: Region[];
    loading: boolean;
    error: any;
    regionSeleccionada: number | null;
    setRegionSeleccionada: (id: number | null) => void;
};

const RegionContext = createContext<RegionContextType>({
    regiones: [],
    loading: false,
    error: null,
    regionSeleccionada: null,
    setRegionSeleccionada: () => {},
});

export const useRegionContext = () => useContext(RegionContext);

export const RegionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [regiones, setRegiones] = useState<Region[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<any>(null);

    const [regionSeleccionada, setRegionSeleccionadaState] = useState<number | null>(() => {
        const saved = sessionStorage.getItem('regionSeleccionada');
        return saved !== null && !isNaN(Number(saved)) ? Number(saved) : null;
    });

    useEffect(() => {
        if (regionSeleccionada !== null && !isNaN(regionSeleccionada)) {
            sessionStorage.setItem('regionSeleccionada', String(regionSeleccionada));
        } else {
            // sessionStorage.removeItem('regionSeleccionada');
        }
    }, [regionSeleccionada]);

    useEffect(() => {
        const regionesStr = sessionStorage.getItem('regiones');
        if (regionesStr && regionesStr !== '[]' && regiones.length === 0) {
            const regionesArr = JSON.parse(regionesStr);
            setRegiones(regionesArr);
            setLoading(false);
        } else {
            getRegiones()
                .then((data) => {
                    setRegiones(data);
                    sessionStorage.setItem('regiones', JSON.stringify(data));
                })
                .catch(setError)
                .finally(() => setLoading(false));
        }
    }, []);

    const setRegionSeleccionada = (id: number | null) => {
        setRegionSeleccionadaState(id);
    };

    return (
        <RegionContext.Provider
            value={{
                regiones,
                loading,
                error,
                regionSeleccionada,
                setRegionSeleccionada,
            }}
        >
            {children}
        </RegionContext.Provider>
    );
};

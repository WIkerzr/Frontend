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

    const [regionSeleccionada, setRegionSeleccionada] = useState<number | null>(() => {
        const saved = sessionStorage.getItem('regionSeleccionada');
        return saved !== null && !isNaN(Number(saved)) ? Number(saved) : null;
    });

    useEffect(() => {
        const regionesStr = sessionStorage.getItem('regiones');
        if (regionesStr && regionesStr != '[]' && regiones.length == 0) {
            const regionesArr = JSON.parse(regionesStr);
            setRegiones(regionesArr);
            setLoading(false);
        } else {
            getRegiones()
                .then(setRegiones)
                .catch(setError)
                .finally(() => setLoading(false));
        }
    }, []);

    useEffect(() => {
        const regionesStr = sessionStorage.getItem('regiones');
        if (regionesStr == '[]') {
            sessionStorage.setItem('regiones', JSON.stringify(regiones));
        } else {
            const saved = sessionStorage.getItem('regionSeleccionada');
            setRegionSeleccionada(Number(saved));
        }
    }, [regiones]);

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

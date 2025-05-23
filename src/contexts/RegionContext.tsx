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
    const [regionSeleccionada, setRegionSeleccionada] = useState<number | null>(null);

    useEffect(() => {
        getRegiones()
            .then(setRegiones)
            .catch(setError)
            .finally(() => setLoading(false));
    }, []);

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

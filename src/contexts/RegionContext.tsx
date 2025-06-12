import React, { createContext, useContext, useEffect, useState } from 'react';
import { getRegiones, Region } from '../components/Utils/gets/getRegiones';
import { useAuth } from './AuthContext';
import { useUser } from './UserContext';

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
    const { user } = useUser();
    const token = sessionStorage.getItem('token');
    const [regiones, setRegiones] = useState<Region[]>(() => {
        const saved = sessionStorage.getItem('regiones');
        try {
            return saved ? (JSON.parse(saved) as Region[]) : [];
        } catch {
            return [];
        }
    });

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
            console.log(user);
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

            // const regions = JSON.parse(regionesStr);
            // if (regions.length > 0) {
            //     const regionesArr = JSON.parse(regionesStr);
            //     setRegiones(regionesArr);
            //     setRegionSeleccionadaState(user);
            //     setLoading(false);
            // }
        }
    }, [user]);

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

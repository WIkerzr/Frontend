/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState, ReactNode } from 'react';

export type Estado = 'borrador' | 'proceso' | 'cerrado' | 'aceptado';

export const StatusColorsFonds: Record<Estado, string> = {
    proceso: 'bg-info',
    cerrado: 'bg-danger',
    borrador: 'bg-warning',
    aceptado: 'bg-success',
};
export const StatusColors: Record<Estado, string> = {
    proceso: 'badge badge-outline-info',
    cerrado: 'badge badge-outline-danger',
    borrador: 'badge badge-outline-warning',
    aceptado: 'badge badge-outline-success',
};

type EstadoPorAnio = {
    plan: Estado;
    memoria: Estado;
};

type EstadosPorAnio = {
    [anio: number]: EstadoPorAnio;
};

interface EstadosPorAnioContextType {
    anio: number;
    setAnio: (a: number) => void;
    estados: EstadosPorAnio;
    setEstados: React.Dispatch<React.SetStateAction<EstadosPorAnio>>;
    cambiarEstadoPlan: (nuevoEstado: Estado) => void;
    cambiarEstadoMemoria: (nuevoEstado: Estado) => void;
}

const EstadosPorAnioContext = createContext<EstadosPorAnioContextType | undefined>(undefined);

export const EstadosPorAnioProvider = ({ children }: { children: ReactNode }) => {
    const anioActual = new Date().getFullYear();
    const [anio, setAnio] = useState<number>(anioActual);
    const [estados, setEstados] = useState<EstadosPorAnio>({
        [anioActual]: { plan: 'borrador', memoria: 'cerrado' },
    });

    const cambiarEstadoPlan = (nuevoEstado: Estado) => {
        setEstados((estadosPrev) => ({
            ...estadosPrev,
            [anio]: {
                ...estadosPrev[anio],
                plan: nuevoEstado,
            },
        }));
    };

    const cambiarEstadoMemoria = (nuevoEstado: Estado) => {
        setEstados((estadosPrev) => ({
            ...estadosPrev,
            [anio]: {
                ...estadosPrev[anio],
                memoria: nuevoEstado,
            },
        }));
    };

    return (
        <EstadosPorAnioContext.Provider
            value={{
                anio,
                setAnio,
                estados,
                setEstados,
                cambiarEstadoPlan,
                cambiarEstadoMemoria,
            }}
        >
            {children}
        </EstadosPorAnioContext.Provider>
    );
};

export const useEstadosPorAnio = () => {
    const ctx = useContext(EstadosPorAnioContext);
    if (!ctx) throw new Error('useEstadosPorAnio debe usarse dentro de EstadosPorAnioProvider');
    return ctx;
};

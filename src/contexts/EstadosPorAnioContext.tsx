/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { useYear } from './DatosAnualContext';
import { datosRegion } from '../types/tipadoPlan';
import { Estado } from '../types/GeneralTypes';

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
    planState: Estado;
    memoriaState: Estado;
}

const EstadosPorAnioContext = createContext<EstadosPorAnioContextType | undefined>(undefined);

export const EstadosPorAnioProvider = ({ children }: { children: ReactNode }) => {
    const { setYearData, yearData } = useYear();

    const anioActual = new Date().getFullYear();
    const [anio, setAnio] = useState<number>(anioActual ? anioActual : yearData.year);
    const [estados, setEstados] = useState<EstadosPorAnio>({
        [anioActual]: { plan: yearData.plan.status, memoria: yearData.memoria.status },
    });
    const [planState] = useState<Estado>(estados[anio].plan);
    const [memoriaState] = useState<Estado>(estados[anio].memoria);

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

    useEffect(() => {
        const yearEncontrado = datosRegion.data.find((item) => item.year === anio);
        if (yearEncontrado) {
            setYearData(yearEncontrado);
        }
    }, [anio]);

    return (
        <EstadosPorAnioContext.Provider
            value={{
                anio,
                setAnio,
                estados,
                setEstados,
                planState,
                memoriaState,
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

    const { anio, estados } = ctx;
    const estadoPlan = estados[anio]?.plan ?? 'borrador';
    const editarPlan = estadoPlan === 'borrador';

    return {
        ...ctx,
        editarPlan,
    };
};

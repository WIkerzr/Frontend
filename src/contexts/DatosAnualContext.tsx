import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { YearData, yearIniciado } from '../types/tipadoPlan';
import { datosInicializadosAccion } from '../types/TipadoAccion';

interface YearContextType {
    yearData: YearData;
    setYearData: (data: YearData) => void;
    NuevaAccion: (idEjePrioritario: string, nuevaAccion: string, nuevaLineaActuaccion: string) => void;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export const YearProvider = ({ children }: { children: ReactNode }) => {
    const [yearData, setYearDataState] = useState<YearData>(() => {
        const stored = localStorage.getItem('datosAno');
        return stored ? JSON.parse(stored) : yearIniciado;
    });

    useEffect(() => {
        localStorage.setItem('datosAno', JSON.stringify(yearData));
    }, [yearData]);

    const setYearData = (data: YearData) => {
        setYearDataState(data);
    };

    const NuevaAccion = (idEjePrioritario: string, nuevaAccion: string, nuevaLineaActuaccion: string) => {
        const ejesSeleccionado = yearData.plan.ejesPrioritarios.filter((eje) => idEjePrioritario.includes(eje.id));
        let datos = {
            ...datosInicializadosAccion,
            accion: nuevaAccion,
            ejeEs: ejesSeleccionado[0].nameEs,
            ejeEu: ejesSeleccionado[0].nameEu,
            lineaActuaccion: nuevaLineaActuaccion,
        };
        const updatedYearData = {
            ...yearData,
            plan: {
                ...yearData.plan,
                ejesPrioritarios: yearData.plan.ejesPrioritarios.map((eje) => {
                    if (idEjePrioritario.includes(eje.id)) {
                        return {
                            ...eje,
                            acciones: [...eje.acciones, datos],
                        };
                    }
                    return eje;
                }),
            },
        };
        setYearData(updatedYearData);
    };

    return <YearContext.Provider value={{ yearData, setYearData, NuevaAccion }}>{children}</YearContext.Provider>;
};

export const useYear = (): YearContextType => {
    const context = useContext(YearContext);
    if (!context) {
        throw new Error('');
    }
    return context;
};

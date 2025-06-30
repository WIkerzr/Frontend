/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { YearData, yearIniciado } from '../types/tipadoPlan';
import { DatosAccion, datosInicializadosAccion } from '../types/TipadoAccion';
import { useRegionContext } from './RegionContext';

interface YearContextType {
    yearData: YearData;
    block: boolean;
    setYearData: (data: YearData) => void;
    datosEditandoAccion: DatosAccion | undefined;
    setDatosEditandoAccion: (data: DatosAccion) => void;
    SeleccionEditarAccion: (idEjePrioritario: string, idAccion: string) => void;
    SeleccionEditarGuardar: () => void;
    NuevaAccion: (idEjePrioritario: string, nuevaAccion: string, nuevaLineaActuaccion: string) => void;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export const YearProvider = ({ children }: { children: ReactNode }) => {
    const { regionSeleccionada } = useRegionContext();
    const [idEjeEditado, setIdEjeEditado] = useState<string>('');
    const [yearData, setYearDataState] = useState<YearData>(() => {
        const stored = localStorage.getItem('datosAno');
        return stored ? JSON.parse(stored) : yearIniciado;
    });

    const [datosEditandoAccion, setDatosEditandoAccion] = useState<DatosAccion>(() => {
        const stored = localStorage.getItem('datosAccionModificado');
        return JSON.parse(stored!);
    });

    useEffect(() => {
        localStorage.setItem('datosAno', JSON.stringify(yearData));
    }, [yearData]);

    useEffect(() => {
        localStorage.setItem('datosAccionModificado', JSON.stringify(datosEditandoAccion));
    }, [datosEditandoAccion]);

    const setYearData = (data: YearData) => {
        setYearDataState(data);
    };

    const SeleccionEditarAccion = (idEjePrioritario: string, idAccion: string) => {
        setIdEjeEditado(idEjePrioritario);
        const ejeSeleccionado = yearData.plan.ejesPrioritarios.filter((eje) => idEjePrioritario.includes(eje.id));
        const accionSeleccionado = ejeSeleccionado[0].acciones.filter((accion) => idAccion.includes(accion.id));
        setDatosEditandoAccion(accionSeleccionado[0]);

        if (accionSeleccionado[0].accionCompartida && !accionSeleccionado[0].accionCompartida.includes(`${regionSeleccionada}`)) {
            setBlock(true);
        } else {
            setBlock(false);
        }
    };

    const SeleccionEditarGuardar = () => {
        console.log(datosEditandoAccion.indicadorAccion?.indicadoreRealizacion[0].metaFinal);

        const nuevosEjes = yearData.plan.ejesPrioritarios.map((eje) => {
            if (eje.id !== idEjeEditado) {
                return eje;
            }

            const nuevasAcciones = eje.acciones.map((accion) => (accion.id === datosEditandoAccion.id ? datosEditandoAccion : accion));

            return {
                ...eje,
                acciones: nuevasAcciones,
            };
        });

        setYearDataState({
            ...yearData,
            plan: {
                ...yearData.plan,
                ejesPrioritarios: nuevosEjes,
            },
        });

        setIdEjeEditado('');
    };

    const NuevaAccion = (idEjePrioritario: string, nuevaAccion: string, nuevaLineaActuaccion: string) => {
        const ejesSeleccionado = yearData.plan.ejesPrioritarios.filter((eje) => idEjePrioritario.includes(eje.id));
        const datos = {
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
    const [block, setBlock] = useState<boolean>(false);

    return (
        <YearContext.Provider value={{ yearData, block, setYearData, datosEditandoAccion, setDatosEditandoAccion, NuevaAccion, SeleccionEditarAccion, SeleccionEditarGuardar }}>
            {children}
        </YearContext.Provider>
    );
};

export const useYear = (): YearContextType => {
    const context = useContext(YearContext);
    if (!context) {
        throw new Error('');
    }
    return context;
};

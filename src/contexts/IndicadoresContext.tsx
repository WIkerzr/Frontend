import React, { createContext, useContext, useEffect, useState } from 'react';
import { IndicadorRealizacion, IndicadorResultado } from '../types/Indicadores';
import { llamadaBBDDIndicadores } from '../pages/Configuracion/componentesIndicadores';
import { actualizarFechaLLamada, obtenerFechaLlamada } from '../components/Utils/utils';
import { useTranslation } from 'react-i18next';
import { useRegionContext } from './RegionContext';
import { useUser } from './UserContext';

type IndicadorTipo = 'Realizacion' | 'Resultado';
export type Acciones = 'Editar' | 'Crear' | 'Borrar' | null;

interface IndicadorSeleccionado {
    tipo: IndicadorTipo;
    ADR: boolean;
    indicador: IndicadorRealizacion | IndicadorResultado | null;
    accion: Acciones;
    resultadosRelacionados?: IndicadorResultado[]; // solo si tipo === 'Realizacion'
}
const indicadorSeleccionadoInicial: IndicadorSeleccionado = {
    tipo: 'Resultado',
    ADR: false,
    indicador: null,
    accion: null,
};

type IndicadoresContextType = {
    indicadoresRealizacion: IndicadorRealizacion[];
    setIndicadoresRealizacion: React.Dispatch<React.SetStateAction<IndicadorRealizacion[]>>;
    indicadoresResultado: IndicadorResultado[];
    setIndicadoresResultado: React.Dispatch<React.SetStateAction<IndicadorResultado[]>>;
    indicadoresRealizacionADR: IndicadorRealizacion[];
    setIndicadoresRealizacionADR: React.Dispatch<React.SetStateAction<IndicadorRealizacion[]>>;
    indicadoresResultadoADR: IndicadorResultado[];
    setIndicadoresResultadoADR: React.Dispatch<React.SetStateAction<IndicadorResultado[]>>;

    indicadorSeleccionado: IndicadorSeleccionado | null;
    setIndicadorSeleccionado: React.Dispatch<React.SetStateAction<IndicadorSeleccionado | null>>;

    loading: boolean;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
    fechaUltimoActualizadoBBDD: Date;
    mensajeError: string;
    llamarBBDD: () => void;
    PrimeraLlamada: () => void;
};

const IndicadorContext = createContext<IndicadoresContextType>({
    indicadoresRealizacion: [],
    setIndicadoresRealizacion: () => {},
    indicadoresResultado: [],
    setIndicadoresResultado: () => {},
    indicadoresRealizacionADR: [],
    setIndicadoresRealizacionADR: () => {},
    indicadoresResultadoADR: [],
    setIndicadoresResultadoADR: () => {},
    indicadorSeleccionado: indicadorSeleccionadoInicial,
    setIndicadorSeleccionado: () => {},
    loading: true,
    setLoading: () => {},
    fechaUltimoActualizadoBBDD: new Date(),
    mensajeError: '',
    llamarBBDD: () => {},
    PrimeraLlamada: () => {},
});

export const useIndicadoresContext = () => useContext(IndicadorContext);

export const IndicadoresProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { t } = useTranslation();
    const { user } = useUser();
    const token = sessionStorage.getItem('access_token');
    const { regionSeleccionada } = useRegionContext();
    const [indicadoresRealizacion, setIndicadoresRealizacion] = useState<IndicadorRealizacion[]>([]);
    const [indicadoresResultado, setIndicadoresResultado] = useState<IndicadorResultado[]>([]);
    const [indicadoresRealizacionADR, setIndicadoresRealizacionADR] = useState<IndicadorRealizacion[]>([]);
    const [indicadoresResultadoADR, setIndicadoresResultadoADR] = useState<IndicadorResultado[]>([]);
    const [loading, setLoading] = useState(true);

    const [fechaUltimoActualizadoBBDD, setFechaUltimoActualizadoBBDD] = useState<Date>(() => {
        const fechaStr = obtenerFechaLlamada('indicadores');
        return fechaStr ? new Date(fechaStr) : new Date();
    });

    const [mensajeError, setMensajeError] = useState<string>('');

    const [indicadorSeleccionado, setIndicadorSeleccionado] = useState<IndicadorSeleccionado | null>(() => {
        const saved = sessionStorage.getItem('indicadorSeleccionado');
        if (saved) {
            try {
                return JSON.parse(saved) as IndicadorSeleccionado;
            } catch {
                return {
                    tipo: 'Resultado',
                    ADR: false,
                    indicador: null,
                    accion: null,
                };
            }
        } else {
            return {
                tipo: 'Resultado',
                ADR: false,
                indicador: null,
                accion: null,
            };
        }
    });

    const llamarBBDD = async () => {
        await llamadaBBDDIndicadores({
            setMensajeError,
            setIndicadoresRealizacion,
            setIndicadoresResultado,
            setFechaUltimoActualizadoBBDD,
            t,
        });
        actualizarIndicadoresADR();
    };

    const transformarRealizacionPorRegion = (indicadores: IndicadorRealizacion[]): IndicadorRealizacion[][] => {
        const resultado: IndicadorRealizacion[][] = [];

        indicadores.forEach((ind) => {
            const regionId = Number(ind.RegionsId);
            if (!isNaN(regionId)) {
                if (!resultado[regionId]) {
                    resultado[regionId] = [];
                }
                resultado[regionId].push(ind);
            }
        });

        return resultado;
    };

    const transformarResultadoPorRegion = (indicadores: IndicadorResultado[]): IndicadorResultado[][] => {
        const resultado: IndicadorResultado[][] = [];

        indicadores.forEach((ind) => {
            const regionId = Number(ind.RegionsId);
            if (!isNaN(regionId)) {
                if (!resultado[regionId]) {
                    resultado[regionId] = [];
                }
                resultado[regionId].push(ind);
            }
        });

        return resultado;
    };

    const actualizarIndicadoresADR = () => {
        const storedRealizacion = localStorage.getItem('indicadoresRealizacion');
        const storedResultado = localStorage.getItem('indicadoresResultado');
        if (storedRealizacion && storedResultado) {
            const indicadoresRealizacionPreFiltrado: IndicadorRealizacion[] = JSON.parse(storedRealizacion);
            const realizacionADR = transformarRealizacionPorRegion(indicadoresRealizacionPreFiltrado);
            const indicadoresResultadoPreFiltrado: IndicadorRealizacion[] = JSON.parse(storedResultado);
            const resultadoADR = transformarResultadoPorRegion(indicadoresResultadoPreFiltrado);
            if (!regionSeleccionada) {
                setIndicadoresRealizacionADR([]);
                localStorage.setItem('indicadoresRealizacionFiltrado', '[]');
            } else {
                setIndicadoresRealizacionADR(realizacionADR[regionSeleccionada] ? realizacionADR[regionSeleccionada] : []);
                localStorage.setItem('indicadoresRealizacionFiltrado', JSON.stringify(realizacionADR[regionSeleccionada] ? realizacionADR[regionSeleccionada] : []));
            }
            if (!regionSeleccionada) {
                setIndicadoresResultadoADR([]);
                localStorage.setItem('indicadoresResultadoFiltrado', '[]');
            } else {
                localStorage.setItem('indicadoresResultadoFiltrado', JSON.stringify(resultadoADR[regionSeleccionada] ? resultadoADR[regionSeleccionada] : []));
                setIndicadoresResultadoADR(resultadoADR[regionSeleccionada] ? resultadoADR[regionSeleccionada] : []);
            }
            setLoading(false);
        }
    };

    const PrimeraLlamada = () => {
        setMensajeError('');
        if (!token) return;
        if (user && (user.role as string) != 'GOBIERNOVASCO') {
            setLoading(true);
            const storedRealizacion = localStorage.getItem('indicadoresRealizacion');
            const storedResultado = localStorage.getItem('indicadoresResultado');
            if (storedRealizacion && storedRealizacion != '[]' && storedResultado && storedResultado != '[]') {
                const indicadoresRealizacion: IndicadorRealizacion[] = JSON.parse(storedRealizacion);
                setIndicadoresRealizacion(indicadoresRealizacion);
                const indicadoresResultado: IndicadorResultado[] = JSON.parse(storedResultado);
                setIndicadoresResultado(indicadoresResultado);
                actualizarIndicadoresADR();
                setLoading(false);
                return;
            } else {
                llamarBBDD();
                setLoading(false);
            }
        }
    };

    useEffect(() => {
        if (!token) return;
        if (user && (user.role as string) != 'GOBIERNOVASCO') {
            if (indicadoresResultado.length > 0) {
                actualizarIndicadoresADR();
            }
        }
    }, [regionSeleccionada]);

    useEffect(() => {
        if (!indicadoresRealizacionADR) {
            setIndicadoresRealizacionADR([]);
        } else {
            const regionIdADR = indicadoresRealizacionADR[0]?.RegionsId;
            if (regionIdADR) {
                const nuevosIndicadores = [...indicadoresRealizacion.filter((r) => r.RegionsId !== regionIdADR), ...indicadoresRealizacionADR];
                setIndicadoresRealizacion(nuevosIndicadores);
            }
            localStorage.setItem('indicadoresRealizacionFiltrado', JSON.stringify(indicadoresRealizacionADR));
        }
    }, [indicadoresRealizacionADR]);

    useEffect(() => {
        if (!indicadoresResultadoADR) {
            setIndicadoresResultadoADR([]);
        } else {
            const regionIdADR = indicadoresResultadoADR[0]?.RegionsId;
            if (regionIdADR) {
                const nuevosIndicadores = [...indicadoresResultado.filter((r) => r.RegionsId !== regionIdADR), ...indicadoresResultadoADR];
                setIndicadoresResultado(nuevosIndicadores);
            }
            localStorage.setItem('indicadoresResultadoFiltrado', JSON.stringify(indicadoresResultadoADR));
        }
    }, [indicadoresResultadoADR]);

    useEffect(() => {
        if (!indicadoresRealizacion) {
            setIndicadoresRealizacion([]);
        } else {
            localStorage.setItem('indicadoresRealizacion', JSON.stringify(indicadoresRealizacion));
        }
    }, [indicadoresRealizacion]);

    useEffect(() => {
        if (!indicadoresResultado) {
            setIndicadoresResultado([]);
        } else {
            localStorage.setItem('indicadoresResultado', JSON.stringify(indicadoresResultado));
        }
    }, [indicadoresResultado]);

    useEffect(() => {
        actualizarFechaLLamada('indicadores');
    }, [fechaUltimoActualizadoBBDD]);

    useEffect(() => {
        sessionStorage.setItem('estadoIndicador', JSON.stringify(indicadorSeleccionado));
    }, [indicadorSeleccionado]);

    return (
        <IndicadorContext.Provider
            value={{
                indicadoresRealizacion,
                setIndicadoresRealizacion,
                indicadoresResultado,
                setIndicadoresResultado,
                indicadoresRealizacionADR,
                setIndicadoresRealizacionADR,
                indicadoresResultadoADR,
                setIndicadoresResultadoADR,
                fechaUltimoActualizadoBBDD,
                mensajeError,
                indicadorSeleccionado,
                setIndicadorSeleccionado,
                loading,
                setLoading,
                llamarBBDD,
                PrimeraLlamada,
            }}
        >
            {children}
        </IndicadorContext.Provider>
    );
};

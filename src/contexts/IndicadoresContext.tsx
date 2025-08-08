import React, { createContext, useContext, useEffect, useState } from 'react';
import { indicadorInicial, IndicadorRealizacion, IndicadorResultado } from '../types/Indicadores';
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
    indicador: IndicadorRealizacion | IndicadorResultado;
    accion: Acciones;
    resultadosListado?: IndicadorResultado[]; // solo si tipo === 'Realizacion'
}

const indicadorSeleccionadoInicial: IndicadorSeleccionado = {
    tipo: 'Resultado',
    ADR: false,
    indicador: indicadorInicial,
    accion: null,
};

type IndicadoresContextType = {
    ControlDeFallosIndicadorSeleccionado: () => IndicadorSeleccionado;
    fechaUltimoActualizadoBBDD: Date;
    indicadoresRealizacion: IndicadorRealizacion[];
    indicadoresRealizacionADR: IndicadorRealizacion[];
    indicadoresResultado: IndicadorResultado[];
    indicadoresResultadoADR: IndicadorResultado[];
    indicadorSeleccionado: IndicadorSeleccionado | null;
    llamarBBDD: () => void;
    loading: boolean;
    mensajeError: string;
    ObtenerRealizacionPorRegion: () => Record<string | number, IndicadorRealizacion[]>;
    ObtenerResultadosPorRegion: () => Record<string | number, IndicadorResultado[]>;
    PrimeraLlamada: () => void;
    setIndicadoresRealizacion: React.Dispatch<React.SetStateAction<IndicadorRealizacion[]>>;
    setIndicadoresRealizacionADR: React.Dispatch<React.SetStateAction<IndicadorRealizacion[]>>;
    setIndicadoresResultado: React.Dispatch<React.SetStateAction<IndicadorResultado[]>>;
    setIndicadoresResultadoADR: React.Dispatch<React.SetStateAction<IndicadorResultado[]>>;
    setIndicadorSeleccionado: React.Dispatch<React.SetStateAction<IndicadorSeleccionado | null>>;
    setLoading: React.Dispatch<React.SetStateAction<boolean>>;
};

const IndicadorContext = createContext<IndicadoresContextType>({
    ControlDeFallosIndicadorSeleccionado: () => {
        throw new Error('ControlDeFallos no inicializado');
    },
    fechaUltimoActualizadoBBDD: new Date(),
    indicadoresRealizacion: [],
    indicadoresRealizacionADR: [],
    indicadoresResultado: [],
    indicadoresResultadoADR: [],
    indicadorSeleccionado: indicadorSeleccionadoInicial,
    llamarBBDD: () => {},
    loading: true,
    mensajeError: '',
    ObtenerRealizacionPorRegion: () => ({}),
    ObtenerResultadosPorRegion: () => ({}),
    PrimeraLlamada: () => {},
    setIndicadoresRealizacion: () => {},
    setIndicadoresRealizacionADR: () => {},
    setIndicadoresResultado: () => {},
    setIndicadoresResultadoADR: () => {},
    setIndicadorSeleccionado: () => {},
    setLoading: () => {},
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
                    indicador: indicadorInicial,
                    accion: null,
                };
            }
        } else {
            return {
                tipo: 'Resultado',
                ADR: false,
                indicador: indicadorInicial,
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
                const realizacionRegionSelec = realizacionADR[Number(regionSeleccionada)];
                setIndicadoresRealizacionADR(realizacionRegionSelec ?? []);
                localStorage.setItem('indicadoresRealizacionFiltrado', JSON.stringify(realizacionRegionSelec ?? []));
            }
            if (!regionSeleccionada) {
                setIndicadoresResultadoADR([]);
                localStorage.setItem('indicadoresResultadoFiltrado', '[]');
            } else {
                const resultadoRegionSelec = resultadoADR[Number(regionSeleccionada)];
                localStorage.setItem('indicadoresResultadoFiltrado', JSON.stringify(resultadoRegionSelec ?? []));
                setIndicadoresResultadoADR(resultadoRegionSelec ?? []);
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

    const ControlDeFallosIndicadorSeleccionado = (): IndicadorSeleccionado => {
        if (!indicadorSeleccionado || !indicadorSeleccionado.indicador) {
            console.log(indicadorSeleccionado);
            const error = new Error('Se ha intentado acceder al indicador seleccionado sin haberlo definido correctamente.');
            const stackLines = error.stack?.split('\n') || [];

            // La línea 0 es el mensaje de error
            // La línea 1 es la función actual (ControlDeFallosIndicadorSeleccionado)
            // La línea 2 es quien llamó a esta función
            const callerLine = stackLines[2]?.trim() || 'Información de llamada no disponible';

            console.error(error.stack);

            // Lanza el error con contexto de dónde fue llamada esta función
            throw new Error(`${error.message} (Llamado desde: ${callerLine})`);
        }

        return indicadorSeleccionado as IndicadorSeleccionado;
    };

    const ObtenerRealizacionPorRegion = () => {
        if (!indicadoresRealizacion || indicadoresRealizacion.length === 0) return {};
        return indicadoresRealizacion.reduce<Record<string | number, (typeof indicadoresRealizacion)[0][]>>((acc, indicador) => {
            const key = indicador.RegionsId ?? '0';
            if (!acc[key]) acc[key] = [];
            acc[key].push(indicador);
            return acc;
        }, {});
    };

    const ObtenerResultadosPorRegion = () => {
        if (!indicadoresResultado || indicadoresResultado.length === 0) return {};
        return indicadoresResultado.reduce<Record<string | number, (typeof indicadoresResultado)[0][]>>((acc, indicador) => {
            const key = indicador.RegionsId ?? '0';
            if (!acc[key]) acc[key] = [];
            acc[key].push(indicador);
            return acc;
        }, {});
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
                ControlDeFallosIndicadorSeleccionado,
                fechaUltimoActualizadoBBDD,
                indicadoresRealizacion,
                indicadoresRealizacionADR,
                indicadoresResultado,
                indicadoresResultadoADR,
                indicadorSeleccionado,
                llamarBBDD,
                loading,
                mensajeError,
                ObtenerRealizacionPorRegion,
                ObtenerResultadosPorRegion,
                PrimeraLlamada,
                setIndicadoresRealizacion,
                setIndicadoresRealizacionADR,
                setIndicadoresResultado,
                setIndicadoresResultadoADR,
                setIndicadorSeleccionado,
                setLoading,
            }}
        >
            {children}
        </IndicadorContext.Provider>
    );
};

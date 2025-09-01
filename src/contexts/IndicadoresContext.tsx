/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { indicadorInicial, IndicadorRealizacion, IndicadorResultado, TiposDeIndicadores } from '../types/Indicadores';
import { llamadaBBDDIndicadores } from '../pages/Configuracion/componentesIndicadores';
import { actualizarFechaLLamada, obtenerFechaLlamada } from '../components/Utils/utils';
import { useTranslation } from 'react-i18next';
import { useUser } from './UserContext';
import { EjeIndicadorBBDD } from '../types/tipadoPlan';
import { ApiSuccess, LlamadasBBDD } from '../components/Utils/data/utilsData';
import { useRegionContext } from './RegionContext';
import { useAuth } from './AuthContext';

export type IndicadorTipo = 'Realizacion' | 'Resultado';
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
    ejesIndicador: EjeIndicadorBBDD[];
    indicadoresResultadoADR: IndicadorResultado[];
    indicadorSeleccionado: IndicadorSeleccionado | null;
    llamarIndicadoresBBDD: () => void;
    loading: boolean;
    mensajeError: string;
    ObtenerRealizacionPorRegion: () => Record<string | number, IndicadorRealizacion[]>;
    ObtenerResultadosPorRegion: () => Record<string | number, IndicadorResultado[]>;
    ListadoNombresIdicadoresSegunADR: (tipoIndicador: TiposDeIndicadores) => { id: number; nombre: string; idsResultados?: number[] | undefined }[];
    PrimeraLlamada: (regionSeleccionada: string | null) => void;
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
    ejesIndicador: [],
    indicadoresResultadoADR: [],
    indicadorSeleccionado: indicadorSeleccionadoInicial,
    llamarIndicadoresBBDD: () => {},
    loading: true,
    mensajeError: '',
    ObtenerRealizacionPorRegion: () => ({}),
    ObtenerResultadosPorRegion: () => ({}),
    ListadoNombresIdicadoresSegunADR: () => [],
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
    const { t, i18n } = useTranslation();
    const { user } = useUser();
    const { regionSeleccionada } = useRegionContext();
    const [ejesIndicador, setEjesIndicador] = useState<EjeIndicadorBBDD[]>([]);
    const [indicadoresRealizacion, setIndicadoresRealizacion] = useState<IndicadorRealizacion[]>([]);
    const [indicadoresResultado, setIndicadoresResultado] = useState<IndicadorResultado[]>([]);
    const [indicadoresRealizacionADR, setIndicadoresRealizacionADR] = useState<IndicadorRealizacion[]>([]);
    const [indicadoresResultadoADR, setIndicadoresResultadoADR] = useState<IndicadorResultado[]>([]);
    const [loading, setLoading] = useState(true);
    const { login } = useAuth();

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

    useEffect(() => {
        const token = sessionStorage.getItem('access_token');
        if (!token) return;
        llamarIndicadoresBBDD();
    }, [login]);

    const llamarIndicadoresBBDD = async () => {
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

    const PrimeraLlamada = (regionSeleccionada: string | null) => {
        const token = sessionStorage.getItem('access_token');
        setMensajeError('');
        if (!token) return;
        if (user && (user.role as string) != 'GOBIERNOVASCO') {
            setLoading(true);
            const storedRealizacion = localStorage.getItem('indicadoresRealizacion');
            const storedResultado = localStorage.getItem('indicadoresResultado');

            if (storedRealizacion && storedRealizacion != '[]' && storedResultado && storedResultado != '[]' && regionSeleccionada === regionSeleccionada) {
                const indicadoresRealizacion: IndicadorRealizacion[] = JSON.parse(storedRealizacion);
                setIndicadoresRealizacion(indicadoresRealizacion);
                const indicadoresResultado: IndicadorResultado[] = JSON.parse(storedResultado);
                setIndicadoresResultado(indicadoresResultado);
                actualizarIndicadoresADR();
                SegundaLlamadaEjes();
                setLoading(false);
                return;
            } else {
                SegundaLlamadaEjes();
                setLoading(false);
            }
        }
    };

    // useEffect(() => {
    //     if (!regionSeleccionada || regionSeleccionada === '0') {
    //         const region = sessionStorage.getItem(`regionSeleccionada`);
    //         if (region) {
    //             const regionId = region ? JSON.parse(region).id : null;
    //             setRegionSeleccionadaIndicadores(regionId);
    //         } else {
    //             setRegionSeleccionadaIndicadores(null);
    //         }
    //     } else {
    //         setRegionSeleccionadaIndicadores(null);
    //     }
    // }, [regionSeleccionada, PrimeraLlamada]);

    const SegundaLlamadaEjes = () => {
        const ejes = localStorage.getItem(`EjesIndicador_${regionSeleccionada}`);
        if (ejes) {
            setEjesIndicador(JSON.parse(ejes));
            return;
        }

        const url = regionSeleccionada ? `ejes/${regionSeleccionada}` : `/ejes`;
        LlamadasBBDD({
            method: 'GET',
            url: url,
            setLoading: setLoading,
            setFechaUltimoActualizadoBBDD: setFechaUltimoActualizadoBBDD,
            onSuccess: (response: ApiSuccess<EjeIndicadorBBDD[]>) => {
                const arrayMapeado = response.data.map((ejes: EjeIndicadorBBDD) => ({
                    EjeId: ejes.EjeId,
                    NameEs: ejes.NameEs || '',
                    NameEu: ejes.NameEu || '',
                }));
                setEjesIndicador(arrayMapeado);
                for (let i = localStorage.length - 1; i >= 0; i--) {
                    const key = localStorage.key(i);
                    if (key && key.startsWith('EjesIndicador_')) {
                        localStorage.removeItem(key);
                    }
                }
                localStorage.setItem(`EjesIndicador_${regionSeleccionada}`, JSON.stringify(arrayMapeado));
            },
        });
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

    const ObtenerResultadosPorRegion = (): Record<string, (typeof indicadoresResultado)[0][]> => {
        if (!indicadoresResultado || indicadoresResultado.length === 0) return {};
        return indicadoresResultado.reduce<Record<string, (typeof indicadoresResultado)[0][]>>((acc, indicador) => {
            const key = indicador.RegionsId !== undefined && indicador.RegionsId !== null ? String(indicador.RegionsId) : '0';
            if (!acc[key]) acc[key] = [];
            acc[key].push(indicador);
            return acc;
        }, {});
    };

    const ListadoNombresIdicadoresSegunADR = (tipoIndicador: TiposDeIndicadores): { id: number; nombre: string; idsResultados?: number[] | undefined }[] => {
        let indicador: IndicadorRealizacion[] | IndicadorResultado[] = [];

        if (tipoIndicador === 'realizacion') {
            indicador = indicadoresRealizacion;
        } else if (tipoIndicador === 'resultado') {
            indicador = indicadoresResultado;
        }

        const combinados = [
            ...(regionSeleccionada ? indicador.filter((ind) => Number(ind.RegionsId) === Number(regionSeleccionada)) : []),
            ...indicador.filter((ind) => ind.RegionsId === null || Number(ind.RegionsId) === 0),
        ];

        const listadoArray = combinados.map((ind) => {
            const nombre = (i18n.language === 'eu' ? ind.NameEu : ind.NameEs) ?? '';

            const idsResultados = tipoIndicador === 'realizacion' && 'Resultados' in ind && Array.isArray(ind.Resultados) ? ind.Resultados.map((res) => res.Id) : undefined;

            return {
                id: ind.Id,
                nombre,
                idsResultados,
            };
        });

        return listadoArray;
    };

    useEffect(() => {
        const token = sessionStorage.getItem('access_token');
        if (!token) return;
        if (user && (user.role as string) != 'GOBIERNOVASCO') {
            actualizarIndicadoresADR();
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
                ejesIndicador,
                indicadoresResultadoADR,
                indicadorSeleccionado,
                llamarIndicadoresBBDD,
                loading,
                mensajeError,
                ObtenerRealizacionPorRegion,
                ObtenerResultadosPorRegion,
                ListadoNombresIdicadoresSegunADR,
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

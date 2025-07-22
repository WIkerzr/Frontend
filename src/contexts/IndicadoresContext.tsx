/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { indicadorInicialResultado, IndicadorRealizacion, IndicadorResultado } from '../types/Indicadores';
import { llamadaBBDDIndicadores } from '../pages/Configuracion/componentesIndicadores';
import { actualizarFechaLLamada, obtenerFechaLlamada } from '../components/Utils/utils';
import { useTranslation } from 'react-i18next';
import { useRegionContext } from './RegionContext';
import { useUser } from './UserContext';

type IndicadoresContextType = {
    indicadoresRealizacion: IndicadorRealizacion[];
    setIndicadoresRealizacion: React.Dispatch<React.SetStateAction<IndicadorRealizacion[]>>;
    indicadoresResultado: IndicadorResultado[];
    setIndicadoresResultado: React.Dispatch<React.SetStateAction<IndicadorResultado[]>>;
    // indicadoresRealizacionRegion: IndicadorRealizacion[][];
    // setIndicadoresRealizacionRegion: React.Dispatch<React.SetStateAction<IndicadorRealizacion[][]>>;
    // indicadoresResultadoRegion: IndicadorResultado[][];
    // setIndicadoresResultadoRegion: React.Dispatch<React.SetStateAction<IndicadorResultado[][]>>;
    indicadoresRealizacionADR: IndicadorRealizacion[];
    setIndicadoresRealizacionADR: React.Dispatch<React.SetStateAction<IndicadorRealizacion[]>>;
    indicadoresResultadoADR: IndicadorResultado[];
    setIndicadoresResultadoADR: React.Dispatch<React.SetStateAction<IndicadorResultado[]>>;
    indicadorSeleccionada: IndicadorRealizacion | IndicadorResultado | null;
    SeleccionEditarIndicador: (indicador: IndicadorRealizacion | IndicadorResultado | null) => void;
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
    indicadorSeleccionada: indicadorInicialResultado,
    SeleccionEditarIndicador: () => {},
    loading: true,
    setLoading: () => {},
    fechaUltimoActualizadoBBDD: new Date(),
    mensajeError: '',
    llamarBBDD: () => {},
    PrimeraLlamada: () => {},
    // indicadoresRealizacionRegion: [],
    // setIndicadoresRealizacionRegion: () => {},
    // indicadoresResultadoRegion: [],
    // setIndicadoresResultadoRegion: () => {},
});

export const useIndicadoresContext = () => useContext(IndicadorContext);

export const IndicadoresProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [indicadoresReaBorrar, setIndicadoresReaBorrar] = useState<IndicadorRealizacion[]>([]);
    const [indicadoresResBorrar, setIndicadoresResBorrar] = useState<IndicadorResultado[]>([]);

    const { t } = useTranslation();
    const { user } = useUser();
    const token = sessionStorage.getItem('token');
    const { regionSeleccionada } = useRegionContext();
    const [indicadoresRealizacion, setIndicadoresRealizacion] = useState<IndicadorRealizacion[]>([]);
    const [indicadoresResultado, setIndicadoresResultado] = useState<IndicadorResultado[]>([]);
    const [indicadoresRealizacionADR, setIndicadoresRealizacionADR] = useState<IndicadorRealizacion[]>([]);
    // const [indicadoresRealizacionRegion, setIndicadoresRealizacionRegion] = useState<IndicadorRealizacion[][]>([]);
    const [indicadoresResultadoADR, setIndicadoresResultadoADR] = useState<IndicadorResultado[]>([]);
    // const [indicadoresResultadoRegion, setIndicadoresResultadoRegion] = useState<IndicadorResultado[][]>([]);
    const [loading, setLoading] = useState(true);

    const [fechaUltimoActualizadoBBDD, setFechaUltimoActualizadoBBDD] = useState<Date>(() => {
        const fechaStr = obtenerFechaLlamada('indicadores');
        return fechaStr ? new Date(fechaStr) : new Date();
    });

    const [mensajeError, setMensajeError] = useState<string>('');

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
        if (!token) return;
        if (user && (user.role as string) != 'GOBIERNOVASCO') {
            setLoading(true);
            const storedRealizacion = localStorage.getItem('indicadoresRealizacion');
            const storedResultado = localStorage.getItem('indicadoresResultado');
            if (storedRealizacion && storedResultado) {
                const indicadoresRealizacion: IndicadorRealizacion[] = JSON.parse(storedRealizacion);
                setIndicadoresRealizacion(indicadoresRealizacion);
                console.log('Primera llamada');
                console.log(indicadoresRealizacion);
                const indicadoresResultado: IndicadorResultado[] = JSON.parse(storedResultado);
                console.log(indicadoresResultado);
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

    // useEffect(() => {
    //     if (!regionSeleccionada) {
    //         return;
    //     }
    //     setIndicadoresRealizacionADR(indicadoresRealizacionRegion[regionSeleccionada]);
    //     setIndicadoresResultadoADR(indicadoresResultadoRegion[regionSeleccionada]);
    //     console.log('indicadoresRealizacionRegion');
    //     console.log(indicadoresRealizacionRegion);
    //     console.log('indicadoresResultadoRegion');
    //     console.log(indicadoresResultadoRegion);
    // }, [regionSeleccionada]);

    useEffect(() => {
        if (!indicadoresRealizacionADR) {
            setIndicadoresRealizacionADR([]);
        }
        setIndicadoresReaBorrar(indicadoresRealizacionADR);
        if (!indicadoresRealizacionADR) {
            console.log('indicadoresRealizacionADR');
            console.log(indicadoresRealizacionADR);
            console.log('indicadoresReaBorrar');
            console.log(indicadoresReaBorrar);
        }
    }, [indicadoresRealizacionADR]);

    useEffect(() => {
        if (!indicadoresResultadoADR) {
            setIndicadoresResultadoADR([]);
        }
        setIndicadoresResBorrar(indicadoresRealizacionADR);
        if (!indicadoresResultadoADR) {
            console.log('indicadoresResultadoADR');
            console.log(indicadoresResultadoADR);
            console.log('indicadoresResBorrar');
            console.log(indicadoresResBorrar);
        }
    }, [indicadoresResultadoADR]);

    // useEffect(() => {
    //     if (!token) return;
    //     if (user && (user.role as string) != 'GOBIERNOVASCO') {
    //         setLoading(true);
    //         const storedRealizacion = localStorage.getItem('indicadoresRealizacion');
    //         const storedResultado = localStorage.getItem('indicadoresResultado');
    //         if (storedRealizacion && storedResultado) {
    //             const indicadoresRealizacion: IndicadorRealizacion[] = JSON.parse(storedRealizacion);
    //             setIndicadoresRealizacion(indicadoresRealizacion);
    //             const indicadoresResultado: IndicadorResultado[] = JSON.parse(storedResultado);
    //             setIndicadoresResultado(indicadoresResultado);
    //             setLoading(false);
    //             return;
    //         } else {
    //             llamarBBDD();
    //             setLoading(false);
    //         }
    //     }
    // }, [user]);

    // useEffect(() => {
    //     localStorage.setItem('indicadoresRealizacionFiltrado', JSON.stringify(indicadoresRealizacionADR));
    //     localStorage.setItem('indicadoresResultadoFiltrado', JSON.stringify(indicadoresResultadoADR));

    //     setIndicadoresRealizacion((prev) => {
    //         const idsADR = new Set(indicadoresRealizacionADR.map((ind) => ind.Id));
    //         const sinADR = prev.filter((ind) => !idsADR.has(ind.Id));
    //         return [...sinADR, ...indicadoresRealizacionADR];
    //     });
    //     setIndicadoresResultado((prev) => {
    //         const idsADR = new Set(indicadoresResultadoADR.map((ind) => ind.Id));
    //         const sinADR = prev.filter((ind) => !idsADR.has(ind.Id));
    //         return [...sinADR, ...indicadoresResultadoADR];
    //     });
    //     localStorage.setItem('indicadoresRealizacion', JSON.stringify(indicadoresRealizacion));
    //     localStorage.setItem('indicadoresResultado', JSON.stringify(indicadoresResultado));
    // }, [indicadoresRealizacionADR, indicadoresResultadoADR]);

    // useEffect(() => {
    //     localStorage.setItem('indicadoresRealizacion', JSON.stringify(indicadoresRealizacion));
    //     localStorage.setItem('indicadoresResultado', JSON.stringify(indicadoresResultado));

    //     const indicadoresRealizacionADR = filtrarPorAdr(indicadoresRealizacion);
    //     const indicadoresResultadoADR = filtrarPorAdr(indicadoresResultado);
    //     localStorage.setItem('indicadoresRealizacionFiltrado', JSON.stringify(indicadoresRealizacionADR));
    //     localStorage.setItem('indicadoresResultadoFiltrado', JSON.stringify(indicadoresResultadoADR));
    // }, [indicadoresRealizacion, indicadoresResultado]);

    useEffect(() => {
        actualizarFechaLLamada('indicadores');
    }, [fechaUltimoActualizadoBBDD]);

    // useEffect(() => {
    //     if (!token) return;
    //     if (user && (user.role as string) != 'GOBIERNOVASCO') {
    //         if (!regionSeleccionada || regionSeleccionada === 0) {
    //             localStorage.removeItem('indicadoresRealizacionFiltrado');
    //             localStorage.removeItem('indicadoresResultadoFiltrado');
    //             setIndicadoresRealizacionADR([]);
    //             setIndicadoresResultadoADR([]);
    //         } else {
    //             const storedRealizacion = localStorage.getItem('indicadoresRealizacion');
    //             const storedResultado = localStorage.getItem('indicadoresResultado');
    //             if (storedRealizacion) {
    //                 const indicadoresRealizacionPreFiltrado: IndicadorRealizacion[] = JSON.parse(storedRealizacion);
    //                 const indicadoresRealizacionRegionSeleccionada = filtrarPorAdr(indicadoresRealizacionPreFiltrado);
    //                 setIndicadoresRealizacionADR(indicadoresRealizacionRegionSeleccionada);
    //                 localStorage.setItem('indicadoresRealizacionFiltrado', JSON.stringify(indicadoresRealizacionRegionSeleccionada));
    //             }
    //             if (storedResultado) {
    //                 const indicadoresResultadoPreFiltrado: IndicadorResultado[] = JSON.parse(storedResultado);
    //                 const indicadoresResultadoRegionSeleccionada = filtrarPorAdr(indicadoresResultadoPreFiltrado);
    //                 setIndicadoresResultadoADR(indicadoresResultadoRegionSeleccionada);
    //                 localStorage.setItem('indicadoresResultadoFiltrado', JSON.stringify(indicadoresResultadoRegionSeleccionada));
    //             }
    //         }

    //         setLoading(false);
    //     }
    // }, [regionSeleccionada, user]);

    const [indicadorSeleccionada, setIndicadorSeleccionada] = useState<IndicadorRealizacion | IndicadorResultado | null>(() => {
        const saved = sessionStorage.getItem('indicadorSeleccionada');
        return saved ? (JSON.parse(saved) as IndicadorRealizacion) : null;
    });

    const SeleccionEditarIndicador = (indicador: IndicadorRealizacion | IndicadorResultado | null) => {
        setIndicadorSeleccionada(indicador);
        sessionStorage.setItem('indicadorSeleccionada', JSON.stringify(indicador));
    };

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
                indicadorSeleccionada,
                SeleccionEditarIndicador,
                fechaUltimoActualizadoBBDD,
                mensajeError,
                loading,
                setLoading,
                llamarBBDD,
                PrimeraLlamada,
                // indicadoresRealizacionRegion,
                // indicadoresResultadoRegion,
                // setIndicadoresRealizacionRegion,
                // setIndicadoresResultadoRegion,
            }}
        >
            {children}
        </IndicadorContext.Provider>
    );
};

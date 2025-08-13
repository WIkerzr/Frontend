/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { getRegiones, RegionInterface } from '../components/Utils/data/getRegiones';
import { useUser } from './UserContext';
import { datosRegion, InitialDataResponse } from '../types/tipadoPlan';
import { formateaConCeroDelante } from '../components/Utils/utils';
import { GenerarCodigosRegiones } from '../pages/Configuracion/componentesIndicadores';
import { useTranslation } from 'react-i18next';

import { useYear } from './DatosAnualContext';
import { Estado } from '../types/GeneralTypes';
import { ApiTarget } from '../components/Utils/data/controlDev';
import { FetchConRefreshRetry, gestionarErrorServidor } from '../components/Utils/utils';
import { useAuth } from './AuthContext';

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

interface CodRegiones {
    [key: number]: string;
}

type EstadoPorAnio = {
    plan: Estado | null;
    memoria: Estado | null;
};

type EstadosPorAnio = {
    [anio: number]: EstadoPorAnio;
};

type RegionEstadosContextType = {
    // Región
    regiones: RegionInterface[];
    regionActual?: RegionInterface;
    regionData: InitialDataResponse | undefined;
    codRegiones: CodRegiones;
    loading: boolean;
    error: Error | null;
    regionSeleccionada: string | null;
    nombreRegionSeleccionada: string | null;
    setRegionSeleccionada: (id: number | null) => void;

    // Estados por año
    anio: number | null;
    anios: number[];
    setAnio: (a: number) => void;
    estados: EstadosPorAnio;
    setEstados: React.Dispatch<React.SetStateAction<EstadosPorAnio>>;
    cambiarEstadoPlan: (nuevoEstado: Estado) => void;
    cambiarEstadoMemoria: (nuevoEstado: Estado) => void;
    planState: Estado | null;
    memoriaState: Estado | null;
};

const RegionEstadosContext = createContext<RegionEstadosContextType>({
    // Región
    regiones: [],
    regionActual: { RegionId: '', NameEs: '', NameEu: '' },
    regionData: undefined,
    codRegiones: {},
    loading: false,
    error: null,
    regionSeleccionada: null,
    nombreRegionSeleccionada: null,
    setRegionSeleccionada: () => {},
    // Estados por año
    anio: null,
    anios: [],
    setAnio: () => {},
    estados: {},
    setEstados: () => {},
    cambiarEstadoPlan: () => {},
    cambiarEstadoMemoria: () => {},
    planState: null,
    memoriaState: null,
});

export const useRegionEstadosContext = () => useContext(RegionEstadosContext);

export const RegionEstadosProvider = ({ children }: { children: ReactNode }) => {
    // --- Región ---
    const [regionData, setRegionData] = useState<InitialDataResponse>();
    const { i18n } = useTranslation();
    const { user } = useUser();
    const token = sessionStorage.getItem('access_token');
    const [regionActual, setRegionActual] = useState<RegionInterface>();
    const [codRegiones, setCodRegiones] = useState<CodRegiones>({});
    const [regiones, setRegiones] = useState<RegionInterface[]>(() => {
        const saved = sessionStorage.getItem('regiones');
        try {
            return saved ? (JSON.parse(saved) as RegionInterface[]) : [];
        } catch {
            return [];
        }
    });

    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    const savedRegion = sessionStorage.getItem('regionSeleccionada');
    const parsedRegion = savedRegion ? JSON.parse(savedRegion) : null;

    const [regionSeleccionada, setRegionSeleccionadaState] = useState<string | null>(parsedRegion?.id ?? null);
    const [nombreRegionSeleccionada, setNombreRegionSeleccionada] = useState<string | null>(parsedRegion?.nombre ?? null);

    useEffect(() => {
        if (regionSeleccionada !== null && regionSeleccionada !== '') {
            sessionStorage.setItem('regionSeleccionada', JSON.stringify({ id: regionSeleccionada, nombre: nombreRegionSeleccionada }));
            const regionCompleta = regiones.find((r) => `${r.RegionId}` === regionSeleccionada);

            if (regionCompleta) {
                setNombreRegionSeleccionada(i18n.language === 'es' ? (regionCompleta.NameEs ? regionCompleta.NameEs : regionCompleta.NameEu) : null);
                setRegionActual(regionCompleta);
            }
            setRegionData(datosRegion);
        }
    }, [regionSeleccionada, regiones, i18n.language, nombreRegionSeleccionada]);

    useEffect(() => {
        const codiRegiones = GenerarCodigosRegiones(regiones);
        setCodRegiones(codiRegiones);
    }, [regiones]);

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
            } else {
                setLoading(false);
            }
        }
    }, [user, token]);

    const setRegionSeleccionada = (id: number | string | null) => {
        if (Number.isNaN(id)) {
            return;
        }
        if (id === null) {
            setRegionSeleccionadaState(null);
        } else {
            setRegionSeleccionadaState(formateaConCeroDelante(`${id}`));
        }
    };

    // --- Estados por año ---
    const { yearData, llamadaBBDDYearData } = useYear();
    const { login } = useAuth();

    const anioActual = new Date().getFullYear();
    const [anio, setAnio] = useState<number | null>(null);
    const [anios, setAnios] = useState<number[]>([]);
    const [estados, setEstados] = useState<EstadosPorAnio>({
        [anioActual]: { plan: yearData.plan.status, memoria: yearData.memoria.status },
    });
    const [planState, setPlanState] = useState<Estado | null>(null);
    const [memoriaState, setMemoriaState] = useState<Estado | null>(null);

    useEffect(() => {
        if (!token) return;
        if (user && user.role !== 'ADR') {
            llamadaAniosNoADR();
        }
    }, [login]);

    useEffect(() => {
        if (regionSeleccionada && Number(regionSeleccionada) > 0) {
            if (user?.role === 'ADR') {
                llamadaAniosXCambioRegionADR();
            } else {
                const aniosRegion = sessionStorage.getItem('aniosRegion');
                if (aniosRegion) {
                    const aniosParsed = JSON.parse(aniosRegion) as { RegionId: number; Years: number[] }[];
                    const region = aniosParsed.find((r) => r.RegionId === Number(regionSeleccionada));
                    const aniosDeRegion = region ? region.Years : [];
                    setAnios(aniosDeRegion);
                }
            }
        } else {
            setAnio(null);
        }
    }, [regionSeleccionada, user]);

    useEffect(() => {
        if (anios && anios.length > 0) {
            const newAnio = anios.at(-1) ?? null;
            setAnio(newAnio);
            if (newAnio !== null && estados[newAnio]) {
                setPlanState(estados[newAnio].plan);
                setMemoriaState(estados[newAnio].memoria);
            } else {
                setPlanState(null);
                setMemoriaState(null);
            }
        } else {
            setAnio(null);
            setPlanState(null);
            setMemoriaState(null);
        }
    }, [anios, estados]);

    const cambiarEstadoPlan = (nuevoEstado: Estado) => {
        if (!anio) {
            return;
        }
        setEstados((estadosPrev) => ({
            ...estadosPrev,
            [anio]: {
                ...estadosPrev[anio],
                plan: nuevoEstado,
            },
        }));
    };

    const cambiarEstadoMemoria = (nuevoEstado: Estado) => {
        if (!anio) {
            return;
        }
        setEstados((estadosPrev) => ({
            ...estadosPrev,
            [anio]: {
                ...estadosPrev[anio],
                memoria: nuevoEstado,
            },
        }));
    };

    useEffect(() => {
        if (anio !== null) {
            llamadaBBDDYearData(anio);
        }
    }, [anio, llamadaBBDDYearData]);

    const llamadaAniosXCambioRegionADR = () => {
        const fetchYears = async () => {
            const token = sessionStorage.getItem('access_token');
            try {
                const res = await FetchConRefreshRetry(`${ApiTarget}/yearData/${Number(regionSeleccionada)}`, {
                    headers: {
                        method: 'GET',
                        Authorization: `Bearer ` + token,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await res.json();
                if (!res.ok) {
                    const errorInfo = gestionarErrorServidor(res, data);
                    console.log(errorInfo.mensaje);
                    setAnios([]);
                    return;
                }
                console.log(`Los años para región ${regionSeleccionada} obtenidos correctamente.`);
                setAnios(data.data);
            } catch (err: unknown) {
                const errorInfo = gestionarErrorServidor(err);
                setAnios([]);
                console.log(errorInfo.mensaje);
                return;
            }
        };
        fetchYears();
    };

    const llamadaAniosNoADR = () => {
        const fetchYears = async () => {
            const token = sessionStorage.getItem('access_token');
            try {
                const res = await FetchConRefreshRetry(`${ApiTarget}/years`, {
                    headers: {
                        method: 'GET',
                        Authorization: `Bearer ` + token,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await res.json();
                if (!res.ok) {
                    const errorInfo = gestionarErrorServidor(res, data);
                    console.log(errorInfo.mensaje);
                    return;
                }
                console.log(`Los años para todas las regiones obtenidos correctamente.`);
                sessionStorage.setItem('aniosRegion', JSON.stringify(data.data));
            } catch (err: unknown) {
                const errorInfo = gestionarErrorServidor(err);
                sessionStorage.removeItem('aniosRegion');
                console.log(errorInfo.mensaje);
                return;
            }
        };
        fetchYears();
    };

    return (
        <RegionEstadosContext.Provider
            value={{
                regiones,
                regionActual,
                regionData,
                codRegiones,
                loading,
                error,
                regionSeleccionada,
                nombreRegionSeleccionada,
                setRegionSeleccionada,
                anio,
                anios,
                setAnio,
                estados,
                setEstados,
                cambiarEstadoPlan,
                cambiarEstadoMemoria,
                planState,
                memoriaState,
            }}
        >
            {children}
        </RegionEstadosContext.Provider>
    );
};

export const useEstadosPorAnio = () => {
    const ctx = useRegionEstadosContext();
    if (!ctx) throw new Error('useEstadosPorAnio debe usarse dentro de RegionEstadosProvider');
    const { yearData } = useYear();

    // Define los flags de edición según tu lógica original
    const editarPlan = yearData.plan.status === 'borrador';
    const editarMemoria = ['borrador', 'cerrado'].includes(yearData.memoria.status);

    return {
        ...ctx,
        editarPlan,
        editarMemoria,
    };
};

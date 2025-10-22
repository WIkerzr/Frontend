/* eslint-disable no-unused-vars */
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useUser } from './UserContext';

import { useYear } from './DatosAnualContext';
import { Estado } from '../types/GeneralTypes';
import { ApiTarget, ModoDevEdicionTotal } from '../components/Utils/data/controlDev';
import { FetchConRefreshRetry, gestionarErrorServidor } from '../components/Utils/utils';
import { useAuth } from './AuthContext';
import { useRegionContext } from './RegionContext';
import { UserRole } from '../types/users';
import { LlamadasBBDD } from '../components/Utils/data/utilsData';

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
    plan: Estado | null;
    memoria: Estado | null;
};

type EstadosPorAnio = {
    [anio: number]: EstadoPorAnio;
};

type EstadosContextType = {
    // Estados por año
    anioSeleccionada: number | null;
    anios: number[];
    setAnios: (a: number[]) => void;
    setAnio: (a: number) => void;
    estados: EstadosPorAnio;
    setEstados: React.Dispatch<React.SetStateAction<EstadosPorAnio>>;
    cambiarEstadoPlan: (nuevoEstado: Estado) => void;
    cambiarEstadoMemoria: (nuevoEstado: Estado) => void;
    planState: Estado | null;
    memoriaState: Estado | null;
    loadingChageState: boolean;
};

const EstadosContext = createContext<EstadosContextType>({
    anioSeleccionada: null,
    anios: [],
    setAnios: () => {},
    setAnio: () => {},
    estados: {},
    setEstados: () => {},
    cambiarEstadoPlan: () => {},
    cambiarEstadoMemoria: () => {},
    planState: null,
    memoriaState: null,
    loadingChageState: false,
});

export const useEstadosPorAnioContext = () => useContext(EstadosContext);

export const EstadosProvider = ({ children }: { children: ReactNode }) => {
    const { regionSeleccionada, nombreRegionSeleccionada } = useRegionContext();
    const { yearData, setYearData, llamadaBBDDYearData } = useYear();
    const { user } = useUser();
    const { login } = useAuth();
    const token = sessionStorage.getItem('access_token');

    const anioActual = new Date().getFullYear();
    const [anioSeleccionada, setAnio] = useState<number | null>(null);
    const [anios, setAnios] = useState<number[]>([]);
    const [estados, setEstados] = useState<EstadosPorAnio>({
        [anioActual]: { plan: yearData.plan.status, memoria: yearData.memoria.status },
    });
    const [planState, setPlanState] = useState<Estado | null>(null);
    const [memoriaState, setMemoriaState] = useState<Estado | null>(null);
    const [loadingChageState, setLoadingChageState] = useState<boolean>(false);

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
            const newAnio = Math.max(...anios) ?? null;
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

    useEffect(() => {
        const planStatus = estados[anioActual].plan;
        const memoriaStatus = estados[anioActual].memoria;

        if (planStatus !== yearData.plan.status || memoriaStatus !== yearData.memoria.status) {
            setYearData({
                ...yearData,
                plan: { ...yearData.plan, status: planStatus! },
                memoria: { ...yearData.memoria, status: memoriaStatus! },
            });
        }
    }, [estados]);

    const cambiarEstadoPlan = (nuevoEstado: Estado) => {
        if (!anioSeleccionada) {
            return;
        }
        LlamadasBBDD({
            setLoading: setLoadingChageState,
            method: 'POST',
            url: `yearData/${regionSeleccionada}/${yearData.year}/updatePlanStatus`,
            body: { PlanStatus: nuevoEstado },
            onSuccess: () => {
                setEstados((estadosPrev) => ({
                    ...estadosPrev,
                    [anioSeleccionada]: {
                        ...estadosPrev[anioSeleccionada],
                        plan: nuevoEstado,
                    },
                }));
            },
        });
    };

    const cambiarEstadoMemoria = (nuevoEstado: Estado) => {
        if (!anioSeleccionada) {
            return;
        }
        LlamadasBBDD({
            setLoading: setLoadingChageState,
            method: 'POST',
            url: `yearData/${regionSeleccionada}/${yearData.year}/updateMemoriaStatus`,
            body: { PlanStatus: 'proceso' },
            onSuccess: () => {
                setEstados((estadosPrev) => ({
                    ...estadosPrev,
                    [anioSeleccionada]: {
                        ...estadosPrev[anioSeleccionada],
                        memoria: nuevoEstado,
                    },
                }));
            },
        });
    };

    useEffect(() => {
        if (anioSeleccionada !== null && regionSeleccionada && nombreRegionSeleccionada) {
            llamadaBBDDYearData(anioSeleccionada, false);
        }
    }, [anioSeleccionada, nombreRegionSeleccionada]);

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
                const data = await res.data;
                if (!res.ok) {
                    const errorInfo = gestionarErrorServidor(res, data);
                    console.log(errorInfo.mensaje);
                    setAnios([]);
                    return;
                }
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
                const data = await res.data;
                if (!res.ok) {
                    const errorInfo = gestionarErrorServidor(res, data);
                    console.log(errorInfo.mensaje);
                    return;
                }
                sessionStorage.setItem('aniosRegion', JSON.stringify(data.data));
            } catch (err: unknown) {
                const errorInfo = gestionarErrorServidor(err);
                sessionStorage.removeItem('aniosRegion');
                console.error(errorInfo.mensaje);
                return;
            }
        };
        const aniosRegion = sessionStorage.getItem('aniosRegion');
        if (!aniosRegion) {
            fetchYears();
        }
    };

    return (
        <EstadosContext.Provider
            value={{
                anioSeleccionada,
                anios,
                setAnio,
                setAnios,
                estados,
                setEstados,
                cambiarEstadoPlan,
                cambiarEstadoMemoria,
                planState,
                memoriaState,
                loadingChageState,
            }}
        >
            {children}
        </EstadosContext.Provider>
    );
};

export const useEstadosPorAnio = () => {
    const ctx = useEstadosPorAnioContext();
    if (!ctx) throw new Error('useEstadosPorAnio debe usarse dentro de RegionEstadosProvider');
    const { yearData } = useYear();
    const { user } = useUser();

    const rolUsuario = user ? ((user.role as string).toUpperCase() as UserRole) : ('' as UserRole);
    const esADR = ModoDevEdicionTotal ? true : rolUsuario === 'ADR';

    const [editarPlan, setEditarPlan] = useState<boolean>(esADR && yearData.plan.status === 'borrador');
    const [editarMemoria, setEditarMemoria] = useState<boolean>(esADR && yearData.memoria.status === 'borrador');

    useEffect(() => {
        setEditarPlan(esADR && yearData.plan.status === 'borrador');
        setEditarMemoria(esADR && yearData.memoria.status === 'borrador');
    }, [yearData]);

    return {
        ...ctx,
        editarPlan: editarPlan,
        editarMemoria: editarMemoria,
    };
    return {
        ...ctx,
        editarPlan: editarPlan,
        editarMemoria: editarMemoria,
    };
};

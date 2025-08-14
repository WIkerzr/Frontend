/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Ejes, servicioIniciadoVacio, YearData, yearIniciadoVacio } from '../types/tipadoPlan';
import { DatosAccion, datosInicializadosAccion } from '../types/TipadoAccion';
import { Estado, isEstado, Servicios } from '../types/GeneralTypes';
import { isEqual } from 'lodash';
import { FetchConRefreshRetry, formateaConCeroDelante, gestionarErrorServidor, obtenerFechaLlamada } from '../components/Utils/utils';
import { ApiTarget } from '../components/Utils/data/controlDev';
import { useRegionEstadosContext } from './RegionEstadosContext';

export type TiposAccion = 'Acciones' | 'AccionesAccesorias';
interface YearContextType {
    yearData: YearData;
    block: boolean;
    setYearData: (data: YearData) => void;
    fechaUltimoActualizadoBBDDYearData: Date;
    datosEditandoAccion: DatosAccion;
    setDatosEditandoAccion: React.Dispatch<React.SetStateAction<DatosAccion>>;
    datosEditandoServicio: Servicios | null;
    setDatosEditandoServicio: React.Dispatch<React.SetStateAction<Servicios | null>>;
    SeleccionEditarServicio: (idServicio: string | null) => void;
    SeleccionEditarAccion: (idEjePrioritario: string, idAccion: string) => void;
    SeleccionEditarAccionAccesoria: (idAccion: string) => void;
    SeleccionVaciarEditarAccion: () => void;
    SeleccionEditarGuardar: () => void;
    SeleccionEditarGuardarAccesoria: () => void;
    llamadaBBDDYearData: (anioSeleccionada: number, regionSeleccionada: string, nombreRegionSeleccionada: string, ignorarStorage: boolean) => void;
    loadingYearData: boolean;
    GuardarEdicionServicio: () => void;
    AgregarAccion: (tipo: TiposAccion, idEje: string, nuevaAccion: string, nuevaLineaActuaccion: string, plurianual: boolean) => void;
    AgregarServicio: () => void;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export const RegionDataProvider = ({ children }: { children: ReactNode }) => {
    const { regionSeleccionada } = useRegionEstadosContext();

    const [idEjeEditado, setIdEjeEditado] = useState<string>('');
    const [yearData, setYearDataState] = useState<YearData>(() => {
        const stored = localStorage.getItem('datosAno');
        return stored ? JSON.parse(stored) : yearIniciadoVacio;
    });
    const setYearData = (data: YearData) => {
        setYearDataState(data);
    };

    const [datosEditandoAccion, setDatosEditandoAccion] = useState<DatosAccion>(() => {
        const stored = localStorage.getItem('datosAccionModificado');
        return JSON.parse(stored!);
    });

    const [fechaUltimoActualizadoBBDDYearData, setFechaUltimoActualizadoBBDDYearData] = useState<Date>(() => {
        const fechaStr = obtenerFechaLlamada('YearData');
        return fechaStr ? new Date(fechaStr) : new Date();
    });
    const [loadingYearData, setLoadingYearData] = useState<boolean>(false);

    useEffect(() => {
        localStorage.setItem('datosAno', JSON.stringify(yearData));
    }, [yearData]);

    useEffect(() => {
        localStorage.setItem('datosAccionModificado', JSON.stringify(datosEditandoAccion));
    }, [datosEditandoAccion]);

    const SeleccionEditarAccion = (idEjePrioritario: string, idAccion: string) => {
        setIdEjeEditado(idEjePrioritario);
        const ejeSeleccionado = yearData.plan.ejesPrioritarios.filter((eje) => idEjePrioritario.includes(eje.Id));
        const accionSeleccionado = ejeSeleccionado[0].acciones.filter((accion) => idAccion.includes(accion.id));
        setDatosEditandoAccion(accionSeleccionado[0]);

        if (accionSeleccionado[0].accionCompartida && Array.isArray(accionSeleccionado[0].accionCompartida.regiones)) {
            const regionCompleta = accionSeleccionado[0].accionCompartida.regiones.find((r) => formateaConCeroDelante(`${r.RegionId}`) === (regionSeleccionada ?? ''));
            if (regionCompleta) {
                setBlock(true);
            }
        } else {
            setBlock(false);
        }
    };

    const SeleccionVaciarEditarAccion = () => {
        localStorage.removeItem('datosAccionModificado');
        setDatosEditandoAccion({
            id: '0',
            accion: '',
            ejeEs: '',
            ejeEu: '',
            lineaActuaccion: '',
            plurianual: false,
            datosPlan: {
                ejecutora: '',
                implicadas: '',
                comarcal: 'Sin tratamiento territorial comarcal',
                supracomarcal: 'Sin tratamiento territorial supracomarcal',
                rangoAnios: '',
                oAccion: '',
                ods: '',
                dAccion: '',
                presupuesto: '',
                iMujHom: '',
                uEuskera: '',
                sostenibilidad: '',
                dInteligent: '',
                observaciones: '',
            },
        });
    };

    const SeleccionEditarAccionAccesoria = (idAccion: string) => {
        const accionAccesoria = yearData.accionesAccesorias!.find((r) => r.id === idAccion);
        if (accionAccesoria) {
            setDatosEditandoAccion(accionAccesoria);
        }
    };

    const [datosEditandoServicio, setDatosEditandoServicio] = useState<Servicios | null>(() => {
        const stored = localStorage.getItem('datosEditandoServicio');
        return stored ? JSON.parse(stored) : null;
    });
    useEffect(() => {
        localStorage.setItem('datosEditandoServicio', JSON.stringify(datosEditandoServicio));
    }, [datosEditandoServicio]);

    const SeleccionEditarServicio = (idServicio: string | null) => {
        if (idServicio) {
            const servicioSeleccionado = yearData.servicios!.find((servicio) => `${servicio.id}` === idServicio);
            if (servicioSeleccionado) {
                setDatosEditandoServicio(servicioSeleccionado);
            }
        } else {
            setDatosEditandoServicio(servicioIniciadoVacio);
        }
    };

    const SeleccionEditarGuardar = () => {
        const nuevosEjes = yearData.plan.ejesPrioritarios.map((eje) => {
            if (eje.Id !== idEjeEditado) {
                return eje;
            }

            const nuevasAcciones = eje.acciones.map((accion) => (accion.id === datosEditandoAccion.id ? datosEditandoAccion : accion));

            const accionesIguales = nuevasAcciones.every((accion, index) => accion === eje.acciones[index]);
            if (accionesIguales) return eje;

            return {
                ...eje,
                acciones: nuevasAcciones,
            };
        });

        const ejesIguales = nuevosEjes.every((eje, index) => eje === yearData.plan.ejesPrioritarios[index]);

        if (!ejesIguales) {
            setYearDataState({
                ...yearData,
                plan: {
                    ...yearData.plan,
                    ejesPrioritarios: nuevosEjes,
                },
            });
        }

        setIdEjeEditado('');
    };

    const SeleccionEditarGuardarAccesoria = () => {
        const accionEditada = yearData.accionesAccesorias!.map((accion) => (accion.id === datosEditandoAccion.id ? datosEditandoAccion : accion));

        const accionesIguales = accionEditada.every((accion, index) => accion === yearData.accionesAccesorias![index]);

        if (!accionesIguales) {
            setYearData({
                ...yearData,
                accionesAccesorias: accionEditada,
            });
        }
    };

    const GuardarEdicionServicio = () => {
        if (!datosEditandoServicio) return;

        const servicioOriginal = yearData.servicios?.find((s) => s.id === datosEditandoServicio.id);
        const serviciosIguales = isEqual(servicioOriginal, datosEditandoServicio);

        const nuevosServicios = yearData.servicios!.map((servicio) => (servicio.id === datosEditandoServicio.id ? datosEditandoServicio : servicio));

        if (!serviciosIguales) {
            setYearData({
                ...yearData,
                servicios: nuevosServicios!,
            });
        }
        setDatosEditandoServicio(null);
    };

    const AgregarAccion = (tipo: TiposAccion, idEje: string, nuevaAccion: string, nuevaLineaActuaccion: string, plurianual: boolean) => {
        const fuenteEjes = tipo === 'Acciones' ? yearData.plan.ejesPrioritarios : yearData.plan.ejes;
        const ejeSeleccionado = fuenteEjes.find((eje) => eje.Id === idEje);
        if (!ejeSeleccionado) return;

        const datos = {
            ...datosInicializadosAccion,
            accion: nuevaAccion,
            ejeEs: ejeSeleccionado.NameEs,
            ejeEu: ejeSeleccionado.NameEu,
            lineaActuaccion: nuevaLineaActuaccion,
            plurianual,
        };

        if (tipo === 'Acciones') {
            const nuevosEjes = yearData.plan.ejesPrioritarios.map((eje) =>
                eje.Id === idEje
                    ? {
                          ...eje,
                          acciones: [...eje.acciones, datos],
                      }
                    : eje
            );

            setYearData({
                ...yearData,
                plan: {
                    ...yearData.plan,
                    ejesPrioritarios: nuevosEjes,
                },
            });
        } else {
            setYearData({
                ...yearData,
                accionesAccesorias: [...(yearData.accionesAccesorias || []), datos],
            });
        }
    };

    const AgregarServicio = () => {
        if (!datosEditandoServicio) return;
        const nuevoServicio: Servicios = { ...datosEditandoServicio, id: Date.now() } as Servicios;
        setYearData({
            ...yearData,
            servicios: [...(yearData.servicios || []), nuevoServicio],
        });
        setDatosEditandoServicio(null);
    };

    const [block, setBlock] = useState<boolean>(false);

    const llamadaBBDDYearData = (anioSeleccionada: number, regionSeleccionada: string, nombreRegionSeleccionada: string, ignorarStorage: boolean) => {
        const stored = localStorage.getItem('datosAno');
        if (stored && !ignorarStorage) {
            const data: YearData = JSON.parse(stored);
            if (data.year === anioSeleccionada && data.nombreRegion === nombreRegionSeleccionada) {
                setYearData(data);
                return;
            }
        }
        setLoadingYearData(true);
        const fetchYearData = async () => {
            const token = sessionStorage.getItem('access_token');
            try {
                const res = await FetchConRefreshRetry(`${ApiTarget}/yearData/${Number(regionSeleccionada)}/${Number(anioSeleccionada)}`, {
                    headers: {
                        method: 'GET',
                        Authorization: `Bearer ` + token,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await res.json();
                if (!res.ok) {
                    const errorInfo = gestionarErrorServidor(res, data);
                    //setErrorMessage(errorInfo.mensaje);
                    console.log(errorInfo.mensaje);

                    return;
                }
                const status: Estado = isEstado(data.data.Memoria.Status) ? data.data.Memoria.Status : 'borrador';

                const ejesPrioritarios: Ejes[] = [];
                const ejes: Ejes[] = [];

                data.data.Plan.Ejes.forEach((eje: Ejes) => {
                    const item = {
                        Id: `${eje.Id}`,
                        NameEs: `${eje.NameEs}`,
                        NameEu: `${eje.NameEu}`,
                        IsActive: eje.IsActive,
                        IsPrioritarios: eje.IsPrioritarios,
                        acciones: [],
                    };

                    if (eje.IsPrioritarios) {
                        ejesPrioritarios.push(item);
                    } else {
                        ejes.push(item);
                    }
                });
                setYearData({
                    nombreRegion: nombreRegionSeleccionada ? nombreRegionSeleccionada : '',
                    year: data.data.Year,
                    plan: {
                        ...yearData.plan,
                        ejesPrioritarios: ejesPrioritarios,
                        ejes: ejes,
                    },
                    memoria: {
                        ...yearData.memoria,
                        id: `${data.data.Memoria.Id}`,
                        status: status,
                        dSeguimiento: data.data.Memoria.DSeguimiento,
                        valFinal: data.data.Memoria.ValFinal,
                    },
                });
                setFechaUltimoActualizadoBBDDYearData(new Date());
            } catch (err: unknown) {
                const errorInfo = gestionarErrorServidor(err);
                // setErrorMessage(errorInfo.mensaje);
                console.log(errorInfo.mensaje);
                return;
            } finally {
                setLoadingYearData(false);
            }
        };
        fetchYearData();
    };
    return (
        <YearContext.Provider
            value={{
                yearData,
                block,
                setYearData,
                datosEditandoAccion,
                fechaUltimoActualizadoBBDDYearData,
                setDatosEditandoAccion,
                AgregarAccion,
                AgregarServicio,
                SeleccionEditarAccion,
                SeleccionEditarAccionAccesoria,
                SeleccionVaciarEditarAccion,
                SeleccionEditarGuardar,
                SeleccionEditarGuardarAccesoria,
                SeleccionEditarServicio,
                llamadaBBDDYearData,
                datosEditandoServicio,
                loadingYearData,
                setDatosEditandoServicio,
                GuardarEdicionServicio,
            }}
        >
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

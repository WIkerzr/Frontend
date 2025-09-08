/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { EjeBBDD, Ejes, servicioIniciadoVacio, YearData, yearIniciadoVacio } from '../types/tipadoPlan';
import {
    DatosAccion,
    DatosAccionDTO,
    DatosMemoriaBack,
    DatosMemoriaBackF,
    DatosMemoriaDTO,
    DatosPlan,
    DatosPlanBack,
    DatosPlanDTO,
    FuenteFinanciacion,
    IndicadorRealizacionAccionDTO,
    IndicadorResultadoAccionDTO,
} from '../types/TipadoAccion';
import { Estado, EstadosLoading, isEstado, Servicios } from '../types/GeneralTypes';
import { isEqual } from 'lodash';
import { convertirArrayACadena, formateaConCeroDelante, obtenerFechaLlamada } from '../components/Utils/utils';
import { LlamadasBBDD } from '../components/Utils/data/utilsData';
import { IndicadorRealizacionAccion, IndicadorResultadoAccion } from '../types/Indicadores';
import { useRegionContext } from './RegionContext';
import { ModoDev } from '../components/Utils/data/controlDev';

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
    SeleccionVaciarEditarAccion: () => void;
    SeleccionEditarGuardar: () => void;
    SeleccionEditarGuardarAccesoria: () => void;
    llamadaBBDDYearData: (anioSeleccionada: number, ignorarStorage: boolean) => void;
    loadingYearData: boolean;
    GuardarEdicionServicio: () => void;
    AgregarAccion: (tipo: TiposAccion, idEje: string, nuevaAccion: string, nuevaLineaActuaccion: string, plurianual: boolean) => void;
    GuardarLaEdicionAccion: (setLoading: React.Dispatch<React.SetStateAction<EstadosLoading>>) => void;
    EliminarAccion: (tipo: TiposAccion, idEje: string, idAccion: string) => void;
    AgregarServicio: () => void;
    errorMessage: string | null;
    successMessage: string | null;
    selectedId: string | null;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export const RegionDataProvider = ({ children }: { children: ReactNode }) => {
    const { regionSeleccionada, nombreRegionSeleccionada } = useRegionContext();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [selectedId, setSelectedId] = useState<string | null>(null);

    const [idEjeEditado, setIdEjeEditado] = useState<string>('');
    const [yearData, setYearData] = useState<YearData>(() => {
        const stored = localStorage.getItem('DataYear');
        return stored ? JSON.parse(stored) : yearIniciadoVacio;
    });

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
        localStorage.setItem('DataYear', JSON.stringify(yearData));
    }, [yearData]);

    useEffect(() => {
        localStorage.setItem('datosAccionModificado', JSON.stringify(datosEditandoAccion));
    }, [datosEditandoAccion]);

    useEffect(() => {
        if (errorMessage) {
            setTimeout(() => {
                setErrorMessage(null);
                setSelectedId(null);
            }, 5000);
        }
    }, [errorMessage]);

    useEffect(() => {
        if (setSuccessMessage) {
            setTimeout(() => {
                setSuccessMessage(null);
                setSelectedId(null);
            }, 5000);
        }
    }, [successMessage]);

    const SeleccionEditarAccion = (idEje: string, idAccion: string) => {
        LlamadasBBDD({
            method: 'POST',
            url: `actionData/${idAccion}`,
            setLoading: setLoadingYearData,
            setFechaUltimoActualizadoBBDD: setFechaUltimoActualizadoBBDDYearData,
            setErrorMessage,
            setSuccessMessage,
            onSuccess: (response) => {
                const responseDataPlan: DatosPlanBack = response.data.DatosPlan;
                const responseDataMemoria: DatosMemoriaBack = response.data.DatosMemoria;
                const indicadoresRealizacionAccion: IndicadorRealizacionAccionDTO[] = response.data?.IndicadoresRealizacionAccion ?? [];
                const indicadoresResultadoAccion: IndicadorResultadoAccionDTO[] = response.data.IndicadoresResultadoAccion ?? [];
                const checkData = (value: any, name: string, defaultValue = '') => {
                    if (value === null || value === undefined) {
                        console.warn(`Aviso: el dato ${name} no se encuentra. Se usará valor por defecto.`);
                        return defaultValue;
                    }
                    return value;
                };

                const dataPlan: DatosPlan = {
                    id: checkData(responseDataPlan?.Id, 'Id', '0'),
                    ejecutora: checkData(responseDataPlan?.Ejecutora, 'Ejecutora'),
                    implicadas: checkData(responseDataPlan?.Implicadas, 'Implicadas'),
                    comarcal: checkData(responseDataPlan?.Comarcal, 'Comarcal'),
                    supracomarcal: checkData(responseDataPlan?.Supracomarcal, 'Supracomarcal'),
                    rangoAnios: checkData(responseDataPlan?.RangoAnios, 'RangoAnios'),
                    oAccion: checkData(responseDataPlan?.OAccion, 'OAccion'),
                    ods: checkData(responseDataPlan?.Ods, 'Ods'),
                    dAccion: checkData(responseDataPlan?.DAccion, 'DAccion'),
                    presupuesto: checkData(responseDataPlan?.Presupuesto, 'Presupuesto'),
                    iMujHom: checkData(responseDataPlan?.IMujHom, 'IMujHom'),
                    uEuskera: checkData(responseDataPlan?.UEuskera, 'UEuskera'),
                    sostenibilidad: checkData(responseDataPlan?.Sostenibilidad, 'Sostenibilidad'),
                    dInteligent: checkData(responseDataPlan?.DInteligent, 'DInteligent'),
                    observaciones: checkData(responseDataPlan?.Observaciones, 'Observaciones'),
                };
                const dataMemoria: DatosMemoriaBackF = {
                    id: checkData(responseDataMemoria?.Id, 'Id', '0'),
                    dAccionAvances: checkData(responseDataMemoria?.DAccionAvances, 'DAccionAvances'),
                    presupuestoEjecutado: {
                        fuenteDeFinanciacion: checkData(responseDataMemoria?.PresupuestoEjecutado_fuenteDeFinanciacion, 'PresupuestoEjecutado_fuenteDeFinanciacion', '')
                            .split(',')
                            .map((f: string) => f.trim() as FuenteFinanciacion),
                        cuantia: checkData(responseDataMemoria?.PresupuestoEjecutado_cuantia, 'PresupuestoEjecutado_cuantia'),
                        observaciones: checkData(responseDataMemoria?.PresupuestoEjecutado_observaciones, 'PresupuestoEjecutado_observaciones'),
                    },
                    ejecucionPresupuestaria: {
                        previsto: checkData(responseDataMemoria?.EjecucionPresupuestaria_previsto, 'EjecucionPresupuestaria_previsto'),
                        ejecutado: checkData(responseDataMemoria?.EjecucionPresupuestaria_ejecutado, 'EjecucionPresupuestaria_ejecutado'),
                        porcentaje: checkData(responseDataMemoria?.EjecucionPresupuestaria_porcentaje, 'EjecucionPresupuestaria_porcentaje'),
                    },
                    observaciones: checkData(responseDataMemoria?.Observaciones, 'Observaciones'),
                    valFinal: checkData(responseDataMemoria?.ValFinal, 'ValFinal'),
                    dSeguimiento: checkData(responseDataMemoria?.DSeguimiento, 'DSeguimiento'),
                    sActual: checkData(responseDataMemoria?.SActual, 'SActual'),
                };
                const indicadorRealizacionAccion: IndicadorRealizacionAccion[] = (indicadoresRealizacionAccion ?? []).map((item: any) => ({
                    id: checkData(item.IndicadorRealizacionId, 'Id', '0'),
                    descripcion: '',
                    metaAnual: {
                        hombres: checkData(item.MetaAnual_Hombre, 'MetaAnual_Hombre'),
                        mujeres: checkData(item.MetaAnual_Mujer, 'MetaAnual_Mujer'),
                        total: checkData(item.MetaAnual_Total, 'MetaAnual_Total'),
                    },
                    ejecutado: {
                        hombres: checkData(item.Ejecutado_Hombre, 'Ejecutado_Hombre'),
                        mujeres: checkData(item.Ejecutado_Mujer, 'Ejecutado_Mujer'),
                        total: checkData(item.Ejecutado_Total, 'Ejecutado_Total'),
                    },
                    metaFinal: {
                        hombres: checkData(item.MetaFinal_Hombre, 'MetaFinal_Hombre'),
                        mujeres: checkData(item.MetaFinal_Mujer, 'MetaFinal_Mujer'),
                        total: checkData(item.MetaFinal_Total, 'MetaFinal_Total'),
                    },
                    hipotesis: checkData(item.Hipotesis, 'Hipotesis'),
                    idsResultados: checkData(item.IdsResultados, 'IdsResultados', '')
                        .split(',')
                        .map((id: string) => id.trim()),
                    indicadorRealizacionId: checkData(item.IndicadorRealizacionId, 'IndicadorRealizacionId', undefined) as number | undefined,
                }));

                const indicadorResultadoAccion: IndicadorResultadoAccion[] = (indicadoresResultadoAccion ?? []).map((item: any) => ({
                    id: checkData(item.IndicadorResultadoId, 'Id', '0'),
                    descripcion: '',
                    metaAnual: {
                        hombres: checkData(item.MetaAnual_Hombre, 'MetaAnual_Hombre'),
                        mujeres: checkData(item.MetaAnual_Mujer, 'MetaAnual_Mujer'),
                        total: checkData(item.MetaAnual_Total, 'MetaAnual_Total'),
                    },
                    ejecutado: {
                        hombres: checkData(item.Ejecutado_Hombre, 'Ejecutado_Hombre'),
                        mujeres: checkData(item.Ejecutado_Mujer, 'Ejecutado_Mujer'),
                        total: checkData(item.Ejecutado_Total, 'Ejecutado_Total'),
                    },
                    metaFinal: {
                        hombres: checkData(item.MetaFinal_Hombre, 'MetaFinal_Hombre'),
                        mujeres: checkData(item.MetaFinal_Mujer, 'MetaFinal_Mujer'),
                        total: checkData(item.MetaFinal_Total, 'MetaFinal_Total'),
                    },
                    hipotesis: checkData(item.Hipotesis, 'Hipotesis'),
                    indicadorResultadoId: checkData(item.IndicadorResultadoId, 'IndicadorResultadoId', undefined) as number | undefined,
                }));

                const dataAccion: DatosAccion = {
                    id: checkData(response.data?.Id, 'Id', '0'),
                    accion: checkData(response.data?.Nombre, 'Nombre'),
                    lineaActuaccion: checkData(response.data?.LineaActuaccion, 'LineaActuaccion'),
                    plurianual: checkData(response.data?.Plurianual, 'Plurianual', 'false'),
                    indicadorAccion: {
                        indicadoreRealizacion: indicadorRealizacionAccion,
                        indicadoreResultado: indicadorResultadoAccion,
                    },
                    accionCompartida: response.data?.AccionCompartida ?? null,
                    datosPlan: dataPlan,
                    datosMemoria: dataMemoria,
                    ejeId: idEje,
                };

                setIdEjeEditado(idEje);

                setYearData({
                    ...yearData,
                    plan: {
                        ...yearData.plan,
                        ejesPrioritarios: yearData.plan.ejesPrioritarios.map((eje) =>
                            eje.Id === idEje ? { ...eje, acciones: eje.acciones.map((accion) => (accion.id === idAccion ? { ...accion, ...dataAccion } : accion)) } : eje
                        ),
                    },
                });

                setDatosEditandoAccion(dataAccion);
                if (dataAccion.accionCompartida && Array.isArray(dataAccion.accionCompartida.regiones)) {
                    const regionCompleta = dataAccion.accionCompartida.regiones.find((r) => formateaConCeroDelante(`${r.RegionId}`) === (regionSeleccionada ?? ''));
                    if (regionCompleta) {
                        setBlock(true);
                    }
                } else {
                    setBlock(false);
                }
            },
        });
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
                id: '0',
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
            setYearData({
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

        setSelectedId(idEje);
        LlamadasBBDD({
            method: 'POST',
            url: `yearData/${yearData.plan.id}/${idEje}/newAction`,
            setLoading: setLoadingYearData,
            setFechaUltimoActualizadoBBDD: setFechaUltimoActualizadoBBDDYearData,
            setErrorMessage,
            setSuccessMessage,
            body: {
                Nombre: nuevaAccion,
                LineaActuaccion: nuevaLineaActuaccion,
                Plurianual: plurianual,
            },
            onSuccess: (response) => {
                const validarNombre = nuevaAccion === response.data.Nombre;
                const validarLineaActuaccion = nuevaLineaActuaccion === response.data.LineaActuaccion;
                const validarPlurianual = plurianual === response.data.Plurianual;
                if (!validarNombre || !validarLineaActuaccion || !validarPlurianual) {
                    throw new Error('Error al agregar la acción: datos no coinciden');
                }

                setYearData({
                    ...yearData,
                    plan: {
                        ...yearData.plan,
                        ejesPrioritarios: fuenteEjes.map((eje) =>
                            eje.Id === ejeSeleccionado.Id
                                ? {
                                      ...eje,
                                      acciones: [
                                          ...eje.acciones,
                                          {
                                              id: response.data.Id,
                                              accion: nuevaAccion,
                                              ejeEs: ejeSeleccionado.NameEs,
                                              ejeEu: ejeSeleccionado.NameEu,
                                              lineaActuaccion: nuevaLineaActuaccion,
                                              plurianual: plurianual,
                                          },
                                      ],
                                  }
                                : eje
                        ),
                    },
                });

                console.log('Acción agregada:', response);
            },
        });
    };

    const GuardarLaEdicionAccion = (setLoading: React.Dispatch<React.SetStateAction<EstadosLoading>>) => {
        const datos = convertirDatosAccionADatosAccionBackend();
        if (!datos) return;
        const { indicadoreRealizacionEdit, indicadoreResultadoEdit, DatosPlan, DatosMemoria } = datos;

        LlamadasBBDD<any, DatosAccionDTO>({
            method: 'POST',
            url: `actionData/editAction/${datosEditandoAccion.id}`,
            setLoading: (estado: boolean) => setLoading(estado ? 'loading' : 'success'),
            setFechaUltimoActualizadoBBDD: setFechaUltimoActualizadoBBDDYearData,
            setErrorMessage,
            setSuccessMessage,
            body: {
                Id: Number(datosEditandoAccion.id),
                Nombre: datosEditandoAccion.accion,
                LineaActuacion: datosEditandoAccion.lineaActuaccion,
                Plurianual: datosEditandoAccion.plurianual,
                DatosPlanId: DatosPlan.Id ? Number(DatosPlan.Id) : undefined,
                DatosPlan: DatosPlan,
                DatosMemoriaId: DatosMemoria.Id ? Number(DatosMemoria.Id) : undefined,
                DatosMemoria: DatosMemoria,
                AccionCompartidaId: datosEditandoAccion.accionCompartidaid ?? undefined,
                IndicadorRealizacionAcciones: indicadoreRealizacionEdit,
                IndicadorResultadoAcciones: indicadoreResultadoEdit,
            },
            onSuccess: (response) => {
                setYearData({
                    ...yearData,
                    plan: {
                        ...yearData.plan,
                        ejesPrioritarios: yearData.plan.ejesPrioritarios.map((eje) =>
                            eje.Id === datosEditandoAccion.ejeId
                                ? { ...eje, acciones: eje.acciones.map((accion) => (accion.id === response.data.Id ? { ...accion, camposFaltantes: response.CamposFaltantes ?? '' } : accion)) }
                                : eje
                        ),
                    },
                });
            },
            onError: () => setLoading('error'),
        });
    };

    const EliminarAccion = (tipo: TiposAccion, idEje: string, idAccion: string) => {
        const fuenteEjes = tipo === 'Acciones' ? yearData.plan.ejesPrioritarios : yearData.plan.ejes;
        const ejeSeleccionado = fuenteEjes.find((eje) => eje.Id === idEje);
        if (!ejeSeleccionado) return;
        setSelectedId(idEje);
        if (tipo === 'Acciones') {
            LlamadasBBDD({
                method: 'POST',
                url: `yearData/${yearData.plan.id}/${idEje}/deleteAction/${idAccion}`,
                setLoading: setLoadingYearData,
                setFechaUltimoActualizadoBBDD: setFechaUltimoActualizadoBBDDYearData,
                setErrorMessage,
                setSuccessMessage,
                onSuccess: () => {
                    setYearData({
                        ...yearData,
                        plan: {
                            ...yearData.plan,
                            ejesPrioritarios: yearData.plan.ejesPrioritarios.map((eje) =>
                                eje.Id === ejeSeleccionado.Id
                                    ? {
                                          ...eje,
                                          acciones: eje.acciones.filter((accion) => accion.id !== idAccion),
                                      }
                                    : eje
                            ),
                        },
                    });
                },
            });
        } else {
            setYearData({
                ...yearData,
                //accionesAccesorias: [...(yearData.accionesAccesorias || []), datos],
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

    const llamadaBBDDYearData = (anioSeleccionada: number, ignorarStorage: boolean) => {
        const stored = localStorage.getItem('DataYear');
        if (stored && !ignorarStorage) {
            const data: YearData = JSON.parse(stored);
            if (data.year === anioSeleccionada && data.nombreRegion === nombreRegionSeleccionada) {
                setYearData(data);
                return;
            }
        }
        LlamadasBBDD({
            method: 'GET',
            url: `yearData/${Number(regionSeleccionada)}/${Number(anioSeleccionada)}`,
            setLoading: setLoadingYearData,
            setFechaUltimoActualizadoBBDD: setFechaUltimoActualizadoBBDDYearData,
            setErrorMessage,
            setSuccessMessage,
            onSuccess: (data: any) => {
                const memoriaStatus: Estado = isEstado(data.data.Memoria.Status) ? data.data.Memoria.Status : 'borrador';
                const planStatus: Estado = isEstado(data.data.Plan.Status) ? data.data.Plan.Status : 'borrador';
                const ejesPrioritarios: Ejes[] = [];
                const ejes: Ejes[] = [];
                if (ModoDev) {
                    console.log('Llamada Year Data');
                    console.log('Estado del plan ' + data.data.Plan.Status + ' con idPlan: ' + data.data.Plan.Id);
                    console.log('Estado de la memoria ' + data.data.Memoria.Status + ' con idMemoria: ' + data.data.Memoria.Id);
                }

                data.data.Plan.Ejes.forEach((eje: EjeBBDD) => {
                    const item = {
                        Id: `${eje.Id}`,
                        NameEs: `${eje.NameEs}`,
                        NameEu: `${eje.NameEu}`,
                        IsActive: eje.IsActive,
                        IsPrioritarios: eje.IsPrioritarios,
                        acciones: eje.Acciones.map((accion: any) => ({
                            id: `${accion.Id}`,
                            accion: accion.Nombre,
                            ejeEs: eje.NameEs,
                            ejeEu: eje.NameEu,
                            lineaActuaccion: accion.LineaActuaccion,
                            plurianual: accion.Plurianual,
                            camposFaltantes: accion.CamposFaltantes,
                        })),
                    };

                    if (eje.IsPrioritarios) {
                        ejesPrioritarios.push(item);
                    } else {
                        ejes.push(item);
                    }
                });
                const dotosAnio: YearData = {
                    nombreRegion: nombreRegionSeleccionada ? nombreRegionSeleccionada : '',
                    year: data.data.Year,
                    plan: {
                        id: `${data.data.Plan.Id}`,
                        ejes: ejes,
                        ejesPrioritarios: ejesPrioritarios,
                        introduccion: data.data.Plan.Introduccion,
                        proceso: data.data.Plan.Procesos,
                        generalOperationADR: data.data.Plan.GeneralOperationADR || {
                            adrInternalTasks: '',
                            operationalIndicators: [],
                            dSeguimiento: '',
                            valFinal: '',
                        },
                        status: planStatus,
                    },
                    memoria: {
                        id: `${data.data.Memoria.Id}`,
                        status: memoriaStatus,
                        dSeguimiento: data.data.Memoria.DSeguimiento,
                        valFinal: data.data.Memoria.ValFinal,
                    },
                };
                setYearData(dotosAnio);
            },
        });
    };

    const convertirDatosAccionADatosAccionBackend = () => {
        if (!datosEditandoAccion) return;
        if (!datosEditandoAccion.datosPlan) return;
        if (!datosEditandoAccion.datosMemoria) return;

        const mapIndicadoresRealizacion = (indicadores: IndicadorRealizacionAccion[] | undefined): IndicadorRealizacionAccionDTO[] =>
            (indicadores ?? []).map((ind) => ({
                IndicadorRealizacionId: ind.id,
                DatosAccionId: Number(datosEditandoAccion.id),
                Hipotesis: ind.hipotesis,
                MetaAnual_Hombre: ind.metaAnual?.hombres?.toString(),
                MetaAnual_Mujer: ind.metaAnual?.mujeres?.toString(),
                MetaAnual_Total: ind.metaAnual?.total?.toString(),
                Ejecutado_Hombre: ind.ejecutado?.hombres?.toString(),
                Ejecutado_Mujer: ind.ejecutado?.mujeres?.toString(),
                Ejecutado_Total: ind.ejecutado?.total?.toString(),
                MetaFinal_Hombre: ind.metaFinal?.hombres?.toString(),
                MetaFinal_Mujer: ind.metaFinal?.mujeres?.toString(),
                MetaFinal_Total: ind.metaFinal?.total?.toString(),
                IdsResultados: ind.idsResultados?.join(','),
            }));

        const mapIndicadoresResultado = (indicadores: IndicadorResultadoAccion[] | undefined): IndicadorResultadoAccionDTO[] =>
            (indicadores ?? []).map((ind) => ({
                IndicadorResultadoId: ind.id,
                DatosAccionId: Number(datosEditandoAccion.id),
                Hipotesis: ind.hipotesis,
                MetaAnual_Hombre: ind.metaAnual?.hombres?.toString(),
                MetaAnual_Mujer: ind.metaAnual?.mujeres?.toString(),
                MetaAnual_Total: ind.metaAnual?.total?.toString(),
                Ejecutado_Hombre: ind.ejecutado?.hombres?.toString(),
                Ejecutado_Mujer: ind.ejecutado?.mujeres?.toString(),
                Ejecutado_Total: ind.ejecutado?.total?.toString(),
                MetaFinal_Hombre: ind.metaFinal?.hombres?.toString(),
                MetaFinal_Mujer: ind.metaFinal?.mujeres?.toString(),
                MetaFinal_Total: ind.metaFinal?.total?.toString(),
            }));

        const indicadoreRealizacionEdit = mapIndicadoresRealizacion(datosEditandoAccion.indicadorAccion?.indicadoreRealizacion);
        const indicadoreResultadoEdit = mapIndicadoresResultado(datosEditandoAccion.indicadorAccion?.indicadoreResultado);

        const DatosPlan: DatosPlanDTO = {
            Id: Number(datosEditandoAccion.datosPlan.id),
            Ejecutora: datosEditandoAccion.datosPlan.ejecutora,
            Implicadas: datosEditandoAccion.datosPlan.implicadas,
            Comarcal: datosEditandoAccion.datosPlan.comarcal,
            Supracomarcal: datosEditandoAccion.datosPlan.supracomarcal,
            RangoAnios: datosEditandoAccion.datosPlan.rangoAnios,
            OAccion: datosEditandoAccion.datosPlan.oAccion,
            Ods: datosEditandoAccion.datosPlan.ods,
            DAccion: datosEditandoAccion.datosPlan.dAccion,
            Presupuesto: datosEditandoAccion.datosPlan.presupuesto,
            IMujHom: datosEditandoAccion.datosPlan.iMujHom,
            UEuskera: datosEditandoAccion.datosPlan.uEuskera,
            Sostenibilidad: datosEditandoAccion.datosPlan.sostenibilidad,
            DInteligent: datosEditandoAccion.datosPlan.dInteligent,
            Observaciones: datosEditandoAccion.datosPlan.observaciones,
        };

        const DatosMemoria: DatosMemoriaDTO = {
            Id: Number(datosEditandoAccion.datosMemoria.id),
            SActual: datosEditandoAccion.datosMemoria.sActual,
            //DAccionAvances: datosEditandoAccion.datosMemoria.dAccionAvances,
            PresupuestoEjecutado_Cuantia: datosEditandoAccion.datosMemoria.presupuestoEjecutado.cuantia,
            PresupuestoEjecutado_FuenteDeFinanciacion: convertirArrayACadena(datosEditandoAccion.datosMemoria.presupuestoEjecutado.fuenteDeFinanciacion),
            PresupuestoEjecutado_Observaciones: datosEditandoAccion.datosMemoria.presupuestoEjecutado.observaciones,
            EjecucionPresupuestaria_Previsto: datosEditandoAccion.datosMemoria.ejecucionPresupuestaria.previsto,
            EjecucionPresupuestaria_Ejecutado: datosEditandoAccion.datosMemoria.ejecucionPresupuestaria.ejecutado,
            EjecucionPresupuestaria_Porcentaje: datosEditandoAccion.datosMemoria.ejecucionPresupuestaria.porcentaje,
            Observaciones: datosEditandoAccion.datosMemoria.observaciones,
            DSeguimiento: datosEditandoAccion.datosMemoria.dSeguimiento,
            ValFinal: datosEditandoAccion.datosMemoria.valFinal,
        };

        return {
            indicadoreRealizacionEdit,
            indicadoreResultadoEdit,
            DatosPlan,
            DatosMemoria,
        };
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
                GuardarLaEdicionAccion,
                EliminarAccion,
                AgregarServicio,
                SeleccionEditarAccion,
                SeleccionVaciarEditarAccion,
                SeleccionEditarGuardar,
                SeleccionEditarGuardarAccesoria,
                SeleccionEditarServicio,
                llamadaBBDDYearData,
                datosEditandoServicio,
                loadingYearData,
                setDatosEditandoServicio,
                GuardarEdicionServicio,
                errorMessage,
                successMessage,
                selectedId,
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

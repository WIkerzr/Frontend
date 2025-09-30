/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DatosAccion, DatosMemoria, EstadoLabel } from '../../../../types/TipadoAccion';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { sortBy } from 'lodash';
import { HMT, IndicadorRealizacionAccion, IndicadorResultadoAccion, TiposDeIndicadores } from '../../../../types/Indicadores';
import { editableColumnByPath } from '../../../../components/Utils/utilsTabla/Columnas';
import { TiposAccion, useYear } from '../../../../contexts/DatosAnualContext';
import { Estado } from '../../../../types/GeneralTypes';
import { StatusColorsFonds, useEstadosPorAnio } from '../../../../contexts/EstadosPorAnioContext';
import React from 'react';
import { PlanOMemoria } from '../../PlanMemoria/PlanMemoriaComponents';
interface TabCardProps {
    icon: string;
    label: string;
    status?: Estado;
    className?: string;
}

export const TabCard: React.FC<TabCardProps> = ({ icon, label, status = 'borrador', className }) => {
    const { t } = useTranslation();
    return (
        <div className={`flex items-center`}>
            <div className="relative">
                <img src={icon} alt={t(`${label}`)} className="w-6 h-6" />
                <span className={`absolute -top-1 -right-0 w-3 h-3 rounded-full border-2 border-whit ${StatusColorsFonds[status]}`} />
            </div>
            <span className={`font-semibold ${className}`}>{t(`${label}`)}</span>
        </div>
    );
};

const estados: { label: EstadoLabel; color: string }[] = [
    { label: 'Actuación en ejecución', color: 'bg-green-100 text-green-800' },
    { label: 'Actuación en espera', color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Actuación finalizada', color: 'bg-blue-100 text-blue-800' },
    { label: 'Actuación abandonada', color: 'bg-red-100 text-red-800' },
];

type CustomSelectProps = {
    value: EstadoLabel;
    disabled?: boolean;
    onChange: (value: EstadoLabel) => void;
};

export function CustomSelect({ value, disabled, onChange }: CustomSelectProps) {
    const selected = estados.find((e) => e.label === value) || estados[0];
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { t } = useTranslation();

    const handleSelect = (estado: { label: EstadoLabel; color: string }) => {
        onChange(estado.label);
        setOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const ESTADOS: EstadoLabel[] = ['Actuación en ejecución', 'Actuación en espera', 'Actuación finalizada', 'Actuación abandonada'];

    const EstadoLabelTraducidos = t('object:estados', { returnObjects: true }) as string[];

    return (
        <div className="relative w-full max-w-sm -top-[2px]" ref={dropdownRef}>
            <button type="button" onClick={() => setOpen(!open)} disabled={disabled} className={`w-full text-left p-2 rounded border ${selected.color} ${disabled && 'cursor-not-allowed'}`}>
                {EstadoLabelTraducidos[ESTADOS.indexOf(selected.label as EstadoLabel)]}
            </button>

            {open && (
                <div className={`absolute mt-1 w-full border rounded shadow bg-white z-10`}>
                    {estados.map((estado, idx) => (
                        <option key={estado.label} onClick={() => handleSelect(estado)} className={`p-2 cursor-pointer hover:bg-gray-100 ${estado.color}`}>
                            {EstadoLabelTraducidos[idx]}
                        </option>
                    ))}
                </div>
            )}
        </div>
    );
}

function VerificarCamposIndicadores(filas: IndicadorRealizacionAccion[], statusPlan: boolean, statusMemoria: boolean): boolean {
    if (!filas || filas.length === 0) return false;

    return filas.every((fila) => {
        if (!fila) {
            return false;
        } else {
            if (fila.metaAnual?.total === 0 || fila.metaAnual?.total === '0') return false;
            if (fila.metaFinal?.total === 0 || fila.metaFinal?.total === '0') return false;
            if (!statusPlan && statusMemoria) {
                if (fila.ejecutado?.total === 0 || fila.ejecutado?.total === '0') return false;
            }
        }

        return true;
    });
}

export function VerificadorIndicadores(datosEditandoAccion: DatosAccion, statusPlan: boolean, statusMemoria: boolean) {
    if (!datosEditandoAccion.indicadorAccion) {
        return false;
    }
    if (datosEditandoAccion.indicadorAccion.indicadoreRealizacion.length === 0 && datosEditandoAccion.indicadorAccion.indicadoreResultado.length === 0) {
        return false;
    }
    const indicadorRealizacion: IndicadorRealizacionAccion[] = datosEditandoAccion.indicadorAccion.indicadoreRealizacion;
    const indicadorResultado: IndicadorResultadoAccion[] = datosEditandoAccion.indicadorAccion.indicadoreResultado;

    if (VerificarCamposIndicadores(indicadorRealizacion, statusPlan, statusMemoria)) {
        if (VerificarCamposIndicadores(indicadorResultado, statusPlan, statusMemoria)) {
            return true;
        }
        return false;
    }
    return false;
}

export function VerificarCamposIndicadoresPorRellenar(
    datosEditandoAccion: DatosAccion,
    statusPlan: boolean,
    statusMemoria: boolean,
    ubicacionDelVerificador: 'NuevoIndicador' | 'GuardadoEdicion',
    t: (key: string, options?: any) => string,
    verificando: PlanOMemoria,
    sinAlerts?: boolean
) {
    const invalidIndicesRealizacion: InvalidIndex[] = [];
    const invalidIndicesResultado: InvalidIndex[] = [];

    interface InvalidIndex {
        index: number;
        camposFaltantes: string[];
    }

    function validarIndicadores<T extends { metaAnual?: { total?: number | string }; ejecutado?: { total?: number | string }; metaFinal?: { total?: number | string } }>(
        filas: T[] | undefined,
        invalidIndices: InvalidIndex[]
    ): boolean {
        if (!filas || filas.length === 0) return false;

        return filas.every((fila, index) => {
            const camposFaltantes: string[] = [];

            if (!fila) {
                camposFaltantes.push('fila ausente');
            } else {
                if (verificando === 'Plan') {
                    if (fila.metaAnual?.total === 0 || fila.metaAnual?.total === '0') camposFaltantes.push('metaAnual.total');
                    if (fila.metaFinal?.total === 0 || fila.metaFinal?.total === '0') camposFaltantes.push('metaFinal.total');
                }
                if (verificando === 'Memoria') {
                    if (fila.ejecutado?.total === 0 || fila.ejecutado?.total === '0') camposFaltantes.push('ejecutado.total');
                }
            }

            if (camposFaltantes.length > 0) {
                invalidIndices.push({ index, camposFaltantes });
            }

            return camposFaltantes.length === 0;
        });
    }

    interface InvalidIndex {
        index: number;
        camposFaltantes: string[];
    }

    function manejarAlertIndicadores(
        esValido: boolean,
        invalidIndices: InvalidIndex[],
        tipo: string,
        ubicacionDelVerificador: 'NuevoIndicador' | 'GuardadoEdicion',
        t: (key: string, params?: Record<string, any>) => string
    ): boolean {
        if (esValido) return true;

        if (ubicacionDelVerificador === 'NuevoIndicador') {
            if (invalidIndices.length === 0) {
                return true;
            } else {
                const mensaje = t('completarTablaTipo', { tipo }) + '\n' + invalidIndices.map((indice, i) => `Fila ${i + 1}:\n${indice.camposFaltantes.join('\n')}`).join('\n\n');
                if (!sinAlerts) {
                    alert(mensaje);
                }
            }
        } else if (ubicacionDelVerificador === 'GuardadoEdicion') {
            if (invalidIndices.length === 0) {
                if (!sinAlerts) {
                    alert(t('completarFilaVaciaGuardar', { tipo }));
                }
            } else {
                if (!sinAlerts) {
                    const mensaje = t('completarFilaVaciaGuardar', { tipo }) + '\n' + invalidIndices.map((indice, i) => `Fila ${i + 1}:\n${indice.camposFaltantes.join('\n')}`).join('\n\n');
                    alert(mensaje);
                }
            }
        }

        return false;
    }
    const esValidoRealizacion = validarIndicadores(datosEditandoAccion?.indicadorAccion?.indicadoreRealizacion, invalidIndicesRealizacion);
    let esValidoResultado = false;
    if (esValidoRealizacion) {
        esValidoResultado = validarIndicadores(datosEditandoAccion?.indicadorAccion?.indicadoreResultado, invalidIndicesResultado);
    }

    if (!manejarAlertIndicadores(esValidoRealizacion, invalidIndicesRealizacion, t('Realizacion'), ubicacionDelVerificador, t)) return false;

    if (!manejarAlertIndicadores(esValidoResultado, invalidIndicesResultado, t('Resultado'), ubicacionDelVerificador, t)) return false;

    return true;
}

export function VerificarAccionFinal(datosEditandoAccion: DatosAccion, editarPlan: boolean, editarMemoria: boolean, tiposAccion: TiposAccion, validacionMemoriaSeguimientoAnual?: boolean) {
    if (!datosEditandoAccion.indicadorAccion) {
        return;
    }
    const camposPendientes: string[] = [];
    const plan = datosEditandoAccion.datosPlan!;
    const memoria: DatosMemoria = datosEditandoAccion.datosMemoria as DatosMemoria;
    const indicadoresRealizacionAccion: IndicadorRealizacionAccion[] = datosEditandoAccion.indicadorAccion.indicadoreRealizacion;
    const indicadoresResultadoAccion: IndicadorResultadoAccion[] = datosEditandoAccion.indicadorAccion.indicadoreResultado;
    const checkData = (value: any, name: string) => {
        if (value === null || value === undefined || value === '' || value === '\n') {
            camposPendientes.push(name);
            return false;
        }
        return true;
    };

    //Plan
    checkData(plan.ejecutora, 'Ejecutora');
    checkData(plan.implicadas, 'Implicadas');
    if (datosEditandoAccion.plurianual) {
        checkData(plan.rangoAnios, 'RangoAnios');
    }
    checkData(plan.oAccion, 'OAccion');
    checkData(plan.dAccion, 'DAccion');

    if ((!editarPlan && editarMemoria) || (editarMemoria && validacionMemoriaSeguimientoAnual)) {
        //Memoria
        checkData(memoria.presupuestoEjecutado.fuenteDeFinanciacion, 'fuenteDeFinanciacion');
        checkData(memoria.presupuestoEjecutado.cuantia, 'cuantia');
        checkData(memoria.presupuestoEjecutado.observaciones, 'observaciones');
        checkData(memoria.ejecucionPresupuestaria.previsto, 'previsto');
        checkData(memoria.ejecucionPresupuestaria.ejecutado, 'ejecutado');
        checkData(memoria.ejecucionPresupuestaria.porcentaje, 'porcentaje');
    }

    //Indicador Realizacion
    indicadoresRealizacionAccion.forEach((i, idx) => {
        checkData(i.metaAnual!.total, `Realización #${idx + 1}: MetaAnual_Total`);
        if (!editarPlan && editarMemoria) {
            checkData(i.ejecutado!.total, `Realización #${idx + 1}: Ejecutado_Total`);
        }
        checkData(i.metaFinal!.total, `Realización #${idx + 1}: MetaFinal_Total`);
    });

    //Indicador Resultado
    indicadoresResultadoAccion.forEach((i, idx) => {
        checkData(i.metaAnual!.total, `Resultado #${idx + 1}: MetaAnual_Total`);
        if (!editarPlan && editarMemoria) {
            checkData(i.ejecutado!.total, `Resultado #${idx + 1}: Ejecutado_Total`);
        }
        checkData(i.metaFinal!.total, `Resultado #${idx + 1}: MetaFinal_Total`);
    });

    //DataAccion
    checkData(datosEditandoAccion.accion, 'Nombre');
    if (tiposAccion === 'Acciones') {
        checkData(datosEditandoAccion.lineaActuaccion, 'LineaActuaccion');
    }
    checkData(datosEditandoAccion.plurianual, 'Plurianual');

    return camposPendientes;
}

function actualizarMetaFinal<T extends { metaAnual?: HMT; metaFinal?: HMT }>(items: T[]): T[] {
    let hasChanges = false;

    const updated = items.map((item) => {
        if (!item.metaAnual) return item;

        const metaFinalChanged =
            !item.metaFinal ||
            item.metaFinal.hombres !== (item.metaAnual.hombres ?? 0) ||
            item.metaFinal.mujeres !== (item.metaAnual.mujeres ?? 0) ||
            item.metaFinal.total !== (item.metaAnual.total ?? 0);

        if (metaFinalChanged) {
            hasChanges = true;
            return {
                ...item,
                metaFinal: {
                    hombres: item.metaAnual.hombres ?? 0,
                    mujeres: item.metaAnual.mujeres ?? 0,
                    total: item.metaAnual.total ?? 0,
                },
            };
        }

        return item;
    });

    return hasChanges ? updated : items;
}
interface TablasIndicadoresProps {
    tipoIndicador: TiposDeIndicadores;
}
interface TablaIndicadorAccionProps {
    indicadoresRealizacion: IndicadorRealizacionAccion[];
    setIndicadoresRealizacion: React.Dispatch<React.SetStateAction<IndicadorRealizacionAccion[]>>;
    indicadoresResultado: IndicadorRealizacionAccion[];
    setIndicadoresResultado: React.Dispatch<React.SetStateAction<IndicadorRealizacionAccion[]>>;
    plurianual: boolean;
    botonNuevoIndicadorAccion: React.ReactNode;
    handleEliminarIndicador: (tipoIndicador: TiposDeIndicadores, rowIndex: number) => void;
}

export const TablaIndicadorAccion = forwardRef<HTMLDivElement, TablaIndicadorAccionProps>(
    ({ indicadoresRealizacion, setIndicadoresRealizacion, indicadoresResultado, setIndicadoresResultado, plurianual, botonNuevoIndicadorAccion, handleEliminarIndicador }, ref) => {
        const { t } = useTranslation();

        const { block } = useYear();

        const { editarPlan, editarMemoria } = useEstadosPorAnio();
        const [bloqueo, setBloqueo] = useState<boolean>(block);
        const [searchRealizacion, setSearchRealizacion] = useState('');
        const [searchResultado, setSearchResultado] = useState('');
        const [sortStatusRealizacion, setSortStatusRealizacion] = useState<DataTableSortStatus<IndicadorRealizacionAccion>>({ columnAccessor: 'id', direction: 'asc' });
        const [sortStatusResultado, setSortStatusResultado] = useState<DataTableSortStatus<IndicadorResultadoAccion>>({ columnAccessor: 'id', direction: 'asc' });
        const [editableRowIndexRealizacion, setEditableRowIndexRealizacion] = useState(-1);
        const [editableRowIndexResultado, setEditableRowIndexResultado] = useState(-1);
        const [dataRealizacion, setDataRealizacion] = useState(sortBy(indicadoresRealizacion, 'id'));
        const [dataResultado, setDataResultado] = useState(sortBy(indicadoresResultado, 'id'));

        const [indicadoresRealizacionTabla, setIndicadoresRealizacionTabla] = useState<IndicadorRealizacionAccion[]>(indicadoresRealizacion);
        const [indicadoresResultadoTabla, setIndicadoresResultadoTabla] = useState<IndicadorResultadoAccion[]>(indicadoresResultado);

        const [prevEditableRowIndexRealizacion, setPrevEditableRowIndexRealizacion] = useState<boolean>(false);
        const [prevEditableRowIndexResultado, setPrevEditableRowIndexResultado] = useState<boolean>(false);

        useEffect(() => {
            if (!editarPlan && !editarMemoria) {
                setBloqueo(true);
            } else {
                if (!block) {
                    setBloqueo(false);
                }
            }
        }, []);

        const filtrarIndicadores = <T extends { descripcion?: string; metaAnual?: any; ejecutado?: any; metaFinal?: any; hipotesis?: string }>(lista: T[], search: string) => {
            if (!search.trim()) return sortBy(lista, 'id');
            const s = search.toLowerCase();
            return lista.filter(
                (item) =>
                    item.descripcion?.toLowerCase().includes(s) ||
                    (item.metaAnual?.hombres !== undefined && String(item.metaAnual.hombres).toLowerCase().includes(s)) ||
                    (item.metaAnual?.mujeres !== undefined && String(item.metaAnual.mujeres).toLowerCase().includes(s)) ||
                    (item.metaAnual?.total !== undefined && String(item.metaAnual.total).toLowerCase().includes(s)) ||
                    (item.ejecutado?.hombres !== undefined && String(item.ejecutado.hombres).toLowerCase().includes(s)) ||
                    (item.ejecutado?.mujeres !== undefined && String(item.ejecutado.mujeres).toLowerCase().includes(s)) ||
                    (item.ejecutado?.total !== undefined && String(item.ejecutado.total).toLowerCase().includes(s)) ||
                    (item.metaFinal?.hombres !== undefined && String(item.metaFinal.hombres).toLowerCase().includes(s)) ||
                    (item.metaFinal?.mujeres !== undefined && String(item.metaFinal.mujeres).toLowerCase().includes(s)) ||
                    (item.metaFinal?.total !== undefined && String(item.metaFinal.total).toLowerCase().includes(s)) ||
                    item.hipotesis?.toLowerCase().includes(s)
            );
        };

        useEffect(() => {
            //No plurianual entonces el contenido de metaFinal es la de MetaAnual
            if (!plurianual) {
                setIndicadoresRealizacionTabla((prev) => actualizarMetaFinal(prev));
            }
        }, [plurianual, indicadoresRealizacionTabla]);

        useEffect(() => {
            //No plurianual entonces el contenido de metaFinal es la de MetaAnual
            if (!plurianual) {
                setIndicadoresResultadoTabla((prev) => actualizarMetaFinal(prev));
            }
        }, [plurianual, indicadoresResultadoTabla]);

        useEffect(() => {
            setDataRealizacion(filtrarIndicadores(indicadoresRealizacion, searchRealizacion));
        }, [searchRealizacion, indicadoresRealizacion]);

        useEffect(() => {
            setDataResultado(filtrarIndicadores(indicadoresResultado, searchResultado));
        }, [searchResultado, indicadoresResultado]);

        useEffect(() => {
            const data = sortBy(dataRealizacion, sortStatusRealizacion.columnAccessor);
            setDataRealizacion(sortStatusRealizacion.direction === 'desc' ? data.reverse() : data);
        }, [sortStatusRealizacion]);

        useEffect(() => {
            const data = sortBy(dataResultado, sortStatusResultado.columnAccessor);
            setDataResultado(sortStatusResultado.direction === 'desc' ? data.reverse() : data);
        }, [sortStatusRealizacion]);

        const TablasIndicadores = forwardRef<HTMLDivElement, TablasIndicadoresProps>(({ tipoIndicador }, ref) => {
            let records = [];
            if (tipoIndicador === 'realizacion') {
                if (editableRowIndexRealizacion === 0) {
                    records = indicadoresRealizacionTabla;
                } else {
                    records = dataRealizacion;
                }
            } else {
                if (editableRowIndexResultado === 0) {
                    records = indicadoresResultadoTabla;
                } else {
                    records = dataResultado;
                }
            }
            const setIndicadorTabla = tipoIndicador === 'realizacion' ? setIndicadoresRealizacionTabla : setIndicadoresResultadoTabla;
            const editableRowIndex = tipoIndicador === 'realizacion' ? editableRowIndexRealizacion : editableRowIndexResultado;
            const setEditableRowIndex = tipoIndicador === 'realizacion' ? setEditableRowIndexRealizacion : setEditableRowIndexResultado;
            const sortStatus = tipoIndicador === 'realizacion' ? sortStatusRealizacion : sortStatusResultado;
            const setSortStatus = tipoIndicador === 'realizacion' ? setSortStatusRealizacion : setSortStatusResultado;
            let guardado: boolean = false;
            useEffect(() => {
                if (editableRowIndexRealizacion === 0) {
                    setPrevEditableRowIndexRealizacion(true);
                }
                if (!guardado && prevEditableRowIndexRealizacion && editableRowIndexRealizacion === -1) {
                    setIndicadoresRealizacion(indicadoresRealizacionTabla);
                    setPrevEditableRowIndexRealizacion(false);
                    guardado = true;
                }
            }, [editableRowIndexRealizacion]);

            useEffect(() => {
                if (editableRowIndexResultado === 0) {
                    setPrevEditableRowIndexResultado(true);
                }
                if (!guardado && prevEditableRowIndexResultado && editableRowIndexResultado === -1) {
                    setIndicadoresResultado(indicadoresResultadoTabla);
                    setPrevEditableRowIndexResultado(false);
                    guardado = true;
                }
            }, [editableRowIndexResultado]);

            const columnMetaAnual = [
                editableColumnByPath<IndicadorRealizacionAccion>('metaAnual.hombres', t('Hombre'), setIndicadorTabla, editableRowIndex, editarPlan),
                editableColumnByPath<IndicadorRealizacionAccion>('metaAnual.mujeres', t('Mujer'), setIndicadorTabla, editableRowIndex, editarPlan),
                editableColumnByPath<IndicadorRealizacionAccion>('metaAnual.total', t('Total'), setIndicadorTabla, editableRowIndex, editarPlan),
            ];

            const columnEjecutadoAnual = [
                editableColumnByPath<IndicadorRealizacionAccion>('ejecutado.hombres', t('Hombre'), setIndicadorTabla, editableRowIndex, editarMemoria),
                editableColumnByPath<IndicadorRealizacionAccion>('ejecutado.mujeres', t('Mujer'), setIndicadorTabla, editableRowIndex, editarMemoria),
                editableColumnByPath<IndicadorRealizacionAccion>('ejecutado.total', t('Total'), setIndicadorTabla, editableRowIndex, editarMemoria),
            ];

            const columnMetaFinal = [
                editableColumnByPath<IndicadorRealizacionAccion>('metaFinal.hombres', t('Hombre'), setIndicadorTabla, editableRowIndex, plurianual ? editarPlan : false),
                editableColumnByPath<IndicadorRealizacionAccion>('metaFinal.mujeres', t('Mujer'), setIndicadorTabla, editableRowIndex, plurianual ? editarPlan : false),
                editableColumnByPath<IndicadorRealizacionAccion>('metaFinal.total', t('Total'), setIndicadorTabla, editableRowIndex, plurianual ? editarPlan : false),
            ];
            const columnNombre = [editableColumnByPath<IndicadorRealizacionAccion>('descripcion', t('nombre'), setIndicadorTabla, editableRowIndex, false)];

            const columns = [
                editableColumnByPath<IndicadorRealizacionAccion>('hipotesis', t('hipotesis'), setIndicadorTabla, editableRowIndex, true),
                ...(!bloqueo
                    ? [
                          {
                              accessor: 'acciones',
                              title: 'Acciones',
                              render: (_row: IndicadorRealizacionAccion, index: number) => {
                                  return editableRowIndex === index ? (
                                      <button
                                          className="bg-green-500 text-white px-2 py-1 rounded"
                                          onClick={() => {
                                              const metaAnualOk = _row.metaAnual && _row.metaAnual.total !== 0;
                                              const metaFinalOk = _row.metaFinal && _row.metaFinal.total !== 0;
                                              const ejecutadoOk = _row.ejecutado && _row.ejecutado.total !== 0;
                                              let valido = false;
                                              let errorAlert = '';
                                              if (editarMemoria) {
                                                  if (ejecutadoOk) {
                                                      valido = true;
                                                  } else {
                                                      errorAlert = t('alertTotalesMemoriaActivo');
                                                  }
                                              }
                                              if (editarPlan) {
                                                  if (metaAnualOk && metaFinalOk) {
                                                      valido = true;
                                                  } else {
                                                      errorAlert = t('alertTotalesPlanActivo');
                                                  }
                                              }
                                              if (valido) {
                                                  setEditableRowIndex(-1);
                                              } else {
                                                  alert(t('alertIndicadores', { totales: errorAlert }));
                                              }
                                          }}
                                      >
                                          {t('guardar')}
                                      </button>
                                  ) : (
                                      <div className="flex gap-2 w-full">
                                          <button className="bg-primary text-white px-2 py-1 rounded" onClick={() => setEditableRowIndex(index)}>
                                              {t('editar')}
                                          </button>
                                          <button className="bg-danger text-white px-2 py-1 rounded" onClick={() => handleEliminarIndicador(tipoIndicador, index)}>
                                              {t('Eliminar')}
                                          </button>
                                      </div>
                                  );
                              },
                          },
                      ]
                    : []),
            ];
            const columnGroups = [
                { id: 'descripcion', title: '', columns: columnNombre },
                { id: 'metaAnual', title: t('metaAnual'), textAlignment: 'center', columns: columnMetaAnual },
                { id: 'ejecutado', title: t('ejecutado'), textAlignment: 'center', columns: columnEjecutadoAnual },
                { id: 'metaFinal', title: t('metaFinal'), textAlignment: 'center', columns: columnMetaFinal },
                { id: 'final', title: '', columns: columns },
            ];
            return (
                <div ref={ref}>
                    <DataTable
                        className={`datatable-pagination-horizontal `}
                        records={records}
                        groups={columnGroups}
                        withRowBorders={false}
                        withColumnBorders={true}
                        striped={true}
                        highlightOnHover={true}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                    />
                </div>
            );
        });

        return (
            <div ref={ref}>
                <div className="panel mt-6">
                    <span className="text-xl">{t('indicadorTipo', { tipo: t('RealizacionMin') })}</span>
                    <div className="flex items-center justify-between mb-4">
                        <input
                            type="text"
                            className="border border-gray-300 rounded p-2 w-full max-w-xs"
                            placeholder={t('Buscar') + ' ...'}
                            value={searchRealizacion}
                            onChange={(e) => setSearchRealizacion(e.target.value)}
                        />
                        {botonNuevoIndicadorAccion}
                    </div>
                    <TablasIndicadores tipoIndicador="realizacion" />
                </div>
                <div className="panel mt-6">
                    <span className="text-xl">{t('indicadorTipo', { tipo: t('ResultadoMin') })}</span>
                    <div className="flex items-center justify-between mb-4">
                        <input
                            type="text"
                            className="border border-gray-300 rounded p-2 w-full max-w-xs"
                            placeholder={t('Buscar') + ' ...'}
                            value={searchResultado}
                            onChange={(e) => setSearchResultado(e.target.value)}
                        />
                    </div>
                    <TablasIndicadores tipoIndicador="resultado" />
                </div>
            </div>
        );
    }
);

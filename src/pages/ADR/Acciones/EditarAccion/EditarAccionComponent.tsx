/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DatosAccion, DatosMemoria, EstadoLabel } from '../../../../types/TipadoAccion';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { isEqual, sortBy } from 'lodash';
import { IndicadorRealizacionAccion, IndicadorResultadoAccion, TiposDeIndicadores } from '../../../../types/Indicadores';
import { useEditableColumnByPath } from '../../../../components/Utils/utilsTabla/Columnas';
import { TiposAccion } from '../../../../contexts/DatosAnualContext';
import { Estado } from '../../../../types/GeneralTypes';
import { StatusColorsFonds } from '../../../../contexts/EstadosPorAnioContext';
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

interface TablaIndicadorAccionProps {
    indicadoresRealizacion: IndicadorRealizacionAccion[];
    setIndicadoresRealizacion: React.Dispatch<React.SetStateAction<IndicadorRealizacionAccion[]>>;
    indicadoresResultado: IndicadorRealizacionAccion[];
    setIndicadoresResultado: React.Dispatch<React.SetStateAction<IndicadorRealizacionAccion[]>>;
    plurianual: boolean;
    reglasEspeciales: { realizacion: number[]; resultado: number[] };
    botonNuevoIndicadorAccion: React.ReactNode;
    handleEliminarIndicador: (tipoIndicador: TiposDeIndicadores, rowIndex: number) => void;
    servicios?: boolean;
    editarPlan: boolean;
    editarMemoria: boolean;
}

interface TablasIndicadoresComponentProps {
    tipoIndicador: TiposDeIndicadores;
    dataRealizacion: IndicadorRealizacionAccion[];
    dataResultado: IndicadorResultadoAccion[];
    setIndicadoresRealizacion: React.Dispatch<React.SetStateAction<IndicadorRealizacionAccion[]>>;
    setIndicadoresResultado: React.Dispatch<React.SetStateAction<IndicadorResultadoAccion[]>>;
    plurianual: boolean;
    reglasEspeciales: { realizacion: number[]; resultado: number[] };
    // botonNuevoIndicadorAccion removed: not used inside this component
    handleEliminarIndicador: (tipoIndicador: TiposDeIndicadores, rowIndex: number) => void;
    servicios?: boolean;
    editarPlan: boolean;
    editarMemoria: boolean;
    editableRowIndexRealizacion: number;
    editableRowIndexResultado: number;
    setEditableRowIndexRealizacion: React.Dispatch<React.SetStateAction<number>>;
    setEditableRowIndexResultado: React.Dispatch<React.SetStateAction<number>>;
    sortStatusRealizacion: DataTableSortStatus<IndicadorRealizacionAccion>;
    sortStatusResultado: DataTableSortStatus<IndicadorResultadoAccion>;
    setSortStatusRealizacion: React.Dispatch<React.SetStateAction<DataTableSortStatus<IndicadorRealizacionAccion>>>;
    setSortStatusResultado: React.Dispatch<React.SetStateAction<DataTableSortStatus<IndicadorResultadoAccion>>>;
    serviciosFlag?: boolean;
    t: (key: string, options?: any) => string;
}

export const TablasIndicadoresComponent = forwardRef<HTMLDivElement, TablasIndicadoresComponentProps>(
    (
        {
            tipoIndicador,
            dataRealizacion,
            dataResultado,
            setIndicadoresRealizacion,
            setIndicadoresResultado,
            plurianual,
            reglasEspeciales,

            handleEliminarIndicador,
            servicios,
            editarPlan,
            editarMemoria,
            editableRowIndexRealizacion,
            editableRowIndexResultado,
            setEditableRowIndexRealizacion,
            setEditableRowIndexResultado,
            sortStatusRealizacion,
            sortStatusResultado,
            setSortStatusRealizacion,
            setSortStatusResultado,
            t,
        },
        ref
    ) => {
        const records = tipoIndicador === 'realizacion' ? dataRealizacion : (dataResultado as any);
        if (!records || records.length === 0) return null;
        for (let i = records.length - 1; i >= 0; i--) {
            const desc = records[i]?.descripcion;
            if (typeof desc !== 'string' || desc.trim() === '') {
                records.splice(i, 1);
            }
        }
        const setIndicador = tipoIndicador === 'realizacion' ? setIndicadoresRealizacion : setIndicadoresResultado;
        const editableRowIndex = tipoIndicador === 'realizacion' ? editableRowIndexRealizacion : editableRowIndexResultado;
        const setEditableRowIndex = tipoIndicador === 'realizacion' ? setEditableRowIndexRealizacion : setEditableRowIndexResultado;
        const sortStatus = tipoIndicador === 'realizacion' ? sortStatusRealizacion : sortStatusResultado;
        const setSortStatus = tipoIndicador === 'realizacion' ? setSortStatusRealizacion : setSortStatusResultado;

        const columnMetaAnual = [
            useEditableColumnByPath<IndicadorRealizacionAccion>(
                'metaAnual.hombres',
                t('Hombre'),
                setIndicador as any,
                editableRowIndex,
                editarPlan,
                reglasEspeciales,
                plurianual,
                setEditableRowIndex as any
            ),
            useEditableColumnByPath<IndicadorRealizacionAccion>(
                'metaAnual.mujeres',
                t('Mujer'),
                setIndicador as any,
                editableRowIndex,
                editarPlan,
                reglasEspeciales,
                plurianual,
                setEditableRowIndex as any
            ),
            useEditableColumnByPath<IndicadorRealizacionAccion>(
                'metaAnual.total',
                t('Total'),
                setIndicador as any,
                editableRowIndex,
                editarPlan,
                reglasEspeciales,
                plurianual,
                setEditableRowIndex as any
            ),
        ];

        const columnEjecutadoAnual = [
            useEditableColumnByPath<IndicadorRealizacionAccion>(
                'ejecutado.hombres',
                t('Hombre'),
                setIndicador as any,
                editableRowIndex,
                editarMemoria,
                reglasEspeciales,
                undefined,
                setEditableRowIndex as any
            ),
            useEditableColumnByPath<IndicadorRealizacionAccion>(
                'ejecutado.mujeres',
                t('Mujer'),
                setIndicador as any,
                editableRowIndex,
                editarMemoria,
                reglasEspeciales,
                undefined,
                setEditableRowIndex as any
            ),
            useEditableColumnByPath<IndicadorRealizacionAccion>(
                'ejecutado.total',
                t('Total'),
                setIndicador as any,
                editableRowIndex,
                editarMemoria,
                reglasEspeciales,
                undefined,
                setEditableRowIndex as any
            ),
        ];

        const columnMetaFinal = [
            useEditableColumnByPath<IndicadorRealizacionAccion>(
                'metaFinal.hombres',
                t('Hombre'),
                setIndicador as any,
                editableRowIndex,
                plurianual ? editarPlan : false,
                reglasEspeciales,
                undefined,
                setEditableRowIndex as any
            ),
            useEditableColumnByPath<IndicadorRealizacionAccion>(
                'metaFinal.mujeres',
                t('Mujer'),
                setIndicador as any,
                editableRowIndex,
                plurianual ? editarPlan : false,
                reglasEspeciales,
                undefined,
                setEditableRowIndex as any
            ),
            useEditableColumnByPath<IndicadorRealizacionAccion>(
                'metaFinal.total',
                t('Total'),
                setIndicador as any,
                editableRowIndex,
                plurianual ? editarPlan : false,
                reglasEspeciales,
                undefined,
                setEditableRowIndex as any
            ),
        ];
        const columnNombre = [
            useEditableColumnByPath<IndicadorRealizacionAccion>('descripcion', t('nombre'), setIndicador as any, editableRowIndex, false, undefined, undefined, setEditableRowIndex as any),
        ];

        const columns = [
            useEditableColumnByPath<IndicadorRealizacionAccion>('hipotesis', t('hipotesis'), setIndicador as any, editableRowIndex, editarPlan, undefined, undefined, setEditableRowIndex as any),
            ...(editarPlan || editarMemoria
                ? [
                      {
                          accessor: 'acciones',
                          title: t('Acciones'),
                          render: (_row: IndicadorRealizacionAccion, index: number) => {
                              return editableRowIndex === index ? (
                                  <button
                                      className="bg-green-500 text-white px-2 py-1 rounded"
                                      onMouseDown={() => {
                                          const active = document.activeElement as HTMLElement | null;
                                          try {
                                              if (active && typeof active.blur === 'function') {
                                                  active.blur();
                                              }
                                          } catch {
                                              // ignore
                                          }
                                          setTimeout(() => setEditableRowIndex(-1), 0);
                                      }}
                                  >
                                      {t('guardarFila')}
                                  </button>
                              ) : (
                                  <div className="flex gap-2 w-full">
                                      <button className="bg-primary text-white px-2 py-1 rounded" onMouseDown={() => setEditableRowIndex(index)}>
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
        const columnGroupsServicios = [
            { id: 'descripcion', title: '', columns: columnNombre },
            { id: 'metaAnual', title: t('metaAnual'), textAlignment: 'center', columns: columnMetaAnual },
            { id: 'ejecutado', title: t('ejecutado'), textAlignment: 'center', columns: columnEjecutadoAnual },
            { id: 'final', title: '', columns: [columns[1]] },
        ];
        return (
            <div ref={ref}>
                <DataTable
                    className={`datatable-pagination-horizontal `}
                    records={records}
                    groups={servicios ? columnGroupsServicios : columnGroups}
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
    }
);

export const TablaIndicadorAccion = forwardRef<HTMLDivElement, TablaIndicadorAccionProps>(
    (
        {
            indicadoresRealizacion,
            setIndicadoresRealizacion,
            indicadoresResultado,
            setIndicadoresResultado,
            plurianual,
            reglasEspeciales,
            servicios,
            botonNuevoIndicadorAccion,
            handleEliminarIndicador,
            editarPlan,
            editarMemoria,
        },
        ref
    ) => {
        const { t } = useTranslation();

        const [dataRealizacion, setDataRealizacion] = useState(indicadoresRealizacion);
        const [dataResultado, setDataResultado] = useState(indicadoresResultado);

        const [searchRealizacion, setSearchRealizacion] = useState('');
        const [searchResultado, setSearchResultado] = useState('');
        const [sortStatusRealizacion, setSortStatusRealizacion] = useState<DataTableSortStatus<IndicadorRealizacionAccion>>({ columnAccessor: 'id', direction: 'asc' });
        const [sortStatusResultado, setSortStatusResultado] = useState<DataTableSortStatus<IndicadorResultadoAccion>>({ columnAccessor: 'id', direction: 'asc' });
        const [editableRowIndexRealizacion, setEditableRowIndexRealizacion] = useState(-1);
        const [editableRowIndexResultado, setEditableRowIndexResultado] = useState(-1);

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
            const indicadorFiltrado = filtrarIndicadores(indicadoresRealizacion, searchRealizacion);
            if (JSON.stringify(indicadorFiltrado) !== JSON.stringify(dataRealizacion)) {
                setDataRealizacion(indicadorFiltrado);
            }
        }, [searchRealizacion, indicadoresRealizacion]);

        useEffect(() => {
            const indicadorFiltrado = filtrarIndicadores(indicadoresResultado, searchResultado);
            if (JSON.stringify(indicadorFiltrado) !== JSON.stringify(dataResultado)) {
                setDataResultado(indicadorFiltrado);
            }
        }, [searchResultado, indicadoresResultado]);

        const prevSortStatusRefRealizacion = useRef<DataTableSortStatus<IndicadorRealizacionAccion> | undefined>(undefined);
        useEffect(() => {
            if (!isEqual(prevSortStatusRefRealizacion.current, sortStatusRealizacion)) {
                const data = sortBy(dataRealizacion, sortStatusRealizacion.columnAccessor);
                const sortedData = sortStatusRealizacion.direction === 'desc' ? data.reverse() : data;
                setDataRealizacion(sortedData);

                prevSortStatusRefRealizacion.current = sortStatusRealizacion;
            }
        }, [sortStatusRealizacion, dataRealizacion]);

        const prevSortStatusRefResultado = useRef<DataTableSortStatus<IndicadorResultadoAccion> | undefined>(undefined);
        useEffect(() => {
            if (!isEqual(prevSortStatusRefResultado.current, sortStatusResultado)) {
                const data = sortBy(dataResultado, sortStatusResultado.columnAccessor);
                const sortedData = sortStatusResultado.direction === 'desc' ? data.reverse() : data;
                setDataResultado(sortedData);

                prevSortStatusRefResultado.current = sortStatusResultado;
            }
        }, [sortStatusResultado, dataResultado]);

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
                    <TablasIndicadoresComponent
                        tipoIndicador="realizacion"
                        dataRealizacion={dataRealizacion}
                        dataResultado={dataResultado}
                        setIndicadoresRealizacion={setIndicadoresRealizacion}
                        setIndicadoresResultado={setIndicadoresResultado}
                        plurianual={plurianual}
                        reglasEspeciales={reglasEspeciales}
                        handleEliminarIndicador={handleEliminarIndicador}
                        servicios={servicios}
                        editarPlan={editarPlan}
                        editarMemoria={editarMemoria}
                        editableRowIndexRealizacion={editableRowIndexRealizacion}
                        editableRowIndexResultado={editableRowIndexResultado}
                        setEditableRowIndexRealizacion={setEditableRowIndexRealizacion}
                        setEditableRowIndexResultado={setEditableRowIndexResultado}
                        sortStatusRealizacion={sortStatusRealizacion}
                        sortStatusResultado={sortStatusResultado}
                        setSortStatusRealizacion={setSortStatusRealizacion}
                        setSortStatusResultado={setSortStatusResultado}
                        t={t}
                    />
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
                    <TablasIndicadoresComponent
                        tipoIndicador="resultado"
                        dataRealizacion={dataRealizacion}
                        dataResultado={dataResultado}
                        setIndicadoresRealizacion={setIndicadoresRealizacion}
                        setIndicadoresResultado={setIndicadoresResultado}
                        plurianual={plurianual}
                        reglasEspeciales={reglasEspeciales}
                        handleEliminarIndicador={handleEliminarIndicador}
                        servicios={servicios}
                        editarPlan={editarPlan}
                        editarMemoria={editarMemoria}
                        editableRowIndexRealizacion={editableRowIndexRealizacion}
                        editableRowIndexResultado={editableRowIndexResultado}
                        setEditableRowIndexRealizacion={setEditableRowIndexRealizacion}
                        setEditableRowIndexResultado={setEditableRowIndexResultado}
                        sortStatusRealizacion={sortStatusRealizacion}
                        sortStatusResultado={sortStatusResultado}
                        setSortStatusRealizacion={setSortStatusRealizacion}
                        setSortStatusResultado={setSortStatusResultado}
                        t={t}
                    />
                </div>
            </div>
        );
    }
);

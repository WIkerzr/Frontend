/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DatosAccion, EstadoLabel } from '../../../types/TipadoAccion';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { sortBy } from 'lodash';
import { IndicadorRealizacionAccion, IndicadorResultadoAccion } from '../../../types/Indicadores';
import { editableColumnByPath } from './Columnas';
import { useYear } from '../../../contexts/DatosAnualContext';
import { Estado } from '../../../types/GeneralTypes';
import { StatusColorsFonds, useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import React from 'react';
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

    return (
        <div className="relative w-full max-w-sm -top-[2px]" ref={dropdownRef}>
            <button type="button" onClick={() => setOpen(!open)} disabled={disabled} className={`w-full text-left p-2 rounded border ${disabled ? 'bg-gray-600' : selected.color}`}>
                {selected.label}
            </button>

            {open && (
                <div className={`absolute mt-1 w-full border rounded shadow bg-white z-10`}>
                    {estados.map((estado) => (
                        <div key={estado.label} onClick={() => handleSelect(estado)} className={`p-2 cursor-pointer hover:bg-gray-100 ${estado.color}`}>
                            {estado.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

export function VerificarCamposIndicadoresPorRellenar(datosEditandoAccion: DatosAccion, ubicacionDelVerificador: 'NuevoIndicador' | 'GuardadoEdicion', t: (key: string, options?: any) => string) {
    const invalidIndicesRealizacion: number[] = [];
    const invalidIndicesResultado: number[] = [];

    const esValidoRealizacion =
        datosEditandoAccion?.indicadorAccion?.indicadoreRealizacion?.every((fila, index) => {
            const isInvalid = !fila || fila.metaAnual?.total === 0 || fila.metaFinal?.total === 0 || fila.metaAnual?.total === '0' || fila.metaFinal?.total === '0';

            if (isInvalid) {
                invalidIndicesRealizacion.push(index);
            }

            return !isInvalid;
        }) ?? false;

    const esValidoResultado =
        datosEditandoAccion?.indicadorAccion?.indicadoreResultado?.every((fila, index) => {
            const isInvalid = !fila || fila.metaAnual?.total === 0 || fila.metaFinal?.total === 0 || fila.metaAnual?.total === '0' || fila.metaFinal?.total === '0';

            if (isInvalid) {
                invalidIndicesResultado.push(index);
            }

            return !isInvalid;
        }) ?? false;

    if (!esValidoRealizacion) {
        if (ubicacionDelVerificador === 'NuevoIndicador') {
            alert(t('completarUltimaFila', { tipo: t('Realizacion') }));
        } else if (ubicacionDelVerificador === 'GuardadoEdicion') {
            alert(t('completarUltimaFilaGuardar', { tipo: t('Realizacion') }));
        }
        return false;
    }
    if (!esValidoResultado) {
        if (ubicacionDelVerificador === 'NuevoIndicador') {
            alert(t('completarUltimaFila', { tipo: t('Resultado') }));
        } else if (ubicacionDelVerificador === 'GuardadoEdicion') {
            alert(t('completarUltimaFilaGuardar', { tipo: t('Resultado') }));
        }
        return false;
    }
    return true;
}

interface TablasIndicadoresProps<T> {
    records: T[];
    setIndicador: React.Dispatch<React.SetStateAction<T[]>>;
    editableRowIndex: number;
    setEditableRowIndex: React.Dispatch<React.SetStateAction<number>>;
    sortStatus: DataTableSortStatus<T>;
    setSortStatus: React.Dispatch<React.SetStateAction<DataTableSortStatus<T>>>;
}
interface TablaIndicadorAccionProps {
    indicadoresRealizacion: IndicadorRealizacionAccion[];
    setIndicadoresRealizacion: React.Dispatch<React.SetStateAction<IndicadorRealizacionAccion[]>>;
    indicadoresResultado: IndicadorRealizacionAccion[];
    setIndicadoresResultado: React.Dispatch<React.SetStateAction<IndicadorRealizacionAccion[]>>;
    botonNuevoIndicadorAccion: React.ReactNode;
}

export const TablaIndicadorAccion = forwardRef<HTMLDivElement, TablaIndicadorAccionProps>(
    ({ indicadoresRealizacion, setIndicadoresRealizacion, indicadoresResultado, setIndicadoresResultado, botonNuevoIndicadorAccion }, ref) => {
        const { t } = useTranslation();

        const { datosEditandoAccion, setDatosEditandoAccion, block } = useYear();

        const { editarPlan, editarMemoria } = useEstadosPorAnio();
        const [bloqueo, setBloqueo] = useState<boolean>(block);
        const [search, setSearch] = useState('');
        const [sortStatusRealizacion, setSortStatusRealizacion] = useState<DataTableSortStatus<IndicadorRealizacionAccion>>({ columnAccessor: 'id', direction: 'asc' });
        const [sortStatusResultado, setSortStatusResultado] = useState<DataTableSortStatus<IndicadorResultadoAccion>>({ columnAccessor: 'id', direction: 'asc' });
        const [editableRowIndexRealizacion, setEditableRowIndexRealizacion] = useState(-1);
        const [editableRowIndexResultado, setEditableRowIndexResultado] = useState(-1);
        const [dataRealizacion, setDataRealizacion] = useState(sortBy(indicadoresRealizacion, 'id'));
        const [dataResultado, setDataResultado] = useState(sortBy(indicadoresResultado, 'id'));

        useEffect(() => {
            if (!editarPlan && !editarMemoria) {
                setBloqueo(true);
            } else {
                if (!block) {
                    setBloqueo(false);
                }
            }
        }, []);

        const filtrarIndicadores = <T extends { descripcion?: string; metaAnual?: any; ejecutado?: any; metaFinal?: any; hipotesis?: string }>(lista: T[]) => {
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
            setDataRealizacion(filtrarIndicadores(indicadoresRealizacion));
            setDataResultado(filtrarIndicadores(indicadoresResultado));
        }, [search, indicadoresRealizacion, indicadoresResultado]);

        // useEffect(() => {
        //     if (indicadorReturn) return;
        //     if (tipoTabla === 'realizacion' && listadoNombresIndicadores.length > 0) {
        //         const idsIndicadores = new Set(listadoNombresIndicadores.map((i) => i.id));
        //         const filtrados = indicadoresRealizacionesModal.filter((item) => !idsIndicadores.has(item.id));
        //         setIndicadoresRealizacionesModal(filtrados);
        //     }
        // }, []);

        useEffect(() => {
            const data = sortBy(dataRealizacion, sortStatusRealizacion.columnAccessor);
            setDataRealizacion(sortStatusRealizacion.direction === 'desc' ? data.reverse() : data);
        }, [sortStatusRealizacion]);

        useEffect(() => {
            const data = sortBy(dataResultado, sortStatusResultado.columnAccessor);
            setDataResultado(sortStatusResultado.direction === 'desc' ? data.reverse() : data);
        }, [sortStatusRealizacion]);

        const handleEliminarFila = (rowIndex: number) => {
            if (window.confirm(t('confirmarEliminarIndicador'))) {
                const nuevosIndicadores = indicadoresRealizacion.filter((_row, idx) => idx !== rowIndex);
                setIndicadoresRealizacion(nuevosIndicadores);
                // if (tipoTabla === 'realizacion') {
                setDatosEditandoAccion({
                    ...datosEditandoAccion!,
                    indicadorAccion: {
                        indicadoreRealizacion: nuevosIndicadores,
                        indicadoreResultado: datosEditandoAccion!.indicadorAccion?.indicadoreResultado ?? [],
                    },
                });
                // } else {
                //     setDatosEditandoAccion({
                //         ...datosEditandoAccion!,
                //         indicadorAccion: {
                //             indicadoreRealizacion: datosEditandoAccion!.indicadorAccion?.indicadoreRealizacion ?? [],
                //             indicadoreResultado: nuevosIndicadores,
                //         },
                //     });
                // }
            }
        };

        const TablasIndicadores = React.forwardRef<HTMLDivElement, TablasIndicadoresProps<IndicadorRealizacionAccion | IndicadorResultadoAccion>>(
            ({ records, setIndicador, editableRowIndex, setEditableRowIndex, sortStatus, setSortStatus }, ref) => {
                const columnMetaAnual = [
                    editableColumnByPath<IndicadorRealizacionAccion>('metaAnual.hombres', t('Hombre'), setIndicador, editableRowIndex, editarPlan),
                    editableColumnByPath<IndicadorRealizacionAccion>('metaAnual.mujeres', t('Mujer'), setIndicador, editableRowIndex, editarPlan),
                    editableColumnByPath<IndicadorRealizacionAccion>('metaAnual.total', t('Total'), setIndicador, editableRowIndex, editarPlan),
                ];

                const columnEjecutadoAnual = [
                    editableColumnByPath<IndicadorRealizacionAccion>('ejecutado.hombres', t('Hombre'), setIndicador, editableRowIndex, editarMemoria),
                    editableColumnByPath<IndicadorRealizacionAccion>('ejecutado.mujeres', t('Mujer'), setIndicador, editableRowIndex, editarMemoria),
                    editableColumnByPath<IndicadorRealizacionAccion>('ejecutado.total', t('Total'), setIndicador, editableRowIndex, editarMemoria),
                ];

                const columnMetaFinal = [
                    editableColumnByPath<IndicadorRealizacionAccion>('metaFinal.hombres', t('Hombre'), setIndicador, editableRowIndex, editarPlan),
                    editableColumnByPath<IndicadorRealizacionAccion>('metaFinal.mujeres', t('Mujer'), setIndicador, editableRowIndex, editarPlan),
                    editableColumnByPath<IndicadorRealizacionAccion>('metaFinal.total', t('Total'), setIndicador, editableRowIndex, editarPlan),
                ];
                const columnNombre = [editableColumnByPath<IndicadorRealizacionAccion>('descripcion', t('nombre'), setIndicador, editableRowIndex, false)];

                const columns = [
                    editableColumnByPath<IndicadorRealizacionAccion>('hipotesis', t('hipotesis'), setIndicador, editableRowIndex, true),
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
                                              <button className="bg-danger text-white px-2 py-1 rounded" onClick={() => handleEliminarFila(index)}>
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
            }
        );

        return (
            <div ref={ref}>
                <div className="panel mt-6">
                    <span className="text-xl">{t('indicadorTipo', { tipo: t('RealizacionMin') })}</span>
                    <div className="flex items-center justify-between mb-4">
                        <input
                            type="text"
                            className="border border-gray-300 rounded p-2 w-full max-w-xs"
                            placeholder={t('Buscar') + ' ...'}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        {botonNuevoIndicadorAccion}
                    </div>
                    <TablasIndicadores
                        records={dataRealizacion}
                        setIndicador={setIndicadoresRealizacion}
                        editableRowIndex={editableRowIndexRealizacion}
                        setEditableRowIndex={setEditableRowIndexRealizacion}
                        sortStatus={sortStatusRealizacion}
                        setSortStatus={setSortStatusRealizacion}
                    />
                </div>
                <div className="panel mt-6">
                    <span className="text-xl">{t('indicadorTipo', { tipo: t('ResultadoMin') })}</span>
                    <TablasIndicadores
                        records={dataResultado}
                        setIndicador={setIndicadoresResultado}
                        editableRowIndex={editableRowIndexResultado}
                        setEditableRowIndex={setEditableRowIndexResultado}
                        sortStatus={sortStatusResultado}
                        setSortStatus={setSortStatusResultado}
                    />
                </div>
            </div>
        );
    }
);

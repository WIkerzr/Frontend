/* eslint-disable no-unused-vars */
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { EstadoLabel } from '../../../types/TipadoAccion';
import { ModalNuevoIndicadorAccion } from './EditarAccionIndicadores';
import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { sortBy } from 'lodash';
import { Estado, StatusColorsFonds, useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { IndicadorRealizacionAccion, IndicadorResultadoAccion } from '../../../types/Indicadores';
import { editableColumnByPath } from './Columnas';
import { indicadoresRealizacion, indicadoresResultado } from '../../../mocks/BBDD/indicadores';
import { useYear } from '../../../contexts/DatosAnualContext';

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

interface tablaIndicadoresProps {
    tipoTabla: 'realizacion' | 'resultado';
    creaccion?: boolean;
}

//Import temporal
const realizaciones: IndicadorRealizacionAccion[] = indicadoresRealizacion;

const listadoIndicadoresResultados: IndicadorResultadoAccion[] = indicadoresResultado;

//Temporal

export const TablaIndicadorAccion = forwardRef<HTMLButtonElement, tablaIndicadoresProps>(({ tipoTabla, creaccion = false }) => {
    const { datosEditandoAccion, setDatosEditandoAccion, block } = useYear();
    const indicador = tipoTabla === 'realizacion' ? datosEditandoAccion?.indicadorAccion?.indicadoreRealizacion : datosEditandoAccion?.indicadorAccion?.indicadoreResultado;
    if (!indicador) {
        return;
    }

    const { t } = useTranslation();
    const { editarPlan } = useEstadosPorAnio();

    const editarMemoria = true;

    const [indicadores, setIndicadores] = useState<IndicadorRealizacionAccion[]>([]);
    useEffect(() => {
        const rescargarIndicador = tipoTabla === 'realizacion' ? datosEditandoAccion?.indicadorAccion?.indicadoreRealizacion : datosEditandoAccion?.indicadorAccion?.indicadoreResultado;
        if (!rescargarIndicador) {
            return;
        }
        setIndicadores(rescargarIndicador);
    }, [datosEditandoAccion]);

    useEffect(() => {
        if (indicadores != indicador) {
            setIndicadores(indicador);
        }
    }, [indicador]);

    const [initialRecords, setInitialRecords] = useState(sortBy(indicadores, 'id'));

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus<IndicadorRealizacionAccion>>({ columnAccessor: 'id', direction: 'asc' });
    const [editableRowIndex, setEditableRowIndex] = useState(-1);

    const handleEliminarFila = (rowIndex: number) => {
        if (window.confirm(t('confirmarEliminarIndicador'))) {
            const nuevosIndicadores = indicadores.filter((_row, idx) => idx !== rowIndex);
            setIndicadores(nuevosIndicadores);
        }
    };

    const columnMetaAnual = [
        editableColumnByPath<IndicadorRealizacionAccion>('metaAnual.hombres', t('Hombre'), setIndicadores, editableRowIndex, editarPlan),
        editableColumnByPath<IndicadorRealizacionAccion>('metaAnual.mujeres', t('Mujer'), setIndicadores, editableRowIndex, editarPlan),
        editableColumnByPath<IndicadorRealizacionAccion>('metaAnual.total', t('Total'), setIndicadores, editableRowIndex, editarPlan),
    ];

    const columnEjecutadoAnual = [
        editableColumnByPath<IndicadorRealizacionAccion>('ejecutado.hombres', t('Hombre'), setIndicadores, editableRowIndex, editarMemoria),
        editableColumnByPath<IndicadorRealizacionAccion>('ejecutado.mujeres', t('Mujer'), setIndicadores, editableRowIndex, editarMemoria),
        editableColumnByPath<IndicadorRealizacionAccion>('ejecutado.total', t('Total'), setIndicadores, editableRowIndex, editarMemoria),
    ];

    const columnMetaFinal = [
        editableColumnByPath<IndicadorRealizacionAccion>('metaFinal.hombres', t('Hombre'), setIndicadores, editableRowIndex, editarPlan),
        editableColumnByPath<IndicadorRealizacionAccion>('metaFinal.mujeres', t('Mujer'), setIndicadores, editableRowIndex, editarPlan),
        editableColumnByPath<IndicadorRealizacionAccion>('metaFinal.total', t('Total'), setIndicadores, editableRowIndex, editarPlan),
    ];
    const columnNombre = [editableColumnByPath<IndicadorRealizacionAccion>('descripcion', t('nombre'), setIndicadores, editableRowIndex, false)];

    const columns = [
        editableColumnByPath<IndicadorRealizacionAccion>('hipotesis', t('hipotesis'), setIndicadores, editableRowIndex, true),
        ...(!block
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
                                      } else if (editarPlan) {
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
                                      {t('eliminar')}
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

    useEffect(() => {
        setInitialRecords(() => {
            if (!search.trim()) return sortBy(indicadores, 'id');
            const s = search.toLowerCase();
            return indicadores.filter(
                (item) =>
                    (item.descripcion && String(item.descripcion).toLowerCase().includes(s)) ||
                    (item.metaAnual?.hombres !== undefined && String(item.metaAnual.hombres).toLowerCase().includes(s)) ||
                    (item.metaAnual?.mujeres !== undefined && String(item.metaAnual.mujeres).toLowerCase().includes(s)) ||
                    (item.metaAnual?.total !== undefined && String(item.metaAnual.total).toLowerCase().includes(s)) ||
                    (item.ejecutado?.hombres !== undefined && String(item.ejecutado.hombres).toLowerCase().includes(s)) ||
                    (item.ejecutado?.mujeres !== undefined && String(item.ejecutado.mujeres).toLowerCase().includes(s)) ||
                    (item.ejecutado?.total !== undefined && String(item.ejecutado.total).toLowerCase().includes(s)) ||
                    (item.metaFinal?.hombres !== undefined && String(item.metaFinal.hombres).toLowerCase().includes(s)) ||
                    (item.metaFinal?.mujeres !== undefined && String(item.metaFinal.mujeres).toLowerCase().includes(s)) ||
                    (item.metaFinal?.total !== undefined && String(item.metaFinal.total).toLowerCase().includes(s)) ||
                    (item.hipotesis && item.hipotesis.toLowerCase().includes(s))
            );
        });
    }, [search, indicadores]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

    const handleSave = (seleccion: { idRealizacion: number; idsResultadosEnRealizacion: number[] }) => {
        const indicadorBase = realizaciones.find((r) => r.id === seleccion.idRealizacion);

        const nuevosIndicadoresRealizacion = [
            ...indicador,
            {
                id: seleccion.idRealizacion,
                descripcion: `${indicadorBase?.descripcion}`,
                idsResultados: seleccion.idsResultadosEnRealizacion,
                metaAnual: { hombres: 0, mujeres: 0, total: 0 },
                ejecutado: { hombres: 0, mujeres: 0, total: 0 },
                metaFinal: { hombres: 0, mujeres: 0, total: 0 },
            },
        ];
        const nuevosIndicadoresResultado = [
            // eslint-disable-next-line @typescript-eslint/no-non-null-asserted-optional-chain, no-unsafe-optional-chaining
            ...datosEditandoAccion?.indicadorAccion?.indicadoreResultado!,
            ...seleccion.idsResultadosEnRealizacion.map((idResultado) => ({
                id: idResultado,
                descripcion: listadoIndicadoresResultados.find((item) => item.id === idResultado)?.descripcion || '',
                idsResultados: seleccion.idsResultadosEnRealizacion,
                metaAnual: { hombres: 0, mujeres: 0, total: 0 },
                ejecutado: { hombres: 0, mujeres: 0, total: 0 },
                metaFinal: { hombres: 0, mujeres: 0, total: 0 },
            })),
        ];

        setIndicadores(nuevosIndicadoresRealizacion);

        setDatosEditandoAccion({
            ...datosEditandoAccion!,
            indicadorAccion: {
                indicadoreRealizacion: nuevosIndicadoresRealizacion,
                indicadoreResultado: nuevosIndicadoresResultado,
            },
        });
    };

    const handleOpenModal = () => {
        const ultima = indicadores[indicadores.length - 1];
        if (ultima && (!ultima.descripcion || !ultima.metaAnual?.total || !ultima.metaFinal?.total)) {
            alert(t('completarUltimaFila', { tipo: t('Realizacion') }));
            return;
        }
        setOpen(true);
    };

    const [open, setOpen] = useState(false);

    return (
        <div>
            <div className="p-1 flex items-center space-x-4 mb-5 justify-between">
                <input type="text" className="border border-gray-300 rounded p-2 w-full max-w-xs" placeholder={t('Buscar') + ' ...'} value={search} onChange={(e) => setSearch(e.target.value)} />
                {creaccion && !block && editarPlan && (
                    <>
                        <button className="px-4 py-2 bg-primary text-white rounded" onClick={handleOpenModal}>
                            {t('newFileIndicador', { tipo: t('RealizacionMin') })}
                        </button>
                        {open && <ModalNuevoIndicadorAccion realizaciones={realizaciones} resultados={listadoIndicadoresResultados} open={open} onClose={() => setOpen(false)} onSave={handleSave} />}
                    </>
                )}
            </div>
            <div>
                <DataTable
                    className={`datatable-pagination-horizontal `}
                    records={indicadores}
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
        </div>
    );
});

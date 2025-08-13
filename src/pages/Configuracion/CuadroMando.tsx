import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../Configuracion/componentes';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTableColumnTextAlign, DataTable } from 'mantine-datatable';
import { forwardRef, useState, useEffect } from 'react';
import { IndicadorRealizacionAccion, IndicadorResultadoAccion } from '../../types/Indicadores';
import { visualColumnByPath } from '../ADR/Acciones/Columnas';
import { useEstadosPorAnio, useRegionEstadosContext } from '../../contexts/RegionEstadosContext';

interface tablaIndicadoresProps {
    indicador: IndicadorRealizacionAccion[] | IndicadorResultadoAccion[];
    titulo: string;
}

const TablaCuadroMando = forwardRef<HTMLDivElement, tablaIndicadoresProps>(({ indicador, titulo }, ref) => {
    const { t } = useTranslation();
    const [initialRecords, setInitialRecords] = useState(sortBy(indicador, 'id'));
    const [recordsData] = useState(initialRecords);

    const [search] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });

    const columnMetaAnual = [visualColumnByPath('metaAnual.hombres', t('Hombre')), visualColumnByPath('metaAnual.mujeres', t('Mujer')), visualColumnByPath('metaAnual.total', t('Total'))];

    const columnEjecutadoAnual = [visualColumnByPath('ejecutado.hombres', t('Hombre')), visualColumnByPath('ejecutado.mujeres', t('Mujer')), visualColumnByPath('ejecutado.total', t('Total'))];

    const columnPorcentaje = [visualColumnByPath('porcentajeHombres', t('Hombre')), visualColumnByPath('porcentajeMujeres', t('Mujer')), visualColumnByPath('porcentajeTotal', t('Total'))];
    //const columnMetaFinal = [visualColumnByPath('metaFinal.hombres', t('Hombre')), visualColumnByPath('metaFinal.mujeres', t('Mujer')), visualColumnByPath('metaFinal.total', t('Total'))];
    const columnNombre = [visualColumnByPath('descripcion', titulo)];

    const columnGroups = [
        { id: 'descripcion', title: ``, columns: columnNombre },
        { id: 'metaAnual', title: t('metaAnual'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnMetaAnual },
        { id: 'ejecutado', title: t('ejecutado'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnEjecutadoAnual },
        { id: 'porcentaje', title: t('porcentaje'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnPorcentaje },
        //{ id: 'metaFinal', title: t('metaFinal'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnMetaFinal },
    ];

    useEffect(() => {
        setInitialRecords(() => {
            if (!search.trim()) return sortBy(indicador, 'id');
            const s = search.toLowerCase();
            return indicador.filter(
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
    }, [search, indicador]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

    return (
        <div className="datatables" ref={ref}>
            <DataTable
                className="whitespace-nowrap table-hover mantine-table"
                records={recordsData}
                groups={columnGroups}
                withRowBorders={false}
                withColumnBorders={true}
                striped={true}
                highlightOnHover
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus}
                minHeight={200}
            />
        </div>
    );
});

const actions = ['Todos', 'Acciones', 'Acciones y Proyectos', 'Servicios'];

const Index = () => {
    const { t } = useTranslation();
    const { regionData } = useRegionEstadosContext();
    const { anios } = useEstadosPorAnio();

    const [years, setYears] = useState<string[]>(['Todos', ...anios.map(String)]);
    const [yearFilter, setYearFilter] = useState<string>('Todos');

    const [tipeAction, setTipeAction] = useState<string>('Todos');

    useEffect(() => {
        const newYears = ['Todos', ...anios.map(String)];
        setYears(newYears);
        setYearFilter('Todos');
    }, [anios]);

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <div className="text-xl font-bold flex items-center space-x-2 ">
                        <span>{t('CuadroMando')}</span>
                    </div>
                }
            />

            <div className="p-5 flex flex-col gap-4 w-full paneln0">
                <div className="flex-1 flex justify-end gap-4">
                    <div className="w-[200px] ">
                        <label className="block mb-1">{t('CuadroMandoSelectorTipeAction')}</label>
                        <select
                            className="w-full border rounded p-2 resize-y"
                            value={tipeAction}
                            onChange={(e) => {
                                if (e.target.value) {
                                    setTipeAction(e.target.value);
                                }
                            }}
                        >
                            {actions.map((action) => (
                                <option key={action} value={action}>
                                    {action}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="w-[200px]">
                        <label className="block mb-1">{t('CuadroMandoSelectorYear')}</label>
                        <select
                            className="w-full border rounded p-2 resize-y"
                            value={yearFilter}
                            onChange={(e) => {
                                if (e.target.value) {
                                    setYearFilter(e.target.value);
                                }
                            }}
                        >
                            {years.map((anios) => (
                                <option key={anios} value={anios}>
                                    {anios}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>
                {regionData &&
                    regionData.data.map(
                        (year, yearIdx) =>
                            (yearFilter === 'Todos' || `${year.year}` === yearFilter) && (
                                <div key={year.nombreRegion + yearIdx}>
                                    {(tipeAction === 'Acciones' || tipeAction === 'Todos') &&
                                        year.servicios &&
                                        year.plan.ejesPrioritarios.map(
                                            (ejes, ejesIdx) =>
                                                ejes.acciones.length > 0 && (
                                                    <div key={ejes.EjeId || ejesIdx}>
                                                        {ejes.acciones.map((acciones, accionesIdx) => (
                                                            <div key={acciones.id || accionesIdx} className="panel mt-6">
                                                                <span>
                                                                    Accion: {year.nombreRegion} {year.year} {acciones.accion}
                                                                </span>
                                                                <h5 className="font-semibold text-lg dark:text-white-light mb-5">{acciones.accion}</h5>
                                                                <TablaCuadroMando indicador={acciones.indicadorAccion?.indicadoreRealizacion ?? []} titulo={t('indicadoresDeRealizacion')} />
                                                                <TablaCuadroMando indicador={acciones.indicadorAccion?.indicadoreResultado ?? []} titulo={t('indicadoresDeResultado')} />
                                                            </div>
                                                        ))}
                                                    </div>
                                                )
                                        )}
                                    {(tipeAction === 'Servicios' || tipeAction === 'Todos') &&
                                        year.servicios &&
                                        year.servicios.map((servicio, servicioIdx) => (
                                            <div key={servicio.id || servicioIdx} className="panel mt-6">
                                                <span>
                                                    Servicio: {year.nombreRegion} + {year.year} + {servicio.nombre}
                                                </span>
                                                {/* <h5 className="font-semibold text-lg dark:text-white-light mb-5">{acciones.accion}</h5>
                                                <TablaCuadroMando indicador={acciones.indicadorAccion?.indicadoreRealizacion ?? []} titulo={t('indicadoresDeRealizacion')} />
                                                <TablaCuadroMando indicador={acciones.indicadorAccion?.indicadoreResultado ?? []} titulo={t('indicadoresDeResultado')} /> */}
                                            </div>
                                        ))}
                                </div>
                            )
                    )}
            </div>
        </div>
    );
};

export default Index;

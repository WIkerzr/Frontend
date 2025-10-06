import { useTranslation } from 'react-i18next';
import { Estado, IndicadoresServicios, Servicios } from '../../../types/GeneralTypes';
import { DatosAccion } from '../../../types/TipadoAccion';
import { DatosAccionCuadroMando, DatosAnioCuadroMando, Ejes, ServiciosCuadroMando, YearData } from '../../../types/tipadoPlan';
import { Actions } from './CuadroMando';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTableColumnTextAlign, DataTable } from 'mantine-datatable';
import { forwardRef, useState, useEffect } from 'react';
import { visualColumnByPath } from '../../../components/Utils/utilsTabla/Columnas';
import { IndicadorRealizacionAccion, IndicadorResultadoAccion } from '../../../types/Indicadores';

export const TransformarYearDataACuadro = (yearData: YearData): DatosAnioCuadroMando => {
    const servicios: Servicios[] = yearData.servicios ? yearData.servicios : [];
    const ejesPrioritarios: Ejes[] = yearData.plan.ejesPrioritarios.filter((eje: Ejes) => eje.IsPrioritarios);
    const ejesRestantes: Ejes[] = yearData.plan.ejesRestantes ? yearData.plan.ejesRestantes.filter((eje: Ejes) => eje.IsAccessory) : [];

    const transformarAcciones = (ejes: Ejes[]): DatosAccionCuadroMando[] => {
        const acciones: DatosAccion[] = [];
        for (let index = 0; index < ejes.length; index++) {
            const eje = ejes[index];
            acciones.push(...eje.acciones);
        }
        return acciones.map(({ id, accion, lineaActuaccion, ejeId, indicadorAccion, accionCompartida, plurianual }) => ({
            id: Number(id),
            nombreAccion: accion,
            ejeId: ejeId ? Number(ejeId) : 0,
            lineaActuaccion: lineaActuaccion,
            indicadorAccion: indicadorAccion,
            AccionCompartida: accionCompartida && Number(accionCompartida.regionLider.RegionId) != 0 ? true : false,
            plurianual: plurianual,
        }));
    };
    const transformarServicios = (): ServiciosCuadroMando[] => {
        return servicios.map(({ id, nombre, descripcion, indicadores, idEje, lineaActuaccion }) => ({
            id,
            nombre,
            descripcion,
            indicadores,
            idEje,
            lineaActuaccion,
        }));
    };

    const prioritarios = transformarAcciones(ejesPrioritarios);
    const accesorias = transformarAcciones(ejesRestantes);
    return {
        nombreRegion: yearData.nombreRegion,
        year: yearData.year,
        accion: prioritarios,
        accionesAccesorias: accesorias,
        servicios: transformarServicios(),
        planStatus: yearData.plan.status,
        memoriaStatus: yearData.memoria.status,
    };
};

interface SelectorTipoAccionProps {
    tipeAction: Actions;
    setTipeAction: React.Dispatch<React.SetStateAction<Actions>>;
    actions: Actions[];
}
export const SelectorTipoAccionCuadroMando: React.FC<SelectorTipoAccionProps> = ({ tipeAction, setTipeAction, actions }) => {
    const { t } = useTranslation();

    return (
        <div className="w-[200px] ">
            <label className="block mb-1">{t('CuadroMandoSelectorTipeAction')}</label>
            <select
                className="w-full border rounded p-2 resize-y"
                value={tipeAction}
                onChange={(e) => {
                    if (e.target.value) {
                        setTipeAction(e.target.value as Actions);
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
    );
};

interface SelectorAnioCuadroMandoProps {
    years: string[];
    yearFilter: string;
    setYearFilter: React.Dispatch<React.SetStateAction<string>>;
}

export const SelectorAnioCuadroMando: React.FC<SelectorAnioCuadroMandoProps> = ({ years, yearFilter, setYearFilter }) => {
    const { t } = useTranslation();

    return (
        <div className="w-[200px]">
            <label className="block mb-1">{t('CuadroMandoSelectorYear')}</label>
            <select className="w-full border rounded p-2 resize-y" value={yearFilter} onChange={(e) => setYearFilter(e.target.value)}>
                {years.map((anio) => (
                    <option key={anio} value={anio}>
                        {anio}
                    </option>
                ))}
            </select>
        </div>
    );
};

interface tablaIndicadoresProps {
    indicador: IndicadorRealizacionAccion[] | IndicadorResultadoAccion[];
    titulo: string;
    planStatus: Estado;
}

export const TablaCuadroMando = forwardRef<HTMLDivElement, tablaIndicadoresProps>(({ indicador, titulo, planStatus }, ref) => {
    const { t } = useTranslation();
    const [initialRecords, setInitialRecords] = useState<IndicadorRealizacionAccion[]>(sortBy(indicador, 'id') as IndicadorRealizacionAccion[]);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });

    const columnMetaAnual = [visualColumnByPath('metaAnual.hombres', t('Hombre')), visualColumnByPath('metaAnual.mujeres', t('Mujer')), visualColumnByPath('metaAnual.total', t('Total'))];

    const columnEjecutadoAnual = [visualColumnByPath('ejecutado.hombres', t('Hombre')), visualColumnByPath('ejecutado.mujeres', t('Mujer')), visualColumnByPath('ejecutado.total', t('Total'))];

    const columnPorcentaje = [visualColumnByPath('porcentajeHombres', t('Hombre')), visualColumnByPath('porcentajeMujeres', t('Mujer')), visualColumnByPath('porcentajeTotal', t('Total'))];
    const columnMetaFinal = [visualColumnByPath('metaFinal.hombres', t('Hombre')), visualColumnByPath('metaFinal.mujeres', t('Mujer')), visualColumnByPath('metaFinal.total', t('Total'))];
    const columnNombre = [visualColumnByPath('descripcion', titulo)];

    const columnGroups = [
        { id: 'descripcion', title: ``, columns: columnNombre },
        { id: 'metaAnual', title: t('metaAnual'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnMetaAnual },
        { id: 'ejecutado', title: t('ejecutado'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnEjecutadoAnual },
        { id: 'porcentaje', title: t('porcentaje'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnPorcentaje },
    ];
    if (planStatus != 'borrador') {
        columnGroups.push({
            id: 'metaFinal',
            title: t('metaFinal'),
            textAlign: 'center' as DataTableColumnTextAlign,
            columns: columnMetaFinal,
        });
    }

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

    return (
        <div className="datatables" ref={ref}>
            <DataTable
                className="whitespace-nowrap table-hover mantine-table"
                records={initialRecords}
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
interface tablaIndicadoresServiciosProps {
    indicador: IndicadoresServicios[];
    titulo: string;
}

export const TablaCuadroMandoServicios = forwardRef<HTMLDivElement, tablaIndicadoresServiciosProps>(({ indicador, titulo }, ref) => {
    const { t } = useTranslation();
    const [initialRecords, setInitialRecords] = useState<IndicadoresServicios[]>(indicador as IndicadoresServicios[]);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

    const columnPrevisto = [visualColumnByPath('previsto.hombres', t('Hombre')), visualColumnByPath('previsto.mujeres', t('Mujer')), visualColumnByPath('previsto.valor', t('Total'))];

    const columnAlcanzadoAnual = [visualColumnByPath('alcanzado.hombres', t('Hombre')), visualColumnByPath('alcanzado.mujeres', t('Mujer')), visualColumnByPath('alcanzado.valor', t('Total'))];

    const columnPorcentaje = [visualColumnByPath('porcentajeSHombres', t('Hombre')), visualColumnByPath('porcentajeSMujeres', t('Mujer')), visualColumnByPath('porcentajeSTotal', t('Total'))];
    const columnNombre = [visualColumnByPath('indicador', titulo)];

    const columnGroups = [
        { id: 'indicador', title: ``, columns: columnNombre },
        { id: 'previsto', title: t('valorPrevisto'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnPrevisto },
        { id: 'alcanzado', title: t('valorReal'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnAlcanzadoAnual },
        { id: 'porcentaje', title: t('porcentaje'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnPorcentaje },
    ];

    return (
        <div className="datatables" ref={ref}>
            <DataTable
                className="whitespace-nowrap table-hover mantine-table"
                records={initialRecords}
                groups={columnGroups}
                withRowBorders={false}
                withColumnBorders={true}
                striped={true}
                highlightOnHover
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus}
                minHeight={200}
                idAccessor="indicador"
            />
        </div>
    );
});

const filtrarServicios = (search: string, indicador: IndicadoresServicios[]) => {
    if (!search) return indicador;
    const s = search.trim().toLowerCase();

    const filtered: IndicadoresServicios[] = !s
        ? (sortBy(indicador, 'id') as IndicadoresServicios[])
        : indicador.filter(
              (item): item is IndicadoresServicios =>
                  (item.indicador?.toLowerCase().includes(s) ?? false) ||
                  (item.previsto?.hombres !== undefined && String(item.previsto.hombres).toLowerCase().includes(s)) ||
                  (item.previsto?.mujeres !== undefined && String(item.previsto.mujeres).toLowerCase().includes(s)) ||
                  (item.previsto?.valor !== undefined && String(item.previsto.valor).toLowerCase().includes(s)) ||
                  (item.alcanzado?.hombres !== undefined && String(item.alcanzado.hombres).toLowerCase().includes(s)) ||
                  (item.alcanzado?.mujeres !== undefined && String(item.alcanzado.mujeres).toLowerCase().includes(s)) ||
                  (item.alcanzado?.valor !== undefined && String(item.alcanzado.valor).toLowerCase().includes(s))
          );
    return filtered;
};

const filtrarAcciones = (search: string, indicador: IndicadorRealizacionAccion[] | IndicadorResultadoAccion[]) => {
    if (!search) return indicador;
    const s = search.trim().toLowerCase();

    const filtered: IndicadorRealizacionAccion[] | IndicadorResultadoAccion[] = !s
        ? (sortBy(indicador, 'id') as IndicadorRealizacionAccion[] | IndicadorResultadoAccion[])
        : indicador.filter(
              (item): item is IndicadorRealizacionAccion | IndicadorResultadoAccion =>
                  (item.descripcion?.toLowerCase().includes(s) ?? false) ||
                  (item.metaAnual?.hombres !== undefined && String(item.metaAnual.hombres).toLowerCase().includes(s)) ||
                  (item.metaAnual?.mujeres !== undefined && String(item.metaAnual.mujeres).toLowerCase().includes(s)) ||
                  (item.metaAnual?.total !== undefined && String(item.metaAnual.total).toLowerCase().includes(s)) ||
                  (item.ejecutado?.hombres !== undefined && String(item.ejecutado.hombres).toLowerCase().includes(s)) ||
                  (item.ejecutado?.mujeres !== undefined && String(item.ejecutado.mujeres).toLowerCase().includes(s)) ||
                  (item.ejecutado?.total !== undefined && String(item.ejecutado.total).toLowerCase().includes(s)) ||
                  (item.metaFinal?.hombres !== undefined && String(item.metaFinal.hombres).toLowerCase().includes(s)) ||
                  (item.metaFinal?.mujeres !== undefined && String(item.metaFinal.mujeres).toLowerCase().includes(s)) ||
                  (item.metaFinal?.total !== undefined && String(item.metaFinal.total).toLowerCase().includes(s)) ||
                  (item.hipotesis?.toLowerCase().includes(s) ?? false)
          );
    return filtered;
};
interface TablasCuadroMandoProps {
    tipeAction: Actions;
    Datayear: DatosAnioCuadroMando;
    search: string;
    planStatus: Estado;
}
export const TablasCuadroMando = forwardRef<HTMLDivElement, TablasCuadroMandoProps>(({ tipeAction, Datayear, search, planStatus }, ref) => {
    const { t } = useTranslation();

    if (tipeAction === 'Acciones y Proyectos' || tipeAction === 'Acciones' || tipeAction === 'Todos') {
        const accionesPorTipo = tipeAction === 'Acciones' ? Datayear.accion : Datayear.accionesAccesorias;

        return (
            <>
                {accionesPorTipo.map((accion, index) => {
                    if (!accion.indicadorAccion) return null;

                    const realizacion: IndicadorRealizacionAccion[] = accion.indicadorAccion.indicadoreRealizacion;
                    const resultado: IndicadorResultadoAccion[] = accion.indicadorAccion.indicadoreResultado; // <-- Ojo aquí, antes estabas usando "indicadoreRealizacion" dos veces

                    const realizacionFiltrados = filtrarAcciones(search, realizacion);
                    const resultadoFiltrados = filtrarAcciones(search, resultado);

                    if (realizacionFiltrados.length === 0 && resultadoFiltrados.length === 0) return null;

                    return (
                        <div key={`${Datayear.year}-${accion.id ?? index}`} className="panel mt-6" ref={ref}>
                            <span>
                                {t(tipeAction === 'Acciones' ? 'Acciones' : 'AccionesAccesorias')}: {/*{Datayear.nombreRegion} {Datayear.year} */}
                            </span>
                            <h5 className="font-semibold text-lg dark:text-white-light mb-5">{accion.nombreAccion}</h5>

                            {realizacionFiltrados.length > 0 && <TablaCuadroMando indicador={realizacionFiltrados} titulo={t('indicadoresDeRealizacion')} planStatus={planStatus} />}
                            {resultadoFiltrados.length > 0 && <TablaCuadroMando indicador={resultadoFiltrados} titulo={t('indicadoresDeResultado')} planStatus={planStatus} />}
                        </div>
                    );
                })}
            </>
        );
    }

    if ((tipeAction === 'Servicios' || tipeAction === 'Todos') && Datayear.servicios) {
        return Datayear.servicios.map((servicio, servicioIdx) => {
            const realizacion: IndicadoresServicios[] = servicio.indicadores.filter((indicador) => indicador.tipo === 'realizacion');
            const resultado: IndicadoresServicios[] = servicio.indicadores.filter((indicador) => indicador.tipo === 'resultado');
            const realizacionFiltrados = filtrarServicios(search, realizacion);
            const resultadoFiltrados = filtrarServicios(search, resultado);
            if (realizacionFiltrados.length > 0 || resultadoFiltrados.length > 0) {
                return (
                    <div key={servicioIdx} className="panel mt-6" ref={ref}>
                        <span>
                            {t('Servicios')}: {Datayear.nombreRegion} + {Datayear.year}
                        </span>
                        <h5 className="font-semibold text-lg dark:text-white-light mb-5">{servicio.nombre}</h5>
                        {realizacionFiltrados.length > 0 && <TablaCuadroMandoServicios indicador={realizacionFiltrados} titulo={t('indicadoresDeRealizacion')} />}
                        {resultadoFiltrados.length > 0 && <TablaCuadroMandoServicios indicador={resultadoFiltrados} titulo={t('indicadoresDeResultado')} />}
                    </div>
                );
            }
        });
    }
});

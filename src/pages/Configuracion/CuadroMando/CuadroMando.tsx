import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../Users/componentes';
import { useEffect, useState } from 'react';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../../contexts/RegionContext';
import { useYear } from '../../../contexts/DatosAnualContext';
import { DatosAnioCuadroMando, Ejes } from '../../../types/tipadoPlan';
import { SelectorTipoAccionCuadroMando, SelectorAnioCuadroMando, TransformarYearDataACuadro, TablasCuadroMando } from './ConversorCuadroMando';
import { InputBuscador } from '../../../components/Utils/inputs';

export type Actions = 'Todos' | 'Acciones' | 'Acciones y Proyectos' | 'Servicios';

const actions: Actions[] = ['Todos', 'Acciones', 'Acciones y Proyectos', 'Servicios'];

const Index = () => {
    const { t } = useTranslation();
    const { regionSeleccionada } = useRegionContext();

    const { yearData, llamadaBBDDYearDataAll, LoadingYearData, loadingYearData } = useYear();
    const { anios, anioSeleccionada } = useEstadosPorAnio();

    useEffect(() => {
        if (!regionSeleccionada) return;
        if (yearData.plan.ejesPrioritarios.length === 0) return;
        let valida = false;
        const accionesPrio = yearData.plan.ejesPrioritarios[0].acciones;
        if (yearData.plan.ejesRestantes) {
            const ejeRest: Ejes[] = yearData.plan.ejesRestantes.filter((ej) => ej.IsAccessory) ?? [];
            if (accionesPrio.length > 0 && accionesPrio[0].indicadorAccion && ejeRest && ejeRest.length > 0 && ejeRest[0].acciones[0].indicadorAccion) {
                valida = true;
            }
        }
        if (!valida) {
            llamadaBBDDYearDataAll(anioSeleccionada!, true, true);
        }
    }, [loadingYearData]);

    const [years] = useState<string[]>(['Todos', ...anios.map(String)]);
    const [yearFilter, setYearFilter] = useState<string>('Todos');
    const [search, setSearch] = useState('');

    const [tipeAction, setTipeAction] = useState<Actions>('Todos');

    if (!regionSeleccionada) return;

    const [datosAnios, setDatosAnios] = useState<DatosAnioCuadroMando[]>([]);

    useEffect(() => {
        if (!regionSeleccionada) return;
        if (yearData.plan.ejesPrioritarios.length === 0) return;
        const datoAnio: DatosAnioCuadroMando = TransformarYearDataACuadro(yearData);
        setDatosAnios([datoAnio]);
    }, [yearData]);
    // if (datosAnios.length === 0) return;

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <div className="text-xl font-bold flex items-center space-x-2 ">
                        <span>{t('CuadroMando')}</span>
                    </div>
                }
            />
            <LoadingYearData />
            <div className="p-5 flex flex-col gap-4 w-full paneln0">
                <div className="flex-1 flex justify-end gap-4">
                    <InputBuscador setSearch={setSearch} />
                    <SelectorTipoAccionCuadroMando tipeAction={tipeAction} setTipeAction={setTipeAction} actions={actions} />
                    <SelectorAnioCuadroMando years={years} yearFilter={yearFilter} setYearFilter={setYearFilter} />
                </div>
                {datosAnios.map(
                    (Datayear: DatosAnioCuadroMando, DatayearIdx) =>
                        (yearFilter === 'Todos' || `${Datayear.year}` === yearFilter) && (
                            <div key={`${Datayear.nombreRegion}-${DatayearIdx}`}>
                                {(tipeAction === 'Acciones' || tipeAction === 'Todos') && (
                                    <TablasCuadroMando tipeAction="Acciones" Datayear={Datayear} search={search} planStatus={Datayear.planStatus} />
                                )}

                                {(tipeAction === 'Acciones y Proyectos' || tipeAction === 'Todos') && (
                                    <TablasCuadroMando tipeAction="Acciones y Proyectos" Datayear={Datayear} search={search} planStatus={Datayear.planStatus} />
                                )}

                                {(tipeAction === 'Servicios' || tipeAction === 'Todos') && (
                                    <TablasCuadroMando tipeAction="Servicios" Datayear={Datayear} search={search} planStatus={Datayear.planStatus} />
                                )}
                            </div>
                        )
                )}
            </div>
        </div>
    );
};

export default Index;

import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../Users/componentes';
import { useEffect, useRef, useState } from 'react';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../../contexts/RegionContext';
import { useYear } from '../../../contexts/DatosAnualContext';
import { DatosAnioCuadroMando, Ejes } from '../../../types/tipadoPlan';
import { SelectorTipoAccionCuadroMando, TransformarYearDataACuadro, TablasCuadroMando } from './ConversorCuadroMando';
import { InputBuscador, SelectorAnio } from '../../../components/Utils/inputs';

export type Actions = 'TODOS' | 'Acciones' | 'AccionesAccesorias' | 'Servicios';

const actions: Actions[] = ['TODOS', 'Acciones', 'AccionesAccesorias', 'Servicios'];

const Index = () => {
    const { t } = useTranslation();
    const { regionSeleccionada, nombreRegionSeleccionada } = useRegionContext();
    const ultimaLlamadaRef = useRef<number | null>(null);

    const { yearData, llamadaBBDDYearDataAll, LoadingYearData, loadingYearData } = useYear();
    const { anios, anioSeleccionada } = useEstadosPorAnio();

    useEffect(() => {
        if (!regionSeleccionada) return;
        if (loadingYearData) return;
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
            const ahora = Date.now();
            const haceDiezSec = 10 * 1000;

            const tiempoCumplido = !ultimaLlamadaRef.current || ahora - ultimaLlamadaRef.current > haceDiezSec;

            if (tiempoCumplido) {
                llamadaBBDDYearDataAll(anioSeleccionada!, true, true);
                ultimaLlamadaRef.current = ahora;
            }
        }
    }, [loadingYearData]);

    const [years] = useState<string[]>([t('TODOS'), ...anios.map(String)]);
    const [yearFilter, setYearFilter] = useState<string>(t('TODOS'));
    const [search, setSearch] = useState('');

    const [tipeAction, setTipeAction] = useState<Actions>('TODOS');
    const [datosAnios, setDatosAnios] = useState<DatosAnioCuadroMando[]>([]);

    useEffect(() => {
        if (!regionSeleccionada) return;
        if (yearData.plan.ejesPrioritarios.length === 0) return;
        if (yearData.nombreRegion != nombreRegionSeleccionada) return;
        const datoAnio: DatosAnioCuadroMando = TransformarYearDataACuadro(yearData);
        if (!datosAnios.includes(datoAnio) && datosAnios.every((da) => da.nombreRegion !== datoAnio.nombreRegion)) {
            setDatosAnios([...datosAnios, datoAnio]);
        }
    }, [yearData]);

    if (!regionSeleccionada) return;
    if (yearData.nombreRegion != nombreRegionSeleccionada) return;
    if (loadingYearData) {
        return <LoadingYearData />;
    }
    if (datosAnios.length === 0) return;

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
                    <InputBuscador setSearch={setSearch} />
                    <SelectorTipoAccionCuadroMando tipeAction={tipeAction} setTipeAction={setTipeAction} actions={actions} />
                    <SelectorAnio years={years} yearFilter={yearFilter} setYearFilter={setYearFilter} />
                </div>
                {datosAnios.map(
                    (Datayear: DatosAnioCuadroMando, DatayearIdx) =>
                        (yearFilter === 'TODOS' || `${Datayear.year}` === yearFilter) && (
                            <div key={`${Datayear.nombreRegion}-${DatayearIdx}`}>
                                {(tipeAction === 'Acciones' || tipeAction === 'TODOS') && (
                                    <TablasCuadroMando tipeAction="Acciones" Datayear={Datayear} search={search} planStatus={Datayear.planStatus} />
                                )}

                                {(tipeAction === 'AccionesAccesorias' || tipeAction === 'TODOS') && (
                                    <TablasCuadroMando tipeAction="AccionesAccesorias" Datayear={Datayear} search={search} planStatus={Datayear.planStatus} />
                                )}

                                {(tipeAction === 'Servicios' || tipeAction === 'TODOS') && (
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

import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../Users/componentes';
import { useEffect, useState, useRef } from 'react';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../../contexts/RegionContext';
import { useYear } from '../../../contexts/DatosAnualContext';
import { DatosAnioCuadroMando, Ejes } from '../../../types/tipadoPlan';
import { SelectorTipoAccionCuadroMando, TransformarYearDataACuadro, TablasCuadroMando } from './ConversorCuadroMando';
import { InputBuscador, SelectorAnio } from '../../../components/Utils/inputs';
import { SeleccioneRegion, SinDatos } from '../../../components/Utils/utils';

export type Actions = 'TODOS' | 'Acciones' | 'AccionesAccesorias' | 'Servicios';

const actions: Actions[] = ['TODOS', 'Acciones', 'AccionesAccesorias', 'Servicios'];

const Index = () => {
    const { t } = useTranslation();
    const { regionSeleccionada, nombreRegionSeleccionada } = useRegionContext();

    const { yearData, llamadaBBDDYearDataAll, LoadingYearData, loadingYearData } = useYear();
    const { anios, anioSeleccionada } = useEstadosPorAnio();

    const attemptTimestampsRef = useRef<Record<string, number>>({});
    const inFlightRef = useRef<Record<string, boolean>>({});

    useEffect(() => {
        if (!regionSeleccionada) return;
        if (loadingYearData) return;

        const key = `${regionSeleccionada}-${anioSeleccionada}`;

        const shouldSkipBecauseRecent = (k: string) => {
            const last = attemptTimestampsRef.current[k] || 0;
            return Date.now() - last < 30000;
        };

        const tryLoad = async () => {
            if (inFlightRef.current[key]) return;
            inFlightRef.current[key] = true;
            attemptTimestampsRef.current[key] = Date.now();
            try {
                await llamadaBBDDYearDataAll(anioSeleccionada!, true, true);
            } finally {
                inFlightRef.current[key] = false;
            }
        };

        if (yearData.plan.ejesPrioritarios.length === 0) {
            if (shouldSkipBecauseRecent(key)) return;
            void tryLoad();
            return;
        }

        let valida = false;
        const accionesPrio = yearData.plan.ejesPrioritarios[0].acciones;
        if (yearData.plan.ejesRestantes) {
            const ejeRest: Ejes[] = yearData.plan.ejesRestantes.filter((ej) => ej.IsAccessory) ?? [];
            if (accionesPrio.length > 0 && accionesPrio[0].indicadorAccion && ejeRest && ejeRest.length > 0 && ejeRest[0].acciones[0].indicadorAccion) {
                valida = true;
            }
        }

        if (!valida) {
            if (shouldSkipBecauseRecent(key)) return;
            void tryLoad();
        }
    }, [regionSeleccionada, anioSeleccionada, loadingYearData, nombreRegionSeleccionada]);

    const [years] = useState<string[]>([t('TODOS'), ...anios.map(String)]);
    const [yearFilter, setYearFilter] = useState<string>(t('TODOS'));
    const [search, setSearch] = useState('');

    const [actionsDisponibles, setActionsDisponibles] = useState<Actions[]>(actions);
    const [tipeAction, setTipeAction] = useState<Actions>('TODOS');
    const [datosAnios, setDatosAnios] = useState<DatosAnioCuadroMando[]>([]);

    const [datosOk, setDatosOk] = useState<boolean>(false);

    useEffect(() => {
        if (!regionSeleccionada) return;
        if (yearData.plan.ejesPrioritarios.length === 0) return;
        if (yearData.nombreRegion != nombreRegionSeleccionada) return;
        const datoAnio: DatosAnioCuadroMando = TransformarYearDataACuadro(yearData);
        setDatosAnios((prev) => {
            if (prev.every((da) => da.nombreRegion !== datoAnio.nombreRegion)) {
                return [...prev, datoAnio];
            }
            return prev.map((da) => (da.nombreRegion === datoAnio.nombreRegion ? datoAnio : da));
        });
    }, [yearData]);

    useEffect(() => {
        if (!regionSeleccionada) return;
        const newActions: Actions[] = [];

        if (yearData?.plan?.ejesPrioritarios?.length) {
            newActions.push('Acciones');
        }

        if (yearData?.plan?.ejesRestantes?.some((e) => e.IsAccessory)) {
            newActions.push('AccionesAccesorias');
        }

        if (yearData?.servicios?.length) {
            newActions.push('Servicios');
        }

        if (newActions.length > 1) {
            newActions.push('TODOS');
        }
        if (newActions.length > 0) {
            setDatosOk(true);
        }

        setActionsDisponibles(newActions);
    }, [yearData, regionSeleccionada]);

    if (!regionSeleccionada) return <SeleccioneRegion />;
    if (yearData.nombreRegion != nombreRegionSeleccionada) return <SeleccioneRegion />;
    if (loadingYearData) {
        return <LoadingYearData />;
    }
    if (datosAnios.length === 0) return;
    if (!datosOk) return <SinDatos />;
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
                    <SelectorTipoAccionCuadroMando tipeAction={tipeAction} setTipeAction={setTipeAction} actions={actionsDisponibles} />
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

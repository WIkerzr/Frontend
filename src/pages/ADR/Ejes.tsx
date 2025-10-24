import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingOverlayPersonalizada, ZonaTitulo } from '../Configuracion/Users/componentes';
import { Ejes, EjesBBDD, EjeSeleccion } from '../../types/tipadoPlan';
import { useYear } from '../../contexts/DatosAnualContext';
import { obtenerFechaLlamada, PrintFecha } from '../../components/Utils/utils';
import { ErrorMessage } from '../../components/Utils/animations';
import Tippy from '@tippyjs/react';
import IconRefresh from '../../components/Icon/IconRefresh';
import { useEstadosPorAnioContext, useEstadosPorAnio } from '../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../contexts/RegionContext';
import { LlamadaBBDDEjesRegion } from '../../components/Utils/data/dataEjes';
import { useUser } from '../../contexts/UserContext';
import { LlamadasBBDD } from '../../components/Utils/data/utilsData';

const Index = () => {
    const { t, i18n } = useTranslation();
    const { yearData, llamadaBBDDYearData, loadingYearData } = useYear();
    const { editarPlan, editarMemoria } = useEstadosPorAnio();
    const { regionSeleccionada } = useRegionContext();
    const { anioSeleccionada } = useEstadosPorAnioContext();
    const { lockedHazi } = useUser();

    const [locked] = useState<boolean>(false);

    const [ejesEstrategicos, setEjesEstrategicos] = useState<EjesBBDD[]>();

    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [fechaUltimoActualizadoBBDD, setFechaUltimoActualizadoBBDD] = useState<Date>(() => {
        const fechaStr = obtenerFechaLlamada('ejes');
        return fechaStr ? new Date(fechaStr) : new Date();
    });

    useEffect(() => {
        if (yearData && yearData.plan.ejesPrioritarios.length >= 1) {
            setLoading(false);
            const ejesNoAccesorios: Ejes[] = (yearData.plan.ejesRestantes ?? []).filter((eje: Ejes) => !eje.IsAccessory);

            const combinados = [...yearData.plan.ejesPrioritarios, ...ejesNoAccesorios];
            const ordenados: EjesBBDD[] = combinados
                .sort((a, b) => a.NameEs.localeCompare(b.NameEs))
                .map((eje) => ({
                    EjeId: eje.Id,
                    NameEs: eje.NameEs,
                    NameEu: eje.NameEu,
                    IsActive: eje.IsActive,
                    IsPrioritarios: eje.IsPrioritarios,
                    acciones: eje.acciones,
                    LineasActuaccion: eje.LineasActuaccion ? eje.LineasActuaccion : [],
                }));

            setEjesEstrategicos(ordenados);
        } else {
            llamadaEjes();
        }
    }, [yearData]);

    const llamadaEjes = () => {
        LlamadaBBDDEjesRegion(regionSeleccionada, t, i18n, { setErrorMessage, setSuccessMessage }, setLoading, setEjesEstrategicos, setFechaUltimoActualizadoBBDD);
    };

    const handleCheck = (e: React.ChangeEvent<HTMLInputElement>, id: string, seleccionados: boolean) => {
        if (!ejesEstrategicos) return;
        const checked = e.target.checked;
        setEjesEstrategicos((prev) =>
            prev!.map((i) => {
                if (i.EjeId !== id) return i;
                if (seleccionados && checked) return i;
                return { ...i, IsPrioritarios: checked };
            })
        );
    };

    const handleSave = () => {
        if (!ejesEstrategicos || !anioSeleccionada) {
            return;
        }
        const body: EjeSeleccion = {
            PlanId: Number(yearData.plan.id),
            ejesGlobales: ejesEstrategicos
                .sort((a, b) => a.NameEs.localeCompare(b.NameEs))
                .map((eje) => ({
                    Id: Number(eje.EjeId),
                    IsPrioritarios: eje.IsPrioritarios,
                })),
        };
        LlamadasBBDD({
            method: 'POST',
            url: `yearData/saveAxes`,
            setLoading,
            setErrorMessage,
            setSuccessMessage,
            body: body,
            async onSuccess() {
                await llamadaBBDDYearData(anioSeleccionada, true);
            },
        });
    };

    return (
        <div className="panel">
            <LoadingOverlayPersonalizada isLoading={loading || loadingYearData} message={{ successMessage, setSuccessMessage, errorMessage, setErrorMessage }} />

            <div className="w-full mx-auto mt-1 px-2">
                <ZonaTitulo
                    titulo={<h2 className="text-xl font-bold">{t('ejesTitulo')}</h2>}
                    zonaBtn={
                        <>
                            {lockedHazi === false && editarPlan && (
                                <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400" onClick={handleSave} disabled={locked}>
                                    {t('guardar')}
                                </button>
                            )}
                        </>
                    }
                    zonaExplicativa={
                        (editarPlan || editarMemoria) && (
                            <>
                                <span>{t('explicacionEje')}</span>
                                <span>{t('seleccionar3Ejes')}</span>
                            </>
                        )
                    }
                />
                <div className="flex justify-between items-center mb-2">
                    <div>{(!ejesEstrategicos || ejesEstrategicos.length === 0) && errorMessage && <ErrorMessage message={errorMessage} />}</div>
                    {!locked && (
                        <div className="flex items-center space-x-2">
                            <PrintFecha date={fechaUltimoActualizadoBBDD} />
                            <Tippy content={t('Actualizar')}>
                                <button type="button" onClick={() => llamadaEjes()}>
                                    <IconRefresh />
                                </button>
                            </Tippy>
                        </div>
                    )}
                </div>
                <div className=" p-2">
                    <label className=" font-semibold">{t('seleccionarCheckbox3Ejes')}</label>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-2 w-full">
                    {ejesEstrategicos &&
                        ejesEstrategicos.map((eje) => {
                            const contieneAcciones = eje.IsPrioritarios ? eje.acciones?.length > 0 : false;
                            const seleccionados = ejesEstrategicos.filter((e) => e.IsPrioritarios).length >= 3;
                            const disabled = contieneAcciones || (eje.IsPrioritarios ? false : seleccionados);
                            return (
                                <li key={eje.EjeId} className={`flex items-center p-2 rounded transition ${eje.IsPrioritarios ? 'bg-green-100' : ''}`}>
                                    <input
                                        type="checkbox"
                                        className={`form-checkbox h-5 w-5 text-green-600 accent-green-600 ${disabled && 'cursor-not-allowed'}`}
                                        checked={eje.IsPrioritarios}
                                        onChange={(e) => handleCheck(e, eje.EjeId, seleccionados)}
                                        disabled={disabled}
                                        id={`checkbox-${eje.EjeId}`}
                                    />
                                    <label
                                        htmlFor={`checkbox-${eje.EjeId}`}
                                        className={`mb-0  w-full ${eje.IsPrioritarios ? 'text-green-700 font-semibold' : ''} ${disabled ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                    >
                                        {i18n.language === 'es' ? eje.NameEs : eje.NameEu}
                                    </label>
                                </li>
                            );
                        })}
                </ul>
            </div>
        </div>
    );
};

export default Index;

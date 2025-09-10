import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LoadingOverlay, ZonaTitulo } from '../Configuracion/Users/componentes';
import { EjesBBDD } from '../../types/tipadoPlan';
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

    const [locked, setLocked] = useState(false);

    const [ejes, setEjes] = useState<EjesBBDD[]>();

    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [fechaUltimoActualizadoBBDD, setFechaUltimoActualizadoBBDD] = useState<Date>(() => {
        const fechaStr = obtenerFechaLlamada('ejes');
        return fechaStr ? new Date(fechaStr) : new Date();
    });

    const llamadaEjes = () => {
        LlamadaBBDDEjesRegion(regionSeleccionada, t, i18n, { setErrorMessage, setSuccessMessage }, setLoading, setEjes, setFechaUltimoActualizadoBBDD);
    };

    const handleCheck = (e: React.ChangeEvent<HTMLInputElement>, id: string) => {
        if (locked) return;
        if (!ejes) return;
        const contadorPrioritarios = ejes.filter((i) => i.IsPrioritarios).length;
        const checked = e.target.checked;
        if (!checked || contadorPrioritarios < 3) {
            setEjes((prev) => prev!.map((i) => (i.EjeId === id ? { ...i, IsPrioritarios: checked } : i)));
        }
    };

    useEffect(() => {
        if (yearData && yearData.plan.ejesPrioritarios.length >= 1) {
            setLocked(true);
            setLoading(false);
            const combinados = [...yearData.plan.ejesPrioritarios, ...yearData.plan.ejes];
            const ordenados: EjesBBDD[] = combinados
                .sort((a, b) => Number(a.Id) - Number(b.Id))
                .map((eje) => ({
                    EjeId: eje.Id,
                    NameEs: eje.NameEs,
                    NameEu: eje.NameEu,
                    IsActive: eje.IsActive,
                    IsPrioritarios: eje.IsPrioritarios,
                    acciones: eje.acciones,
                    LineasActuaccion: eje.LineasActuaccion ? eje.LineasActuaccion : [],
                }));

            setEjes(ordenados);
        } else {
            if (!lockedHazi) {
                setLocked(false);
            } else {
                setLocked(true);
            }
            llamadaEjes();
        }
    }, [yearData]);

    const handleSave = () => {
        LlamadasBBDD({
            method: 'POST',
            url: `yearData/${Number(regionSeleccionada)}/${anioSeleccionada}/axes`,
            setLoading,
            setErrorMessage,
            setSuccessMessage,
            body: ejes,
            async onSuccess() {
                setLocked(true);

                await llamadaBBDDYearData(anioSeleccionada!, true, { setErrorMessage, setSuccessMessage });
            },
        });
    };

    return (
        <div className="panel">
            <LoadingOverlay isLoading={loading || loadingYearData} message={{ successMessage, setSuccessMessage, errorMessage, setErrorMessage }} />

            <div className="w-full mx-auto mt-1 px-2">
                <ZonaTitulo
                    titulo={<h2 className="text-xl font-bold">{t('ejesTitulo')}</h2>}
                    zonaBtn={
                        <>
                            <span className="text-red-600 font-semibold">{t('seleccionarCheckbox3Ejes')}</span>
                            {!lockedHazi && (
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
                    <div>{errorMessage && <ErrorMessage message={errorMessage} />}</div>
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
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-2 w-full">
                    {ejes &&
                        ejes.map((eje) => (
                            <li key={eje.EjeId} className={`flex items-center p-2 rounded transition ${eje.IsPrioritarios ? 'bg-green-100' : ''}`}>
                                <input
                                    type="checkbox"
                                    className={`form-checkbox h-5 w-5 text-green-600 accent-green-600 ${locked && 'cursor-not-allowed'}`}
                                    checked={eje.IsPrioritarios}
                                    onChange={(e) => handleCheck(e, eje.EjeId)}
                                    disabled={locked}
                                    id={`checkbox-${eje.EjeId}`}
                                />
                                <label
                                    htmlFor={`checkbox-${eje.EjeId}`}
                                    className={`mb-0  w-full ${eje.IsPrioritarios ? 'text-green-700 font-semibold' : ''} ${locked ? 'cursor-not-allowed' : 'cursor-pointer'}`}
                                >
                                    {i18n.language === 'es' ? eje.NameEs : eje.NameEu}
                                </label>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
};

export default Index;

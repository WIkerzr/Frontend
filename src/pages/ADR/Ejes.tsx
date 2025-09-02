/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../Configuracion/Users/componentes';
import { EjesBBDD } from '../../types/tipadoPlan';
import { useYear } from '../../contexts/DatosAnualContext';
import { ApiTarget } from '../../components/Utils/data/controlDev';
import { FetchConRefreshRetry, gestionarErrorServidor, obtenerFechaLlamada, PrintFecha } from '../../components/Utils/utils';
import { ErrorMessage, Loading } from '../../components/Utils/animations';
import Tippy from '@tippyjs/react';
import IconRefresh from '../../components/Icon/IconRefresh';
import { useEstadosPorAnioContext, useEstadosPorAnio } from '../../contexts/EstadosPorAnioContext';
import { LlamadasBBDD } from '../../components/Utils/data/utilsData';
import { useRegionContext } from '../../contexts/RegionContext';

const Index = () => {
    const { t, i18n } = useTranslation();
    const { yearData, llamadaBBDDYearData } = useYear();
    const { editarPlan, editarMemoria } = useEstadosPorAnio();
    const { regionSeleccionada } = useRegionContext();
    const { anioSeleccionada } = useEstadosPorAnioContext();

    const [locked, setLocked] = useState(false);
    const [ejes, setEjes] = useState<EjesBBDD[]>();

    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [fechaUltimoActualizadoBBDD, setFechaUltimoActualizadoBBDD] = useState<Date>(() => {
        const fechaStr = obtenerFechaLlamada('ejes');
        return fechaStr ? new Date(fechaStr) : new Date();
    });

    const llamadaBBDDEjesRegion = () => {
        setErrorMessage('');
        LlamadasBBDD({
            method: 'GET',
            url: `/ejes/${regionSeleccionada}`,
            setLoading: setLoading,
            setFechaUltimoActualizadoBBDD: setFechaUltimoActualizadoBBDD,
            onSuccess: (data: any) => {
                const arrayMapeado = data.data.map((ejes: EjesBBDD) => ({
                    ...ejes,
                    Id: ejes.EjeId,
                    NameEs: ejes.NameEs || '',
                    NameEu: ejes.NameEu || '',
                    IsActive: ejes.IsActive || false,
                    IsPrioritarios: ejes.IsPrioritarios || false,
                }));
                const datosOrdenados = arrayMapeado.sort((a: { NameEs: any; NameEu: any }, b: { NameEs: any; NameEu: any }) =>
                    i18n.language === 'es' ? (a?.NameEs ?? '').localeCompare(b.NameEs) : (a?.NameEu ?? '').localeCompare(b.NameEu)
                );
                setEjes(datosOrdenados);
                setFechaUltimoActualizadoBBDD(new Date());
                setLoading(false);
                if (data.data.length === 0) {
                    setErrorMessage(t('error:errorFaltanDatosEjes'));
                }
            },
        });
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
                }));

            setEjes(ordenados);
        } else {
            setLocked(false);
            llamadaBBDDEjesRegion();
        }
    }, [yearData]);

    const handleSave = () => {
        const fetchAxes = async () => {
            const token = sessionStorage.getItem('access_token');
            try {
                const res = await FetchConRefreshRetry(`${ApiTarget}/yearData/${Number(regionSeleccionada)}/${anioSeleccionada}/axes`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ` + token,
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(ejes),
                });
                const data = await res.json();
                if (!res.ok) {
                    const errorInfo = gestionarErrorServidor(res, data);
                    console.log(errorInfo.mensaje);
                    return;
                }
                llamadaBBDDYearData(anioSeleccionada!, true);
            } catch (err: unknown) {
                const errorInfo = gestionarErrorServidor(err);
                console.log(errorInfo.mensaje);
                return;
            }
        };
        fetchAxes();
        setLocked(true);
    };

    if (loading) return <Loading />;
    return (
        <div className="panel">
            <div className="w-full mx-auto mt-1 px-2">
                <ZonaTitulo
                    titulo={<h2 className="text-xl font-bold">{t('ejesTitulo')}</h2>}
                    zonaBtn={
                        <>
                            <span className="text-red-600 font-semibold">{t('seleccionarCheckbox3Ejes')}</span>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400" onClick={handleSave} disabled={locked}>
                                {t('guardar')}
                            </button>
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
                                <button type="button" onClick={() => llamadaBBDDEjesRegion()}>
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
                                    className="form-checkbox h-5 w-5 text-green-600 accent-green-600"
                                    checked={eje.IsPrioritarios}
                                    onChange={(e) => handleCheck(e, eje.EjeId)}
                                    disabled={locked}
                                    id={`checkbox-${eje.EjeId}`}
                                />
                                <label htmlFor={`checkbox-${eje.EjeId}`} className={`mb-0 cursor-pointer w-full ${eje.IsPrioritarios ? 'text-green-700 font-semibold' : ''}`}>
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

/* eslint-disable @typescript-eslint/no-explicit-any */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../Configuracion/componentes';
import { Ejes } from '../../types/tipadoPlan';
import { useYear } from '../../contexts/DatosAnualContext';
import { ApiTarget } from '../../components/Utils/data/controlDev';
import { FetchConRefreshRetry, gestionarErrorServidor, obtenerFechaLlamada, PrintFecha } from '../../components/Utils/utils';
import { ErrorMessage, Loading } from '../../components/Utils/animations';
import Tippy from '@tippyjs/react';
import IconRefresh from '../../components/Icon/IconRefresh';
import { useRegionEstadosContext, useEstadosPorAnio } from '../../contexts/RegionEstadosContext';

const Index = () => {
    const { t, i18n } = useTranslation();
    const { yearData, setYearData } = useYear();
    const { editarPlan, editarMemoria } = useEstadosPorAnio();
    const { regionSeleccionada, anioSeleccionada } = useRegionEstadosContext();

    const [selected, setSelected] = useState<string[]>([]);
    const [locked, setLocked] = useState(false);
    const [ejes, setEjes] = useState<Ejes[]>();

    const [loading, setLoading] = useState<boolean>(true);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    // const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [fechaUltimoActualizadoBBDD, setFechaUltimoActualizadoBBDD] = useState<Date>(() => {
        const fechaStr = obtenerFechaLlamada('ejes');
        return fechaStr ? new Date(fechaStr) : new Date();
    });

    const llamadaBBDDEjes = (regionSeleccionada: string | null) => {
        const token = sessionStorage.getItem('access_token');
        setLoading(true);
        const primeraLlamadaBBDDEjes = async () => {
            const response = await FetchConRefreshRetry(`${ApiTarget}/ejes/${regionSeleccionada}`, {
                method: 'GET',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
            });

            if (response && !response.ok) {
                const errorInfo = gestionarErrorServidor(response);
                setErrorMessage(errorInfo.mensaje);
                setLoading(false);
                return;
            }
            if (response.ok) {
                setErrorMessage(null);
                const data = await response.json();
                const datosOrdenados = data.data.sort((a: { NameEs: any; NameEu: any }, b: { NameEs: any; NameEu: any }) =>
                    i18n.language === 'es' ? (a?.NameEs ?? '').localeCompare(b.NameEs) : (a?.NameEu ?? '').localeCompare(b.NameEu)
                );
                setEjes(datosOrdenados);
                localStorage.setItem('ejesPrioritarios', JSON.stringify(datosOrdenados));
                setFechaUltimoActualizadoBBDD(new Date());
                setLoading(false);
                if (data.data.length === 0) {
                    setErrorMessage(t('error:errorFaltanDatosEjes'));
                }
            }
        };
        primeraLlamadaBBDDEjes();
    };

    const handleCheck = (id: string) => {
        if (locked) return;
        if (selected.includes(id)) {
            setSelected((prev) => prev.filter((i) => i !== id));
            setEjes((prev) => prev!.filter((i) => i));
        } else if (selected.length < 3) {
            setSelected((prev) => [...prev, id]);
            setEjes((prev) => prev!.filter((i) => i));
        }
    };

    useEffect(() => {
        //TODO modificar cuando se cree DataYear
        const ejesPrioritarios = localStorage.getItem('ejesPrioritarios');
        if (ejesPrioritarios && ejesPrioritarios.length > 1) {
            setEjes(JSON.parse(ejesPrioritarios));
            setLocked(true);
            setLoading(false);
        } else {
            llamadaBBDDEjes(regionSeleccionada);
        }
    }, [regionSeleccionada]);

    useEffect(() => {}, [ejes]);

    const handleSave = () => {
        const fetchAxes = async () => {
            const token = sessionStorage.getItem('access_token');
            try {
                const res = await FetchConRefreshRetry(`${ApiTarget}/yearData/${Number(regionSeleccionada)}/${anioSeleccionada}/axes`, {
                    headers: {
                        method: 'POST',
                        Authorization: `Bearer ` + token,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await res.json();
                if (!res.ok) {
                    const errorInfo = gestionarErrorServidor(res, data);
                    console.log(errorInfo.mensaje);
                    return;
                }
                console.log(`Ejes prioritarios guardados: ${JSON.stringify(selected)}`);
            } catch (err: unknown) {
                const errorInfo = gestionarErrorServidor(err);
                console.log(errorInfo.mensaje);
                return;
            }
        };
        fetchAxes();

        setLocked(true);
        const ejesPrioritarios = { ...yearData };
        const ejesSeleccionados = yearData.plan.ejes.filter((eje) => selected.includes(eje.Id));

        ejesPrioritarios.plan.ejesPrioritarios = ejesSeleccionados;
        setYearData(ejesPrioritarios);
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
                    <div className="flex items-center space-x-2">
                        <PrintFecha date={fechaUltimoActualizadoBBDD} />
                        <Tippy content={t('Actualizar')}>
                            <button type="button" onClick={() => llamadaBBDDEjes(regionSeleccionada)}>
                                <IconRefresh />
                            </button>
                        </Tippy>
                    </div>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-x-3 gap-y-2 w-full">
                    {ejes &&
                        ejes.map((eje) => (
                            <li key={eje.Id} className={`flex items-center p-2 rounded transition ${selected.includes(eje.Id) ? 'bg-green-100' : ''}`}>
                                <input
                                    type="checkbox"
                                    className="form-checkbox h-5 w-5 text-green-600 accent-green-600"
                                    checked={selected.includes(eje.Id)}
                                    onChange={() => handleCheck(eje.Id)}
                                    disabled={locked}
                                    id={`checkbox-${eje.Id}`}
                                />
                                <label htmlFor={`checkbox-${eje.Id}`} className={`ml-3 cursor-pointer w-full ${selected.includes(eje.Id) ? 'text-green-700 font-semibold' : ''}`}>
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

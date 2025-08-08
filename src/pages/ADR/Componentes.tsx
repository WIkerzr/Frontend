import { useEffect, useState } from 'react';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import { useTranslation } from 'react-i18next';
import { formateaConCeroDelante, NewModal } from '../../components/Utils/utils';
import { NavLink } from 'react-router-dom';
import { DatosAccion } from '../../types/TipadoAccion';
import { useYear } from '../../contexts/DatosAnualContext';
import { useEstadosPorAnio } from '../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../contexts/RegionContext';
import IconEye from '../../components/Icon/IconEye';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import IconInfoTriangle from '../../components/Icon/IconInfoTriangle';
import { Servicios } from '../../types/GeneralTypes';

export const ModalAccion = () => {
    const { t, i18n } = useTranslation();
    const { yearData, AgregarAccion } = useYear();
    const { editarPlan } = useEstadosPorAnio();

    // const [accionesEje, setAccionesEje] = useState<DatosAccion[]>(yearData.plan.ejesPrioritarios[0].acciones);

    const [idEjeSeleccionado, setIdEjeSeleccionado] = useState(yearData.plan.ejesPrioritarios[0].id);
    const [nuevaAccion, setNuevaAccion] = useState('');
    const [nuevaLineaActuaccion, setNuevaLineaActuaccion] = useState('');
    const [plurianual, setNuevaPlurianual] = useState(false);

    const [inputError, setInputError] = useState(false);
    const [showModal, setShowModal] = useState(false);

    //Control de acciones totales
    const [accionesTotales, setAccionesTotales] = useState<number[]>([0, 0, 0]);

    useEffect(() => {
        const nuevasAccionesTotales = yearData.plan.ejesPrioritarios.map((eje) => eje.acciones.length);
        setAccionesTotales(nuevasAccionesTotales);
    }, [yearData]);

    useEffect(() => {
        if (idEjeSeleccionado === '') {
            setIdEjeSeleccionado(yearData.plan.ejesPrioritarios[0].id);
        }
    }, [idEjeSeleccionado, showModal]);

    function validarEstadoEje(
        index: number,
        accionesTotales: number[]
    ): {
        maxAccion: boolean;
        otroEjeVacio: boolean;
        limiteSiVacio: boolean;
        limitarEje: boolean;
        disabled: boolean;
    } {
        const maxAccion = accionesTotales[index] >= 5;
        if (yearData.plan.ejesPrioritarios.length === 1) {
            const otroEjeVacio = false;
            const limiteSiVacio = false;
            const limitarEje = false;
            const disabled = maxAccion;
            return { maxAccion, otroEjeVacio, limiteSiVacio, limitarEje, disabled };
        }
        const ejesVacios = accionesTotales.filter((n) => n === 0).length;
        const otroEjeVacio = accionesTotales.some((n, i) => i !== index && n === 0);
        const ejeVacio = accionesTotales.some((n, i) => i === index && n === 0);
        const limite = 5 - ejesVacios;
        const limiteSiVacio = accionesTotales.reduce((sum, n) => sum + n, 0) >= limite;
        const limitarEje = otroEjeVacio && !ejeVacio && limiteSiVacio;
        const disabled = maxAccion || limitarEje;

        return { maxAccion, otroEjeVacio, limiteSiVacio, limitarEje, disabled };
    }

    useEffect(() => {
        if (yearData.plan.ejesPrioritarios.length === 1) {
            return;
        }
        const index = yearData.plan.ejesPrioritarios.findIndex((eje) => eje.id === idEjeSeleccionado);
        const { disabled } = validarEstadoEje(index, accionesTotales);

        if (disabled) {
            const nuevoId = yearData.plan.ejesPrioritarios.find((_, i) => {
                const { disabled } = validarEstadoEje(i, accionesTotales);
                return !disabled;
            })?.id;

            if (nuevoId && nuevoId !== idEjeSeleccionado) {
                setIdEjeSeleccionado(nuevoId);
            }
        }
    }, [accionesTotales, yearData, idEjeSeleccionado, showModal]);

    const handleNuevaAccion = () => {
        if (!nuevaAccion.trim() || !nuevaLineaActuaccion.trim()) {
            setInputError(true);
            return;
        }

        AgregarAccion('Acciones', idEjeSeleccionado, nuevaAccion, nuevaLineaActuaccion, plurianual);

        //TODO LLamada al servidor con la nueva accion

        setIdEjeSeleccionado('');
        setNuevaAccion('');
        setNuevaLineaActuaccion('');
        setNuevaPlurianual(false);
        setInputError(false);
        setShowModal(false);
    };

    return (
        <>
            {editarPlan && accionesTotales.reduce((sum, n) => sum + n, 0) < 5 && (
                <div className="flex justify-center">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition" onClick={() => setShowModal(true)}>
                        {t('anadirAccion')}
                    </button>
                </div>
            )}
            <NewModal open={showModal} onClose={() => setShowModal(false)} title={t('newAccion')}>
                <div className="space-y-5">
                    <div>
                        <label className="block font-medium mb-1">{t('Ejes')}</label>
                        <select className="form-select text-gray-800 w-full" style={{ minWidth: 'calc(100% + 10px)' }} value={idEjeSeleccionado} onChange={(e) => setIdEjeSeleccionado(e.target.value)}>
                            {yearData.plan.ejesPrioritarios.map((eje, index) => {
                                const { maxAccion, limitarEje, disabled } = validarEstadoEje(index, accionesTotales);
                                const label = `${i18n.language === 'es' ? eje.nameEs : eje.nameEu}${maxAccion ? ` (${t('limiteAlcanzado')})` : limitarEje ? ` (${t('completaEjeVacio')})` : ''}`;
                                return (
                                    <option key={eje.id} value={eje.id} disabled={disabled}>
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium mb-1">{t('NombreAccion')}</label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded ${inputError && !nuevaAccion.trim() ? 'border-red-400' : ''}`}
                            value={nuevaAccion}
                            onChange={(e) => {
                                setNuevaAccion(e.target.value);
                                setInputError(false);
                            }}
                            placeholder={t('Introduce nombre acción')}
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">{t('LineaActuaccion')}</label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded ${inputError && !nuevaLineaActuaccion.trim() ? 'border-red-400' : ''}`}
                            value={nuevaLineaActuaccion}
                            onChange={(e) => {
                                setNuevaLineaActuaccion(e.target.value);
                                setInputError(false);
                            }}
                            placeholder={t('Introduce línea de actuación')}
                        />
                    </div>
                    <div className="flex">
                        <input
                            onChange={(e) => setNuevaPlurianual(e.target.checked)}
                            type="checkbox"
                            className="form-checkbox h-5 w-5 "
                            checked={plurianual}
                            //onChange={() => handleCheck(accion.id)}
                            //id={`checkbox-${accion.id}`}
                        />
                        <label>{t('plurianual')}</label>
                    </div>
                    {inputError && <div className="text-xs text-red-500 text-center">{t('rellenarAmbosCampos')}</div>}
                    <button onClick={handleNuevaAccion} className={`bg-primary text-white px-4 py-2 rounded hover:bg-green-700 w-full mt-2 transition}`}>
                        {t('guardar')}
                    </button>
                </div>
            </NewModal>
        </>
    );
};

export const ModalAccionAccesorias = () => {
    const { t, i18n } = useTranslation();
    const { yearData, AgregarAccion } = useYear();
    const { editarPlan } = useEstadosPorAnio();
    const listadoEjesFiltrado = yearData.plan.ejes.filter((eje) => !yearData.plan.ejesPrioritarios.some((prioritario) => prioritario.id === eje.id));

    const [idEjeSeleccionado, setIdEjeSeleccionado] = useState<string>(listadoEjesFiltrado[0].id);
    const [nuevaAccion, setNuevaAccion] = useState('');
    const [nuevaLineaActuaccion, setNuevaLineaActuaccion] = useState('');
    const [plurianual, setNuevaPlurianual] = useState(false);

    const [inputError, setInputError] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const handleNuevaAccion = () => {
        if (!nuevaAccion.trim()) {
            setInputError(true);
            return;
        }

        AgregarAccion('AccionesAccesorias', idEjeSeleccionado, nuevaAccion, nuevaLineaActuaccion, plurianual);

        //TODO LLamada al servidor con la nueva accionAccesorias

        setIdEjeSeleccionado('');
        setNuevaAccion('');
        setNuevaLineaActuaccion('');
        setNuevaPlurianual(false);
        setInputError(false);
        setShowModal(false);
    };

    return (
        <>
            {editarPlan && (
                <div className="flex justify-center">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition" onClick={() => setShowModal(true)}>
                        {t('anadirAccion')}
                    </button>
                </div>
            )}
            <NewModal open={showModal} onClose={() => setShowModal(false)} title={t('newAccion')}>
                <div className="space-y-5">
                    <div>
                        <label className="block font-medium mb-1">{t('Ejes')}</label>
                        <select className="form-select text-gray-800 w-full" style={{ minWidth: 'calc(100% + 10px)' }} value={idEjeSeleccionado} onChange={(e) => setIdEjeSeleccionado(e.target.value)}>
                            {listadoEjesFiltrado.map((eje) => {
                                const label = `${i18n.language === 'es' ? eje.nameEs : eje.nameEu}`;
                                return (
                                    <option key={eje.id} value={eje.id}>
                                        {label}
                                    </option>
                                );
                            })}
                        </select>
                    </div>
                    <div>
                        <label className="block font-medium mb-1">{t('NombreAccion')}</label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded ${inputError && !nuevaAccion.trim() ? 'border-red-400' : ''}`}
                            value={nuevaAccion}
                            onChange={(e) => {
                                setNuevaAccion(e.target.value);
                                setInputError(false);
                            }}
                            placeholder={t('Introduce nombre acción')}
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">{t('LineaActuaccion')}</label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded`}
                            value={nuevaLineaActuaccion}
                            onChange={(e) => {
                                setNuevaLineaActuaccion(e.target.value);
                                setInputError(false);
                            }}
                            placeholder={t('Introduce línea de actuación')}
                        />
                    </div>
                    <div className="flex">
                        <input
                            onChange={(e) => setNuevaPlurianual(e.target.checked)}
                            type="checkbox"
                            className="form-checkbox h-5 w-5 "
                            checked={plurianual}
                            //onChange={() => handleCheck(accion.id)}
                            //id={`checkbox-${accion.id}`}
                        />
                        <label>{t('plurianual')}</label>
                    </div>
                    {inputError && <div className="text-xs text-red-500 text-center">{t('rellenarCampo')}</div>}
                    <button onClick={handleNuevaAccion} className={`bg-primary text-white px-4 py-2 rounded hover:bg-green-700 w-full mt-2 transition}`}>
                        {t('guardar')}
                    </button>
                </div>
            </NewModal>
        </>
    );
};

interface ListadoAccionesProps {
    eje: string;
    number: number;
    idEje: string;
}
export const ListadoAcciones = ({ eje, number, idEje }: ListadoAccionesProps) => {
    const { yearData, setYearData, SeleccionEditarAccion } = useYear();
    const { regionSeleccionada } = useRegionContext();
    const { editarPlan, editarMemoria } = useEstadosPorAnio();

    const [acciones, setAcciones] = useState<DatosAccion[]>([]);

    useEffect(() => {
        setAcciones(yearData.plan.ejesPrioritarios[number].acciones);
    }, [yearData]);

    const { t } = useTranslation();

    const handleDelete = (id: string) => {
        const updatedYearData = {
            ...yearData,
            plan: {
                ...yearData.plan,
                ejesPrioritarios: yearData.plan.ejesPrioritarios.map((eje, index) => {
                    if (index === number) {
                        return {
                            ...eje,
                            acciones: eje.acciones.filter((accion) => accion.id !== id),
                        };
                    }
                    return eje;
                }),
            },
        };
        setYearData(updatedYearData);
        setAcciones((prev) => prev.filter((a) => a.id !== id));
    };

    const mostrarInput = acciones.length < 5;
    const accionesMostradas = mostrarInput ? acciones.slice(0, 5 - 1) : acciones.slice(0, 5);

    return (
        <div className="rounded-lg space-y-5  p-2 border border-gray-200 bg-white max-w-lg w-full mx-auto shadow-sm">
            <span className="text-xl text-center font-semibold text-gray-700 tracking-wide block mb-2">{eje}</span>

            <div className="space-y-4">
                {accionesMostradas.map((accion) => {
                    let editable = editarPlan || editarMemoria;
                    let colorAccion = 'bg-white';
                    if (accion.accionCompartida && Array.isArray(accion.accionCompartida.regiones)) {
                        const regionLider = formateaConCeroDelante(`${accion.accionCompartida.regionLider.RegionId}`) === regionSeleccionada;
                        if (regionLider) {
                            colorAccion = 'bg-teal-100';
                            editable = true;
                        }
                        const regionCooperando = accion.accionCompartida.regiones.find((r) => formateaConCeroDelante(`${r.RegionId}`) === regionSeleccionada);
                        if (regionCooperando) {
                            colorAccion = 'bg-gray-300';
                            editable = false;
                        }
                    }

                    return (
                        <div key={accion.id} className={`${colorAccion} border border-gray-200 p-6 shadow-sm rounded-lg hover:shadow-md transition-shadow flex flex-col`}>
                            <span className="text-base">{accion.accion}</span>
                            <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                {t('LineaActuaccion')}: {accion.lineaActuaccion}
                            </span>
                            <div className="flex gap-2 justify-end mt-2">
                                <NavLink to="/adr/acciones/editando" className="group">
                                    <button className="hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-1.5 rounded transition" onClick={() => SeleccionEditarAccion(idEje, accion.id)}>
                                        {editable ? <IconPencil /> : <IconEye />}
                                    </button>
                                </NavLink>
                                <div>
                                    {editable === true && (
                                        <button
                                            onClick={() => handleDelete(accion.id)}
                                            aria-label={`Eliminar acción ${accion.id}`}
                                            className="hover:bg-blue-50 text-gray-500 hover:text-red-600 p-1.5 rounded transition"
                                        >
                                            <IconTrash />
                                        </button>
                                    )}
                                </div>
                            </div>
                            <MostrarAvisoCamposAcciones datos={accion} navegar="/adr/acciones/editando" />
                        </div>
                    );
                })}
                {accionesMostradas.length === 0 && <MostrarAvisoCamposAcciones navegar="/adr/acciones/editando" />}
            </div>
        </div>
    );
};
interface ResultadoValidacionAcciones {
    faltanIndicadoresPlan: boolean;
    faltanIndicadoresMemoria: boolean;
    faltanCamposPlan: boolean;
    faltanCamposMemoria: boolean;
}

export function validarCamposObligatoriosAccion(datos: DatosAccion): ResultadoValidacionAcciones {
    const faltanIndicadoresPlan =
        (datos.indicadorAccion?.indicadoreRealizacion.some((item) => !item.descripcion || !item.metaAnual?.total || !item.metaFinal?.total) ?? false) ||
        (datos.indicadorAccion?.indicadoreResultado.some((item) => !item.descripcion || !item.metaAnual?.total || !item.metaFinal?.total) ?? false) ||
        datos.indicadorAccion?.indicadoreRealizacion.length === 0 ||
        datos.indicadorAccion?.indicadoreResultado.length === 0;

    const faltanIndicadoresMemoria =
        (datos.indicadorAccion?.indicadoreRealizacion.some((item) => !item.ejecutado?.total) ?? false) || (datos.indicadorAccion?.indicadoreResultado.some((item) => !item.ejecutado?.total) ?? false);

    const faltanCamposPlan =
        !datos.datosPlan?.ejecutora ||
        !datos.datosPlan?.implicadas ||
        !datos.datosPlan?.comarcal ||
        !datos.datosPlan?.supracomarcal ||
        (datos.plurianual === true && !datos.datosPlan?.rangoAnios) ||
        !datos.datosPlan?.oAccion ||
        !datos.datosPlan?.dAccion;

    const faltanCamposMemoria =
        !datos.datosMemoria?.sActual ||
        !datos.datosMemoria?.oAccion ||
        !datos.datosMemoria?.dAccionAvances ||
        !datos.datosMemoria?.presupuestoEjecutado?.cuantia ||
        datos.datosMemoria?.presupuestoEjecutado?.fuenteDeFinanciacion.length === 0 ||
        !datos.datosMemoria?.ejecucionPresupuestaria?.previsto ||
        !datos.datosMemoria?.ejecucionPresupuestaria?.ejecutado ||
        !datos.datosMemoria?.ejecucionPresupuestaria?.porcentaje;

    return { faltanIndicadoresPlan, faltanIndicadoresMemoria, faltanCamposPlan, faltanCamposMemoria };
}

interface ResultadoValidacionServicios {
    faltanIndicadoresPlan: boolean;
    faltanIndicadoresMemoria: boolean;
    faltanCamposPlan: boolean;
    faltanCamposMemoria: boolean;
}

export function validarCamposObligatoriosServicio(datos: Servicios): ResultadoValidacionServicios {
    const faltanIndicadoresPlan = datos.indicadores.some((item) => !item.indicador || !item.previsto?.valor) || datos.indicadores.length === 0;

    const faltanIndicadoresMemoria = !datos.indicadores[0].alcanzado?.valor;

    const faltanCamposPlan = !datos.nombre || !datos.descripcion;

    const faltanCamposMemoria = !datos.dSeguimiento || !datos.valFinal;

    return { faltanIndicadoresPlan, faltanIndicadoresMemoria, faltanCamposPlan, faltanCamposMemoria };
}
interface MostrarAvisoCamposAccionesProps {
    datos?: DatosAccion;
    plurianual?: boolean;
    texto?: boolean;
    navegar: string;
}

export const MostrarAvisoCamposAcciones: React.FC<MostrarAvisoCamposAccionesProps> = ({ datos, texto = true, navegar }) => {
    const { t } = useTranslation();
    const { editarPlan } = useEstadosPorAnio();

    if (!datos) {
        return (
            <div className="bg-warning text-black text-sm rounded px-3 py-2 mb-4 flex items-center gap-2">
                <>
                    <IconInfoCircle />
                    <span>
                        <strong>{t('aviso')}:</strong> {t('accionMinimaEnEjePrioritario')}.
                    </span>
                </>
            </div>
        );
    }

    const { faltanIndicadoresPlan, faltanIndicadoresMemoria, faltanCamposPlan, faltanCamposMemoria } = validarCamposObligatoriosAccion(datos);

    if (!texto) {
        return null;
    }

    if (editarPlan) {
        if (!faltanCamposPlan && !faltanIndicadoresPlan) {
            return null;
        }
    } else {
        if (!faltanCamposMemoria && !faltanIndicadoresMemoria) {
            return null;
        }
    }

    return (
        <NavLink to={navegar} className="group">
            <div className="bg-warning text-black text-sm rounded px-3 py-2 mb-4 flex items-center gap-2">
                {faltanCamposPlan || (!editarPlan && faltanCamposMemoria) ? (
                    <>
                        <IconInfoCircle />
                        <span>
                            <strong>{t('aviso')}:</strong> {t('camposObligatorios', { zona: editarPlan ? t('plan') : t('memoria') })}.
                        </span>
                    </>
                ) : (
                    <>
                        <IconInfoTriangle />
                        <span>
                            <strong>{t('aviso')}:</strong> {t('indicadoresOgligatorios', { zona: editarPlan ? t('plan') : t('memoria') })}.
                        </span>
                    </>
                )}
            </div>
        </NavLink>
    );
};

interface MostrarAvisoCamposServiciosProps {
    datos: Servicios;
    texto?: boolean;
}

export const MostrarAvisoCamposServicios: React.FC<MostrarAvisoCamposServiciosProps> = ({ datos, texto = true }) => {
    const { t } = useTranslation();
    const { editarPlan } = useEstadosPorAnio();

    const { faltanIndicadoresPlan, faltanIndicadoresMemoria, faltanCamposPlan, faltanCamposMemoria } = validarCamposObligatoriosServicio(datos);

    if (!texto) {
        return null;
    }

    if (editarPlan) {
        if (!faltanCamposPlan && !faltanIndicadoresPlan) {
            return null;
        }
    } else {
        if (!faltanCamposMemoria && !faltanIndicadoresMemoria) {
            return null;
        }
    }

    return (
        <NavLink to="/adr/servicios/editando" className="group">
            <div className="bg-warning text-black text-sm rounded px-3 py-2 mb-4 flex items-center gap-2">
                {faltanCamposPlan || (!editarPlan && faltanCamposMemoria) ? (
                    <>
                        <IconInfoCircle />
                        <span>
                            <strong>{t('aviso')}:</strong> {t('camposObligatorios', { zona: editarPlan ? t('plan') : t('memoria') })}.
                        </span>
                    </>
                ) : (
                    <>
                        <IconInfoTriangle />
                        <span>
                            <strong>{t('aviso')}:</strong> {t('indicadoresOgligatorios', { zona: editarPlan ? t('plan') : t('memoria') })}.
                        </span>
                    </>
                )}
            </div>
        </NavLink>
    );
};

interface ErrorFullScreenProps {
    mensaje: string;
    irA: string;
}

export const ErrorFullScreen = ({ mensaje, irA }: ErrorFullScreenProps) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-50 dark:bg-gray-900">
            <div className="text-center p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                <span className="block text-lg font-semibold text-gray-800 dark:text-white mb-4">{mensaje}</span>
                <NavLink to={irA} className="inline-block mt-2 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition">
                    {t('volver')}
                </NavLink>
            </div>
        </div>
    );
};

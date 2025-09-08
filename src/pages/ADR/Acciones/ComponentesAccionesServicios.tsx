/* eslint-disable no-unused-vars */
import { useEffect, useRef, useState } from 'react';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrash from '../../../components/Icon/IconTrash';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { DatosAccion } from '../../../types/TipadoAccion';
import { TiposAccion, useYear } from '../../../contexts/DatosAnualContext';
import IconEye from '../../../components/Icon/IconEye';
import IconInfoCircle from '../../../components/Icon/IconInfoCircle';
import IconInfoTriangle from '../../../components/Icon/IconInfoTriangle';
import { EstadosLoading, Servicios } from '../../../types/GeneralTypes';
import { NewModal, PrintFechaTexto, formateaConCeroDelante, obtenerFechaLlamada } from '../../../components/Utils/utils';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../../contexts/RegionContext';
import MyEditableDropdown from '../../../components/Utils/inputs';
import { LlamadaBBDDEjesRegion } from '../../../components/Utils/data/dataEjes';
import { Loading } from '../../../components/Utils/animations';
import { Ejes, EjesBBDD } from '../../../types/tipadoPlan';
import React from 'react';
import Tippy from '@tippyjs/react';
import IconRefresh from '../../../components/Icon/IconRefresh';
import { LoadingOverlay } from '../../Configuracion/Users/componentes';

interface ModalAccionProps {
    acciones: TiposAccion;
}

export const ModalAccion: React.FC<ModalAccionProps> = ({ acciones }) => {
    const { t, i18n } = useTranslation();
    const { yearData, AgregarAccion } = useYear();
    const { editarPlan } = useEstadosPorAnio();

    const ejesPlan = acciones === 'Acciones' ? yearData.plan.ejesPrioritarios : yearData.plan.ejes;

    const { regionSeleccionada } = useRegionContext();
    const [idEjeSeleccionado, setIdEjeSeleccionado] = useState(ejesPlan[0].Id);
    const [nuevaAccion, setNuevaAccion] = useState('');
    const [nuevaLineaActuaccion, setNuevaLineaActuaccion] = useState('');
    const [plurianual, setNuevaPlurianual] = useState(false);

    const [inputError, setInputError] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [accionesTotales, setAccionesTotales] = useState<number[]>([0, 0, 0]);

    useEffect(() => {
        const nuevasAccionesTotales = ejesPlan.map((eje) => eje.acciones.length);
        setAccionesTotales(nuevasAccionesTotales);
    }, [yearData]);

    useEffect(() => {
        if (idEjeSeleccionado === '') {
            setIdEjeSeleccionado(ejesPlan[0].Id);
        }
        if (showModal && acciones === 'Acciones') {
            const ejesRegion = localStorage.getItem('ejesRegion');
            if (!ejesRegion) {
                LlamadaBBDDEjesRegion(regionSeleccionada, t, i18n);
            }
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
        if (ejesPlan.length === 1) {
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
        if (ejesPlan.length === 1) {
            return;
        }
        const index = ejesPlan.findIndex((eje) => eje.Id === idEjeSeleccionado);
        const { disabled } = validarEstadoEje(index, accionesTotales);

        if (disabled) {
            const nuevoId = ejesPlan.find((_, i) => {
                const { disabled } = validarEstadoEje(i, accionesTotales);
                return !disabled;
            })?.Id;

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

        AgregarAccion(acciones, idEjeSeleccionado, nuevaAccion, nuevaLineaActuaccion, plurianual);

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
                            {ejesPlan.map((eje, index) => {
                                const { maxAccion, limitarEje, disabled } = validarEstadoEje(index, accionesTotales);
                                const label = `${i18n.language === 'es' ? eje.NameEs : eje.NameEu}${maxAccion ? ` (${t('limiteAlcanzado')})` : limitarEje ? ` (${t('completaEjeVacio')})` : ''}`;
                                return (
                                    <option key={eje.Id} value={eje.Id} disabled={disabled}>
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
                        <div style={{ position: 'relative', minHeight: 40 }}>
                            <DropdownLineaActuacion setNuevaLineaActuaccion={setNuevaLineaActuaccion} idEjeSeleccionado={idEjeSeleccionado} ejesPlan={ejesPlan} />
                        </div>
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

interface ListadoAccionesProps {
    eje: string;
    number: number;
    idEje: string;
}
export const ListadoAcciones = ({ eje, number, idEje }: ListadoAccionesProps) => {
    const navigate = useNavigate();
    const { yearData, EliminarAccion, SeleccionEditarAccion, loadingYearData } = useYear();
    const { regionSeleccionada } = useRegionContext();
    const { editarPlan, editarMemoria } = useEstadosPorAnio();
    const { t, i18n } = useTranslation();

    const [acciones, setAcciones] = useState<DatosAccion[]>([]);
    const prevAccionesRef = useRef<DatosAccion[]>([]);
    const [accionNueva, setAccionNueva] = useState<string>('');
    const primeraCargaRef = useRef(true);
    const [loading, setLoading] = useState<EstadosLoading>('idle');

    useEffect(() => {
        const nuevasAcciones = yearData.plan.ejesPrioritarios[number].acciones;

        if (primeraCargaRef.current) {
            setAcciones(nuevasAcciones);
            prevAccionesRef.current = nuevasAcciones;
            primeraCargaRef.current = false;
            return;
        }

        if (prevAccionesRef.current.length < nuevasAcciones.length) {
            const nuevaFila = nuevasAcciones.find((a) => !prevAccionesRef.current.some((prev) => prev.id === a.id));
            if (nuevaFila) {
                setAccionNueva(nuevaFila.id);
            }
        }

        setAcciones(nuevasAcciones);
        prevAccionesRef.current = nuevasAcciones;
    }, [yearData]);

    useEffect(() => {
        if (loading === 'success') {
            navigate('/adr/acciones/editando');
        }
    }, [loading]);

    if (loadingYearData) return <Loading />;

    const handleDelete = (id: string) => {
        const confirmar = window.confirm(t('confirmacionEliminarAccion'));
        if (!confirmar) return;
        EliminarAccion('Acciones', idEje, id);
    };

    const handleEdit = async (id: string) => {
        setLoading('loading');
        const ejesRegion = localStorage.getItem('ejesRegion');

        if (!ejesRegion) {
            await LlamadaBBDDEjesRegion(regionSeleccionada, t, i18n);
        }
        await SeleccionEditarAccion(idEje, id);

        setLoading('success');
    };

    const mostrarInput = acciones.length < 5;
    const accionesMostradas = mostrarInput ? acciones.slice(0, 5 - 1) : acciones.slice(0, 5);

    return (
        <div className="rounded-lg space-y-5  p-2 border border-gray-200 bg-white max-w-lg w-full mx-auto shadow-sm">
            <span className="min-h-[90px] text-xl text-center font-semibold text-gray-700 tracking-wide block mb-2">{eje}</span>
            <LoadingOverlay isLoading={loading} />
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
                    if (accion.id === accionNueva) {
                        colorAccion = 'bg-green-100';
                    }

                    return (
                        <div key={accion.id} className={`${colorAccion} border border-gray-200 p-6 shadow-sm rounded-lg hover:shadow-md transition-shadow flex flex-col`}>
                            <span className="text-base">{accion.accion}</span>
                            <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                {t('LineaActuaccion')}: {accion.lineaActuaccion}
                            </span>
                            <div className="flex gap-2 justify-end mt-2">
                                <button
                                    className="hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-1.5 rounded transition"
                                    onClick={() => {
                                        handleEdit(`${accion.id}`);
                                    }}
                                >
                                    {editable ? <IconPencil /> : <IconEye />}
                                </button>
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
                            <MostrarAvisoCamposAcciones datos={accion} />
                        </div>
                    );
                })}
                {accionesMostradas.length === 0 && <MostrarAvisoCamposAcciones />}
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
        //!datos.datosMemoria?.dAccionAvances ||
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
}

export const MostrarAvisoCamposAcciones: React.FC<MostrarAvisoCamposAccionesProps> = ({ datos, texto = true }) => {
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
    if (!datos.camposFaltantes) {
        return <></>;
    }

    const elementos = datos.camposFaltantes.split(',');

    const faltanCamposPlan = elementos.some((e) => e.startsWith('P'));
    const faltanCamposMemoria = elementos.some((e) => e.startsWith('M'));

    const faltanIndicadores = elementos.some((e) => e.startsWith('Indicadores'));

    if (!texto) {
        return null;
    }

    if (editarPlan) {
        if (!faltanCamposPlan && !faltanIndicadores) {
            return null;
        }
    } else {
        if (!faltanCamposMemoria && !faltanIndicadores) {
            return null;
        }
    }

    return (
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
                        <strong>{t('aviso')}:</strong> {t('indicadoresOgligatorios')}.
                    </span>
                </>
            )}
        </div>
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

interface DropdownLineaActuacionProps {
    setNuevaLineaActuaccion: (val: string) => void;
    idEjeSeleccionado: string | undefined;
    lineaActuaccion?: string;
    ejesPlan: Ejes[];
}

export const DropdownLineaActuacion = ({ setNuevaLineaActuaccion, idEjeSeleccionado, lineaActuaccion, ejesPlan }: DropdownLineaActuacionProps) => {
    const { regionSeleccionada } = useRegionContext();
    const [loading, setLoading] = useState<boolean>(false);
    const { t, i18n } = useTranslation();
    const [ejes, setEjes] = useState<EjesBBDD[]>();
    const [lineaActuaciones, setLineaActuaciones] = useState<string[]>([]);
    const [yaCargado, setYaCargado] = useState<boolean>(false);
    const [textoFecha, setTextoFecha] = useState<string>('');

    const [fechaUltimoActualizadoBBDD, setFechaUltimoActualizadoBBDD] = useState<Date>(() => {
        const fechaStr = obtenerFechaLlamada('users');
        if (fechaStr) {
            const ejesRegion = localStorage.getItem('ejesRegion');
            if (!ejesRegion) return new Date();

            setEjes(JSON.parse(ejesRegion));
            setYaCargado(true);
        }
        return fechaStr ? new Date(fechaStr) : new Date();
    });

    const cargarEjes = () => {
        if (yaCargado) return;
        LlamadaBBDDEjesRegion(regionSeleccionada, t, i18n, setLoading, setEjes, setFechaUltimoActualizadoBBDD);
        setYaCargado(true);
    };

    useEffect(() => {
        //TODO Temporal
        if (ejes && idEjeSeleccionado && idEjeSeleccionado != '') {
            const index = ejesPlan.findIndex((eje) => eje.Id === idEjeSeleccionado);
            const datosEje = ejesPlan[index];
            let lineaActuacion = ejes.find((e) => `${e.NameEs}` === `${datosEje.NameEs}`)?.LineasActuaccion;
            if (!lineaActuacion) {
                lineaActuacion = ejes.find((e) => `${e.NameEu}` === `${datosEje.NameEu}`)?.LineasActuaccion;
            }
            if (lineaActuacion) {
                setLineaActuaciones(lineaActuacion.map((la) => la.Title));
            } else {
                setLineaActuaciones([]);
            }
        }
        //TODO Temporal
        // console.log(ejes.find((e) => `${e.EjeId}` === `${idEjeSeleccionado}`));
        // console.log(ejes);
        // console.log(idEjeSeleccionado);

        // const ejePrioritario = ejesPlan.find((eje) => eje.Id === idEjeSeleccionado);
        // if (ejePrioritario && ejePrioritario.LineasActuaccion && ejePrioritario.LineasActuaccion.length > 0) {
        //     const lineasActuaciones = ejesPlan[0].LineasActuaccion;
        //     if (lineasActuaciones) {
        //         setLineaActuaciones(lineasActuaciones.map((la) => la.Title));
        //     }
        // }
    }, [idEjeSeleccionado, ejes]);

    useEffect(() => {
        setTextoFecha(`${t('Actualizar')} ${t('LineasdeActuaccion')} ${PrintFechaTexto({ date: fechaUltimoActualizadoBBDD, idioma: i18n })}`);
    }, [fechaUltimoActualizadoBBDD, t]);

    return (
        <div style={{ position: 'relative', minHeight: 40 }}>
            {loading ? (
                <Loading />
            ) : (
                <div className="flex items-center w-full">
                    <div className="flex-1">
                        <MyEditableDropdown options={lineaActuaciones} setOpcion={setNuevaLineaActuaccion} placeholder={t('DropdownEditable')} value={lineaActuaccion} />
                    </div>

                    <Tippy content={textoFecha}>
                        <button type="button" onClick={() => cargarEjes()} className="p-2">
                            <IconRefresh />
                        </button>
                    </Tippy>
                    <span className="text-sm text-gray-600">{textoFecha.slice(-5)}</span>
                </div>
            )}
        </div>
    );
};

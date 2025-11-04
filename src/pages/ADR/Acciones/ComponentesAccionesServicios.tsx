/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { NewModal, PrintFechaTexto, TextoSegunIdioma, formateaConCeroDelante, obtenerFechaLlamada } from '../../../components/Utils/utils';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../../contexts/RegionContext';
import MyEditableDropdown, { SelectorEje } from '../../../components/Utils/inputs';
import { LlamadaBBDDEjesRegion, ValidarEjesRegion } from '../../../components/Utils/data/dataEjes';
import { Loading } from '../../../components/Utils/animations';
import { Ejes, EjesBBDD } from '../../../types/tipadoPlan';
import React from 'react';
import Tippy from '@tippyjs/react';
import IconRefresh from '../../../components/Icon/IconRefresh';
import { LoadingOverlayPersonalizada } from '../../Configuracion/Users/componentes';
import { EjesBBDDToEjes, EjesToEjesBBDD } from '../EjesHelpers';
import { VerificadorIndicadores, VerificarAccionFinal } from './EditarAccion/EditarAccionComponent';

interface ModalAccionProps {
    acciones: TiposAccion;
    numAcciones?: number[];
}

export const ModalAccion: React.FC<ModalAccionProps> = ({ acciones, numAcciones }) => {
    const { t, i18n } = useTranslation();
    const { yearData, AgregarAccion } = useYear();
    const { editarPlan } = useEstadosPorAnio();

    const [ejesPlan, setEjesPlan] = useState<EjesBBDD[]>([]);

    const { regionSeleccionada } = useRegionContext();
    const [idEjeSeleccionado, setIdEjeSeleccionado] = useState('');
    const [nuevaAccion, setNuevaAccion] = useState('');
    const [nuevaLineaActuaccion, setNuevaLineaActuaccion] = useState('');
    const [plurianual, setNuevaPlurianual] = useState(false);

    const [inputError, setInputError] = useState(false);
    const [showBTNModal, setShowBTNModal] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [bloqueo, setBloqueo] = useState<boolean[]>([]);
    const [bloqueoMensaje, setBloqueoMensaje] = useState<string[]>([]);

    const isFetchingRef = useRef(false);

    useEffect(() => {
        if (!loading && ejesPlan.length === 0) {
            FetchEjesPlan({
                regionSeleccionada,
                acciones,
                t,
                i18n,
                setErrorMessage,
                setSuccessMessage,
                setLoading,
                setEjesPlan,
                isFetchingRef,
            });
        }
    }, [yearData, loading]);

    useEffect(() => {
        if (ejesPlan.length === 0) {
            return;
        }
        if (acciones === 'Acciones' && ejesPlan.length != yearData.plan.ejesPrioritarios.length) {
            const prioritarios: EjesBBDD[] = EjesToEjesBBDD(yearData.plan.ejesPrioritarios);

            const ejesPrioritariosConLineas: EjesBBDD[] = prioritarios.map((prioritario) => {
                const match = ejesPlan.find((e) => e.NameEs === prioritario.NameEs);

                return {
                    ...prioritario,
                    LineasActuaccion: match?.LineasActuaccion ?? [],
                };
            });
            setEjesPlan(ejesPrioritariosConLineas);

            return;
        }
        setIdEjeSeleccionado(ejesPlan[0].EjeId);
    }, [ejesPlan]);

    useEffect(() => {
        if (ejesPlan.length === 0) {
            return;
        }
        if (idEjeSeleccionado === '') {
            setIdEjeSeleccionado(ejesPlan[0].EjeId);
        }
    }, [idEjeSeleccionado, showModal]);

    function calcularBloqueos(accionesPorEje: number[]): boolean[] {
        const indicesCero = accionesPorEje.map((valor, index) => (valor === 0 ? index : -1)).filter((index) => index !== -1);
        const suma = accionesPorEje.reduce((a, b) => a + b, 0);
        if (suma === 5) {
            return accionesPorEje.map(() => true);
        }
        if (suma === 4 && indicesCero.length === 1) {
            return accionesPorEje.map((_, i) => i !== indicesCero[0]);
        }
        if (suma === 3 && indicesCero.length === 2) {
            return accionesPorEje.map((_, i) => i !== indicesCero[0] && i !== indicesCero[1]);
        }
        return accionesPorEje.map(() => false);
    }

    //Filtro en acciones accesorias por los ejes primarios
    // useEffect(() => {
    //     if (acciones != 'Acciones' && ejesPlan.length > 0) {
    //         const namesPrioritarios: string[] = yearData.plan.ejesPrioritarios.map((eje: Ejes) => eje.NameEs);
    //         const nuevoDropdown = ejesPlan.filter((eje: EjesBBDD) => !namesPrioritarios.includes(`${eje.NameEs}`));
    //         if (nuevoDropdown.length != ejesPlan.length) {
    //             setEjesPlan(nuevoDropdown);
    //         }
    //     }
    // }, [ejesPlan]);

    //limites Acciones
    useEffect(() => {
        if (acciones === 'AccionesAccesorias') {
            return;
        }
        if (ejesPlan.length === 0) {
            return;
        }
        const accionesPorEje: number[] = Array.from({ length: yearData.plan.ejesPrioritarios.length }, (_, i) => yearData.plan.ejesPrioritarios[i].acciones.length);
        const bloqueos = calcularBloqueos(accionesPorEje);
        setBloqueo(bloqueos);
        const mensaje: string[] = [];
        for (let index = 0; index < accionesPorEje.length; index++) {
            if (accionesPorEje[index] === 0) {
                // mensaje.push(` (${t('completaEjeVacio')})`);
                mensaje.push(``);
            } else if (bloqueo[index] === false) {
                mensaje.push('');
            } else {
                mensaje.push(` (${t('limiteAlcanzado')})`);
            }
        }
        setBloqueoMensaje(mensaje);
        if (bloqueos.every((v) => v === true)) {
            return;
        }
        for (let index = 0; index < bloqueos.length; index++) {
            if (bloqueos[index] === true) {
                setIdEjeSeleccionado(ejesPlan[index + 1].EjeId);
            } else if (bloqueos[index] === false) {
                break;
            }
        }
    }, [ejesPlan, idEjeSeleccionado, showModal]);

    useEffect(() => {
        if (editarPlan && acciones === 'Acciones' ? numAcciones!.reduce((sum, n) => sum + n, 0) < 5 : true) {
            setShowBTNModal(true);
        } else {
            setShowBTNModal(false);
        }
    }, [yearData]);

    const handleNuevaAccion = () => {
        if (acciones == 'Acciones' ? !nuevaAccion.trim() || !nuevaLineaActuaccion.trim() : !nuevaAccion.trim()) {
            setInputError(true);
            return;
        }

        AgregarAccion(acciones, `${idEjeSeleccionado}`, nuevaAccion, nuevaLineaActuaccion, plurianual);

        setIdEjeSeleccionado('');
        setNuevaAccion('');
        setNuevaLineaActuaccion('');
        setNuevaPlurianual(false);
        setInputError(false);
        setShowModal(false);
    };

    if (ejesPlan.length === 0) {
        return <Loading />;
    }
    return (
        <>
            <LoadingOverlayPersonalizada
                isLoading={loading}
                enModal={true}
                message={{
                    successMessage,
                    setSuccessMessage,
                    errorMessage,
                    setErrorMessage,
                }}
            />

            {showBTNModal && (
                <div className="flex justify-center">
                    <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition" onClick={() => setShowModal(true)}>
                        {t('anadirAccion')}
                    </button>
                </div>
            )}
            <NewModal open={showModal} onClose={() => setShowModal(false)} title={t('newAccion')}>
                <div className="space-y-5">
                    <SelectorEje
                        idEjeSeleccionado={idEjeSeleccionado}
                        setIdEjeSeleccionado={setIdEjeSeleccionado}
                        ejesPlan={ejesPlan}
                        acciones={acciones}
                        bloqueo={bloqueo}
                        bloqueoMensaje={bloqueoMensaje}
                    />
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
                            <DropdownLineaActuaccion
                                setNuevaLineaActuaccion={setNuevaLineaActuaccion}
                                idEjeSeleccionado={`${idEjeSeleccionado}`}
                                ejesPlan={EjesBBDDToEjes(ejesPlan)}
                                tipoAccion={acciones}
                            />
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
    const { yearData, EliminarAccion, datosEditandoAccion, SeleccionVaciarEditarAccion, SeleccionEditarAccion, setIdEjeEditado, setDatosEditandoAccion, loadingYearData } = useYear();
    const { regionSeleccionada } = useRegionContext();
    const { editarPlan, editarMemoria } = useEstadosPorAnio();
    const { t, i18n } = useTranslation();

    const [acciones, setAcciones] = useState<DatosAccion[]>([]);
    const prevAccionesRef = useRef<DatosAccion[]>([]);
    const [accionNueva, setAccionNueva] = useState<string>('');
    const primeraCargaRef = useRef(true);
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [navigated, setNavigated] = useState<boolean>(false);

    useEffect(() => {
        SeleccionVaciarEditarAccion();
        setNavigated(true);
    }, []);

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

    const hasNavigated = useRef(false);

    useEffect(() => {
        // Solo navega si datosEditandoAccion.id no es 0
        if (navigated && !hasNavigated.current && datosEditandoAccion && datosEditandoAccion.id !== '0') {
            navigate('/adr/acciones/editando', {
                state: {
                    tipo: 'acciones',
                    ejeId: datosEditandoAccion.ejeId,
                    nombreEjeES: datosEditandoAccion.ejeEs,
                    nombreEjeEU: datosEditandoAccion.ejeEu,
                },
            });
            hasNavigated.current = true;
        }
    }, [datosEditandoAccion, navigate]);

    const handleDelete = (id: string) => {
        const confirmar = window.confirm(t('confirmacionEliminarAccion'));
        if (!confirmar) return;
        EliminarAccion('Acciones', idEje, id);
    };

    const handleEdit = async (accion: DatosAccion) => {
        let hacerLlamada = true;
        const dataYearLocal = JSON.parse(sessionStorage.getItem('DataYear') || '{}');
        if (dataYearLocal) {
            const eje = dataYearLocal.plan.ejesPrioritarios.find((e: Ejes) => e.Id === idEje);
            const accionDelEje: DatosAccion = eje.acciones.find((a: DatosAccion) => `${a.id}` === `${accion.id}`);
            if (accionDelEje.datosPlan) {
                hacerLlamada = false;
                setIdEjeEditado(idEje);
                setDatosEditandoAccion(accionDelEje);
            }
        }
        if (hacerLlamada) {
            setLoading(true);
            const ejes = JSON.parse(sessionStorage.getItem('ejesRegion') || '{}');
            const ejesRegion = ejes.ejesEstrategicos;
            if (!ejesRegion) {
                await LlamadaBBDDEjesRegion(regionSeleccionada, t, i18n, { setErrorMessage, setSuccessMessage });
            }
            await SeleccionEditarAccion(idEje, 'accion', accion.id, { setErrorMessage, setSuccessMessage }, setLoading);
        }
    };

    const mostrarInput = acciones.length < 5;
    const accionesMostradas = mostrarInput ? acciones.slice(0, 5 - 1) : acciones.slice(0, 5);
    if (loadingYearData) return <Loading />;

    return (
        <div className="rounded-lg space-y-5  p-2 border border-gray-200 bg-white max-w-lg w-full mx-auto shadow-sm">
            <span className="min-h-[90px] text-xl text-center font-semibold text-gray-700 tracking-wide block mb-2">{eje}</span>
            <LoadingOverlayPersonalizada
                isLoading={loading}
                message={{
                    successMessage,
                    setSuccessMessage,
                    errorMessage,
                    setErrorMessage,
                }}
                timeDelay={false}
            />
            <div className="space-y-4">
                {accionesMostradas.map((accion) => {
                    let editable = editarPlan || editarMemoria;
                    let colorAccion = 'bg-white';

                    if (accion.accionCompartida?.regionLider) {
                        const regionLider = formateaConCeroDelante(
                            typeof accion.accionCompartida.regionLider === 'object' ? accion.accionCompartida.regionLider.RegionId : accion.accionCompartida.regionLider
                        );
                        if (regionLider === regionSeleccionada) {
                            colorAccion = 'bg-teal-100';
                            editable = editable ? true : false;
                        }

                        if (regionLider != regionSeleccionada) {
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
                            <span className="text-base">{`${t('Eje')}: ${TextoSegunIdioma(accion.ejeEs, accion.ejeEu)}`}</span>
                            <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                {t('LineaActuaccion')}: {accion.lineaActuaccion}
                            </span>
                            <div className="flex gap-2 justify-end mt-2">
                                <button
                                    className="hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-1.5 rounded transition"
                                    onClick={() => {
                                        handleEdit(accion);
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
                            <MostrarAvisoCamposAcciones tiposAccion="Acciones" datos={accion} />
                        </div>
                    );
                })}
                {accionesMostradas.length === 0 && <MostrarAvisoCamposAcciones tiposAccion="Acciones" />}
            </div>
        </div>
    );
};
// interface ResultadoValidacionAcciones {
//     faltanIndicadoresPlan: boolean;
//     faltanIndicadoresMemoria: boolean;
//     faltanCamposPlan: boolean;
//     faltanCamposMemoria: boolean;
// }

// export function validarCamposObligatoriosAccion(datos: DatosAccion): ResultadoValidacionAcciones {
//     const faltanIndicadoresPlan =
//         (datos.indicadorAccion?.indicadoreRealizacion.some((item) => !item.descripcion || !item.metaAnual?.total || !item.metaFinal?.total) ?? false) ||
//         (datos.indicadorAccion?.indicadoreResultado.some((item) => !item.descripcion || !item.metaAnual?.total || !item.metaFinal?.total) ?? false) ||
//         datos.indicadorAccion?.indicadoreRealizacion.length === 0 ||
//         datos.indicadorAccion?.indicadoreResultado.length === 0;

//     const faltanIndicadoresMemoria =
//         (datos.indicadorAccion?.indicadoreRealizacion.some((item) => !item.ejecutado?.total) ?? false) || (datos.indicadorAccion?.indicadoreResultado.some((item) => !item.ejecutado?.total) ?? false);

//     const faltanCamposPlan =
//         !datos.datosPlan?.ejecutora ||
//         !datos.datosPlan?.implicadas ||
//         !datos.datosPlan?.comarcal ||
//         !datos.datosPlan?.supracomarcal ||
//         (datos.plurianual === true && !datos.datosPlan?.rangoAnios) ||
//         !datos.datosPlan?.oAccion ||
//         !datos.datosPlan?.dAccion;

//     const faltanCamposMemoria =
//         !datos.datosMemoria?.sActual ||
//         //!datos.datosMemoria?.dAccionAvances ||
//         !datos.datosMemoria?.presupuestoEjecutado?.cuantia ||
//         datos.datosMemoria?.presupuestoEjecutado?.fuenteDeFinanciacion.length === 0 ||
//         !datos.datosMemoria?.ejecucionPresupuestaria?.previsto ||
//         !datos.datosMemoria?.ejecucionPresupuestaria?.ejecutado ||
//         !datos.datosMemoria?.ejecucionPresupuestaria?.porcentaje;

//     return { faltanIndicadoresPlan, faltanIndicadoresMemoria, faltanCamposPlan, faltanCamposMemoria };
// }

interface MostrarAvisoCamposAccionesProps {
    tiposAccion: TiposAccion;
    datos?: DatosAccion;
    plurianual?: boolean;
    texto?: boolean;
}

export const MostrarAvisoCamposAcciones: React.FC<MostrarAvisoCamposAccionesProps> = ({ tiposAccion, datos, texto = true }) => {
    const { t } = useTranslation();
    const { editarPlan } = useEstadosPorAnio();
    const { editarMemoria } = useEstadosPorAnio();

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
    if (datos.camposFaltantes === 'verificado') return;
    let faltanCamposPlan = false;
    let faltanCamposMemoria = false;
    let faltanIndicadores = false;

    if (datos.camposFaltantes) {
        const elementos = datos.camposFaltantes.split(',');

        faltanCamposPlan = elementos.some((e) => e.startsWith('P'));
        faltanCamposMemoria = elementos.some((e) => e.startsWith('M'));

        faltanIndicadores = elementos.some((e) => e.startsWith('Indicadores'));

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
    } else {
        faltanIndicadores = !VerificadorIndicadores(datos, editarPlan, editarMemoria);
        const camposFaltantes = VerificarAccionFinal(datos, editarPlan, false, tiposAccion, true);
        const camposFaltantesMem = VerificarAccionFinal(datos, editarPlan, true, tiposAccion, true);
        faltanCamposPlan = camposFaltantes ? camposFaltantes.length != 0 : false;
        faltanCamposMemoria = camposFaltantesMem ? camposFaltantesMem.length != 0 : false;

        if (editarPlan) {
            if (!faltanCamposPlan && !faltanIndicadores) {
                return null;
            }
        } else {
            if (!faltanCamposMemoria && !faltanIndicadores) {
                return null;
            }
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
    tipoAccion: TiposAccion;
}

export const DropdownLineaActuaccion = ({ setNuevaLineaActuaccion, idEjeSeleccionado, lineaActuaccion, ejesPlan, tipoAccion }: DropdownLineaActuacionProps) => {
    const { regionSeleccionada } = useRegionContext();

    const { t, i18n } = useTranslation();
    const esAccion = tipoAccion === 'Acciones';
    const esAccionAccesoria = tipoAccion === 'AccionesAccesorias';

    const [ejesEnDropdown, setEjesEnDropdown] = useState<Ejes[]>(ejesPlan);

    const setAccion: ((data: EjesBBDD[]) => void) | undefined = esAccion ? (data: EjesBBDD[]) => setEjesEnDropdown(EjesBBDDToEjes(data)) : undefined;

    const setAccionAccesoria: ((data: EjesBBDD[]) => void) | undefined = esAccionAccesoria ? (data: EjesBBDD[]) => setEjesEnDropdown(EjesBBDDToEjes(data)) : undefined;

    const [lineaActuaciones, setLineaActuaciones] = useState<string[]>([]);
    const [textoFecha, setTextoFecha] = useState<string>('');

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [fechaUltimoActualizadoBBDD, setFechaUltimoActualizadoBBDD] = useState<Date>(() => {
        const fechaStr = obtenerFechaLlamada('ejesRegion');
        return fechaStr ? new Date(fechaStr) : new Date();
    });

    const cargarEjes = () => {
        LlamadaBBDDEjesRegion(regionSeleccionada, t, i18n, { setErrorMessage, setSuccessMessage }, setLoading, setAccion, setFechaUltimoActualizadoBBDD, setAccionAccesoria);
    };

    useEffect(() => {
        if (ejesEnDropdown && idEjeSeleccionado && idEjeSeleccionado != '') {
            const index = ejesPlan.findIndex((eje) => `${eje.Id}` === `${idEjeSeleccionado}`);
            const datosEje = ejesPlan[index];
            if (!datosEje) return;

            let lineaActuacion = ejesEnDropdown.find((e) => `${e.NameEs}` === `${datosEje.NameEs}`)?.LineasActuaccion;
            if (!lineaActuacion) {
                lineaActuacion = ejesEnDropdown.find((e) => `${e.NameEu}` === `${datosEje.NameEu}`)?.LineasActuaccion;
            }
            if (!lineaActuacion) {
                lineaActuacion = datosEje.LineasActuaccion;
            }
            if (lineaActuacion) {
                setLineaActuaciones(lineaActuacion.map((la) => la.Title));
            } else {
                setLineaActuaciones([]);
            }
        }
    }, [idEjeSeleccionado, ejesEnDropdown]);

    useEffect(() => {
        setTextoFecha(`${t('Actualizar')} ${t('LineasdeActuaccion')} ${PrintFechaTexto({ date: fechaUltimoActualizadoBBDD, idioma: i18n })}`);
    }, [fechaUltimoActualizadoBBDD, t]);

    return (
        <div style={{ position: 'relative', minHeight: 40 }}>
            <LoadingOverlayPersonalizada
                isLoading={loading}
                enModal={true}
                message={{
                    successMessage,
                    setSuccessMessage,
                    errorMessage,
                    setErrorMessage,
                }}
            />
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

type LlamadaParams = {
    regionSeleccionada: string | null;
    acciones: TiposAccion | 'Servicios';
    t: any;
    i18n: any;
    setErrorMessage: (msg: string) => void;
    setSuccessMessage: (msg: string) => void;
    setLoading: (loading: boolean) => void;
    setEjesPlan: (ejes: EjesBBDD[]) => void;
    isFetchingRef: React.MutableRefObject<boolean>;
};

export const FetchEjesPlan = async ({ regionSeleccionada, acciones, t, i18n, setErrorMessage, setSuccessMessage, setLoading, setEjesPlan, isFetchingRef }: LlamadaParams) => {
    if (isFetchingRef.current) return;

    let rellenarEjes: EjesBBDD[] = [];
    const ejesRegionStr = localStorage.getItem('ejesRegion');
    const ejesStore: { ejesEstrategicos?: EjesBBDD[]; ejesGlobales?: EjesBBDD[] } = JSON.parse(ejesRegionStr || '{}');

    const ejes = acciones === 'Acciones' ? ejesStore.ejesEstrategicos ?? [] : ejesStore.ejesGlobales ?? [];
    setEjesPlan(ejes);
    rellenarEjes = ejes;

    if (rellenarEjes.length === 0) {
        if (!ValidarEjesRegion(regionSeleccionada)) {
            isFetchingRef.current = true;
            try {
                if (acciones === 'Acciones') {
                    await LlamadaBBDDEjesRegion(regionSeleccionada, t, i18n, { setErrorMessage, setSuccessMessage }, setLoading, setEjesPlan);
                } else {
                    await LlamadaBBDDEjesRegion(regionSeleccionada, t, i18n, { setErrorMessage, setSuccessMessage }, setLoading, setEjesPlan, undefined, setEjesPlan);
                }
            } finally {
                isFetchingRef.current = false;
            }
        }
    }
};

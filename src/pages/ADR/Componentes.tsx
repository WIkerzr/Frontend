import { forwardRef, useEffect, useRef, useState } from 'react';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import { useTranslation } from 'react-i18next';
import { NewModal } from '../../components/Utils/utils';
import { NavLink } from 'react-router-dom';
import { DatosAccion } from '../../types/TipadoAccion';
import { indicadorInicial, IndicadorRealizacion, IndicadorRealizacionAccion, IndicadorResultado, IndicadorResultadoAccion } from '../../types/Indicadores';
import { sortBy } from 'lodash';
import { DataTable, DataTableSortStatus, DataTableColumnTextAlign } from 'mantine-datatable';
import { visualColumnByPath } from './Acciones/Columnas';
import { useYear } from '../../contexts/DatosAnualContext';
import { useEstadosPorAnio } from '../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../contexts/RegionContext';
import IconEye from '../../components/Icon/IconEye';
import IconInfoCircle from '../../components/Icon/IconInfoCircle';
import IconInfoTriangle from '../../components/Icon/IconInfoTriangle';
import { ModalNuevoIndicador } from '../Configuracion/componentes';
import Tippy from '@tippyjs/react';

type AccionAccesoria = { id: number; texto: string };
interface ListadoAccionesAccesoriasProps {
    nombre: string;
    listadoMap: AccionAccesoria[];
    ACCIONES_MAX: number;
}
export const ListadoAccionesAccesorias = ({ nombre, listadoMap }: ListadoAccionesAccesoriasProps) => {
    const idCounter = useRef(1000);
    const [acciones, setAcciones] = useState<AccionAccesoria[]>(listadoMap);
    const [nuevaAccion, setNuevaAccion] = useState('');
    const { SeleccionEditarServicio } = useYear();

    const handleNuevaAccion = () => {
        setAcciones((prev) => [{ id: idCounter.current++, texto: nuevaAccion.trim() }, ...prev.slice(0, 5 - 1)]);
        setNuevaAccion('');
    };

    const handleDelete = (id: number) => setAcciones((prev) => prev.filter((a) => a.id !== id));

    const mostrarInput = acciones.length < 5;
    const accionesMostradas = mostrarInput ? acciones.slice(0, 5 - 1) : acciones.slice(0, 5);
    return (
        <div className="grid grid-cols-3 gap-x-6 gap-y-6">
            {mostrarInput && (
                <div className="bg-white rounded-xl border border-[#ECECEC] p-6 flex flex-col shadow-sm">
                    <NavLink to="/adr/servicios/editando" className="group" onClick={() => SeleccionEditarServicio(null)}>
                        <button className="bg-[#4463F7] text-white px-4 py-2 rounded hover:bg-[#254edb] self-end text-sm transition disabled:bg-gray-300" onClick={handleNuevaAccion}>
                            + {nombre}
                        </button>
                    </NavLink>
                </div>
            )}
            {accionesMostradas.map((accion) => (
                <div key={accion.id} className="card-div">
                    <div className="flex-1 text-base text-[#222] mb-0 pr-2">{accion.texto}</div>
                    <div className="flex flex-col justify-start items-end gap-2 border-l border-[#ECECEC] pl-4">
                        <NavLink to="/adr/servicios/editando" className="group" onClick={() => SeleccionEditarServicio(accion.id.toString())}>
                            <button aria-label={`Editar acción ${accion.id}`} className="hover:bg-gray-100 p-1.5 rounded transition">
                                <IconPencil />
                            </button>
                        </NavLink>
                        <button onClick={() => handleDelete(accion.id)} aria-label={`Eliminar acción ${accion.id}`} className="hover:bg-gray-100 p-1.5 rounded transition">
                            <IconTrash />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export const ModalAccion = () => {
    const { t, i18n } = useTranslation();
    const { yearData, NuevaAccion } = useYear();
    const { editarPlan } = useEstadosPorAnio();

    const ejesPrioritarios = yearData.plan.ejesPrioritarios;
    const [accionesEje, setAccionesEje] = useState<DatosAccion[]>(ejesPrioritarios[0].acciones);

    const [idEjeSeleccionado, setIdEjeSeleccionado] = useState('0');
    const [nuevaAccion, setNuevaAccion] = useState('');
    const [nuevaLineaActuaccion, setNuevaLineaActuaccion] = useState('');
    const [plurianual, setNuevaPlurianual] = useState(false);

    const [inputError, setInputError] = useState(false);
    const [showModal, setShowModal] = useState(false);

    useEffect(() => {
        const numero = ejesPrioritarios.findIndex((eje) => eje.id.toString() === idEjeSeleccionado);
        if (numero !== -1) {
            setAccionesEje(ejesPrioritarios[numero].acciones);
        } else {
            setAccionesEje([]);
        }
    }, [idEjeSeleccionado]);

    const getEjeLimitado = () => accionesEje.length >= 5;

    const handleNuevaAccion = () => {
        if (!nuevaAccion.trim() || !nuevaLineaActuaccion.trim()) {
            setInputError(true);
            return;
        }

        NuevaAccion(idEjeSeleccionado, nuevaAccion, nuevaLineaActuaccion, plurianual);

        //LLamada al servidor con la nueva accion

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
                        <select className="form-select text-gray-800 w-full" style={{ minWidth: 'calc(100% + 10px)' }} defaultValue={'inicial'} onChange={(e) => setIdEjeSeleccionado(e.target.value)}>
                            <option value="inicial" hidden>
                                {t('seleccionaEjePrioritario')}
                            </option>
                            {ejesPrioritarios.map((eje) => (
                                <option key={eje.id} value={eje.id} disabled={getEjeLimitado()}>
                                    {i18n.language === 'es' ? eje.nameEs : eje.nameEu} {getEjeLimitado() ? '(Límite alcanzado)' : ''}
                                </option>
                            ))}
                        </select>
                        {getEjeLimitado() && <div className="text-xs text-red-500 mt-1">{t('limiteEje')}</div>}
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
                            disabled={getEjeLimitado() || idEjeSeleccionado === '0'}
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
                            disabled={getEjeLimitado() || idEjeSeleccionado === '0'}
                            autoComplete="off"
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
                    <button
                        onClick={handleNuevaAccion}
                        className={`bg-primary text-white px-4 py-2 rounded hover:bg-green-700 w-full mt-2 transition ${getEjeLimitado() ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
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
                ejesPrioritarios: yearData.plan.ejesPrioritarios.map((eje) => ({
                    ...eje,
                    acciones: eje.acciones.filter((accion) => accion.id !== id),
                })),
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
                    let editable = true;
                    let colorAccion = 'bg-white';
                    if (accion.accionCompartida && Array.isArray(accion.accionCompartida.regiones)) {
                        const regionLider = accion.accionCompartida.regionLider.RegionId === regionSeleccionada;
                        if (regionLider) {
                            colorAccion = 'bg-teal-100';
                            editable = true;
                        }
                        const regionCooperando = accion.accionCompartida.regiones.find((r) => r.RegionId === regionSeleccionada);
                        if (regionCooperando) {
                            colorAccion = 'bg-gray-300';
                            editable = false;
                        }
                    }

                    return (
                        <div key={accion.id} className={`${colorAccion} border border-gray-200 p-6 shadow-sm rounded-lg hover:shadow-md transition-shadow flex flex-col`}>
                            <span className="text-base">{accion.accion}</span>
                            <span className="block text-sm text-gray-500 text-left font-medium mb-1">{t('LineaActuaccion')}:</span>
                            <span className="text-base">{accion.lineaActuaccion}</span>
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
                            <MostrarAvisoCampos datos={accion} />
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
interface ResultadoValidacion {
    faltanindicadoresPlan: boolean;
    faltanIndicadoresMemoria: boolean;
    faltanCamposPlan: boolean;
    faltanCamposMemoria: boolean;
}

export function validarCamposObligatoriosAccion(datos: DatosAccion): ResultadoValidacion {
    const faltanindicadoresPlan =
        !datos.indicadorAccion?.indicadoreRealizacion?.[0] ||
        !datos.indicadorAccion?.indicadoreRealizacion?.[0].descripcion ||
        !datos.indicadorAccion?.indicadoreRealizacion?.[0].metaAnual?.total ||
        !datos.indicadorAccion?.indicadoreRealizacion?.[0].metaFinal?.total;

    const faltanIndicadoresMemoria = !datos.indicadorAccion?.indicadoreRealizacion?.[0] || !datos.indicadorAccion?.indicadoreRealizacion?.[0].ejecutado?.total;

    const faltanCamposPlan =
        !datos.datosPlan?.ejecutora ||
        !datos.datosPlan?.implicadas ||
        !datos.datosPlan?.comarcal ||
        !datos.datosPlan?.supracomarcal ||
        (datos.plurianual === true && !datos.datosPlan?.rangoAnios) ||
        !datos.datosPlan?.oAccion ||
        !datos.datosPlan?.ods ||
        !datos.datosPlan?.dAccion;

    const faltanCamposMemoria =
        !datos.datosMemoria?.sActual ||
        !datos.datosMemoria?.oAccion ||
        !datos.datosMemoria?.ods ||
        !datos.datosMemoria?.dAccionAvances ||
        !datos.datosMemoria?.presupuestoEjecutado?.cuantia ||
        !datos.datosMemoria?.presupuestoEjecutado?.fuenteDeFinanciacion ||
        !datos.datosMemoria?.ejecucionPresupuestaria?.previsto ||
        !datos.datosMemoria?.ejecucionPresupuestaria?.ejecutado ||
        !datos.datosMemoria?.ejecucionPresupuestaria?.porcentaje;

    return { faltanindicadoresPlan, faltanIndicadoresMemoria, faltanCamposPlan, faltanCamposMemoria };
}

interface MostrarAvisoCamposProps {
    datos: DatosAccion;
    plurianual?: boolean;
    texto?: boolean;
}

export const MostrarAvisoCampos: React.FC<MostrarAvisoCamposProps> = ({ datos, texto = true }) => {
    const { t } = useTranslation();
    const { editarPlan } = useEstadosPorAnio();

    const { faltanindicadoresPlan, faltanIndicadoresMemoria, faltanCamposPlan, faltanCamposMemoria } = validarCamposObligatoriosAccion(datos);

    if (!texto) {
        return null;
    }

    if (editarPlan) {
        if (!faltanCamposPlan && !faltanindicadoresPlan) {
            return null;
        }
    } else {
        if (!faltanCamposMemoria && !faltanIndicadoresMemoria) {
            return null;
        }
    }

    return (
        <NavLink to="/adr/acciones/editando" className="group">
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

interface tablaIndicadoresProps {
    indicador: IndicadorRealizacionAccion[] | IndicadorResultadoAccion[];
    titulo: string;
}

export const TablaCuadroMando = forwardRef<HTMLDivElement, tablaIndicadoresProps>(({ indicador, titulo }, ref) => {
    const { t } = useTranslation();
    const [initialRecords, setInitialRecords] = useState(sortBy(indicador, 'id'));
    const [recordsData] = useState(initialRecords);

    const [search] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });

    const columnMetaAnual = [visualColumnByPath('metaAnual.hombres', t('Hombre')), visualColumnByPath('metaAnual.mujeres', t('Mujer')), visualColumnByPath('metaAnual.total', t('Total'))];

    const columnEjecutadoAnual = [visualColumnByPath('ejecutado.hombres', t('Hombre')), visualColumnByPath('ejecutado.mujeres', t('Mujer')), visualColumnByPath('ejecutado.total', t('Total'))];

    const columnPorcentaje = [visualColumnByPath('porcentajeHombres', t('Hombre')), visualColumnByPath('porcentajeMujeres', t('Mujer')), visualColumnByPath('porcentajeTotal', t('Total'))];
    //const columnMetaFinal = [visualColumnByPath('metaFinal.hombres', t('Hombre')), visualColumnByPath('metaFinal.mujeres', t('Mujer')), visualColumnByPath('metaFinal.total', t('Total'))];
    const columnNombre = [visualColumnByPath('descripcion', titulo)];

    const columnGroups = [
        { id: 'descripcion', title: ``, columns: columnNombre },
        { id: 'metaAnual', title: t('metaAnual'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnMetaAnual },
        { id: 'ejecutado', title: t('ejecutado'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnEjecutadoAnual },
        { id: 'porcentaje', title: t('porcentaje'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnPorcentaje },
        //{ id: 'metaFinal', title: t('metaFinal'), textAlign: 'center' as DataTableColumnTextAlign, columns: columnMetaFinal },
    ];

    useEffect(() => {
        setInitialRecords(() => {
            if (!search.trim()) return sortBy(indicador, 'id');
            const s = search.toLowerCase();
            return indicador.filter(
                (item) =>
                    (item.descripcion && String(item.descripcion).toLowerCase().includes(s)) ||
                    (item.metaAnual?.hombres !== undefined && String(item.metaAnual.hombres).toLowerCase().includes(s)) ||
                    (item.metaAnual?.mujeres !== undefined && String(item.metaAnual.mujeres).toLowerCase().includes(s)) ||
                    (item.metaAnual?.total !== undefined && String(item.metaAnual.total).toLowerCase().includes(s)) ||
                    (item.ejecutado?.hombres !== undefined && String(item.ejecutado.hombres).toLowerCase().includes(s)) ||
                    (item.ejecutado?.mujeres !== undefined && String(item.ejecutado.mujeres).toLowerCase().includes(s)) ||
                    (item.ejecutado?.total !== undefined && String(item.ejecutado.total).toLowerCase().includes(s)) ||
                    (item.metaFinal?.hombres !== undefined && String(item.metaFinal.hombres).toLowerCase().includes(s)) ||
                    (item.metaFinal?.mujeres !== undefined && String(item.metaFinal.mujeres).toLowerCase().includes(s)) ||
                    (item.metaFinal?.total !== undefined && String(item.metaFinal.total).toLowerCase().includes(s)) ||
                    (item.hipotesis && item.hipotesis.toLowerCase().includes(s))
            );
        });
    }, [search, indicador]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
    }, [sortStatus]);

    return (
        <div className="datatables" ref={ref}>
            <DataTable
                className="whitespace-nowrap table-hover mantine-table"
                records={recordsData}
                groups={columnGroups}
                withRowBorders={false}
                withColumnBorders={true}
                striped={true}
                highlightOnHover
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus}
                minHeight={200}
            />
        </div>
    );
});

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

interface IndicadorProps {
    indicadorRealizacion: IndicadorRealizacion[];
    indicadorResultado: IndicadorResultado[];
    setIndicadorRealizacion: React.Dispatch<React.SetStateAction<IndicadorRealizacion[]>>;
    setIndicadorResultado: React.Dispatch<React.SetStateAction<IndicadorResultado[]>>;
}

export const TablaIndicadores: React.FC<IndicadorProps> = ({ indicadorRealizacion, indicadorResultado, setIndicadorRealizacion, setIndicadorResultado }) => {
    const { t, i18n } = useTranslation();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState<boolean>(false);
    const [modalEditarRealizacion, setModalEditarRealizacion] = useState(false);
    const [modalEditarResultado, setModalEditarResultado] = useState(false);
    const [indicadorSeleccionadoRealizacionEditar, setIndicadorSeleccionadoRealizacionEditar] = useState<IndicadorRealizacion>();
    const [indicadorSeleccionadoResultadoEditar, setIndicadorSeleccionadoResultadoEditar] = useState<IndicadorRealizacion>();
    const [datosPreEditados, setDatosPreEditados] = useState<IndicadorRealizacion>(indicadorInicial);

    const actualizarIndicadorResultadosAlEliminarEnRealizacion = (indicadorResultadoSeleccionado: IndicadorRealizacion, idExcluir: number[] = []) => {
        let resultadoIds = [...(indicadorResultadoSeleccionado.Resultados?.map((r) => r.Id) || [])];

        const resultadosRelacionados = new Set<number>();
        for (const ind of indicadorRealizacion) {
            if (ind.Id === indicadorResultadoSeleccionado.Id) continue;
            ind.Resultados?.forEach((r) => {
                resultadosRelacionados.add(r.Id);
            });
        }
        resultadoIds = resultadoIds.filter((id) => !resultadosRelacionados.has(id) && !idExcluir.includes(id));
        setIndicadorResultado((prev) => prev.filter((r) => !resultadoIds.includes(r.Id)));
    };

    const editarIndicadorResultados = (indicadorActualizado: IndicadorResultado) => {
        setIndicadorRealizacion((prev) =>
            prev.map((ind) => ({
                ...ind,
                Resultados: ind.Resultados?.map((r) => (r.Id === indicadorActualizado.Id ? { ...r, ...indicadorActualizado } : r)) || [],
            }))
        );
    };

    const actualizarIndicadorResultados = (indicadorActualizado: IndicadorRealizacion) => {
        for (const ind of indicadorActualizado.Resultados!) {
            editarIndicadorResultados(ind);
        }

        const idsPreEditados = datosPreEditados.Resultados?.map((r) => r.Id) || [];
        const idsActualizados = new Set(indicadorActualizado.Resultados?.map((r) => r.Id) || []);
        const idsEliminados = idsPreEditados.filter((id) => !idsActualizados.has(id));
        const resultadosNoRelacionados = new Set<number>();
        for (const ind of indicadorRealizacion) {
            if (ind.Id === indicadorActualizado.Id) continue;
            ind.Resultados?.forEach((r) => {
                const id = Number(r.Id);
                if (idsEliminados.includes(id)) {
                    resultadosNoRelacionados.add(id);
                }
            });
        }
        const idsParaEliminar = idsEliminados.filter((id) => !resultadosNoRelacionados.has(id));

        if (idsParaEliminar.length > 0) {
            setIndicadorResultado((prev) => {
                const filtrados = prev.filter((resultado) => !idsParaEliminar.includes(resultado.Id));
                return filtrados;
            });
        }

        const idsAgregados = Array.from(idsActualizados).filter((id) => !idsPreEditados.includes(id));
        const idsExistentes = new Set(indicadorResultado.map((r) => r.Id));
        const nuevosResultados = indicadorActualizado.Resultados?.filter((r) => idsAgregados.includes(r.Id) && !idsExistentes.has(r.Id)) || [];
        if (nuevosResultados.length > 0) {
            setIndicadorResultado((prev) => [...prev, ...nuevosResultados]);
        }
        setIndicadorResultado((prev) =>
            prev.map((resultadoExistente) => {
                const actualizado = indicadorActualizado.Resultados?.find((r) => r.Id === resultadoExistente.Id);
                if (actualizado) {
                    const cambiado =
                        resultadoExistente.NameEs !== actualizado.NameEs ||
                        resultadoExistente.NameEu !== actualizado.NameEu ||
                        resultadoExistente.Description !== actualizado.Description ||
                        resultadoExistente.DisaggregationVariables !== actualizado.DisaggregationVariables ||
                        resultadoExistente.CalculationMethodology !== actualizado.CalculationMethodology ||
                        resultadoExistente.RelatedAxes !== actualizado.RelatedAxes;

                    if (cambiado) {
                        return { ...resultadoExistente, ...actualizado };
                    }
                }
                return resultadoExistente;
            })
        );
    };

    const actualizarEliminarIndicadorRealizacion = (indicadorRealizacionSeleccionado: IndicadorRealizacion) => {
        setIndicadorRealizacion((prev) => {
            const nuevoArray = prev.filter((ind) => ind.Id !== indicadorRealizacionSeleccionado.Id);
            const idsUsados = new Set<number>();
            nuevoArray.forEach((ind) => {
                ind.Resultados?.forEach((res) => idsUsados.add(res.Id));
            });
            actualizarIndicadorResultadosAlEliminarEnRealizacion(indicadorRealizacionSeleccionado);
            return nuevoArray;
        });
    };

    const eliminarIndicadorRealizacion = async (indiRealizacionAEliminar: IndicadorRealizacion) => {
        setErrorMessage(null);
        setSuccessMessage(null);
        const token = sessionStorage.getItem('token');
        const confirmDelete = window.confirm(t('confirmarEliminar', { nombre: i18n.language === 'eu' ? indiRealizacionAEliminar.NameEu : indiRealizacionAEliminar.NameEs }));
        if (!confirmDelete) return;
        try {
            const response = await fetch(`https://localhost:44300/api/eliminarIndicadorRealizacion/${indiRealizacionAEliminar.Id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tipo: 'realizacion',
                    id: indiRealizacionAEliminar.Id,
                }),
            });

            if (!response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            const data = await response.json();
            console.log('Datos restantes despues de la eliminacion del indicador Realización con id:' + indiRealizacionAEliminar.Id);
            console.log(data);
            actualizarEliminarIndicadorRealizacion(indiRealizacionAEliminar);
            setSuccessMessage(t('eliminacionExitosa'));

            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setSuccessMessage(null);
                    setFadeOut(false);
                }, 1000);
            }, 5000);
            setIndicadorRealizacion((prev) => prev.filter((indicador) => indicador.Id !== indiRealizacionAEliminar.Id));
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMessage(err.message || 'Error inesperado');
            } else {
                console.error('Error desconocido', err);
            }
        }
    };

    const eliminarIndicadorResultado = async (indiResultadoAEliminar: IndicadorResultado) => {
        setErrorMessage(null);
        setSuccessMessage(null);
        const token = sessionStorage.getItem('token');
        const confirmDelete = window.confirm(t('confirmarEliminar', { nombre: i18n.language === 'eu' ? indiResultadoAEliminar.NameEu : indiResultadoAEliminar.NameEs }));
        if (!confirmDelete) return;
        try {
            const response = await fetch(`https://localhost:44300/api/eliminarIndicadorResultado/${indiResultadoAEliminar.Id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tipo: 'resultado',
                    id: indiResultadoAEliminar.Id,
                }),
            });

            if (!response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            setSuccessMessage(t('eliminacionExitosa'));
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setSuccessMessage(null);
                    setFadeOut(false);
                }, 1000);
            }, 5000);
            setIndicadorResultado((prev) => prev.filter((indicador) => indicador.Id !== indiResultadoAEliminar.Id));

            setIndicadorRealizacion((prev) =>
                prev.map((ind) => ({
                    ...ind,
                    Resultados: ind.Resultados?.filter((r) => r.Id !== indiResultadoAEliminar.Id) || [],
                }))
            );
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMessage(err.message || 'Error inesperado');
            } else {
                console.error('Error desconocido', err);
            }
        }
    };
    return (
        <>
            {indicadorRealizacion.length > 0 && (
                <div className={`h-full panel w-1/2}`}>
                    {errorMessage && <span className="text-red-500 text-sm mt-2">{errorMessage}</span>}
                    {successMessage && (
                        <div className={`mt-4 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                            <p className="text-green-500">{successMessage}</p>
                        </div>
                    )}
                    <div className="table-responsive mb-5">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('Realizacion')}</th>
                                    <th className="text-center"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {indicadorRealizacion
                                    .slice()
                                    .reverse()
                                    .map((data) => {
                                        return (
                                            <tr key={data.Id}>
                                                <td>
                                                    <div className="break-words">
                                                        {i18n.language === 'eu' ? (data.NameEu?.trim() ? data.NameEu : data.NameEs) : data.NameEs?.trim() ? data.NameEs : data.NameEu}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="flex justify-end space-x-3">
                                                        <Tippy content={t('editar')}>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIndicadorSeleccionadoRealizacionEditar(data);
                                                                    setDatosPreEditados(JSON.parse(JSON.stringify(data)));
                                                                    setModalEditarRealizacion(true);
                                                                }}
                                                            >
                                                                <IconPencil />
                                                            </button>
                                                        </Tippy>
                                                        <Tippy content={t('borrar')}>
                                                            <button type="button" onClick={() => eliminarIndicadorRealizacion(data)}>
                                                                <IconTrash />
                                                            </button>
                                                        </Tippy>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                    {modalEditarRealizacion && indicadorSeleccionadoRealizacionEditar && (
                        <ModalNuevoIndicador
                            isOpen={modalEditarRealizacion}
                            onClose={() => setModalEditarRealizacion(false)}
                            accion="Editar"
                            datosIndicador={indicadorSeleccionadoRealizacionEditar}
                            tipoIndicador={'realizacion'}
                            onSave={(indicadorActualizado) => {
                                setIndicadorRealizacion((prev) => prev.map((ind) => (ind.Id === indicadorActualizado.Id ? indicadorActualizado : ind)));
                                actualizarIndicadorResultados(indicadorActualizado);
                            }}
                        />
                    )}
                </div>
            )}

            {indicadorResultado.length > 0 && (
                <div className={`h-full panel w-1/2}`}>
                    {errorMessage && <span className="text-red-500 text-sm mt-2">{errorMessage}</span>}
                    {successMessage && (
                        <div className={`mt-4 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                            <p className="text-green-500">{successMessage}</p>
                        </div>
                    )}

                    <div className="table-responsive mb-5">
                        <table>
                            <thead>
                                <tr>
                                    <th>{t('Resultado')}</th>
                                    <th className="text-center"></th>
                                </tr>
                            </thead>
                            <tbody>
                                {indicadorResultado
                                    .slice()
                                    .reverse()
                                    .map((data) => {
                                        return (
                                            <tr key={data.Id}>
                                                <td>
                                                    <div className="break-words">
                                                        {i18n.language === 'eu' ? (data.NameEu?.trim() ? data.NameEu : data.NameEs) : data.NameEs?.trim() ? data.NameEs : data.NameEu}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="flex justify-end space-x-3">
                                                        <Tippy content={t('editar')}>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setIndicadorSeleccionadoResultadoEditar(data);
                                                                    setDatosPreEditados(JSON.parse(JSON.stringify(data)));
                                                                    setModalEditarResultado(true);
                                                                }}
                                                            >
                                                                <IconPencil />
                                                            </button>
                                                        </Tippy>
                                                        <Tippy content={t('borrar')}>
                                                            <button type="button" onClick={() => eliminarIndicadorResultado(data)}>
                                                                <IconTrash />
                                                            </button>
                                                        </Tippy>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                            </tbody>
                        </table>
                    </div>
                    {modalEditarResultado && indicadorSeleccionadoResultadoEditar && (
                        <ModalNuevoIndicador
                            isOpen={modalEditarResultado}
                            onClose={() => setModalEditarResultado(false)}
                            accion="Editar"
                            datosIndicador={indicadorSeleccionadoResultadoEditar}
                            tipoIndicador={'resultado'}
                            onSave={(indicadorActualizado) => {
                                setIndicadorResultado((prev) => prev.map((ind) => (ind.Id === indicadorActualizado.Id ? indicadorActualizado : ind)));
                                editarIndicadorResultados(indicadorActualizado);
                            }}
                        />
                    )}
                </div>
            )}
        </>
    );
};

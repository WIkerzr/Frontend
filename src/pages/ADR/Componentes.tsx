import { useRef, useState } from 'react';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import { useTranslation } from 'react-i18next';
import { NewModal } from '../../components/Utils/utils';
import { NavLink } from 'react-router-dom';
import AnimateHeight from 'react-animate-height';
import { DatosAccion } from '../../types/TipadoAccion';
import { Estado } from '../../contexts/EstadosPorAnioContext';

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
    const [inputError, setInputError] = useState(false);
    const { t } = useTranslation();

    const handleNuevaAccion = () => {
        if (!nuevaAccion.trim() || acciones.length >= 5) {
            setInputError(!nuevaAccion.trim());
            return;
        }
        setAcciones((prev) => [{ id: idCounter.current++, texto: nuevaAccion.trim() }, ...prev.slice(0, 5 - 1)]);
        setNuevaAccion('');
        setInputError(false);
    };

    const handleEdit = (id: number) => alert('Editar acción ' + id);
    const handleDelete = (id: number) => setAcciones((prev) => prev.filter((a) => a.id !== id));

    const mostrarInput = acciones.length < 5;
    const accionesMostradas = mostrarInput ? acciones.slice(0, 5 - 1) : acciones.slice(0, 5);
    return (
        <div className="grid grid-cols-3 gap-x-6 gap-y-6">
            {mostrarInput && (
                <div className="bg-white rounded-xl border border-[#ECECEC] p-6 flex flex-col shadow-sm">
                    <label className="text-sm text-gray-500 mb-2">{nombre}</label>
                    <input
                        className={`border border-[#ECECEC] rounded p-2 mb-4 text-sm bg-[#FAFAFB] focus:outline-none focus:ring-2 focus:ring-blue-200 transition ${inputError ? 'border-red-400' : ''}`}
                        value={nuevaAccion}
                        onChange={(e) => {
                            setNuevaAccion(e.target.value);
                            setInputError(false);
                        }}
                        placeholder="Introduce el nombre"
                        maxLength={200}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleNuevaAccion();
                        }}
                    />
                    <button
                        className="bg-[#4463F7] text-white px-4 py-2 rounded hover:bg-[#254edb] self-end text-sm transition disabled:bg-gray-300"
                        onClick={handleNuevaAccion}
                        disabled={acciones.length >= 5}
                    >
                        + {nombre}
                    </button>
                </div>
            )}
            {accionesMostradas.map((accion) => (
                <div key={accion.id} className="card-div">
                    <div className="flex-1 text-base text-[#222] mb-0 pr-2">{accion.texto}</div>
                    <div className="flex flex-col justify-start items-end gap-2 border-l border-[#ECECEC] pl-4">
                        <button onClick={() => handleEdit(accion.id)} aria-label={`Editar acción ${accion.id}`} className="hover:bg-gray-100 p-1.5 rounded transition">
                            <IconPencil />
                        </button>
                        <button onClick={() => handleDelete(accion.id)} aria-label={`Eliminar acción ${accion.id}`} className="hover:bg-gray-100 p-1.5 rounded transition">
                            <IconTrash />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

interface ModalAccionProps {
    listadosAcciones: DatosAccion[];
}

export const ModalAccion = ({ listadosAcciones }: ModalAccionProps) => {
    const { t } = useTranslation();
    let ejes = Array.from(new Set(listadosAcciones!.map((a) => a.eje)));

    const accionesPorEje: Record<string, DatosAccion[]> = {};
    ejes.forEach((eje) => {
        accionesPorEje[eje] = listadosAcciones!.filter((a) => a.eje === eje);
    });

    const [selectedEje, setSelectedEje] = useState(() => {
        const firstAvailable = ejes.find((eje) => accionesPorEje[eje].length < 5);
        return firstAvailable || ejes[0];
    });
    const [nuevaAccion, setNuevaAccion] = useState('');
    const [nuevaLineaActuaccion, setNuevaLineaActuaccion] = useState('');
    const [inputError, setInputError] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const getEjeLimitado = (eje: string) => accionesPorEje[eje]?.length >= 5;

    const handleNuevaAccion = () => {
        if (!nuevaAccion.trim() || !nuevaLineaActuaccion.trim() || getEjeLimitado(selectedEje)) {
            setInputError(true);
            return;
        }

        //LLamada al servidor con la nueva accion

        setNuevaAccion('');
        setNuevaLineaActuaccion('');
        setInputError(false);
        setShowModal(false);
    };

    return (
        <>
            <div className="flex justify-center">
                <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition" onClick={() => setShowModal(true)}>
                    {t('anadirAccion')}
                </button>
            </div>
            <NewModal open={showModal} onClose={() => setShowModal(false)} title={t('newAccion')}>
                <div className="space-y-5">
                    <div>
                        <label className="block font-medium mb-1">{t('Ejes')}</label>
                        <select className="form-select text-gray-800 w-full" style={{ minWidth: 'calc(100% + 10px)' }} value={selectedEje} onChange={(e) => setSelectedEje(e.target.value)}>
                            {ejes.map((eje) => (
                                <option key={eje} value={eje} disabled={getEjeLimitado(eje)}>
                                    {eje} {getEjeLimitado(eje) ? '(Límite alcanzado)' : ''}
                                </option>
                            ))}
                        </select>
                        {getEjeLimitado(selectedEje) && <div className="text-xs text-red-500 mt-1">{t('limiteEje')}</div>}
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
                            disabled={getEjeLimitado(selectedEje)}
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
                            disabled={getEjeLimitado(selectedEje)}
                            autoComplete="off"
                        />
                    </div>
                    {inputError && <div className="text-xs text-red-500 text-center">{t('rellenarAmbosCampos')}</div>}
                    <button
                        onClick={handleNuevaAccion}
                        className={`bg-primary text-white px-4 py-2 rounded hover:bg-green-700 w-full mt-2 transition ${getEjeLimitado(selectedEje) ? 'opacity-50 cursor-not-allowed' : ''}`}
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
    listadoMap: DatosAccion[];
}
export const ListadoAcciones = ({ eje, listadoMap }: ListadoAccionesProps) => {
    const [acciones, setAcciones] = useState<DatosAccion[]>(listadoMap);
    const { t } = useTranslation();

    const handleDelete = (id: number) => setAcciones((prev) => prev.filter((a) => a.id !== id));

    const mostrarInput = acciones.length < 5;
    const accionesMostradas = mostrarInput ? acciones.slice(0, 5 - 1) : acciones.slice(0, 5);

    return (
        <div className="rounded-lg space-y-5  p-2 border border-gray-200 bg-white max-w-lg w-full mx-auto shadow-sm">
            <span className="text-xl text-center font-semibold text-gray-700 tracking-wide block mb-2">{eje}</span>

            <div className="space-y-4">
                {accionesMostradas.map((accion) => (
                    <div key={accion.id} className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg hover:shadow-md transition-shadow flex flex-col ">
                        <span className="text-base">{accion.accion}</span>
                        <span className="block text-sm text-gray-500 text-left font-medium mb-1">{t('LineaActuaccion')}:</span>
                        <span className="text-base">{accion.lineaActuaccion}</span>
                        <div className="flex gap-2 justify-end mt-2">
                            <NavLink to="/adr/acciones/editando" state={{ accion }} className="group">
                                <button aria-label={`Editar acción`} className="hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-1.5 rounded transition">
                                    <IconPencil />
                                </button>
                            </NavLink>
                            <button
                                onClick={() => handleDelete(accion.id)}
                                aria-label={`Eliminar acción ${accion.id}`}
                                className="hover:bg-blue-50 text-gray-500 hover:text-red-600 p-1.5 rounded transition"
                            >
                                <IconTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const Acordeon: React.FC<{ texto: string; num: number; active: string; togglePara: (n: string) => void }> = ({ texto, num, active, togglePara }) => (
    <div className="space-y-2 font-semibold w-1/3 p-1">
        <div className="border border-[#d3d3d3] rounded dark:border-[#1b2e4b]">
            <button
                type="button"
                className="w-full p-1 flex items-center text-white-dark dark:bg-[#1b2e4b] min-h-[2.5rem] text-left"
                onClick={() => togglePara(`${num}`)}
                style={{ lineHeight: '1.5' }}
            >
                <span className="truncate overflow-hidden whitespace-nowrap block w-full">{texto}</span>
            </button>
            <AnimateHeight duration={300} height={active === `${num}` ? 'auto' : 0}>
                <div className="space-y-2 p-4 text-white-dark text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                    <p>{texto}</p>
                </div>
            </AnimateHeight>
        </div>
    </div>
);

// interface tablaIndicadoresProps {
//     indicador: IndicadorRealizacion[];
//     indicadoresResultados?: IndicadorRealizacion[];
//     creaccion?: boolean;
//     onResultadosRelacionadosChange?: (resultados: number[]) => void;
// }

// export const TablaIndicadorAccion = forwardRef<HTMLButtonElement, tablaIndicadoresProps>(({ indicador, indicadoresResultados, creaccion = false, onResultadosRelacionadosChange }, ref) => {
//     const { t } = useTranslation();
//     const { anio, estados } = useEstadosPorAnio();
//     const estadoPlan = estados[anio]?.plan ?? 'borrador';
//     const estadoMemoria = estados[anio]?.memoria ?? 'cerrado';
//     const editarPlan = estadoPlan === 'borrador';
//     const editarMemoria = estadoMemoria === 'borrador';
//     // const editarPlan = estadoPlan === 'cerrado';
//     // const editarMemoria = estadoMemoria === 'cerrado';
//     const [indicadores, setIndicadores] = useState<IndicadorRealizacion[]>(indicador);

//     useEffect(() => {
//         setIndicadores(indicador);
//     }, []);

//     useEffect(() => {
//         if (indicadores != indicador) {
//             setIndicadores(indicador);
//         }
//     }, [indicador]);

//     useEffect(() => {
//         if (creaccion) {
//             const idsUsados = new Set(indicadores.flatMap((r) => r.idsResultados ?? []));
//             const idsResultadosActuales = new Set(indicadoresResultados!.map((res) => res.id));
//             const idsFaltantes = Array.from(idsUsados).filter((id) => !idsResultadosActuales.has(id));

//             if (onResultadosRelacionadosChange) {
//                 onResultadosRelacionadosChange(idsFaltantes);
//             }
//         }
//     }, [indicadores]);
//     const [page, setPage] = useState(1);
//     const [initialRecords, setInitialRecords] = useState(sortBy(indicadores, 'id'));
//     const [recordsData, setRecordsData] = useState(initialRecords);

//     const [search, setSearch] = useState('');
//     const [sortStatus, setSortStatus] = useState<DataTableSortStatus<IndicadorRealizacion>>({ columnAccessor: 'id', direction: 'asc' });
//     const [editableRowIndex, setEditableRowIndex] = useState(-1);

//     const handleEliminarFila = (rowIndex: number) => {
//         if (window.confirm(t('confirmarEliminarIndicador'))) {
//             const nuevosIndicadores = indicadores.filter((_row, idx) => idx !== rowIndex);
//             setIndicadores(nuevosIndicadores);
//         }
//     };

//     const columnMetaAnual = [
//         editableColumnByPath<IndicadorRealizacion>('metaAnual.hombres', t('Hombre'), setIndicadores, editableRowIndex, editarPlan),
//         editableColumnByPath<IndicadorRealizacion>('metaAnual.mujeres', t('Mujer'), setIndicadores, editableRowIndex, editarPlan),
//         editableColumnByPath<IndicadorRealizacion>('metaAnual.total', t('Total'), setIndicadores, editableRowIndex, editarPlan),
//     ];

//     const columnEjecutadoAnual = [
//         editableColumnByPath<IndicadorRealizacion>('ejecutado.hombres', t('Hombre'), setIndicadores, editableRowIndex, editarMemoria),
//         editableColumnByPath<IndicadorRealizacion>('ejecutado.mujeres', t('Mujer'), setIndicadores, editableRowIndex, editarMemoria),
//         editableColumnByPath<IndicadorRealizacion>('ejecutado.total', t('Total'), setIndicadores, editableRowIndex, editarMemoria),
//     ];

//     const columnMetaFinal = [
//         editableColumnByPath<IndicadorRealizacion>('metaFinal.hombres', t('Hombre'), setIndicadores, editableRowIndex, editarPlan),
//         editableColumnByPath<IndicadorRealizacion>('metaFinal.mujeres', t('Mujer'), setIndicadores, editableRowIndex, editarPlan),
//         editableColumnByPath<IndicadorRealizacion>('metaFinal.total', t('Total'), setIndicadores, editableRowIndex, editarPlan),
//     ];
//     const columnNombre = [editableColumnByPath<IndicadorRealizacion>('descripcion', t('nombre'), setIndicadores, editableRowIndex, false)];

//     const columns = [
//         editableColumnByPath<IndicadorRealizacion>('hipotesis', t('hipotesis'), setIndicadores, editableRowIndex, true),
//         {
//             accessor: 'acciones',
//             title: 'Acciones',
//             render: (_row: IndicadorRealizacion, index: number) =>
//                 editableRowIndex === index ? (
//                     <button
//                         className="bg-green-500 text-white px-2 py-1 rounded"
//                         onClick={() => {
//                             const metaAnualOk = _row.metaAnual && _row.metaAnual.total !== 0;
//                             const metaFinalOk = _row.metaFinal && _row.metaFinal.total !== 0;
//                             const ejecutadoOk = _row.ejecutado && _row.ejecutado.total !== 0;
//                             let valido = false;
//                             let errorAlert = '';
//                             if (editarMemoria) {
//                                 if (ejecutadoOk) {
//                                     valido = true;
//                                 } else {
//                                     errorAlert = t('alertTotalesMemoriaActivo');
//                                 }
//                             } else if (editarPlan) {
//                                 if (metaAnualOk && metaFinalOk) {
//                                     valido = true;
//                                 } else {
//                                     errorAlert = t('alertTotalesPlanActivo');
//                                 }
//                             }
//                             if (valido) {
//                                 setEditableRowIndex(-1);
//                             } else {
//                                 alert(t('alertIndicadores', { totales: errorAlert }));
//                             }
//                         }}
//                     >
//                         {t('guardar')}
//                     </button>
//                 ) : (
//                     <div className="flex gap-2 w-full">
//                         <button className="bg-primary text-white px-2 py-1 rounded" onClick={() => setEditableRowIndex(index)}>
//                             {t('editar')}
//                         </button>
//                         <button className="bg-danger text-white px-2 py-1 rounded" onClick={() => handleEliminarFila(index)}>
//                             {t('eliminar')}
//                         </button>
//                     </div>
//                 ),
//         },
//     ];
//     const columnGroups = [
//         { id: 'descripcion', title: '', columns: columnNombre },
//         { id: 'metaAnual', title: t('Meta Anual'), textAlignment: 'center', columns: columnMetaAnual },
//         { id: 'ejecutado', title: t('Ejecutado'), textAlignment: 'center', columns: columnEjecutadoAnual },
//         { id: 'metaFinal', title: t('Meta Final'), textAlignment: 'center', columns: columnMetaFinal },
//         { id: 'final', title: '', columns: columns },
//     ];

//     useEffect(() => {
//         setInitialRecords(() => {
//             if (!search.trim()) return sortBy(indicadores, 'id');
//             const s = search.toLowerCase();
//             return indicadores.filter(
//                 (item) =>
//                     (item.descripcion && String(item.descripcion).toLowerCase().includes(s)) ||
//                     (item.metaAnual?.hombres !== undefined && String(item.metaAnual.hombres).toLowerCase().includes(s)) ||
//                     (item.metaAnual?.mujeres !== undefined && String(item.metaAnual.mujeres).toLowerCase().includes(s)) ||
//                     (item.metaAnual?.total !== undefined && String(item.metaAnual.total).toLowerCase().includes(s)) ||
//                     (item.ejecutado?.hombres !== undefined && String(item.ejecutado.hombres).toLowerCase().includes(s)) ||
//                     (item.ejecutado?.mujeres !== undefined && String(item.ejecutado.mujeres).toLowerCase().includes(s)) ||
//                     (item.ejecutado?.total !== undefined && String(item.ejecutado.total).toLowerCase().includes(s)) ||
//                     (item.metaFinal?.hombres !== undefined && String(item.metaFinal.hombres).toLowerCase().includes(s)) ||
//                     (item.metaFinal?.mujeres !== undefined && String(item.metaFinal.mujeres).toLowerCase().includes(s)) ||
//                     (item.metaFinal?.total !== undefined && String(item.metaFinal.total).toLowerCase().includes(s)) ||
//                     (item.hipotesis && item.hipotesis.toLowerCase().includes(s))
//             );
//         });
//     }, [search, indicadores]);

//     useEffect(() => {
//         const data = sortBy(initialRecords, sortStatus.columnAccessor);
//         setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
//         setPage(1);
//     }, [sortStatus]);

//     const handleSave = (seleccion: { idRealizacion: number; idsResultadosEnRealizacion: number[] }) => {
//         const indicadorBase = realizaciones.find((r) => r.id === seleccion.idRealizacion);
//         const nuevosIndicadores = [
//             ...indicador,
//             {
//                 id: seleccion.idRealizacion,
//                 descripcion: `${indicadorBase?.descripcion}`,
//                 idsResultados: seleccion.idsResultadosEnRealizacion,
//                 metaAnual: { hombres: 0, mujeres: 0, total: 0 },
//                 ejecutado: { hombres: 0, mujeres: 0, total: 0 },
//                 metaFinal: { hombres: 0, mujeres: 0, total: 0 },
//             },
//         ];
//         setIndicadores(nuevosIndicadores);
//         //if (onChangeIndicadores) onChangeIndicadores(nuevosIndicadores);
//     };

//     const handleOpenModal = () => {
//         const ultima = indicadores[indicadores.length - 1];
//         if (ultima && (!ultima.descripcion || !ultima.metaAnual?.total || !ultima.ejecutado?.total || !ultima.metaFinal?.total)) {
//             alert(t('completarUltimaFila', { tipo: t('Realizacion') }));
//             return;
//         }
//         setOpen(true);
//     };

//     const [open, setOpen] = useState(false);

//     return (
//         <div>
//             <div className="p-1 flex items-center space-x-4 mb-5 justify-between">
//                 <input type="text" className="border border-gray-300 rounded p-2 w-full max-w-xs" placeholder={t('Buscar') + ' ...'} value={search} onChange={(e) => setSearch(e.target.value)} />
//                 {creaccion && (
//                     <>
//                         <button className="px-4 py-2 bg-primary text-white rounded" onClick={handleOpenModal}>
//                             {t('newFileIndicador', { tipo: t('Realizacion') })}
//                         </button>
//                         {open && <ModalNuevoIndicadorAccion realizaciones={realizaciones} resultados={listadoIndicadoresResultados} open={open} onClose={() => setOpen(false)} onSave={handleSave} />}
//                     </>
//                 )}
//             </div>
//             <div>
//                 <DataTable
//                     className={`datatable-pagination-horizontal `}
//                     records={recordsData}
//                     groups={columnGroups}
//                     withRowBorders={false}
//                     withColumnBorders={true}
//                     striped={true}
//                     highlightOnHover={true}
//                     // onPageChange={(p) => setPage(p)}
//                     // onRecordsPerPageChange={setPageSize}
//                     sortStatus={sortStatus}
//                     onSortStatusChange={setSortStatus}
//                     minHeight={200}
//                     // paginationText={({ from, to, totalRecords }) => t('paginacion', { from: `${from}`, to: `${to}`, totalRecords: `${totalRecords}` })}
//                     // recordsPerPageLabel={t('recorsPerPage')}
//                 />
//             </div>
//         </div>
//     );
// });

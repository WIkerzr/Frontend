import { forwardRef, useEffect, useRef, useState } from 'react';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import { useTranslation } from 'react-i18next';
import { NewModal } from '../../components/Utils/utils';
import { NavLink } from 'react-router-dom';
import AnimateHeight from 'react-animate-height';
import { DatosAccion, datosInicializadosAccion } from '../../types/TipadoAccion';
import { IndicadorRealizacionAccion, IndicadorResultadoAccion } from '../../types/Indicadores';
import { sortBy } from 'lodash';
import { DataTable, DataTableSortStatus, DataTableColumnTextAlign } from 'mantine-datatable';
import { editableColumnByPath, visualColumnByPath } from './Acciones/Columnas';
import { Ejes } from '../../types/tipadoPlan';
import { useYear } from '../../contexts/DatosAnualContext';

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

interface ModalAccionProps {}

export const ModalAccion = () => {
    const { t, i18n } = useTranslation();
    const { yearData, NuevaAccion } = useYear();
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

        NuevaAccion(idEjeSeleccionado, nuevaAccion, nuevaLineaActuaccion);

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
            <div className="flex justify-center">
                <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition" onClick={() => setShowModal(true)}>
                    {t('anadirAccion')}
                </button>
            </div>
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
                {accionesMostradas.map((accion) => (
                    <div key={accion.id} className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg hover:shadow-md transition-shadow flex flex-col ">
                        <span className="text-base">{accion.accion}</span>
                        <span className="block text-sm text-gray-500 text-left font-medium mb-1">{t('LineaActuaccion')}:</span>
                        <span className="text-base">{accion.lineaActuaccion}</span>
                        <div className="flex gap-2 justify-end mt-2">
                            <NavLink to="/adr/acciones/editando" className="group">
                                <button
                                    aria-label={`Editar acción`}
                                    className="hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-1.5 rounded transition"
                                    onClick={() => SeleccionEditarAccion(idEje, accion.id)}
                                >
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

interface tablaIndicadoresProps {
    indicador: IndicadorRealizacionAccion[] | IndicadorResultadoAccion[];
    titulo: string;
}

export const TablaCuadroMando = forwardRef<HTMLButtonElement, tablaIndicadoresProps>(({ indicador, titulo }, ref) => {
    const { t } = useTranslation();
    const [initialRecords, setInitialRecords] = useState(sortBy(indicador, 'id'));
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [search, setSearch] = useState('');
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
        <div className="datatables">
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

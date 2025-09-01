/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NewModal } from '../../../components/Utils/utils';
import { TablaIndicadorAccion, VerificarCamposIndicadoresPorRellenar } from './EditarAccionComponent';
import React from 'react';
import { useYear } from '../../../contexts/DatosAnualContext';
import { Servicios } from '../../../types/GeneralTypes';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useIndicadoresContext } from '../../../contexts/IndicadoresContext';
import { IndicadorRealizacionAccion, IndicadorResultadoAccion } from '../../../types/Indicadores';

export const PestanaIndicadores = React.forwardRef<HTMLButtonElement>(() => {
    const { t } = useTranslation();
    const { datosEditandoAccion, setDatosEditandoAccion, block } = useYear();
    const [open, setOpen] = useState(false);
    const { ListadoNombresIdicadoresSegunADR } = useIndicadoresContext();
    const { editarPlan } = useEstadosPorAnio();
    const [carga, setCarga] = useState<boolean>(false);

    const [indicadoresRealizacionTabla, setIndicadoresRealizacionTabla] = useState<IndicadorRealizacionAccion[]>(datosEditandoAccion.indicadorAccion?.indicadoreRealizacion ?? []);
    const [indicadoresResultadoTabla, setIndicadoresResultadoTabla] = useState<IndicadorResultadoAccion[]>(datosEditandoAccion.indicadorAccion?.indicadoreResultado ?? []);

    const listadoNombresIndicadoresRealizacion = ListadoNombresIdicadoresSegunADR('realizacion');
    const listadoNombresIndicadoresResultado = ListadoNombresIdicadoresSegunADR('resultado');

    useEffect(() => {
        if (datosEditandoAccion.indicadorAccion?.indicadoreRealizacion) {
            setCarga(true);
        }

        const rescargarIndicadorRealizacion = datosEditandoAccion?.indicadorAccion?.indicadoreRealizacion;
        if (!rescargarIndicadorRealizacion) {
            return;
        }
        setIndicadoresRealizacionTabla(rescargarIndicadorRealizacion);

        const rescargarIndicadorResultado = datosEditandoAccion?.indicadorAccion?.indicadoreResultado;
        if (!rescargarIndicadorResultado) {
            return;
        }
        setIndicadoresResultadoTabla(rescargarIndicadorResultado);
    }, [datosEditandoAccion]);

    useEffect(() => {
        const indicadorActualizado = indicadoresRealizacionTabla.map((ind) => {
            const nombre = listadoNombresIndicadoresRealizacion.find((item) => item.id === ind.id)?.nombre || ind.descripcion;
            return {
                ...ind,
                descripcion: nombre,
            };
        });

        const haCambiado = indicadorActualizado.some((newInd, i) => newInd.descripcion !== indicadoresRealizacionTabla[i].descripcion);

        if (haCambiado) {
            setIndicadoresRealizacionTabla(indicadorActualizado);
        }
    }, [indicadoresRealizacionTabla]);

    useEffect(() => {
        const indicadorActualizado = indicadoresResultadoTabla.map((ind) => {
            const nombre = listadoNombresIndicadoresResultado.find((item) => item.id === ind.id)?.nombre || ind.descripcion;
            return {
                ...ind,
                descripcion: nombre,
            };
        });

        const haCambiado = indicadorActualizado.some((newInd, i) => newInd.descripcion !== indicadoresResultadoTabla[i].descripcion);

        if (haCambiado) {
            setIndicadoresResultadoTabla(indicadorActualizado);
        }
    }, [indicadoresResultadoTabla]);

    if (!carga) {
        return;
    }

    const handleSave = (seleccion: { idRealizacion: number; idsResultadosEnRealizacion: number[] }) => {
        const existeRealizacion = indicadoresRealizacionTabla.some((ind) => ind.id === seleccion.idRealizacion);
        const existeResultado = indicadoresResultadoTabla.some((ind) => seleccion.idsResultadosEnRealizacion.includes(ind.id));

        let continuar = true;

        if (existeRealizacion && existeResultado) {
            continuar = window.confirm('Algunos indicadores ya existen. ¿Deseas reemplazarlos?');
        } else if (existeRealizacion) {
            continuar = window.confirm('Algunos indicadores de Realizacion ya existen. ¿Deseas reemplazarlos?');
        }

        if (!continuar) return;

        const nuevosIndicadoresRealizacionAccion: IndicadorRealizacionAccion[] = [
            {
                id: seleccion.idRealizacion,
                descripcion: `${listadoNombresIndicadoresRealizacion.find((item) => item.id === seleccion.idRealizacion)?.nombre}`,
                metaAnual: { hombres: 0, mujeres: 0, total: 0 },
                ejecutado: { hombres: 0, mujeres: 0, total: 0 },
                metaFinal: { hombres: 0, mujeres: 0, total: 0 },
                hipotesis: '',
            },
        ];

        const nuevosIndicadoresResultadoAccion: IndicadorResultadoAccion[] = seleccion.idsResultadosEnRealizacion.map((id) => ({
            id,
            descripcion: listadoNombresIndicadoresResultado.find((item) => item.id === id)?.nombre ?? '',
            metaAnual: { hombres: 0, mujeres: 0, total: 0 },
            ejecutado: { hombres: 0, mujeres: 0, total: 0 },
            metaFinal: { hombres: 0, mujeres: 0, total: 0 },
            hipotesis: '',
        }));

        setDatosEditandoAccion((prev) => ({
            ...prev,
            indicadorAccion: {
                indicadoreRealizacion: [...(prev.indicadorAccion?.indicadoreRealizacion?.filter((ind) => ind.id !== seleccion.idRealizacion) ?? []), ...nuevosIndicadoresRealizacionAccion],
                indicadoreResultado: [
                    ...(prev.indicadorAccion?.indicadoreResultado?.filter((ind) => !seleccion.idsResultadosEnRealizacion.includes(ind.id)) ?? []),
                    ...nuevosIndicadoresResultadoAccion,
                ],
            },
        }));
    };

    const handleOpenModal = () => {
        if (VerificarCamposIndicadoresPorRellenar(datosEditandoAccion, t)) {
            setOpen(true);
        }
    };

    return (
        <TablaIndicadorAccion
            indicadoresRealizacion={indicadoresRealizacionTabla}
            setIndicadoresRealizacion={setIndicadoresRealizacionTabla}
            indicadoresResultado={indicadoresResultadoTabla}
            setIndicadoresResultado={setIndicadoresResultadoTabla}
            botonNuevoIndicadorAccion={
                <BtnNuevoIndicadorAccion
                    indicadoresRealizacionTabla={indicadoresRealizacionTabla}
                    indicadoresResultadoTabla={indicadoresResultadoTabla}
                    block={block}
                    editarPlan={editarPlan}
                    open={open}
                    setOpen={setOpen}
                    handleOpenModal={handleOpenModal}
                    handleSave={handleSave}
                />
            }
        />
    );
});

interface BtnNuevoIndicadorProps {
    indicadoresRealizacionTabla: IndicadorRealizacionAccion[];
    indicadoresResultadoTabla: IndicadorResultadoAccion[];
    block: boolean;
    editarPlan: boolean;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleOpenModal: () => void;
    handleSave: (data: any) => void;
}

const BtnNuevoIndicadorAccion: React.FC<BtnNuevoIndicadorProps> = ({ indicadoresRealizacionTabla, indicadoresResultadoTabla, block, editarPlan, open, setOpen, handleOpenModal, handleSave }) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between mb-5">
            {!block && editarPlan && (
                <div className="flex items-center space-x-4">
                    <button className="px-4 py-2 bg-primary text-white rounded" onClick={handleOpenModal}>
                        {t('newFileIndicador', { tipo: t('RealizacionMin') })}
                    </button>
                    {open && (
                        <ModalNuevoIndicadorAccion
                            indicadoresRealizacionTabla={indicadoresRealizacionTabla}
                            indicadoresResultadoTabla={indicadoresResultadoTabla}
                            open={open}
                            onClose={() => setOpen(false)}
                            onSave={handleSave}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

type Indicador = { id: number; nombre: string; checked: boolean; idsResultados?: number[] | undefined };

interface ModalNuevoIndicadorAccionProps {
    indicadoresRealizacionTabla: IndicadorRealizacionAccion[];
    indicadoresResultadoTabla: IndicadorResultadoAccion[];
    open: boolean;
    onClose: () => void;
    // realizaciones: Indicador[];
    onSave?: (seleccion: { idRealizacion: number; idsResultadosEnRealizacion: number[] }) => void;
}

export const ModalNuevoIndicadorAccion = forwardRef<HTMLDivElement, ModalNuevoIndicadorAccionProps>(function ModalNuevoIndicadorAccion(props, ref) {
    const { indicadoresRealizacionTabla, indicadoresResultadoTabla, open, onClose, onSave } = props;

    const [indicadorRealizacionId, setIndicadorRealizacionId] = useState<number | null>(null);
    const [resultadosRelacionados, setResultadosRelacionados] = useState<Indicador[]>([]);

    const { t } = useTranslation();
    const { ListadoNombresIdicadoresSegunADR } = useIndicadoresContext();

    const listadoNombresIndicadoresRealizacion = ListadoNombresIdicadoresSegunADR('realizacion');
    const listadoNombresIndicadoresResultado = ListadoNombresIdicadoresSegunADR('resultado');
    const listadoNombresIndicadoresRealizacionFiltrado = listadoNombresIndicadoresRealizacion.filter((item) => indicadoresRealizacionTabla.some((tabla) => tabla.id === item.id));
    const listadoNombresIndicadoresResultadoFiltrado = listadoNombresIndicadoresResultado.filter((item) => indicadoresResultadoTabla.some((tabla) => tabla.id === item.id));

    const handleToggleResultado = (id: number) => {
        setResultadosRelacionados((prevResultados) => prevResultados.map((resultado) => (resultado.id === id ? { ...resultado, checked: !resultado.checked } : resultado)));
    };

    const handleChangeRealizacion = (id: number) => {
        setIndicadorRealizacionId(id);
        const relacionados = listadoNombresIndicadoresRealizacion.find((r) => r.id === id)?.idsResultados ?? [];

        const resultadosFiltrados: Indicador[] = listadoNombresIndicadoresResultado
            .filter((resultado) => relacionados.includes(resultado.id))
            .map((resultado) => ({
                ...resultado,
                checked: true,
            }));

        setResultadosRelacionados(resultadosFiltrados);
    };

    const handleSave = () => {
        if (listadoNombresIndicadoresRealizacionFiltrado.some((f) => f.id === indicadorRealizacionId)) {
            console.log('Realizacion ya está en el listado');
            //TODO Que se prefiere que desaparezca las opciones, que lo sobrescriba avisando antes o aviso y ya?
            return;
        } else {
            console.log('Realizacion Nuevo');
        }

        resultadosRelacionados.forEach((resultado) => {
            if (listadoNombresIndicadoresResultadoFiltrado.some((f) => f.id === resultado.id)) {
                console.log('Resultado ya está en el listado');
                //TODO Que se prefiere que desaparezca las opciones, que lo sobrescriba avisando antes o aviso y ya?
                return;
            } else {
                console.log('Resultado Nuevo');
            }
        });

        if (onSave && indicadorRealizacionId !== null) {
            onSave({
                idRealizacion: indicadorRealizacionId,
                idsResultadosEnRealizacion: resultadosRelacionados.filter((r) => r.checked).map((r) => r.id),
            });
        }
        onClose();
    };

    return (
        <NewModal open={open} onClose={onClose} title={t('nuevoIndicadorRealizacion')}>
            <div ref={ref}>
                <label className="block mb-2 font-semibold">{t('seleccionaElIndicador', { tipo: t('Realizacion') })}:</label>
                <select className="w-full mb-4 border rounded px-2 py-1" value={indicadorRealizacionId ?? ''} onChange={(e) => handleChangeRealizacion(Number(e.target.value))}>
                    <option value="" disabled>
                        {t('seleccionaIndicador')}
                    </option>
                    {listadoNombresIndicadoresRealizacion.map((r) => (
                        <option className={`${r.nombre[4] === '.' ? 'bg-blue-200' : 'bg-white'}`} value={r.id} key={r.id}>
                            {r.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {indicadorRealizacionId && (
                <div>
                    <label className="block mb-2 font-semibold">{t('indicadoresResultadoRelacionados')}:</label>
                    <ul className="pl-0 mb-4">
                        {resultadosRelacionados.map((res) => (
                            <li key={res.id} className="mb-2">
                                <label className="flex items-center">
                                    <input type="checkbox" checked={res.checked} onChange={() => handleToggleResultado(res.id)} className="mr-2" />
                                    {res.nombre}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
                <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">
                    {t('cancelar')}
                </button>
                <button onClick={handleSave} className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded">
                    {t('anadir')}
                </button>
            </div>
        </NewModal>
    );
});

export const PestanaIndicadoresServicios = React.forwardRef<HTMLButtonElement>(() => {
    const { t } = useTranslation();
    const { editarPlan, editarMemoria } = useEstadosPorAnio();
    const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
    const { datosEditandoServicio, setDatosEditandoServicio } = useYear();

    if (!datosEditandoServicio) {
        return <p>{t('cargando')}</p>;
    }

    const setServicio = (callback: (prev: Servicios) => Servicios) => {
        if (!datosEditandoServicio) return;
        const actualizado = callback(datosEditandoServicio);
        setDatosEditandoServicio(actualizado);
    };

    const agregarIndicador = () => {
        setServicio((prev) => ({
            ...prev,
            indicadores: [
                ...prev.indicadores,
                {
                    indicador: '',
                    previsto: { valor: '' },
                    alcanzado: { valor: '' },
                },
            ],
        }));
    };

    const eliminarIndicador = (index: number) => {
        setServicio((prev) => ({
            ...prev,
            indicadores: prev.indicadores.filter((_, i) => i !== index),
        }));
    };

    return (
        <div className="panel">
            <div className="bg-[#76923b] p-2 font-bold border-l border border-black flex justify-between items-center">
                <span>*{t('indicadoresOperativos').toUpperCase()}</span>
                {editarPlan && (
                    <button type="button" onClick={agregarIndicador} className="px-4 py-1 bg-[#76923b] text-white font-bold border border-black">
                        {t('agregarFila')}
                    </button>
                )}
            </div>

            <table className="w-full border-collapse border-l border-r border-b border-black text-sm">
                <thead>
                    <tr>
                        <th className="border border-black bg-[#d3e1b4] p-1">{t('indicadores')}</th>
                        <th className="border border-black bg-[#d3e1b4] p-1">{t('valorPrevisto')}</th>
                        <th className="border border-black bg-[#b6c48e] p-1">{t('valorReal')}</th>
                        {editarPlan && <th className="border border-black bg-[#b6c48e] p-1 text-center">✖</th>}
                    </tr>
                </thead>
                <tbody>
                    {(datosEditandoServicio!.indicadores || []).map((indicador, index) => (
                        <tr key={index}>
                            {/* Indicador */}
                            <td className={`border border-black align-top p-1 ${editarPlan ? 'cursor-text' : ''}}`} onClick={() => inputRefs.current[index]?.[0]?.focus()}>
                                <input
                                    disabled={!editarPlan}
                                    ref={(el) => {
                                        if (!inputRefs.current[index]) inputRefs.current[index] = [];
                                        inputRefs.current[index][0] = el;
                                    }}
                                    type="text"
                                    value={indicador.indicador}
                                    onChange={(e) => {
                                        const nuevos = [...datosEditandoServicio.indicadores];
                                        nuevos[index] = { ...nuevos[index], indicador: e.target.value };
                                        setServicio((prev) => ({ ...prev, indicadores: nuevos }));
                                    }}
                                    className={`text-left w-full`}
                                />
                            </td>

                            {/* Valor previsto */}
                            <td className={`border border-black align-top p-1 ${editarPlan ? 'cursor-text' : ''}`} onClick={() => inputRefs.current[index]?.[1]?.focus()}>
                                <input
                                    disabled={!editarPlan}
                                    ref={(el) => {
                                        if (!inputRefs.current[index]) inputRefs.current[index] = [];
                                        inputRefs.current[index][1] = el;
                                    }}
                                    type="text"
                                    value={indicador.previsto?.valor || ''}
                                    onChange={(e) => {
                                        const nuevos = [...datosEditandoServicio.indicadores];
                                        nuevos[index] = {
                                            ...nuevos[index],
                                            previsto: { valor: e.target.value },
                                        };
                                        setServicio((prev) => ({ ...prev, indicadores: nuevos }));
                                    }}
                                    className={`text-center w-full`}
                                />
                            </td>

                            {/* Valor real */}
                            <td className={`border border-black align-top p-1 ${editarPlan || editarMemoria ? 'cursor-text' : ''} }`} onClick={() => inputRefs.current[index]?.[2]?.focus()}>
                                <input
                                    ref={(el) => {
                                        if (!inputRefs.current[index]) inputRefs.current[index] = [];
                                        inputRefs.current[index][2] = el;
                                    }}
                                    disabled={!editarPlan && !editarMemoria}
                                    type="text"
                                    value={indicador.alcanzado?.valor || ''}
                                    onChange={(e) => {
                                        const nuevos = [...datosEditandoServicio.indicadores];
                                        nuevos[index] = {
                                            ...nuevos[index],
                                            alcanzado: { valor: e.target.value },
                                        };
                                        setServicio((prev) => ({ ...prev, indicadores: nuevos }));
                                    }}
                                    className={`text-center w-full`}
                                />
                            </td>

                            {/* Botón eliminar */}
                            {editarPlan && (
                                <td className="border border-black text-center align-top p-1">
                                    <button type="button" onClick={() => eliminarIndicador(index)} className="text-red-600 font-bold" title="Eliminar fila">
                                        ✖
                                    </button>
                                </td>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
});

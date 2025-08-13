/* eslint-disable no-unused-vars */
import { forwardRef, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NewModal } from '../../../components/Utils/utils';
import { TablaIndicadorAccion } from './EditarAccionComponent';
import React from 'react';
import { useYear } from '../../../contexts/DatosAnualContext';
import { Servicios } from '../../../types/GeneralTypes';
import { useEstadosPorAnio } from '../../../contexts/RegionEstadosContext';

export const PestanaIndicadores = React.forwardRef<HTMLButtonElement>(() => {
    const { t } = useTranslation();

    return (
        <>
            <div className="panel mt-6 ">
                <span className="text-xl">{t('indicadorTipo', { tipo: t('RealizacionMin') })}</span>
                <TablaIndicadorAccion tipoTabla="realizacion" creaccion={true} />
            </div>
            <div className="panel mt-6 ">
                <span className="text-xl">{t('indicadorTipo', { tipo: t('ResultadoMin') })}</span>
                <TablaIndicadorAccion tipoTabla="resultado" />
            </div>
        </>
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

type Indicador = { id: number; descripcion: string; idsResultados?: number[] };

interface ModalNuevoIndicadorAccionProps {
    open: boolean;
    onClose: () => void;
    realizaciones: Indicador[];
    resultados: Indicador[];
    onSave?: (seleccion: { idRealizacion: number; idsResultadosEnRealizacion: number[] }) => void;
}

export const ModalNuevoIndicadorAccion = forwardRef<HTMLDivElement, ModalNuevoIndicadorAccionProps>(({ open, onClose, realizaciones, resultados, onSave }, ref) => {
    const [indicadorRealizacionId, setIndicadorRealizacionId] = useState<number | null>(null);
    const [seleccionados, setSeleccionados] = useState<number[]>([]);
    const { t } = useTranslation();

    const realizacionSeleccionada = realizaciones.find((r) => r.id === indicadorRealizacionId);
    const resultadosRelacionados = realizacionSeleccionada?.idsResultados ? resultados.filter((res) => realizacionSeleccionada.idsResultados!.includes(res.id)) : [];

    const handleToggleResultado = (id: number) => {
        setSeleccionados((sel) => (sel.includes(id) ? sel.filter((x) => x !== id) : [...sel, id]));
    };

    const handleChangeRealizacion = (id: number) => {
        setIndicadorRealizacionId(id);
        const relacionados = realizaciones.find((r) => r.id === id)?.idsResultados ?? [];
        setSeleccionados(relacionados);
    };

    const handleSave = () => {
        if (onSave && indicadorRealizacionId !== null) {
            onSave({
                idRealizacion: indicadorRealizacionId,
                idsResultadosEnRealizacion: seleccionados,
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
                    {realizaciones.map((r) => (
                        <option value={r.id} key={r.id}>
                            {r.descripcion}
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
                                    <input type="checkbox" checked={seleccionados.includes(res.id)} onChange={() => handleToggleResultado(res.id)} className="mr-2" />
                                    {res.descripcion}
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

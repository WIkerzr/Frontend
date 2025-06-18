/* eslint-disable no-unused-vars */
import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IndicadorRealizacionAccion } from '../../../types/Indicadores';
import { NewModal } from '../../../components/Utils/utils';
import { TablaIndicadorAccion } from './EditarAccionComponent';
import React from 'react';
interface tablaIndicadoresProps {
    creaccion?: boolean;
    onResultadosRelacionadosChange?: (resultados: IndicadorRealizacionAccion[]) => void;
    onChangeIndicadores?: (indicadores: IndicadorRealizacionAccion[]) => void;
}

export const PestanaIndicadores = React.forwardRef<HTMLButtonElement, tablaIndicadoresProps>(() => {
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

type Indicador = { id: number; descripcion: string; idsResultados?: number[] };

interface ModalNuevoIndicadorAccionProps {
    open: boolean;
    onClose: () => void;
    realizaciones: Indicador[];
    resultados: Indicador[];
    onSave?: (seleccion: { idRealizacion: number; idsResultadosEnRealizacion: number[] }) => void;
}

export const ModalNuevoIndicadorAccion = forwardRef<HTMLDivElement, ModalNuevoIndicadorAccionProps>(({ open, onClose, realizaciones, resultados, onSave }) => {
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
            <div>
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

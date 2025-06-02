import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IndicadorRealizacion, IndicadorResultado } from '../../../types/Indicadores';
import { NewModal } from '../../../components/Utils/utils';
import { TablaIndicadorAccion } from './EditarAccionComponent';
import { indicadoresResultado } from '../../../mocks/BBDD/indicadores';
import React from 'react';

interface tablaIndicadoresProps {
    indicador: {
        indicadoreRealizacion: IndicadorRealizacion[];
        indicadoreResultado: IndicadorResultado[];
    };
    creaccion?: boolean;
    onResultadosRelacionadosChange?: (resultados: IndicadorRealizacion[]) => void;
    onChangeIndicadores?: (indicadores: IndicadorRealizacion[]) => void;
}

export const PestanaIndicadores = React.forwardRef<HTMLButtonElement, tablaIndicadoresProps>(({ indicador }, ref) => {
    const [resultadosSeleccionados, setResultadosSeleccionados] = useState<IndicadorRealizacion[]>(indicador.indicadoreResultado);

    const handleResultadosRelacionadosChange = (nuevosResultados: number[]) => {
        setResultadosSeleccionados((anteriores) => {
            let suma = anteriores;
            let nue = nuevosResultados.map((id) => indicadoresResultado.find((res) => res.id === id));
            for (let index = 0; index < nue.length; index++) {
                const element = nue[index];
                suma.push(element!);
            }
            return [...suma];
        });
    };

    return (
        <>
            <TablaIndicadorAccion
                indicador={indicador.indicadoreRealizacion}
                indicadoresResultados={resultadosSeleccionados}
                creaccion={true}
                onResultadosRelacionadosChange={handleResultadosRelacionadosChange}
            />
            <TablaIndicadorAccion indicador={resultadosSeleccionados} />
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
        <NewModal open={open} onClose={onClose} title="Nuevo Indicador de Acción">
            <div>
                <label className="block mb-2 font-semibold">Indicador de realización:</label>
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
                    Cancelar
                </button>
                <button onClick={handleSave} className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded">
                    Guardar
                </button>
            </div>
        </NewModal>
    );
});

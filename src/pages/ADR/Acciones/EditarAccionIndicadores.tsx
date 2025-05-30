import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { forwardRef, useEffect, useState } from 'react';
import { editableColumnByPath } from './Columnas';
import { sortBy } from 'lodash';
import { useTranslation } from 'react-i18next';
import { IndicadorAccion } from '../../../types/Indicadores';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { NewModal } from '../../../components/Utils/utils';
import { TablaIndicadorAccion } from './EditarAccionComponent';
import { indicadoresRealizacion, indicadoresResultado } from '../../../mocks/BBDD/indicadores';
import React from 'react';

//Temporal

const resultados: IndicadorAccion[] = indicadoresResultado.map(({ id, descripcion, ano, ...rest }) => ({
    id,
    nombre: descripcion,
    ano,
    ...rest,
}));

interface tablaIndicadoresProps {
    indicador: IndicadorAccion[];
    indicadoresResultados?: IndicadorAccion[];
    creaccion?: boolean;
    onResultadosRelacionadosChange?: (resultados: IndicadorAccion[]) => void;
    onChangeIndicadores?: (indicadores: IndicadorAccion[]) => void;
}

export const PestanaIndicadores = React.forwardRef<HTMLButtonElement, tablaIndicadoresProps>(({ indicador }, ref) => {
    const realizaciones: IndicadorAccion[] = indicador;
    const todosLosIdsResultados = Array.from(new Set(realizaciones.flatMap((r) => r.idsResultados ?? [])));
    const resultadosFiltrados = resultados.filter((res) => todosLosIdsResultados.includes(res.id));

    const [resultadosSeleccionados, setResultadosSeleccionados] = useState<IndicadorAccion[]>(resultadosFiltrados);

    const handleResultadosRelacionadosChange = (nuevosResultados: IndicadorAccion[]) => {
        setResultadosSeleccionados(nuevosResultados);
    };

    return (
        <>
            <TablaIndicadorAccion indicador={indicador} indicadoresResultados={resultados} creaccion={true} onResultadosRelacionadosChange={handleResultadosRelacionadosChange} />
            <TablaIndicadorAccion indicador={resultadosSeleccionados} />
        </>
    );
});

type Indicador = { id: number; nombre: string; idsResultados?: number[] };

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
                                    <input type="checkbox" checked={seleccionados.includes(res.id)} onChange={() => handleToggleResultado(res.id)} className="mr-2" />
                                    {res.nombre}
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

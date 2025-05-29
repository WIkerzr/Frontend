import { get, set } from 'lodash';
import { indicadoresRealizacion } from '../../../mocks/BBDD/indicadores';
import { useState, useEffect } from 'react';

export function editableColumnByPath<T extends object>(
    accessor: string,
    title: string,
    setIndicadores: React.Dispatch<React.SetStateAction<T[]>>,
    editableRowIndex: number | null,
    required = false,
    sumTotal?: number
) {
    const [indicadorSeleccionado, setIndicadorSeleccionado] = useState<string | undefined>(undefined);

    useEffect(() => {
        setIndicadorSeleccionado(undefined);
    }, [editableRowIndex]);

    return {
        accessor,
        title,
        sortable: true,
        render: (row: T, index: number) => {
            if (title === 'Tot.' && sumTotal && sumTotal > 0) {
                return <input className="border p-1 rounded bg-gray-100 text-gray-700" value={sumTotal} style={{ maxWidth: 60 }} readOnly disabled />;
            }

            if (editableRowIndex === index) {
                return title !== 'Nombre' ? (
                    <input
                        className="border p-1 rounded"
                        value={get(row, accessor) ?? ''}
                        required={required}
                        style={{ maxWidth: accessor !== 'nombre' && accessor !== 'hipotesis' ? 60 : 300 }}
                        onChange={(e) => {
                            setIndicadores((prevRows) => {
                                const copy = [...prevRows];
                                const updatedRow = { ...copy[index] };
                                set(updatedRow as object, accessor, e.target.value);
                                copy[index] = updatedRow;
                                return copy;
                            });
                        }}
                    />
                ) : (
                    <div>
                        <select
                            id="indicadores"
                            className="p-2 border rounded focus:outline-none focus:ring focus:ring-blue-200 max-w-[350px]"
                            value={indicadorSeleccionado !== undefined ? indicadorSeleccionado : get(row, accessor) ?? ''}
                            onChange={(e) => {
                                setIndicadorSeleccionado(e.target.value);
                                setIndicadores((prevRows) => {
                                    const copy = [...prevRows];
                                    const updatedRow = { ...copy[index] };
                                    set(updatedRow as object, accessor, e.target.value);
                                    copy[index] = updatedRow;
                                    return copy;
                                });
                            }}
                        >
                            {indicadoresRealizacion.map((inVal) => (
                                <option key={inVal.id} value={inVal.descripcion}>
                                    {inVal.descripcion}
                                </option>
                            ))}
                        </select>
                    </div>
                );
            }

            // No editable (solo vista)
            return (
                <span
                    style={{
                        maxWidth: accessor !== 'nombre' && accessor !== 'hipotesis' ? 60 : 300,
                        display: 'inline-block',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap',
                    }}
                >
                    {get(row, accessor)}
                </span>
            );
        },
    };
}

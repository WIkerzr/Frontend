import { get, set } from 'lodash';

export function editableColumnByPath<T extends object>(accessor: string, title: string, setIndicadores: React.Dispatch<React.SetStateAction<T[]>>, editableRowIndex: number | null, required = false) {
    return {
        accessor,
        title,
        sortable: true,
        render: (row: T, index: number) =>
            editableRowIndex === index ? (
                <input
                    className="border p-1 rounded"
                    value={get(row, accessor) ?? ''}
                    required={required}
                    style={{ maxWidth: accessor != 'nombre' && accessor != 'hipotesis' ? 60 : 300 }}
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
                <span style={{ maxWidth: accessor != 'nombre' && accessor != 'hipotesis' ? 60 : 300, display: 'inline-block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {get(row, accessor)}
                </span>
            ),
    };
}

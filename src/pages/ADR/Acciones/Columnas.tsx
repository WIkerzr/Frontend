/* eslint-disable no-unused-vars */
import { get, set } from 'lodash';
import { DataTableColumnTextAlign } from 'mantine-datatable';
import IconArrowLeft from '../../../components/Icon/IconArrowLeft';
import IconEqual from '../../../components/Icon/IconEqual';
const totalKeys = {
    'metaAnual.total': { root: 'metaAnual', hombres: 'metaAnual.hombres', mujeres: 'metaAnual.mujeres', total: 'metaAnual.total' },
    'metaFinal.total': { root: 'metaFinal', hombres: 'metaFinal.hombres', mujeres: 'metaFinal.mujeres', total: 'metaFinal.total' },
    'ejecutado.total': { root: 'ejecutado', hombres: 'ejecutado.hombres', mujeres: 'ejecutado.mujeres', total: 'ejecutado.total' },
};

export function editableColumnByPath<T extends object>(accessor: string, title: string, setIndicadores: React.Dispatch<React.SetStateAction<T[]>>, editableRowIndex: number | null, editable = true) {
    const commonStyleNumber: React.CSSProperties = {
        maxWidth: 60,
        width: '100%',
        minWidth: 60,
        textAlign: 'center',
        height: 32,
        lineHeight: '32px',
        boxSizing: 'border-box',
    };
    const wrapperStyleNumber: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
    };

    const commonStyleText: React.CSSProperties = {
        maxWidth: accessor === 'descripcion' ? 250 : 200,
        width: '100%',
        minWidth: accessor === 'descripcion' ? 250 : 200,
        textAlign: 'left',
        lineHeight: '32px',
        boxSizing: 'border-box',
    };
    const wrapperStyleText: React.CSSProperties = {
        display: 'flex',
        justifyContent: 'left',
        alignItems: 'start',
    };
    return {
        accessor,
        title,
        sortable: true,
        render: (row: T, index: number) => {
            const isEditable = editableRowIndex === index && editable;

            const value = get(row, accessor);
            const visual = value === 0 || value === '0' || value === '' || value === null || typeof value === 'undefined' ? '-' : value;

            if (accessor.endsWith('total')) {
                const keys = totalKeys[accessor as keyof typeof totalKeys];
                const hombres = Number(get(row, keys.hombres)) || 0;
                const mujeres = Number(get(row, keys.mujeres)) || 0;
                const total = Number(get(row, keys.total)) || 0;
                const ambosCero = hombres === 0 && mujeres === 0;

                return (
                    <div style={wrapperStyleNumber}>
                        {isEditable ? (
                            <input
                                className={ambosCero ? 'border p-1 rounded text-center' : 'border p-1 rounded bg-gray-100 text-gray-700 text-center'}
                                value={ambosCero ? total : hombres + mujeres}
                                style={commonStyleNumber}
                                readOnly={!ambosCero}
                                onChange={(e) => {
                                    if (ambosCero) {
                                        setIndicadores((prevRows) => {
                                            const copy = [...prevRows];
                                            const updatedRow = { ...copy[index] };
                                            set(updatedRow as object, accessor, Number(e.target.value));
                                            copy[index] = updatedRow;
                                            return copy;
                                        });
                                    } else {
                                        setIndicadores((prevRows) => {
                                            const copy = [...prevRows];
                                            const updatedRow = { ...copy[index] };
                                            set(updatedRow as object, accessor, Number(e.target.value));
                                            copy[index] = updatedRow;
                                            return copy;
                                        });
                                    }
                                }}
                            />
                        ) : (
                            <span style={commonStyleNumber}>{ambosCero ? total : hombres + mujeres}</span>
                        )}
                    </div>
                );
            }

            if (accessor.endsWith('mujeres') || accessor.endsWith('hombres')) {
                return (
                    <div style={wrapperStyleNumber}>
                        {isEditable ? (
                            <input
                                className="border p-1 rounded text-center"
                                value={get(row, accessor) ?? ''}
                                required={true}
                                style={commonStyleNumber}
                                onChange={(e) => {
                                    const nuevoValor = Number(e.target.value) || 0;
                                    const accessorContrario = accessor.endsWith('mujeres') ? accessor.replace('mujeres', 'hombres') : accessor.replace('hombres', 'mujeres');

                                    const valorContrario = Number(get(row, accessorContrario)) || 0;

                                    const accessorTotal = accessor.replace(/(mujeres|hombres)$/, 'total');

                                    setIndicadores((prevRows) => {
                                        const copy = [...prevRows];
                                        const updatedRow = { ...copy[index] };
                                        set(updatedRow as object, accessor, nuevoValor);
                                        set(updatedRow as object, accessorTotal, nuevoValor + valorContrario);
                                        copy[index] = updatedRow;
                                        return copy;
                                    });
                                }}
                            />
                        ) : (
                            <span style={commonStyleNumber}>{visual}</span>
                        )}
                    </div>
                );
            }

            return (
                <div style={wrapperStyleText}>
                    {isEditable ? (
                        <input
                            className="border p-1 rounded text-left"
                            value={get(row, accessor) ?? ''}
                            required={true}
                            style={commonStyleText}
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
                        <span style={commonStyleText}>{visual}</span>
                    )}
                </div>
            );
        },
    };
}
type CustomEditor<T, V> = (value: V, onChange: (value: V) => void, row: T, index: number) => React.ReactNode;

export function editableColumnByPathInput<T extends { id: number }, V = unknown>(
    accessor: string,
    title: string,
    setIndicadores: React.Dispatch<React.SetStateAction<T[]>>,
    editableRowIndex: number | null,
    anchura?: number,
    customEditor?: CustomEditor<T, V>
) {
    const isNested = accessor.includes('.');
    if (!anchura) {
        anchura = isNested ? 60 : accessor === 'descripcion' || accessor === 'hipotesis' ? 300 : 400;
    }

    return {
        accessor,
        title,
        width: anchura,
        render: (row: T, index: number) => {
            const value = get(row, accessor) as V;

            const style: React.CSSProperties = {
                width: anchura,
                maxWidth: anchura,
                minWidth: anchura,
                textAlign: 'left',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
                whiteSpace: 'nowrap',
                boxSizing: 'border-box',
            };

            if (editableRowIndex != null && editableRowIndex === index) {
                const onChange = (newValue: V) => {
                    setIndicadores((prevRows) => {
                        return prevRows.map((item) => {
                            if (item.id === row.id) {
                                const updatedItem = { ...item };
                                set(updatedItem as object, accessor, newValue);
                                return updatedItem;
                            }
                            return item;
                        });
                    });
                };

                if (customEditor) {
                    return customEditor(value, onChange, row, index);
                }

                return <input className="border p-1 rounded text-left" value={String(value ?? '')} required style={style} onChange={(e) => onChange(e.target.value as V)} />;
            } else {
                if (accessor === 'objetivo') {
                    if (value && (value === 'Aumentar' || value === 'Mantener' || value === 'Disminuir')) {
                        switch (value) {
                            case 'Aumentar':
                                return (
                                    <div>
                                        <IconArrowLeft className="w-5 h-5 -rotate-90" />
                                    </div>
                                );
                            case 'Mantener':
                                return (
                                    <div>
                                        <IconEqual className="w-5 h-5" />
                                    </div>
                                );
                            case 'Disminuir':
                                return (
                                    <div>
                                        <IconArrowLeft className="w-5 h-5 rotate-90" />
                                    </div>
                                );
                        }
                    }
                }
                const visual = value === 0 || value === '0' || value === '' || value === null || typeof value === 'undefined' ? '-' : value;

                return <span style={style}>{String(visual)}</span>;
            }
        },
    };
}

export function visualColumnByPath<T extends object>(accessor: string, title: string) {
    return {
        accessor,
        title,
        textAlign: 'center' as DataTableColumnTextAlign,
        sortable: true,
        render: (row: T) => {
            if (((title === 'Tot.' || title === 'Total') && accessor === 'metaAnual.total') || accessor === 'metaFinal.total' || accessor === 'ejecutado.total') {
                const keys = totalKeys[accessor as keyof typeof totalKeys];
                const hombres = Number(get(row, keys.hombres)) || 0;
                const mujeres = Number(get(row, keys.mujeres)) || 0;
                const total = Number(get(row, keys.total)) || 0;
                const ambosCero = hombres === 0 && mujeres === 0;

                return (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <span
                            style={{
                                maxWidth: 60,
                                display: 'inline-block',
                                margin: '0 auto',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                whiteSpace: 'nowrap',
                            }}
                        >
                            {ambosCero ? total : hombres + mujeres}
                        </span>
                    </div>
                );
            }

            if (accessor.startsWith('porcentaje')) {
                const metaHombres = Number(get(row, 'metaAnual.hombres')) || 0;
                const metaMujeres = Number(get(row, 'metaAnual.mujeres')) || 0;
                const metaTotal = Number(get(row, 'metaAnual.total')) || 0;
                const ejecutadoHombres = Number(get(row, 'ejecutado.hombres')) || 0;
                const ejecutadoMujeres = Number(get(row, 'ejecutado.mujeres')) || 0;
                const ejecutadoTotal = Number(get(row, 'ejecutado.total')) || 0;

                const porcentajeHombre = ejecutadoHombres > 0 ? (ejecutadoHombres / metaHombres) * 100 : 0;
                const porcentajeMujeres = ejecutadoMujeres > 0 ? (ejecutadoMujeres / metaMujeres) * 100 : 0;

                let width = 0;
                switch (title) {
                    case 'Hbr.':
                        width = porcentajeHombre;
                        break;

                    case 'Muj.':
                        width = porcentajeMujeres;
                        break;

                    case 'Tot.': {
                        let porcentajeTotal = 0;
                        if (porcentajeHombre != 0 || porcentajeMujeres != 0) {
                            porcentajeTotal = (porcentajeHombre + porcentajeMujeres) / 2;
                        } else {
                            porcentajeTotal = ejecutadoTotal > 0 ? (ejecutadoTotal / metaTotal) * 100 : 0;
                        }
                        width = porcentajeTotal;
                        break;
                    }
                }

                let colorFrom = '#A1EE89';
                let colorTo = '#8ED279';
                if (width >= 50 && width <= 85) {
                    colorFrom = '#EADB87';
                    colorTo = '#D5C778';
                } else if (width < 50) {
                    colorFrom = '#F76A6A';
                    colorTo = '#DD5D5D';
                }

                return width === 0 && (title === 'Hbr.' || title === 'Muj.') ? (
                    <div>
                        <span className="block text-center">-</span>
                    </div>
                ) : (
                    <div className="flex items-center justify-between">
                        <div className="w-5/6 rounded-full h-5 p-1 bg-dark-light overflow-hidden shadow-3xl dark:shadow-none dark:bg-dark-light/10">
                            <div
                                className="bg-gradient-to-r w-full h-full rounded-full relative before:absolute before:inset-y-0 ltr:before:right-0.5 rtl:before:left-0.5 before:bg-white before:w-2 before:h-2 before:rounded-full before:m-auto"
                                style={{
                                    width: width,
                                    background: `linear-gradient(to right, ${colorFrom}, ${colorTo})`,
                                }}
                            ></div>
                        </div>
                        <span className="w-1/6 ltr:ml-5 rtl:mr-5 dark:text-white-light text-xs text-right">{width}%</span>
                    </div>
                );
            }

            const value = get(row, accessor);
            const visual = value === 0 || value === '0' || value === '' || value === null || typeof value === 'undefined' ? '-' : value;
            return (
                <div style={accessor === 'descripcion' || accessor === 'hipotesis' ? {} : { display: 'flex', justifyContent: 'left' }}>
                    <span
                        className={accessor === 'descripcion' || accessor === 'hipotesis' ? 'text-left' : 'text-center'}
                        style={{
                            maxWidth: accessor !== 'descripcion' && accessor !== 'hipotesis' ? 60 : 300,
                            display: 'inline-block',
                            margin: '0 auto',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap',
                        }}
                    >
                        {visual}
                    </span>
                </div>
            );
        },
    };
}

import { get, set } from 'lodash';
import { indicadoresRealizacion } from '../../../mocks/BBDD/indicadores';
import { useState, useEffect } from 'react';
import { DataTableColumnTextAlign } from 'mantine-datatable';
import { useTranslation } from 'react-i18next';

const totalKeys = {
    'metaAnual.total': { root: 'metaAnual', hombres: 'metaAnual.hombres', mujeres: 'metaAnual.mujeres', total: 'metaAnual.total' },
    'metaFinal.total': { root: 'metaFinal', hombres: 'metaFinal.hombres', mujeres: 'metaFinal.mujeres', total: 'metaFinal.total' },
    'ejecutado.total': { root: 'ejecutado', hombres: 'ejecutado.hombres', mujeres: 'ejecutado.mujeres', total: 'ejecutado.total' },
};

export function editableColumnByPath<T extends object>(accessor: string, title: string, setIndicadores: React.Dispatch<React.SetStateAction<T[]>>, editableRowIndex: number | null, editable = true) {
    const [indicadorSeleccionado, setIndicadorSeleccionado] = useState<string | undefined>(undefined);

    useEffect(() => {
        setIndicadorSeleccionado(undefined);
    }, [editableRowIndex]);

    return {
        accessor,
        title,
        sortable: true,
        render: (row: T, index: number) => {
            if (((title === 'Tot.' || title === 'Total') && accessor === 'metaAnual.total') || accessor === 'metaFinal.total' || accessor === 'ejecutado.total') {
                const keys = totalKeys[accessor as keyof typeof totalKeys];
                const hombres = Number(get(row, keys.hombres)) || 0;
                const mujeres = Number(get(row, keys.mujeres)) || 0;
                const total = Number(get(row, keys.total)) || 0;
                const ambosCero = hombres === 0 && mujeres === 0;

                if (editableRowIndex === index && editable) {
                    return (
                        <input
                            className={ambosCero ? 'border p-1 rounded text-center' : 'border p-1 rounded bg-gray-100 text-gray-700 text-center'}
                            value={ambosCero ? total : hombres + mujeres}
                            style={{ maxWidth: 60 }}
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
                                }
                            }}
                        />
                    );
                }

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

            // if (editableRowIndex === index && editable && title === 'Nombre') {
            //     return (
            //         <div>
            //             <select
            //                 id="indicadores"
            //                 className="p-2 border rounded focus:outline-none focus:ring focus:ring-blue-200 max-w-[350px] text-center"
            //                 value={indicadorSeleccionado !== undefined ? indicadorSeleccionado : get(row, accessor) ?? ''}
            //                 onChange={(e) => {
            //                     setIndicadorSeleccionado(e.target.value);
            //                     setIndicadores((prevRows) => {
            //                         const copy = [...prevRows];
            //                         const updatedRow = { ...copy[index] };
            //                         set(updatedRow as object, accessor, e.target.value);
            //                         copy[index] = updatedRow;
            //                         return copy;
            //                     });
            //                 }}
            //             >
            //                 {indicadoresRealizacion.map((inVal) => (
            //                     <option key={inVal.id} value={inVal.descripcion}>
            //                         {inVal.descripcion}
            //                     </option>
            //                 ))}
            //             </select>
            //         </div>
            //     );
            // }

            if (editableRowIndex === index && editable) {
                return (
                    <input
                        className={`border p-1 rounded ${accessor === 'descripcion' || accessor === 'hipotesis' ? 'text-left' : 'text-center'}`}
                        value={get(row, accessor) ?? ''}
                        required={true}
                        style={{ maxWidth: accessor !== 'descripcion' && accessor !== 'hipotesis' ? 60 : 300 }}
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
                );
            } else {
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
            }
        },
    };
}
export function visualColumnByPath<T extends object>(accessor: string, title: string) {
    const { t } = useTranslation();
    const [hombresTotal, setHombresTotal] = useState(0);
    const [mujeresTotal, setMujeresTotal] = useState(0);
    const [totalTotal, setTotalTotal] = useState(0);

    return {
        accessor,
        title,
        textAlign: 'center' as DataTableColumnTextAlign,
        sortable: true,
        render: (row: T, index: number) => {
            if (((title === 'Tot.' || title === 'Total') && accessor === 'metaAnual.total') || accessor === 'metaFinal.total' || accessor === 'ejecutado.total') {
                const keys = totalKeys[accessor as keyof typeof totalKeys];
                const hombres = Number(get(row, keys.hombres)) || 0;
                const mujeres = Number(get(row, keys.mujeres)) || 0;
                const total = Number(get(row, keys.total)) || 0;
                const ambosCero = hombres === 0 && mujeres === 0;
                if (hombres != 0) {
                    setHombresTotal(hombresTotal + hombres);
                }
                if (mujeres != 0) {
                    setMujeresTotal(mujeresTotal + mujeres);
                }
                if (total != 0) {
                    setTotalTotal(totalTotal + total);
                }
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

            if (title === 'Tot.' && accessor === 'porcentajeHombres') {
                console.log('hombresTotal');
                console.log(hombresTotal);
                console.log('mujeresTotal');
                console.log(mujeresTotal);
                console.log('totalTotal');
                console.log(totalTotal);

                const keys = totalKeys[accessor as keyof typeof totalKeys];
                return (
                    <div style={{ display: 'flex', justifyContent: 'center' }}>
                        <div className={`h-2.5 rounded-full rounded-bl-full text-center text-white text-xs bg-purple-600`} style={{ width: `${100}%` }}></div>
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

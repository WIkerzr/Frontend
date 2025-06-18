import { get, set } from 'lodash';
import { DataTableColumnTextAlign } from 'mantine-datatable';
const totalKeys = {
    'metaAnual.total': { root: 'metaAnual', hombres: 'metaAnual.hombres', mujeres: 'metaAnual.mujeres', total: 'metaAnual.total' },
    'metaFinal.total': { root: 'metaFinal', hombres: 'metaFinal.hombres', mujeres: 'metaFinal.mujeres', total: 'metaFinal.total' },
    'ejecutado.total': { root: 'ejecutado', hombres: 'ejecutado.hombres', mujeres: 'ejecutado.mujeres', total: 'ejecutado.total' },
};

export function editableColumnByPath<T extends object>(accessor: string, title: string, setIndicadores: React.Dispatch<React.SetStateAction<T[]>>, editableRowIndex: number | null, editable = true) {
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
                if (accessor.endsWith('mujeres') || accessor.endsWith('hombres')) {
                    return (
                        <input
                            className="border p-1 rounded text-center"
                            value={get(row, accessor) ?? ''}
                            required={true}
                            style={{ maxWidth: 60 }}
                            onChange={(e) => {
                                const nuevoValor = Number(e.target.value) || 0;
                                const accessorContrario = accessor.endsWith('mujeres') ? accessor.replace('mujeres', 'hombres') : accessor.replace('hombres', 'mujeres');

                                const valorContrario = Number(get(row, accessorContrario)) || 0;

                                const accessorTotal = accessor.replace(/(mujeres|hombres)$/, 'total');

                                setIndicadores((prevRows) => {
                                    const copy = [...prevRows];
                                    const updatedRow = { ...copy[index] };

                                    // Actualiza el campo editado
                                    set(updatedRow as object, accessor, nuevoValor);

                                    // Actualiza el total sumando el nuevo valor + el contrario
                                    set(updatedRow as object, accessorTotal, nuevoValor + valorContrario);

                                    copy[index] = updatedRow;
                                    return copy;
                                });
                            }}
                        />
                    );
                } else {
                    //descripcion o hipotesis
                    return (
                        <input
                            className={`border p-1 rounded text-left`}
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
                }
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

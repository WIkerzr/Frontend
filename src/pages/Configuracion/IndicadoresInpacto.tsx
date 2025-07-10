import { DataTable, DataTableColumn, DataTableSortStatus } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { listadoIndicadoresImpacto, IndicadoresImpacto, categorias, unidadesMedida } from './IndicadoresImpactoTEMP';
import { editableColumnByPathInput } from '../ADR/Acciones/Columnas';
import { Button } from '@mantine/core';

type typeObjetivo = 'Aumentar' | 'Disminuir' | 'Mantener';
interface Indicador {
    id: number;
    indicador: string;
    categoria: string;
    unidad: string;
    alcance: string;
    year: string;
    valorInicial: string;
    objetivo?: typeObjetivo;
    valorFinal: string;
    [key: string]: string | number | undefined;
}

function convertirIndicadores(impactos: IndicadoresImpacto[]): Indicador[] {
    const resultados: Indicador[] = [];

    impactos.forEach((item) => {
        if (item.categorias && item.categorias.length > 0) {
            item.categorias.forEach((catId) => {
                const categoriaEncontrada = categorias.find((cat) => cat.id === catId);
                resultados.push({
                    id: item.id,
                    indicador: item.nameEs,
                    categoria: categoriaEncontrada ? categoriaEncontrada.nameEs : `Categoría ${catId}`,
                    unidad: categoriaEncontrada ? `${unidadesMedida.find((med) => med.id === categoriaEncontrada!.unidadMedida)?.nameEs}` : `FALLO UNIDAD MEDIDA`,
                    alcance: '',
                    year: '',
                    valorInicial: '',
                    valorFinal: '',
                });
            });
        } else {
            const unidadMedidaEncontrada = unidadesMedida.find((med) => med.id === item.unidadMedida);
            resultados.push({
                id: item.id,
                indicador: item.nameEs,
                categoria: '-',
                unidad: unidadMedidaEncontrada ? unidadMedidaEncontrada.nameEs : 'FALLO UNIDAD MEDIDA',
                alcance: '',
                year: '',
                valorInicial: '',
                valorFinal: '',
            });
        }
    });

    return resultados;
}
// 39
// 11
// 43
// 49
// 30
// 9

const Index = () => {
    const nuevosIndicadores = convertirIndicadores(listadoIndicadoresImpacto);

    const [indicadores, setIndicadores] = useState<Indicador[]>(nuevosIndicadores);
    useEffect(() => {
        setIndicadores((prev) => {
            const nuevos = [...prev];
            nuevos[0] = {
                ...nuevos[0],
                alcance: 'Zona rural (ZEA + TER+ zona rural de HRD)',
                year: '2025',
                valorInicial: '14254',
                objetivo: 'Disminuir',
                valorFinal: '214323',
            };
            return nuevos;
        });
    }, []);
    const [editableRowIndex, setEditableRowIndex] = useState<number | null>(null);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Indicador>>({
        columnAccessor: 'indicador',
        direction: 'asc',
    });

    const columns: DataTableColumn<Indicador>[] = [
        {
            accessor: 'indicador',
            title: 'Indicador',
            sortable: true,
            width: 400,
            render: (record: Indicador, index) => {
                const indicador = record.indicador;

                const indices = indicadores.map((r, i) => (r.indicador === indicador ? i : -1)).filter((i) => i !== -1);

                const firstIndex = Math.min(...indices);
                const lastIndex = Math.max(...indices);

                const isFirst = index === firstIndex;
                const isLast = index === lastIndex;

                return (
                    <div style={{ position: 'relative', minHeight: 40, paddingLeft: 20 }}>
                        {isFirst && <div style={{ fontWeight: 'bold' }}>{indicador}</div>}
                        {index > firstIndex && index < lastIndex && (
                            <div
                                style={{
                                    position: 'absolute',
                                    top: 0,
                                    bottom: 0,
                                    width: 2,
                                    backgroundColor: 'blue',
                                    marginLeft: 2,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                }}
                            />
                        )}
                        {index > firstIndex && isLast && (
                            <>
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: '50%',
                                        top: 0,
                                        bottom: 0,
                                        height: '80%',
                                        width: 2,
                                        backgroundColor: 'blue',
                                        transform: 'translateX(-50%)',
                                    }}
                                ></div>
                                <div
                                    style={{
                                        position: 'absolute',
                                        left: '51%',
                                        bottom: 4,
                                        width: 0,
                                        height: '10%',
                                        borderTop: '6px solid transparent',
                                        borderBottom: '6px solid transparent',
                                        borderLeft: '6px solid blue',
                                    }}
                                />
                            </>
                        )}
                    </div>
                );
            },
        },
        { accessor: 'categoria', title: 'Categoria', sortable: true, width: 200 },
        { accessor: 'unidad', title: 'Unidad de medida', sortable: true, width: 100 },
        editableColumnByPathInput<Indicador, string>('alcance', 'Alcance Territorial', setIndicadores, editableRowIndex, 300, (value, onChange) => (
            <select className="border p-1 rounded" value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="Comarcal">Comarcal</option>
                <option value="ZEA">ZEA</option>
                <option value="Zona rural (ZEA + TER+ zona rural de HRD)">Zona rural (ZEA + TER+ zona rural de HRD)</option>
                <option value="Municipios rurales (ZEA + TER)">Municipios rurales (ZEA + TER)</option>
            </select>
        )),
        editableColumnByPathInput<Indicador>('year', 'Año', setIndicadores, editableRowIndex, 60),
        editableColumnByPathInput<Indicador>('valorInicial', 'Valor Inicial', setIndicadores, editableRowIndex, 80),
        editableColumnByPathInput<Indicador, string>('objetivo', 'Objetivo', setIndicadores, editableRowIndex, 100, (value, onChange) => (
            <select className="border p-1 rounded" value={value} onChange={(e) => onChange(e.target.value)}>
                <option value="Aumentar">Aumentar</option>
                <option value="Mantener">Mantener</option>
                <option value="Disminuir">Disminuir</option>
            </select>
        )),
        editableColumnByPathInput<Indicador>('valorFinal', 'Valor Final', setIndicadores, editableRowIndex, 80),
        editableColumnByPathInput<Indicador>('total', 'Total', setIndicadores, editableRowIndex, 80),
        {
            accessor: 'acciones',
            title: 'Acciones',
            width: 80,
            render: (record, index) =>
                editableRowIndex === index ? (
                    <Button
                        size="xs"
                        variant="subtle"
                        onClick={() => {
                            setEditableRowIndex(null);
                        }}
                    >
                        Guardar
                    </Button>
                ) : (
                    <Button
                        size="xs"
                        variant="light"
                        onClick={() => {
                            setEditableRowIndex(index);
                        }}
                    >
                        Editar
                    </Button>
                ),
        },
    ];

    // const sortedIndicadores = [...indicadores].sort((a, b) => {
    //     const { columnAccessor, direction } = sortStatus;
    //     const valueA = a[columnAccessor as keyof Indicador] ?? '';
    //     const valueB = b[columnAccessor as keyof Indicador] ?? '';

    //     if (typeof valueA === 'number' && typeof valueB === 'number') {
    //         return direction === 'asc' ? valueA - valueB : valueB - valueA;
    //     }

    //     return direction === 'asc' ? String(valueA).localeCompare(String(valueB)) : String(valueB).localeCompare(String(valueA));
    // });
    return (
        <div className="panel">
            <DataTable<Indicador>
                records={indicadores}
                columns={columns}
                sortStatus={sortStatus}
                onSortStatusChange={setSortStatus}
                withRowBorders={false}
                withColumnBorders
                striped
                highlightOnHover
                minHeight={200}
            />
        </div>
    );
};

export default Index;

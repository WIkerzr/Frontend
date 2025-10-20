import { DataTable, DataTableColumn } from 'mantine-datatable';
import { useEffect, useState } from 'react';
// import { listadoIndicadoresImpacto, IndicadoresImpacto, categorias, unidadesMedida, Categorias } from './IndicadoresImpactoTEMP';
import { useTranslation } from 'react-i18next';
import { SimpleDropdown } from '../../../components/Utils/inputs';
import { LoadingOverlayPersonalizada, ZonaTitulo } from '../Users/componentes';
import { LlamadasBBDD } from '../../../components/Utils/data/utilsData';
import { useRegionContext } from '../../../contexts/RegionContext';
import { NewModal } from '../../../components/Utils/utils';
export interface ListIndicador {
    Id: number;
    IdIndicador: number;
    IdCategoria: number;
    CategoriaNameEs: string;
    CategoriaNameEu: string;
    IndiadorNameEs: string;
    IndiadorNameEu: string;
    UnitEs: string;
    UnitEu: string;
    mostrar: boolean;
    alcance: string;
    datos: Dato[];
}
export interface ListIndicadorComodin {
    IdIndicador: number;
    comodin: {
        nombreCategoria: string;
        idCategoria: number;
    }[];
}

export interface Valor {
    Id: number;
    Year: number;
    Valor: number;
    Objetivo: string;
}

export interface Dato {
    Id: number;
    AlcanceTerritorial: string;
    Valores: Valor[];
}

export interface AllDataIndicator {
    Id: number;
    IdIndicator: number;
    IdCategoria: number;
    CategoriaNameEs: string;
    CategoriaNameEu: string;
    Datos: Dato[];
}

export interface ListIndi {
    Id: number;
    NameEs: string;
    NameEu: string;
    Unity?: {
        Id: number;
        NameEs: string;
        NameEu: string;
    };
}
export interface ListCategoria {
    Id: number;
    NameEs: string;
    NameEu: string;
    UnitEs: string;
    UnitEu: string;
}

// export interface Indicadoreslist {
//     id: number;
//     nameEs: string;
//     nameEu: string;
//     unidadMedida?: number;
//     categorias?: Categorias[];
// }

type typeObjetivo = 'Aumentar' | 'Disminuir' | 'Mantener';

// interface DataIndicator {
//     year: number;
//     valor: number;
//     objetivos: typeObjetivo | undefined;
// }
export interface ImpactIndicatorValor {
    Id: number;
    Year: number;
    Valor: number;
    Objetivo: string;
}

export interface ImpactIndicatorDato {
    Id: number;
    AlcanceTerritorial: string;
    Valores: ImpactIndicatorValor[];
}

export interface ImpactIndicatorDTO {
    Id: number;
    IdIndicator: number;
    IdCategoria: number;
    CategoriaNameEs: string;
    CategoriaNameEu: string;
    Datos: ImpactIndicatorDato[];
}
// interface Indicador {
//     id: number;
//     idTemp: number;
//     indicador: string;
//     categoria: string;
//     unidad: string;
//     alcance: string;
//     datos: DataIndicator[];
//     valorFinal: string;
//     mostrar?: boolean;
//     categorias?: Categorias[];
//     [key: string]: string | number | boolean | Categorias[] | string[] | (typeObjetivo | undefined)[] | DataIndicator[] | undefined;
// }

function getMinMaxYears(indicadores: ListIndicador[]): { minYear: number; maxYear: number } | null {
    const allYears = indicadores.flatMap((ind) => (ind.datos ?? []).flatMap((d) => (d.Valores ?? []).map((v) => v.Year))).filter((year) => year !== 0 && year != null);
    if (allYears.length === 0) {
        return null;
    }

    const minYear = Math.min(...allYears);
    const maxYear = Math.max(...allYears);

    return { minYear, maxYear };
}

// function convertirIndicadores(impactos: IndicadoresImpacto[]): Indicador[] {
//     const resultados: Indicador[] = [];
//     let num = 0;

//     impactos.forEach((item) => {
//         if (item.categorias && item.categorias.length > 0) {
//             const multipleCategorias = item.categorias.length > 1;

//             item.categorias.forEach((catId, index) => {
//                 const categoriaEncontrada = categorias.find((cat) => cat.id === catId);

//                 const fila: Indicador = {
//                     id: num++,
//                     idTemp: item.id,
//                     indicador: item.nameEs,
//                     categoria: categoriaEncontrada ? categoriaEncontrada.nameEs : `Categoría ${catId}`,
//                     unidad: categoriaEncontrada ? `${unidadesMedida.find((med) => med.id === categoriaEncontrada.unidadMedida)?.nameEs}` : `FALLO UNIDAD MEDIDA`,
//                     alcance: '',
//                     datos: [
//                         {
//                             year: 0,
//                             valor: 0,
//                             objetivos: undefined,
//                         },
//                     ],
//                     mostrar: !multipleCategorias && index === 0,
//                     valorFinal: '',
//                 };

//                 resultados.push(fila);

//                 if (multipleCategorias && index === item.categorias!.length - 1) {
//                     resultados.push({
//                         id: num++,
//                         idTemp: item.id,
//                         indicador: item.nameEs,
//                         categoria: '',
//                         unidad: '',
//                         alcance: '',
//                         datos: [
//                             {
//                                 year: 0,
//                                 valor: 0,
//                                 objetivos: undefined,
//                             },
//                         ],
//                         valorFinal: '',
//                         mostrar: true,
//                         categorias: categorias.filter((cat) => item.categorias!.includes(cat.id)),
//                     });
//                 }
//             });
//         } else {
//             const unidadMedidaEncontrada = unidadesMedida.find((med) => med.id === item.unidadMedida);
//             resultados.push({
//                 id: num++,
//                 idTemp: item.id,
//                 indicador: item.nameEs,
//                 categoria: '-',
//                 unidad: unidadMedidaEncontrada ? unidadMedidaEncontrada.nameEs : 'FALLO UNIDAD MEDIDA',
//                 alcance: '',
//                 datos: [
//                     {
//                         year: 0,
//                         valor: 0,
//                         objetivos: undefined,
//                     },
//                 ],
//                 valorFinal: '',
//                 mostrar: true,
//             });
//         }
//     });

//     return resultados;
// }

const Index = () => {
    const { t } = useTranslation();
    const { regionSeleccionada } = useRegionContext();

    // const nuevosIndicadores = convertirIndicadores(listadoIndicadoresImpacto);

    const [showModal, setShowModal] = useState(false);

    const [indicadores, setIndicadores] = useState<ListIndicador[]>([]);

    const [indicadorSeleccionado, setIndicadorSeleccionado] = useState<number>(0);
    const [categoriaSeleccionado, setCategoriaSeleccionado] = useState<number>(0);

    const [indicadoresComodin, setIndicadoresComodin] = useState<ListIndicadorComodin[]>([]);

    const aniosIndicadores = getMinMaxYears(indicadores);
    const yearsArray: number[] = aniosIndicadores ? Array.from({ length: aniosIndicadores.maxYear - aniosIndicadores.minYear + 1 }, (_, i) => aniosIndicadores.minYear + i) : [];

    // const [mostrarDrop, setMostrarDrop] = useState<number>(0);

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    useEffect(() => {
        if (!regionSeleccionada) return;
        LlamadasBBDD({
            method: 'GET',
            url: `indicators/get/${regionSeleccionada}`,
            setLoading: setLoading ?? (() => {}),
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onSuccess: (data: any) => {
                const listadoCompleto: ListIndicador[] = data.listComplete;

                //Porner a true las primeras
                // const seenIndicators = new Set<number>();
                // listadoCompleto.forEach((item) => {
                //     if (!seenIndicators.has(item.IdIndicador)) {
                //         item.mostrar = true;
                //         seenIndicators.add(item.IdIndicador);
                //     }
                // });

                const categoriasPorIndicador = listadoCompleto.reduce((acc, item) => {
                    if (!acc[item.IdIndicador]) {
                        acc[item.IdIndicador] = [];
                    }
                    if (item.CategoriaNameEs && !acc[item.IdIndicador].some((cat) => cat.idCategoria === item.IdCategoria)) {
                        acc[item.IdIndicador].push({
                            nombreCategoria: item.CategoriaNameEs,
                            idCategoria: item.IdCategoria,
                        });
                    }
                    return acc;
                }, {} as Record<number, { nombreCategoria: string; idCategoria: number }[]>);

                const listadoComodin: ListIndicadorComodin[] = [];
                listadoCompleto.forEach((item) => {
                    const repetido = listadoComodin.filter((l) => l.IdIndicador === item.IdIndicador);
                    if (repetido.length === 0) {
                        if (item.CategoriaNameEs !== 'Sin categoria') {
                            listadoComodin.push({
                                IdIndicador: item.IdIndicador,
                                comodin: categoriasPorIndicador[item.IdIndicador] || [],
                            });
                        }
                    }
                });
                setIndicadoresComodin(listadoComodin);

                const datos: AllDataIndicator[] = data.data;
                for (let index = 0; index < datos.length; index++) {
                    const dato = datos[index];
                    const indexEncontrado = listadoCompleto.findIndex((item) => item.IdIndicador === dato.IdIndicator && item.IdCategoria === dato.IdCategoria);
                    if (indexEncontrado >= 0 && dato.Datos.length > 0) {
                        listadoCompleto[indexEncontrado].datos = dato.Datos;
                        listadoCompleto[indexEncontrado].mostrar = true;
                        listadoCompleto[indexEncontrado].alcance = dato.Datos[0].AlcanceTerritorial;
                        console.log(listadoCompleto[indexEncontrado]);
                    }
                }
                const listadoMostrado = listadoCompleto.filter((f) => f.mostrar === true);
                setIndicadores(listadoCompleto);

                console.log(listadoMostrado);
                console.log(listadoCompleto);
            },
        });
    }, []);

    // useEffect(() => {
    //     const listadoMostrado = indicadores.filter((f) => f.mostrar === true);
    //     listadoMostrado.forEach((mostrado) => {
    //         const idIndicador = mostrado.IdIndicador;
    //         indicadores.forEach((indicador) => {
    //             if (indicador.IdIndicador === idIndicador && indicador.Categorias) {
    //                 indicador.Categorias = indicador.Categorias.filter((categoria) => categoria !== mostrado.CategoriaNameEs);
    //             }
    //         });
    //     });
    // }, [indicadores]);

    // useEffect(() => {
    //     const indicadoresImpacto = sessionStorage.getItem('indicadoresImpactoStorage');
    //     if (indicadoresImpacto && indicadoresImpacto?.length > 0) {
    //         setIndicadores(JSON.parse(indicadoresImpacto));
    //     }
    // }, []);

    // useEffect(() => {
    //     setIndicadores(() => {
    //         return [...indicadores];
    //     });
    // }, [mostrarDrop]);

    const [editableRowIndex, setEditableRowIndex] = useState<number | null>(null);

    const handreNuevo = () => {
        setIndicadores((prev) => prev.map((item) => (item.IdIndicador === indicadorSeleccionado && item.IdCategoria === categoriaSeleccionado ? { ...item, mostrar: true } : item)));
    };

    const handleYearValueChange = (id: number, year: number, value: string) => {
        setIndicadores((prev) =>
            prev.map((item) => {
                if (item.Id !== id) return item;
                const datos = item.datos.map((d) => ({
                    ...d,
                    Valores: d.Valores.map((v) => (v.Year === year ? { ...v, Valor: Number(value) || 0 } : v)),
                }));
                return { ...item, datos };
            })
        );
    };

    const handleYearObjetivoChange = (id: number, year: number, objetivo: typeObjetivo | undefined) => {
        setIndicadores((prev) =>
            prev.map((item) => {
                if (item.Id !== id) return item;
                const datos = item.datos.map((d) => ({
                    ...d,
                    Valores: d.Valores.map((v) => (v.Year === year ? { ...v, Objetivo: objetivo || '' } : v)),
                }));
                return { ...item, datos };
            })
        );
    };

    const handleEliminarFila = (rowIndex: number) => {
        if (window.confirm(t('confirmarEliminarIndicador'))) {
            const indicadoresMostrados = indicadores.filter((fila) => fila.mostrar);
            const idAModificar = indicadoresMostrados[rowIndex].Id;
            setIndicadores((prev) => prev.map((item) => (item.Id === idAModificar ? { ...item, alcance: '', mostrar: false, year: '', valor: '', objetivo: undefined } : item)));

            const idTemp = indicadoresMostrados[rowIndex].IdIndicador;
            setIndicadores((prev) => {
                const indicesCoinciden = prev.map((item, index) => ({ item, index })).filter(({ item }) => item.IdIndicador === idTemp);
                const ultimoIndex = indicesCoinciden.at(-1)?.index;
                return prev.map((indicador, i) => (i === ultimoIndex ? { ...indicador, mostrar: true } : indicador));
            });
        }
    };

    // const handleChange = (e: React.ChangeEvent<HTMLSelectElement>, idTemp: number) => {
    //     const newCategoria = e.target.value;
    //     setIndicadores((prev) => prev.map((indicador) => (indicador.IdIndicador === idTemp && indicador.CategoriaNameEs === newCategoria ? { ...indicador, mostrar: true } : indicador)));

    //     const filtrados = indicadores.filter((i) => i.IdIndicador === idTemp);

    //     let cont = 0;
    //     for (let index = 0; index < filtrados.length; index++) {
    //         const indicador = filtrados[index];
    //         if (indicador.mostrar) {
    //             cont++;
    //         }
    //     }

    //     if (!(cont === filtrados.length - 1)) {
    //         setMostrarDrop(0);
    //     } else {
    //         setIndicadores((prev) => {
    //             const indicesCoinciden = prev.map((item, index) => ({ item, index })).filter(({ item }) => item.IdIndicador === idTemp);

    //             const ultimoIndex = indicesCoinciden.at(-1)?.index;

    //             return prev.map((indicador, i) => (i === ultimoIndex ? { ...indicador, mostrar: false } : indicador));
    //         });
    //     }
    // };

    const handleChangeTerritorial = (e: React.ChangeEvent<HTMLSelectElement>, id: number) => {
        const value = e.target.value;
        setIndicadores((prev) => prev.map((item) => (item.Id === id ? { ...item, alcance: value } : item)));
    };

    const displayedRecords = indicadores.filter((fila) => fila.mostrar);

    const columns: DataTableColumn<ListIndicador>[] = [
        {
            accessor: 'indicador',
            title: 'Indicador',
            width: 400,
            render: (record: ListIndicador, index) => {
                const indicador = record.IndiadorNameEs;
                const isFirst = displayedRecords.findIndex((r) => r.IndiadorNameEs === indicador) === index;

                if (record.CategoriaNameEs === 'Sin categoria') {
                    return (
                        <div style={{ position: 'relative', minHeight: 40 }}>
                            <div>{indicador}</div>
                        </div>
                    );
                }
                if (isFirst) {
                    return (
                        <div style={{ position: 'relative', minHeight: 40 }}>
                            <div>{indicador}</div>
                        </div>
                    );
                }

                // if (record.Categorias && record.Categorias.length > 1 && mostrarDrop != record.IdIndicador) {
                //     return <></>;
                // }
            },
        },
        {
            accessor: 'categoria',
            title: 'Categoria',
            width: 200,
            render: (record: ListIndicador) => {
                // const isFirst = displayedRecords.findIndex((r) => r.IndiadorNameEs === record.IndiadorNameEs) === index;
                const categoria = record.CategoriaNameEs;
                if (categoria === 'Sin categoria') {
                    return (
                        <div style={{ position: 'relative', minHeight: 40 }}>
                            <div>{categoria}</div>
                        </div>
                    );
                }
                // const prueba = mostrarDrop === record.IdIndicador;

                // if (record.Categorias && record.Categorias.length > 0 && (isFirst || prueba)) {
                //     const datos = indicadores.filter((ind) => ind.IdIndicador === record.IdIndicador);

                //     const opcionesYaMostradas = datos.filter((dato) => dato.mostrar === true).map((dato) => dato.CategoriaNameEs);
                //     const opciones = record.Categorias.filter((name) => !opcionesYaMostradas.includes(name));

                //     return (
                //         <div style={{ position: 'relative', minHeight: 40 }}>
                //             <SimpleDropdown options={opciones} mostrarSeleccionaopcion={true} onChange={(e) => handleChange(e, record.IdIndicador)} />
                //         </div>
                //     );
                // } else {
                return (
                    <div style={{ position: 'relative', minHeight: 40 }}>
                        <div>{categoria}</div>
                    </div>
                );
                // }
            },
        },
        { accessor: 'UnitEs', title: 'Unidad de medida', width: 100 },
        {
            accessor: 'alcance',
            title: 'Alcance Territorial',
            width: 300,
            render: (record: ListIndicador, rowIndex: number) => {
                const isEditing = editableRowIndex === rowIndex;

                return (
                    <div>
                        {isEditing ? (
                            <select className="border p-1 rounded" value={record.alcance ?? ''} onChange={(e) => handleChangeTerritorial(e, record.Id)}>
                                <option value="" disabled>
                                    {t('seleccionaopcion')}
                                </option>
                                <option value="Comarcal">{t('comarcal')}</option>
                                <option value="ZEA">{t('ZEA')}</option>
                                <option value="Zona rural (ZEA + TER+ zona rural de HRD)">{t('Zrural')}</option>
                                <option value="Municipios rurales (ZEA + TER)">{t('ZEATER')}</option>
                            </select>
                        ) : (
                            <>
                                <div>{record.alcance ?? ''}</div>
                            </>
                        )}
                    </div>
                );
            },
        },
        // editableColumnByPathInput<IndicadorTabla>(`year1`, 'Año', setApanioIndicadores, editableRowIndex, 60),
        // editableColumnByPathInput<IndicadorTabla>('valor1', 'Valor', setApanioIndicadores, editableRowIndex, 80),
        // editableColumnByPathInput<IndicadorTabla, string>('objetivos1', 'Objetivo', setApanioIndicadores, editableRowIndex, 100, (value, _onChange, record) => (
        //     <select className="border p-1 rounded" value={value ?? ''} onChange={(e) => handleChangeObjetivo(e, record.id)}>
        //         <option value="" disabled>
        //             {t('seleccionaOpciones')}
        //         </option>
        //         <option value="Aumentar">{t('aumentar')}</option>
        //         <option value="Mantener">{t('mantener')}</option>
        //         <option value="Disminuir">{t('disminuir')}</option>
        //     </select>
        // )),
        // Insertar columnas dinámicas por año
        ...yearsArray.map((y) => ({
            accessor: `year_${y}`,
            title: `${y}`,
            width: 160,
            render: (record: ListIndicador, rowIndex: number) => {
                const valor = record.datos?.[0]?.Valores?.find((v) => v.Year === y);
                const isEditing = editableRowIndex === rowIndex;
                return (
                    <div className="min-h-[40px]">
                        {isEditing ? (
                            <div className="flex flex-col">
                                <input
                                    type="number"
                                    className="border p-1 rounded mb-1"
                                    value={valor ? String(valor.Valor) : ''}
                                    onChange={(e) => {
                                        handleYearValueChange(record.Id, y, e.target.value);
                                    }}
                                />
                                <select
                                    className="border p-1 rounded text-sm"
                                    value={valor?.Objetivo ?? ''}
                                    onChange={(e) => {
                                        handleYearObjetivoChange(record.Id, y, (e.target.value as typeObjetivo) || undefined);
                                    }}
                                >
                                    <option value="">{t('seleccionaOpciones')}</option>
                                    <option value="Aumentar">{t('aumentar')}</option>
                                    <option value="Mantener">{t('mantener')}</option>
                                    <option value="Disminuir">{t('disminuir')}</option>
                                </select>
                            </div>
                        ) : (
                            <>
                                <div>{valor ? valor.Valor : ''}</div>
                                <div className="text-sm text-gray-500">{valor ? valor.Objetivo ?? '' : ''}</div>
                            </>
                        )}
                    </div>
                );
            },
        })),
        { accessor: 'valorFinal', title: 'valorFinal', width: 60 },

        {
            accessor: 'acciones',
            title: t('Acciones'),
            width: 130,
            render: (record: ListIndicador, index) => {
                const isFirst = displayedRecords.findIndex((r) => r.IndiadorNameEs === record.IndiadorNameEs) === index;

                if ((isFirst && record.CategoriaNameEs) || record.CategoriaNameEs) {
                    if (editableRowIndex === index) {
                        return (
                            <button
                                className="bg-success text-white px-2 py-1 rounded"
                                onClick={() => {
                                    setEditableRowIndex(null);
                                    LlamadasBBDD({
                                        method: 'POST',
                                        url: `/indicators/edit`,
                                        body: record,
                                        setLoading: setLoading ?? (() => {}),
                                    });
                                }}
                            >
                                {t('guardar')}
                            </button>
                        );
                    } else {
                        return (
                            <div className="flex gap-2 w-full">
                                <button className="bg-primary text-white px-2 py-1 rounded" onClick={() => setEditableRowIndex(index)}>
                                    {t('editar')}
                                </button>
                                <button className="bg-danger text-white px-2 py-1 rounded" onClick={() => handleEliminarFila(index)}>
                                    {t('Eliminar')}
                                </button>
                            </div>
                        );
                    }
                }
            },
        },
    ];

    return (
        <div className="panel">
            <LoadingOverlayPersonalizada isLoading={loading} message={{ successMessage, setSuccessMessage, errorMessage, setErrorMessage }} />
            <ZonaTitulo
                titulo={
                    <div className="text-xl font-bold flex items-center space-x-2 ">
                        <span>{t('indicadoresImpacto')}</span>
                    </div>
                }
                // zonaBtn={
                // <button className="px-4 py-2 bg-primary text-white rounded flex items-center justify-center font-medium h-10 min-w-[120px]" onClick={handleSave}>
                //     {t('guardar')}
                // </button>
                // }
            />
            <button type="button" className="btn btn-primary w-1/4 " onClick={() => setShowModal(true)}>
                {t('agregarFila')}
            </button>
            <NewModal open={showModal} onClose={() => setShowModal(false)} title={t('agregarFila')}>
                <div className="flex justify-center mt-4">
                    <div className="flex flex-col gap-4 items-center">
                        <SimpleDropdown
                            options={Array.from(new Map(indicadores.map((i) => [i.IndiadorNameEs, i.IdIndicador]))).map(([name]) => name)}
                            mostrarSeleccionaopcion={true}
                            onChange={(e) => {
                                const name = e.target.value;
                                const indicador = indicadores.find((i) => i.IndiadorNameEs === name);
                                const value = indicador ? indicador.IdIndicador : 0;
                                setIndicadorSeleccionado(value);
                            }}
                        />

                        {indicadorSeleccionado !== 0 &&
                            (() => {
                                const indicadorComodin = indicadoresComodin.find((i) => i.IdIndicador === indicadorSeleccionado);
                                const opciones = indicadorComodin ? indicadorComodin.comodin : [];

                                if (opciones.length === 0) {
                                    return null;
                                }

                                return (
                                    <SimpleDropdown
                                        options={opciones.map((c) => c.nombreCategoria)}
                                        mostrarSeleccionaopcion={true}
                                        onChange={(e) => {
                                            const nombreCategoria = e.target.value;
                                            const categoriaId = opciones.find((c) => c.nombreCategoria === nombreCategoria)?.idCategoria || 0;
                                            setCategoriaSeleccionado(categoriaId);
                                        }}
                                    />
                                );
                            })()}
                        <button
                            type="button"
                            className="bg-indigo-500 text-white px-4 py-2 rounded flex items-center disabled:opacity-70 disabled:cursor-not-allowed mt-2"
                            disabled={loading}
                            onClick={() => {
                                setShowModal(false);
                                handreNuevo();
                            }}
                        >
                            {t('guardar')}
                        </button>
                    </div>
                </div>
            </NewModal>
            <DataTable<ListIndicador> records={displayedRecords} columns={columns} withRowBorders={false} withColumnBorders striped highlightOnHover minHeight={200} />
            {/* <DataTable<Indicador> records={indicadores} columns={columns} withRowBorders={false} withColumnBorders striped highlightOnHover minHeight={200} /> */}
        </div>
    );
};

export default Index;

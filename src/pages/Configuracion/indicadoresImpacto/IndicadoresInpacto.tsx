import { DataTable, DataTableColumn } from 'mantine-datatable';
import { useEffect, useState } from 'react';
// import { listadoIndicadoresImpacto, IndicadoresImpacto, categorias, unidadesMedida, Categorias } from './IndicadoresImpactoTEMP';
import { useTranslation } from 'react-i18next';
import { SimpleDropdown } from '../../../components/Utils/inputs';
import { LoadingOverlayPersonalizada, ZonaTitulo } from '../Users/componentes';
import { LlamadasBBDD } from '../../../components/Utils/data/utilsData';
import { useRegionContext } from '../../../contexts/RegionContext';
import { NewModal, SeleccioneRegion } from '../../../components/Utils/utils';
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
    listado: boolean;
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

function getMinMaxYears(regiones: { RegionId: number; Years: number[] }[]): { minYear: number; maxYear: number } | null {
    if (!Array.isArray(regiones) || regiones.length === 0) return null;

    const allYears = regiones.flatMap((r) => (Array.isArray(r.Years) ? r.Years : [])).filter((y): y is number => typeof y === 'number' && Number.isFinite(y) && y !== 0);

    if (allYears.length === 0) return null;

    const minYear = Math.min(...allYears);
    const maxYear = Math.max(...allYears);

    return { minYear, maxYear };
}
function getMinMaxYearsIndicadores(indicadores: ListIndicador[]): { minYear: number; maxYear: number } | null {
    const allYears = indicadores
        .flatMap((ind) => (Array.isArray(ind.datos) ? ind.datos.flatMap((d) => (Array.isArray(d.Valores) ? d.Valores.map((v) => v.Year) : [])) : []))
        .filter((year) => year !== 0 && year != null);
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
    let aniosIndicadores = getMinMaxYearsIndicadores(indicadores) || { minYear: 2025, maxYear: 2025 };
    const aniosRegion = sessionStorage.getItem('aniosRegion');
    if (aniosRegion && !aniosIndicadores) {
        const aniosParsed = JSON.parse(aniosRegion) as { RegionId: number; Years: number[] }[];
        aniosIndicadores = getMinMaxYears(aniosParsed) || aniosIndicadores;
    }
    const yearsArray: number[] = aniosIndicadores ? Array.from({ length: aniosIndicadores.maxYear - aniosIndicadores.minYear + 1 }, (_, i) => aniosIndicadores.minYear + i) : [];

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
                    if (indexEncontrado >= 0) {
                        const listIndex = listadoCompleto[indexEncontrado];
                        if (dato.Datos.length > 0) {
                            listIndex.datos = dato.Datos;
                            if (
                                (listIndex.alcance === '' || listIndex.alcance === undefined) &&
                                (listIndex.datos[0].AlcanceTerritorial === '' || listIndex.datos[0].AlcanceTerritorial === undefined) &&
                                (listIndex.datos[0].Valores[0].Valor === 0 || listIndex.datos[0].Valores[0].Valor === undefined) &&
                                (listIndex.datos[0].Valores[0].Objetivo === '' || listIndex.datos[0].Valores[0].Objetivo === undefined)
                            ) {
                                listIndex.mostrar = false;
                            } else {
                                listIndex.mostrar = true;
                            }
                            listIndex.alcance = dato.Datos[0].AlcanceTerritorial;
                        }
                        listIndex.listado = true;
                    }
                }
                const listadoMostrado = listadoCompleto.filter((f) => f.mostrar === true);
                setIndicadores(listadoCompleto);

                console.log(listadoMostrado);
                console.log(listadoCompleto.filter((f) => f.listado));
            },
        });
    }, [regionSeleccionada]);

    const [editableRowIndex, setEditableRowIndex] = useState<number | null>(null);

    if (!regionSeleccionada) return <SeleccioneRegion />;

    const handleNuevo = () => {
        setIndicadores((prev) => prev.map((item) => (item.IdIndicador === indicadorSeleccionado && item.IdCategoria === categoriaSeleccionado ? { ...item, mostrar: true } : item)));
    };

    const inicializarDatosVacios = (item: ListIndicador, year: number, value: string, field: 'Valor' | 'Objetivo') => {
        const datosActuales = item.datos ?? [];

        if (datosActuales.length > 0) {
            return datosActuales.map((d) => {
                const valorExistente = Array.isArray(d.Valores) ? d.Valores.find((v) => v.Year === year) : undefined;
                const valoresActualizados = valorExistente
                    ? d.Valores.map((v) => (v.Year === year ? (field === 'Valor' ? { ...v, Valor: Number(value) || 0 } : { ...v, Objetivo: value }) : v))
                    : [...(d.Valores || []), { Id: 0, Year: year, Valor: field === 'Valor' ? Number(value) || 0 : 0, Objetivo: field === 'Objetivo' ? value : '' }];

                return { ...d, Valores: valoresActualizados };
            });
        }

        return [
            {
                Id: 0,
                AlcanceTerritorial: item.alcance || '',
                Valores: [{ Id: 0, Year: year, Valor: field === 'Valor' ? Number(value) || 0 : 0, Objetivo: field === 'Objetivo' ? value : '' }],
            },
        ];
    };

    const handleYearValueChange = (record: ListIndicador, year: number, value: string) => {
        const IdCategoria = record.IdCategoria;
        const IdIndicador = record.IdIndicador;
        setIndicadores((prev) =>
            prev.map((item) => {
                if (item.IdCategoria === IdCategoria && item.IdIndicador === IdIndicador) {
                    const datos = inicializarDatosVacios(item, year, value, 'Valor');
                    return { ...item, datos };
                }
                return item;
            })
        );
    };

    const handleYearObjetivoChange = (record: ListIndicador, year: number, objetivo: typeObjetivo | undefined) => {
        const IdCategoria = record.IdCategoria;
        const IdIndicador = record.IdIndicador;
        setIndicadores((prev) =>
            prev.map((item) => {
                if (item.IdCategoria === IdCategoria && item.IdIndicador === IdIndicador) {
                    const datos = inicializarDatosVacios(item, year, objetivo ?? '', 'Objetivo');
                    return { ...item, datos };
                } else {
                    return item;
                }
            })
        );
    };

    const handleEliminarFila = (rowIndex: number, record: ListIndicador) => {
        if (window.confirm(t('confirmarEliminarIndicador'))) {
            const indicadoresMostrados = indicadores.filter((fila) => fila.mostrar);
            const idAModificar = indicadoresMostrados[rowIndex].Id;

            const datosEliminados = record;
            datosEliminados.alcance = '';
            datosEliminados.datos[0].AlcanceTerritorial = '';
            datosEliminados.datos[0].Valores.map((v) => {
                v.Objetivo = '';
                v.Valor = 0;
                return v;
            });

            LlamadasBBDD({
                method: 'POST',
                url: `/indicators/edit/${regionSeleccionada}`,
                body: datosEliminados,
                setLoading: setLoading ?? (() => {}),
                onSuccess() {
                    setIndicadores((prev) =>
                        prev.map((item) =>
                            item.Id === idAModificar
                                ? {
                                      ...item,
                                      alcance: '',
                                      mostrar: false,
                                      valores: item.datos[0].Valores.map((v) => {
                                          v.Objetivo = '';
                                          v.Valor = 0;
                                          return v;
                                      }),
                                      objetivo: undefined,
                                  }
                                : item
                        )
                    );
                },
            });
            const idTemp = indicadoresMostrados[rowIndex].IdIndicador;
            setIndicadores((prev) => {
                const indicesCoinciden = prev.map((item, index) => ({ item, index })).filter(({ item }) => item.IdIndicador === idTemp);
                const ultimoIndex = indicesCoinciden.at(-1)?.index;
                return prev.map((indicador, i) => (i === ultimoIndex ? { ...indicador, mostrar: true } : indicador));
            });
        }
    };

    const handleChangeTerritorial = (e: React.ChangeEvent<HTMLSelectElement>, record: ListIndicador) => {
        const IdCategoria = record.IdCategoria;
        const IdIndicador = record.IdIndicador;
        const value = e.target.value;
        setIndicadores((prev) =>
            prev.map((item) => {
                if (item.IdIndicador === IdIndicador && item.IdCategoria === IdCategoria) {
                    const datosActuales = Array.isArray(item.datos) ? item.datos : [];
                    let nuevosDatos;
                    if (datosActuales.length > 0) {
                        nuevosDatos = datosActuales.map((d) => ({ ...d, AlcanceTerritorial: value }));
                    } else {
                        nuevosDatos = [
                            {
                                Id: 0,
                                AlcanceTerritorial: value,
                                Valores: [],
                            },
                        ];
                    }

                    return { ...item, alcance: value, datos: nuevosDatos };
                }
                return item;
            })
        );
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
            },
        },
        {
            accessor: 'categoria',
            title: 'Categoria',
            width: 200,
            render: (record: ListIndicador) => {
                const categoria = record.CategoriaNameEs;
                if (categoria === 'Sin categoria') {
                    return (
                        <div style={{ position: 'relative', minHeight: 40 }}>
                            <div>{categoria}</div>
                        </div>
                    );
                }
                return (
                    <div style={{ position: 'relative', minHeight: 40 }}>
                        <div>{categoria}</div>
                    </div>
                );
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
                            <select className="border p-1 rounded" value={record.alcance ?? ''} onChange={(e) => handleChangeTerritorial(e, record)}>
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
                                        handleYearValueChange(record, y, e.target.value);
                                    }}
                                />
                                <select
                                    className="border p-1 rounded text-sm"
                                    value={valor?.Objetivo ?? ''}
                                    onChange={(e) => {
                                        handleYearObjetivoChange(record, y, (e.target.value as typeObjetivo) || undefined);
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
                                        url: `/indicators/edit/${regionSeleccionada}`,
                                        body: record,
                                        setLoading: setLoading ?? (() => {}),
                                        onSuccess(response) {
                                            const data = response.data as { parentId: number; valores: Valor[] };
                                            setIndicadores((prev) =>
                                                prev.map((item) =>
                                                    item.IdIndicador === record.IdIndicador && item.IdCategoria === record.IdCategoria
                                                        ? {
                                                              ...item,
                                                              datos: item.datos.map((d, idx) =>
                                                                  idx === 0
                                                                      ? {
                                                                            ...d,
                                                                            Id: data.parentId,
                                                                            Valores: data.valores,
                                                                        }
                                                                      : d
                                                              ),
                                                          }
                                                        : item
                                                )
                                            );
                                        },
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
                                <button className="bg-danger text-white px-2 py-1 rounded" onClick={() => handleEliminarFila(index, record)}>
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
                            options={Array.from(new Map(indicadores.filter((f) => f.listado && !f.mostrar).map((i) => [i.IndiadorNameEs, i.IdIndicador]))).map(([name]) => name)}
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
                                const newOpciones: { nombreCategoria: string; idCategoria: number }[] = [];
                                const indicador = indicadores.filter((f) => f.listado && f.IdIndicador === indicadorSeleccionado);
                                indicador.forEach((indicad) => {
                                    opciones.forEach((opcion) => {
                                        if (indicad.IdCategoria === opcion.idCategoria && !indicad.mostrar) {
                                            newOpciones.push(opcion);
                                        }
                                    });
                                });
                                if (newOpciones.length === 0) {
                                    return null;
                                }

                                return (
                                    <SimpleDropdown
                                        options={newOpciones.map((c) => c.nombreCategoria)}
                                        mostrarSeleccionaopcion={true}
                                        onChange={(e) => {
                                            const nombreCategoria = e.target.value;
                                            const categoriaId = newOpciones.find((c) => c.nombreCategoria === nombreCategoria)?.idCategoria || 0;
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
                                handleNuevo();
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

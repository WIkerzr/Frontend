import { DataTable, DataTableColumn } from 'mantine-datatable';
import { useEffect, useState } from 'react';
// import { listadoIndicadoresImpacto, IndicadoresImpacto, categorias, unidadesMedida, Categorias } from './IndicadoresImpactoTEMP';
import { useTranslation } from 'react-i18next';
import { SimpleDropdown } from '../../../components/Utils/inputs';
import { LoadingOverlayPersonalizada, ZonaTitulo } from '../Users/componentes';
import { LlamadasBBDD } from '../../../components/Utils/data/utilsData';
import { useRegionContext } from '../../../contexts/RegionContext';
import { NewModal, SeleccioneRegion } from '../../../components/Utils/utils';
import { useUser } from '../../../contexts/UserContext';
export interface Relaciones {
    IdIndicator: string;
    IdCategoria: string;
    Year: number;
    Valor: number;
    Objetivo: string;
}
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
    LineBase?: number;
    Year?: number;
    ImpactType?: number;
    Relaciones?: Relaciones;
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
    Relaciones?: Relaciones;
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

function transformarObjetivoIndicadores(indicadores: ListIndicador) {
    if (indicadores.ImpactType && indicadores.ImpactType === 1) {
        return 'Aumentar';
    } else if (indicadores.ImpactType && indicadores.ImpactType === 2) {
        return 'Disminuir';
    } else {
        return 'Mantener';
    }
}

const Index = () => {
    const { t } = useTranslation();
    const { regionSeleccionada } = useRegionContext();
    const { user } = useUser();
    const permisosEditar = user?.role === 'ADR';
    const [indicadoresOriginales, setIndicadoresOriginales] = useState<Record<string, ListIndicador[]>>({});

    const [showModal, setShowModal] = useState(false);

    const [indicadores, setIndicadores] = useState<ListIndicador[]>([]);

    const [indicadorSeleccionado, setIndicadorSeleccionado] = useState<number>(0);
    const [categoriaSeleccionado, setCategoriaSeleccionado] = useState<number>(0);

    const [indicadoresComodin, setIndicadoresComodin] = useState<ListIndicadorComodin[]>([]);

    const [aniosHabilitados, setAniosHabilitados] = useState<number[]>([]);

    let aniosIndicadores = getMinMaxYearsIndicadores(indicadores) || { minYear: 2025, maxYear: 2025 };
    const aniosRegion = sessionStorage.getItem('aniosRegion');
    if (aniosRegion && !aniosIndicadores) {
        const aniosParsed = JSON.parse(aniosRegion) as { RegionId: number; Years: number[] }[];
        aniosIndicadores = getMinMaxYears(aniosParsed) || aniosIndicadores;
    }

    const yearsArray: number[] =
        aniosHabilitados.length > 0
            ? aniosHabilitados.sort((a, b) => a - b)
            : aniosIndicadores
            ? Array.from({ length: aniosIndicadores.maxYear - aniosIndicadores.minYear + 1 }, (_, i) => aniosIndicadores.minYear + i)
            : [];

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    useEffect(() => {
        LlamadasBBDD({
            method: 'GET',
            url: 'impactIndicatorYears',
            setLoading: () => {},
            setSuccessMessage: () => {},
            setErrorMessage: () => {},
            onSuccess: (data: { data: { Id: number; Year: number; Status: boolean }[] }) => {
                const aniosActivos = data.data
                    .filter((year) => year.Status === true)
                    .map((year) => year.Year)
                    .sort((a, b) => a - b);
                setAniosHabilitados(aniosActivos);
            },
            onError: () => {
                console.warn('No se pudieron cargar los años habilitados de indicadores de impacto');
            },
        });
    }, []);

    useEffect(() => {
        setIndicadoresOriginales({});
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

                        if (dato.Relaciones) {
                            listIndex.Relaciones = dato.Relaciones;
                        }

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
                setIndicadores(listadoCompleto);
                setIndicadoresOriginales((prev) => ({ ...prev, [regionSeleccionada]: listadoCompleto }));
            },
        });
    }, [regionSeleccionada]);

    const [editableRowIndex, setEditableRowIndex] = useState<number | null>(null);

    if (!regionSeleccionada) return <SeleccioneRegion />;

    const handleNuevo = () => {
        let indicadorSelect = indicadores.filter((ind) => ind.IdIndicador === indicadorSeleccionado);
        if (categoriaSeleccionado) {
            indicadorSelect = indicadorSelect.filter((ind) => ind.IdCategoria === categoriaSeleccionado);
        }
        setCategoriaSeleccionado(0);
        setIndicadorSeleccionado(0);
        if (indicadorSelect.length > 0) {
            setIndicadores((prev) =>
                prev.map((item) => (indicadorSelect.some((ind) => ind.IdIndicador === item.IdIndicador && ind.IdCategoria === item.IdCategoria) ? { ...item, mostrar: true } : item))
            );
        }
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
            if (datosEliminados.datos && datosEliminados.datos.length > 0) {
                datosEliminados.datos[0].AlcanceTerritorial = '';
                if (datosEliminados.datos[0].Valores && datosEliminados.datos[0].Valores.length > 0) {
                    datosEliminados.datos[0].Valores.map((v) => {
                        v.Objetivo = '';
                        v.Valor = 0;
                        return v;
                    });
                }
            }
            if (indicadoresOriginales[regionSeleccionada]) {
                const datosOriginales = indicadoresOriginales[regionSeleccionada].find((item) => item.Id === idAModificar);
                if (datosOriginales && datosOriginales.datos && datosOriginales.datos[0].Valores) {
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
                }
            }

            const idTemp = indicadoresMostrados[rowIndex].IdIndicador;
            setIndicadores((prev) => {
                const indicesCoinciden = prev.map((item, index) => ({ item, index })).filter(({ item }) => item.IdIndicador === idTemp);
                const ultimoIndex = indicesCoinciden.at(-1)?.index;
                return prev.map((indicador, i) => (i === ultimoIndex ? { ...indicador, mostrar: false } : indicador));
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

    const handleChangeYearInicial = (record: ListIndicador, value: string) => {
        const IdCategoria = record.IdCategoria;
        const IdIndicador = record.IdIndicador;
        setIndicadores((prev) =>
            prev.map((item) => {
                if (item.IdIndicador === IdIndicador && item.IdCategoria === IdCategoria) {
                    return {
                        ...item,
                        Relaciones: {
                            ...item.Relaciones,
                            IdIndicator: String(item.IdIndicador),
                            IdCategoria: String(item.IdCategoria),
                            Year: Number(value) || 0,
                            Valor: item.Relaciones?.Valor || item.LineBase || 0,
                            Objetivo: item.Relaciones?.Objetivo || transformarObjetivoIndicadores(item) || '',
                        },
                    };
                }
                return item;
            })
        );
    };

    const handleChangeValorInicial = (record: ListIndicador, value: string) => {
        const IdCategoria = record.IdCategoria;
        const IdIndicador = record.IdIndicador;
        setIndicadores((prev) =>
            prev.map((item) => {
                if (item.IdIndicador === IdIndicador && item.IdCategoria === IdCategoria) {
                    return {
                        ...item,
                        Relaciones: {
                            ...item.Relaciones,
                            IdIndicator: String(item.IdIndicador),
                            IdCategoria: String(item.IdCategoria),
                            Year: item.Relaciones?.Year || item.Year || 0,
                            Valor: Number(value) || 0,
                            Objetivo: item.Relaciones?.Objetivo || transformarObjetivoIndicadores(item) || '',
                        },
                    };
                }
                return item;
            })
        );
    };

    const handleChangeObjetivoInicial = (record: ListIndicador, value: string) => {
        const IdCategoria = record.IdCategoria;
        const IdIndicador = record.IdIndicador;
        setIndicadores((prev) =>
            prev.map((item) => {
                if (item.IdIndicador === IdIndicador && item.IdCategoria === IdCategoria) {
                    return {
                        ...item,
                        Relaciones: {
                            ...item.Relaciones,
                            IdIndicator: String(item.IdIndicador),
                            IdCategoria: String(item.IdCategoria),
                            Year: item.Relaciones?.Year || item.Year || 0,
                            Valor: item.Relaciones?.Valor || item.LineBase || 0,
                            Objetivo: value,
                        },
                    };
                }
                return item;
            })
        );
    };

    const displayedRecords = indicadores.filter((fila) => fila.mostrar);

    // Generar columnas de años dinámicamente
    const yearColumns: DataTableColumn<ListIndicador>[] = yearsArray.flatMap((y, index) => [
        //año
        {
            accessor: `year_label_${y}`,
            title: 'Año',
            width: 100,
            cellsClassName: index % 2 === 0 ? 'bg-blue-50' : 'bg-green-50',
            render: (record: ListIndicador, rowIndex: number) => {
                const isEditing = editableRowIndex === rowIndex;
                return (
                    <div key={`year-label-${y}-${record.Id}`}>
                        {isEditing ? (
                            <input type="number" className="border p-1 rounded w-20" value={y} readOnly />
                        ) : (
                            <>
                                <div>{y}</div>
                            </>
                        )}
                    </div>
                );
            },
        },
        //valor
        {
            accessor: `year_valor_${y}`,
            title: `Valor`,
            width: 100,
            cellsClassName: index % 2 === 0 ? 'bg-blue-50' : 'bg-green-50',
            render: (record: ListIndicador, rowIndex: number) => {
                const valor = record.datos?.[0]?.Valores?.find((v) => v.Year === y);
                const isEditing = editableRowIndex === rowIndex;
                return (
                    <div key={`year-valor-${y}-${record.Id}`}>
                        {isEditing ? (
                            <input
                                type="number"
                                className="border p-1 rounded w-20"
                                value={valor ? String(valor.Valor) : ''}
                                onChange={(e) => {
                                    handleYearValueChange(record, y, e.target.value);
                                }}
                            />
                        ) : (
                            <div>{valor ? valor.Valor : ''}</div>
                        )}
                    </div>
                );
            },
        },
        //objetivo
        {
            accessor: `year_objetivo_${y}`,
            title: `Objetivo`,
            width: 120,
            cellsClassName: index % 2 === 0 ? 'bg-blue-50' : 'bg-green-50',
            render: (record: ListIndicador, rowIndex: number) => {
                const valor = record.datos?.[0]?.Valores?.find((v) => v.Year === y);
                const isEditing = editableRowIndex === rowIndex;
                return (
                    <div key={`year-objetivo-${y}-${record.Id}`}>
                        {isEditing ? (
                            <select
                                className="border p-1 rounded text-sm w-full max-w-[110px]"
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
                        ) : (
                            <div className="text-sm">{valor ? valor.Objetivo ?? '' : ''}</div>
                        )}
                    </div>
                );
            },
        },
    ]);

    const columns: DataTableColumn<ListIndicador>[] = [
        //indicador
        {
            accessor: 'indicador',
            title: 'Indicador',
            width: 200,
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
        //categoria
        {
            accessor: 'categoria',
            title: 'Categoria',
            width: 150,
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
        //unidad de medida
        { accessor: 'UnitEs', title: 'Unidad de medida', width: 150 },
        {
            accessor: 'alcance',
            title: 'Alcance Territorial',
            width: 200,
            render: (record: ListIndicador, rowIndex: number) => {
                const isEditing = editableRowIndex === rowIndex;
                return (
                    <div>
                        {isEditing ? (
                            <select className="border p-1 rounded w-full max-w-[180px]" value={record.alcance ?? ''} onChange={(e) => handleChangeTerritorial(e, record)}>
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
        //año inicial
        {
            accessor: 'yearInicial',
            title: 'Año Inicial',
            width: 100,
            render: (record: ListIndicador, rowIndex: number) => {
                const isEditing = editableRowIndex === rowIndex;
                const valorMostrar = record.Relaciones?.Year || record.Year || '';
                return (
                    <div>
                        {isEditing ? (
                            <input type="number" className="border p-1 rounded w-20" value={valorMostrar} onChange={(e) => handleChangeYearInicial(record, e.target.value)} />
                        ) : (
                            <>
                                <div>{valorMostrar}</div>
                            </>
                        )}
                    </div>
                );
            },
        },
        //Valor Inicial
        {
            accessor: 'valorInicial',
            title: 'Valor Inicial',
            width: 100,
            render: (record: ListIndicador, rowIndex: number) => {
                const isEditing = editableRowIndex === rowIndex;
                const valorOriginal = record.Relaciones?.Valor ?? record.LineBase ?? '';

                // Convertir valor a numérico si es posible
                const valorNumerico = typeof valorOriginal === 'number' ? valorOriginal : !isNaN(Number(valorOriginal)) && valorOriginal !== '' ? Number(valorOriginal) : null;

                // Si no hay permisos y el valor no es numérico, mostrar vacío
                const valorMostrar = !permisosEditar && valorNumerico === null ? '' : valorNumerico ?? valorOriginal;

                return (
                    <div>
                        {isEditing ? (
                            <input type="number" className="border p-1 rounded w-20" value={valorNumerico ?? ''} onChange={(e) => handleChangeValorInicial(record, e.target.value)} />
                        ) : (
                            <>
                                <div>{valorMostrar}</div>
                            </>
                        )}
                    </div>
                );
            },
        },
        //Objetivo Inicial
        {
            accessor: 'objetivoInicial',
            title: 'Objetivo Inicial',
            width: 120,
            render: (record: ListIndicador, rowIndex: number) => {
                const isEditing = editableRowIndex === rowIndex;
                const valorMostrar = record.Relaciones?.Objetivo || transformarObjetivoIndicadores(record);
                return (
                    <div>
                        {isEditing ? (
                            <select className="border p-1 rounded text-sm" value={valorMostrar} onChange={(e) => handleChangeObjetivoInicial(record, e.target.value)}>
                                <option value="">{t('seleccionaOpciones')}</option>
                                <option value="Aumentar">{t('aumentar')}</option>
                                <option value="Mantener">{t('mantener')}</option>
                                <option value="Disminuir">{t('disminuir')}</option>
                            </select>
                        ) : (
                            <>
                                <div>{valorMostrar}</div>
                            </>
                        )}
                    </div>
                );
            },
        },
        ...yearColumns,
        {
            accessor: 'valorFinal',
            title: 'Valor Final',
            width: 100,
            render: (record: ListIndicador, rowIndex: number) => {
                const isEditing = editableRowIndex === rowIndex;
                const valor = record.datos?.[record.datos.length - 1]?.Valores[record.datos[record.datos.length - 1].Valores.length - 1];
                return (
                    <div>
                        {isEditing ? (
                            <input type="number" className="border p-1 rounded w-20" value={valor?.Valor ?? ''} />
                        ) : (
                            <>
                                <div>{valor?.Valor ?? ''}</div>
                            </>
                        )}
                    </div>
                );
            },
        },
        ...(permisosEditar
            ? [
                  {
                      accessor: 'acciones',
                      title: t('Acciones'),
                      width: 180,
                      render: (record: ListIndicador, index: number) => {
                          const isFirst = displayedRecords.findIndex((r) => r.IndiadorNameEs === record.IndiadorNameEs) === index;

                          if ((isFirst && record.CategoriaNameEs) || record.CategoriaNameEs) {
                              if (editableRowIndex === index) {
                                  return (
                                      <div className="flex gap-2 w-full">
                                          <button
                                              className="bg-success text-white px-2 py-1 rounded"
                                              onClick={() => {
                                                  const relaciones: Relaciones = {
                                                      IdIndicator: String(record.IdIndicador),
                                                      IdCategoria: String(record.IdCategoria),
                                                      Year: record.Relaciones?.Year || record.Year || 0,
                                                      Valor: record.Relaciones?.Valor || record.LineBase || 0,
                                                      Objetivo: record.Relaciones?.Objetivo || transformarObjetivoIndicadores(record) || '',
                                                  };
                                                  const body = record;
                                                  body.Relaciones = relaciones;

                                                  setEditableRowIndex(null);
                                                  LlamadasBBDD({
                                                      method: 'POST',
                                                      url: `/indicators/edit/${regionSeleccionada}`,
                                                      body: body,
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
                                          <button
                                              className="bg-warning text-white px-2 py-1 rounded"
                                              onClick={() => {
                                                  setEditableRowIndex(null);
                                                  if (indicadoresOriginales[regionSeleccionada]) {
                                                      const datosOriginales = indicadoresOriginales[regionSeleccionada].find(
                                                          (item) => item.IdIndicador === record.IdIndicador && item.IdCategoria === record.IdCategoria
                                                      );
                                                      if (datosOriginales) {
                                                          setIndicadores((prev) =>
                                                              prev.map((item) => (item.IdIndicador === record.IdIndicador && item.IdCategoria === record.IdCategoria ? { ...datosOriginales } : item))
                                                          );
                                                      }
                                                  }
                                              }}
                                          >
                                              {t('cancelar')}
                                          </button>
                                      </div>
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
                  } as DataTableColumn<ListIndicador>,
              ]
            : []),
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
            {permisosEditar && (
                <button type="button" className="btn btn-primary w-1/4 " onClick={() => setShowModal(true)}>
                    {t('NuevoIndicador')}
                </button>
            )}
            <NewModal open={showModal} onClose={() => setShowModal(false)} title={t('NuevoIndicador')}>
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
            <div className="overflow-x-auto w-full">
                <div style={{ minWidth: 'max-content' }}>
                    <DataTable<ListIndicador> records={displayedRecords} columns={columns} idAccessor="Id" withRowBorders={false} withColumnBorders striped highlightOnHover minHeight={200} />
                </div>
            </div>
            {/* <DataTable<Indicador> records={indicadores} columns={columns} withRowBorders={false} withColumnBorders striped highlightOnHover minHeight={200} /> */}
        </div>
    );
};

export default Index;

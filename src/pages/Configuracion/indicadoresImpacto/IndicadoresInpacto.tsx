import { DataTable, DataTableColumn } from 'mantine-datatable';
import { useEffect, useState } from 'react';
import { listadoIndicadoresImpacto, IndicadoresImpacto, categorias, unidadesMedida, Categorias } from './IndicadoresImpactoTEMP';
import { editableColumnByPathInput } from '../../../components/Utils/utilsTabla/Columnas';
import { useTranslation } from 'react-i18next';
import { SimpleDropdown } from '../../../components/Utils/inputs';
import { ZonaTitulo } from '../Users/componentes';

type typeObjetivo = 'Aumentar' | 'Disminuir' | 'Mantener';
interface Indicador {
    id: number;
    idTemp: number;
    indicador: string;
    categoria: string;
    unidad: string;
    alcance: string;
    year: string;
    valorInicial: string;
    objetivo?: typeObjetivo;
    valorFinal: string;
    mostrar?: boolean;
    categorias?: Categorias[];
    [key: string]: string | number | boolean | Categorias[] | undefined;
}

function convertirIndicadores(impactos: IndicadoresImpacto[]): Indicador[] {
    const resultados: Indicador[] = [];
    let num = 0;

    impactos.forEach((item) => {
        if (item.categorias && item.categorias.length > 0) {
            const multipleCategorias = item.categorias.length > 1;

            item.categorias.forEach((catId, index) => {
                const categoriaEncontrada = categorias.find((cat) => cat.id === catId);

                const fila: Indicador = {
                    id: num++,
                    idTemp: item.id,
                    indicador: item.nameEs,
                    categoria: categoriaEncontrada ? categoriaEncontrada.nameEs : `Categoría ${catId}`,
                    unidad: categoriaEncontrada ? `${unidadesMedida.find((med) => med.id === categoriaEncontrada.unidadMedida)?.nameEs}` : `FALLO UNIDAD MEDIDA`,
                    alcance: '',
                    year: '',
                    valorInicial: '',
                    valorFinal: '',
                    mostrar: !multipleCategorias && index === 0, // Mostrar true si solo hay una categoría
                };

                resultados.push(fila);

                if (multipleCategorias && index === item.categorias!.length - 1) {
                    resultados.push({
                        id: num++,
                        idTemp: item.id,
                        indicador: item.nameEs,
                        categoria: '',
                        unidad: '',
                        alcance: '',
                        year: '',
                        valorInicial: '',
                        valorFinal: '',
                        mostrar: true,
                        categorias: categorias.filter((cat) => item.categorias!.includes(cat.id)),
                    });
                }
            });
        } else {
            const unidadMedidaEncontrada = unidadesMedida.find((med) => med.id === item.unidadMedida);
            resultados.push({
                id: num++,
                idTemp: item.id,
                indicador: item.nameEs,
                categoria: '-',
                unidad: unidadMedidaEncontrada ? unidadMedidaEncontrada.nameEs : 'FALLO UNIDAD MEDIDA',
                alcance: '',
                year: '',
                valorInicial: '',
                valorFinal: '',
                mostrar: true,
            });
        }
    });

    return resultados;
}

export interface Indicadoreslist {
    id: number;
    nameEs: string;
    nameEu: string;
    unidadMedida?: number;
    categorias?: Categorias[];
}

const Index = () => {
    const { t, i18n } = useTranslation();
    const nuevosIndicadores = convertirIndicadores(listadoIndicadoresImpacto);
    const [indicadores, setIndicadores] = useState<Indicador[]>(nuevosIndicadores);
    const [mostrarDrop, setMostrarDrop] = useState<number>(0);

    useEffect(() => {
        const indicadoresInpacto = localStorage.getItem('indicadoresInpacto');
        if (indicadoresInpacto && indicadoresInpacto?.length > 0) {
            setIndicadores(JSON.parse(indicadoresInpacto));
        }
    }, []);

    //Borrar useEffect
    useEffect(() => {
        //Borrar useEffect
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

    useEffect(() => {
        setIndicadores(() => {
            return [...indicadores];
        });
    }, [mostrarDrop]);

    const [editableRowIndex, setEditableRowIndex] = useState<number | null>(null);

    const handleEliminarFila = (rowIndex: number) => {
        if (window.confirm(t('confirmarEliminarIndicador'))) {
            const indicadoresMostrados = indicadores.filter((fila) => fila.mostrar);
            const idAModificar = indicadoresMostrados[rowIndex].id;
            setIndicadores((prev) => prev.map((item) => (item.id === idAModificar ? { ...item, alcance: '', mostrar: false, year: '', valorInicial: '', objetivo: undefined } : item)));

            const idTemp = indicadoresMostrados[rowIndex].idTemp;
            setIndicadores((prev) => {
                const indicesCoinciden = prev.map((item, index) => ({ item, index })).filter(({ item }) => item.idTemp === idTemp);
                const ultimoIndex = indicesCoinciden.at(-1)?.index;
                return prev.map((indicador, i) => (i === ultimoIndex ? { ...indicador, mostrar: true } : indicador));
            });
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>, idTemp: number) => {
        const newCategoria = e.target.value;
        setIndicadores((prev) => prev.map((indicador) => (indicador.idTemp === idTemp && indicador.categoria === newCategoria ? { ...indicador, mostrar: true } : indicador)));

        const filtrados = indicadores.filter((i) => i.idTemp === idTemp);

        let cont = 0;
        for (let index = 0; index < filtrados.length; index++) {
            const indicador = indicadores[index];
            if (indicador.mostrar) {
                cont++;
            }
        }
        if (!(cont === filtrados.length - 1)) {
            setMostrarDrop(0);
        } else {
            setIndicadores((prev) => {
                const indicesCoinciden = prev.map((item, index) => ({ item, index })).filter(({ item }) => item.idTemp === idTemp);

                const ultimoIndex = indicesCoinciden.at(-1)?.index;

                return prev.map((indicador, i) => (i === ultimoIndex ? { ...indicador, mostrar: false } : indicador));
            });
        }
    };

    const handleChangeTerritorial = (e: React.ChangeEvent<HTMLSelectElement>, id: number) => {
        const value = e.target.value;
        setIndicadores((prev) => prev.map((item) => (item.id === id ? { ...item, alcance: value } : item)));
    };

    const handleChangeObjetivo = (e: React.ChangeEvent<HTMLSelectElement>, id: number) => {
        const value = e.target.value as 'Aumentar' | 'Mantener' | 'Disminuir';
        setIndicadores((prev) => prev.map((item) => (item.id === id ? { ...item, objetivo: value } : item)));
    };

    const columns: DataTableColumn<Indicador>[] = [
        {
            accessor: 'indicador',
            title: 'Indicador',
            width: 400,
            render: (record: Indicador, index) => {
                const isFirst = indicadores.filter((fila) => fila.mostrar).findIndex((r) => r.indicador === record.indicador) === index;
                const indicador = record.indicador;

                if (record.categoria === '-') {
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
                if (record.categorias && record.categorias.length > 1 && mostrarDrop != record.idTemp) {
                    return (
                        <div className="flex gap-2 w-full">
                            <button className="bg-success text-white px-2 py-1 rounded" onClick={() => setMostrarDrop(record.idTemp)}>
                                {t('agregarFila')}
                            </button>
                        </div>
                    );
                }
            },
        },
        {
            accessor: 'categoria',
            title: 'Categoria',
            width: 200,
            render: (record: Indicador, index) => {
                const isFirst = indicadores.filter((fila) => fila.mostrar).findIndex((r) => r.indicador === record.indicador) === index;
                const categoria = record.categoria;
                if (categoria === '-') {
                    return (
                        <div style={{ position: 'relative', minHeight: 40 }}>
                            <div>{categoria}</div>
                        </div>
                    );
                }
                const prueba = mostrarDrop === record.idTemp;

                if (record.categorias && record.categorias.length > 0 && (isFirst || prueba)) {
                    const datos = indicadores.filter((ind) => ind.idTemp === record.idTemp);
                    const opcionesYaMostradas = datos.filter((dato) => dato.mostrar && !dato.categorias).map((dato) => dato.categoria);
                    const opciones = record.categorias.map((c) => (i18n.language === 'eu' ? c.nameEu : c.nameEs)).filter((name) => !opcionesYaMostradas.includes(name));

                    return (
                        <div style={{ position: 'relative', minHeight: 40 }}>
                            <SimpleDropdown options={opciones} mostrarSeleccionaopcion={true} onChange={(e) => handleChange(e, record.idTemp)} />
                        </div>
                    );
                } else {
                    if (categoria === 'contiene') {
                        //TODO Eliminar
                        console.error('MUESTRA CONTIENE');
                    } else {
                        return (
                            <div style={{ position: 'relative', minHeight: 40 }}>
                                <div>{categoria}</div>
                            </div>
                        );
                    }
                }
            },
        },
        { accessor: 'unidad', title: 'Unidad de medida', width: 100 },
        editableColumnByPathInput<Indicador, string>('alcance', 'Alcance Territorial', setIndicadores, editableRowIndex, 300, (value, _onChange, record) => (
            <select className="border p-1 rounded" value={value ?? ''} onChange={(e) => handleChangeTerritorial(e, record.id)}>
                <option value="" disabled>
                    {t('seleccionaopcion')}
                </option>
                <option value="Comarcal">{t('comarcal')}</option>
                <option value="ZEA">{t('ZEA')}</option>
                <option value="Zona rural (ZEA + TER+ zona rural de HRD)">{t('Zrural')}</option>
                <option value="Municipios rurales (ZEA + TER)">{t('ZEATER')}</option>
            </select>
        )),
        editableColumnByPathInput<Indicador>('year', 'Año', setIndicadores, editableRowIndex, 60),
        editableColumnByPathInput<Indicador>('valorInicial', 'Valor Inicial', setIndicadores, editableRowIndex, 80),
        editableColumnByPathInput<Indicador, string>('objetivo', 'Objetivo', setIndicadores, editableRowIndex, 100, (value, _onChange, record) => (
            <select className="border p-1 rounded" value={value ?? ''} onChange={(e) => handleChangeObjetivo(e, record.id)}>
                <option value="" disabled>
                    {t('seleccionaOpciones')}
                </option>
                <option value="Aumentar">{t('aumentar')}</option>
                <option value="Mantener">{t('mantener')}</option>
                <option value="Disminuir">{t('disminuir')}</option>
            </select>
        )),

        {
            accessor: 'acciones',
            title: t('Acciones'),
            width: 130,
            render: (record, index) => {
                const isFirst = indicadores.filter((fila) => fila.mostrar).findIndex((r) => r.indicador === record.indicador) === index;

                if ((isFirst && !record.categorias) || !record.categorias) {
                    if (editableRowIndex === index) {
                        return (
                            <button
                                className="bg-success text-white px-2 py-1 rounded"
                                onClick={() => {
                                    setEditableRowIndex(null);
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

    const handleSave = () => {
        const indicado = [];
        for (let index = 0; index < indicadores.length; index++) {
            const indicador = indicadores[index];
            if (!(indicador.categorias || !indicador.mostrar)) {
                indicado.push(indicador);
            }
        }
        localStorage.setItem('indicadoresInpacto', JSON.stringify(indicado));
    };

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <div className="text-xl font-bold flex items-center space-x-2 ">
                        <span>{t('indicadoresInpacto')}</span>
                    </div>
                }
                zonaBtn={
                    <button className="px-4 py-2 bg-primary text-white rounded flex items-center justify-center font-medium h-10 min-w-[120px]" onClick={handleSave}>
                        {t('guardar')}
                    </button>
                }
            />
            <DataTable<Indicador> records={indicadores.filter((fila) => fila.mostrar)} columns={columns} withRowBorders={false} withColumnBorders striped highlightOnHover minHeight={200} />
        </div>
    );
};

export default Index;

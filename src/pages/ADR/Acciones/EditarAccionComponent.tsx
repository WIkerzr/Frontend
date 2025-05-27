import { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useDispatch, useSelector } from 'react-redux';
import { setPageTitle } from '../../../store/themeConfigSlice';
import Tippy from '@tippyjs/react';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { IRootState } from '../../../store';
import { editableColumnByPath } from './Columnas';

export interface HMT {
    hombres: string;
    mujeres: string;
    total: string;
}
export interface Indicador {
    id: number;
    nombre: string;
    metaAnual: HMT;
    ejecutado: HMT;
    metaFinal: HMT;
    hipotesis?: string;
}

interface tablaIndicadoresProps {
    indicador: Indicador[];
}

export const PestanaIndicadores = forwardRef<HTMLButtonElement, tablaIndicadoresProps>(({ indicador }, ref) => {
    const { t } = useTranslation();
    const [indicadores, setIndicadores] = useState<Indicador[]>(indicador);

    useEffect(() => {
        setIndicadores(indicador);
    }, []);

    const dispatch = useDispatch();
    useEffect(() => {
        dispatch(setPageTitle('Order Sorting Table'));
    });
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 15, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(indicadores, 'id'));
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    const [editableRowIndex, setEditableRowIndex] = useState(-1);

    const agregarFila = () => {
        setIndicadores((prev) => [
            ...prev,
            {
                id: Date.now(),
                nombre: '',
                metaAnual: { hombres: '', mujeres: '', total: '' },
                ejecutado: { hombres: '', mujeres: '', total: '' },
                metaFinal: { hombres: '', mujeres: '', total: '' },
            },
        ]);
        setEditableRowIndex(indicadores.length);
    };

    const columns = [
        editableColumnByPath<Indicador>('nombre', t('nombre'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('metaAnual.hombres', t('mhombres'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('metaAnual.mujeres', t('mmujeres'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('metaAnual.total', t('mtotal'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('ejecutado.hombres', t('ehombres'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('ejecutado.mujeres', t('emujeres'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('ejecutado.total', t('etotal'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('metaFinal.hombres', t('fhombres'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('metaFinal.mujeres', t('fmujeres'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('metaFinal.total', t('ftotal'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('hipotesis', t('hipotesis'), setIndicadores, editableRowIndex, true),
        {
            accessor: 'acciones',
            title: 'Acciones',
            render: (_row: Indicador, index: number) =>
                editableRowIndex === index ? (
                    <button
                        className="bg-green-500 text-white px-2 py-1 rounded"
                        onClick={() => {
                            if (_row.nombre != '' && _row.metaAnual.total != '' && _row.metaFinal.total != '' && _row.ejecutado.total != '') {
                                setEditableRowIndex(-1);
                            } else alert(t('Se tiene que rellenar como minimo el campo Nombre, y todos los totales para poder guardar'));
                        }}
                    >
                        Guardar
                    </button>
                ) : (
                    <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => setEditableRowIndex(index)}>
                        Editar
                    </button>
                ),
        },
    ];

    useEffect(() => {
        setPage(1);
    }, [pageSize]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsData([...initialRecords.slice(from, to)]);
    }, [page, pageSize, initialRecords]);

    useEffect(() => {
        setInitialRecords(() => {
            if (!search.trim()) return sortBy(indicadores, 'id');
            const s = search.toLowerCase();
            return indicadores.filter(
                (item) =>
                    (item.nombre && String(item.nombre).toLowerCase().includes(s)) ||
                    (item.metaAnual.hombres && item.metaAnual.hombres.toLowerCase().includes(s)) ||
                    (item.metaAnual.mujeres && item.metaAnual.mujeres.toLowerCase().includes(s)) ||
                    (item.metaAnual.total && item.metaAnual.total.toLowerCase().includes(s)) ||
                    (item.ejecutado.hombres && item.ejecutado.hombres.toLowerCase().includes(s)) ||
                    (item.ejecutado.mujeres && item.ejecutado.mujeres.toLowerCase().includes(s)) ||
                    (item.ejecutado.total && item.ejecutado.total.toLowerCase().includes(s)) ||
                    (item.metaFinal.hombres && item.metaFinal.hombres.toLowerCase().includes(s)) ||
                    (item.metaFinal.mujeres && item.metaFinal.mujeres.toLowerCase().includes(s)) ||
                    (item.metaFinal.total && item.metaFinal.total.toLowerCase().includes(s)) ||
                    (item.hipotesis && item.hipotesis.toLowerCase().includes(s))
            );
        });
    }, [search, indicadores]);

    useEffect(() => {
        const data = sortBy(initialRecords, sortStatus.columnAccessor);
        setInitialRecords(sortStatus.direction === 'desc' ? data.reverse() : data);
        setPage(1);
    }, [sortStatus]);
    return (
        <div>
            <div className="flex items-center space-x-4 mb-5">
                <input type="text" className="border border-gray-300 rounded p-2 w-full max-w-xs" placeholder={t('Buscar') + ' ...'} value={search} onChange={(e) => setSearch(e.target.value)} />
                <button className="mb-4 px-4 py-2 bg-primary text-white rounded" onClick={agregarFila}>
                    {t('Agregar fila')}
                </button>
            </div>
            <div className="panel mt-6">
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className={`${isRtl ? 'whitespace-nowrap table-hover' : 'whitespace-nowrap table-hover'}`}
                        records={recordsData}
                        columns={columns}
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => t('paginacion', { from: `${from}`, to: `${to}`, totalRecords: `${totalRecords}` })}
                        recordsPerPageLabel={t('recorsPerPage')}
                    />
                </div>
            </div>
        </div>
    );
});

import { forwardRef, useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { sortBy } from 'lodash';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { editableColumnByPath } from './Columnas';
import { EstadoLabel } from '../../../types/TipadoAccion';

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
    [key: string]: any;
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

    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 15, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [initialRecords, setInitialRecords] = useState(sortBy(indicadores, 'id'));
    const [recordsData, setRecordsData] = useState(initialRecords);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus<Indicador>>({ columnAccessor: 'id', direction: 'asc' });
    const [editableRowIndex, setEditableRowIndex] = useState(-1);

    const agregarFila = () => {
        const ultima = indicadores[indicadores.length - 1];
        if (ultima && (!ultima.nombre || !ultima.metaAnual?.total || !ultima.ejecutado?.total || !ultima.metaFinal?.total)) {
            alert(t('completarUltimaFila'));
            return;
        }

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
    const columnMetaAnual = [
        editableColumnByPath<Indicador>('metaAnual.hombres', t('Hombre'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('metaAnual.mujeres', t('Mujer'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('metaAnual.total', t('Total'), setIndicadores, editableRowIndex, true),
    ];
    const columnEjecutadoAnual = [
        editableColumnByPath<Indicador>('ejecutado.hombres', t('Hombre'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('ejecutado.mujeres', t('Mujer'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('ejecutado.total', t('Total'), setIndicadores, editableRowIndex, true),
    ];

    const columnMetaFinal = [
        editableColumnByPath<Indicador>('metaFinal.hombres', t('Hombre'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('metaFinal.mujeres', t('Mujer'), setIndicadores, editableRowIndex, true),
        editableColumnByPath<Indicador>('metaFinal.total', t('Total'), setIndicadores, editableRowIndex, true),
    ];
    const columnNombre = [editableColumnByPath<Indicador>('nombre', t('nombre'), setIndicadores, editableRowIndex, true)];

    const columns = [
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
                            } else alert(t('alertIndicadores'));
                        }}
                    >
                        {t('guardar')}
                    </button>
                ) : (
                    <button className="bg-blue-500 text-white px-2 py-1 rounded" onClick={() => setEditableRowIndex(index)}>
                        {t('editar')}
                    </button>
                ),
        },
    ];
    const columnGroups = [
        { id: 'nombre', title: '', columns: columnNombre },
        { id: 'metaAnual', title: t('Meta Anual'), textAlignment: 'center', columns: columnMetaAnual },
        { id: 'ejecutado', title: t('Ejecutado'), textAlignment: 'center', columns: columnEjecutadoAnual },
        { id: 'metaFinal', title: t('Meta Final'), textAlignment: 'center', columns: columnMetaFinal },
        { id: 'final', title: '', columns: columns },
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
            <div className="p-1 flex items-center space-x-4 mb-5">
                <input type="text" className="border border-gray-300 rounded p-2 w-full max-w-xs" placeholder={t('Buscar') + ' ...'} value={search} onChange={(e) => setSearch(e.target.value)} />
                <button className="px-4 py-2 bg-primary text-white rounded" onClick={agregarFila}>
                    {t('Agregar fila')}
                </button>
            </div>
            <div className="panel mt-6 ">
                <div>
                    <DataTable
                        className={`datatable-pagination-horizontal `}
                        records={recordsData}
                        groups={columnGroups}
                        totalRecords={initialRecords.length}
                        recordsPerPage={pageSize}
                        withRowBorders={false}
                        withColumnBorders={true}
                        striped={true}
                        highlightOnHover={true}
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

type StatusType = 'aprobado' | 'proceso' | 'cerrado' | 'borrador';

const statusColors: Record<StatusType, string> = {
    aprobado: 'bg-green-400',
    proceso: 'bg-yellow-400',
    cerrado: 'bg-red-400',
    borrador: 'bg-blue-400',
};

interface TabCardProps {
    icon: string;
    label: string;
    status?: StatusType;
    className?: string;
}

export const TabCard: React.FC<TabCardProps> = ({ icon, label, status = 'borrador', className }) => {
    const { t } = useTranslation();
    return (
        <div className={`flex items-center`}>
            <div className="relative">
                <img src={icon} alt={t(`${label}`)} className="w-6 h-6" />
                <span className={`absolute -top-1 -right-0 w-3 h-3 rounded-full border-2 border-white ${statusColors[status]}`} />
            </div>
            <span className={`font-semibold ${className}`}>{t(`${label}`)}</span>
        </div>
    );
};

const estados: { label: EstadoLabel; color: string }[] = [
    { label: 'Actuación en ejecución', color: 'bg-green-100 text-green-800' },
    { label: 'Actuación en espera', color: 'bg-yellow-100 text-yellow-800' },
    { label: 'Actuación finalizada', color: 'bg-blue-100 text-blue-800' },
    { label: 'Actuación abandonada', color: 'bg-red-100 text-red-800' },
];

type CustomSelectProps = {
    value: EstadoLabel;
    onChange: (value: EstadoLabel) => void;
};

export function CustomSelect({ value, onChange }: CustomSelectProps) {
    const selected = estados.find((e) => e.label === value) || estados[0];
    const [open, setOpen] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const handleSelect = (estado: { label: EstadoLabel; color: string }) => {
        onChange(estado.label);
        setOpen(false);
    };

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setOpen(false);
            }
        }
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative w-full max-w-sm -top-[2px]" ref={dropdownRef}>
            <button type="button" onClick={() => setOpen(!open)} className={`w-full text-left p-2 rounded border ${selected.color}`}>
                {selected.label}
            </button>

            {open && (
                <div className="absolute mt-1 w-full border rounded shadow bg-white z-10">
                    {estados.map((estado) => (
                        <div key={estado.label} onClick={() => handleSelect(estado)} className={`p-2 cursor-pointer hover:bg-gray-100 ${estado.color}`}>
                            {estado.label}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}

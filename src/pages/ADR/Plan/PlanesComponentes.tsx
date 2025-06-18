import Tippy from '@tippyjs/react';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrash from '../../../components/Icon/IconTrash';
import React, { useRef } from 'react';
const buttonRef = useRef<HTMLButtonElement>(null);
const initialRecords = [
    {
        id: 1,
        indicadoresOperativos: `Proceso participativo elaboración y metodología del PCDR. Horas Realización de Plan Comarcal Desarrollo Rural (PCDR): Horas`,
        valorPrevisto: '600 horas',
    },
    {
        id: 2,
        indicadoresOperativos: `Participación y presentación del Planes Desarrollo Territoriales (PDTs). Horas`,
        valorPrevisto: '30 horas',
    },
];

export const IndicadoresOperativosPlanTable: React.FC = () => {
    const { t } = useTranslation();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const PAGE_SIZES = [10, 15, 20, 30, 50, 100];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const [recordsData] = useState(initialRecords);

    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });

    return (
        <div>
            <div className="mt-6">
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className={`${isRtl ? 'whitespace-nowrap table-hover' : 'whitespace-nowrap table-hover'}`}
                        records={recordsData}
                        columns={[
                            { accessor: 'indicadoresOperativos', title: t('indicadoresOperativos'), sortable: true },
                            { accessor: 'valorPrevisto', title: t('valorPrevisto'), sortable: true },
                            {
                                accessor: 'vacio2',
                                title: '',
                                render: () => (
                                    <div className="flex justify-end space-x-3">
                                        <Tippy content={t('editar')}>
                                            {
                                                <button type="button" ref={buttonRef}>
                                                    <IconPencil />
                                                </button>
                                            }
                                        </Tippy>
                                        <Tippy content={t('borrar')}>
                                            {
                                                <button type="button" ref={buttonRef}>
                                                    <IconTrash />
                                                </button>
                                            }
                                        </Tippy>
                                    </div>
                                ),
                            },
                        ]}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        minHeight={200}
                        recordsPerPageLabel={t('recorsPerPage')}
                    />
                </div>
            </div>
        </div>
    );
};

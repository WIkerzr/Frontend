import Tippy from '@tippyjs/react';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import { IRootState } from '../../../store';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrash from '../../../components/Icon/IconTrash';
import { useYear } from '../../../contexts/DatosAnualContext';
import { OperationalIndicators } from '../../../types/tipadoPlan';
import { nanoid } from '@reduxjs/toolkit';
import { NewModal } from '../../../components/Utils/utils';
import { Input } from '../../../components/Utils/inputs';

interface ModalIndicadorOperativo {
    open: boolean;
    idModal: string;
    onClose: () => void;
}

const ModalIndicador = forwardRef<HTMLDivElement, ModalIndicadorOperativo>(({ open, idModal, onClose }) => {
    const { t, i18n } = useTranslation();
    const { yearData, setYearData } = useYear();

    const datosBuscados = { ...yearData.plan.operationalIndicators.find((item) => item.id === idModal) };
    if (!datosBuscados) {
        return <span>{t('datosNoEncontrados')}</span>;
    }
    const datos: OperationalIndicators = {
        id: datosBuscados.id || nanoid(),
        nameEs: datosBuscados.nameEs || '',
        nameEu: datosBuscados.nameEu || '',
        value: datosBuscados.value || '',
    };
    const [indicator, setIndicator] = useState<OperationalIndicators>(datos);

    if (!indicator) {
        setIndicator({ id: nanoid(), nameEs: '', nameEu: '', value: '' });
    }

    const handleEdit = () => {
        setYearData({
            ...yearData,
            plan: {
                ...yearData.plan,
                operationalIndicators: yearData.plan.operationalIndicators.map((item) => (item.id === idModal ? indicator : item)),
            },
        });
        onClose();
    };

    const handleNew = () => {
        setYearData({
            ...yearData,
            plan: {
                ...yearData.plan,
                operationalIndicators: [...yearData.plan.operationalIndicators, indicator],
            },
        });
        onClose();
    };

    return (
        <NewModal open={open} onClose={onClose} title={t('indicadoresOperativos')}>
            <div>
                <div className=" flex w-[100%] flex-col">
                    <label htmlFor="indicadoresOperativos">*{t('indicadoresOperativos')}</label>
                    <textarea
                        required
                        name="indicadoresOperativos"
                        className="w-full border rounded p-2 h-[114px] resize-y"
                        value={i18n.language === 'es' ? indicator.nameEs : indicator.nameEu}
                        onChange={(e) => {
                            const newValue = e.target.value;
                            setIndicator((prev) => ({
                                ...prev,
                                ...(i18n.language === 'es' ? { nameEs: newValue } : { nameEu: newValue }),
                            }));
                        }}
                    />
                </div>
                <Input
                    nombreInput="valorPrevisto"
                    type="text"
                    value={indicator.value}
                    name="valorPrevisto"
                    onChange={(e) => {
                        const newValue = e.target.value;
                        setIndicator((prev) => ({
                            ...prev,
                            value: newValue,
                        }));
                    }}
                />
            </div>

            <div className="flex justify-end gap-2 mt-4">
                <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">
                    {t('cancelar')}
                </button>
                {idModal != 'nuevo' ? (
                    <button className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={() => handleEdit()}>
                        {t('editar')}
                    </button>
                ) : (
                    <button className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded" onClick={() => handleNew()}>
                        {t('anadir')}
                    </button>
                )}
            </div>
        </NewModal>
    );
});

export const IndicadoresOperativosPlanTable = forwardRef<HTMLBaseElement>(() => {
    const { t, i18n } = useTranslation();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const PAGE_SIZES = [10, 15, 20, 30, 50, 100];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    const { yearData, setYearData } = useYear();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [idModal, setIdModal] = useState<string>('');

    let tableRecords: Record<string, unknown>[] = yearData.plan.operationalIndicators.map((item) => ({
        id: item.id,
        indicadoresOperativos: i18n.language === 'es' ? item.nameEs : item.nameEu,
        valorPrevisto: item.value,
    }));

    useEffect(() => {
        tableRecords = yearData.plan.operationalIndicators.map((item) => ({
            id: item.id,
            indicadoresOperativos: i18n.language === 'es' ? item.nameEs : item.nameEu,
            valorPrevisto: item.value,
        }));
    }, [yearData]);

    const handleDelete = (id: string) => {
        if (window.confirm(t('¿Estás seguro de que quieres borrar este indicador?'))) {
            setYearData({
                ...yearData,
                plan: {
                    ...yearData.plan,
                    operationalIndicators: yearData.plan.operationalIndicators.filter((item) => item.id !== id),
                },
            });
        }
    };

    return (
        <div>
            <div className="mt-6">
                <div className="flex justify-end mb-2">
                    <button type="button" className="btn btn-primary w-1/4 " onClick={() => (setModalOpen(true), setIdModal('nuevo'))}>
                        {t('nuevoIndicadorOperativo')}
                    </button>
                </div>
                <div className="datatables">
                    <DataTable
                        highlightOnHover
                        className={`${isRtl ? 'whitespace-nowrap table-hover' : 'whitespace-nowrap table-hover'}`}
                        records={tableRecords}
                        columns={[
                            { accessor: 'indicadoresOperativos', title: t('indicadoresOperativos'), sortable: true },
                            { accessor: 'valorPrevisto', title: t('valorPrevisto'), sortable: true },
                            {
                                accessor: 'vacio2',
                                title: '',
                                render: (record) => (
                                    <div className="flex justify-end space-x-3">
                                        <Tippy content={t('editar')}>
                                            <button type="button" onClick={() => (setModalOpen(true), setIdModal(record.id as string))}>
                                                <IconPencil />
                                            </button>
                                        </Tippy>
                                        <Tippy content={t('borrar')}>
                                            <button type="button" onClick={() => handleDelete(record.id as string)}>
                                                <IconTrash />
                                            </button>
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
                <ModalIndicador open={modalOpen} idModal={idModal} onClose={() => setModalOpen(false)} />
            </div>
        </div>
    );
});

import { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useYear } from '../../../contexts/DatosAnualContext';
import { GeneralOperationADR, OperationalIndicators, Plan } from '../../../types/tipadoPlan';
import Tippy from '@tippyjs/react';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useSelector } from 'react-redux';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrash from '../../../components/Icon/IconTrash';
import { NewModal } from '../../../components/Utils/utils';
import { IRootState } from '../../../store';
import { Input } from '../../../components/Utils/inputs';
import { nanoid } from '@reduxjs/toolkit';

interface CamposProps {
    campo?: {
        [K in keyof Plan]: Plan[K] extends string ? K : never;
    }[keyof Plan];
    campo2?: {
        [K in keyof GeneralOperationADR]: Extract<GeneralOperationADR[K], string> extends never ? never : K;
    }[keyof GeneralOperationADR];
    mostrar: boolean;
}

interface CamposPlanMemoriaProps {
    pantalla: 'Plan' | 'Memoria';
}

export const CamposPlanMemoria = forwardRef<HTMLDivElement, CamposPlanMemoriaProps>(({ pantalla }) => {
    const { t } = useTranslation();
    const { yearData, setYearData } = useYear();

    const Campos: React.FC<CamposProps> = ({ campo, campo2, mostrar }) => {
        if (!mostrar) {
            return null;
        }
        if (campo) {
            const handleChangeCampos = (campo: keyof Plan, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                setYearData({
                    ...yearData,
                    plan: {
                        ...yearData.plan,
                        [campo]: e.target.value || '',
                    },
                });
            };
            return (
                <div className="panel flex w-[100%] flex-col">
                    <label htmlFor="introduccion">*{t(campo)}</label>
                    <textarea required name="introduccion" className="w-full border rounded p-2 h-[114px] resize-y" value={yearData.plan[campo]} onChange={(e) => handleChangeCampos(campo, e)} />
                </div>
            );
        } else if (campo2) {
            const handleChangeCampos = (campo: keyof GeneralOperationADR, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                setYearData({
                    ...yearData,
                    plan: {
                        ...yearData.plan,
                        generalOperationADR: {
                            ...yearData.plan.generalOperationADR,
                            [campo]: e.target.value || '',
                        },
                    },
                });
            };
            return (
                <div>
                    <label htmlFor="introduccion">*{t(campo2)}</label>
                    <textarea
                        required
                        name="introduccion"
                        className="w-full border rounded p-2 h-[114px] resize-y"
                        value={yearData.plan.generalOperationADR[campo2]}
                        onChange={(e) => handleChangeCampos(campo2, e)}
                    />
                </div>
            );
        }
    };

    return (
        <div className=" flex flex-col gap-4">
            <Campos campo="introduccion" mostrar={pantalla === 'Plan'} />
            <Campos campo="proceso" mostrar={pantalla === 'Plan'} />
            <div className="panel">
                <span className="text-xl  font-semibold text-gray-700 tracking-wide block mb-2">{t('funcionamientoGeneral')}</span>
                <Campos campo2="adrInternalTasks" mostrar={pantalla === 'Plan'} />
                <div>
                    <IndicadoresOperativosTable pantalla={pantalla} />
                </div>
                <Campos campo2="detalleSeguimiento" mostrar={pantalla === 'Memoria'} />
                <Campos campo2="valoracionFinal" mostrar={pantalla === 'Memoria'} />
            </div>
        </div>
    );
});

interface ModalIndicadorOperativo {
    open: boolean;
    idModal: string;
    onClose: () => void;
    pantalla: 'Plan' | 'Memoria';
}

const ModalIndicador = forwardRef<HTMLDivElement, ModalIndicadorOperativo>(({ open, idModal, onClose, pantalla }) => {
    const { t, i18n } = useTranslation();
    const { yearData, setYearData } = useYear();

    const datosBuscados = { ...yearData.plan.generalOperationADR.operationalIndicators.find((item) => item.id === idModal) };
    if (!datosBuscados) {
        return <span>{t('datosNoEncontrados')}</span>;
    }

    const datos: OperationalIndicators = {
        id: datosBuscados.id || nanoid(),
        nameEs: datosBuscados.nameEs || '',
        nameEu: datosBuscados.nameEu || '',
        value: datosBuscados.value || '',
        valueAchieved: datosBuscados.valueAchieved || '',
    };
    const [indicator, setIndicator] = useState<OperationalIndicators>(datos);

    useEffect(() => {
        setIndicator(datos);
    }, [open]);

    const handleEdit = () => {
        setYearData({
            ...yearData,
            plan: {
                ...yearData.plan,
                generalOperationADR: {
                    ...yearData.plan.generalOperationADR,
                    operationalIndicators: yearData.plan.generalOperationADR.operationalIndicators.map((item) => (item.id === idModal ? indicator : item)),
                },
            },
        });
        onClose();
    };

    const handleNew = () => {
        setYearData({
            ...yearData,
            plan: {
                ...yearData.plan,
                generalOperationADR: {
                    ...yearData.plan.generalOperationADR,
                    operationalIndicators: [...yearData.plan.generalOperationADR.operationalIndicators, indicator],
                },
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
                        readOnly={pantalla === 'Memoria'}
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
                    readOnly={pantalla === 'Memoria'}
                    name="valorPrevisto"
                    onChange={(e) => {
                        const newValue = e.target.value;
                        setIndicator((prev) => ({
                            ...prev,
                            value: newValue,
                        }));
                    }}
                />
                {pantalla === 'Memoria' && (
                    <Input
                        nombreInput="valueAchieved"
                        type="text"
                        value={indicator.valueAchieved}
                        name="valueAchieved"
                        onChange={(e) => {
                            const newValue = e.target.value;
                            setIndicator((prev) => ({
                                ...prev,
                                valueAchieved: newValue,
                            }));
                        }}
                    />
                )}
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

interface IndicadoresOperativosTableProps {
    pantalla: 'Plan' | 'Memoria';
}

const IndicadoresOperativosTable = forwardRef<HTMLBaseElement, IndicadoresOperativosTableProps>(({ pantalla }) => {
    const { t, i18n } = useTranslation();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const PAGE_SIZES = [10, 15, 20, 30, 50, 100];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars, no-unused-vars
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    const { yearData, setYearData } = useYear();
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [idModal, setIdModal] = useState<string>('');

    let tableRecords: Record<string, unknown>[] = yearData.plan.generalOperationADR.operationalIndicators.map((item) => ({
        id: item.id,
        indicadoresOperativos: i18n.language === 'es' ? item.nameEs : item.nameEu,
        valorPrevisto: item.value,
        valueAchieved: item.valueAchieved,
    }));

    useEffect(() => {
        tableRecords = yearData.plan.generalOperationADR.operationalIndicators.map((item) => ({
            id: item.id,
            indicadoresOperativos: i18n.language === 'es' ? item.nameEs : item.nameEu,
            valorPrevisto: item.value,
            valueAchieved: item.valueAchieved,
        }));
    }, [yearData]);

    const handleDelete = (id: string) => {
        if (window.confirm(t('¿Estás seguro de que quieres borrar este indicador?'))) {
            setYearData({
                ...yearData,
                plan: {
                    ...yearData.plan,
                    generalOperationADR: {
                        ...yearData.plan.generalOperationADR,
                        operationalIndicators: yearData.plan.generalOperationADR.operationalIndicators.filter((item) => item.id !== id),
                    },
                },
            });
        }
    };

    return (
        <div>
            <div className="mt-6">
                {pantalla === 'Plan' && (
                    <div className="flex justify-end mb-2">
                        <button type="button" className="btn btn-primary w-1/4 " onClick={() => (setModalOpen(true), setIdModal('nuevo'))}>
                            {t('nuevoIndicadorOperativo')}
                        </button>
                    </div>
                )}
                <div className="datatables">
                    <DataTable
                        className={`${isRtl ? 'whitespace-nowrap table-hover' : 'whitespace-nowrap table-hover'}`}
                        records={tableRecords}
                        columns={[
                            { accessor: 'indicadoresOperativos', title: t('indicadoresOperativos') },
                            { accessor: 'valorPrevisto', title: t('valorPrevisto') },
                            ...(pantalla === 'Memoria' ? [{ accessor: 'valueAchieved', title: t('valueAchieved') }] : []),
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
                                        {pantalla === 'Plan' && (
                                            <Tippy content={t('borrar')}>
                                                <button type="button" onClick={() => handleDelete(record.id as string)}>
                                                    <IconTrash />
                                                </button>
                                            </Tippy>
                                        )}
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
                <ModalIndicador open={modalOpen} idModal={idModal} onClose={() => setModalOpen(false)} pantalla={pantalla} />
            </div>
        </div>
    );
});

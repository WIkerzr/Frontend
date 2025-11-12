/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { forwardRef, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useYear } from '../../../contexts/DatosAnualContext';
import { Ejes, GeneralOperationADR, Memoria, MemoriaLlamadaGestion, OperationalIndicators, Plan, YearData } from '../../../types/tipadoPlan';
import Tippy from '@tippyjs/react';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useSelector } from 'react-redux';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrash from '../../../components/Icon/IconTrash';
import { Aviso, Boton, NewModal } from '../../../components/Utils/utils';
import { IRootState } from '../../../store';
import { Input } from '../../../components/Utils/inputs';
import { nanoid } from '@reduxjs/toolkit';
import { t } from 'i18next';
import { useUser } from '../../../contexts/UserContext';
import { useEstadosPorAnio, useEstadosPorAnioContext } from '../../../contexts/EstadosPorAnioContext';
import { LlamadaBBDDActualizarMemoria, LlamadaBBDDActualizarPlan } from '../../../components/Utils/data/YearData/dataGestionPlanMemoria';
import { useRegionContext } from '../../../contexts/RegionContext';
import { Servicios } from '../../../types/GeneralTypes';
import { VerificarCamposIndicadoresPorRellenar, VerificarAccionFinal, VerificadorIndicadores } from '../Acciones/EditarAccion/EditarAccionComponent';
import { LoadingOverlayPersonalizada } from '../../Configuracion/Users/componentes';
import React from 'react';
import { ComprobacionYAvisosDeCambios } from '../../../components/Utils/animations';

export type PlanOMemoria = 'Plan' | 'Memoria';

interface CamposProps {
    campo?: {
        [K in keyof Plan]: Plan[K] extends string ? K : never;
    }[keyof Plan];
    campo2?: {
        [K in keyof GeneralOperationADR]: Extract<GeneralOperationADR[K], string> extends never ? never : K;
    }[keyof GeneralOperationADR];
    mostrar: boolean;
    plan: { data: Plan; set: React.Dispatch<React.SetStateAction<Plan>> };
    memoria: { data: Memoria; set: React.Dispatch<React.SetStateAction<Memoria>> };
    t: (key: string) => string;
}

const Campos: React.FC<CamposProps> = ({ campo, campo2, mostrar, plan, memoria, t }) => {
    const { data: dataPlan, set: setDataPlan } = plan;
    const { data: dataMemoria, set: setDataMemoria } = memoria;
    if (!mostrar) {
        return null;
    }
    if (campo) {
        const handleChangeCampos = (campo: keyof Plan, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
            setDataPlan({
                ...dataPlan,
                [campo]: e.target.value || '',
            });
        };
        return (
            <div className="panel flex w-[100%] flex-col">
                <label htmlFor={campo}>*{t(campo)}</label>
                <textarea required name={campo} className="w-full border rounded p-2 h-[114px] resize-y" value={dataPlan[campo] ?? ''} onChange={(e) => handleChangeCampos(campo, e)} />
            </div>
        );
    } else if (campo2) {
        if (campo2 === 'dSeguimiento' || campo2 === 'valFinal') {
            const handleChangeCampos = (campo: keyof GeneralOperationADR, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                setDataMemoria({
                    ...dataMemoria,
                    [campo]: e.target.value || '',
                });
            };
            return (
                <div>
                    <label htmlFor={campo2}>*{t(campo2)}</label>
                    <textarea name={campo2} className="w-full border rounded p-2 h-[114px] resize-y" value={dataMemoria[campo2] ?? ''} onChange={(e) => handleChangeCampos(campo2, e)} />
                </div>
            );
        } else {
            const handleChangeCampos = (campo: keyof GeneralOperationADR, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
                setDataPlan({
                    ...dataPlan,
                    generalOperationADR: {
                        ...dataPlan.generalOperationADR,
                        [campo]: e.target.value || '',
                    },
                });
            };
            return (
                <div>
                    <label htmlFor="introduccion">*{t(campo2)}</label>
                    <textarea
                        name="introduccion"
                        className="w-full border rounded p-2 h-[114px] resize-y"
                        value={dataPlan.generalOperationADR[campo2] ?? ''}
                        onChange={(e) => handleChangeCampos(campo2, e)}
                    />
                </div>
            );
        }
    }
};
interface PantallaProps {
    pantalla: PlanOMemoria;
}

interface CamposPlanMemoriaProps {
    pantalla: PlanOMemoria;
    guardadoProps: {
        value: boolean;
        set: React.Dispatch<React.SetStateAction<boolean>>;
    };
    setSuccessMessageSuperior: React.Dispatch<React.SetStateAction<string>>;
}

export const CamposPlanMemoria = forwardRef<HTMLDivElement, CamposPlanMemoriaProps>(({ pantalla, guardadoProps, setSuccessMessageSuperior }, ref) => {
    const { t } = useTranslation();
    const TareasInternasTraduciones = t('object:tareasInternas', { returnObjects: true }) as string[];
    const { yearData, setYearData } = useYear();
    const { regionSeleccionada } = useRegionContext();
    const { anioSeleccionada } = useEstadosPorAnio();

    const { value: guardado, set: setGuardado } = guardadoProps;

    const [dataPlan, setDataPlan] = useState<Plan>(yearData.plan);
    const [dataMemoria, setDataMemoria] = useState<Memoria>(yearData.memoria);

    const planProps = useMemo(() => ({ data: dataPlan, set: setDataPlan }), [dataPlan, setDataPlan]);
    const memoriaProps = useMemo(() => ({ data: dataMemoria, set: setDataMemoria }), [dataMemoria, setDataMemoria]);

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    useEffect(() => {
        setSuccessMessageSuperior(successMessage);
    }, [successMessage]);

    useEffect(() => {
        setDataPlan(yearData.plan);
        setDataMemoria(yearData.memoria);
    }, [yearData]);

    const { restablecer: restablecerPlan } = ComprobacionYAvisosDeCambios(dataPlan, {
        debounceMs: 500,
        message: t('object:cambioPagina'),
    });
    const { restablecer: restablecerMemoria } = ComprobacionYAvisosDeCambios(dataMemoria, {
        debounceMs: 500,
        message: t('object:cambioPagina'),
    });

    const handleChangeValGeneral = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDataMemoria({
            ...dataMemoria,
            valGeneral: e.target.value || '',
        });
    };

    useEffect(() => {
        if (guardado) {
            if (pantalla === 'Plan') {
                LlamadaBBDDActualizarPlan(Number(regionSeleccionada), anioSeleccionada!, setLoading, { setErrorMessage, setSuccessMessage }, dataPlan);
                setYearData({
                    ...yearData,
                    plan: dataPlan,
                });
                try {
                    if (restablecerPlan) restablecerPlan(dataPlan);
                } catch {
                    // ignore
                }
                setGuardado(false);
            } else if (pantalla === 'Memoria') {
                const dataMemoriaConGOADR: MemoriaLlamadaGestion = {
                    id: dataMemoria.id,
                    dSeguimiento: dataMemoria.dSeguimiento,
                    valFinal: dataMemoria.dSeguimiento,
                    generalOperationADR: dataPlan.generalOperationADR,
                    valGeneral: dataMemoria.valGeneral,
                };

                LlamadaBBDDActualizarMemoria(Number(regionSeleccionada), anioSeleccionada!, setLoading, { setErrorMessage, setSuccessMessage }, dataPlan.generalOperationADR, dataMemoriaConGOADR);
                setYearData({
                    ...yearData,
                    plan: dataPlan,
                    memoria: dataMemoria,
                });
                try {
                    if (restablecerPlan) restablecerPlan(dataPlan);
                } catch {
                    // ignore
                }
                try {
                    if (restablecerMemoria) restablecerMemoria(dataMemoria);
                } catch {
                    // ignore
                }
                setGuardado(false);
            }
        }
    }, [guardado]);

    return (
        <div className=" flex flex-col gap-4" ref={ref}>
            <LoadingOverlayPersonalizada
                isLoading={loading}
                message={{
                    successMessage,
                    setSuccessMessage,
                    errorMessage,
                    setErrorMessage,
                }}
                timeDelay={false}
            />
            <Campos campo="proceso" mostrar={pantalla === 'Plan'} plan={planProps} memoria={memoriaProps} t={t} />
            {pantalla === 'Memoria' && (
                <div>
                    <label>*{t('ValGeneral')}</label>
                    <textarea name={'ValGeneral'} className="w-full border rounded p-2 h-[114px] resize-y" value={dataMemoria.valGeneral ?? ''} onChange={(e) => handleChangeValGeneral(e)} />
                </div>
            )}
            <div className="panel">
                <span className="text-xl  font-semibold text-gray-700 tracking-wide block mb-2">{t('funcionamientoGeneral')}</span>
                <div className="mb-[10px]">
                    <span>
                        {TareasInternasTraduciones.map((tarea, index) => (
                            <React.Fragment key={index}>
                                {tarea}
                                <br />
                            </React.Fragment>
                        ))}
                        {pantalla === 'Memoria' && (
                            <>
                                {dataPlan.generalOperationADR.adrInternalTasks.split('\n').map((line, index) => (
                                    <React.Fragment key={index}>
                                        {line}
                                        <br />
                                    </React.Fragment>
                                ))}
                            </>
                        )}
                    </span>
                </div>
                <Campos campo2="adrInternalTasks" mostrar={pantalla === 'Plan'} plan={planProps} memoria={memoriaProps} t={t} />
                <div>
                    <IndicadoresOperativosTable pantalla={pantalla} plan={planProps} />
                </div>
                <Campos campo2="dSeguimiento" mostrar={pantalla === 'Memoria'} plan={planProps} memoria={memoriaProps} t={t} />
                <Campos campo2="valFinal" mostrar={pantalla === 'Memoria'} plan={planProps} memoria={memoriaProps} t={t} />
            </div>
        </div>
    );
});

interface ModalIndicadorOperativo {
    open: boolean;
    idModal: string;
    onClose: () => void;
    pantalla: PlanOMemoria;
    plan: { data: Plan; set: React.Dispatch<React.SetStateAction<Plan>> };
}

const ModalIndicador = forwardRef<HTMLDivElement, ModalIndicadorOperativo>(({ open, idModal, onClose, pantalla, plan }, ref) => {
    const { t, i18n } = useTranslation();
    const { data: dataPlan, set: setDataPlan } = plan;

    const datosBuscados = { ...dataPlan.generalOperationADR.operationalIndicators.find((item) => item.id === idModal) };
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

    if (!open) return;

    const handleEdit = () => {
        setDataPlan({
            ...dataPlan,
            generalOperationADR: {
                ...dataPlan.generalOperationADR,
                operationalIndicators: dataPlan.generalOperationADR.operationalIndicators.map((item) => (item.id === idModal ? indicator : item)),
            },
        });
        onClose();
    };

    const handleNew = () => {
        setDataPlan({
            ...dataPlan,
            generalOperationADR: {
                ...dataPlan.generalOperationADR,
                operationalIndicators: [...dataPlan.generalOperationADR.operationalIndicators, indicator],
            },
        });
        onClose();
    };

    return (
        <NewModal open={open} onClose={onClose} title={t('indicadoresOperativos')}>
            <div ref={ref}>
                <div className=" flex w-[100%] flex-col">
                    <label htmlFor="indicadoresOperativos">*{t('indicadoresOperativos')}</label>
                    <textarea
                        required
                        readOnly={pantalla === 'Memoria'}
                        name="indicadoresOperativos"
                        className="w-full border rounded p-2 h-[114px] resize-y"
                        value={i18n.language === 'es' ? indicator.nameEs ?? '' : indicator.nameEu ?? ''}
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
    pantalla: PlanOMemoria;
    plan: { data: Plan; set: React.Dispatch<React.SetStateAction<Plan>> };
}

const IndicadoresOperativosTable = forwardRef<HTMLDivElement, IndicadoresOperativosTableProps>(({ pantalla, plan }, ref) => {
    const { t, i18n } = useTranslation();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;

    const { data: dataPlan, set: setDataPlan } = plan;

    const PAGE_SIZES = [10, 15, 20, 30, 50, 100];
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus>({ columnAccessor: 'id', direction: 'asc' });
    const [modalOpen, setModalOpen] = useState<boolean>(false);
    const [idModal, setIdModal] = useState<string>('');

    let tableRecords: Record<string, unknown>[] = dataPlan.generalOperationADR.operationalIndicators.map((item) => ({
        id: item.id,
        indicadoresOperativos: i18n.language === 'es' ? item.nameEs : item.nameEu,
        valorPrevisto: item.value,
        valueAchieved: item.valueAchieved,
    }));

    useEffect(() => {
        tableRecords = dataPlan.generalOperationADR.operationalIndicators.map((item) => ({
            id: item.id,
            indicadoresOperativos: i18n.language === 'es' ? item.nameEs : item.nameEu,
            valorPrevisto: item.value,
            valueAchieved: item.valueAchieved,
        }));
    }, [plan]);

    const handleDelete = (id: string) => {
        if (window.confirm(t('¿Estás seguro de que quieres borrar este indicador?'))) {
            setDataPlan({
                ...dataPlan,
                generalOperationADR: {
                    ...dataPlan.generalOperationADR,
                    operationalIndicators: dataPlan.generalOperationADR.operationalIndicators.filter((item) => item.id !== id),
                },
            });
        }
    };

    return (
        <div ref={ref}>
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
                <ModalIndicador open={modalOpen} idModal={idModal} onClose={() => setModalOpen(false)} pantalla={pantalla} plan={plan} />
            </div>
        </div>
    );
});

export const BotonesAceptacionYRechazo = forwardRef<HTMLDivElement, PantallaProps>(({ pantalla }, ref) => {
    const { anioSeleccionada, cambiarEstadoPlan, cambiarEstadoMemoria } = useEstadosPorAnioContext();
    const { yearData } = useYear();
    const { user } = useUser();

    const zona = t((pantalla || '').toLowerCase()).toUpperCase();
    const condicionPantalla = pantalla === 'Plan' ? yearData.plan.status === 'proceso' : yearData.memoria.status === 'proceso';
    if (condicionPantalla && user?.role === 'HAZI') {
        return (
            <div className="ml-auto flex gap-4 items-center justify-end" ref={ref}>
                <button
                    className="px-4 py-2 bg-primary text-white rounded"
                    onClick={() => {
                        if (window.confirm(t('confirmacionAceptar', { zona: zona, fecha: anioSeleccionada }))) {
                            //TODO Cambio de status a aceptado y envio de notificacion al ADR
                            if (pantalla === 'Plan') {
                                cambiarEstadoPlan('aceptado');
                            } else if (pantalla === 'Memoria') {
                                cambiarEstadoMemoria('aceptado');
                            }
                        }
                    }}
                >
                    {t('aceptarPlanOMemoria', { zona: zona, fecha: anioSeleccionada })}
                </button>
                <button
                    className="px-4 py-2 bg-danger text-white rounded"
                    onClick={() => {
                        if (window.confirm(t('confirmacionRechazar', { zona: zona, fecha: anioSeleccionada }))) {
                            if (pantalla === 'Plan') {
                                cambiarEstadoPlan('borrador');
                            } else if (pantalla === 'Memoria') {
                                cambiarEstadoMemoria('borrador');
                            }
                        }
                    }}
                >
                    {t('rechazarPlanOMemoria', { zona: zona, fecha: anioSeleccionada })}
                </button>
            </div>
        );
    }
});

export const BotonReapertura = forwardRef<HTMLDivElement, PantallaProps>(({ pantalla }, ref) => {
    const { anioSeleccionada, cambiarEstadoPlan, cambiarEstadoMemoria } = useEstadosPorAnioContext();
    const { yearData } = useYear();

    const { user } = useUser();
    const zona = t((pantalla || '').toLowerCase()).toUpperCase();

    const condicionPantalla = pantalla === 'Plan' ? yearData.plan.status === 'aceptado' : yearData.memoria.status === 'aceptado';
    if (condicionPantalla && user?.role === 'HAZI') {
        const bloquear = pantalla === 'Plan' && yearData.memoria.status !== 'borrador';
        return (
            <div className="ml-auto flex gap-4 items-center justify-end" ref={ref}>
                {bloquear && <Aviso textoAviso={t('ReabrirPlan')} />}
                <Boton
                    tipo="guardar"
                    disabled={bloquear}
                    onClick={() => {
                        if (window.confirm(t('confirmacionReabrir', { zona: zona, fecha: anioSeleccionada }))) {
                            // Cambio de status a aceptado y envio de notificacion al ADR
                            if (pantalla === 'Plan') {
                                cambiarEstadoPlan('borrador');
                            } else if (pantalla === 'Memoria') {
                                cambiarEstadoMemoria('borrador');
                            }
                        }
                    }}
                    textoBoton={t('reabrirPlanOMemoria', { zona: zona, fecha: anioSeleccionada })}
                />
            </div>
        );
    }
});

export function validarCamposPlanGestionAnual(yearData: YearData): boolean {
    const plan = yearData.plan;

    if (!plan.proceso || plan.proceso.trim() === '') return false;

    if (!plan.generalOperationADR || !plan.generalOperationADR.adrInternalTasks || plan.generalOperationADR.adrInternalTasks.trim() === '') return false;

    if (!plan.generalOperationADR.operationalIndicators) return false;

    const existeIndicadorValido = plan.generalOperationADR.operationalIndicators.some(
        (OI) => ((OI.nameEs && OI.nameEs.trim() !== '') || (OI.nameEu && OI.nameEu.trim() !== '')) && OI.value.trim() !== ''
    );

    return existeIndicadorValido;
}
export function validarCamposMemoriaSeguimientoAnual(yearData: YearData): boolean {
    const memoria = yearData.memoria;
    const plan = yearData.plan;

    if (!memoria.valGeneral || memoria.valGeneral === '') return false;
    if (!memoria.valFinal || memoria.valFinal === '') return false;
    if (!memoria.dSeguimiento || memoria.dSeguimiento === '') return false;

    const existeIndicadorValido = plan.generalOperationADR.operationalIndicators.some((OI) => OI.valueAchieved && OI.valueAchieved.trim() !== '');

    return existeIndicadorValido;
}

export function validarAccionesEjes(ejes: Ejes[], editarPlan: boolean, editarMemoria: boolean, tipoPM: PlanOMemoria, t: (key: string, options?: any) => string): boolean | string[] {
    if (ejes.length === 0) return false;
    return ejes.every((eje) =>
        eje.acciones.every((accion) => {
            const validarCamposIndicadores = VerificarCamposIndicadoresPorRellenar(accion, editarPlan, editarMemoria, 'GuardadoEdicion', t, tipoPM, true);
            if (validarCamposIndicadores) {
                const camposFaltantes = VerificarAccionFinal(accion, editarPlan, editarMemoria, 'Acciones', true);
                return camposFaltantes && camposFaltantes.length === 0;
            } else {
                return false;
            }
        })
    );
}
export function validarAccionesEjesAccesorias(ejes: Ejes[], editarPlan: boolean, editarMemoria: boolean, tipoPM: PlanOMemoria): boolean {
    if (ejes.length === 0) return false;
    return ejes.every((eje) => {
        if (!eje.IsAccessory) return true;
        if (eje.acciones.length === 0) return false;
        return eje.acciones.every((accion) => {
            const indicadoresCorrecto = VerificadorIndicadores(accion, editarPlan, editarMemoria);
            const camposFaltantes = VerificarAccionFinal(accion, editarPlan, false, 'AccionesAccesorias', true);
            const camposFaltantesMem = VerificarAccionFinal(accion, editarPlan, true, 'AccionesAccesorias', true);
            const faltanCamposPlan = camposFaltantes ? camposFaltantes.length != 0 : false;
            const faltanCamposMemoria = camposFaltantesMem ? camposFaltantesMem.length != 0 : false;

            if (!faltanCamposPlan && indicadoresCorrecto && tipoPM === 'Plan') {
                return true;
            }

            if (!faltanCamposMemoria && indicadoresCorrecto && tipoPM === 'Memoria') {
                return true;
            }
            return false;
        });
    });
}

export function validarServicios(servicios: Servicios[], editarMemoria: boolean, tipoPM: PlanOMemoria, t: (key: string, options?: any) => string): boolean {
    const camposPendientes: string[] = [];

    if (servicios.length === 0) return false;

    const checkData = (value: any, name: string) => {
        if (value === null || value === undefined || value === '' || value === '\n') {
            camposPendientes.push(name);
            return false;
        }
        return true;
    };
    servicios.forEach((servicio) => {
        checkData(servicio.nombre, t('Servicio'));
        checkData(servicio.descripcion, t('Descripcion'));
        servicio.indicadores.forEach((indicador) => {
            checkData(indicador.indicador, t('indicadorNombre'));
            checkData(indicador.previsto, t('valorPrevisto'));
            if (tipoPM === 'Memoria') {
                checkData(indicador.alcanzado, t('valorReal'));
            }
        });
        if (tipoPM === 'Memoria' && editarMemoria) {
            checkData(servicio.dSeguimiento, t('dSeguimiento'));
            checkData(servicio.valFinal, t('valFinal'));
        }
    });
    if (camposPendientes.length > 0) {
        return false;
    }
    return true;
}

interface ValidacionAnualPlanMemoriaProps {
    yearData: YearData;
    editarPlan: boolean;
    editarMemoria: boolean;
    tipoPM: PlanOMemoria;
    t: (key: string) => string;
    setMensajeError: (mensaje: string) => void;
    setCamposRellenos: (valor: boolean) => void;
    setVisibleMessageSuperior: (mensaje: string) => void;
}

export const ValidacionAnualPlanMemoria = ({ yearData, editarPlan, editarMemoria, tipoPM, t, setMensajeError, setCamposRellenos, setVisibleMessageSuperior }: ValidacionAnualPlanMemoriaProps) => {
    const valAccionesPCDR: boolean | string[] = validarAccionesEjes(yearData.plan.ejesPrioritarios, editarPlan, editarMemoria, tipoPM, t);
    if (!valAccionesPCDR || (Array.isArray(valAccionesPCDR) && valAccionesPCDR.length > 0)) {
        setMensajeError(t('faltanCamposAccionesEjesPrioritarios'));
        setCamposRellenos(false);
        return;
    }
    if (!validarAccionesEjesAccesorias(yearData.plan.ejesRestantes!, editarPlan, editarMemoria, tipoPM)) {
        setMensajeError(t('faltanCamposAccionesEjes'));
        setCamposRellenos(false);
        return;
    }
    if (!validarServicios(yearData.servicios!, editarMemoria, tipoPM, t)) {
        setMensajeError(t('faltanCamposServicios'));
        setCamposRellenos(false);
        return;
    }
    setMensajeError('');
    setVisibleMessageSuperior(t('todoCorrecto'));
    if (tipoPM === 'Memoria') {
        if (!editarPlan) {
            setCamposRellenos(true);
        }
    } else {
        setCamposRellenos(true);
    }
};

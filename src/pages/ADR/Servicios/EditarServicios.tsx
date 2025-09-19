/* eslint-disable no-unused-vars */
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { LoadingOverlay, ZonaTitulo } from '../../Configuracion/Users/componentes';
import { InputField, TextArea } from '../../../components/Utils/inputs';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useYear } from '../../../contexts/DatosAnualContext';
import { Servicios } from '../../../types/GeneralTypes';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../../contexts/RegionContext';
import { Loading } from '../../../components/Utils/animations';
import { gestionarServicio } from '../../../components/Utils/data/dataServices';
import React from 'react';
import { Tab, TabList, TabGroup, TabPanel, TabPanels } from '@headlessui/react';
import { TabCard } from '../Acciones/EditarAccion/EditarAccionComponent';
import IconMemoria from '../../../components/Icon/Menu/IconMemoria.svg';
import IconPlan from '../../../components/Icon/Menu/IconPlan.svg';
import IconCuadroMando from '../../../components/Icon/Menu/IconCuadroMando.svg';

const Index: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
    const { datosEditandoServicio, setDatosEditandoServicio, setYearData, yearData, controlguardado, setControlguardado } = useYear();
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const { regionSeleccionada } = useRegionContext();

    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (controlguardado) {
            navigate('/adr/servicios');
        }
    }, [controlguardado]);

    if (!datosEditandoServicio) {
        return <Loading />;
    }

    const setServicio = (callback: (prev: Servicios) => Servicios) => {
        if (!datosEditandoServicio) return;
        const actualizado = callback(datosEditandoServicio);
        setDatosEditandoServicio(actualizado);
    };

    const [erroresGenerales, setErroresGenerales] = useState({
        nombre: false,
        descripcion: false,
        dSeguimiento: false,
        valFinal: false,
    });

    const [erroresindicadores, setErroresIndicadores] = useState<boolean[][]>([]);

    const handleChangeCampos = (campo: keyof Servicios, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDatosEditandoServicio({
            ...datosEditandoServicio,
            [campo]: e.target.value || '',
        });
    };

    const PestanaIndicadoresServicios = React.forwardRef<HTMLButtonElement>(() => {
        const agregarIndicador = () => {
            if (datosEditandoServicio.indicadores?.some((ind) => !ind.indicador?.trim())) {
                alert(t('indicadorServicioSinRellenar'));
                return;
            }
            setServicio((prev) => ({
                ...prev,
                indicadores: [
                    ...prev.indicadores,
                    {
                        indicador: '',
                        previsto: { valor: '' },
                        alcanzado: { valor: '' },
                    },
                ],
            }));
        };
        const eliminarIndicador = async (index: number) => {
            setServicio((prev) => ({
                ...prev,
                indicadores: prev.indicadores.filter((_, i) => i !== index),
            }));
        };
        return (
            <div className="p-5 flex flex-col gap-4 w-full">
                <div className="flex-grow gap-4 panel">
                    <div className="p-2 flex justify-between items-center">
                        <span>*{t('indicadores').toUpperCase()}</span>
                        {editarPlan && (
                            <button type="button" onClick={agregarIndicador} className="px-4 py-2 bg-primary text-white rounded">
                                {t('agregarFila')}
                            </button>
                        )}
                    </div>
                    <div className="p-2 flex justify-between items-center">
                        <table className="w-full border-collapse   text-sm">
                            <thead>
                                <tr>
                                    <th className="borderp-1 thead th">
                                        {' '}
                                        {editarPlan ? '*' : ''}
                                        {t('indicadores')}
                                    </th>
                                    <th className="border   p-1 thead th">
                                        {' '}
                                        {editarPlan ? '*' : ''}
                                        {t('valorPrevisto')}
                                    </th>
                                    <th className="border   p-1 thead th">
                                        {' '}
                                        {!editarPlan ? '*' : ''}
                                        {t('valorReal')}
                                    </th>
                                    {editarPlan && <th className="border thead p-1 text-center th">✖</th>}
                                </tr>
                            </thead>
                            <tbody>
                                {(datosEditandoServicio!.indicadores || []).map((indicador, index) => (
                                    <tr key={index}>
                                        <td
                                            className={`border align-top p-1 ${editarPlan ? 'cursor-text' : ''} ${erroresindicadores[index]?.[0] ? 'border-red-500 border-2' : ''}`}
                                            onClick={() => inputRefs.current[index]?.[0]?.focus()}
                                        >
                                            <input
                                                disabled={!editarPlan}
                                                ref={(el) => {
                                                    if (!inputRefs.current[index]) inputRefs.current[index] = [];
                                                    inputRefs.current[index][0] = el;
                                                }}
                                                type="text"
                                                value={indicador.indicador}
                                                onChange={(e) => {
                                                    const nuevos = [...datosEditandoServicio.indicadores];
                                                    nuevos[index] = { ...nuevos[index], indicador: e.target.value };
                                                    setServicio((prev) => ({ ...prev, indicadores: nuevos }));
                                                }}
                                                className={`text-left w-full`}
                                            />

                                            {erroresindicadores[index]?.[0] && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                        </td>

                                        {/* Valor previsto */}
                                        <td
                                            className={`border td align-top p-1 ${editarPlan ? 'cursor-text' : ''} ${erroresindicadores[index]?.[1] ? 'border-red-500 border-2' : ''}`}
                                            onClick={() => inputRefs.current[index]?.[1]?.focus()}
                                        >
                                            <input
                                                disabled={!editarPlan}
                                                ref={(el) => {
                                                    if (!inputRefs.current[index]) inputRefs.current[index] = [];
                                                    inputRefs.current[index][1] = el;
                                                }}
                                                type="text"
                                                value={indicador.previsto?.valor || ''}
                                                onChange={(e) => {
                                                    const nuevos = [...datosEditandoServicio.indicadores];
                                                    nuevos[index] = {
                                                        ...nuevos[index],
                                                        previsto: { valor: e.target.value },
                                                    };
                                                    setServicio((prev) => ({ ...prev, indicadores: nuevos }));
                                                }}
                                                className={`text-center w-full`}
                                            />

                                            {erroresindicadores[index]?.[1] && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                        </td>

                                        {/* Valor real */}
                                        <td
                                            className={`border td align-top p-1 ${editarPlan || editarMemoria ? 'cursor-text' : ''} ${erroresindicadores[index]?.[2] ? 'border-red-500 border-2' : ''}`}
                                            onClick={() => inputRefs.current[index]?.[2]?.focus()}
                                        >
                                            <input
                                                ref={(el) => {
                                                    if (!inputRefs.current[index]) inputRefs.current[index] = [];
                                                    inputRefs.current[index][2] = el;
                                                }}
                                                disabled={!editarPlan && !editarMemoria}
                                                type="text"
                                                value={indicador.alcanzado?.valor || ''}
                                                onChange={(e) => {
                                                    const nuevos = [...datosEditandoServicio.indicadores];
                                                    nuevos[index] = {
                                                        ...nuevos[index],
                                                        alcanzado: { valor: e.target.value },
                                                    };
                                                    setServicio((prev) => ({ ...prev, indicadores: nuevos }));
                                                }}
                                                className={`text-center w-full`}
                                            />
                                            {erroresindicadores[index]?.[2] && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                        </td>

                                        {/* Botón eliminar */}
                                        {editarPlan && (
                                            <td className="border td text-center align-top p-1">
                                                <button type="button" onClick={() => eliminarIndicador(index)} className="text-red-600 font-bold" title="Eliminar fila">
                                                    ✖
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    });

    const validarAntesDeGuardar = () => {
        if (!datosEditandoServicio) return;

        const nuevosErroresIndicadores = datosEditandoServicio.indicadores.map((ind) => [
            editarPlan && !ind.indicador.trim(),
            editarPlan && !ind.previsto.valor.trim(),
            !editarPlan && editarMemoria && !ind.alcanzado?.valor.trim(),
        ]);

        const nuevosErroresGenerales = {
            nombre: !datosEditandoServicio.nombre.trim(),
            descripcion: !datosEditandoServicio.descripcion.trim(),
            dSeguimiento: !editarPlan && editarMemoria && !datosEditandoServicio.dSeguimiento?.trim(),
            valFinal: !editarPlan && editarMemoria && !datosEditandoServicio.valFinal?.trim(),
        };

        setErroresIndicadores(nuevosErroresIndicadores);
        setErroresGenerales(nuevosErroresGenerales);

        const hayErroresIndicadores = nuevosErroresIndicadores.some((fila) => fila.includes(true));
        const hayErroresGenerales = Object.values(nuevosErroresGenerales).some((v) => v);

        if (hayErroresIndicadores || hayErroresGenerales) {
            alert(t('porFavorCompletaCamposObligatorios') || 'Por favor, completa todos los campos obligatorios.');
            return;
        }
        hundleGuardarServicio();
    };

    const hundleGuardarServicio = async () => {
        if (datosEditandoServicio.id === 0) {
            const nuevoServicio = await gestionarServicio({
                datosEditandoServicio,
                regionSeleccionada: regionSeleccionada!,
                anioSeleccionada: anioSeleccionada!,
                setLoading,
                setSuccessMessage,
                setErrorMessage,
                method: 'POST',
            });

            if (nuevoServicio) {
                setYearData({
                    ...yearData,
                    servicios: [...(yearData.servicios || []), nuevoServicio],
                });
            }
        } else {
            const editadoServicio = await gestionarServicio({
                idServicio: datosEditandoServicio.id,
                datosEditandoServicio,
                regionSeleccionada: regionSeleccionada!,
                anioSeleccionada: anioSeleccionada!,
                setLoading,
                setSuccessMessage,
                setErrorMessage,
                method: 'PUT',
            });
            if (editadoServicio) {
                setYearData({
                    ...yearData,
                    servicios: [...(yearData.servicios?.filter((s) => s.id !== editadoServicio.id) || []), editadoServicio],
                });
            }
        }
    };

    const handleFinalize = () => {
        setControlguardado(true);
    };

    return (
        <>
            <LoadingOverlay
                isLoading={loading}
                message={{
                    errorMessage,
                    setErrorMessage,
                    successMessage,
                    setSuccessMessage,
                }}
                timeDelay={false}
                onComplete={handleFinalize}
            />

            <div className="panel">
                <ZonaTitulo
                    titulo={
                        <h2 className="text-xl font-bold flex items-center space-x-2">
                            <span>
                                {t('servicioTituloEditado')} {anioSeleccionada}
                            </span>
                        </h2>
                    }
                    zonaBtn={
                        (editarPlan || editarMemoria) && (
                            <div className="ml-auto flex gap-4 items-center justify-end">
                                <button className="px-4 py-2 bg-primary text-white rounded" onClick={validarAntesDeGuardar}>
                                    {t('guardar')}{' '}
                                </button>
                                <NavLink to="/adr/servicios" className="group">
                                    <button className="px-4 py-2 bg-danger text-white rounded">{t('cerrar')}</button>
                                </NavLink>
                            </div>
                        )
                    }
                    zonaExtra={
                        <div className="p-2 flex gap-4">
                            <InputField
                                nombreInput="Servicio"
                                className={`${erroresGenerales.nombre && 'border-red-500 border-2'}`}
                                required
                                disabled={!editarPlan}
                                value={datosEditandoServicio.nombre}
                                onChange={(e) => handleChangeCampos('nombre', e)}
                            />
                            {erroresGenerales.nombre && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                        </div>
                    }
                />
                <TabGroup className="w-full">
                    <TabList className="mx-10 mt-3 flex flex-wrap ">
                        <Tab as={Fragment}>
                            {({ selected }) => (
                                <button
                                    className={`${
                                        selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                    }  -mb-[1px] block border border-transparent p-3.5 py-2 hover:border-white-light hover:border-b-white dark:hover:border-[#191e3a] dark:hover:border-b-black`}
                                >
                                    <div className={`flex items-center`}>
                                        <div className="relative">
                                            <img src={IconCuadroMando} alt={t(`${'Indicadores'}`)} className="w-6 h-6" />
                                        </div>
                                        <span className={`font-semibold`}>{t(`${'Indicadores'}`)}</span>
                                    </div>
                                </button>
                            )}
                        </Tab>
                        <Tab as={Fragment}>
                            {({ selected }) => (
                                <button
                                    className={`flex items-center ${
                                        selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                    }  -mb-[1px] block border border-transparent p-3.5 py-2 hover:border-white-light hover:border-b-white dark:hover:border-[#191e3a] dark:hover:border-b-black`}
                                >
                                    <TabCard icon={IconPlan} label="tabPlan" status={yearData.plan.status} />
                                </button>
                            )}
                        </Tab>
                        <Tab as={Fragment}>
                            {({ selected }) => (
                                <button
                                    className={`flex items-center ${
                                        selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                    }  -mb-[1px] block border border-transparent p-3.5 py-2 hover:border-white-light hover:border-b-white dark:hover:border-[#191e3a] dark:hover:border-b-black`}
                                >
                                    <TabCard icon={IconMemoria} label="tabMemoria" status={yearData.memoria.status} />
                                </button>
                            )}
                        </Tab>
                    </TabList>
                    <div className="w-full border border-white-light dark:border-[#191e3a] rounded-lg">
                        <TabPanels>
                            <TabPanel>
                                <PestanaIndicadoresServicios />
                            </TabPanel>
                            <TabPanel>
                                <div className="p-5 flex flex-col gap-4 w-full">
                                    <div className="panel">
                                        <div className="p-2 flex-1 gap-4">
                                            <span>*{t('Descripcion').toUpperCase()}</span>
                                            <TextArea
                                                nombreInput="Descripcion"
                                                className={`h-[114px] w-full ${erroresGenerales.descripcion ? 'border-red-500 border-2' : ''}`}
                                                required
                                                noTitle
                                                disabled={!editarPlan}
                                                value={datosEditandoServicio.descripcion}
                                                onChange={(e) => handleChangeCampos('descripcion', e)}
                                            />
                                            {erroresGenerales.descripcion && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                            <TabPanel>
                                <div className="p-5 flex flex-col gap-4 w-full">
                                    <div className="panel">
                                        <div className="p-2 flex-1">
                                            <span>
                                                {!editarPlan ? '*' : ''}
                                                {t('dSeguimiento').toUpperCase()}
                                            </span>
                                            <TextArea
                                                nombreInput="dSeguimiento"
                                                disabled={!editarPlan && !editarMemoria}
                                                className={`h-[114px] w-full ${erroresGenerales.dSeguimiento ? 'border-red-500 border-2' : ''}`}
                                                value={datosEditandoServicio!.dSeguimiento}
                                                noTitle
                                                onChange={(e) => handleChangeCampos('dSeguimiento', e)}
                                            />
                                            {erroresGenerales.dSeguimiento && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                        </div>

                                        <div className="p-2 flex-1">
                                            <span>
                                                {!editarPlan ? '*' : ''}
                                                {t('valFinal').toUpperCase()}
                                            </span>
                                            <TextArea
                                                nombreInput="valFinal"
                                                disabled={!editarPlan && !editarMemoria}
                                                className={`h-[114px] w-full ${erroresGenerales.valFinal ? 'border-red-500 border-2' : ''}`}
                                                value={datosEditandoServicio!.valFinal}
                                                noTitle
                                                onChange={(e) => handleChangeCampos('valFinal', e)}
                                            />
                                            {erroresGenerales.valFinal && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                        </div>
                                    </div>
                                </div>
                            </TabPanel>
                        </TabPanels>
                    </div>
                </TabGroup>
            </div>
        </>
    );
};
export default Index;

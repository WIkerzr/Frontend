/* eslint-disable no-unused-vars */
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { LoadingOverlay, ZonaTitulo } from '../../Configuracion/Users/componentes';
import { InputField, TextArea } from '../../../components/Utils/inputs';
import { Fragment, useEffect, useState } from 'react';
import { useYear } from '../../../contexts/DatosAnualContext';
import { IndicadoresServicios, Servicios } from '../../../types/GeneralTypes';
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
import { PestanaIndicadoresServicios } from './ComponentesServicios';

const Index: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
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

    //     const setIndicador = (callback: (prev: IndicadoresServicios[]) => IndicadoresServicios[]) => {
    //     if (!datosEditandoServicio) return;

    //     const nuevosIndicadores = callback(datosEditandoServicio.indicadores || []);
    //     setDatosEditandoServicio({
    //         ...datosEditandoServicio,
    //         indicadores: nuevosIndicadores,
    //     });
    // };

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
    const [datosIndicadorRealizacion, setDatosIndicadorRealizacion] = useState<IndicadoresServicios[]>([]);
    const [datosIndicadorResultado, setDatosIndicadorResultado] = useState<IndicadoresServicios[]>([]);

    useEffect(() => {
        if (datosEditandoServicio?.indicadores) {
            const hayTipoUndefinedNull = datosEditandoServicio.indicadores.some((indicador) => indicador.tipo === null || indicador.tipo === undefined);
            if (hayTipoUndefinedNull) {
                //TODO es para versiones anteriores
                setServicio((prev) => {
                    const indicadoresActualizados = prev.indicadores.map((indicador) => ({
                        ...indicador,
                        tipo: indicador.tipo ?? 'realizacion',
                    }));

                    return {
                        ...prev,
                        indicadores: indicadoresActualizados,
                    };
                });
            } else {
                const filtradosRealizacion: IndicadoresServicios[] = datosEditandoServicio.indicadores.filter((indicador) => indicador.tipo === 'realizacion');

                const filtradosResultado: IndicadoresServicios[] = datosEditandoServicio.indicadores.filter((indicador) => indicador.tipo === 'resultado');

                setDatosIndicadorRealizacion(filtradosRealizacion);
                setDatosIndicadorResultado(filtradosResultado);
            }
        } else {
            setDatosIndicadorRealizacion([]);
            setDatosIndicadorResultado([]);
        }
    }, [datosEditandoServicio]);

    const validarAntesDeGuardar = () => {
        if (!datosEditandoServicio) return;

        //TODO Sin validacion servicios hasta nuevo aviso
        setErroresGenerales({
            nombre: false,
            descripcion: false,
            dSeguimiento: false,
            valFinal: false,
        });
        setErroresIndicadores([]);
        // const nuevosErroresIndicadores = datosEditandoServicio.indicadores.map((ind) => [
        //     editarPlan && !ind.indicador.trim(),
        //     editarPlan && !ind.previsto.valor.trim(),
        //     !editarPlan && editarMemoria && !ind.alcanzado?.valor.trim(),
        // ]);

        // const nuevosErroresGenerales = {
        //     nombre: !datosEditandoServicio.nombre.trim(),
        //     descripcion: !datosEditandoServicio.descripcion.trim(),
        //     dSeguimiento: !editarPlan && editarMemoria && !datosEditandoServicio.dSeguimiento?.trim(),
        //     valFinal: !editarPlan && editarMemoria && !datosEditandoServicio.valFinal?.trim(),
        // };

        // setErroresIndicadores(nuevosErroresIndicadores);
        // setErroresGenerales(nuevosErroresGenerales);

        // const hayErroresIndicadores = nuevosErroresIndicadores.some((fila) => fila.includes(true));
        // const hayErroresGenerales = Object.values(nuevosErroresGenerales).some((v) => v);

        // if (hayErroresIndicadores || hayErroresGenerales) {
        //     alert(t('porFavorCompletaCamposObligatorios') || 'Por favor, completa todos los campos obligatorios.');
        //     return;
        // }

        const indicadoresCombinados = [...datosIndicadorRealizacion, ...datosIndicadorResultado];

        setServicio((prev) => {
            const actualizado: Servicios = {
                ...prev,
                indicadores: indicadoresCombinados,
            };
            hundleGuardarServicio(actualizado);

            return actualizado;
        });
    };

    const hundleGuardarServicio = async (datosServicios: Servicios) => {
        if (datosServicios.id === 0) {
            const nuevoServicio = await gestionarServicio({
                datosEditandoServicio: datosServicios,
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
                idServicio: datosServicios.id,
                datosEditandoServicio: datosServicios,
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
                                <PestanaIndicadoresServicios
                                    tipoIndicadores="realizacion"
                                    datosIndicadorRealizacion={datosIndicadorRealizacion}
                                    datosIndicadorResultado={datosIndicadorResultado}
                                    setDatosIndicadorResultado={setDatosIndicadorResultado}
                                    setDatosIndicadorRealizacion={setDatosIndicadorRealizacion}
                                    editarPlan
                                    editarMemoria
                                    erroresindicadores={erroresindicadores}
                                />
                                <PestanaIndicadoresServicios
                                    tipoIndicadores="resultado"
                                    datosIndicadorRealizacion={datosIndicadorRealizacion}
                                    datosIndicadorResultado={datosIndicadorResultado}
                                    setDatosIndicadorResultado={setDatosIndicadorResultado}
                                    setDatosIndicadorRealizacion={setDatosIndicadorRealizacion}
                                    editarPlan
                                    editarMemoria
                                    erroresindicadores={erroresindicadores}
                                />
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

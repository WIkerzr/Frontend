/* eslint-disable no-unused-vars */
import { Checkbox } from '@mantine/core';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { LoadingOverlayPersonalizada, ZonaTitulo } from '../../Configuracion/Users/componentes';
import { DropdownTraducido, InputField, SelectorEje, TextArea } from '../../../components/Utils/inputs';
import { Fragment, useEffect, useRef, useState } from 'react';
import { useYear } from '../../../contexts/DatosAnualContext';
import { opcionesSupraComarcal, Servicios } from '../../../types/GeneralTypes';
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
import { EjesBBDD } from '../../../types/tipadoPlan';
import { DropdownLineaActuaccion, FetchEjesPlan } from '../Acciones/ComponentesAccionesServicios';
import { EjesBBDDToEjes } from '../EjesHelpers';
import { PestanaIndicadores } from '../Acciones/EditarAccion/EditarAccionIndicadores';
import { ConvertirIndicadoresAccionAServicio } from '../../../components/Utils/utils';
import Multiselect from 'multiselect-react-dropdown';
import { RegionInterface } from '../../../components/Utils/data/getRegiones';
export const ejeGeneralServicios: EjesBBDD = {
    EjeId: 'general',
    NameEs: 'General',
    NameEu: 'Orokorra',
    IsActive: true,
    IsPrioritarios: false,
    acciones: [],
    LineasActuaccion: [],
};

const Index: React.FC = () => {
    const { t, i18n } = useTranslation();
    const navigate = useNavigate();
    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const { datosEditandoAccion, datosEditandoServicio, setDatosEditandoServicio, setYearData, yearData, controlguardado, setControlguardado, block } = useYear();
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const { regionSeleccionada } = useRegionContext();

    const [loading, setLoading] = useState<boolean>(false);
    const isFetchingRef = useRef(false);

    const [ejesPlan, setEjesPlan] = useState<EjesBBDD[]>([]);
    const [bloqueo, setBloqueo] = useState<boolean>(block);

    useEffect(() => {
        if (!loading && ejesPlan.length === 0) {
            FetchEjesPlan({
                regionSeleccionada,
                acciones: 'Servicios',
                t,
                i18n,
                setErrorMessage,
                setSuccessMessage,
                setLoading,
                setEjesPlan,
                isFetchingRef,
            });
        }
    }, [yearData, loading]);

    useEffect(() => {
        const propietario = datosEditandoServicio?.serviciosCompartidas?.regionLider.RegionId === regionSeleccionada;
        setBloqueo(propietario && (editarPlan || editarMemoria));
    }, [datosEditandoServicio, regionSeleccionada]);

    useEffect(() => {
        if (!ejesPlan.some((e) => e.EjeId === ejeGeneralServicios.EjeId)) {
            setEjesPlan((prev) => [...prev, ejeGeneralServicios]);
        }
    }, [ejesPlan]);

    useEffect(() => {
        if (controlguardado) {
            navigate('/adr/servicios');
        }
    }, [controlguardado]);

    if (!datosEditandoServicio) return;
    const [lineaActuaccion, setLineaActuaccion] = useState(datosEditandoServicio.lineaActuaccion || '');

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

    const handleChangeCampos = (campo: keyof Servicios, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDatosEditandoServicio({
            ...datosEditandoServicio,
            [campo]: e.target.value || '',
        });
    };

    useEffect(() => {
        if (!lineaActuaccion || lineaActuaccion === '') return;
        setDatosEditandoServicio({
            ...datosEditandoServicio,
            lineaActuaccion: lineaActuaccion,
        });
    }, [lineaActuaccion]);

    const validarAntesDeGuardar = () => {
        if (!datosEditandoServicio) return;

        //TODO Sin validacion servicios hasta nuevo aviso
        setErroresGenerales({
            nombre: false,
            descripcion: false,
            dSeguimiento: false,
            valFinal: false,
        });
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

        const indicadoresModificados = ConvertirIndicadoresAccionAServicio(datosEditandoAccion.indicadorAccion);
        const indicadoresCombinados = indicadoresModificados;

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

    const nombreEje = () => {
        let nombreEje = '';
        if (datosEditandoServicio.idEje === 'general') {
            nombreEje = i18n.language === 'eu' ? ejeGeneralServicios.NameEu : ejeGeneralServicios.NameEs;
        } else {
            const eje = yearData.plan.ejes.find((e) => e.Id == datosEditandoServicio.idEje);
            nombreEje = i18n.language === 'eu' ? eje?.NameEu ?? '' : eje?.NameEs ?? '';
        }
        return nombreEje;
    };
    return (
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
                    bloqueo && (
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
                    <div className="w-full">
                        <small style={{ color: '#666' }}>{t('camposObligatoriosLeyenda')}</small>
                        <div className="flex gap-4 w-full">
                            <div className="w-1/2 flex flex-col justify-center">
                                {bloqueo ? (
                                    <InputField
                                        nombreInput="Servicio"
                                        className={`${erroresGenerales.nombre && 'border-red-500 border-2'}`}
                                        required
                                        disabled={!bloqueo}
                                        value={datosEditandoServicio.nombre}
                                        onChange={(e) => handleChangeCampos('nombre', e)}
                                    />
                                ) : (
                                    <>
                                        <label className="block text-sm font-medium mb-1">{'*' + t('Servicios')}</label>
                                        <span className="block  font-semibold">
                                            <span className="font-normal text-col">{datosEditandoServicio.nombre}</span>
                                        </span>
                                    </>
                                )}
                            </div>

                            <>
                                <div className="w-1/2 flex flex-col gap-2 justify-center">
                                    {bloqueo ? (
                                        <SelectorEje
                                            idEjeSeleccionado={`${datosEditandoServicio.idEje}`}
                                            setIdEjeSeleccionado={(id) => {
                                                setServicio((prev) => {
                                                    return {
                                                        ...prev,
                                                        idEje: id === 'general' ? 'general' : Number(id),
                                                    };
                                                });
                                            }}
                                            ejesPlan={ejesPlan}
                                            acciones={'Servicios'}
                                        />
                                    ) : (
                                        <>
                                            <span className="block  font-semibold">
                                                <span className="font-normal text-col">{t('Ejes')}</span>
                                            </span>
                                            <span className="w-3/4 ">{nombreEje()}</span>
                                        </>
                                    )}
                                    <span className="block  font-semibold">
                                        <span className="block  font-semibold">
                                            <span className="font-normal text-col">{t('LineaActuaccion')}</span>
                                        </span>
                                        {bloqueo ? (
                                            <DropdownLineaActuaccion
                                                setNuevaLineaActuaccion={setLineaActuaccion}
                                                idEjeSeleccionado={`${datosEditandoServicio.idEje}`}
                                                lineaActuaccion={lineaActuaccion}
                                                ejesPlan={EjesBBDDToEjes(ejesPlan)}
                                                tipoAccion={'AccionesAccesorias'}
                                            />
                                        ) : (
                                            <span className="w-3/4 text-info">{datosEditandoServicio.lineaActuaccion}</span>
                                        )}
                                    </span>
                                </div>
                            </>
                        </div>
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
                            <PestanaIndicadores bloqueoSupracomarcal={bloqueo} />
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
                                            disabled={!bloqueo}
                                            value={datosEditandoServicio.descripcion}
                                            onChange={(e) => handleChangeCampos('descripcion', e)}
                                        />
                                        {erroresGenerales.descripcion && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                    </div>
                                    <Supracomarcal bloqueo={bloqueo} />
                                </div>
                            </div>
                        </TabPanel>
                        <TabPanel>
                            <div className="p-5 flex flex-col gap-4 w-full">
                                <div className="panel">
                                    <div className="p-2 flex-1">
                                        <span>
                                            {!bloqueo ? '*' : ''}
                                            {t('dSeguimiento').toUpperCase()}
                                        </span>
                                        <TextArea
                                            nombreInput="dSeguimiento"
                                            disabled={!bloqueo}
                                            className={`h-[114px] w-full ${erroresGenerales.dSeguimiento ? 'border-red-500 border-2' : ''}`}
                                            value={datosEditandoServicio!.dSeguimiento}
                                            noTitle
                                            onChange={(e) => handleChangeCampos('dSeguimiento', e)}
                                        />
                                        {erroresGenerales.dSeguimiento && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                    </div>

                                    <div className="p-2 flex-1">
                                        <span>
                                            {!bloqueo ? '*' : ''}
                                            {t('valFinal').toUpperCase()}
                                        </span>
                                        <TextArea
                                            nombreInput="valFinal"
                                            disabled={!bloqueo}
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
            <LoadingOverlayPersonalizada
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
        </div>
    );
};
export default Index;

interface RegionSelectProps {
    disabled?: boolean;
    header?: boolean;
    noInput?: boolean;
    bloqueo: boolean;
}
const Supracomarcal: React.FC<RegionSelectProps> = ({ bloqueo }) => {
    const { t, i18n } = useTranslation();
    const { datosEditandoServicio, setDatosEditandoServicio } = useYear();
    const { regiones, regionActual } = useRegionContext();
    const [regionesSupracomarcal, setRegionesSupracomarcal] = useState<boolean>(false);
    const opcionesSupraComarcalSegunIdioma = t('object:opcionesSupraComarcal', { returnObjects: true }) as string[];
    const [dataMultiselect, setDataMultiselect] = useState<RegionInterface[]>();
    const [bloqueoSupracomarcal, setBloqueoSupracomarcal] = useState<boolean>(true);

    useEffect(() => {
        if (datosEditandoServicio?.serviciosCompartidaId) {
            if (bloqueo) {
                setBloqueoSupracomarcal(false);
            } else {
                setBloqueoSupracomarcal(true);
            }
        }
    }, [bloqueo]);

    useEffect(() => {
        if (!datosEditandoServicio) return;
        if (datosEditandoServicio.serviciosCompartidas && datosEditandoServicio.serviciosCompartidas.regionLider && Number(datosEditandoServicio.serviciosCompartidas.regionLider.RegionId) > 0) {
            setRegionesSupracomarcal(true);
        }
        const regionesPreselecionadasEnDropdow: RegionInterface[] = datosEditandoServicio.serviciosCompartidas?.regiones ?? [];
        const regionesCompletadas = regionesPreselecionadasEnDropdow.map((r) => {
            const regionIdNormalizado = r.RegionId.padStart(2, '0');

            const regionCompleta = regiones.find((reg) => reg.RegionId.padStart(2, '0') === regionIdNormalizado);

            return {
                RegionId: regionIdNormalizado,
                NameEs: regionCompleta?.NameEs || '',
                NameEu: regionCompleta?.NameEu || '',
            };
        });
        setDataMultiselect(regionesCompletadas);
    }, []);

    if (!datosEditandoServicio) return;

    const handleChangeCheckboxSupracomarcal = (supracomarcal: boolean) => {
        if (bloqueoSupracomarcal) return;
        if (supracomarcal) {
            if (!regionActual || (typeof regionActual === 'object' && Object.keys(regionActual).length === 0)) {
                alert(t('error:errorFaltaRegionLider'));
                return;
            }
            if (!datosEditandoServicio?.serviciosCompartidaId) {
                setDatosEditandoServicio({
                    ...datosEditandoServicio,
                    serviciosCompartidas: {
                        idCompartida: datosEditandoServicio?.serviciosCompartidaId,
                        regionLider: {
                            id: regionActual.RegionId,
                            RegionId: regionActual.RegionId,
                            NameEs: '',
                            NameEu: '',
                        },
                        regiones: [],
                    },
                });
            }
        } else {
            if (!datosEditandoServicio?.serviciosCompartidaId) {
                setDatosEditandoServicio({
                    ...datosEditandoServicio,
                    serviciosCompartidas: undefined,
                });
            } else {
                setDatosEditandoServicio({
                    ...datosEditandoServicio,
                    serviciosCompartidas: {
                        idCompartida: datosEditandoServicio?.serviciosCompartidaId,
                        regiones: [],
                        regionLider: datosEditandoServicio.serviciosCompartidas!.regionLider,
                    },
                });
            }
            setDataMultiselect([]);
        }
        setRegionesSupracomarcal(supracomarcal);
    };

    const handleChangeSupraComarcal = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        if (bloqueoSupracomarcal) return;
        setDatosEditandoServicio({
            ...datosEditandoServicio,
            supraComarcal: e.target.value || '',
        });
    };

    const handleChangeRegionsSupracomarcal = (selectedList: RegionInterface[]) => {
        if (bloqueoSupracomarcal) return;
        setDataMultiselect(selectedList);

        setDatosEditandoServicio({
            ...datosEditandoServicio,
            serviciosCompartidas: {
                regionLider: {
                    RegionId: regionActual?.RegionId ?? '0',
                    NameEs: '',
                    NameEu: '',
                },
                regiones: selectedList,
            },
        });
    };
    const opcionesSupraComarcalSinOtros = opcionesSupraComarcal.filter((op) => op !== 'Otros');

    return (
        <>
            <div className="flex flex-col items-center">
                <label>{t('esSupracomarcalServicio')}</label>
                <Checkbox checked={regionesSupracomarcal} disabled={bloqueoSupracomarcal} onChange={(e) => handleChangeCheckboxSupracomarcal(e.target.checked)} />
            </div>
            {regionesSupracomarcal && (
                <div className="w-full resize-y">
                    <div className="flex gap-4">
                        <DropdownTraducido
                            title={'supracomarcal'}
                            disabled={bloqueoSupracomarcal}
                            value={
                                regionesSupracomarcal
                                    ? opcionesSupraComarcalSinOtros.includes(datosEditandoServicio.supraComarcal || '')
                                        ? datosEditandoServicio.supraComarcal
                                        : 'Otros'
                                    : `${t('sinOpcionesSupraComarcal')}`
                            }
                            options={opcionesSupraComarcal}
                            visualOptions={opcionesSupraComarcalSegunIdioma}
                            onChange={(e) => handleChangeSupraComarcal(e)}
                        />
                        {!opcionesSupraComarcalSinOtros.includes(datosEditandoServicio.supraComarcal || '') && (
                            <InputField
                                disabled={bloqueoSupracomarcal}
                                nombreInput="supracomarcal"
                                required
                                value={datosEditandoServicio.supraComarcal != 'Otros' ? datosEditandoServicio.supraComarcal : ''}
                                onChange={(e) => handleChangeSupraComarcal(e)}
                            />
                        )}
                    </div>
                    <label>{t('comarcasIncluidasSupracomarcal')} </label>
                    <Multiselect
                        disable={bloqueoSupracomarcal}
                        placeholder={t('seleccionaMultiOpcion')}
                        options={regiones}
                        selectedValues={dataMultiselect}
                        displayValue={i18n.language === 'eu' ? 'NameEu' : 'NameEs'}
                        onSelect={handleChangeRegionsSupracomarcal}
                        onRemove={handleChangeRegionsSupracomarcal}
                        emptyRecordMsg={t('error:errorNoOpciones')}
                    />
                </div>
            )}
        </>
    );
};

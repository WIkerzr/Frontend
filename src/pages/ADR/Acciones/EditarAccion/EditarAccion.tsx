import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import IconCuadroMando from '../../../../components/Icon/Menu/IconCuadroMando.svg';
import { Fragment, useEffect, useState } from 'react';
import { TabCard, VerificarAccionAntesDeGuardar, VerificarCamposIndicadoresPorRellenar } from './EditarAccionComponent';
import { PestanaPlan } from './EditarAccionPlan';
import IconPlan from '../../../../components/Icon/Menu/IconPlan.svg';
import IconMemoria from '../../../../components/Icon/Menu/IconMemoria.svg';
import { PestanaMemoria } from './EditarAccionMemoria';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation } from 'react-router-dom';
import { PestanaIndicadores, PestanaIndicadoresServicios } from './EditarAccionIndicadores';
import { ZonaTitulo } from '../../../Configuracion/Users/componentes';
import { useYear } from '../../../../contexts/DatosAnualContext';
import { Boton, ModalSave } from '../../../../components/Utils/utils';
import { Servicios } from '../../../../types/GeneralTypes';
import { useEstadosPorAnio } from '../../../../contexts/EstadosPorAnioContext';
import { DropdownLineaActuacion, ErrorFullScreen } from '../ComponentesAccionesServicios';
import { TextArea } from '../../../../components/Utils/inputs';

const Index: React.FC = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const tipo = location.state?.tipo;

    const accionAccesoria = tipo === 'accesoria';
    const servicio = tipo === 'servicio';
    const titulo = servicio ? t('servicioTituloEditado') : t('accionTituloEditado');
    const tituloCampo = servicio ? t('Servicios') : t('Accion');
    const rutaAnterior = accionAccesoria ? '/adr/accionesYproyectos/' : servicio ? '/adr/servicios/' : '/adr/acciones/';

    const {
        yearData,
        datosEditandoAccion,
        setDatosEditandoAccion,
        SeleccionEditarGuardar,
        SeleccionEditarGuardarAccesoria,
        GuardarEdicionServicio,
        AgregarServicio,
        block,
        datosEditandoServicio,
        setDatosEditandoServicio,
        GuardarLaEdicionAccion,
    } = useYear();

    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const [bloqueo, setBloqueo] = useState<boolean>(block);
    const [nombreEje, setNombreEje] = useState<string>('');
    const [mostrandoAccionConcreta, setMostrandoAccionConcreta] = useState(false);
    const [lineaActuaccion, setLineaActuaccion] = useState('');

    useEffect(() => {
        if (!(i18n.language === 'es' ? datosEditandoAccion.ejeEs : datosEditandoAccion.ejeEu)) {
            const eje = yearData.plan.ejesPrioritarios.find((r) => r.Id === datosEditandoAccion.ejeId);
            if (eje) {
                setNombreEje(i18n.language === 'es' ? eje.NameEs : eje.NameEu);
            }
        } else {
            const nombreDelEje = i18n.language === 'es' ? datosEditandoAccion.ejeEs : datosEditandoAccion.ejeEu;
            if (nombreDelEje) {
                setNombreEje(nombreDelEje);
            }
        }
    }, [datosEditandoAccion]);

    useEffect(() => {
        if (!editarPlan && !editarMemoria) {
            setBloqueo(true);
        } else {
            if (!block) {
                setBloqueo(false);
            }
        }
    }, []);

    useEffect(() => {
        if (datosEditandoAccion?.lineaActuaccion !== lineaActuaccion) {
            setDatosEditandoAccion({
                ...datosEditandoAccion!,
                lineaActuaccion,
            });
        }
    }, [lineaActuaccion, datosEditandoAccion]);

    if (datosEditandoAccion.id === '0') {
        return;
    }

    if (!datosEditandoAccion) {
        if (!servicio) {
            return <ErrorFullScreen mensaje={t('falloAlCargarAccion')} irA={rutaAnterior} />;
        }
    }

    const handleAccionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDatosEditandoAccion({
            ...datosEditandoAccion!,
            accion: `${e.target.value}`,
        });
    };

    const handleServicioChange = (campo: keyof Servicios, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDatosEditandoServicio((prev) => ({
            ...prev!,
            [campo]: `${e.target.value}`,
        }));
    };

    const handleSave = () => {
        if (VerificarCamposIndicadoresPorRellenar(datosEditandoAccion, editarPlan, editarMemoria, 'GuardadoEdicion', t)) {
            const camposFaltantes = VerificarAccionAntesDeGuardar(datosEditandoAccion, yearData);
            if (camposFaltantes && camposFaltantes.length === 0) {
                GuardarLaEdicionAccion();
                setMostrandoAccionConcreta(true);
            } else if (camposFaltantes && camposFaltantes.length > 0) {
                const camposFaltantesTraducidos = camposFaltantes.map((campo) => t(campo.charAt(0).toLowerCase() + campo.slice(1)));
                alert('Faltan estos campos obligatorios:\n' + camposFaltantesTraducidos.join('\n'));
            }
        }
    };

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>
                            {titulo} {anioSeleccionada}
                        </span>
                    </h2>
                }
                zonaBtn={
                    <div className="ml-auto flex flex-row items-center justify-end gap-4">
                        {!bloqueo && <Boton tipo="guardar" textoBoton={t('guardar')} onClick={handleSave} disabled={servicio ? !datosEditandoServicio?.nombre : !datosEditandoAccion.accion} />}
                        <NavLink to={rutaAnterior} className={() => ''}>
                            <Boton tipo="cerrar" textoBoton={t('cerrar')} onClick={() => setMostrandoAccionConcreta(false)} />
                        </NavLink>
                    </div>
                }
                zonaExtra={
                    <div className="w-full">
                        <div className="flex gap-4 w-full">
                            <div className="w-1/2 flex flex-col justify-center">
                                <label className="block text-sm font-medium mb-1">{tituloCampo}</label>
                                {editarPlan ? (
                                    <input
                                        type="text"
                                        className="form-input w-full"
                                        value={servicio ? datosEditandoServicio?.nombre : datosEditandoAccion.accion}
                                        onChange={(e) => (servicio ? handleServicioChange('nombre', e) : handleAccionChange(e))}
                                    />
                                ) : (
                                    <span className="block  font-semibold">
                                        <span className="font-normal text-col">{servicio ? datosEditandoServicio?.nombre : datosEditandoAccion.accion}</span>
                                    </span>
                                )}
                            </div>
                            {!servicio && (
                                <>
                                    <div className="w-1/2 flex flex-col gap-2 justify-center">
                                        <span className="block  font-semibold mb-1">
                                            <span className="font-normal text-lg">{nombreEje}</span>
                                        </span>
                                        <span className="block  font-semibold">
                                            {editarPlan ? (
                                                <DropdownLineaActuacion
                                                    setNuevaLineaActuaccion={setLineaActuaccion}
                                                    idEjeSeleccionado={yearData.plan.ejesPrioritarios.find((r) => r.Id === datosEditandoAccion.ejeId)?.Id}
                                                />
                                            ) : (
                                                <span className="w-3/4 text-info">{datosEditandoAccion.lineaActuaccion}</span>
                                            )}
                                        </span>
                                    </div>
                                    <div className="flex">
                                        <input
                                            onChange={(e) => {
                                                if (editarPlan) {
                                                    setDatosEditandoAccion({
                                                        ...datosEditandoAccion!,
                                                        plurianual: e.target.checked,
                                                    });
                                                }
                                            }}
                                            type="checkbox"
                                            className="form-checkbox h-5 w-5 "
                                            checked={datosEditandoAccion.plurianual}
                                            disabled={!editarPlan}
                                        />
                                        <label>{t('plurianual')}</label>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                }
            />
            {mostrandoAccionConcreta && (
                <ModalSave onClose={() => setMostrandoAccionConcreta(false)} nav={rutaAnterior}>
                    {async () => {
                        if (accionAccesoria) {
                            await SeleccionEditarGuardarAccesoria();
                        } else if (servicio) {
                            if (datosEditandoServicio?.id === 0) {
                                await AgregarServicio();
                            } else {
                                await GuardarEdicionServicio();
                            }
                        } else {
                            await SeleccionEditarGuardar();
                        }
                    }}
                </ModalSave>
            )}
            <div className="mb-5 flex flex-col sm:flex-row">
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
                        {servicio ? (
                            <TabPanels>
                                <TabPanel>
                                    <PestanaIndicadoresServicios />
                                </TabPanel>
                                <TabPanel>
                                    <div className="p-5 flex flex-col gap-4 w-full">
                                        <div className="panel">
                                            <TextArea
                                                disabled={!editarPlan}
                                                nombreInput="Descripcion"
                                                className={`h-[30%] w-full`}
                                                value={datosEditandoServicio?.descripcion}
                                                onChange={(e) => handleServicioChange('descripcion', e)}
                                            />
                                        </div>
                                    </div>
                                </TabPanel>
                                <TabPanel>
                                    <div className="p-5 flex flex-col gap-4 w-full">
                                        <div className="panel">
                                            <TextArea
                                                disabled={!editarMemoria}
                                                nombreInput="dSeguimiento"
                                                className={`w-full`}
                                                value={datosEditandoServicio?.dSeguimiento}
                                                onChange={(e) => handleServicioChange('dSeguimiento', e)}
                                            />
                                            <TextArea
                                                disabled={!editarMemoria}
                                                nombreInput="valFinal"
                                                className={`w-full`}
                                                value={datosEditandoServicio?.valFinal}
                                                onChange={(e) => handleServicioChange('valFinal', e)}
                                            />
                                        </div>
                                    </div>
                                </TabPanel>
                            </TabPanels>
                        ) : (
                            <TabPanels>
                                <TabPanel>
                                    <PestanaIndicadores />
                                </TabPanel>
                                <TabPanel>
                                    <PestanaPlan />
                                </TabPanel>
                                <TabPanel>
                                    <PestanaMemoria />
                                </TabPanel>
                            </TabPanels>
                        )}
                    </div>
                </TabGroup>
            </div>
        </div>
    );
};
export default Index;

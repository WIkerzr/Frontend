import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import IconCuadroMando from '../../../../components/Icon/Menu/IconCuadroMando.svg';
import { Fragment, useEffect, useState } from 'react';
import { TabCard } from './EditarAccionComponent';
import { PestanaPlan } from './EditarAccionPlan';
import IconPlan from '../../../../components/Icon/Menu/IconPlan.svg';
import IconMemoria from '../../../../components/Icon/Menu/IconMemoria.svg';
import { PestanaMemoria } from './EditarAccionMemoria';
import { useTranslation } from 'react-i18next';
import { NavLink, useLocation, useNavigate } from 'react-router-dom';
import { PestanaIndicadores } from './EditarAccionIndicadores';
import { LoadingOverlay, ZonaTitulo } from '../../../Configuracion/Users/componentes';
import { useYear } from '../../../../contexts/DatosAnualContext';
import { Boton } from '../../../../components/Utils/utils';
import { useEstadosPorAnio } from '../../../../contexts/EstadosPorAnioContext';
import { DropdownLineaActuaccion, ErrorFullScreen } from '../ComponentesAccionesServicios';

const Index: React.FC = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const tipo = location.state?.tipo;

    const accionAccesoria = tipo === 'accesoria';
    const titulo = t('accionTituloEditado');
    const tituloCampo = t('Accion');
    const rutaAnterior = accionAccesoria ? '/adr/accionesYproyectos/' : '/adr/acciones/';

    const { yearData, datosEditandoAccion, setDatosEditandoAccion, SeleccionEditarGuardar, controlguardado, setControlguardado, block, GuardarLaEdicionAccion } = useYear();
    const navigate = useNavigate();

    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const [bloqueo, setBloqueo] = useState<boolean>(block);
    const [nombreEje, setNombreEje] = useState<string>('');

    const [lineaActuaccion, setLineaActuaccion] = useState('');

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    let ejesPlan = yearData.plan.ejesPrioritarios;
    if (datosEditandoAccion.id !== '0') {
        if (datosEditandoAccion.ejeId) {
            if (yearData.plan.ejesPrioritarios.some((e) => e.Id === datosEditandoAccion.ejeId)) {
                ejesPlan = yearData.plan.ejesPrioritarios;
            } else if (yearData.plan.ejes.some((e) => e.Id === datosEditandoAccion.ejeId)) {
                ejesPlan = yearData.plan.ejes;
            }
        }
    }

    useEffect(() => {
        if (!(i18n.language === 'es' ? datosEditandoAccion.ejeEs : datosEditandoAccion.ejeEu)) {
            const eje = ejesPlan.find((r) => r.Id === datosEditandoAccion.ejeId);
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
        if (datosEditandoAccion.id === '0') {
            return;
        }
        if (lineaActuaccion != '') {
            if (datosEditandoAccion && datosEditandoAccion.lineaActuaccion != null && datosEditandoAccion?.lineaActuaccion !== lineaActuaccion) {
                setDatosEditandoAccion((prev) => ({
                    ...prev!,
                    lineaActuaccion,
                }));
            }
        } else {
            setLineaActuaccion(datosEditandoAccion.lineaActuaccion);
        }
    }, [lineaActuaccion, datosEditandoAccion]);

    useEffect(() => {
        if (controlguardado) {
            navigate(rutaAnterior);
        }
    }, [controlguardado]);

    useEffect(() => {
        setDatosEditandoAccion({
            ...datosEditandoAccion!,
            lineaActuaccion: lineaActuaccion,
        });
    }, [lineaActuaccion]);

    if (datosEditandoAccion.id === '0') {
        return;
    }

    if (!datosEditandoAccion) {
        return <ErrorFullScreen mensaje={t('falloAlCargarAccion')} irA={rutaAnterior} />;
    }

    const handleFinalize = () => {
        setControlguardado(true);
        SeleccionEditarGuardar();
    };

    const handleAccionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDatosEditandoAccion({
            ...datosEditandoAccion!,
            accion: `${e.target.value}`,
        });
    };

    const handleSave = () => {
        // if (VerificarCamposIndicadoresPorRellenar(datosEditandoAccion, editarPlan, editarMemoria, 'GuardadoEdicion', t)) {
        //     const camposFaltantes = VerificarAccionFinal(datosEditandoAccion, editarPlan, editarMemoria);
        //     if (camposFaltantes && camposFaltantes.length === 0) {
        //         GuardarLaEdicionAccion(setLoading, { setErrorMessage, setSuccessMessage });
        //     } else if (camposFaltantes && camposFaltantes.length > 0) {
        //         const camposFaltantesTraducidos = camposFaltantes.map((campo) => t(campo.charAt(0).toLowerCase() + campo.slice(1)));
        //         alert('Faltan estos campos obligatorios:\n' + camposFaltantesTraducidos.join('\n'));
        //     }
        // }
        // if (datosEditandoAccion.accion !== '') {
        //     GuardarLaEdicionAccion(setLoading, { setErrorMessage, setSuccessMessage });
        // } else {
        //     alert(t('nombreDeLaAccionNoVacio'));
        // }

        GuardarLaEdicionAccion(setLoading, { setErrorMessage, setSuccessMessage });
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
                        {!bloqueo && (
                            <Boton
                                tipo="guardar"
                                textoBoton={t('guardar')}
                                onClick={handleSave}
                                disabled={!datosEditandoAccion.accion}
                                title={!datosEditandoAccion.accion ? t('nombreDeLaAccionNoVacio') : ''}
                            />
                        )}
                        <NavLink to={rutaAnterior} className={() => ''}>
                            <Boton tipo="cerrar" textoBoton={t('cerrar')} onClick={() => navigate(rutaAnterior)} />
                        </NavLink>
                    </div>
                }
                zonaExtra={
                    <div className="w-full">
                        <small style={{ color: '#666' }}>{t('camposObligatoriosLeyenda')}</small>
                        <div className="flex gap-4 w-full">
                            <div className="w-1/2 flex flex-col justify-center">
                                <label className="block text-sm font-medium mb-1">{'*' + tituloCampo}</label>
                                {editarPlan ? (
                                    <input type="text" className="form-input w-full" value={datosEditandoAccion.accion} onChange={(e) => handleAccionChange(e)} />
                                ) : (
                                    <span className="block  font-semibold">
                                        <span className="font-normal text-col">{datosEditandoAccion.accion}</span>
                                    </span>
                                )}
                            </div>

                            <>
                                <div className="w-1/2 flex flex-col gap-2 justify-center">
                                    <span className="block  font-semibold mb-1">
                                        <span className="font-normal text-lg">{nombreEje}</span>
                                    </span>
                                    <span className="block  font-semibold">
                                        {editarPlan ? (
                                            <DropdownLineaActuaccion
                                                setNuevaLineaActuaccion={setLineaActuaccion}
                                                idEjeSeleccionado={ejesPlan.find((r) => r.Id === datosEditandoAccion.ejeId)?.Id}
                                                lineaActuaccion={lineaActuaccion}
                                                ejesPlan={ejesPlan}
                                                tipoAccion={accionAccesoria ? 'AccionesAccesorias' : 'Acciones'}
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
                        </div>
                    </div>
                }
            />
            <LoadingOverlay
                isLoading={loading}
                message={{
                    errorMessage,
                    setErrorMessage,
                    successMessage,
                    setSuccessMessage,
                }}
                onComplete={handleFinalize}
            />
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
                    </div>
                </TabGroup>
            </div>
        </div>
    );
};
export default Index;

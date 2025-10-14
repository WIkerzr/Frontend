import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import IconCuadroMando from '../../../../components/Icon/Menu/IconCuadroMando.svg';
import { Fragment, useEffect, useRef, useState } from 'react';
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
import { DatosAccion } from '../../../../types/TipadoAccion';
import { LlamadaBBDDEjesRegion, ValidarEjesRegion } from '../../../../components/Utils/data/dataEjes';
import { Ejes, EjesBBDD } from '../../../../types/tipadoPlan';
import { useRegionContext } from '../../../../contexts/RegionContext';
import { EjesBBDDToEjes, EjesToEjesBBDD } from '../../EjesHelpers';
import { Loading } from '../../../../components/Utils/animations';

const Index: React.FC = () => {
    const { t, i18n } = useTranslation();
    const location = useLocation();
    const { tipo, nombreEjeES, nombreEjeEU } = location.state as { tipo: 'accesoria' | 'accion'; datosEditandoAccion: DatosAccion; ejeId: string; nombreEjeES: string; nombreEjeEU: string };

    const accionAccesoria = tipo === 'accesoria';
    const titulo = t('accionTituloEditado');
    const rutaAnterior = accionAccesoria ? '/adr/accionesYproyectos/' : '/adr/acciones/';
    const { regionSeleccionada } = useRegionContext();

    const { yearData, datosEditandoAccion, setDatosEditandoAccion, SeleccionEditarGuardar, controlguardado, setControlguardado, block, GuardarLaEdicionAccion } = useYear();
    const navigate = useNavigate();

    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const [bloqueo, setBloqueo] = useState<boolean>(block);

    const [ejeSeleccionado, setEjeSeleccionado] = useState<EjesBBDD>();

    const [lineaActuaccion, setLineaActuaccion] = useState(datosEditandoAccion.lineaActuaccion || '');

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const isFetchingRef = useRef(false);

    const yearDataDir = accionAccesoria ? yearData.plan.ejesRestantes!.filter((eje: Ejes) => eje.IsAccessory) : yearData.plan.ejesPrioritarios.filter((eje: Ejes) => eje.IsPrioritarios);
    const [ejesPlan, setEjesPlan] = useState<EjesBBDD[]>([]);

    useEffect(() => {
        if (!loading && !isFetchingRef.current) {
            const ejesRegionStr = localStorage.getItem('ejesRegion');
            const ejesStore: { ejesEstrategicos?: EjesBBDD[]; ejesGlobales?: EjesBBDD[] } = JSON.parse(ejesRegionStr || '{}');
            if (ejesStore) {
                const ejes = !accionAccesoria ? ejesStore.ejesEstrategicos ?? [] : ejesStore.ejesGlobales;

                if ((ejes && ejes.length > 0 && !ejes.find((r) => r.NameEs === nombreEjeES)) || ejes!.find((r) => r.NameEu === nombreEjeEU)) {
                    const eje = yearDataDir!.find((r) => r.NameEs === datosEditandoAccion.ejeEs);
                    if (eje) {
                        let ejeEscogido = EjesToEjesBBDD([eje])[0];
                        const lineaActuaccion = ejesStore.ejesGlobales!.find((r) => r.NameEs === ejeEscogido.NameEs)?.LineasActuaccion;
                        if (!lineaActuaccion) return;
                        ejeEscogido = {
                            ...ejeEscogido,
                            LineasActuaccion: lineaActuaccion,
                        };
                        if (ejeSeleccionado?.EjeId !== ejeEscogido.EjeId) {
                            setEjeSeleccionado({ ...ejeEscogido });
                            setEjesPlan([ejeEscogido]);
                        }
                        return;
                    }
                }
            }
            if (!ValidarEjesRegion(regionSeleccionada)) {
                isFetchingRef.current = true;
                if (!accionAccesoria) {
                    LlamadaBBDDEjesRegion(regionSeleccionada, t, i18n, { setErrorMessage, setSuccessMessage }, setLoading, setEjesPlan).finally(() => {
                        isFetchingRef.current = false;
                    });
                } else {
                    LlamadaBBDDEjesRegion(regionSeleccionada, t, i18n, { setErrorMessage, setSuccessMessage }, setLoading, setEjesPlan, undefined, setEjesPlan).finally(() => {
                        isFetchingRef.current = false;
                    });
                }
            }
        }
    }, [yearData, loading]);

    useEffect(() => {
        if (
            (datosEditandoAccion.accionCompartida === undefined || datosEditandoAccion.accionCompartida === null) &&
            datosEditandoAccion.datosPlan?.supracomarcal !== `${t('sinOpcionesSupraComarcal')}`
        ) {
            setDatosEditandoAccion((prev: DatosAccion) => ({
                ...prev,
                datosPlan: {
                    ...prev.datosPlan!,
                    supracomarcal: `${t('sinOpcionesSupraComarcal')}`,
                },
            }));
        } else if (
            datosEditandoAccion.accionCompartida !== null &&
            typeof datosEditandoAccion.accionCompartida === 'object' &&
            datosEditandoAccion.datosPlan?.supracomarcal === `${t('sinOpcionesSupraComarcal')}`
        ) {
            const opcionesSupraComarcalSegunIdioma = t('object:opcionesSupraComarcal', { returnObjects: true }) as string[];
            setDatosEditandoAccion((prev: DatosAccion) => ({
                ...prev,
                datosPlan: {
                    ...prev.datosPlan!,
                    supracomarcal: opcionesSupraComarcalSegunIdioma[0],
                },
            }));
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
        const accionConLinea = (tipo === 'accion' && lineaActuaccion !== '') || accionAccesoria;
        if (accionConLinea && lineaActuaccion != datosEditandoAccion.lineaActuaccion) {
            if (datosEditandoAccion && datosEditandoAccion.lineaActuaccion != null && datosEditandoAccion?.lineaActuaccion !== lineaActuaccion) {
                setDatosEditandoAccion((prev) => ({
                    ...prev!,
                    lineaActuaccion,
                }));
            }
        }
    }, [lineaActuaccion, datosEditandoAccion]);

    useEffect(() => {
        if (controlguardado) {
            navigate(rutaAnterior);
        }
    }, [controlguardado]);

    if (!datosEditandoAccion) {
        return <ErrorFullScreen mensaje={t('falloAlCargarAccion')} irA={rutaAnterior} />;
    }

    if (datosEditandoAccion.id === '0') {
        return;
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

        GuardarLaEdicionAccion(accionAccesoria ? 'AccionesAccesorias' : 'Acciones', setLoading, { setErrorMessage, setSuccessMessage });
    };

    if (!ejeSeleccionado) {
        return <Loading />;
    }

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
                                <label className="block text-sm font-medium mb-1">{'*' + t('Accion')}</label>
                                {bloqueo ? (
                                    <span className="block  font-semibold">
                                        <span className="font-normal text-col">{datosEditandoAccion.accion}</span>
                                    </span>
                                ) : (
                                    <input type="text" className="form-input w-full" value={datosEditandoAccion.accion} onChange={(e) => handleAccionChange(e)} />
                                )}
                            </div>

                            <>
                                <div className="w-1/2 flex flex-col gap-2 justify-center">
                                    <span className="block  font-semibold mb-1">
                                        <span className="font-normal text-lg">{i18n.language === 'eu' ? nombreEjeEU : nombreEjeES}</span>
                                    </span>
                                    <span className="block  font-semibold">
                                        {bloqueo ? (
                                            <span className="w-3/4 text-info">{datosEditandoAccion.lineaActuaccion}</span>
                                        ) : (
                                            <DropdownLineaActuaccion
                                                setNuevaLineaActuaccion={setLineaActuaccion}
                                                idEjeSeleccionado={ejeSeleccionado.EjeId}
                                                lineaActuaccion={lineaActuaccion}
                                                ejesPlan={EjesBBDDToEjes(ejesPlan)}
                                                tipoAccion={accionAccesoria ? 'AccionesAccesorias' : 'Acciones'}
                                            />
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
                                        disabled={bloqueo}
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

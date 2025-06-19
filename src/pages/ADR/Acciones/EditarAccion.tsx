import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import IconCuadroMando from '../../../components/Icon/Menu/IconCuadroMando.svg';
import { Fragment } from 'react';
import { TabCard } from './EditarAccionComponent';
import { PestanaPlan } from './EditarAccionPlan';
import IconPlan from '../../../components/Icon/Menu/IconPlan.svg';
import IconMemoria from '../../../components/Icon/Menu/IconMemoria.svg';
import { PestanaMemoria } from './EditarAccionMemoria';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { PestanaIndicadores } from './EditarAccionIndicadores';
import { ZonaTitulo } from '../../Configuracion/componentes';
import { useYear } from '../../../contexts/DatosAnualContext';

const Index: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { anio, estados } = useEstadosPorAnio();

    const { datosEditandoAccion, setDatosEditandoAccion, SeleccionEditarGuardar } = useYear();

    if (!datosEditandoAccion) {
        return;
    }

    const handleAccionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDatosEditandoAccion({
            ...datosEditandoAccion!,
            accion: `${e.target.value}`,
        });
    };

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>{t('accionTituloEditado')} 2025</span>
                    </h2>
                }
                zonaBtn={
                    <div className="ml-auto flex gap-4 items-center justify-end">
                        <button className="px-4 py-2 bg-primary text-white rounded" onClick={SeleccionEditarGuardar}>
                            {t('guardar')}{' '}
                        </button>
                        <NavLink to="/adr/acciones" className="group">
                            <button className="px-4 py-2 bg-danger text-white rounded">{t('cerrar')}</button>
                        </NavLink>
                    </div>
                }
                zonaExtra={
                    <div className="w-full">
                        <div className="flex gap-4 w-full">
                            <div className="w-1/2 flex flex-col justify-center">
                                <label className="block text-sm font-medium mb-1">{t('Accion')}</label>
                                <input type="text" className="form-input w-full" value={datosEditandoAccion.accion} onChange={handleAccionChange} name="accion" />
                            </div>
                            <div className="w-1/2 flex flex-col gap-2 justify-center">
                                <span className="block  font-semibold mb-1">
                                    <span className="font-normal text-lg">{i18n.language === 'es' ? datosEditandoAccion.ejeEs : datosEditandoAccion.ejeEu}</span>
                                </span>
                                <span className="block  font-semibold">
                                    <span className="font-normal text-col text-info">{datosEditandoAccion.lineaActuaccion}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                }
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
                                    <TabCard icon={IconPlan} label="tabPlan" status={estados[anio]?.plan} />
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
                                    <TabCard icon={IconMemoria} label="tabMemoria" status={estados[anio]?.memoria} />
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

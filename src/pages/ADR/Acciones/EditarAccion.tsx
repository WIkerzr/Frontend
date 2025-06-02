import { useState } from 'react';
import { Acordeon } from '../Componentes';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import { Fragment } from 'react';
import { TabCard } from './EditarAccionComponent';
import { PestanaPlan } from './EditarAccionPlan';
import IconPlan from '../../../components/Icon/Menu/IconPlan.svg';
import IconMemoria from '../../../components/Icon/Menu/IconMemoria.svg';
import { PestanaMemoria } from './EditarAccionMemoria';
import { useTranslation } from 'react-i18next';
import { DatosAccion } from '../../../types/TipadoAccion';
import { NavLink, useLocation } from 'react-router-dom';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { PestanaIndicadores } from './EditarAccionIndicadores';

const Index: React.FC = () => {
    const { t } = useTranslation();
    const [active, setActive] = useState<string>('0');
    const { anio, estados } = useEstadosPorAnio();
    const estadoPlan = estados[anio]?.plan ?? 'borrador';
    const togglePara = (value: string) => {
        setActive((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };
    const location = useLocation();
    const accion = location.state?.accion;
    const [datosAccion, setDatosAccion] = useState<DatosAccion>(accion);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setDatosAccion((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div>
            <div className="flex w-full">
                {estadoPlan === 'borrador' ? (
                    <div className="w-[80%] panel">
                        <div className="flex gap-4 w-full">
                            <div className="w-1/3">
                                <label className={`block text-sm font-medium mb-1`}>{t('Accion')}</label>
                                <input type="text" className="form-input w-full" value={datosAccion.accion} onChange={handleChange} name="accion" />
                            </div>
                            <div className="w-1/3">
                                <label className={`block text-sm font-medium mb-1`}>{t('Eje')}</label>
                                <input type="text" className="form-input w-full" value={datosAccion.eje} onChange={handleChange} name="eje" />
                            </div>
                            <div className="w-1/3">
                                <label className={`block text-sm font-medium mb-1`}>{t('LineaActuaccion')}</label>
                                <input type="text" className="form-input w-full" value={datosAccion.lineaActuaccion} onChange={handleChange} name="lineaActuaccion" />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className=" flex bg-gray-100 mx-auto my-4 rounded shadow transition-all duration-300 p-1">
                        <Acordeon texto={datosAccion.accion} num={1} active={active} togglePara={togglePara} />
                        <Acordeon texto={datosAccion.eje} num={1} active={active} togglePara={togglePara} />
                        <Acordeon texto={datosAccion.lineaActuaccion} num={1} active={active} togglePara={togglePara} />
                    </div>
                )}
                <div className="mx-[2%]" />
                <div className="w-[18%] panel flex gap-4 items-center justify-center">
                    <button className="px-4 py-2 bg-primary text-white rounded">{t('guardar')}</button>
                    <NavLink to="/adr/acciones" className="group">
                        <button className="px-4 py-2 bg-danger text-white rounded">{t('cerrar')}</button>
                    </NavLink>
                </div>
            </div>

            <div className="mb-5 flex flex-col sm:flex-row">
                <TabGroup className="w-full">
                    <TabList className="mx-10 mt-3 flex flex-wrap justify-center border-b border-white-light dark:border-[#191e3a]">
                        <Tab as={Fragment}>
                            {({ selected }) => (
                                <button
                                    className={`${
                                        selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                    }  -mb-[1px] block border border-transparent p-3.5 py-2 hover:border-white-light hover:border-b-white dark:hover:border-[#191e3a] dark:hover:border-b-black`}
                                >
                                    {t('Indicadores')}
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
                                    <TabCard icon={IconPlan} label="Plan" status="borrador" />
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
                                    <TabCard icon={IconMemoria} label="Memoria" status="cerrado" />
                                </button>
                            )}
                        </Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <PestanaIndicadores indicador={datosAccion.indicadorAccion!} />
                        </TabPanel>
                        <TabPanel>
                            <PestanaPlan datosPlan={datosAccion.datosPlan!} />
                        </TabPanel>
                        <TabPanel>
                            <PestanaMemoria datosMemoria={datosAccion.datosMemoria!} />
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </div>
        </div>
    );
};
export default Index;

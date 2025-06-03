import { useState } from 'react';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';
import IconCuadroMando from '../../../components/Icon/Menu/IconCuadroMando.svg';
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
import { ZonaTitulo } from '../../Configuracion/componentes';

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
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>{t('listadoAcciones')} 2025</span>
                    </h2>
                }
                zonaBtn={
                    <div className="w-[18%] flex gap-4 items-center justify-end">
                        <button className="px-4 py-2 bg-primary text-white rounded">{t('guardar')}</button>
                        <NavLink to="/adr/acciones" className="group">
                            <button className="px-4 py-2 bg-danger text-white rounded">{t('cerrar')}</button>
                        </NavLink>
                    </div>
                }
                zonaExtra={
                    <div className="w-full">
                        <div className="flex gap-4 w-full">
                            {/* Accion: la mitad izquierda */}
                            <div className="w-1/2 flex flex-col justify-center">
                                <label className="block text-sm font-medium mb-1">{t('Accion')}</label>
                                <input type="text" className="form-input w-full" value={datosAccion.accion} onChange={handleChange} name="accion" />
                            </div>
                            {/* Eje y LineaActuaccion: la mitad derecha, uno arriba de otro, más pequeños */}
                            <div className="w-1/2 flex flex-col gap-2 justify-center">
                                <span className="block  font-semibold mb-1">
                                    {t('Eje')}: <span className="font-normal">{datosAccion.eje}</span>
                                </span>
                                <span className="block  font-semibold">
                                    {t('LineaActuaccion')}: <span className="font-normal">{datosAccion.lineaActuaccion}</span>
                                </span>
                            </div>
                        </div>
                    </div>
                }
            />
            {/* <div className="flex justify-between items-center mb-6 panel">
                <div className="flex space-x-4 w-full">
                    <div className="flex w-full justify-between">
                        {estadoPlan === 'borrador' ? (
                            <></>
                        ) : (
                            <div className=" flex bg-gray-100 mx-auto my-4 rounded shadow transition-all duration-300 p-1">
                                <Acordeon texto={datosAccion.accion} num={1} active={active} togglePara={togglePara} />
                                <Acordeon texto={datosAccion.eje} num={1} active={active} togglePara={togglePara} />
                                <Acordeon texto={datosAccion.lineaActuaccion} num={1} active={active} togglePara={togglePara} />
                            </div>
                        )}
                    </div>
                </div>
            </div> */}

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
                    <div className="w-full border border-white-light dark:border-[#191e3a] rounded-lg">
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
                    </div>
                </TabGroup>
            </div>
        </div>
    );
};
export default Index;

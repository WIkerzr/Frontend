import { useState } from 'react';
import { Acordeon } from '../Componentes';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import { Fragment } from 'react';
import { Indicador, PestanaIndicadores, TabCard } from './EditarAccionComponent';
import { Input } from '../../../components/Utils/inputs';
import { PestanaPlan } from './EditarAccionPlan';
import IconPlan from '../../../components/Icon/Menu/IconPlan.svg';
import IconMemoria from '../../../components/Icon/Menu/IconMemoria.svg';
import { PestanaMemoria } from './EditarAccionMemoria';
import { useTranslation } from 'react-i18next';
import { DatosAccion, datosInicializadosAccion } from '../../../types/TipadoAccion';
import { datosAcciones } from '../Acciones';

const ejemploIndicadores: Indicador[] = [
    {
        id: 1,
        nombre: 'RE04. Número de infraestructuras y/o servicios mejorados',
        metaAnual: {
            hombres: '10',
            mujeres: '10',
            total: '20',
        },
        ejecutado: {
            hombres: '7',
            mujeres: '5',
            total: '12',
        },
        metaFinal: {
            hombres: '20',
            mujeres: '20',
            total: '40',
        },
        hipotesis: 'Se espera un ligero aumento.',
    },
    {
        id: 2,
        nombre: 'RE05. Número de personas emprendedoras apoyadas',
        metaAnual: {
            hombres: '50',
            mujeres: '50',
            total: '100',
        },
        ejecutado: {
            hombres: '42',
            mujeres: '50',
            total: '92',
        },
        metaFinal: {
            hombres: '150',
            mujeres: '150',
            total: '300',
        },
    },
];

const Index: React.FC = () => {
    const { t } = useTranslation();
    const [active, setActive] = useState<string>('0');
    const [planActivo, setPlanActivo] = useState<boolean>(true);
    const togglePara = (value: string) => {
        setActive((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    const [datosAccion, setDatosAccion] = useState<DatosAccion>(datosAcciones[0]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        console.log(datosAccion);

        const { name, value } = e.target;
        setDatosAccion((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    return (
        <div>
            {planActivo === true ? (
                <div className="flex w-full">
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
                    <div className="mx-[2%]" />
                    <div className="w-[18%] panel flex items-center justify-center">
                        <span>Panel derecho</span>
                    </div>
                </div>
            ) : (
                <div className=" flex bg-gray-100 mx-auto my-4 rounded shadow transition-all duration-300 p-1">
                    <Acordeon texto={datosAccion.accion} num={1} active={active} togglePara={togglePara} />
                    <Acordeon texto={datosAccion.eje} num={1} active={active} togglePara={togglePara} />
                    <Acordeon texto={datosAccion.lineaActuaccion} num={1} active={active} togglePara={togglePara} />
                </div>
            )}
            <div className="mb-5 flex flex-col sm:flex-row">
                <TabGroup className="w-full">
                    <TabList className="mx-10 mt-3 flex flex-wrap justify-center border-b border-white-light dark:border-[#191e3a]">
                        <Tab as={Fragment}>
                            {({ selected }) => (
                                <div className="text-center !outline-none">
                                    <button
                                        className={`${
                                            selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                        }  -mb-[1px] block border border-transparent p-3.5 py-2 hover:border-white-light hover:border-b-white dark:hover:border-[#191e3a] dark:hover:border-b-black`}
                                    >
                                        Indicadores
                                    </button>
                                </div>
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
                            <PestanaIndicadores indicador={ejemploIndicadores} />
                        </TabPanel>
                        <TabPanel>
                            <PestanaPlan />
                        </TabPanel>
                        <TabPanel>
                            <PestanaMemoria />
                        </TabPanel>
                    </TabPanels>
                </TabGroup>
            </div>
        </div>
    );
};
export default Index;

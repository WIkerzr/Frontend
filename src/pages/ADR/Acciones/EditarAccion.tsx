import { useState } from 'react';
import { Acordeon } from '../Componentes';
import { datosAcciones } from '../Acciones';
import { Tab, TabGroup, TabList, TabPanel, TabPanels } from '@headlessui/react';

import { Fragment } from 'react';
import { Indicador, PestanaIndicadores } from './EditarAccionComponent';

const ejemploIndicadores: Indicador[] = [
    {
        id: 1,
        nombre: 'Tasa de alfabetización',
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
        hipotesis: 'Se espera un ligero aumento debido a nuevas políticas educativas.',
    },
    {
        id: 2,
        nombre: 'Cobertura de vacunación',
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
    const [active, setActive] = useState<string>('0');
    const togglePara = (value: string) => {
        setActive((oldValue) => {
            return oldValue === value ? '' : value;
        });
    };

    return (
        <div>
            <div className=" flex bg-gray-100 mx-auto my-4 rounded shadow transition-all duration-300 p-1">
                <Acordeon texto={datosAcciones[0].texto} num={1} active={active} togglePara={togglePara} />
                <Acordeon texto={datosAcciones[0].eje} num={1} active={active} togglePara={togglePara} />
                <Acordeon texto={datosAcciones[0].lineaActuaccion} num={1} active={active} togglePara={togglePara} />
            </div>
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
                                    className={`${
                                        selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                    }  -mb-[1px] block border border-transparent p-3.5 py-2 hover:border-white-light hover:border-b-white dark:hover:border-[#191e3a] dark:hover:border-b-black`}
                                >
                                    Plan
                                </button>
                            )}
                        </Tab>
                        <Tab as={Fragment}>
                            {({ selected }) => (
                                <button
                                    className={`${
                                        selected ? '!border-white-light !border-b-white text-primary !outline-none dark:!border-[#191e3a] dark:!border-b-black' : ''
                                    }  -mb-[1px] block border border-transparent p-3.5 py-2 hover:border-white-light hover:border-b-white dark:hover:border-[#191e3a] dark:hover:border-b-black`}
                                >
                                    Memoria
                                </button>
                            )}
                        </Tab>
                    </TabList>

                    <TabPanels>
                        <TabPanel>
                            <PestanaIndicadores indicador={ejemploIndicadores} />
                        </TabPanel>
                        <TabPanel>Plan</TabPanel>
                        <TabPanel>Memoria</TabPanel>
                    </TabPanels>
                </TabGroup>
            </div>
        </div>
    );
};
export default Index;

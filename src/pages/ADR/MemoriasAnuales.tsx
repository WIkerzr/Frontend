import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../Configuracion/componentes';
import { StatusColors, useEstadosPorAnio } from '../../contexts/EstadosPorAnioContext';
import { CamposPlanMemoria } from './Plan/PlanMemoriaComponents';
import { NavLink } from 'react-router-dom';
import IconDownloand from '../../components/Icon/IconDownloand.svg';
import IconEnviar from '../../components/Icon/IconEnviar.svg';
import { useState } from 'react';
interface Archivo {
    nombre: string;
    url: string;
}

const archivos: Archivo[] = [
    { nombre: 'Memoria.pdf', url: '/docs/Memoria.pdf' },
    { nombre: 'Anexo1.pdf', url: '/docs/Anexo1.pdf' },
    { nombre: 'Anexo2.pdf', url: '/docs/Anexo2.pdf' },
    // { nombre: "Anexo4.pdf", url: "/docs/Anexo4.pdf" },
    // { nombre: "Anexo5.pdf", url: "/docs/Anexo5.pdf" },
];

const Index = () => {
    const { anio, estados } = useEstadosPorAnio();
    const { t } = useTranslation();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>{t('memoriaTitulo')} 2025</span>
                        <span className={`${StatusColors[estados[anio]?.memoria]}`}>{t(estados[anio]?.memoria)}</span>
                    </h2>
                }
                zonaBtn={
                    <>
                        {estados[anio]?.memoria === 'borrador' && (
                            <div className="flex items-center gap-4 justify-end">
                                <button className="px-4 py-2 bg-primary text-white rounded flex items-center justify-center font-medium h-10 min-w-[120px]">{t('guardar')}</button>
                                <button className="px-4 py-2 bg-gray-400 text-white rounded flex items-center justify-center gap-1 font-medium h-10 min-w-[120px]">
                                    <img src={IconDownloand} alt="PDF" className="w-5 h-5" style={{ minWidth: 20, minHeight: 20 }} />
                                    {t('descargarBorrador')}
                                </button>
                                <NavLink to="/adr/planesGestionEnvio" className="min-w-[120px]">
                                    <button className="px-4 py-2 bg-green-500 text-white rounded flex items-center justify-center gap-1 font-medium h-10 w-full">
                                        <img src={IconEnviar} alt="PDF" className="w-5 h-5" style={{ minWidth: 20, minHeight: 20 }} />
                                        {t('enviar')}
                                    </button>
                                </NavLink>
                            </div>
                        )}
                    </>
                }
                zonaExplicativa={
                    <>
                        {estados[anio]?.memoria === 'borrador' && <span className="block mb-2">{t('explicacionMemoriaParte1')}</span>}
                        <span className="block">{t(`explicacionMemoriaParte2${estados[anio]?.memoria}`)}</span>
                    </>
                }
            />
            <>
                {estados[anio].memoria === 'borrador' && <CamposPlanMemoria pantalla="Memoria" />}
                {estados[anio].memoria === 'cerrado' && (
                    <div className="panel w-full max-w-lg mx-auto mt-8 bg-white rounded shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Archivos Memoria 2025</h2>
                        <ul className="space-y-3 ">
                            {archivos.map((archivo, idx) => (
                                <li
                                    key={archivo.nombre}
                                    className={`flex items-center justify-between p-3 rounded transition hover:bg-gray-100 ${hoveredIndex === idx ? 'bg-gray-100' : ''}`}
                                    onMouseEnter={() => setHoveredIndex(idx)}
                                    onMouseLeave={() => setHoveredIndex(null)}
                                >
                                    <div className="flex items-center space-x-3">
                                        <img src={IconDownloand} alt="PDF" className="w-6 h-6 text-red-500" style={{ minWidth: 24, minHeight: 24 }} />
                                        <span className="font-medium">{archivo.nombre}</span>
                                    </div>
                                    <a href={archivo.url} download className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-800 transition">
                                        <button className="w-20 h-5 mr-2" style={{ minWidth: 20, minHeight: 20 }}>
                                            {t('descargar')}
                                        </button>
                                    </a>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}
            </>
        </div>
    );
};

export default Index;

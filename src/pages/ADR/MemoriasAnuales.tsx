import { useTranslation } from 'react-i18next';
import IconDownloand from '../../components/Icon/IconDownloand.svg';
import IconMemoria from '../../components/Icon/Menu/IconMemoria.svg';

const Index = () => {
    return (
        <div>
            <ListadoArchivos></ListadoArchivos>
        </div>
    );
};

export default Index;

import { useState } from 'react';
import { StatusColors, TabCard } from './Acciones/EditarAccionComponent';
interface Archivo {
    nombre: string;
    url: string;
}

const archivos: Archivo[] = [
    { nombre: 'Anexo2.pdf', url: '/docs/Anexo2.pdf' },
    { nombre: 'Anexo3.pdf', url: '/docs/Anexo3.pdf' },
    { nombre: 'Memoria.pdf', url: '/docs/Memoria.pdf' },
    // { nombre: "Anexo4.pdf", url: "/docs/Anexo4.pdf" },
    // { nombre: "Anexo5.pdf", url: "/docs/Anexo5.pdf" },
];

function ListadoArchivos() {
    const { t } = useTranslation();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

    return (
        <div className="panel">
            <div className="panel">
                <h2 className="text-xl font-bold flex items-center">
                    {t('memoriaTitulo')} (
                    <TabCard icon={IconMemoria} label="estadoCerrado" status="cerrado" className=" text-black dark:text-[#506690] dark:group-hover:text-white-dark" />) 2025
                </h2>
                <div className="flex justify-between items-center mb-6">
                    <div className="flex flex-col space-x-4">
                        <span>{t('explicacionMemoriaParte1')}</span>
                        <span>{t('explicacionMemoriaParte2')}</span>
                    </div>
                </div>
            </div>
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
                                    Descargar
                                </button>
                            </a>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

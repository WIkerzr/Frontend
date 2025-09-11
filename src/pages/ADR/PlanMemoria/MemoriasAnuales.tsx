import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../../Configuracion/Users/componentes';
import { BotonesAceptacionYRechazo, BotonReapertura, CamposPlanMemoria, validarAccionesEjes, validarServicios } from './PlanMemoriaComponents';
import { NavLink } from 'react-router-dom';
import IconDownloand from '../../../components/Icon/IconDownloand.svg';
import IconEnviar from '../../../components/Icon/IconEnviar.svg';
import { useEffect, useState } from 'react';
import { generarDocumentoWord } from '../../../components/Utils/genWORD';
import { useYear } from '../../../contexts/DatosAnualContext';
import { useEstadosPorAnio, StatusColors } from '../../../contexts/EstadosPorAnioContext';
import { YearData } from '../../../types/tipadoPlan';

function validarCamposMemoriaGestionAnual(yearData: YearData): boolean {
    const memoria = yearData.memoria;

    if (!memoria.dSeguimiento || memoria.dSeguimiento.trim() === '') return false;
    if (!memoria.valFinal || memoria.valFinal.trim() === '') return false;

    const existeIndicadorValido = yearData.plan.generalOperationADR.operationalIndicators.some((OI) => OI.valueAchieved.trim() !== '');

    return existeIndicadorValido;
}

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
    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const { t } = useTranslation();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const { yearData } = useYear();
    const [camposRellenos, setCamposRellenos] = useState<boolean>(false);
    const [mensajeError, setMensajeError] = useState<string>('');
    const [successMessageSuperior, setSuccessMessageSuperior] = useState<string>('');
    const [visibleMessageSuperior, setVisibleMessageSuperior] = useState('');

    const [guardado, setGuardado] = useState<boolean>(false);
    const guardadoProps = { value: guardado, set: setGuardado };

    useEffect(() => {
        if (successMessageSuperior) {
            setVisibleMessageSuperior(successMessageSuperior);
        } else {
            const timer = setTimeout(() => setVisibleMessageSuperior(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessageSuperior]);

    useEffect(() => {
        if (!validarCamposMemoriaGestionAnual(yearData)) {
            setMensajeError(t('faltanCamposMemoriaSeguimiento'));
            setCamposRellenos(false);
            return;
        }
        if (!validarAccionesEjes(yearData.plan.ejesPrioritarios, editarPlan, editarMemoria, t)) {
            setMensajeError(t('faltanCamposAccionesEjesPrioritarios'));
            setCamposRellenos(false);
            return;
        }
        if (!validarAccionesEjes(yearData.plan.ejes, editarPlan, editarMemoria, t)) {
            setMensajeError(t('faltanCamposAccionesEjes'));
            setCamposRellenos(false);
            return;
        }
        if (!validarServicios(yearData.servicios!, editarMemoria, t)) {
            setMensajeError(t('faltanCamposServicios'));
            setCamposRellenos(false);
            return;
        }
        setMensajeError('');
        setCamposRellenos(true);
    }, [yearData]);

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>
                            {t('memoriaTitulo')} {anioSeleccionada}
                        </span>
                        <span className={`${StatusColors[yearData.memoria.status]}`}>{t(yearData.memoria.status)}</span>
                    </h2>
                }
                zonaBtn={
                    <>
                        {editarMemoria && (
                            <div className="flex flex-col items-center gap-4 justify-end ">
                                <div className="flex items-center gap-4 justify-end">
                                    <button
                                        disabled={!camposRellenos}
                                        className="px-4 py-2 bg-primary text-white rounded flex items-center justify-center font-medium h-10 min-w-[120px]"
                                        onClick={() => setGuardado(true)}
                                    >
                                        {t('guardar')}
                                    </button>
                                    <button
                                        disabled={!camposRellenos}
                                        onClick={() => {
                                            if (!camposRellenos) return;
                                            generarDocumentoWord(yearData, 'Memoria');
                                        }}
                                        className={`px-4 py-2 rounded flex items-center justify-center gap-1 font-medium h-10 min-w-[120px]    
                                        ${camposRellenos ? 'bg-gray-400 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                                        `}
                                    >
                                        <img src={IconDownloand} alt="PDF" className="w-5 h-5" style={{ minWidth: 20, minHeight: 20 }} />
                                        {t('descargarBorrador')}
                                    </button>
                                    <NavLink
                                        to={camposRellenos ? '/adr/memoriasAnuales/gestionEnvio' : '#'}
                                        state={{ pantalla: 'Memoria' }}
                                        onClick={(e) => {
                                            if (!camposRellenos) e.preventDefault();
                                        }}
                                        className="min-w-[120px]"
                                    >
                                        <button
                                            disabled={!camposRellenos}
                                            className={`px-4 py-2 rounded flex items-center justify-center gap-1 font-medium h-10 w-full ${
                                                camposRellenos ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            <img src={IconEnviar} alt="PDF" className="w-5 h-5" style={{ minWidth: 20, minHeight: 20 }} />
                                            {t('enviar')}
                                        </button>
                                    </NavLink>
                                </div>
                                {mensajeError && <div className="text-red-500">{mensajeError}</div>}
                                {visibleMessageSuperior && <div className="w-full flex flex-col  text-success bg-warning-ligh p-3.5">{visibleMessageSuperior}</div>}
                            </div>
                        )}
                        <BotonesAceptacionYRechazo pantalla="Memoria" />
                        <BotonReapertura pantalla="Memoria" />
                    </>
                }
                zonaExplicativa={
                    editarMemoria && (
                        <>
                            {yearData.memoria.status === 'borrador' && <span className="block mb-2">{t('explicacionMemoriaParte1')}</span>}
                            <span className="block">{t(`explicacionMemoriaParte2${yearData.memoria.status}`)}</span>
                        </>
                    )
                }
            />
            <>
                {(yearData.memoria.status === 'borrador' || yearData.memoria.status === 'cerrado') && (
                    <CamposPlanMemoria pantalla="Memoria" guardadoProps={guardadoProps} setSuccessMessageSuperior={setSuccessMessageSuperior} />
                )}
                {(yearData.memoria.status === 'proceso' || yearData.memoria.status === 'aceptado') && (
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

import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import IconDownloand from '../../../components/Icon/IconDownloand.svg';
import IconEnviar from '../../../components/Icon/IconEnviar.svg';
import { ZonaTitulo } from '../../Configuracion/componentes';
import { BotonesAceptacionYRechazo, BotonReapertura, CamposPlanMemoria } from './PlanMemoriaComponents';
import { useYear } from '../../../contexts/DatosAnualContext';
import { YearData } from '../../../types/tipadoPlan';
import { useEffect, useState } from 'react';
import { validarCamposObligatoriosAccion } from '../Componentes';
import { generarDocumentoWord } from '../../../components/Utils/genWORD';
import { StatusColors, useEstadosPorAnio } from '../../../contexts/RegionEstadosContext';
interface Archivo {
    nombre: string;
    url: string;
}

const archivos: Archivo[] = [
    { nombre: 'Memoria.pdf', url: '/docs/Memoria.pdf' },
    { nombre: 'Anexo1.pdf', url: '/docs/Anexo1.pdf' },
    { nombre: 'Anexo2.pdf', url: '/docs/Anexo2.pdf' },
];

const Index = () => {
    const { anio, editarPlan } = useEstadosPorAnio();
    const { yearData } = useYear();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [camposRellenos, setCamposRellenos] = useState<boolean>(false);
    const [mensajeError, setMensajeError] = useState<string>('');

    const { t } = useTranslation();

    function validarCamposPlan(yearData: YearData): boolean {
        const plan = yearData.plan;
        setMensajeError('');
        const camposTextoLlenos = plan.introduccion.trim() !== '' && plan.proceso.trim() !== '' && plan.generalOperationADR.adrInternalTasks.trim() !== '';

        if (camposTextoLlenos === false) {
            setMensajeError(t('rellenaLosCamposVaciosObligatorios') + '\n');
            return false;
        }
        const indicadores = plan.generalOperationADR.operationalIndicators;
        const primerIndicador = indicadores[0];

        const indicadorLleno =
            primerIndicador &&
            primerIndicador.id?.trim() !== '' &&
            primerIndicador.nameEs?.trim() !== '' &&
            primerIndicador.nameEu?.trim() !== '' &&
            primerIndicador.value?.trim() !== '' &&
            primerIndicador.valueAchieved?.trim() !== '';

        if (indicadorLleno === false) {
            setMensajeError(t('rellenaLosCamposVaciosObligatorios') + '\n');
            return false;
        }
        return true;
    }
    function validarPlan(yearData: YearData): boolean {
        for (let index = 0; index < yearData.plan.ejesPrioritarios.length; index++) {
            const ejesPrioritarios = yearData.plan.ejesPrioritarios[index];
            for (let index = 0; index < ejesPrioritarios.acciones.length; index++) {
                const acciones = ejesPrioritarios.acciones[index];
                const { faltanIndicadoresPlan, faltanCamposPlan } = validarCamposObligatoriosAccion(acciones);
                if (faltanIndicadoresPlan || faltanCamposPlan) {
                    return false;
                }
            }
        }
        return true;
    }

    useEffect(() => {
        // console.log('validarCamposPlan ' + validarCamposPlan(yearData));
        // console.log('validarPlan ' + validarPlan(yearData));
        if (validarCamposPlan(yearData) && validarPlan(yearData)) {
            setCamposRellenos(true);
        } else {
            setCamposRellenos(false);
        }
    }, [yearData]);

    return (
        <div className="panel ">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>
                            {t('planTitulo')} {anio}
                        </span>
                        <span className={`${StatusColors[yearData.plan.status]}`}>{t(yearData.plan.status)}</span>
                    </h2>
                }
                zonaBtn={
                    <>
                        {editarPlan && (
                            <div className="flex flex-col items-center gap-4 justify-end ">
                                <div className="flex items-center gap-4 justify-end ">
                                    <button className="px-4 py-2 bg-primary text-white rounded flex items-center justify-center font-medium h-10 min-w-[120px]">{t('guardar')}</button>
                                    <button
                                        disabled={!camposRellenos}
                                        onClick={() => {
                                            if (!camposRellenos) return;
                                            generarDocumentoWord(yearData, 'Plan');
                                        }}
                                        className={`px-4 py-2 rounded flex items-center justify-center gap-1 font-medium h-10 min-w-[120px]    
                                        ${camposRellenos ? 'bg-gray-400 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                                        `}
                                    >
                                        <img src={IconDownloand} alt="PDF" className="w-5 h-5" style={{ minWidth: 20, minHeight: 20 }} />
                                        {t('descargarBorrador')}
                                    </button>
                                    <NavLink
                                        to={camposRellenos ? '/adr/planesGestion/gestionEnvio' : '#'}
                                        state={{ pantalla: 'Plan' }}
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
                            </div>
                        )}
                        <BotonesAceptacionYRechazo pantalla="Plan" />
                        <BotonReapertura pantalla="Plan" />
                    </>
                }
                zonaExplicativa={
                    editarPlan && (
                        <>
                            <span>{t('explicacionPlanParte1')}</span>
                            <span>{t('explicacionPlanParte2')}</span>
                        </>
                    )
                }
            />
            {editarPlan && <CamposPlanMemoria pantalla="Plan" />}
            {(yearData.plan.status === 'proceso' || yearData.plan.status === 'aceptado') && (
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
        </div>
    );
};

export default Index;

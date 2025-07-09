import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import IconDownloand from '../../../components/Icon/IconDownloand.svg';
import IconEnviar from '../../../components/Icon/IconEnviar.svg';
import { ZonaTitulo } from '../../Configuracion/componentes';
import { StatusColors, useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { BotonesAceptacionYRechazo, BotonReapertura, CamposPlanMemoria } from './PlanMemoriaComponents';
import { useYear } from '../../../contexts/DatosAnualContext';
import { YearData } from '../../../types/tipadoPlan';
import { useEffect, useState } from 'react';
import { validarCamposObligatoriosAccion } from '../Componentes';
import { generarDocumentoWord } from '../../../components/Utils/genWORD';

const Index = () => {
    const { anio, editarPlan } = useEstadosPorAnio();
    const { yearData } = useYear();
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
                const { faltanindicadoresPlan, faltanCamposPlan } = validarCamposObligatoriosAccion(acciones);
                if (faltanindicadoresPlan || faltanCamposPlan) {
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
                    <>
                        <span>{t('explicacionPlanParte1')}</span>
                        <span>{t('explicacionPlanParte2')}</span>
                    </>
                }
            />

            <CamposPlanMemoria pantalla="Plan" />
        </div>
    );
};

export default Index;

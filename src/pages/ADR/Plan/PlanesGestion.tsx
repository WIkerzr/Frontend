import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import IconDownloand from '../../../components/Icon/IconDownloand.svg';
import IconEnviar from '../../../components/Icon/IconEnviar.svg';
import { ZonaTitulo } from '../../Configuracion/componentes';
import { StatusColors, useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { CamposPlanMemoria } from './PlanMemoriaComponents';

const Index = () => {
    const { anio, estados } = useEstadosPorAnio();
    const { t } = useTranslation();

    return (
        <div className="panel ">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>{t('planTitulo')} 2025</span>
                        <span className={`${StatusColors[estados[anio]?.plan]}`}>{t(estados[anio]?.plan)}</span>
                    </h2>
                }
                zonaBtn={
                    <>
                        {estados[anio]?.memoria === 'borrador' && (
                            <div className="flex items-center gap-4 justify-end ">
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

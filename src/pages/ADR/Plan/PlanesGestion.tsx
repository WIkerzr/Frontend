import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import IconDownloand from '../../../components/Icon/IconDownloand.svg';
import IconEnviar from '../../../components/Icon/IconEnviar.svg';
import { IndicadoresOperativosPlanTable } from './PlanesComponentes';
import { ZonaTitulo } from '../../Configuracion/componentes';
import { StatusColors, useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useYear } from '../../../contexts/DatosAnualContext';
import { Plan } from '../../../types/tipadoPlan';

const Index = () => {
    const { anio, estados } = useEstadosPorAnio();
    const { t } = useTranslation();
    const { yearData, setYearData } = useYear();

    const handleChangeCampos = (campo: keyof Plan, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setYearData({
            ...yearData,
            plan: {
                ...yearData.plan!,
                [campo]: e.target.value || '',
            },
        });
    };

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
                }
                zonaExplicativa={
                    <>
                        <span>{t('explicacionPlanParte1')}</span>
                        <span>{t('explicacionPlanParte2')}</span>
                    </>
                }
            />

            <div className=" flex flex-col gap-4">
                <div className=" flex flex-row gap-4">
                    <div className="panel flex w-[100%] flex-col">
                        <label htmlFor="introduccion">*{t('introduccion')}</label>
                        <textarea
                            required
                            name="introduccion"
                            className="w-full border rounded p-2 h-[114px] resize-y"
                            value={yearData.plan.introduccion}
                            onChange={(e) => handleChangeCampos('introduccion', e)}
                        />
                    </div>
                </div>
                <div className="panel">
                    <label htmlFor="proceso">*{t('proceso')}</label>
                    <textarea required name="proceso" className="w-full border rounded p-2 h-[114px] resize-y" value={yearData.plan.process} onChange={(e) => handleChangeCampos('process', e)} />
                </div>
                {/* <div className="panel ">
                    <label htmlFor="ejesPrioritarios">*{t('ejesPrioritarios')}</label>
                    <textarea required name="ejesPrioritarios" className="w-full border rounded p-2 h-[90px] resize-none overflow-hidden text-base" value={ejesPrioritarios} />
                </div> */}
                <div className="panel">
                    <div>
                        <label htmlFor="tareasInternasGestionADR">*{t('tareasInternasGestionADR')}</label>
                        <textarea
                            required
                            name="tareasInternasGestionADR"
                            className="w-full border rounded p-2 h-[114px] resize-y"
                            value={yearData.plan.adrInternalTasks}
                            onChange={(e) => handleChangeCampos('adrInternalTasks', e)}
                        />
                    </div>
                    <div>
                        <IndicadoresOperativosPlanTable />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;

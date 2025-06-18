import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import IconDownloand from '../../../components/Icon/IconDownloand.svg';
import IconEnviar from '../../../components/Icon/IconEnviar.svg';
import { IndicadoresOperativosPlanTable } from './PlanesComponentes';
import { ZonaTitulo } from '../../Configuracion/componentes';
import { StatusColors, useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';

const introduccion: string = `La Ley 7/2022, de 30 de junio, de Desarrollo Rural, determina la elaboración de nuevos instrumentos de planificación que favorezcan la alineación de los proyectos e iniciativas del medio rural con las políticas institucionales a impulsar.
En el caso de los PCDR (Programas Comarcales de Desarrollo Rural), la previsión es que se elaboren a lo largo del ejercicio 2024 como herramientas donde se recojan, para cada comarca y bajo una metodología de trabajo común, los objetivos sectoriales y las líneas de actuación a implementar derivados de los PDT (Programas de Desarrollo Territorial) que incidan de forma prioritaria en cada comarca.
En este contexto, los Planes de Gestión correspondientes al año 2024 se diseñan en base a lo dispuesto en el PDR comarcal 2015-2020, con la finalidad de alcanzar los objetivos que lleven a la comarca hacia la VISION marcada en dicho PDR hasta que los nuevos instrumentos de planificación de referencia estén plenamente desarrollados.
En este documento se recogen las actuaciones que configuran el Plan de Gestión 2024 de la ADR LAUTADA para el desarrollo del PDR Comarcal de LLANADA ALAVESA`;
const proceso: string = `El despliegue de las herramientas para la nueva LDR (Ley de Desarrollo Rural) va a llevar un trabajo constante durante todo el año:
 Participación en el diseño de una metodología común para todas las comarcas de Euskadi  Planificación y elaboración del nuevo PCDR Llanada Alavesa donde la ADR será líder y responsable del proceso de elaboración con la participación “botom-up”. Para ello se realizará un diseño de la metodología y se marcan 3 fases:
o Primer trimestre 2024. Hazi Fundazioa contratará una empresa para la elaboración del diseño y planificación de un PCDR. Las ADRs participarán en este proceso o Segundo trimestre 2024. Capacitación al personal de las ADRs para la elaboración del PCDR o Segundo semestre 2024. Realización PCDR de la Llanada con un proceso participativo  Reuniones de participación y presentación de los PDTs (Programas de Desarrollo Territorial) que serán dos: PDT de diversificación de la actividad económica y PDT de calidad de vida. Las ADRs participarán como organismos y colaboradores de apoyo  Seguir trabajando con GV y DFA en el desarrollo de los nuevos convenios y financiación que se adecúen a las necesidades de la LDR.
 Se continuará con los grupos de trabajo de legumbres, sala de sacrifico de aves, harina y cocina colectiva y con el grupo de cohesión comarcal para el diseño y organización de las ediciones de 2023 del X Lautada Eguna y VII Semana del Desarrollo Rural.`;

const tareasInternasGestionADR: string = `Las tareas internas de gestión que aseguran un adecuado funcionamiento de la ADR son las siguientes:
Elaboración del PG anual y seguimiento de las actuaciones propuestas.
Elaboración de la memoria recapitulativa anual analizando el grado de ejecución de las actuaciones previstas.
Labores propias de la gestión administrativa interna de la asociación: convocatoria de juntas directivas, elaboración de actas y memorias, gestión del presupuesto, etc.
Comunicación de la ADR (difusión de actividades propias, elaboración de notas de prensa, recepción de inscripciones para eventos, redes sociales, ayudas, noticias de interés de la comarca, organización de ruedas de prensa etc.).`;

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
                        <textarea required name="introduccion" className="w-full border rounded p-2 h-[114px] resize-y" value={introduccion} />
                    </div>
                </div>
                <div className="panel">
                    <label htmlFor="proceso">*{t('proceso')}</label>
                    <textarea required name="proceso" className="w-full border rounded p-2 h-[114px] resize-y" value={proceso} />
                </div>
                {/* <div className="panel ">
                    <label htmlFor="ejesPrioritarios">*{t('ejesPrioritarios')}</label>
                    <textarea required name="ejesPrioritarios" className="w-full border rounded p-2 h-[90px] resize-none overflow-hidden text-base" value={ejesPrioritarios} />
                </div> */}
                <div className="panel">
                    <div>
                        <label htmlFor="tareasInternasGestionADR">*{t('tareasInternasGestionADR')}</label>
                        <textarea required name="tareasInternasGestionADR" className="w-full border rounded p-2 h-[114px] resize-y" value={tareasInternasGestionADR} />
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

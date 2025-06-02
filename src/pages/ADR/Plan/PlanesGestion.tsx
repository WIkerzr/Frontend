import { useTranslation } from 'react-i18next';
import { ejesBBDD } from '../Ejes';
import { NavLink } from 'react-router-dom';
import IconDownloand from '../../../components/Icon/IconDownloand.svg';
import { IndicadoresOperativosPlanTable } from './PlanesComponentes';

let introduccion: string = `2.- Liderar la realización y el despliegue del nuevo PROGRAMA COMARCAL DE DESARROLLO RURAL (PCDR).`;
let proceso: string = `El despliegue de las herramientas para la nueva LDR (Ley de Desarrollo Rural) va a llevar un trabajo
constante durante todo el año:
 Participación en el diseño de una metodología común para todas las comarcas de Euskadi
 Planificación y elaboración del nuevo PCDR Llanada Alavesa donde la ADR será líder y
responsable del proceso de elaboración con la participación “botom-up”. Para ello se realizará un
diseño de la metodología y se marcan 3 fases:
o Primer trimestre 2024. Hazi Fundazioa contratará una empresa para la elaboración del
diseño y planificación de un PCDR. Las ADRs participarán en este proceso
o Segundo trimestre 2024. Capacitación al personal de las ADRs para la elaboración del PCDR
o Segundo semestre 2024. Realización PCDR de la Llanada con un proceso participativo
 Reuniones de participación y presentación de los PDTs (Programas de Desarrollo Territorial)
que serán dos: PDT de diversificación de la actividad económica y PDT de calidad de vida. Las
ADRs participarán como organismos y colaboradores de apoyo
 Seguir trabajando con GV y DFA en el desarrollo de los nuevos convenios y financiación que se
adecúen a las necesidades de la LDR.
 Se continuará con los grupos de trabajo de legumbres, sala de sacrifico de aves, harina y cocina
colectiva y con el grupo de cohesión comarcal para el diseño y organización de las ediciones de
2023 del X Lautada Eguna y VII Semana del Desarrollo Rural.`;
const ejesPrioritarios = `${ejesBBDD[37].nombre}
${ejesBBDD[36].nombre}
${ejesBBDD[3].nombre}`;

let tareasInternasGestionADR: string = `Las tareas internas de gestión que aseguran un adecuado funcionamiento de la ADR son las siguientes:
Elaboración del PG anual y seguimiento de las actuaciones propuestas.
Elaboración de la memoria recapitulativa anual analizando el grado de ejecución de las actuaciones previstas.
Labores propias de la gestión administrativa interna de la asociación: convocatoria de juntas directivas, elaboración de actas y memorias, gestión del presupuesto, etc.
Comunicación de la ADR (difusión de actividades propias, elaboración de notas de prensa, recepción de inscripciones para eventos, redes sociales, ayudas, noticias de interés de la comarca, organización de ruedas de prensa etc.).
`;

const Index = () => {
    const { t } = useTranslation();

    return (
        <div className="p-5 flex flex-col gap-4 w-full">
            <div className=" flex flex-row  gap-4">
                <div className="panel flex w-[90%] flex-col">
                    <label htmlFor="introduccion">*{t('introduccion')}</label>
                    <textarea required name="introduccion" className="w-full border rounded p-2 h-[114px] resize-y" value={introduccion} />
                </div>
                <div className=" flex w-[10%] items-center justify-center ">
                    <div className="flex flex-col gap-4 panel">
                        <button className="px-4 py-3 bg-primary text-white rounded">{t('guardar')}</button>
                        <button className="px-1 py-3 bg-primary text-white rounded flex gap-1">
                            <img src={IconDownloand} alt="PDF" className="w-6 h-6 text-red-500" style={{ minWidth: 24, minHeight: 24 }} />
                            {t('WORD')}
                        </button>
                        <NavLink to="/adr/planesGestionEnvio" className="group">
                            <button className="px-4 py-3 bg-green-500 text-white rounded">{t('enviar')}</button>
                        </NavLink>
                    </div>
                </div>
            </div>
            <div className="panel">
                <label htmlFor="proceso">*{t('proceso')}</label>
                <textarea required name="proceso" className="w-full border rounded p-2 h-[114px] resize-y" value={proceso} />
            </div>
            <div className="panel">
                <label htmlFor="ejesPrioritarios">*{t('ejesPrioritarios')}</label>
                <textarea required name="ejesPrioritarios" className="w-full border rounded p-2 resize-none overflow-hidden text-base" value={ejesPrioritarios} />
            </div>
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
    );
};

export default Index;

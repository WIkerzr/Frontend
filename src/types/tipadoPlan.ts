import { Estado } from './GeneralTypes';
import { datosPruebaIndicadoreResultado } from './Indicadores';
import { DatosAccion } from './TipadoAccion';
export type Year = number;

export interface GeneralOperationADR {
    adrInternalTasks: string;
    operationalIndicators: OperationalIndicators[];
    dSeguimiento?: string;
    valFinal?: string;
}
export interface OperationalIndicators {
    id: string;
    value: string;
    nameEs: string;
    nameEu: string;
    valueAchieved: string;
}
export interface Ejes {
    id: string;
    nameEs: string;
    nameEu: string;
    IsActive: boolean;
    acciones: DatosAccion[];
}

export interface Plan {
    id: string;
    ejes: Ejes[];
    ejesPrioritarios: Ejes[];
    introduccion: string;
    proceso: string;
    generalOperationADR: GeneralOperationADR;
    status: Estado;
}
export interface Memoria {
    id: string;
    status: Estado;
}

export interface YearData {
    year: Year;
    nombreRegion: string;
    plan: Plan;
    memoria: Memoria;
}

export interface InitialDataResponse {
    data: YearData[];
    idRegion: string;
}

export const ejesIniado: Ejes[] = [
    { id: '1', nameEs: 'Abastecimiento de agua y Saneamiento', nameEu: 'Ura hornitzea eta saneamendua', IsActive: true, acciones: [] },
    {
        id: '2',
        nameEs: 'Suministro de energía (eléctrico, gas…) y energías renovables y sostenibles',
        nameEu: 'Energia hornidura (elektrikoa, gasa...) eta energia berriztagarri eta jasangarriak',
        IsActive: true,
        acciones: [],
    },
    { id: '3', nameEs: 'Telecomunicaciones', nameEu: 'Telekomunikazioak', IsActive: true, acciones: [] },
    { id: '4', nameEs: 'Red viaria y caminos', nameEu: 'Errepide sarea eta bideak', IsActive: true, acciones: [] },
    { id: '5', nameEs: 'Accesibilidad', nameEu: 'Irisgarritasuna', IsActive: true, acciones: [] },
    { id: '6', nameEs: 'Transporte y movilidad', nameEu: 'Garraioa eta mugikortasuna', IsActive: true, acciones: [] },
    { id: '7', nameEs: 'Educación infantil', nameEu: 'Haur hezkuntza', IsActive: true, acciones: [] },
    { id: '8', nameEs: 'Educación obligatoria', nameEu: 'Derrigorrezko hezkuntza', IsActive: true, acciones: [] },
    { id: '9', nameEs: 'Educación superior no obligatoria', nameEu: 'Derrigorrezkoa ez den goi-mailako hezkuntza', IsActive: true, acciones: [] },
    { id: '10', nameEs: 'Atención sanitaria primaria', nameEu: 'Lehen mailako osasun arreta', IsActive: true, acciones: [] },
    { id: '11', nameEs: 'Atención sanitaria especializada', nameEu: 'Espezializatutako osasun arreta', IsActive: true, acciones: [] },
    { id: '12', nameEs: 'Atención farmacéutica', nameEu: 'Farmazia arreta', IsActive: true, acciones: [] },
    { id: '13', nameEs: 'Atención social', nameEu: 'Gizarte arreta', IsActive: true, acciones: [] },
    { id: '14', nameEs: 'Cultura', nameEu: 'Kultura', IsActive: true, acciones: [] },
    { id: '15', nameEs: 'Deporte', nameEu: 'Kirola', IsActive: true, acciones: [] },
    { id: '16', nameEs: 'Ocio', nameEu: 'Aisia', IsActive: true, acciones: [] },
    { id: '17', nameEs: 'Innovación social', nameEu: 'Gizarte berrikuntza', IsActive: true, acciones: [] },
    { id: '18', nameEs: 'Capacitación en innovación', nameEu: 'Berrikuntzan gaitzea', IsActive: true, acciones: [] },
    { id: '19', nameEs: 'Investigación', nameEu: 'Ikerketa', IsActive: true, acciones: [] },
    { id: '20', nameEs: 'Transformación Digital', nameEu: 'Eraldaketa digitala', IsActive: true, acciones: [] },
    { id: '21', nameEs: 'Conservación del patrimonio cultural', nameEu: 'Ondare kulturalaren kontserbazioa', IsActive: true, acciones: [] },
    { id: '22', nameEs: 'Divulgación del patrimonio cultural', nameEu: 'Ondare kulturalaren dibulgazioa', IsActive: true, acciones: [] },
    { id: '23', nameEs: 'Promoción del Euskera', nameEu: 'Euskara sustapena', IsActive: true, acciones: [] },
    { id: '24', nameEs: 'Instrumentos de Ordenación del Territorio', nameEu: 'Lurralde antolamendurako tresnak', IsActive: true, acciones: [] },
    { id: '25', nameEs: 'Oferta de vivienda', nameEu: 'Etxebizitza eskaintza', IsActive: true, acciones: [] },
    { id: '26', nameEs: 'Rehabilitación patrimonio inmobiliario', nameEu: 'Ondare higiezinen birgaitzea', IsActive: true, acciones: [] },
    { id: '27', nameEs: 'Reto demográfico', nameEu: 'Erronka demografikoa', IsActive: true, acciones: [] },
    { id: '28', nameEs: 'Participación y atención comunitaria', nameEu: 'Parte-hartzea eta komunitate arreta', IsActive: true, acciones: [] },
    { id: '29', nameEs: 'Igualdad de género', nameEu: 'Genero berdintasuna', IsActive: true, acciones: [] },
    { id: '30', nameEs: 'Juventud', nameEu: 'Gazteria', IsActive: true, acciones: [] },
    { id: '31', nameEs: 'Emprendimiento', nameEu: 'Ekintzailetza', IsActive: true, acciones: [] },
    { id: '32', nameEs: 'Mejorar la competitividad del tejido actual', nameEu: 'Egungo ehunaren lehiakortasuna hobetzea', IsActive: true, acciones: [] },
    { id: '33', nameEs: 'Empleo y Formación', nameEu: 'Enplegua eta prestakuntza', IsActive: true, acciones: [] },
    {
        id: '34',
        nameEs: 'Sectores prioritarios - Cadena de Valor de la Alimentación',
        nameEu: 'Lehentasunezko sektoreak - Elikaduraren balio-katea',
        IsActive: true,
        acciones: [],
    },
    {
        id: '35',
        nameEs: 'Sectores prioritarios - Cadena de Valor de la Madera',
        nameEu: 'Lehentasunezko sektoreak - Egurraren balio-katea',
        IsActive: true,
        acciones: [],
    },
    {
        id: '36',
        nameEs: 'Sectores prioritarios - Turismo, comercio y actividades relacionadas',
        nameEu: 'Lehentasunezko sektoreak - Turismoa, merkataritza eta erlazionatutako jarduerak',
        IsActive: true,
        acciones: [],
    },
    {
        id: '37',
        nameEs: 'Sectores prioritarios - Energía, bioeconomía y ecosistemas',
        nameEu: 'Lehentasunezko sektoreak - Energia, bioekonomia eta ekosistemak',
        IsActive: true,
        acciones: [],
    },
    { id: '38', nameEs: 'Sectores prioritarios - Salud y bienestar', nameEu: 'Lehentasunezko sektoreak - Osasuna eta ongizatea', IsActive: true, acciones: [] },
    {
        id: '39',
        nameEs: 'Infraestructura verde y Espacios Protegidos del Patrimonio Natural',
        nameEu: 'Azpiegitura berdea eta natura ondarearen babestutako guneak',
        IsActive: true,
        acciones: [],
    },
    { id: '40', nameEs: 'Conservación y puesta en valor del patrimonio natural', nameEu: 'Natura ondarearen kontserbazioa eta balioestea', IsActive: true, acciones: [] },
    {
        id: '41',
        nameEs: 'Protección mantenimiento y restauración del suelo agrario y del hábitat rural',
        nameEu: 'Lurzoru agrarioaren eta landa-habitataren babesa, mantentzea eta zaharberritzea',
        IsActive: true,
        acciones: [],
    },
];

export const ejesPrioritariosIniado: Ejes[] = [
    {
        id: '3',
        nameEs: 'Telecomunicaciones',
        nameEu: 'Telekomunikazioak',
        IsActive: true,
        acciones: [
            {
                id: '1',
                accion: 'Organización del X Lautada Eguna, VII Semana del desarrollo rural y apoyo/difusión de otras actividades culturales',
                lineaActuaccion: 'Conocimiento de la Lautada por los propios habitantes',
                ejeEs: 'Telecomunicaciones',
                ejeEu: 'Telekomunikazioak',
                datosPlan: {
                    ejecutora: '1',
                    implicadas: '2',
                    comarcal: '3',
                    supracomarcal: '4',
                    rangoAnios: '5',
                    oAccion: '6',
                    ods: '7',
                    dAccion: '8',
                    presupuesto: '9',
                    iMujHom: '10',
                    uEuskera: '11',
                    sostenibilidad: '12',
                    dInteligent: '13',
                    observaciones: '14',
                },
                datosMemoria: {
                    ejecutora: '1',
                    implicadas: '2',
                    comarcal: '3',
                    supracomarcal: '4',
                    rangoAnios: '5',
                    sActual: 'Actuación en espera',
                    oAccion: '7',
                    ods: '8',
                    dAccionAvances: '9',
                    presupuestoEjecutado: {
                        cuantia: '20',
                        fuenteDeFinanciacion: ['Administraciones locales'],
                        observaciones: 'observacion 1',
                    },
                    ejecucionPresupuestaria: {
                        previsto: '15',
                        ejecutado: '16',
                        porcentaje: '17',
                    },
                    iMujHom: '18',
                    uEuskera: '19',
                    sostenibilidad: '20',
                    dInteligent: '21',
                    observaciones: '22',
                    dSeguimiento: '23',
                    valFinal: '24',
                },
                indicadorAccion: {
                    indicadoreRealizacion: [
                        {
                            id: 4,
                            descripcion: 'RE04. Número de infraestructuras y/o servicios mejorados',
                            metaAnual: {
                                hombres: 10,
                                mujeres: 10,
                                total: 20,
                            },
                            ejecutado: {
                                hombres: 5,
                                mujeres: 10,
                                total: 15,
                            },
                            metaFinal: {
                                hombres: 20,
                                mujeres: 20,
                                total: 40,
                            },
                            hipotesis: 'Se espera un ligero aumento.',
                            idsResultados: [4],
                        },
                        {
                            id: 5,
                            descripcion: 'RE05. Número de personas emprendedoras apoyadas',
                            metaAnual: {
                                hombres: 0,
                                mujeres: 0,
                                total: 100,
                            },
                            ejecutado: {
                                hombres: 0,
                                mujeres: 0,
                                total: 0,
                            },
                            metaFinal: {
                                hombres: 0,
                                mujeres: 0,
                                total: 300,
                            },
                            idsResultados: [5],
                        },
                    ],
                    indicadoreResultado: datosPruebaIndicadoreResultado.map((item) => ({ ...item })),
                    // indicadoreRealizacion: datosPruebaIndicadoreRealizacion,
                    // indicadoreResultado: datosPruebaIndicadoreResultado,
                },
                plurianual: true,
                accionCompartida: '10',
            },
            {
                id: '2',
                accion: 'Apoyo a la comercialización del producto local en circuitos cortos',
                lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
                ejeEs: 'Telecomunicaciones',
                ejeEu: 'Telekomunikazioak',
                datosPlan: {
                    ejecutora: '1',
                    implicadas: '2',
                    comarcal: '3',
                    supracomarcal: '4',
                    rangoAnios: '5',
                    oAccion: '6',
                    ods: '7',
                    dAccion: '8',
                    presupuesto: '9',
                    iMujHom: '10',
                    uEuskera: '11',
                    sostenibilidad: '12',
                    dInteligent: '13',
                    observaciones: '14',
                },
                datosMemoria: {
                    ejecutora: '1',
                    implicadas: '2',
                    comarcal: '3',
                    supracomarcal: '4',
                    rangoAnios: '5',
                    sActual: 'Actuación en espera',
                    oAccion: '7',
                    ods: '8',
                    dAccionAvances: '9',
                    presupuestoEjecutado: {
                        cuantia: '20',
                        fuenteDeFinanciacion: ['Administraciones locales'],
                        observaciones: 'observacion 1',
                    },
                    ejecucionPresupuestaria: {
                        previsto: '15',
                        ejecutado: '16',
                        porcentaje: '17',
                    },
                    iMujHom: '18',
                    uEuskera: '19',
                    sostenibilidad: '20',
                    dInteligent: '21',
                    observaciones: '22',
                    dSeguimiento: '23',
                    valFinal: '24',
                },
                indicadorAccion: {
                    indicadoreRealizacion: [
                        {
                            id: 4,
                            descripcion: 'RE04. Número de infraestructuras y/o servicios mejorados',
                            metaAnual: {
                                hombres: 10,
                                mujeres: 10,
                                total: 20,
                            },
                            ejecutado: {
                                hombres: 5,
                                mujeres: 10,
                                total: 15,
                            },
                            metaFinal: {
                                hombres: 20,
                                mujeres: 20,
                                total: 40,
                            },
                            hipotesis: 'Se espera un ligero aumento.',
                            idsResultados: [4],
                        },
                        {
                            id: 5,
                            descripcion: 'RE05. Número de personas emprendedoras apoyadas',
                            metaAnual: {
                                hombres: 0,
                                mujeres: 0,
                                total: 100,
                            },
                            ejecutado: {
                                hombres: 0,
                                mujeres: 0,
                                total: 0,
                            },
                            metaFinal: {
                                hombres: 0,
                                mujeres: 0,
                                total: 300,
                            },
                            idsResultados: [5],
                        },
                    ],
                    indicadoreResultado: datosPruebaIndicadoreResultado.map((item) => ({ ...item })),
                    // indicadoreRealizacion: datosPruebaIndicadoreRealizacion,
                    // indicadoreResultado: datosPruebaIndicadoreResultado,
                },
                plurianual: false,
            },
        ],
    },
    {
        id: '7',
        nameEs: 'Educación infantil',
        nameEu: 'Haur hezkuntza',
        IsActive: true,
        acciones: [
            {
                id: '1',
                accion: 'Apoyo a la comercialización del producto local en circuitos cortos',
                lineaActuaccion: 'Conocimiento de la Lautada por los propios habitantes',
                ejeEs: 'Telecomunicaciones',
                ejeEu: 'Telekomunikazioak',
                datosPlan: {
                    ejecutora: '1',
                    implicadas: '2',
                    comarcal: '3',
                    supracomarcal: '4',
                    rangoAnios: '5',
                    oAccion: '6',
                    ods: '7',
                    dAccion: '8',
                    presupuesto: '9',
                    iMujHom: '10',
                    uEuskera: '11',
                    sostenibilidad: '12',
                    dInteligent: '13',
                    observaciones: '14',
                },
                datosMemoria: {
                    ejecutora: '1',
                    implicadas: '2',
                    comarcal: '3',
                    supracomarcal: '4',
                    rangoAnios: '5',
                    sActual: 'Actuación en espera',
                    oAccion: '7',
                    ods: '8',
                    dAccionAvances: '9',
                    presupuestoEjecutado: {
                        cuantia: '20',
                        fuenteDeFinanciacion: ['Administraciones locales'],
                        observaciones: 'observacion 1',
                    },
                    ejecucionPresupuestaria: {
                        previsto: '15',
                        ejecutado: '16',
                        porcentaje: '17',
                    },
                    iMujHom: '18',
                    uEuskera: '19',
                    sostenibilidad: '20',
                    dInteligent: '21',
                    observaciones: '22',
                    dSeguimiento: '23',
                    valFinal: '24',
                },
                indicadorAccion: {
                    indicadoreRealizacion: [
                        {
                            id: 4,
                            descripcion: 'RE04. Número de infraestructuras y/o servicios mejorados',
                            metaAnual: {
                                hombres: 10,
                                mujeres: 10,
                                total: 20,
                            },
                            ejecutado: {
                                hombres: 5,
                                mujeres: 10,
                                total: 15,
                            },
                            metaFinal: {
                                hombres: 20,
                                mujeres: 20,
                                total: 40,
                            },
                            hipotesis: 'Se espera un ligero aumento.',
                            idsResultados: [4],
                        },
                        {
                            id: 5,
                            descripcion: 'RE05. Número de personas emprendedoras apoyadas',
                            metaAnual: {
                                hombres: 0,
                                mujeres: 0,
                                total: 100,
                            },
                            ejecutado: {
                                hombres: 0,
                                mujeres: 0,
                                total: 0,
                            },
                            metaFinal: {
                                hombres: 0,
                                mujeres: 0,
                                total: 300,
                            },
                            idsResultados: [5],
                        },
                    ],
                    indicadoreResultado: datosPruebaIndicadoreResultado.map((item) => ({ ...item })),
                    // indicadoreRealizacion: datosPruebaIndicadoreRealizacion,
                    // indicadoreResultado: datosPruebaIndicadoreResultado,
                },
                plurianual: true,
                accionCompartida: '11',
            },
        ],
    },
    {
        id: '16',
        nameEs: 'Ocio',
        nameEu: 'Aisia',
        IsActive: true,
        acciones: [],
    },
];

export const yearIniciado: YearData = {
    year: 2025,
    nombreRegion: 'Durangaldea',
    plan: {
        id: '0',
        status: 'borrador',
        introduccion: `La Ley 7/2022, de 30 de junio, de Desarrollo Rural, determina la elaboración de nuevos instrumentos de planificación que favorezcan la alineación de los proyectos e iniciativas del medio rural con las políticas institucionales a impulsar.
En el caso de los PCDR (Programas Comarcales de Desarrollo Rural), la previsión es que se elaboren a lo largo del ejercicio 2024 como herramientas donde se recojan, para cada comarca y bajo una metodología de trabajo común, los objetivos sectoriales y las líneas de actuación a implementar derivados de los PDT (Programas de Desarrollo Territorial) que incidan de forma prioritaria en cada comarca.
En este contexto, los Planes de Gestión correspondientes al año 2024 se diseñan en base a lo dispuesto en el PDR comarcal 2015-2020, con la finalidad de alcanzar los objetivos que lleven a la comarca hacia la VISION marcada en dicho PDR hasta que los nuevos instrumentos de planificación de referencia estén plenamente desarrollados.
En este documento se recogen las actuaciones que configuran el Plan de Gestión 2024 de la ADR LAUTADA para el desarrollo del PDR Comarcal de LLANADA ALAVESA`,
        ejes: ejesIniado,
        ejesPrioritarios: ejesPrioritariosIniado,
        proceso: `El despliegue de las herramientas para la nueva LDR (Ley de Desarrollo Rural) va a llevar un trabajo constante durante todo el año:
 Participación en el diseño de una metodología común para todas las comarcas de Euskadi  Planificación y elaboración del nuevo PCDR Llanada Alavesa donde la ADR será líder y responsable del proceso de elaboración con la participación “botom-up”. Para ello se realizará un diseño de la metodología y se marcan 3 fases:
o Primer trimestre 2024. Hazi Fundazioa contratará una empresa para la elaboración del diseño y planificación de un PCDR. Las ADRs participarán en este proceso o Segundo trimestre 2024. Capacitación al personal de las ADRs para la elaboración del PCDR o Segundo semestre 2024. Realización PCDR de la Llanada con un proceso participativo  Reuniones de participación y presentación de los PDTs (Programas de Desarrollo Territorial) que serán dos: PDT de diversificación de la actividad económica y PDT de calidad de vida. Las ADRs participarán como organismos y colaboradores de apoyo  Seguir trabajando con GV y DFA en el desarrollo de los nuevos convenios y financiación que se adecúen a las necesidades de la LDR.
 Se continuará con los grupos de trabajo de legumbres, sala de sacrifico de aves, harina y cocina colectiva y con el grupo de cohesión comarcal para el diseño y organización de las ediciones de 2023 del X Lautada Eguna y VII Semana del Desarrollo Rural.`,
        generalOperationADR: {
            adrInternalTasks: `Las tareas internas de gestión que aseguran un adecuado funcionamiento de la ADR son las siguientes:
Elaboración del PG anual y seguimiento de las actuaciones propuestas.
Elaboración de la memoria recapitulativa anual analizando el grado de ejecución de las actuaciones previstas.
Labores propias de la gestión administrativa interna de la asociación: convocatoria de juntas directivas, elaboración de actas y memorias, gestión del presupuesto, etc.
Comunicación de la ADR (difusión de actividades propias, elaboración de notas de prensa, recepción de inscripciones para eventos, redes sociales, ayudas, noticias de interés de la comarca, organización de ruedas de prensa etc.).`,
            operationalIndicators: [
                {
                    id: '0',
                    nameEs: 'Proceso participativo elaboración y metodología del PCDR. Horas Realización de Plan Comarcal Desarrollo Rural (PCDR): Horas',
                    nameEu: 'Parte-hartze prozesuaren prestaketa eta PCDRaren metodologia. Orduak Eskualdeko Landa Garapeneko Plana (PCDR) Ezartzea: Orduak',
                    value: '600',
                    valueAchieved: '200',
                },
                {
                    id: '1',
                    nameEs: `Participación y presentación del Planes Desarrollo Territoriales (PDTs). Horas`,
                    nameEu: `Participación y presentación del Planes Desarrollo Territoriales (PDTs). Horas`,
                    value: '30 horas',
                    valueAchieved: '25 horas',
                },
            ],
        },
    },
    memoria: {
        id: '0',
        status: 'cerrado',
    },
};

export const datosRegion: InitialDataResponse = {
    idRegion: '1',
    data: [
        yearIniciado,
        {
            year: 2026,
            nombreRegion: '',
            plan: {
                id: '',
                status: 'borrador',
                introduccion: '',
                ejes: ejesIniado,
                ejesPrioritarios: [],
                proceso: '',
                generalOperationADR: {
                    adrInternalTasks: '',
                    operationalIndicators: [],
                },
            },
            memoria: {
                id: '',
                status: 'borrador',
            },
        },
    ],
};

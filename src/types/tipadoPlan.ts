import { Estado, Servicios } from './GeneralTypes';
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
    dSeguimiento: string;
    valFinal: string;
}

export interface YearData {
    year: Year;
    nombreRegion: string;
    plan: Plan;
    memoria: Memoria;
    accionesAccesorias?: DatosAccion[];
    servicios?: Servicios[];
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
    // { id: '4', nameEs: 'Red viaria y caminos', nameEu: 'Errepide sarea eta bideak', IsActive: true, acciones: [] },
    // { id: '5', nameEs: 'Accesibilidad', nameEu: 'Irisgarritasuna', IsActive: true, acciones: [] },
    // { id: '6', nameEs: 'Transporte y movilidad', nameEu: 'Garraioa eta mugikortasuna', IsActive: true, acciones: [] },
    { id: '7', nameEs: 'Educación infantil', nameEu: 'Haur hezkuntza', IsActive: true, acciones: [] },
    { id: '8', nameEs: 'Educación obligatoria', nameEu: 'Derrigorrezko hezkuntza', IsActive: true, acciones: [] },
    { id: '9', nameEs: 'Educación superior no obligatoria', nameEu: 'Derrigorrezkoa ez den goi-mailako hezkuntza', IsActive: true, acciones: [] },
    // { id: '10', nameEs: 'Atención sanitaria primaria', nameEu: 'Lehen mailako osasun arreta', IsActive: true, acciones: [] },
    { id: '11', nameEs: 'Atención sanitaria especializada', nameEu: 'Espezializatutako osasun arreta', IsActive: true, acciones: [] },
    { id: '12', nameEs: 'Atención farmacéutica', nameEu: 'Farmazia arreta', IsActive: true, acciones: [] },
    { id: '13', nameEs: 'Atención social', nameEu: 'Gizarte arreta', IsActive: true, acciones: [] },
    { id: '14', nameEs: 'Cultura', nameEu: 'Kultura', IsActive: true, acciones: [] },
    { id: '15', nameEs: 'Deporte', nameEu: 'Kirola', IsActive: true, acciones: [] },
    { id: '16', nameEs: 'Ocio', nameEu: 'Aisia', IsActive: true, acciones: [] },
    // { id: '17', nameEs: 'Innovación social', nameEu: 'Gizarte berrikuntza', IsActive: true, acciones: [] },
    // { id: '18', nameEs: 'Capacitación en innovación', nameEu: 'Berrikuntzan gaitzea', IsActive: true, acciones: [] },
    // { id: '19', nameEs: 'Investigación', nameEu: 'Ikerketa', IsActive: true, acciones: [] },
    // { id: '20', nameEs: 'Transformación Digital', nameEu: 'Eraldaketa digitala', IsActive: true, acciones: [] },
    // { id: '21', nameEs: 'Conservación del patrimonio cultural', nameEu: 'Ondare kulturalaren kontserbazioa', IsActive: true, acciones: [] },
    // { id: '22', nameEs: 'Divulgación del patrimonio cultural', nameEu: 'Ondare kulturalaren dibulgazioa', IsActive: true, acciones: [] },
    // { id: '23', nameEs: 'Promoción del Euskera', nameEu: 'Euskara sustapena', IsActive: true, acciones: [] },
    // { id: '24', nameEs: 'Instrumentos de Ordenación del Territorio', nameEu: 'Lurralde antolamendurako tresnak', IsActive: true, acciones: [] },
    // { id: '25', nameEs: 'Oferta de vivienda', nameEu: 'Etxebizitza eskaintza', IsActive: true, acciones: [] },
    // { id: '26', nameEs: 'Rehabilitación patrimonio inmobiliario', nameEu: 'Ondare higiezinen birgaitzea', IsActive: true, acciones: [] },
    // { id: '27', nameEs: 'Reto demográfico', nameEu: 'Erronka demografikoa', IsActive: true, acciones: [] },
    // { id: '28', nameEs: 'Participación y atención comunitaria', nameEu: 'Parte-hartzea eta komunitate arreta', IsActive: true, acciones: [] },
    // { id: '29', nameEs: 'Igualdad de género', nameEu: 'Genero berdintasuna', IsActive: true, acciones: [] },
    // { id: '30', nameEs: 'Juventud', nameEu: 'Gazteria', IsActive: true, acciones: [] },
    // { id: '31', nameEs: 'Emprendimiento', nameEu: 'Ekintzailetza', IsActive: true, acciones: [] },
    // { id: '32', nameEs: 'Mejorar la competitividad del tejido actual', nameEu: 'Egungo ehunaren lehiakortasuna hobetzea', IsActive: true, acciones: [] },
    // { id: '33', nameEs: 'Empleo y Formación', nameEu: 'Enplegua eta prestakuntza', IsActive: true, acciones: [] },
    // {
    //     id: '34',
    //     nameEs: 'Sectores prioritarios - Cadena de Valor de la Alimentación',
    //     nameEu: 'Lehentasunezko sektoreak - Elikaduraren balio-katea',
    //     IsActive: true,
    //     acciones: [],
    // },
    // {
    //     id: '35',
    //     nameEs: 'Sectores prioritarios - Cadena de Valor de la Madera',
    //     nameEu: 'Lehentasunezko sektoreak - Egurraren balio-katea',
    //     IsActive: true,
    //     acciones: [],
    // },
    // {
    //     id: '36',
    //     nameEs: 'Sectores prioritarios - Turismo, comercio y actividades relacionadas',
    //     nameEu: 'Lehentasunezko sektoreak - Turismoa, merkataritza eta erlazionatutako jarduerak',
    //     IsActive: true,
    //     acciones: [],
    // },
    // {
    //     id: '37',
    //     nameEs: 'Sectores prioritarios - Energía, bioeconomía y ecosistemas',
    //     nameEu: 'Lehentasunezko sektoreak - Energia, bioekonomia eta ekosistemak',
    //     IsActive: true,
    //     acciones: [],
    // },
    // { id: '38', nameEs: 'Sectores prioritarios - Salud y bienestar', nameEu: 'Lehentasunezko sektoreak - Osasuna eta ongizatea', IsActive: true, acciones: [] },
    // {
    //     id: '39',
    //     nameEs: 'Infraestructura verde y Espacios Protegidos del Patrimonio Natural',
    //     nameEu: 'Azpiegitura berdea eta natura ondarearen babestutako guneak',
    //     IsActive: true,
    //     acciones: [],
    // },
    // { id: '40', nameEs: 'Conservación y puesta en valor del patrimonio natural', nameEu: 'Natura ondarearen kontserbazioa eta balioestea', IsActive: true, acciones: [] },
    // {
    //     id: '41',
    //     nameEs: 'Protección mantenimiento y restauración del suelo agrario y del hábitat rural',
    //     nameEu: 'Lurzoru agrarioaren eta landa-habitataren babesa, mantentzea eta zaharberritzea',
    //     IsActive: true,
    //     acciones: [],
    // },
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
                    ejecutora: 'Durangaldea',
                    implicadas: 'Durangaldea',
                    comarcal: 'Municipios con todas las zonas rurales',
                    supracomarcal: 'Euskadi',
                    rangoAnios: '',
                    oAccion: `Objetivos generales: fomentar el dinamismo social y sentimiento de pertenencia a la comarca.
Objetivos específicos: mejorar la comunicación y conexión intracomarcal.`,
                    ods: 'Ninguno',
                    dAccion: `- Se mantiene la X Semana de Desarrollo Rural con el formato de 4 actividades compaginando las culturales-recreativas y las concernientes a temas de interés socio-económico.
- La semana de Desarrollo Rural se organiza por una comisión abierta a la participación de quien desee, habitualmente toman parte representantes del Ayuntamiento de celebración y del concejo en su caso, las personas técnicas de cultura, la técnica de turismo y la de ACICSA.
- La semana se iniciará con el encuentro de igualdad de la comarca.
- Se mantiene el carácter rotatorio del lugar de celebración y la fecha de celebración del X Lautada Eguna el último domingo de octubre, este año se celebrará en Barrundia el 27 de octubre.
- Acordar la financiación de Lautada Astea y Eguna con la Cuadrilla de la Llanada.
- Búsqueda de ayudas para ello: Fundación Vital, Eventos,`,
                    presupuesto: `El presupuesto es de 6.000€ más las actuaciones que se gestionan mediante Hazi Fundazioa,Turismo y ACICSA.
Se trabajará la financiación 2023 para Lautada Eguna y Lautada Astea conjuntamente para que sea:
33% 2.000€ Fundación Vital, 33% 2.000€ Cuadrilla de la Llanada Alavesa y 2.000€ Subvención de Eventos de G.Vasco solicitado por la Cuadrilla.`,
                    iMujHom: '',
                    uEuskera: '',
                    sostenibilidad: '',
                    dInteligent: '',
                    observaciones: '',
                },
                datosMemoria: {
                    ejecutora: '1',
                    implicadas: '2',
                    comarcal: '3',
                    supracomarcal: '4',
                    rangoAnios: '5',
                    sActual: 'Actuación en espera',
                    oAccion: `-Mantener y rejuvenecer la población del medio rural.
-Aumentar la rentabilidad de las explotaciones.
-Incrementar el número de personas formadas y motivación a la formación.
Helburu zehatzak / Objetivos específicos:`,
                    ods: 'Ninguno',
                    dAccionAvances: `-Diversificar el sector impulsando nuevos productos y la transformación agroalimentaria.
-Favorecer nuevas incorporaciones y rejuvenecer el sector primario.
-Facilitar la formación y el acceso a infraestructuras y equipos productivos compartidos/colectivos.`,
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
                    dSeguimiento: `10/11/2023 Visita técnica a Pedroso (Puesta en valor de la nuez y Denominación de Origen)
29/11/2023 Visita a secadero de frutos secos de Rivabellosa con personas interesadas`,
                    valFinal: `En 2023 no se han realizado sesiones formativas relacionadas con este ámbito.`,
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
                accionCompartida: {
                    regionLider: {
                        RegionId: 10,
                        NameEs: 'Durangaldea',
                        NameEu: 'Durangaldea',
                    },
                    regiones: [
                        {
                            RegionId: 2,
                            NameEs: 'Arabako Lautada / Llanada Alavesa',
                            NameEu: 'Arabako Lautada',
                        },
                        {
                            RegionId: 3,
                            NameEs: 'Montaña Alavesa / Arabako Mendialdea',
                            NameEu: 'Montaña Alavesa / Arabako Mendialdea',
                        },
                        {
                            RegionId: 5,
                            NameEs: 'Estribaciones del Gorbea / Gorbeia Inguruak',
                            NameEu: 'Estribaciones del Gorbea / Gorbeia Inguruak',
                        },
                        {
                            RegionId: 6,
                            NameEs: 'Tolosaldea',
                            NameEu: 'Tolosaldea',
                        },
                        {
                            RegionId: 7,
                            NameEs: 'Urola Kosta',
                            NameEu: 'Urola Kosta',
                        },
                        {
                            RegionId: 8,
                            NameEs: 'Debabarrena',
                            NameEu: 'Debabarrena',
                        },
                        {
                            RegionId: 9,
                            NameEs: 'Debagoiena',
                            NameEu: 'Debagoiena',
                        },
                        {
                            RegionId: 11,
                            NameEs: 'Goierri',
                            NameEu: 'Goierri',
                        },
                        {
                            RegionId: 13,
                            NameEs: 'Busturialdea',
                            NameEu: 'Busturialdea',
                        },
                        {
                            RegionId: 14,
                            NameEs: 'Vitoria-Gasteiz',
                            NameEu: 'Vitoria-Gasteiz',
                        },
                        {
                            RegionId: 15,
                            NameEs: 'Arratia-Nerbioi',
                            NameEu: 'Arratia-Nerbioi',
                        },
                        {
                            RegionId: 16,
                            NameEs: 'Donostialdea-Bidasoa',
                            NameEu: 'Donostialdea-Bidasoa',
                        },
                        {
                            RegionId: 18,
                            NameEs: 'Lea-Artibai',
                            NameEu: 'Lea-Artibai',
                        },
                        {
                            RegionId: 19,
                            NameEs: 'Uribe',
                            NameEu: 'Uribe',
                        },
                    ],
                },
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
                    comarcal: 'Todas las entidades rurales de la comarca',
                    supracomarcal: 'No',
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
                    comarcal: 'Zonas de especial atención',
                    supracomarcal: 'Euskadi',
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
                accionCompartida: {
                    regionLider: {
                        RegionId: 11,
                        NameEs: 'Goierri',
                        NameEu: 'Goierri',
                    },
                    regiones: [
                        {
                            RegionId: 1,
                            NameEs: 'Añana',
                            NameEu: 'Añana',
                        },
                        {
                            RegionId: 4,
                            NameEs: 'Rioja Alavesa / Arabako Errioxa',
                            NameEu: 'Rioja Alavesa / Arabako Errioxa',
                        },
                        {
                            RegionId: 10,
                            NameEs: 'Durangaldea',
                            NameEu: 'Durangaldea',
                        },
                        {
                            RegionId: 12,
                            NameEs: 'Aiaraldea',
                            NameEu: 'Aiaraldea',
                        },
                        {
                            RegionId: 17,
                            NameEs: 'Enkarterri-Ezkerraldea',
                            NameEu: 'Enkarterri-Ezkerraldea',
                        },
                    ],
                },
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
        status: 'aceptado',
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
        status: 'proceso',
        dSeguimiento: `10/11/2023 Visita técnica a Pedroso (Puesta en valor de la nuez y Denominación de Origen)
29/11/2023 Visita a secadero de frutos secos de Rivabellosa con personas interesadas`,
        valFinal: `En 2023 no se han realizado sesiones formativas relacionadas con este ámbito.`,
    },
    accionesAccesorias: [
        {
            id: '1',
            accion: 'Prueba1',
            lineaActuaccion: 'lineaActuaccion1',
            ejeEs: 'Educación infantil',
            ejeEu: 'Educación infantil',
            ejeId: '7',
            datosPlan: {
                ejecutora: '1',
                implicadas: '2',
                comarcal: 'Sin tratamiento territorial comarcal',
                supracomarcal: 'Sin tratamiento territorial supracomarcal',
                rangoAnios: '10-22',
                oAccion: `Objetivos generales`,
                ods: 'Ninguno',
                dAccion: `dAccion`,
                presupuesto: `presupuesto`,
                iMujHom: '',
                uEuskera: '',
                sostenibilidad: '',
                dInteligent: '',
                observaciones: '',
            },
            datosMemoria: {
                ejecutora: '1',
                implicadas: '2',
                comarcal: '3',
                supracomarcal: '4',
                rangoAnios: '5',
                sActual: 'Actuación finalizada',
                oAccion: `oAccion`,
                ods: 'Ninguno',
                dAccionAvances: `dAccionAvances`,
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
                dSeguimiento: `dSeguimiento`,
                valFinal: `valFinal`,
            },
            indicadorAccion: {
                indicadoreRealizacion: [
                    {
                        id: 4,
                        descripcion: 'RE04. Número de infraestructuras y/o servicios mejorados',
                        metaAnual: {
                            hombres: 1,
                            mujeres: 1,
                            total: 2,
                        },
                        ejecutado: {
                            hombres: 800,
                            mujeres: 800,
                            total: 1600,
                        },
                        metaFinal: {
                            hombres: 20000,
                            mujeres: 20000,
                            total: 40000,
                        },
                        hipotesis: 'Se espera un ligero aumento.',
                        idsResultados: [4],
                    },
                ],
                indicadoreResultado: datosPruebaIndicadoreResultado.map((item) => ({ ...item })),
            },
            plurianual: false,
        },
        {
            id: '2',
            accion: 'Apoyo a la comercialización del producto local en circuitos cortos',
            lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
            ejeEs: 'Telecomunicaciones',
            ejeEu: 'Telekomunikazioak',
            ejeId: '3',
            datosPlan: {
                ejecutora: '1',
                implicadas: '2',
                comarcal: 'Todas las entidades rurales de la comarca',
                supracomarcal: 'No',
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
        {
            id: '3',
            accion: 'Apoyo a la comercialización del producto local en circuitos cortos',
            lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
            ejeEs: 'Telecomunicaciones',
            ejeEu: 'Telekomunikazioak',
            ejeId: '3',
            datosPlan: {
                ejecutora: '1',
                implicadas: '2',
                comarcal: 'Todas las entidades rurales de la comarca',
                supracomarcal: 'No',
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
        {
            id: '4',
            accion: 'Apoyo a la comercialización del producto local en circuitos cortos',
            lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
            ejeEs: 'Telecomunicaciones',
            ejeEu: 'Telekomunikazioak',
            ejeId: '3',
            datosPlan: {
                ejecutora: '1',
                implicadas: '2',
                comarcal: 'Todas las entidades rurales de la comarca',
                supracomarcal: 'No',
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
        {
            id: '5',
            accion: 'Apoyo a la comercialización del producto local en circuitos cortos',
            lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
            ejeEs: 'Telecomunicaciones',
            ejeEu: 'Telekomunikazioak',
            ejeId: '3',
            datosPlan: {
                ejecutora: '1',
                implicadas: '2',
                comarcal: 'Todas las entidades rurales de la comarca',
                supracomarcal: 'No',
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
        {
            id: '6',
            accion: 'Apoyo a la comercialización del producto local en circuitos cortos',
            lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
            ejeEs: 'Telecomunicaciones',
            ejeEu: 'Telekomunikazioak',
            ejeId: '3',
            datosPlan: {
                ejecutora: '1',
                implicadas: '2',
                comarcal: 'Todas las entidades rurales de la comarca',
                supracomarcal: 'No',
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
        {
            id: '7',
            accion: 'Apoyo a la comercialización del producto local en circuitos cortos',
            lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
            ejeEs: 'Telecomunicaciones',
            ejeEu: 'Telekomunikazioak',
            ejeId: '3',
            datosPlan: {
                ejecutora: '1',
                implicadas: '2',
                comarcal: 'Todas las entidades rurales de la comarca',
                supracomarcal: 'No',
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
        {
            id: '8',
            accion: 'Apoyo a la comercialización del producto local en circuitos cortos',
            lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
            ejeEs: 'Telecomunicaciones',
            ejeEu: 'Telekomunikazioak',
            ejeId: '3',
            datosPlan: {
                ejecutora: '1',
                implicadas: '2',
                comarcal: 'Todas las entidades rurales de la comarca',
                supracomarcal: 'No',
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
        {
            id: '9',
            accion: 'Apoyo a la comercialización del producto local en circuitos cortos',
            lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
            ejeEs: 'Telecomunicaciones',
            ejeEu: 'Telekomunikazioak',
            ejeId: '3',
            datosPlan: {
                ejecutora: '1',
                implicadas: '2',
                comarcal: 'Todas las entidades rurales de la comarca',
                supracomarcal: 'No',
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
        {
            id: '10',
            accion: 'Apoyo a la comercialización del producto local en circuitos cortos',
            lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
            ejeEs: 'Telecomunicaciones',
            ejeEu: 'Telekomunikazioak',
            ejeId: '3',
            datosPlan: {
                ejecutora: '1',
                implicadas: '2',
                comarcal: 'Todas las entidades rurales de la comarca',
                supracomarcal: 'No',
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
    servicios: [
        {
            id: 1,
            nombre: 'Liderar la realización y el despliegue del nuevo PROGRAMA COMARCAL DE DESARROLLO RURAL (PCDR).',
            descripcion: `TAREAS INTERNAS:
En las tareas internas generales se realiza: elaboración del plan de gestión y presupuestos anuales y seguimiento de los mismos; elaboración de cuentas y memoria anuales; encuentros con otras áreas de la Cuadrilla; coordinación de la participación de la asociación y gestión de la información de la misma; trámites administrativos (pagos de nóminas, facturas, actas, escritos, certificaciones, etc…);
Juntas Directivas y Asambleas Generales o Extraordinarias; atención al público (presencial,teléfono, mail, etc…); solicitud y firma de convenios con Gobierno Vasco, Diputación Foral de Álava y Cuadrilla de Llanada Alavesa y su justificación (parciales y final); prevención de riesgos laborales; gestiones y consultas laborales y fiscales con la gestoría. Gestión del cobro de las aportaciones de los ayuntamientos. Análisis de convocatorias de ayudas (ferias de DFA, cooperación, eventos de G.V.) y colaboración de otros agentes para actividades concretas (tríptico y actividades semana desarrollo rural, identificativo para producto local, etc…).`,
            indicadores: [
                {
                    indicador: 'Tareas Internas ADR. Horas',
                    previsto: {
                        valor: '500 horas',
                    },
                    alcanzado: {
                        valor: '',
                    },
                },
                {
                    indicador: `Cursos y Jornadas de Formación
Nº y horas`,
                    previsto: {
                        valor: `4 cursos
80 horas`,
                    },
                    alcanzado: {
                        valor: '',
                    },
                },
            ],
        },
    ],
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
                dSeguimiento: `10/11/2023 Visita técnica a Pedroso (Puesta en valor de la nuez y Denominación de Origen)
29/11/2023 Visita a secadero de frutos secos de Rivabellosa con personas interesadas`,
                valFinal: `En 2023 no se han realizado sesiones formativas relacionadas con este ámbito.`,
            },
        },
        {
            year: 2027,
            nombreRegion: '',
            plan: {
                id: '',
                status: 'borrador',
                introduccion: '',
                ejes: ejesIniado,
                ejesPrioritarios: [
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
                                    ejecutora: 'Durangaldea',
                                    implicadas: 'Durangaldea',
                                    comarcal: 'Municipios con todas las zonas rurales',
                                    supracomarcal: 'Euskadi',
                                    rangoAnios: '',
                                    oAccion: `Objetivos generales: fomentar el dinamismo social y sentimiento de pertenencia a la comarca.
Objetivos específicos: mejorar la comunicación y conexión intracomarcal.`,
                                    ods: 'Ninguno',
                                    dAccion: `- Se mantiene la X Semana de Desarrollo Rural con el formato de 4 actividades compaginando las culturales-recreativas y las concernientes a temas de interés socio-económico.
- La semana de Desarrollo Rural se organiza por una comisión abierta a la participación de quien desee, habitualmente toman parte representantes del Ayuntamiento de celebración y del concejo en su caso, las personas técnicas de cultura, la técnica de turismo y la de ACICSA.
- La semana se iniciará con el encuentro de igualdad de la comarca.
- Se mantiene el carácter rotatorio del lugar de celebración y la fecha de celebración del X Lautada Eguna el último domingo de octubre, este año se celebrará en Barrundia el 27 de octubre.
- Acordar la financiación de Lautada Astea y Eguna con la Cuadrilla de la Llanada.
- Búsqueda de ayudas para ello: Fundación Vital, Eventos,`,
                                    presupuesto: `El presupuesto es de 6.000€ más las actuaciones que se gestionan mediante Hazi Fundazioa,Turismo y ACICSA.
Se trabajará la financiación 2023 para Lautada Eguna y Lautada Astea conjuntamente para que sea:
33% 2.000€ Fundación Vital, 33% 2.000€ Cuadrilla de la Llanada Alavesa y 2.000€ Subvención de Eventos de G.Vasco solicitado por la Cuadrilla.`,
                                    iMujHom: '',
                                    uEuskera: '',
                                    sostenibilidad: '',
                                    dInteligent: '',
                                    observaciones: '',
                                },
                                datosMemoria: {
                                    ejecutora: '1',
                                    implicadas: '2',
                                    comarcal: '3',
                                    supracomarcal: '4',
                                    rangoAnios: '5',
                                    sActual: 'Actuación en espera',
                                    oAccion: `-Mantener y rejuvenecer la población del medio rural.
-Aumentar la rentabilidad de las explotaciones.
-Incrementar el número de personas formadas y motivación a la formación.
Helburu zehatzak / Objetivos específicos:`,
                                    ods: 'Ninguno',
                                    dAccionAvances: `-Diversificar el sector impulsando nuevos productos y la transformación agroalimentaria.
-Favorecer nuevas incorporaciones y rejuvenecer el sector primario.
-Facilitar la formación y el acceso a infraestructuras y equipos productivos compartidos/colectivos.`,
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
                                    dSeguimiento: `10/11/2023 Visita técnica a Pedroso (Puesta en valor de la nuez y Denominación de Origen)
29/11/2023 Visita a secadero de frutos secos de Rivabellosa con personas interesadas`,
                                    valFinal: `En 2023 no se han realizado sesiones formativas relacionadas con este ámbito.`,
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
                                },
                                plurianual: false,
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
                                    comarcal: 'Todas las entidades rurales de la comarca',
                                    supracomarcal: 'No',
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
                ],
                proceso: '',
                generalOperationADR: {
                    adrInternalTasks: '',
                    operationalIndicators: [],
                },
            },
            memoria: {
                id: '',
                status: 'borrador',
                dSeguimiento: `10/11/2023 Visita técnica a Pedroso (Puesta en valor de la nuez y Denominación de Origen)
29/11/2023 Visita a secadero de frutos secos de Rivabellosa con personas interesadas`,
                valFinal: `En 2023 no se han realizado sesiones formativas relacionadas con este ámbito.`,
            },
        },
    ],
};

export const servicioIniciadoVacio: Servicios = {
    id: 0,
    nombre: '',
    descripcion: ``,
    indicadores: [
        {
            indicador: '',
            previsto: {
                valor: '',
            },
            alcanzado: {
                valor: '',
            },
        },
    ],
};

import { datosPruebaIndicadoreRealizacion, datosPruebaIndicadoreResultado } from './Indicadores';
import { DatosAccion } from './TipadoAccion';
export type Year = number;

export interface OperationalIndicators {
    id: string;
    value: string;
    nameEs: string;
    nameEu: string;
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
    process: string;
    adrInternalTasks: string;
    operationalIndicators: OperationalIndicators[];
}
export interface Memoria {
    id: string;
}

export interface YearData {
    year: Year;
    nombreRegion: string;
    plan: Plan;
    memoria: Memoria;
}

export interface InitialDataResponse {
    data: YearData[];
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
                        total: '10',
                        autofinanciacion: '11',
                        financiacionPublica: '12',
                        origenPublica: '13',
                        financiacionPrivada: '14',
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
                    indicadoreRealizacion: datosPruebaIndicadoreRealizacion,
                    indicadoreResultado: datosPruebaIndicadoreResultado,
                    // indicadoreRealizacion: datosPruebaIndicadoreRealizacion,
                    // indicadoreResultado: datosPruebaIndicadoreResultado,
                },
                plurianual: true,
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
                        total: '10',
                        autofinanciacion: '11',
                        financiacionPublica: '12',
                        origenPublica: '13',
                        financiacionPrivada: '14',
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
                    indicadoreRealizacion: datosPruebaIndicadoreRealizacion,
                    indicadoreResultado: datosPruebaIndicadoreResultado,
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
                        total: '10',
                        autofinanciacion: '11',
                        financiacionPublica: '12',
                        origenPublica: '13',
                        financiacionPrivada: '14',
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
                    indicadoreRealizacion: datosPruebaIndicadoreRealizacion,
                    indicadoreResultado: datosPruebaIndicadoreResultado,
                    // indicadoreRealizacion: datosPruebaIndicadoreRealizacion,
                    // indicadoreResultado: datosPruebaIndicadoreResultado,
                },
                plurianual: false,
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
    year: 2026,
    nombreRegion: 'Durangaldea',
    plan: {
        id: '0',
        introduccion: 'introduccion',
        ejes: ejesIniado,
        ejesPrioritarios: ejesPrioritariosIniado,
        process: 'process',
        adrInternalTasks: 'adrInternalTasks',
        operationalIndicators: [{ id: '0', nameEs: 'Inidicador0', nameEu: 'IndicadorEu0', value: 'Valor' }],
    },
    memoria: {
        id: '0',
    },
};

import { Region } from '../components/Utils/gets/getRegiones';
import { Comarcal, SupraComarcal } from './GeneralTypes';
import { IndicadorRealizacionAccion, IndicadorResultadoAccion } from './Indicadores';

export type EstadoLabel = 'Actuación en ejecución' | 'Actuación en espera' | 'Actuación finalizada' | 'Actuación abandonada';
export const FUENTES_FINANCIACION: FuenteFinanciacion[] = ['Gobierno Vasco', 'DDFF', 'Administraciones locales', 'Fuentes Privadas', 'Autofinanciación', 'Otros'];
export type FuenteFinanciacion = 'Gobierno Vasco' | 'DDFF' | 'Administraciones locales' | 'Fuentes Privadas' | 'Autofinanciación' | 'Otros' | '';
export interface PresupuestoEjecutado {
    cuantia: string;
    fuenteDeFinanciacion: FuenteFinanciacion[];
    observaciones: string;
}

export interface EjecucionPresupuestaria {
    previsto: string;
    ejecutado: string;
    porcentaje: string;
}

export interface DatosPlan {
    ejecutora: string;
    implicadas: string;
    comarcal: Comarcal;
    supracomarcal: SupraComarcal;
    rangoAnios: string;
    oAccion: string;
    ods: string;
    dAccion: string;
    presupuesto: string;
    iMujHom: string;
    uEuskera: string;
    sostenibilidad: string;
    dInteligent: string;
    observaciones: string;
}

export interface DatosMemoria {
    ejecutora: string;
    implicadas: string;
    comarcal: string;
    supracomarcal: string;
    rangoAnios: string;
    sActual: EstadoLabel;
    oAccion: string;
    ods: string;
    dAccionAvances: string;
    presupuestoEjecutado: PresupuestoEjecutado;
    ejecucionPresupuestaria: EjecucionPresupuestaria;
    iMujHom: string;
    uEuskera: string;
    sostenibilidad: string;
    dInteligent: string;
    observaciones: string;
    dSeguimiento: string;
    valFinal: string;
}

export interface AccionCompartida {
    regionLider: Region;
    regiones: Region[];
}
export interface DatosAccion {
    id: string;
    accion: string;
    ejeEs?: string;
    ejeEu?: string;
    lineaActuaccion: string;
    datosPlan?: DatosPlan;
    datosMemoria?: DatosMemoria;
    indicadorAccion?: {
        indicadoreRealizacion: IndicadorRealizacionAccion[];
        indicadoreResultado: IndicadorResultadoAccion[];
    };
    plurianual: boolean;
    accionCompartida?: AccionCompartida;
}

export const datosInicializadosAccion: DatosAccion = {
    id: '0',
    accion: '',
    ejeEs: '',
    ejeEu: '',
    lineaActuaccion: '',
    datosPlan: {
        ejecutora: '',
        implicadas: '',
        comarcal: 'No',
        supracomarcal: 'No',
        rangoAnios: '',
        oAccion: '',
        ods: '',
        dAccion: '',
        presupuesto: '',
        iMujHom: '',
        uEuskera: '',
        sostenibilidad: '',
        dInteligent: '',
        observaciones: '',
    },
    datosMemoria: {
        ejecutora: '',
        implicadas: '',
        comarcal: '',
        supracomarcal: '',
        rangoAnios: '',
        sActual: 'Actuación en ejecución',
        oAccion: '',
        ods: '',
        dAccionAvances: '',
        presupuestoEjecutado: {
            cuantia: '',
            fuenteDeFinanciacion: [''],
            observaciones: '',
        },
        ejecucionPresupuestaria: {
            previsto: '',
            ejecutado: '',
            porcentaje: '',
        },
        iMujHom: '',
        uEuskera: '',
        sostenibilidad: '',
        dInteligent: '',
        observaciones: '',
        dSeguimiento: '',
        valFinal: '',
    },
    indicadorAccion: {
        indicadoreRealizacion: [],
        indicadoreResultado: [],
    },
    plurianual: false,
};

export const datosPlan: DatosPlan = {
    ejecutora: '',
    implicadas: '',
    comarcal: 'No',
    supracomarcal: 'No',
    rangoAnios: '',
    oAccion: '',
    ods: '',
    dAccion: '',
    presupuesto: '',
    iMujHom: '',
    uEuskera: '',
    sostenibilidad: '',
    dInteligent: '',
    observaciones: '',
};

export const datosMemoria: DatosMemoria = {
    ejecutora: '',
    implicadas: '',
    comarcal: '',
    supracomarcal: '',
    rangoAnios: '',
    sActual: 'Actuación en ejecución',
    oAccion: '',
    ods: '',
    dAccionAvances: '',
    presupuestoEjecutado: {
        cuantia: '',
        fuenteDeFinanciacion: [''],
        observaciones: '',
    },
    ejecucionPresupuestaria: {
        previsto: '',
        ejecutado: '',
        porcentaje: '',
    },
    iMujHom: '',
    uEuskera: '',
    sostenibilidad: '',
    dInteligent: '',
    observaciones: '',
    dSeguimiento: '',
    valFinal: '',
};

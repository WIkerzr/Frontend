import { RegionInterface } from '../components/Utils/data/getRegiones';
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
    id: string;
    ejecutora: string;
    implicadas: string;
    comarcal: Comarcal | string;
    supracomarcal: SupraComarcal | string;
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
    id: string;
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
    regionLider: RegionInterface;
    regiones: RegionInterface[];
}
export interface DatosAccion {
    id: string;
    accion: string;
    ejeEs?: string;
    ejeEu?: string;
    ejeId?: string;
    DatosPlanId?: string;
    DatosMemoriaId?: string;
    lineaActuaccion: string;
    datosPlan?: DatosPlan;
    datosMemoria?: DatosMemoria | DatosMemoriaBackF;
    indicadorAccion?: {
        indicadoreRealizacion: IndicadorRealizacionAccion[];
        indicadoreResultado: IndicadorResultadoAccion[];
    };
    plurianual: boolean;
    accionCompartida?: AccionCompartida;
    accionCompartidaid?: number;
    camposFaltantes?: string;
}

export const datosInicializadosAccion: DatosAccion = {
    id: '0',
    accion: '',
    ejeEs: '',
    ejeEu: '',
    lineaActuaccion: '',
    datosPlan: {
        id: '0',
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
        id: '0',
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

export const datosPlanInicializada: DatosPlan = {
    id: '0',
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

export const datosMemoriaInicializada: DatosMemoria = {
    id: '0',
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

export interface DatosPlanBack {
    Id: string;
    Ejecutora: string;
    Implicadas: string;
    Comarcal: Comarcal | string;
    Supracomarcal: SupraComarcal | string;
    RangoAnios: string;
    OAccion: string;
    Ods: string;
    DAccion: string;
    Presupuesto: string;
    IMujHom: string;
    UEuskera: string;
    Sostenibilidad: string;
    DInteligent: string;
    Observaciones: string;
}

export interface DatosMemoriaBackF {
    id: string;
    sActual: EstadoLabel;
    dAccionAvances: string;
    presupuestoEjecutado: PresupuestoEjecutado;
    ejecucionPresupuestaria: EjecucionPresupuestaria;
    observaciones: string;
    dSeguimiento: string;
    valFinal: string;
}
export interface DatosMemoriaBack {
    Id: string;
    SActual: EstadoLabel;
    DAccionAvances: string;
    PresupuestoEjecutado_cuantia: string;
    PresupuestoEjecutado_fuenteDeFinanciacion: string;
    PresupuestoEjecutado_observaciones: string;
    EjecucionPresupuestaria_previsto: string;
    EjecucionPresupuestaria_ejecutado: string;
    EjecucionPresupuestaria_porcentaje: string;
    Observaciones: string;
    DSeguimiento: string;
    ValFinal: string;
}

export interface DatosAccionDTO {
    Id: number;
    Nombre: string;
    LineaActuaccion: string;
    Plurianual?: boolean;
    DatosPlanId?: number;
    DatosPlan?: DatosPlanDTO;
    DatosMemoriaId?: number;
    DatosMemoria?: DatosMemoriaDTO;
    AccionCompartidaId?: number;
    AccionCompartida?: AccionCompartidaDTO;
    IndicadorRealizacionAcciones?: IndicadorRealizacionAccionDTO[];
    IndicadorResultadoAcciones?: IndicadorResultadoAccionDTO[];
}
export interface DatosPlanDTO {
    Id: number;
    Ejecutora?: string;
    Implicadas?: string;
    Comarcal?: string;
    Supracomarcal?: string;
    RangoAnios?: string;
    OAccion?: string;
    Ods?: string;
    DAccion?: string;
    Presupuesto?: string;
    IMujHom?: string;
    UEuskera?: string;
    Sostenibilidad?: string;
    DInteligent?: string;
    Observaciones?: string;
}

export interface DatosMemoriaDTO {
    Id: number;
    SActual?: string;
    DAccionAvances?: string;
    PresupuestoEjecutado_Cuantia?: string;
    PresupuestoEjecutado_FuenteDeFinanciacion?: string;
    PresupuestoEjecutado_Observaciones?: string;
    EjecucionPresupuestaria_Previsto?: string;
    EjecucionPresupuestaria_Ejecutado?: string;
    EjecucionPresupuestaria_Porcentaje?: string;
    Observaciones?: string;
    DSeguimiento?: string;
    ValFinal?: string;
}

export interface AccionCompartidaDTO {
    Id: number;
    RegionLiderId?: number;
}

export interface IndicadorRealizacionAccionDTO {
    IndicadorRealizacionId: number;
    DatosAccionId: number;
    Hipotesis?: string;
    MetaAnual_Hombre?: string;
    MetaAnual_Mujer?: string;
    MetaAnual_Total?: string;
    Ejecutado_Hombre?: string;
    Ejecutado_Mujer?: string;
    Ejecutado_Total?: string;
    MetaFinal_Hombre?: string;
    MetaFinal_Mujer?: string;
    MetaFinal_Total?: string;
    IdsResultados?: string;
}

export interface IndicadorResultadoAccionDTO {
    IndicadorResultadoId: number;
    DatosAccionId: number;
    Hipotesis?: string;
    MetaAnual_Hombre?: string;
    MetaAnual_Mujer?: string;
    MetaAnual_Total?: string;
    Ejecutado_Hombre?: string;
    Ejecutado_Mujer?: string;
    Ejecutado_Total?: string;
    MetaFinal_Hombre?: string;
    MetaFinal_Mujer?: string;
    MetaFinal_Total?: string;
}

import { IndicadorAccion } from './Indicadores';

export type EstadoLabel = 'Actuación en ejecución' | 'Actuación en espera' | 'Actuación finalizada' | 'Actuación abandonada';

export interface PresupuestoEjecutado {
    total: string;
    autofinanciacion: string;
    financiacionPublica: string;
    origenPublica: string;
    financiacionPrivada: string;
}

export interface EjecucionPresupuestaria {
    previsto: string;
    ejecutado: string;
    porcentaje: string;
}

export interface DatosPlan {
    ejecutora: string;
    implicadas: string;
    comarcal: string;
    supracomarcal: string;
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

export interface DatosAccion {
    id: number;
    accion: string;
    eje: string;
    lineaActuaccion: string;
    datosPlan?: DatosPlan;
    datosMemoria?: DatosMemoria;
    indicadorAccion?: IndicadorAccion[];
}

export const datosInicializadosAccion: DatosAccion = {
    id: 0,
    accion: '',
    eje: '',
    lineaActuaccion: '',
    datosPlan: {
        ejecutora: '',
        implicadas: '',
        comarcal: '',
        supracomarcal: '',
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
            total: '',
            autofinanciacion: '',
            financiacionPublica: '',
            origenPublica: '',
            financiacionPrivada: '',
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
};

export const datosPlan: DatosPlan = {
    ejecutora: '',
    implicadas: '',
    comarcal: '',
    supracomarcal: '',
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
        total: '',
        autofinanciacion: '',
        financiacionPublica: '',
        origenPublica: '',
        financiacionPrivada: '',
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

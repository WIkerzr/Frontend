import { EjeIndicadorBBDD } from './tipadoPlan';

/* eslint-disable @typescript-eslint/no-explicit-any */
export type TiposDeIndicadores = 'realizacion' | 'resultado';
export interface Indicador {
    id: number;
    NameEs: string;
    NameEu: string;
    description: string;
    ano: number;
}
export interface HMT {
    hombres: number;
    mujeres: number;
    total: number;
}
export interface IndicadorRealizacionAccion {
    id: number;
    descripcion: string;
    idsResultados?: number[];
    metaAnual?: HMT;
    ejecutado?: HMT;
    metaFinal?: HMT;
    hipotesis?: string;
    indicadorRealizacionId?: number;
    [key: string]: any;
}
export interface IndicadorResultadoAccion {
    id: number;
    descripcion: string;
    metaAnual?: HMT;
    ejecutado?: HMT;
    metaFinal?: HMT;
    hipotesis?: string;
    indicadorResultadoId?: number;
    [key: string]: any;
}

export interface IndicadorResultado {
    Id: number;
    NameEs: string;
    NameEu?: string;
    RegionsId?: string;
    Description?: string;
    DisaggregationVariables?: any;
    CalculationMethodology?: any;
    RelatedAxes?: EjeIndicadorBBDD[];
}
export interface IndicadorRealizacion extends IndicadorResultado {
    Resultados?: IndicadorResultado[];
}

export const indicadorResultadoinicial: IndicadorResultado = {
    Id: 0,
    NameEs: '',
    NameEu: '',
    Description: '',
    DisaggregationVariables: '',
    CalculationMethodology: '',
    RelatedAxes: [],
};

export const indicadorInicial: IndicadorRealizacion = {
    Id: 0,
    NameEs: '',
    NameEu: '',
    Description: '',
    DisaggregationVariables: '',
    CalculationMethodology: '',
    RelatedAxes: [],
    Resultados: [],
};
export const indicadorInicialResultado: IndicadorResultado = {
    Id: 0,
    NameEs: '',
    NameEu: '',
    Description: '',
    DisaggregationVariables: '',
    CalculationMethodology: '',
    RelatedAxes: [],
};

export const datosPruebaIndicadoreRealizacion: IndicadorRealizacionAccion[] = [
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
];

export const datosPruebaIndicadoreResultado: IndicadorResultadoAccion[] = [
    {
        id: 4,
        descripcion: 'RS04. Número de personas beneficiadas de las infraestructuras y/o servicios mejorados',
        metaAnual: {
            hombres: 10,
            mujeres: 10,
            total: 20,
        },
        ejecutado: {
            hombres: 0,
            mujeres: 0,
            total: 0,
        },
        metaFinal: {
            hombres: 20,
            mujeres: 20,
            total: 40,
        },
        hipotesis: '',
    },
    {
        id: 5,
        descripcion: 'RS05. Número de empresas creadas por personas emprendedoras',
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
    },
];

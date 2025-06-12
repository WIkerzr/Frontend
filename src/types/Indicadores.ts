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
    [key: string]: any;
}
export interface IndicadorResultadoAccion {
    id: number;
    descripcion: string;
    metaAnual?: HMT;
    ejecutado?: HMT;
    metaFinal?: HMT;
    hipotesis?: string;
    [key: string]: any;
}

export interface IndicadorResultado {
    Id: number;
    NameEs: string;
    NameEu?: string;
    Description?: string;
    DisaggregationVariables?: any;
    CalculationMethodology?: any;
    RelatedAxes?: any;
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
    RelatedAxes: '',
};

export const indicadorInicial: IndicadorRealizacion = {
    Id: 0,
    NameEs: '',
    NameEu: '',
    Description: '',
    DisaggregationVariables: '',
    CalculationMethodology: '',
    RelatedAxes: '',
    Resultados: [],
};

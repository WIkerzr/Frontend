export interface Indicador {
    id: number;
    descripcion: string;
    ano: number;
}
export interface HMT {
    hombres: number;
    mujeres: number;
    total: number;
}
export interface IndicadorRealizacion {
    id: number;
    descripcion: string;
    idsResultados?: number[];
    metaAnual?: HMT;
    ejecutado?: HMT;
    metaFinal?: HMT;
    hipotesis?: string;
    [key: string]: any;
}
export interface IndicadorResultado {
    id: number;
    descripcion: string;
    metaAnual?: HMT;
    ejecutado?: HMT;
    metaFinal?: HMT;
    hipotesis?: string;
    [key: string]: any;
}

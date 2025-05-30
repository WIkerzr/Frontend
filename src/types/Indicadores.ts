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
export interface IndicadorAccion {
    id: number;
    nombre: string;
    idsResultados?: number[];
    metaAnual?: HMT;
    ejecutado?: HMT;
    metaFinal?: HMT;
    hipotesis?: string;
    [key: string]: any;
}

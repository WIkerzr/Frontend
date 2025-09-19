/* eslint-disable @typescript-eslint/no-explicit-any */
export type Estado = 'borrador' | 'proceso' | 'cerrado' | 'aceptado';
const validEstados = ['borrador', 'proceso', 'cerrado', 'aceptado'] as const;

export function isEstado(value: any): value is Estado {
    return validEstados.includes(value);
}

export const opcionesComarcal = [
    'Sin tratamiento territorial comarcal',
    'Zonas de especial atención',
    'Municipios con todas las zonas rurales',
    'Municipios con habitat rural disperso',
    'Todas las entidades rurales de la comarca',
    'Otros',
];

export const opcionesODS = [
    'Fin de la Pobreza',
    'Hambre Cero',
    'Salud y Bienestar',
    'Educación de Calidad',
    'Igualdad de Género',
    'Agua Limpia y Saneamiento',
    'Energía Asequible y no Contaminante',
    'Industria, Innovación e Infraestructura',
    'Reducción de las Desigualdades',
    'Ciudades y Comunidades Sostenibles',
    'Producción y Consumo Responsables',
    'Acción por el Clima',
    'Vida Submarina',
    'Vida de Ecosistemas Terrestres',
    'Paz, Justicia e Instituciones Sólidas ',
    'Alianzas para Lograr los Objetivos',
];

export type Comarcal = (typeof opcionesComarcal)[number];

export const opcionesSupraComarcal = ['Territorio histórico', 'Euskadi', 'Otros'];

export type SupraComarcal = (typeof opcionesSupraComarcal)[number];

export interface Servicios {
    id: number;
    nombre: string;
    descripcion: string;
    indicadores: IndicadoresServicios[];
    dSeguimiento?: string;
    valFinal?: string;
}
export interface HMTServicios {
    hombres?: string;
    mujeres?: string;
    valor: string;
}
export interface IndicadoresServicios {
    indicador: string;
    previsto: HMTServicios;
    alcanzado?: HMTServicios;
}
export interface IndicadoresServiciosDTO {
    Indicador: string;
    PrevistoHombres: string;
    PrevistoMujeres: string;
    PrevistoValor: string;
    AlcanzadoHombres: string;
    AlcanzadoMujeres: string;
    AlcanzadoValor: string;
}

export interface ServiciosDTO {
    Id?: number;
    Nombre: string;
    Descripcion: string;
    IndicadoresServicios: IndicadoresServiciosDTO[];
    DSeguimiento?: string;
    ValFinal?: string;
    RegionId: number;
    Year: number;
}
export interface ServiciosDTOConvertIndicadores {
    Id?: number;
    Nombre: string;
    Descripcion: string;
    Indicadores: IndicadoresServiciosDTO[];
    DSeguimiento?: string;
    ValFinal?: string;
    RegionId: number;
    Year: number;
}

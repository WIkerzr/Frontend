export type Estado = 'borrador' | 'proceso' | 'cerrado' | 'aceptado';

export type EstadosLoading = 'idle' | 'loading' | 'success' | 'error';

export const opcionesComarcal = [
    'No',
    'Zonas de especial atención',
    'Municipios con todas las zonas rurales',
    'Municipios con habitat rural disperso',
    'Todas las entidades rurales de la comarca',
    'otros',
];

export const opcionesODS = ['', 'X', 'Z'];

export type Comarcal = (typeof opcionesComarcal)[number];

export const opcionesSupraComarcal = ['No', 'Territorio histórico', 'Euskadi', 'Otros'];

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

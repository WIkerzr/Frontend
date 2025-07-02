export type Estado = 'borrador' | 'proceso' | 'cerrado' | 'aceptado';

export type EstadosLoading = 'idle' | 'loading' | 'success' | 'error';

export const opcionesComarcal = [
    'No',
    'Zonas de especial atención',
    'Municipios con todas las zonas rurales',
    'Municipios con habitat rural disperso',
    'Todas las entidades rurales de la comarca',
    'otros',
] as const;

export type Comarcal = (typeof opcionesComarcal)[number];

export const opcionesSupraComarcal = ['No', 'Territorio histórico', 'Euskadi', 'Otros'] as const;

export type SupraComarcal = (typeof opcionesSupraComarcal)[number];

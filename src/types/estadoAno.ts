type Estado = 'borrador' | 'proceso' | 'cerrado';

type EstadoPorAnio = {
    plan: Estado;
    memoria: Estado;
};

type EstadosPorAnio = {
    [anio: number]: EstadoPorAnio;
};

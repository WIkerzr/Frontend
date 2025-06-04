import { Estado } from '../contexts/EstadosPorAnioContext';

type EstadoPorAnio = {
    plan: Estado;
    memoria: Estado;
};

type EstadosPorAnio = {
    [anio: number]: EstadoPorAnio;
};

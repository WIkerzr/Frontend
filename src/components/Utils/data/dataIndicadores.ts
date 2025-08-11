import { IndicadorRealizacion, IndicadorResultado } from '../../../types/Indicadores';
import { FetchConRefreshRetry, gestionarErrorServidor } from '../utils';
import { ApiTarget } from './controlDev';

interface IndicadoresResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export async function editIndicadorRealizacionBack(indicadorModificado: IndicadorRealizacion): Promise<IndicadorRealizacion> {
    const token = sessionStorage.getItem('access_token');

    const response = await FetchConRefreshRetry(`${ApiTarget}/editarIndicadorRealizacion`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(indicadorModificado),
    });

    if (!response.ok) {
        const errorInfo = gestionarErrorServidor(response);
        throw new Error(errorInfo.mensaje);
    }

    const json: IndicadoresResponse<IndicadorRealizacion> = await response.json();

    if (!json.success) {
        throw new Error('Error al editar indicador: ' + json.message);
    }

    const indicadorFinal: IndicadorRealizacion = {
        ...indicadorModificado,
        ...json.data,
    };

    return indicadorFinal;
}

export async function editIndicadorResultadoBack(indicadorModificado: IndicadorResultado): Promise<IndicadorResultado> {
    const token = sessionStorage.getItem('access_token');

    const response = await FetchConRefreshRetry(`${ApiTarget}/editarIndicadorResultado`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(indicadorModificado),
    });

    if (!response.ok) {
        const errorInfo = gestionarErrorServidor(response);
        throw new Error(errorInfo.mensaje);
    }

    const json: IndicadoresResponse<IndicadorResultado> = await response.json();

    if (!json.success) {
        throw new Error('Error al editar indicador resultado: ' + json.message);
    }

    const indicadorFinal: IndicadorResultado = {
        ...indicadorModificado,
        ...json.data,
    };

    return indicadorFinal;
}

/* eslint-disable @typescript-eslint/no-explicit-any */
import { IndicadorRealizacion, IndicadorResultado } from '../../../types/Indicadores';
import { EjeIndicadorBBDD } from '../../../types/tipadoPlan';
import { FetchConRefreshRetry, gestionarErrorServidor } from '../utils';
import { ApiTarget } from './controlDev';

interface IndicadoresResponse<T> {
    success: boolean;
    message: string;
    data: T;
}

export function transformarIndicador(indicador: IndicadorRealizacion & { RelatedAxes: string }) {
    //TODO borrar cuando se implemente el backend

    const relatedAxesArray = indicador.RelatedAxes
        ? indicador.RelatedAxes.split(',')
              .map((s) => s.replace(/'/g, '').trim())
              .filter((s) => s.length > 0)
              .map((s) => ({ EjeId: Number(s) }))
        : [];

    const resultadosTransformados: IndicadorResultado[] | undefined = indicador.Resultados?.map((resultado) => ({
        ...resultado,
        RelatedAxes: resultado.RelatedAxes
            ? (resultado.RelatedAxes as unknown as string)
                  .split(',')
                  .map((s) => s.replace(/'/g, '').trim())
                  .filter((s) => s.length > 0)
                  .map((id) => ({ EjeId: id, NameEs: '', NameEu: '' }))
            : [],
    }));

    return {
        ...indicador,
        RelatedAxes: relatedAxesArray,
        ...(resultadosTransformados ? { Resultados: resultadosTransformados } : {}),
    };
}

export function transformarIndicadorStringAArray(indicador: IndicadorRealizacion, ejesIndicador: EjeIndicadorBBDD[]): IndicadorRealizacion {
    //TODO borrar cuando se implemente el backend

    const indicadorFinal: IndicadorRealizacion = {
        ...indicador,
        RelatedAxes:
            typeof indicador.RelatedAxes === 'string'
                ? (indicador.RelatedAxes as string)
                      .split(',') // separar por comas
                      .map((idStr) => idStr.replace(/'/g, '').trim())
                      .map((id) => ejesIndicador.find((e) => `${e.EjeId}` === id))
                      .filter((e): e is EjeIndicadorBBDD => e !== undefined)
                : indicador.RelatedAxes,
    };

    return indicadorFinal;
}
const transformarBORRARIndicadorArrayAString = (indicador: IndicadorRealizacion | IndicadorResultado): any => {
    //TODO borrar cuando se implemente el backend
    const idsString = indicador.RelatedAxes ? indicador.RelatedAxes.map((eje) => `'${eje.EjeId}'`).join(',') : '';

    const resultadosTransformados =
        'Resultados' in indicador && Array.isArray(indicador.Resultados)
            ? indicador.Resultados.map((resultado) => ({
                  ...resultado,
                  RelatedAxes: resultado.RelatedAxes ? resultado.RelatedAxes.map((eje) => `'${eje.EjeId}'`).join(',') : '',
              }))
            : undefined;

    return {
        ...indicador,
        RelatedAxes: idsString,
        ...(resultadosTransformados ? { Resultados: resultadosTransformados } : {}),
    };
};

export async function editIndicadorRealizacionBack(indicadorModificado: IndicadorRealizacion, ejesIndicador: EjeIndicadorBBDD[]): Promise<IndicadorRealizacion> {
    const token = sessionStorage.getItem('access_token');
    const borrar = transformarBORRARIndicadorArrayAString(indicadorModificado);

    const response = await FetchConRefreshRetry(`${ApiTarget}/editarIndicadorRealizacion`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(borrar),
    });

    if (!response.ok) {
        const errorInfo = gestionarErrorServidor(response);
        throw new Error(errorInfo.mensaje);
    }

    const json: IndicadoresResponse<IndicadorRealizacion> = await response.json();

    if (!json.success) {
        throw new Error('Error al editar indicador: ' + json.message);
    }

    const indicadorPreFinal: IndicadorRealizacion = {
        ...indicadorModificado,
        ...json.data,
    };
    const indicadorFinal = transformarIndicadorStringAArray(indicadorPreFinal, ejesIndicador);
    return indicadorFinal;
}

export async function editIndicadorResultadoBack(indicadorModificado: IndicadorResultado, ejesIndicador: EjeIndicadorBBDD[]): Promise<IndicadorResultado> {
    const token = sessionStorage.getItem('access_token');
    const borrar = transformarBORRARIndicadorArrayAString(indicadorModificado);

    const response = await FetchConRefreshRetry(`${ApiTarget}/editarIndicadorResultado`, {
        method: 'PUT',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(borrar),
    });

    if (!response.ok) {
        const errorInfo = gestionarErrorServidor(response);
        throw new Error(errorInfo.mensaje);
    }

    const json: IndicadoresResponse<IndicadorResultado> = await response.json();

    if (!json.success) {
        throw new Error('Error al editar indicador: ' + json.message);
    }

    const indicadorPreFinal: IndicadorResultado = {
        ...indicadorModificado,
        ...json.data,
    };
    const indicadorFinal = transformarIndicadorStringAArray(indicadorPreFinal, ejesIndicador);
    return indicadorFinal;
}

export async function guardarNuevoRealizacionBack(
    esADR: boolean,
    indicador: IndicadorRealizacion,
    regionSeleccionada: string | null
): Promise<{ indicadorNuevo: IndicadorRealizacion; response: Response }> {
    const token = sessionStorage.getItem('access_token');
    const datosRealizacion: IndicadorRealizacion = {
        ...indicador,
        RegionsId: regionSeleccionada ?? undefined,
        Resultados: indicador.Resultados?.map((resultado) => ({
            ...resultado,
            RegionsId: regionSeleccionada ?? undefined,
        })),
    };

    //TODO: Borrar
    const idsString = datosRealizacion.RelatedAxes ? datosRealizacion.RelatedAxes.map((eje) => `'${eje.EjeId}'`).join(',') : '';
    const datosBorrar = {
        ...datosRealizacion,
        RelatedAxes: idsString ?? '',
    };
    const idsStringEditable = indicador.RelatedAxes ? indicador.RelatedAxes.map((eje) => `'${eje.EjeId}'`).join(',') : '';
    const datosBorrarIndicador = {
        ...indicador,
        RelatedAxes: idsStringEditable ?? '',
    };
    //TODO: Borrar
    const indicadorIntermedio = esADR ? datosBorrar : datosBorrarIndicador;
    if (indicadorIntermedio.Resultados) {
        indicadorIntermedio.Resultados.forEach((resultado, i, arr) => {
            arr[i] = transformarBORRARIndicadorArrayAString(resultado);
        });
    }
    const response = await FetchConRefreshRetry(`${ApiTarget}/nuevoIndicadores`, {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        // body: JSON.stringify(esADR ? datosRealizacion : indicador),
        body: JSON.stringify(indicadorIntermedio),
    });
    if (response && !response.ok) {
        const errorInfo = gestionarErrorServidor(response);
        throw new Error(errorInfo.mensaje);
        //setErrorMessage(errorInfo.mensaje);
        //return;
    }
    const indicadorNuevo = await response.json();

    let realizaciones: IndicadorRealizacion[] = [];
    const storedRealizacion = localStorage.getItem('indicadoresRealizacion');
    if (storedRealizacion) {
        realizaciones = JSON.parse(storedRealizacion);
    }
    realizaciones.push({
        ...indicador,
        Id: indicadorNuevo.data.Id,
        RegionsId: regionSeleccionada ?? undefined,
    });

    if (indicadorNuevo.data.Resultados && indicadorNuevo.data.Resultados.length > 0) {
        let resultados: IndicadorRealizacion[] = [];
        const storedResultado = localStorage.getItem('indicadoresResultado');
        if (storedResultado) {
            resultados = JSON.parse(storedResultado);
        }
        const idsEnresultados = new Set(resultados.map((obj) => obj.Id));
        indicadorNuevo.data.Resultados.forEach((obj: IndicadorRealizacion) => {
            if (!idsEnresultados.has(obj.Id)) {
                resultados.push({
                    Id: obj.Id,
                    NameEs: obj.NameEs,
                    CalculationMethodology: obj.CalculationMethodology,
                    Description: obj.Description,
                    NameEu: obj.NameEu,
                    RegionsId: obj.RegionsId,
                    RelatedAxes: obj.RelatedAxes,
                    Resultados: obj.Resultados,
                });
            }
        });
    }
    return { indicadorNuevo, response };
}

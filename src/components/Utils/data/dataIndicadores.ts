/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { IndicadorRealizacion, IndicadorResultado } from '../../../types/Indicadores';
import { EjeIndicadorBBDD } from '../../../types/tipadoPlan';
import { LlamadasBBDD } from './utilsData';

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

export async function editIndicadorRealizacionBack({
    indicadorModificado,
    setLoading,
    ejesIndicador,
    onSucces,
}: {
    indicadorModificado: IndicadorRealizacion;
    setLoading: (a: boolean) => void;
    ejesIndicador: EjeIndicadorBBDD[];
    onSucces: (indicador: IndicadorRealizacion) => void;
}) {
    const borrar = transformarBORRARIndicadorArrayAString(indicadorModificado);
    LlamadasBBDD({
        method: 'PUT',
        url: `editarIndicadorRealizacion`,
        setLoading: setLoading ?? (() => {}),
        body: borrar,
        //setErrorMessage,
        //setSuccessMessage,
        async onSuccess(response) {
            const json: IndicadoresResponse<IndicadorRealizacion> = await response.data;

            const indicadorPreFinal: IndicadorRealizacion = {
                ...indicadorModificado,
                ...json,
            };
            const indicadorFinal = transformarIndicadorStringAArray(indicadorPreFinal, ejesIndicador);
            onSucces(indicadorFinal);
        },
    });
}

export async function editIndicadorResultadoBack({
    indicadorModificado,
    setLoading,
    ejesIndicador,
    onSucces,
}: {
    indicadorModificado: IndicadorResultado;
    setLoading: (a: boolean) => void;
    ejesIndicador: EjeIndicadorBBDD[];
    onSucces: (indicador: IndicadorResultado) => void;
}) {
    const borrar = transformarBORRARIndicadorArrayAString(indicadorModificado);

    LlamadasBBDD({
        method: 'PUT',
        url: `editarIndicadorResultado`,
        setLoading: setLoading ?? (() => {}),
        body: borrar,
        //setErrorMessage,
        //setSuccessMessage,
        async onSuccess(response) {
            const json: IndicadoresResponse<IndicadorResultado> = await response.data;

            if (!json.success) {
                throw new Error('Error al editar indicador: ' + json.message);
            }

            const indicadorPreFinal: IndicadorResultado = {
                ...indicadorModificado,
                ...json.data,
            };
            const indicadorFinal = transformarIndicadorStringAArray(indicadorPreFinal, ejesIndicador);
            onSucces(indicadorFinal);
        },
    });
}

export async function guardarNuevoRealizacionBack({
    esADR,
    indicador,
    regionSeleccionada,
    setLoading,
    onSucces,
    onError,
}: {
    esADR: boolean;
    indicador: IndicadorRealizacion;
    regionSeleccionada: string | null;
    setLoading: (a: boolean) => void;
    onSucces: (data: IndicadorRealizacion) => void;
    onError: (data: string) => void;
}) {
    const datosRealizacion: IndicadorRealizacion = {
        ...indicador,
        RegionsId: regionSeleccionada ?? undefined,
        Resultados: indicador.Resultados?.map((resultado) => ({
            ...resultado,
            RegionsId: regionSeleccionada ?? undefined,
        })),
    };

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

    const indicadorIntermedio = esADR ? datosBorrar : datosBorrarIndicador;
    if (indicadorIntermedio.Resultados) {
        indicadorIntermedio.Resultados.forEach((resultado, i, arr) => {
            arr[i] = transformarBORRARIndicadorArrayAString(resultado);
        });
    }
    LlamadasBBDD({
        method: 'POST',
        url: `nuevoIndicadores`,
        setLoading: setLoading ?? (() => {}),
        body: indicadorIntermedio,
        //setErrorMessage,
        //setSuccessMessage,
        onSuccess(response) {
            const indicadorNuevo = response.data;

            let realizaciones: IndicadorRealizacion[] = [];
            const storedRealizacion = localStorage.getItem('indicadoresRealizacion');
            if (storedRealizacion) {
                realizaciones = JSON.parse(storedRealizacion);
            }
            realizaciones.push({
                ...indicador,
                Id: indicadorNuevo.Id,
                RegionsId: regionSeleccionada ?? undefined,
            });

            if (indicadorNuevo.Resultados && indicadorNuevo.Resultados.length > 0) {
                let resultados: IndicadorRealizacion[] = [];
                const storedResultado = localStorage.getItem('indicadoresResultado');
                if (storedResultado) {
                    resultados = JSON.parse(storedResultado);
                }
                const idsEnresultados = new Set(resultados.map((obj) => obj.Id));
                indicadorNuevo.Resultados.forEach((obj: IndicadorRealizacion) => {
                    if (!idsEnresultados.has(obj.Id)) {
                        resultados.push({
                            Id: obj.Id,
                            NameEs: obj.NameEs,
                            UnitMed: obj.UnitMed,
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
            if (response.success) {
                onSucces(indicadorNuevo);
            } else {
                onError(response.message);
            }
        },
    });
}

import { Estado, IndicadoresServicios, IndicadoresServiciosDTO, Servicios, ServiciosDTO } from '../../../../types/GeneralTypes';
import { IndicadorRealizacionAccion, IndicadorResultadoAccion } from '../../../../types/Indicadores';
import {
    DatosPlanDTO,
    DatosPlan,
    DatosMemoriaDTO,
    DatosMemoriaBackF,
    FuenteFinanciacion,
    DatosAccion,
    DatosAccionDTO,
    IndicadorRealizacionAccionDTO,
    IndicadorResultadoAccionDTO,
} from '../../../../types/TipadoAccion';
import { EjeBBDD, Ejes, GeneralOperationADR, GeneralOperationADRDTOCompleto, OperationalIndicators, OperationalIndicatorsDTO, YearData, YearDataDTO } from '../../../../types/tipadoPlan';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkData = (value: any, name: string, defaultValue = ''): any => {
    if (value === null || value === undefined) {
        console.warn(`Aviso: el dato ${name} no se encuentra. Se usará valor por defecto.`);
        return defaultValue;
    }
    return value;
};
// export const transformarBackFront = {
//     Plan: (dp?: DatosPlanDTO): DatosPlan => {
//         if (!dp) {
//             throw new Error("transformarBackFront.Plan no hay datos");
//         }
//         return {
//             id: checkData(dp.Id, 'Id', '0'),
//             ejecutora: checkData(dp.Ejecutora, 'Ejecutora'),
//             implicadas: checkData(dp.Implicadas, 'Implicadas'),
//             comarcal: checkData(dp.Comarcal, 'Comarcal'),
//             supracomarcal: checkData(dp.Supracomarcal, 'Supracomarcal'),
//             rangoAnios: checkData(dp.RangoAnios, 'RangoAnios'),
//             oAccion: checkData(dp.OAccion, 'OAccion'),
//             ods: checkData(dp.Ods, 'Ods'),
//             dAccion: checkData(dp.DAccion, 'DAccion'),
//             presupuesto: checkData(dp.Presupuesto, 'Presupuesto'),
//             iMujHom: checkData(dp.IMujHom, 'IMujHom'),
//             uEuskera: checkData(dp.UEuskera, 'UEuskera'),
//             sostenibilidad: checkData(dp.Sostenibilidad, 'Sostenibilidad'),
//             dInteligent: checkData(dp.DInteligent, 'DInteligent'),
//             observaciones: checkData(dp.Observaciones, 'Observaciones'),
//         };
//     },
//     Memoria: (dm?: DatosMemoriaDTO): DatosMemoriaBackF => {
//         if (!dm) {
//             throw new Error("transformarBackFront.Memoria no hay datos");
//         }
//         return {
//             id: checkData(dm.Id, 'Id', '0'),
//             dAccionAvances: checkData(dm.DAccionAvances, 'DAccionAvances'),
//             presupuestoEjecutado: {
//                 fuenteDeFinanciacion: checkData(dm.PresupuestoEjecutado_FuenteDeFinanciacion, 'PresupuestoEjecutado_fuenteDeFinanciacion', '')
//                     .split(',')
//                     .map((f: string) => f.trim() as FuenteFinanciacion),
//                 cuantia: checkData(dm.PresupuestoEjecutado_Cuantia, 'PresupuestoEjecutado_cuantia'),
//                 observaciones: checkData(dm.PresupuestoEjecutado_Observaciones, 'PresupuestoEjecutado_observaciones'),
//             },
//             ejecucionPresupuestaria: {
//                 previsto: checkData(dm.EjecucionPresupuestaria_Previsto, 'EjecucionPresupuestaria_previsto'),
//                 ejecutado: checkData(dm.EjecucionPresupuestaria_Ejecutado, 'EjecucionPresupuestaria_ejecutado'),
//                 porcentaje: checkData(dm.EjecucionPresupuestaria_Porcentaje, 'EjecucionPresupuestaria_porcentaje'),
//             },
//             observaciones: checkData(dm.Observaciones, 'Observaciones'),
//             valFinal: checkData(dm.ValFinal, 'ValFinal'),
//             dSeguimiento: checkData(dm.DSeguimiento, 'DSeguimiento'),
//             sActual: checkData(dm.SActual, 'SActual'),
//         };
//     },
//   IndicadorRealizacion: (
//     listadoNombresIndicadoresRealizacion: { id: number; nombre: string }[],
//     items?: IndicadorRealizacionAccionDTO[]
//   ): IndicadorRealizacionAccion[] => {
//     return (items ?? []).map((item) => ({
//        id: checkData(item.IndicadorRealizacionId, 'Id', '0'),
//       descripcion:
//         listadoNombresIndicadoresRealizacion.find(
//           (lI) => lI.id === item.IndicadorRealizacionId
//         )?.nombre || '',
//       metaAnual: {
//         hombres: checkData(item.MetaAnual_Hombre, 'MetaAnual_Hombre'),
//         mujeres: checkData(item.MetaAnual_Mujer, 'MetaAnual_Mujer'),
//         total: checkData(item.MetaAnual_Total, 'MetaAnual_Total'),
//       },
//       ejecutado: {
//         hombres: checkData(item.Ejecutado_Hombre, 'Ejecutado_Hombre'),
//         mujeres: checkData(item.Ejecutado_Mujer, 'Ejecutado_Mujer'),
//         total: checkData(item.Ejecutado_Total, 'Ejecutado_Total'),
//       },
//       metaFinal: {
//         hombres: checkData(item.MetaFinal_Hombre, 'MetaFinal_Hombre'),
//         mujeres: checkData(item.MetaFinal_Mujer, 'MetaFinal_Mujer'),
//         total: checkData(item.MetaFinal_Total, 'MetaFinal_Total'),
//       },
//       hipotesis: checkData(item.Hipotesis, 'Hipotesis'),
//        idsResultados: checkData(item.IdsResultados, 'IdsResultados', '').map((id: string) => id.trim()),
//       indicadorRealizacionId: checkData(
//         item.IndicadorRealizacionId,
//         'IndicadorRealizacionId',
//         undefined
//       ) as number | undefined,
//     }));
//   },
// IndicadorResultado: (
//     listadoNombresIndicadoresResultado: { id: number; nombre: string }[],
//     items?: IndicadorResultadoAccionDTO[]
//   ): IndicadorResultadoAccion[] => {
//     return (items ?? []).map((item) => ({
//        id: checkData(item.IndicadorResultadoId, 'Id', '0'),
//         descripcion: listadoNombresIndicadoresResultado.find((lI) => lI.id === item.IndicadorResultadoId)?.nombre || '',
//         metaAnual: {
//             hombres: checkData(item.MetaAnual_Hombre, 'MetaAnual_Hombre'),
//             mujeres: checkData(item.MetaAnual_Mujer, 'MetaAnual_Mujer'),
//             total: checkData(item.MetaAnual_Total, 'MetaAnual_Total'),
//         },
//         ejecutado: {
//             hombres: checkData(item.Ejecutado_Hombre, 'Ejecutado_Hombre'),
//             mujeres: checkData(item.Ejecutado_Mujer, 'Ejecutado_Mujer'),
//             total: checkData(item.Ejecutado_Total, 'Ejecutado_Total'),
//         },
//         metaFinal: {
//             hombres: checkData(item.MetaFinal_Hombre, 'MetaFinal_Hombre'),
//             mujeres: checkData(item.MetaFinal_Mujer, 'MetaFinal_Mujer'),
//             total: checkData(item.MetaFinal_Total, 'MetaFinal_Total'),
//         },
//         hipotesis: checkData(item.Hipotesis, 'Hipotesis'),
//         indicadorResultadoId: checkData(item.IndicadorResultadoId, 'IndicadorResultadoId', undefined) as number | undefined,
//     }));
//   },
// };
// Transformar DatosPlan
export const transformDatosPlan = (dp?: DatosPlanDTO): DatosPlan => ({
    id: checkData(dp?.Id, 'Id', '0'),
    ejecutora: checkData(dp?.Ejecutora, 'Ejecutora'),
    implicadas: checkData(dp?.Implicadas, 'Implicadas'),
    comarcal: checkData(dp?.Comarcal, 'Comarcal'),
    supracomarcal: checkData(dp?.Supracomarcal, 'Supracomarcal'),
    rangoAnios: checkData(dp?.RangoAnios, 'RangoAnios'),
    oAccion: checkData(dp?.OAccion, 'OAccion'),
    ods: checkData(dp?.Ods, 'Ods'),
    dAccion: checkData(dp?.DAccion, 'DAccion'),
    presupuesto: checkData(dp?.Presupuesto, 'Presupuesto'),
    iMujHom: checkData(dp?.IMujHom, 'IMujHom'),
    uEuskera: checkData(dp?.UEuskera, 'UEuskera'),
    sostenibilidad: checkData(dp?.Sostenibilidad, 'Sostenibilidad'),
    dInteligent: checkData(dp?.DInteligent, 'DInteligent'),
    observaciones: checkData(dp?.Observaciones, 'Observaciones'),
});

// Transformar DatosMemoria
export const transformDatosMemoria = (dm?: DatosMemoriaDTO): DatosMemoriaBackF => ({
    id: checkData(dm?.Id, 'Id', '0'),
    dAccionAvances: checkData(dm?.DAccionAvances, 'DAccionAvances'),
    presupuestoEjecutado: {
        fuenteDeFinanciacion: checkData(dm?.PresupuestoEjecutado_FuenteDeFinanciacion, 'PresupuestoEjecutado_fuenteDeFinanciacion', '')
            .split(',')
            .map((f: string) => f.trim() as FuenteFinanciacion),
        cuantia: checkData(dm?.PresupuestoEjecutado_Cuantia, 'PresupuestoEjecutado_cuantia'),
        observaciones: checkData(dm?.PresupuestoEjecutado_Observaciones, 'PresupuestoEjecutado_observaciones'),
    },
    ejecucionPresupuestaria: {
        previsto: checkData(dm?.EjecucionPresupuestaria_Previsto, 'EjecucionPresupuestaria_previsto'),
        ejecutado: checkData(dm?.EjecucionPresupuestaria_Ejecutado, 'EjecucionPresupuestaria_ejecutado'),
        porcentaje: checkData(dm?.EjecucionPresupuestaria_Porcentaje, 'EjecucionPresupuestaria_porcentaje'),
    },
    observaciones: checkData(dm?.Observaciones, 'Observaciones'),
    valFinal: checkData(dm?.ValFinal, 'ValFinal'),
    dSeguimiento: checkData(dm?.DSeguimiento, 'DSeguimiento'),
    sActual: checkData(dm?.SActual, 'SActual'),
});

// Transformar Indicadores de Realización
export const transformIndicadoresRealizacion = (listadoNombresIndicadoresRealizacion: { id: number; nombre: string }[], items?: IndicadorRealizacionAccionDTO[]): IndicadorRealizacionAccion[] =>
    (items ?? []).map((item) => ({
        id: checkData(item.IndicadorRealizacionId, 'Id', '0'),
        descripcion: listadoNombresIndicadoresRealizacion.find((lI) => lI.id === item.IndicadorRealizacionId)?.nombre || '',
        metaAnual: {
            hombres: checkData(item.MetaAnual_Hombre, 'MetaAnual_Hombre'),
            mujeres: checkData(item.MetaAnual_Mujer, 'MetaAnual_Mujer'),
            total: checkData(item.MetaAnual_Total, 'MetaAnual_Total'),
        },
        ejecutado: {
            hombres: checkData(item.Ejecutado_Hombre, 'Ejecutado_Hombre'),
            mujeres: checkData(item.Ejecutado_Mujer, 'Ejecutado_Mujer'),
            total: checkData(item.Ejecutado_Total, 'Ejecutado_Total'),
        },
        metaFinal: {
            hombres: checkData(item.MetaFinal_Hombre, 'MetaFinal_Hombre'),
            mujeres: checkData(item.MetaFinal_Mujer, 'MetaFinal_Mujer'),
            total: checkData(item.MetaFinal_Total, 'MetaFinal_Total'),
        },
        hipotesis: checkData(item.Hipotesis, 'Hipotesis'),
        idsResultados: checkData(item.IdsResultados, 'IdsResultados', '').map((id: string) => id.trim()),
        indicadorRealizacionId: checkData(item.IndicadorRealizacionId, 'IndicadorRealizacionId', undefined) as number | undefined,
    }));

// Transformar Indicadores de Resultado
export const transformIndicadoresResultado = (listadoNombresIndicadoresResultado: { id: number; nombre: string }[], items?: IndicadorResultadoAccionDTO[]): IndicadorResultadoAccion[] =>
    (items ?? []).map((item) => ({
        id: checkData(item.IndicadorResultadoId, 'Id', '0'),
        descripcion: listadoNombresIndicadoresResultado.find((lI) => lI.id === item.IndicadorResultadoId)?.nombre || '',
        metaAnual: {
            hombres: checkData(item.MetaAnual_Hombre, 'MetaAnual_Hombre'),
            mujeres: checkData(item.MetaAnual_Mujer, 'MetaAnual_Mujer'),
            total: checkData(item.MetaAnual_Total, 'MetaAnual_Total'),
        },
        ejecutado: {
            hombres: checkData(item.Ejecutado_Hombre, 'Ejecutado_Hombre'),
            mujeres: checkData(item.Ejecutado_Mujer, 'Ejecutado_Mujer'),
            total: checkData(item.Ejecutado_Total, 'Ejecutado_Total'),
        },
        metaFinal: {
            hombres: checkData(item.MetaFinal_Hombre, 'MetaFinal_Hombre'),
            mujeres: checkData(item.MetaFinal_Mujer, 'MetaFinal_Mujer'),
            total: checkData(item.MetaFinal_Total, 'MetaFinal_Total'),
        },
        hipotesis: checkData(item.Hipotesis, 'Hipotesis'),
        indicadorResultadoId: checkData(item.IndicadorResultadoId, 'IndicadorResultadoId', undefined) as number | undefined,
    }));

export const accionesTransformadasBackAFront = (
    eje: EjeBBDD,
    listadoNombresIndicadoresRealizacion: { id: number; nombre: string }[],
    listadoNombresIndicadoresResultado: { id: number; nombre: string }[]
): DatosAccion[] =>
    eje.Acciones.map((accion: DatosAccionDTO) => {
        const dataPlan = transformDatosPlan(accion.DatosPlan);
        const dataMemoria = transformDatosMemoria(accion.DatosMemoria);
        const indicadorRealizacionAccion = transformIndicadoresRealizacion(listadoNombresIndicadoresRealizacion, accion.IndicadorRealizacionAcciones);
        const indicadorResultadoAccion = transformIndicadoresResultado(listadoNombresIndicadoresResultado, accion.IndicadorResultadoAcciones);

        return {
            id: checkData(accion?.Id, 'Id', '0'),
            accion: checkData(accion?.Nombre, 'Nombre'),
            lineaActuaccion: checkData(accion?.LineaActuaccion, 'LineaActuaccion'),
            plurianual: checkData(accion?.Plurianual, 'Plurianual', 'false'),
            indicadorAccion: {
                indicadoreRealizacion: indicadorRealizacionAccion,
                indicadoreResultado: indicadorResultadoAccion,
            },
            ejeEs: eje.NameEs,
            ejeEu: eje.NameEu,
            DatosPlanId: `${accion.DatosPlanId}`,
            DatosMemoriaId: `${accion.DatosMemoriaId}`,
            datosPlan: dataPlan,
            datosMemoria: dataMemoria,
            ejeId: eje.Id,
        };
    });

export const convertirOperationalIndicators = (indicatorsDTO?: OperationalIndicatorsDTO[]): OperationalIndicators[] =>
    (indicatorsDTO ?? []).map((OI) => ({
        id: `${OI.Id}`,
        nameEs: OI.NameEs,
        nameEu: OI.NameEu,
        value: OI.Value,
        valueAchieved: OI.ValueAchieved,
    }));

export const convertirGeneralOperationADR = (generalOperationADRDTO: GeneralOperationADRDTOCompleto): GeneralOperationADR => ({
    adrInternalTasks: generalOperationADRDTO.AdrInternalTasks ?? '',
    operationalIndicators: convertirOperationalIndicators(generalOperationADRDTO.OperationalIndicators),
    dSeguimiento: generalOperationADRDTO.DSeguimiento ?? '',
    valFinal: generalOperationADRDTO.ValFinal ?? '',
});

export const convertirIndicadoresServicios = (indicadores: IndicadoresServiciosDTO[]): IndicadoresServicios[] =>
    (indicadores ?? []).map((i) => ({
        indicador: i.Indicador,
        previsto: {
            hombres: i.PrevistoHombres ?? '',
            mujeres: i.PrevistoMujeres ?? '',
            valor: i.PrevistoValor ?? '',
        },
        alcanzado: {
            hombres: i.AlcanzadoHombres ?? '',
            mujeres: i.AlcanzadoMujeres ?? '',
            valor: i.AlcanzadoValor ?? '',
        },
    }));

export const convertirServicios = (serviciosDTO: ServiciosDTO[]): Servicios[] =>
    (serviciosDTO ?? []).map((s) => ({
        id: s.Id ?? 0,
        nombre: s.Nombre,
        descripcion: s.Descripcion,
        dSeguimiento: s.DSeguimiento ?? '',
        valFinal: s.ValFinal ?? '',
        indicadores: convertirIndicadoresServicios(s.IndicadoresServicios ?? []),
    }));

export const convertirEje = (eje: EjeBBDD, listadoRealizacion: { id: number; nombre: string }[], listadoResultado: { id: number; nombre: string }[]): Ejes => ({
    Id: `${eje.Id}`,
    NameEs: `${eje.NameEs}`,
    NameEu: `${eje.NameEu}`,
    IsActive: eje.IsActive,
    IsPrioritarios: eje.IsPrioritarios,
    acciones: accionesTransformadasBackAFront(eje, listadoRealizacion, listadoResultado),
});

export const clasificarEjes = (
    ejesBBDD: EjeBBDD[],
    listadoRealizacion: { id: number; nombre: string }[],
    listadoResultado: { id: number; nombre: string }[]
): { ejes: Ejes[]; ejesPrioritarios: Ejes[] } => {
    const ejes: Ejes[] = [];
    const ejesPrioritarios: Ejes[] = [];

    ejesBBDD.forEach((eje) => {
        const item = convertirEje(eje, listadoRealizacion, listadoResultado);
        if (eje.IsPrioritarios) {
            ejesPrioritarios.push(item);
        } else {
            ejes.push(item);
        }
    });

    return { ejes, ejesPrioritarios };
};

export const construirYearData = (
    data: YearDataDTO,
    nombreRegionSeleccionada: string,
    planStatus: string,
    memoriaStatus: string,
    generalOperationADR: GeneralOperationADR,
    ejes: Ejes[],
    ejesPrioritarios: Ejes[]
): YearData => {
    const servicios: Servicios[] = convertirServicios(data.Servicios);

    return {
        nombreRegion: nombreRegionSeleccionada ?? '',
        year: data.Year,
        plan: {
            id: `${data.Plan.Id}`,
            ejes,
            ejesPrioritarios,
            introduccion: data.Plan.Introduccion,
            proceso: data.Plan.Proceso,
            generalOperationADR,
            status: planStatus as Estado,
        },
        memoria: {
            id: `${data.Memoria.Id}`,
            status: memoriaStatus as Estado,
            dSeguimiento: data.Memoria.DSeguimiento,
            valFinal: data.Memoria.ValFinal,
        },
        servicios,
    };
};

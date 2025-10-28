import { Estado, IndicadoresServicios, IndicadoresServiciosDTO, Servicios, ServiciosDTO, ServiciosDTOConvertIndicadores } from '../../../../types/GeneralTypes';
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
    DatosMemoriaBack,
    EstadoLabel,
} from '../../../../types/TipadoAccion';
import { EjeBBDD2, Ejes, GeneralOperationADR, GeneralOperationADRDTOCompleto, OperationalIndicators, OperationalIndicatorsDTO, YearData, YearDataDTO } from '../../../../types/tipadoPlan';
import { RegionInterface } from '../getRegiones';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const checkData = (value: any, name: string, defaultValue = ''): any => {
    if (value === null || value === undefined || value === '' || value === '\n') {
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

function isDatosMemoriaBack(dm: DatosMemoriaDTO | DatosMemoriaBack): dm is DatosMemoriaBack {
    return 'PresupuestoEjecutado_fuenteDeFinanciacion' in dm;
}

// Transformar DatosMemoria
export const transformDatosMemoria = (dm?: DatosMemoriaDTO | DatosMemoriaBack): DatosMemoriaBackF => {
    if (!dm) {
        return {
            id: '0',
            dAccionAvances: '',
            presupuestoEjecutado: { fuenteDeFinanciacion: [], cuantia: '', observaciones: '' },
            ejecucionPresupuestaria: { previsto: '', ejecutado: '', porcentaje: '' },
            observaciones: '',
            valFinal: '',
            dSeguimiento: '',
            sActual: '' as EstadoLabel,
        };
    }

    if (isDatosMemoriaBack(dm)) {
        //  Caso Back
        return {
            id: checkData(dm.Id, 'Id', '0'),
            dAccionAvances: checkData(dm.DAccionAvances, 'DAccionAvances'),
            presupuestoEjecutado: {
                fuenteDeFinanciacion: checkData(dm.PresupuestoEjecutado_fuenteDeFinanciacion, 'PresupuestoEjecutado_fuenteDeFinanciacion', '')
                    .split(',')
                    .map((f: string) => f.trim() as FuenteFinanciacion),
                cuantia: checkData(dm.PresupuestoEjecutado_cuantia, 'PresupuestoEjecutado_cuantia'),
                observaciones: checkData(dm.PresupuestoEjecutado_observaciones, 'PresupuestoEjecutado_observaciones'),
            },
            ejecucionPresupuestaria: {
                previsto: checkData(dm.EjecucionPresupuestaria_previsto, 'EjecucionPresupuestaria_previsto'),
                ejecutado: checkData(dm.EjecucionPresupuestaria_ejecutado, 'EjecucionPresupuestaria_ejecutado'),
                porcentaje: checkData(dm.EjecucionPresupuestaria_porcentaje, 'EjecucionPresupuestaria_porcentaje'),
            },
            observaciones: checkData(dm.Observaciones, 'Observaciones'),
            valFinal: checkData(dm.ValFinal, 'ValFinal'),
            dSeguimiento: checkData(dm.DSeguimiento, 'DSeguimiento'),
            sActual: checkData(dm.SActual, 'SActual'),
        };
    } else {
        //  Caso DTO
        return {
            id: checkData(dm.Id, 'Id', '0'),
            dAccionAvances: checkData(dm.DAccionAvances, 'DAccionAvances'),
            presupuestoEjecutado: {
                fuenteDeFinanciacion: checkData(dm.PresupuestoEjecutado_FuenteDeFinanciacion, 'PresupuestoEjecutado_fuenteDeFinanciacion', '')
                    .split(',')
                    .map((f: string) => f.trim() as FuenteFinanciacion),
                cuantia: checkData(dm.PresupuestoEjecutado_Cuantia, 'PresupuestoEjecutado_cuantia'),
                observaciones: checkData(dm.PresupuestoEjecutado_Observaciones, 'PresupuestoEjecutado_observaciones'),
            },
            ejecucionPresupuestaria: {
                previsto: checkData(dm.EjecucionPresupuestaria_Previsto, 'EjecucionPresupuestaria_previsto'),
                ejecutado: checkData(dm.EjecucionPresupuestaria_Ejecutado, 'EjecucionPresupuestaria_ejecutado'),
                porcentaje: checkData(dm.EjecucionPresupuestaria_Porcentaje, 'EjecucionPresupuestaria_porcentaje'),
            },
            observaciones: checkData(dm.Observaciones, 'Observaciones'),
            valFinal: checkData(dm.ValFinal, 'ValFinal'),
            dSeguimiento: checkData(dm.DSeguimiento, 'DSeguimiento'),
            sActual: checkData(dm.SActual, 'SActual') as EstadoLabel,
        };
    }
};

// Transformar Indicadores de Realización
export const transformIndicadoresRealizacion = (items?: IndicadorRealizacionAccionDTO[]): IndicadorRealizacionAccion[] =>
    (items ?? []).map((item) => ({
        id: checkData(item.IndicadorRealizacionId, 'Id', '0'),
        descripcion: item.NameEs ? item.NameEs : item.NameEu ? item.NameEu : '',
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
        //idsResultados: checkData(item.IdsResultados, 'IdsResultados', '').map((id: string) => id.trim()),
        indicadorRealizacionId: checkData(item.IndicadorRealizacionId, 'IndicadorRealizacionId', undefined) as number | undefined,
    }));

// Transformar Indicadores de Resultado
export const transformIndicadoresResultado = (items?: IndicadorResultadoAccionDTO[]): IndicadorResultadoAccion[] =>
    (items ?? []).map((item) => ({
        id: checkData(item.IndicadorResultadoId, 'Id', '0'),
        descripcion: item.NameEs ? item.NameEs : item.NameEu ? item.NameEu : '',
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

export const accionesTransformadasBackAFront = (eje: EjeBBDD2): DatosAccion[] =>
    eje.Acciones.map((accion: DatosAccionDTO) => {
        const dataPlan = transformDatosPlan(accion.DatosPlan);
        const dataMemoria = transformDatosMemoria(accion.DatosMemoria);
        let indicadorRealizacionAccion: IndicadorRealizacionAccion[] = [];
        let indicadorResultadoAccion: IndicadorResultadoAccion[] = [];
        if (accion.IndicadorRealizacionAcciones && accion.IndicadorResultadoAcciones) {
            indicadorRealizacionAccion = transformIndicadoresRealizacion(accion.IndicadorRealizacionAcciones);
            indicadorResultadoAccion = transformIndicadoresResultado(accion.IndicadorResultadoAcciones);
        } else {
            indicadorRealizacionAccion = transformIndicadoresRealizacion(accion.IndicadoresRealizacionAccion);
            indicadorResultadoAccion = transformIndicadoresResultado(accion.IndicadoresResultadoAccion);
        }

        return {
            id: checkData(accion?.Id, 'Id', '0'),
            accion: checkData(accion?.Nombre, 'Nombre'),
            lineaActuaccion: checkData(accion?.LineaActuaccion, 'LineaAcctuacion'),
            plurianual: checkData(accion?.Plurianual, 'Plurianual', 'false'),
            indicadorAccion: {
                indicadoreRealizacion: indicadorRealizacionAccion,
                indicadoreResultado: indicadorResultadoAccion,
            },
            ejeEs: eje.EjeGlobal.NameEs,
            ejeEu: eje.EjeGlobal.NameEu,
            DatosPlanId: `${accion.DatosPlanId}`,
            DatosMemoriaId: `${accion.DatosMemoriaId}`,
            datosPlan: dataPlan,
            datosMemoria: dataMemoria,
            ejeId: `${eje.EjeGlobal.Id}`,
        };
    });

export const accionTransformadaBackAFront = (accion: DatosAccionDTO, ejeEs: string, ejeEu: string, ejeId: string): DatosAccion => {
    const dataPlan = transformDatosPlan(accion.DatosPlan);
    const dataMemoria = transformDatosMemoria(accion.DatosMemoria);

    let indicadorRealizacionAccion: IndicadorRealizacionAccion[] = [];
    let indicadorResultadoAccion: IndicadorResultadoAccion[] = [];

    if (accion.IndicadorRealizacionAcciones && accion.IndicadorResultadoAcciones) {
        indicadorRealizacionAccion = transformIndicadoresRealizacion(accion.IndicadorRealizacionAcciones);
        indicadorResultadoAccion = transformIndicadoresResultado(accion.IndicadorResultadoAcciones);
    } else {
        indicadorRealizacionAccion = transformIndicadoresRealizacion(accion.IndicadoresRealizacionAccion);
        indicadorResultadoAccion = transformIndicadoresResultado(accion.IndicadoresResultadoAccion);
    }

    const lineaActuacion = accion?.LineaAcctuacion ?? accion?.LineaActuaccion ?? '';
    const idPlan = accion?.DatosPlanId ? accion?.DatosPlanId : accion.DatosPlan?.Id ? accion.DatosPlan?.Id : '0';
    const idMemoria = accion?.DatosPlanId ? accion?.DatosPlanId : accion.DatosMemoria?.Id ? accion.DatosMemoria?.Id : '0';
    return {
        id: checkData(accion?.Id, 'Id', '0'),
        accion: checkData(accion?.Nombre, 'Nombre'),
        lineaActuaccion: checkData(lineaActuacion, 'LineaAcctuacion'),
        plurianual: checkData(accion?.Plurianual, 'Plurianual', 'false'),
        indicadorAccion: {
            indicadoreRealizacion: indicadorRealizacionAccion,
            indicadoreResultado: indicadorResultadoAccion,
        },
        ejeEs,
        ejeEu,
        DatosPlanId: `${idPlan}`,
        DatosMemoriaId: `${idMemoria}`,
        datosPlan: dataPlan,
        datosMemoria: dataMemoria,
        ejeId,
    };
};

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
        id: i.Id ?? 0,
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
        tipo: i.Tipo,
    }));

export const convertirServicios = (serviciosDTO: ServiciosDTOConvertIndicadores[], regionesDisponibles: RegionInterface[]): Servicios[] => {
    return serviciosDTO.map((dto) => {
        const regionLider = regionesDisponibles.find((r) => r.RegionId === dto.ServiciosCompartida?.RegionLiderId?.toString());

        const regionesCompartidas: RegionInterface[] =
            dto.ServiciosCompartida?.ServiciosCompartidaRegiones?.map((reg) => {
                const region = regionesDisponibles.find((r) => r.RegionId === reg.RegionId.toString());
                return (
                    region || {
                        RegionId: reg.RegionId.toString(),
                        NameEs: '',
                        NameEu: '',
                    }
                );
            }) || [];

        const servicio: Servicios = {
            id: dto.Id ?? 0,
            nombre: dto.Nombre,
            descripcion: dto.Descripcion,
            indicadores: convertirIndicadoresServicios(dto.Indicadores ?? []),
            idEje: dto.EjeGlobalIdInt || dto.EjeGlobalId,
            lineaActuaccion: dto.LineaActuaccion,
            dSeguimiento: dto.DSeguimiento,
            supraComarcal: dto.Supracomarcal,
            valFinal: dto.ValFinal,
            serviciosCompartidaId: dto.ServiciosCompartidaId,
            serviciosCompartidas: dto.ServiciosCompartida
                ? {
                      idCompartida: dto.ServiciosCompartida.Id,
                      regionLider: regionLider || {
                          RegionId: dto.ServiciosCompartida.RegionLiderId.toString(),
                          NameEs: '',
                          NameEu: '',
                      },
                      regiones: regionesCompartidas,
                  }
                : undefined,
        };

        return servicio;
    });
};

export const convertirEje = (eje: EjeBBDD2): Ejes => ({
    Id: `${eje.Id}`,
    NameEs: eje.EjeGlobal.NameEs,
    NameEu: eje.EjeGlobal.NameEu,
    IsActive: eje.EjeGlobal.IsActive,
    IsPrioritarios: eje.IsPrioritario,
    IsAccessory: eje.IsAccessory,
    acciones: accionesTransformadasBackAFront(eje),
});

export const normalizarServicios = (servicios: ServiciosDTO[] | ServiciosDTOConvertIndicadores[]): ServiciosDTOConvertIndicadores[] => {
    return (servicios ?? []).map((s) => {
        if ('Indicadores' in s) {
            return s as ServiciosDTOConvertIndicadores;
        }
        return {
            Id: s.Id,
            Nombre: s.Nombre,
            Descripcion: s.Descripcion,
            Indicadores: s.IndicadoresServicios,
            DSeguimiento: s.DSeguimiento,
            ValFinal: s.ValFinal,
            RegionId: s.RegionId,
            Year: s.Year,
            EjeGlobalId: s.EjeGlobalId,
            EjeGlobalIdInt: s.EjeGlobalIdInt,
            LineaActuaccion: s.LineaActuaccion,
            ServiciosCompartidaId: s.ServiciosCompartidaId !== undefined ? s.ServiciosCompartidaId : 0,
            ServiciosCompartida: s.ServiciosCompartida,
            Supracomarcal: s.SupraComarcal,
        };
    });
};

export const construirYearData = (
    data: YearDataDTO,
    nombreRegionSeleccionada: string,
    planStatus: string,
    memoriaStatus: string,
    generalOperationADR: GeneralOperationADR,
    ejesRestantes: Ejes[],
    ejesPrioritarios: Ejes[],
    ejes: Ejes[],
    anioSeleccionada: number,
    regionesDisponibles: RegionInterface[]
): YearData => {
    const serviciosConvertidos: ServiciosDTOConvertIndicadores[] = normalizarServicios(data.Servicios);
    const servicios: Servicios[] = convertirServicios(serviciosConvertidos, regionesDisponibles);

    return {
        nombreRegion: nombreRegionSeleccionada ?? '',
        year: anioSeleccionada,
        plan: {
            id: `${data.Plan.Id}`,
            ejes: ejes,
            ejesRestantes: ejesRestantes,
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

export interface Nodo {
    Nombre: string;
    RutaRelativa: string;
    EsCarpeta: boolean;
    Hijos: Nodo[];
}

function BuscarNodoPorRuta(nodos: Nodo[], rutaBuscada?: 'Plan' | 'Memoria' | 'Firma'): Nodo | undefined {
    for (const nodo of nodos) {
        if (rutaBuscada && nodo.RutaRelativa.toLowerCase() === rutaBuscada.toLowerCase()) {
            return nodo;
        }
        if (nodo.Hijos.length > 0) {
            const encontrado = BuscarNodoPorRuta(nodo.Hijos, rutaBuscada);
            if (encontrado) return encontrado;
        }
    }
    return undefined;
}
export function BuscarNodo(datosRecibidos: Nodo, rutaBuscada?: 'Plan' | 'Memoria' | 'Firma'): Nodo {
    if (!rutaBuscada) {
        return datosRecibidos.Hijos.find((h) => h.RutaRelativa.toLowerCase() === '') ?? datosRecibidos;
    }
    return BuscarNodoPorRuta(datosRecibidos.Hijos, rutaBuscada) ?? datosRecibidos;
}

export interface Archivo {
    nombre: string;
    url: string;
}

export const TransformarArchivos = (datosRecibidos: Nodo, carpetaObjetio?: 'Plan' | 'Memoria' | 'Firma'): Archivo[] => {
    const resultado: Archivo[] = [];
    const primerNodo = carpetaObjetio ? BuscarNodoPorRuta(datosRecibidos.Hijos, carpetaObjetio) ?? datosRecibidos : datosRecibidos;
    if (primerNodo.Hijos && primerNodo.Hijos.length > 0) {
        const archivoPrincipal = primerNodo.Hijos.find((h) => !h.EsCarpeta);
        if (archivoPrincipal) {
            resultado.push({
                nombre: archivoPrincipal.Nombre,
                url: archivoPrincipal.RutaRelativa,
            });
        }

        primerNodo.Hijos.forEach((h) => {
            if (h.EsCarpeta && h.Hijos.length > 0) {
                h.Hijos.forEach((sub) => {
                    if (!sub.EsCarpeta) {
                        resultado.push({
                            nombre: sub.Nombre,
                            url: sub.RutaRelativa,
                        });
                    }
                });
            }
        });
    }

    return resultado;
};
export const TransformarArchivosAFile = (datosRecibidos: Nodo): File[] => {
    const resultado: File[] = [];

    const primerNodo = datosRecibidos;
    if (primerNodo.Hijos && primerNodo.Hijos.length > 0) {
        const archivoPrincipal = primerNodo.Hijos.find((h) => !h.EsCarpeta);
        if (archivoPrincipal) {
            resultado.push(new File([''], archivoPrincipal.Nombre));
        }

        primerNodo.Hijos.forEach((h) => {
            if (h.EsCarpeta && h.Hijos.length > 0) {
                h.Hijos.forEach((sub) => {
                    if (!sub.EsCarpeta) {
                        resultado.push(new File([''], sub.Nombre));
                    }
                });
            }
        });
    }

    return resultado;
};

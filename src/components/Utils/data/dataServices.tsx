/* eslint-disable no-unused-vars */
import { Dispatch, SetStateAction } from 'react';
import { IndicadoresServiciosDTO, Servicios, ServiciosDTO } from '../../../types/GeneralTypes';
import { LlamadasBBDD } from './utilsData';

interface GestionServicioProps {
    idServicio?: number;
    datosEditandoServicio: Servicios;
    regionSeleccionada: string;
    anioSeleccionada: number;
    method: 'POST' | 'PUT';
    setLoading: (a: boolean) => void;
    setSuccessMessage?: Dispatch<SetStateAction<string>>;
    setErrorMessage?: Dispatch<SetStateAction<string>>;
    duplicacionServicio?: boolean;
}

export const gestionarServicio = async ({
    idServicio,
    datosEditandoServicio,
    regionSeleccionada,
    anioSeleccionada,
    method,
    setLoading,
    setSuccessMessage,
    setErrorMessage,
    duplicacionServicio,
}: GestionServicioProps): Promise<Servicios | undefined> => {
    const indicadoresServiciosDto: IndicadoresServiciosDTO[] = datosEditandoServicio.indicadores.map((i) => ({
        Indicador: i.indicador,
        PrevistoHombres: i.previsto?.hombres ?? '',
        PrevistoMujeres: i.previsto?.mujeres ?? '',
        PrevistoValor: i.previsto?.valor ?? '',
        AlcanzadoHombres: i.alcanzado?.hombres ?? '',
        AlcanzadoMujeres: i.alcanzado?.mujeres ?? '',
        AlcanzadoValor: i.alcanzado?.valor ?? '',
        Tipo: i.tipo ?? '',
    }));

    const servicioDTO: ServiciosDTO = {
        Nombre: datosEditandoServicio.nombre,
        Descripcion: datosEditandoServicio.descripcion,
        ValFinal: datosEditandoServicio.valFinal,
        DSeguimiento: datosEditandoServicio.dSeguimiento,
        IndicadoresServicios: indicadoresServiciosDto,
        RegionId: Number(regionSeleccionada),
        Year: anioSeleccionada,
        EjeGlobalId: typeof datosEditandoServicio.idEje === 'string' ? datosEditandoServicio.idEje : '',
        EjeGlobalIdInt: typeof datosEditandoServicio.idEje === 'number' ? datosEditandoServicio.idEje : 0,
        LineaActuaccion: datosEditandoServicio.lineaActuaccion,
        ServiciosCompartida: datosEditandoServicio.serviciosCompartidas
            ? {
                  Id: datosEditandoServicio.serviciosCompartidas.idCompartida,
                  RegionLiderId: Number(datosEditandoServicio.serviciosCompartidas.regionLider.RegionId),
                  ServiciosCompartidaRegiones: datosEditandoServicio.serviciosCompartidas.regiones.map((e) => ({
                      RegionId: Number(e.RegionId),
                  })),
              }
            : undefined,
        ServiciosCompartidaId: datosEditandoServicio.serviciosCompartidas ? datosEditandoServicio.serviciosCompartidas.idCompartida ?? 0 : 0,
        SupraComarcal: datosEditandoServicio.supraComarcal,
    };

    let url = method === 'POST' ? `services/newService` : `services/${idServicio}/updateService`;

    if (duplicacionServicio) {
        url = `services/${idServicio}/duplicateService/`;
    }
    let resultado: Servicios | undefined = undefined;

    return new Promise<Servicios | undefined>((resolve) => {
        LlamadasBBDD({
            method,
            url,
            body: servicioDTO,
            setLoading: setLoading ?? (() => {}),
            setSuccessMessage,
            setErrorMessage,
            onSuccess(response: { data: ServiciosDTO & { Id: number } }) {
                const data = response.data;
                resultado = {
                    id: data.Id,
                    nombre: data.Nombre,
                    descripcion: data.Descripcion,
                    dSeguimiento: data.DSeguimiento ?? undefined,
                    valFinal: data.ValFinal ?? undefined,
                    idEje: data.EjeGlobalIdInt,
                    lineaActuaccion: data.LineaActuaccion,
                    serviciosCompartidaId: data.ServiciosCompartidaId,
                    ServicioDuplicadaDeId: duplicacionServicio ? data.ServicioDuplicadaDeId : undefined,
                    serviciosCompartidas: data.ServiciosCompartida
                        ? {
                              idCompartida: data.ServiciosCompartida.Id,
                              regionLider: data.ServiciosCompartida.RegionLiderId
                                  ? { RegionId: String(data.ServiciosCompartida.RegionLiderId), NameEs: '', NameEu: '' }
                                  : { RegionId: '', NameEs: '', NameEu: '' },
                              regiones:
                                  data.ServiciosCompartida.ServiciosCompartidaRegiones?.map((r) => ({
                                      RegionId: String(r.RegionId),
                                      NameEs: '',
                                      NameEu: '',
                                  })) ?? [],
                          }
                        : undefined,
                    supraComarcal: data.SupraComarcal,
                    indicadores: data.IndicadoresServicios.map((i) => ({
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
                        tipo: i.Tipo ?? '',
                    })),
                    regionesServicioDuplicada:
                        data.ServiciosCompartidaRegionesDuplicada?.map((r) => ({
                            RegionId: String(r.RegionId),
                            NameEs: '',
                            NameEu: '',
                        })) ?? [],
                };
                resolve(resultado);
            },
            onError() {
                resolve(undefined);
            },
        });
    });
};

interface EliminarServicioProps {
    idServicio: number;
    setLoading?: Dispatch<SetStateAction<boolean>>;
    setSuccessMessage?: Dispatch<SetStateAction<string>>;
    setErrorMessage?: Dispatch<SetStateAction<string>>;
}

export const eliminarServicio = async ({ idServicio, setLoading, setSuccessMessage, setErrorMessage }: EliminarServicioProps): Promise<boolean> => {
    return new Promise((resolve) => {
        LlamadasBBDD({
            method: 'DELETE',
            url: `/services/${idServicio}/deleteService`,
            setLoading: setLoading ?? (() => {}),
            setSuccessMessage,
            setErrorMessage,
            onSuccess() {
                resolve(true);
            },
            onError() {
                resolve(false);
            },
        });
    });
};

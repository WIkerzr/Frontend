/* eslint-disable no-unused-vars */
import { Dispatch, SetStateAction } from 'react';
import { Servicios, IndicadoresServiciosDTO, ServiciosDTO } from '../../../types/GeneralTypes';
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
}: GestionServicioProps): Promise<Servicios | undefined> => {
    const indicadoresServiciosDto: IndicadoresServiciosDTO[] = datosEditandoServicio.indicadores.map((i) => ({
        Indicador: i.indicador,
        PrevistoHombres: i.previsto?.hombres ?? '',
        PrevistoMujeres: i.previsto?.mujeres ?? '',
        PrevistoValor: i.previsto?.valor ?? '',
        AlcanzadoHombres: i.alcanzado?.hombres ?? '',
        AlcanzadoMujeres: i.alcanzado?.mujeres ?? '',
        AlcanzadoValor: i.alcanzado?.valor ?? '',
    }));

    const servicioDTO: ServiciosDTO = {
        Nombre: datosEditandoServicio.nombre,
        Descripcion: datosEditandoServicio.descripcion,
        ValFinal: datosEditandoServicio.valFinal,
        DSeguimiento: datosEditandoServicio.dSeguimiento,
        IndicadoresServicios: indicadoresServiciosDto,
        RegionId: Number(regionSeleccionada),
        Year: anioSeleccionada,
    };

    const url = method === 'POST' ? `/services/newService` : `/services/${idServicio}/updateService`;

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
                    indicadores: data.IndicadoresServicios.map((i) => ({
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
                    })),
                };
                resolve(resultado);
            },
            onError() {
                resolve(undefined);
            },
        });
    });

    return resultado;
};

interface EliminarServicioProps {
    idServicio: number;
    setLoading?: Dispatch<SetStateAction<boolean>>;
    setSuccessMessage?: Dispatch<SetStateAction<string | null>>;
    setErrorMessage?: Dispatch<SetStateAction<string | null>>;
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

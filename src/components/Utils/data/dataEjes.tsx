/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { EjesBBDD, LineasActuaccion } from '../../../types/tipadoPlan';
import { actualizarFechaLLamada } from '../utils';
import { LlamadasBBDD } from './utilsData';

export interface MessageSetters {
    setErrorMessage: (msg: string) => void;
    setSuccessMessage: (msg: string) => void;
}

export const LlamadaBBDDEjesRegion = async (
    regionSeleccionada: string | null,
    t: (key: string) => string,
    i18n: { language: string },
    message: MessageSetters,
    setLoading?: (loading: boolean) => void,
    setEjesEstrategicos?: (data: EjesBBDD[]) => void,
    setFechaUltimoActualizadoBBDD?: React.Dispatch<React.SetStateAction<Date>>,
    setEjesGlobales?: (data: EjesBBDD[]) => void
): Promise<void> => {
    return new Promise((resolve, reject) => {
        LlamadasBBDD({
            method: 'GET',
            url: `/ejes/${regionSeleccionada}`,
            setLoading: setLoading ?? (() => {}),
            setErrorMessage: message.setErrorMessage,
            setSuccessMessage: message.setSuccessMessage,
            setFechaUltimoActualizadoBBDD: setFechaUltimoActualizadoBBDD,
            onSuccess: (data: any) => {
                const ejesEstrategicos = data.data.ejes;
                const lineaActuaccion = data.data.lineasActuacion;
                const todosLosEjes = data.data.todosEjes;
                const lineaActuaccionTodos = data.data.todoslineasActuacion;

                try {
                    const arrayMapeado = ejesEstrategicos.map((ejes: EjesBBDD) => ({
                        ...ejes,
                        Id: ejes.EjeId,
                        NameEs: ejes.NameEs || '',
                        NameEu: ejes.NameEu || '',
                        IsActive: ejes.IsActive || false,
                        IsPrioritarios: ejes.IsPrioritarios || false,
                        LineasActuaccion: lineaActuaccion.filter((la: LineasActuaccion) => la.EjeId === ejes.EjeId),
                    }));

                    const datosEstrategicosOrdenados = arrayMapeado.sort((a: { NameEs: any; NameEu: any }, b: { NameEs: any; NameEu: any }) =>
                        i18n!.language === 'es' ? (a?.NameEs ?? '').localeCompare(b.NameEs) : (a?.NameEu ?? '').localeCompare(b.NameEu)
                    );

                    const arrayMapeadoTodosLosEjes = todosLosEjes.map((ejes: EjesBBDD) => ({
                        ...ejes,
                        Id: ejes.EjeId,
                        NameEs: ejes.NameEs || '',
                        NameEu: ejes.NameEu || '',
                        IsActive: ejes.IsActive || false,
                        IsPrioritarios: ejes.IsPrioritarios || false,
                        LineasActuaccion: lineaActuaccionTodos.filter((la: LineasActuaccion) => la.EjeId === ejes.EjeId),
                    }));

                    const datosOrdenadosTodosLosEjes = arrayMapeadoTodosLosEjes.sort((a: { NameEs: any; NameEu: any }, b: { NameEs: any; NameEu: any }) =>
                        i18n!.language === 'es' ? (a?.NameEs ?? '').localeCompare(b.NameEs) : (a?.NameEu ?? '').localeCompare(b.NameEu)
                    );

                    if (setEjesEstrategicos) {
                        setEjesEstrategicos(datosEstrategicosOrdenados);
                    }
                    if (setEjesGlobales) {
                        setEjesGlobales(datosOrdenadosTodosLosEjes);
                    }
                    if (setFechaUltimoActualizadoBBDD) {
                        setFechaUltimoActualizadoBBDD(new Date());
                    }
                    sessionStorage.setItem(
                        'ejesRegion',
                        JSON.stringify({
                            ejesEstrategicos: JSON.stringify(datosEstrategicosOrdenados),
                            ejesGlobales: JSON.stringify(datosOrdenadosTodosLosEjes),
                        })
                    );

                    actualizarFechaLLamada('ejesRegion');
                    if (setLoading) {
                        setLoading(false);
                    }

                    message.setErrorMessage(t('error:errorFaltanDatosEjes'));
                    setLoading?.(false);
                    resolve(datosEstrategicosOrdenados);
                } catch (err) {
                    setLoading?.(false);
                    reject(err);
                }
            },
            onError: (err: any) => {
                setLoading?.(false);
                message.setErrorMessage?.(t('error:errorCargandoDatos'));
                reject(err);
            },
        });
    });
};

export const LlamadaBBDDTodosEjes = async (
    regionSeleccionada: string | null,
    t: (key: string) => string,
    i18n: { language: string },
    message: MessageSetters,
    setLoading?: (loading: boolean) => void,
    setEjes?: (data: EjesBBDD[]) => void,
    setFechaUltimoActualizadoBBDD?: React.Dispatch<React.SetStateAction<Date>>
): Promise<void> => {
    return new Promise((resolve, reject) => {
        LlamadasBBDD({
            method: 'GET',
            url: `/ejes`,
            setLoading: setLoading ?? (() => {}),
            setErrorMessage: message.setErrorMessage,
            setSuccessMessage: message.setSuccessMessage,
            setFechaUltimoActualizadoBBDD: setFechaUltimoActualizadoBBDD,
            onSuccess: (data: any) => {
                try {
                    const arrayMapeado = data.data.map((ejes: EjesBBDD) => ({
                        ...ejes,
                        Id: ejes.EjeId,
                        NameEs: ejes.NameEs || '',
                        NameEu: ejes.NameEu || '',
                        IsActive: ejes.IsActive || false,
                        IsPrioritarios: ejes.IsPrioritarios || false,
                        LineasActuaccion: data.lineasActuacion.filter((la: LineasActuaccion) => la.EjeId === ejes.EjeId),
                    }));

                    const datosOrdenados = arrayMapeado.sort((a: { NameEs: any; NameEu: any }, b: { NameEs: any; NameEu: any }) =>
                        i18n!.language === 'es' ? (a?.NameEs ?? '').localeCompare(b.NameEs) : (a?.NameEu ?? '').localeCompare(b.NameEu)
                    );
                    if (setEjes) {
                        setEjes(datosOrdenados);
                    }
                    if (setFechaUltimoActualizadoBBDD) {
                        setFechaUltimoActualizadoBBDD(new Date());
                    }
                    sessionStorage.setItem('ejesRegion', JSON.stringify(datosOrdenados));

                    actualizarFechaLLamada('ejesRegion');
                    if (setLoading) {
                        setLoading(false);
                    }

                    message.setErrorMessage(t('error:errorFaltanDatosEjes'));
                    setLoading?.(false);
                    resolve(datosOrdenados);
                } catch (err) {
                    setLoading?.(false);
                    reject(err);
                }
            },
            onError: (err: any) => {
                setLoading?.(false);
                message.setErrorMessage?.(t('error:errorCargandoDatos'));
                reject(err);
            },
        });
    });
};

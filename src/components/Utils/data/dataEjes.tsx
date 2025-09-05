/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { EjesBBDD, LineasActuaccion } from '../../../types/tipadoPlan';
import { actualizarFechaLLamada } from '../utils';
import { LlamadasBBDD } from './utilsData';

export const LlamadaBBDDEjesRegion = async (
    regionSeleccionada: string | null,
    t: (key: string) => string,
    i18n: { language: string },
    setLoading?: (loading: boolean) => void,
    setEjes?: (data: EjesBBDD[]) => void,
    setFechaUltimoActualizadoBBDD?: React.Dispatch<React.SetStateAction<Date>>,
    setErrorMessage?: (msg: string) => void
): Promise<void> => {
    if (setErrorMessage) {
        setErrorMessage('');
    }
    return new Promise((resolve, reject) => {
        LlamadasBBDD({
            method: 'GET',
            url: `/ejes/${regionSeleccionada}`,
            setLoading: setLoading ?? (() => {}),
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
                    localStorage.setItem('ejesRegion', JSON.stringify(datosOrdenados));

                    actualizarFechaLLamada('ejesRegion');
                    if (setLoading) {
                        setLoading(false);
                    }

                    if (setErrorMessage && data.data.length === 0) {
                        setErrorMessage(t('error:errorFaltanDatosEjes'));
                    }
                } catch (err) {
                    setLoading?.(false);
                    reject(err);
                }
            },
            onError: (err: any) => {
                setLoading?.(false);
                setErrorMessage?.(t('error:errorCargandoDatos'));
                reject(err);
            },
        });
    });
};

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { EjesBBDD, LineasActuaccion } from '../../../types/tipadoPlan';
import { LlamadasBBDD } from './utilsData';

export const LlamadaBBDDEjesRegion = async (
    regionSeleccionada: string | null,
    setLoading: (loading: boolean) => void,
    setEjes: (data: EjesBBDD[]) => void,
    t: (key: string) => string,
    i18n: { language: string },
    setFechaUltimoActualizadoBBDD?: React.Dispatch<React.SetStateAction<Date>>,
    setErrorMessage?: (msg: string) => void
) => {
    if (setErrorMessage) {
        setErrorMessage('');
    }
    LlamadasBBDD({
        method: 'GET',
        url: `/ejes/${regionSeleccionada}`,
        setLoading: setLoading,
        setFechaUltimoActualizadoBBDD: setFechaUltimoActualizadoBBDD,
        onSuccess: (data: any) => {
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

            setEjes(datosOrdenados);
            if (setFechaUltimoActualizadoBBDD) {
                setFechaUltimoActualizadoBBDD(new Date());
            }
            setLoading(false);

            if (setErrorMessage && data.data.length === 0) {
                setErrorMessage(t('error:errorFaltanDatosEjes'));
            }
        },
    });
};

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { ApiTarget } from '../controlDev';
import { LlamadasBBDD } from '../utilsData';

export interface MessageSetters {
    setErrorMessage: (msg: string) => void;
    setSuccessMessage: (msg: string) => void;
}
export const LlamadaBBDDSubirPCDR = async (
    regionSeleccionada: string | null,
    archivos: File[],
    message: MessageSetters,
    setLoading: (loading: boolean) => void,
    onSuccess: (data: any) => void
): Promise<void> => {
    const formData = new FormData();
    archivos.forEach((file) => {
        formData.append('files', file);
    });

    setLoading(true);

    try {
        const accessToken = sessionStorage.getItem('access_token');

        const res = await fetch(`${ApiTarget}/pcdr/${regionSeleccionada}/Upload`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (!res.ok) {
            const text = await res.text();
            message.setErrorMessage(`Error en la subida: ${text}`);
            throw new Error(text);
        }

        const data = await res.json();
        message.setSuccessMessage(data.message || 'Archivo subido correctamente');
        onSuccess(data);
    } catch (err: any) {
        message.setErrorMessage(`Error en la petición: ${err.message}`);
        console.error('Error al subir PCDR:', err);
    } finally {
        setLoading(false);
    }
};

export const LlamadaBBDDVerPCDR = async (regionSeleccionada: string | null, message: MessageSetters, setLoading: (loading: boolean) => void, onSuccess: (data: any) => void): Promise<void> => {
    LlamadasBBDD({
        method: 'GET',
        url: `pcdr/${regionSeleccionada}/View`,
        setLoading: setLoading ?? (() => {}),
        setErrorMessage: message.setErrorMessage,
        setSuccessMessage: message.setSuccessMessage,
        onSuccess: onSuccess,
    });
};

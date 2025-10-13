/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Dispatch, SetStateAction } from 'react';
import { FetchConRefreshRetry, gestionarErrorServidor } from '../utils';
import { ApiTarget } from './controlDev';
import { MessageSetters } from './dataEjes';
export type ApiSuccess<T> = {
    success: boolean;
    message: string;
    data: T;
    CamposFaltantes?: string;
    LineasActuacion?: {
        Id: string;
        Title: string;
        Description: string;
        EjeId: string;
    };
    IdEje?: number;
};
export type ApiError = {
    success: boolean;
    message: string;
    error: any;
};

type LlamadaBBDDParams<T = any, TBody = any> = {
    setLoading: (a: boolean) => void;
    setErrorMessage?: (a: string) => void;
    setSuccessMessage?: (a: string) => void;
    setFechaUltimoActualizadoBBDD?: Dispatch<SetStateAction<Date>>;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: TBody;
    url: string;
    onSuccess?: (data: ApiSuccess<T>) => void;
    onError?: (error: any) => void;
    onFinally?: () => void;
    sinContentType?: boolean;
};

export const LlamadasBBDD = async <T = any, TBody = any>({
    method,
    body,
    url,
    setLoading,
    setErrorMessage,
    setSuccessMessage,
    setFechaUltimoActualizadoBBDD,
    onSuccess,
    onError,
    onFinally,
}: LlamadaBBDDParams<T, TBody>) => {
    const fetchData = async () => {
        setLoading(true);
        const token = sessionStorage.getItem('access_token');
        try {
            const res = await FetchConRefreshRetry(`${ApiTarget}/${url}`, {
                method: method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : undefined,
            });
            const data = res.data;

            if (!res.ok) {
                const errorInfo = gestionarErrorServidor(res, data);
                setErrorMessage?.(errorInfo.mensaje);
                console.log(errorInfo.mensaje);
                return;
            }
            if (onSuccess) {
                onSuccess(data);
            }

            setFechaUltimoActualizadoBBDD?.(new Date());
            setSuccessMessage?.(data.message);
        } catch (err: unknown) {
            const errorInfo = gestionarErrorServidor(err);
            setErrorMessage?.(errorInfo.mensaje);
            if (onError) {
                onError(errorInfo);
            }
            console.log(errorInfo.mensaje);
        } finally {
            if (onFinally) {
                onFinally();
            }
            setLoading(false);
        }
    };

    fetchData();

    return null;
};

export const LlamadasBBDDSinJson = async <T = any, TBody = any>({
    method,
    body,
    url,
    setLoading,
    setErrorMessage,
    setSuccessMessage,
    setFechaUltimoActualizadoBBDD,
    onSuccess,
    onError,
    onFinally,
}: LlamadaBBDDParams<T, TBody>) => {
    const fetchData = async () => {
        setLoading(true);
        const token = sessionStorage.getItem('access_token');
        try {
            const res = await fetch(`${ApiTarget}/${url}`, {
                method,
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : undefined,
            });

            if (!res.ok) {
                const errorInfo = gestionarErrorServidor(res);
                setErrorMessage?.(errorInfo.mensaje);
                return;
            }

            const contentType = res.headers.get('content-type');
            let data: any;

            if (contentType?.includes('application/octet-stream')) {
                data = await res.blob();
            } else {
                data = await res.json();
            }

            onSuccess?.(data);
            setFechaUltimoActualizadoBBDD?.(new Date());
            if (data?.message) {
                setSuccessMessage?.(data.message);
            }
        } catch (err: unknown) {
            const errorInfo = gestionarErrorServidor(err);
            setErrorMessage?.(errorInfo.mensaje);
            onError?.(errorInfo);
        } finally {
            onFinally?.();
            setLoading(false);
        }
    };

    fetchData();
    return null;
};

export type RutasArchivos = 'Plan' | 'Plan/Anexos' | 'Memoria' | 'Memoria/Anexos' | 'Firma' | '';
export interface ArchivoBodyParams {
    RegionId: string;
    Year?: string;
    RutaArchivo: RutasArchivos;
    NombreArchivo: string;
}
interface ArchivoParams {
    message: MessageSetters;
    body: ArchivoBodyParams;
    setLoading: (loading: boolean) => void;
    ruta: string;
    onSuccess?: (data: any) => void;
}

export const LlamarDescargarArchivo = async ({ message, body, setLoading, ruta }: ArchivoParams) => {
    try {
        setLoading(true);
        const token = sessionStorage.getItem('access_token');
        const res = await fetch(`${ApiTarget}/${ruta}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!res.ok) {
            const text = await res.text();
            message.setErrorMessage?.(`Error al descargar: ${text}`);
            return;
        }

        const blob = await res.blob();
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = body.NombreArchivo;
        link.click();
        window.URL.revokeObjectURL(link.href);

        message.setSuccessMessage?.('Archivo descargado correctamente');
    } catch (err: any) {
        message.setErrorMessage?.(err.message || 'Error al descargar archivo');
    } finally {
        setLoading(false);
    }
};

export const LlamadaBBDDBorrarArchivo = async ({ message, body, setLoading, ruta, onSuccess }: ArchivoParams) => {
    LlamadasBBDD({
        method: 'POST',
        url: `/${ruta}`,
        body: body,
        setLoading: setLoading ?? (() => {}),
        setErrorMessage: message.setErrorMessage,
        setSuccessMessage: message.setSuccessMessage,
        onSuccess: onSuccess,
    });
};

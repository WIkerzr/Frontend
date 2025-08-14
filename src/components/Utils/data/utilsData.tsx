/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Dispatch, SetStateAction } from 'react';
import { FetchConRefreshRetry, gestionarErrorServidor } from '../utils';
import { ApiTarget } from './controlDev';

type LlamadaBBDDParams = {
    setLoading: (a: boolean) => void;
    setErrorMessage?: (a: string) => void;
    setSuccessMessage?: (a: string) => void;
    setFechaUltimoActualizadoBBDD?: Dispatch<SetStateAction<Date>>;
    method: 'GET' | 'POST' | 'PUT' | 'DELETE';
    body?: any;
    url: string;
    onSuccess?: (data: any) => void;
    onError?: (error: any) => void;
    onFinally?: () => void;
};

export const LlamadasBBDD = async ({ method, body, url, setLoading, setErrorMessage, setSuccessMessage, setFechaUltimoActualizadoBBDD, onSuccess, onError, onFinally }: LlamadaBBDDParams) => {
    const fetchData = async () => {
        setLoading(true);
        const token = sessionStorage.getItem('access_token');
        try {
            const res = await FetchConRefreshRetry(`${ApiTarget}/${url}`, {
                headers: {
                    method: method,
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json',
                },
                body: body ? JSON.stringify(body) : undefined,
            });
            const data = await res.json();

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

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { PlanOMemoria } from '../../../../pages/ADR/PlanMemoria/PlanMemoriaComponents';
import { GeneralOperationADR, GeneralOperationADRDTO, GeneralOperationADRDTOMemoria, MemoriaDTO, MemoriaLlamadaGestion, OperationalIndicatorsDTO, Plan, PlanDTO } from '../../../../types/tipadoPlan';
import { ApiTarget } from '../controlDev';
import { MessageSetters } from '../dataEjes';
import { ApiSuccess, LlamadasBBDD } from '../utilsData';

export const LlamadaBBDDActualizarPlan = async (regionSeleccionada: number, anioSeleccionada: number, setLoading: (loading: boolean) => void, message: MessageSetters, body: Plan): Promise<void> => {
    const operationalIndicators = body.generalOperationADR.operationalIndicators;

    const convertirOperationalIndicators: OperationalIndicatorsDTO[] = operationalIndicators.map((OI) => ({
        Id: isNaN(Number(OI.id)) ? 0 : Number(OI.id),
        NameEs: OI.nameEs,
        NameEu: OI.nameEu,
        Value: OI.value,
        ValueAchieved: OI.valueAchieved,
    }));
    const convertirGeneralOperationADR: GeneralOperationADRDTO = {
        AdrInternalTasks: body.generalOperationADR.adrInternalTasks,
        OperationalIndicators: convertirOperationalIndicators,
    };
    const convertirPlan: PlanDTO = {
        Id: body.id,
        Introduccion: body.introduccion,
        Proceso: body.proceso,
        GeneralOperationADR: convertirGeneralOperationADR,
    };
    LlamadasBBDD({
        method: 'POST',
        url: `yearData/${regionSeleccionada}/${Number(anioSeleccionada)}/updatePlan`,
        setLoading,
        body: convertirPlan,
        setErrorMessage: message.setErrorMessage,
        setSuccessMessage: message.setSuccessMessage,
    });
};

export const LlamadaBBDDActualizarMemoria = async (
    regionSeleccionada: number,
    anioSeleccionada: number,
    setLoading: (loading: boolean) => void,
    message: MessageSetters,
    generalOperationADR: GeneralOperationADR,
    body: MemoriaLlamadaGestion
): Promise<void> => {
    const operationalIndicators = body.generalOperationADR.operationalIndicators;

    const convertirOperationalIndicators: OperationalIndicatorsDTO[] = operationalIndicators.map((OI) => ({
        Id: Number(OI.id),
        NameEs: OI.nameEs,
        NameEu: OI.nameEu,
        Value: OI.value,
        ValueAchieved: OI.valueAchieved,
    }));
    const convertirGeneralOperationADR: GeneralOperationADRDTOMemoria = {
        DSeguimiento: generalOperationADR.dSeguimiento ?? '',
        ValFinal: generalOperationADR.valFinal ?? '',
        OperationalIndicators: convertirOperationalIndicators,
    };
    const convertirMemoria: MemoriaDTO = {
        Id: body.id,
        DSeguimiento: body.dSeguimiento,
        ValFinal: body.valFinal,
        GeneralOperationADR: convertirGeneralOperationADR,
    };

    LlamadasBBDD({
        method: 'POST',
        url: `yearData/${regionSeleccionada}/${Number(anioSeleccionada)}/updateMemoria`,
        setLoading,
        body: convertirMemoria,
        setErrorMessage: message.setErrorMessage,
        setSuccessMessage: message.setSuccessMessage,
    });
};

type LlamadaBBDDParams<T = any> = {
    regionSeleccionada: string | null;
    anioSeleccionada: number;
    setLoading: (loading: boolean) => void;
    message: MessageSetters;
    body: File[];
    planOMemoria: PlanOMemoria;
    onSuccess?: (data: ApiSuccess<T>) => void;
};

export const LlamadaBBDDEnviarArchivoPlanConAnexos = async <T = any>({ regionSeleccionada, anioSeleccionada, setLoading, message, body, planOMemoria, onSuccess }: LlamadaBBDDParams<T>) => {
    if (!regionSeleccionada) {
        message.setErrorMessage('No se ha seleccionado ninguna región.');
        return;
    }

    const formData = new FormData();
    for (let index = 0; index < body.length; index++) {
        formData.append('archivos', body[index]);
    }
    const zona = planOMemoria === 'Plan' ? `archivosPlan` : `archivosMemoria`;
    const route = `yearData/${regionSeleccionada}/${anioSeleccionada}/${zona}`;

    setLoading(true);
    try {
        const accessToken = sessionStorage.getItem('access_token');

        const res = await window.fetch(`${ApiTarget}/${route}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (!res.ok) {
            const text = await res.text();
            message.setErrorMessage(`Error en la subida: ${text}`);
            return;
        }

        const data = await res.json();
        message.setSuccessMessage(data.message || 'Archivo subido correctamente');

        if (onSuccess) {
            onSuccess(data);
        }
    } catch (err: any) {
        message.setErrorMessage(`Error en la petición: ${err.message}`);
        console.error(err);
    } finally {
        setLoading(false);
    }
};

type LlamadaBBDDArbolArchivos<T = any> = {
    regionSeleccionada: string | null;
    anioSeleccionada: number;
    setLoading: (loading: boolean) => void;
    message: MessageSetters;
    onSuccess?: (data: ApiSuccess<T>) => void;
};
export const LlamadaArbolArchivos = async <T = any>({ regionSeleccionada, anioSeleccionada, setLoading, message, onSuccess }: LlamadaBBDDArbolArchivos<T>) => {
    LlamadasBBDD({
        method: 'GET',
        url: `yearData/${regionSeleccionada}/${Number(anioSeleccionada)}/carpetaArchivos`,
        setLoading,
        setErrorMessage: message.setErrorMessage,
        setSuccessMessage: message.setSuccessMessage,
        onSuccess,
    });
};

type LlamadaBBDDFirmaParams<T = any> = {
    regionSeleccionada: string | null;
    anioSeleccionada: number;
    setLoading: (loading: boolean) => void;
    message: MessageSetters;
    body: File;
    onSuccess?: (data: ApiSuccess<T>) => void;
};

export const LlamadaBBDDFirma = async <T = any>({ regionSeleccionada, anioSeleccionada, setLoading, message, body, onSuccess }: LlamadaBBDDFirmaParams<T>) => {
    if (!regionSeleccionada) {
        message.setErrorMessage('No se ha seleccionado ninguna región.');
        return;
    }
    const formData = new FormData();
    formData.append('file', body);
    setLoading(true);
    try {
        const accessToken = sessionStorage.getItem('access_token');

        const res = await window.fetch(`${ApiTarget}/firma/${regionSeleccionada}/${anioSeleccionada}`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${accessToken}`,
            },
            body: formData,
        });

        if (!res.ok) {
            const text = await res.text();
            message.setErrorMessage(`Error en la subida: ${text}`);
            return;
        }

        const data = await res.json();
        message.setSuccessMessage(data.message || 'Archivo subido correctamente');

        if (onSuccess) {
            onSuccess(data);
        }
    } catch (err: any) {
        message.setErrorMessage(`Error en la petición: ${err.message}`);
        console.error(err);
    } finally {
        setLoading(false);
    }
};

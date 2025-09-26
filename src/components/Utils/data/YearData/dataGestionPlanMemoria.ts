/* eslint-disable no-unused-vars */
import { GeneralOperationADR, GeneralOperationADRDTO, GeneralOperationADRDTOMemoria, MemoriaDTO, MemoriaLlamadaGestion, OperationalIndicatorsDTO, Plan, PlanDTO } from '../../../../types/tipadoPlan';
import { MessageSetters } from '../dataEjes';
import { LlamadasBBDD } from '../utilsData';

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
        url: `yearData/{${regionSeleccionada}}/${Number(anioSeleccionada)}/updateMemoria`,
        setLoading,
        body: convertirMemoria,
        setErrorMessage: message.setErrorMessage,
        setSuccessMessage: message.setSuccessMessage,
    });
};

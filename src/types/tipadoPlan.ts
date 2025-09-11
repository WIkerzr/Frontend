import { Estado, Servicios } from './GeneralTypes';
import { DatosAccion } from './TipadoAccion';

export type Year = number;

export interface LineasActuaccion {
    Id: string;
    Title: string;
    Description: string;
    EjeId: string;
}
export interface GeneralOperationADR {
    adrInternalTasks: string;
    operationalIndicators: OperationalIndicators[];
    dSeguimiento?: string;
    valFinal?: string;
}
export interface GeneralOperationADRDTO {
    AdrInternalTasks: string;
    OperationalIndicators: OperationalIndicatorsDTO[];
}
export interface GeneralOperationADRDTOMemoria {
    DSeguimiento: string;
    ValFinal: string;
    OperationalIndicators: OperationalIndicatorsDTO[];
}
export interface GeneralOperationADRDTOCompleto {
    AdrInternalTasks: string;
    OperationalIndicators: OperationalIndicatorsDTO[];
    DSeguimiento: string;
    ValFinal: string;
}

export interface OperationalIndicators {
    id: string;
    value: string;
    nameEs: string;
    nameEu: string;
    valueAchieved: string;
}

export interface OperationalIndicatorsDTO {
    Id: number;
    Value: string;
    NameEs: string;
    NameEu: string;
    ValueAchieved: string;
}

export interface Ejes {
    Id: string;
    NameEs: string;
    NameEu: string;
    IsActive: boolean;
    IsPrioritarios: boolean;
    acciones: DatosAccion[];
    LineasActuaccion?: LineasActuaccion[];
}

export interface EjesBBDD {
    EjeId: string;
    NameEs: string;
    NameEu: string;
    IsActive: boolean;
    IsPrioritarios: boolean;
    acciones: DatosAccion[];
    LineasActuaccion: LineasActuaccion[];
}
export interface EjeBBDD {
    Id: string;
    NameEs: string;
    NameEu: string;
    IsActive: boolean;
    IsPrioritarios: boolean;
    Acciones: DatosAccion[];
}
export interface EjeIndicadorBBDD {
    EjeId: string;
    NameEs: string;
    NameEu: string;
}

export interface Plan {
    id: string;
    ejes: Ejes[];
    ejesPrioritarios: Ejes[];
    introduccion: string;
    proceso: string;
    generalOperationADR: GeneralOperationADR;
    status: Estado;
}
export interface PlanDTO {
    Id: string;
    Introduccion: string;
    Proceso: string;
    GeneralOperationADR: GeneralOperationADRDTO;
}
export interface Memoria {
    id: string;
    status: Estado;
    dSeguimiento: string;
    valFinal: string;
}
export interface MemoriaLlamadaGestion {
    id: string;
    dSeguimiento: string;
    valFinal: string;
    generalOperationADR: GeneralOperationADR;
}
export interface MemoriaDTO {
    Id: string;
    DSeguimiento: string;
    ValFinal: string;
    GeneralOperationADR: GeneralOperationADRDTOMemoria;
}

export interface YearData {
    year: Year;
    nombreRegion: string;
    plan: Plan;
    memoria: Memoria;
    accionesAccesorias?: DatosAccion[];
    servicios?: Servicios[];
}

export interface InitialDataResponse {
    data: YearData[];
    idRegion: string;
}

export const servicioIniciadoVacio: Servicios = {
    id: 0,
    nombre: '',
    descripcion: ``,
    indicadores: [
        {
            indicador: '',
            previsto: {
                valor: '',
            },
            alcanzado: {
                valor: '',
            },
        },
    ],
};

export const yearIniciadoVacio: YearData = {
    year: 0,
    nombreRegion: '',
    plan: {
        id: '',
        status: 'borrador',
        introduccion: '',
        ejes: [],
        ejesPrioritarios: [],
        proceso: '',
        generalOperationADR: {
            adrInternalTasks: '',
            operationalIndicators: [],
        },
    },
    memoria: {
        id: '',
        status: 'borrador',
        dSeguimiento: '',
        valFinal: '',
    },
    accionesAccesorias: [],
    servicios: [],
};

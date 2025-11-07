import { RegionInterface } from '../components/Utils/data/getRegiones';
import { Estado, IndicadoresServicios, Servicios, ServiciosDTO, ServiciosDTOConvertIndicadores } from './GeneralTypes';
import { IndicadorRealizacionAccion, IndicadorResultadoAccion } from './Indicadores';
import { DatosAccion, DatosAccionDTO } from './TipadoAccion';

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
    IsAccessory: boolean;
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
    Acciones: DatosAccionDTO[];
}
export interface EjeBBDD2 {
    Id: number;
    EjeGlobal: {
        Id: number;
        NameEs: string;
        NameEu: string;
        IsActive: boolean;
    };
    IsPrioritario: boolean;
    IsAccessory: boolean;
    Acciones: DatosAccionDTO[];
}
export interface EjeSeleccion {
    PlanId: number;
    ejesGlobales: {
        Id: number;
        IsPrioritarios: boolean;
    }[];
}
export interface EjeIndicadorBBDD {
    EjeId: string;
    NameEs: string;
    NameEu: string;
}

export interface Plan {
    id: string;
    ejes: Ejes[];
    ejesRestantes?: Ejes[];
    ejesPrioritarios: Ejes[];
    introduccion: string;
    proceso: string;
    generalOperationADR: GeneralOperationADR;
    status: Estado;
}
export interface PlanDTO {
    Id: string;
    Ejes?: EjesBBDD[];
    EjesRestantes?: EjesBBDD[];
    EjesPrioritarios?: EjesBBDD[];
    Introduccion: string;
    Proceso: string;
    GeneralOperationADR: GeneralOperationADRDTO;
    Status?: boolean;
}
export interface Memoria {
    id: string;
    status: Estado;
    dSeguimiento: string;
    valFinal: string;
    valGeneral: string;
}
export interface MemoriaLlamadaGestion {
    id: string;
    dSeguimiento: string;
    valFinal: string;
    valGeneral: string;
    generalOperationADR: GeneralOperationADR;
}
export interface MemoriaDTO {
    Id: string;
    DSeguimiento: string;
    ValFinal: string;
    ValGeneral: string;
    GeneralOperationADR: GeneralOperationADRDTOMemoria;
    Status?: boolean;
}

export interface YearData {
    year: Year;
    nombreRegion: string;
    plan: Plan;
    memoria: Memoria;
    accionesAccesorias?: DatosAccion[];
    servicios?: Servicios[];
}
export interface YearDataDTO {
    RegionId: number;
    Year: number;
    PlanId: number;
    MemoriaId: number;

    Plan: PlanDTO;
    Memoria: MemoriaDTO;
    Servicios: ServiciosDTO[] | ServiciosDTOConvertIndicadores[];
}

export interface InitialDataResponse {
    data: YearData[];
    idRegion: string;
}

export const servicioIniciadoVacio: Servicios = {
    id: 0,
    nombre: '',
    descripcion: ``,
    idEje: 1,
    lineaActuaccion: '',
    indicadores: [
        {
            id: 0,
            indicador: '',
            previsto: {
                valor: '',
            },
            tipo: 'realizacion',
            alcanzado: {
                valor: '',
            },
        },
    ],
    supraComarcal: '',
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
        valGeneral: '',
    },
    accionesAccesorias: [],
    servicios: [],
};

export interface DatosAccionCuadroMando {
    id: number;
    nombreAccion: string;
    ejeId: number;
    lineaActuaccion: string;
    indicadorAccion?: {
        indicadoreRealizacion: IndicadorRealizacionAccion[];
        indicadoreResultado: IndicadorResultadoAccion[];
    };
    plurianual: boolean;
    AccionCompartida: boolean;
    regionLiderId?: number;
    regionesCompartidas?: RegionInterface[];
}
export interface ServiciosCuadroMando {
    id: number;
    nombre: string;
    descripcion: string;
    indicadores: IndicadoresServicios[];
    idEje: string | number;
    lineaActuaccion: string;
}

export interface DatosAnioCuadroMando {
    year: Year;
    nombreRegion: string;
    accion: DatosAccionCuadroMando[];
    accionesAccesorias: DatosAccionCuadroMando[];
    servicios: ServiciosCuadroMando[];
    planStatus: Estado;
    memoriaStatus: Estado;
}

export interface DatosAnioCuadroMandoBorrador {
    year: Year;
    nombreRegion: string;
    accion: DatosAccionCuadroMando[];
    accionesAccesorias: DatosAccionCuadroMando[];
    servicios: DatosAccionCuadroMando[];
    planStatus: Estado;
    memoriaStatus: Estado;
}

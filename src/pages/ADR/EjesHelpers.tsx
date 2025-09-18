import { EjesBBDD, Ejes } from '../../types/tipadoPlan';

export const EjesBBDDToEjes = (ejesBBDD: EjesBBDD[]): Ejes[] => {
    return ejesBBDD.map((e) => ({
        Id: e.EjeId,
        NameEs: e.NameEs,
        NameEu: e.NameEu,
        IsActive: e.IsActive,
        IsPrioritarios: e.IsPrioritarios,
        IsAccessory: false,
        acciones: e.acciones || [],
        LineasActuaccion: e.LineasActuaccion || [],
    }));
};

export const EjesToEjesBBDD = (ejes: Ejes[]): EjesBBDD[] => {
    return ejes.map((e) => ({
        EjeId: e.Id,
        NameEs: e.NameEs,
        NameEu: e.NameEu,
        IsActive: e.IsActive,
        IsPrioritarios: e.IsPrioritarios,
        acciones: e.acciones || [],
        LineasActuaccion: e.LineasActuaccion || [],
    }));
};

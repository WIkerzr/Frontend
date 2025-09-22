import { DatosAccion } from '../../types/TipadoAccion';
import { YearData } from '../../types/tipadoPlan';

export function ObtenerAccionDeEje(yearData: YearData, ejeId: string, accionId: string): DatosAccion | undefined {
    let eje = yearData.plan.ejesPrioritarios.find((e) => e.Id === ejeId);
    if (!eje) {
        eje = yearData.plan.ejesRestantes!.find((e) => e.Id === ejeId);
        if (!eje) {
            return undefined;
        }
    }

    return eje.acciones.find((accion) => `${accion.id}` === `${accionId}`);
}

import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { TFunction } from 'i18next';
import { DatosPlanBack } from '../../../types/TipadoAccion';
import { Comarcal } from '../../../types/GeneralTypes';

interface DatosAccionDTOLiderAccion {
    Id: number;
    Nombre: string;
    LineaActuaccion: string;
    Plurianual: boolean | null;
    DatosPlan: DatosPlanBack;
    AccionCompartidaId: number | null;
    RegionLiderId: number;
}

type ConteoPorTipo = Record<Comarcal | string, number>;

interface ResumenAcciones {
    acciones: number;
    comarcales: ConteoPorTipo;
    supracomarcales: ConteoPorTipo;
}

const incrementar = (mapa: ConteoPorTipo, clave: Comarcal | string | null | undefined) => {
    if (!clave) return;
    const key = String(clave).trim();
    if (!key || key.toLowerCase().startsWith('sin tratamiento')) return;
    mapa[key] = (mapa[key] ?? 0) + 1;
};

const generarInformeTratamientoComarcalResumen = (datos: DatosAccionDTOLiderAccion[]): ResumenAcciones => {
    const resumen: ResumenAcciones = { acciones: 0, comarcales: {}, supracomarcales: {} };

    datos.forEach((accion) => {
        resumen.acciones++;
        incrementar(resumen.comarcales, accion.DatosPlan.Comarcal as unknown as Comarcal | string);
        incrementar(resumen.supracomarcales, accion.DatosPlan.Supracomarcal as unknown as string);
    });

    return resumen;
};

export const generarInformeTratamientoComarcal = async (datos: DatosAccionDTOLiderAccion[], t: TFunction<'translation'>) => {
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Informe de Acciones');

    const acciones = generarInformeTratamientoComarcalResumen(datos);

    const filaTituloComarcal = sheet.addRow([t('comarcal')]);
    filaTituloComarcal.font = { bold: true };
    sheet.mergeCells(`A${filaTituloComarcal.number}:C${filaTituloComarcal.number}`);
    Object.entries(acciones.comarcales).forEach(([comarcal, cantidad]) => {
        sheet.addRow([comarcal, cantidad]);
    });

    sheet.addRow([]);

    const filaTituloSupracomarcal = sheet.addRow([t('supracomarcal')]);
    filaTituloSupracomarcal.font = { bold: true };
    sheet.mergeCells(`A${filaTituloSupracomarcal.number}:C${filaTituloSupracomarcal.number}`);
    Object.entries(acciones.supracomarcales).forEach(([supracomarcales, cantidad]) => {
        sheet.addRow([supracomarcales, cantidad]);
    });

    sheet.eachRow((row) => (row.alignment = { vertical: 'middle', horizontal: 'center' }));
    sheet.columns.forEach((col) => (col.alignment = { horizontal: 'center' }));

    sheet.getColumn('A').width = 40;

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${t('InfAcciones')}${new Date().toISOString()}.xlsx`);
};

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
    if (!key || (key || '').toLowerCase().startsWith('sin tratamiento')) return;
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

export const generarInformeTratamientoComarcal = async (
    datos: DatosAccionDTOLiderAccion[],
    t: TFunction<'translation'>,
    anioSeleccionado: string,
    worksheet?: ExcelJS.Worksheet,
    workbook?: ExcelJS.Workbook,
    metadatos?: {
        nombreInforme: string;
        anio: string;
        regiones: string;
        fechaHora: string;
    }
) => {
    const workbookInterno = workbook || new ExcelJS.Workbook();
    const sheet = worksheet || workbookInterno.addWorksheet('Informe de Acciones');

    if (metadatos) {
        const filaInforme = sheet.addRow([]);
        sheet.mergeCells(`A${filaInforme.number}:C${filaInforme.number}`);
        const celdaInforme = sheet.getCell(`A${filaInforme.number}`);
        celdaInforme.value = metadatos.nombreInforme;
        celdaInforme.font = { bold: true, size: 16 };
        celdaInforme.alignment = { horizontal: 'center', vertical: 'middle' };

        const filaAnio = sheet.addRow([]);
        sheet.mergeCells(`A${filaAnio.number}:C${filaAnio.number}`);
        const celdaAnio = sheet.getCell(`A${filaAnio.number}`);
        celdaAnio.value = `${t('Ano')}: ${metadatos.anio}`;
        celdaAnio.font = { bold: true };

        const filaRegiones = sheet.addRow([]);
        sheet.mergeCells(`A${filaRegiones.number}:C${filaRegiones.number}`);
        const celdaRegiones = sheet.getCell(`A${filaRegiones.number}`);
        celdaRegiones.value = `${t('comarcas')}: ${metadatos.regiones}`;
        celdaRegiones.font = { bold: true };

        const filaFecha = sheet.addRow([]);
        sheet.mergeCells(`A${filaFecha.number}:C${filaFecha.number}`);
        const celdaFecha = sheet.getCell(`A${filaFecha.number}`);
        celdaFecha.value = `${t('fecha')}: ${metadatos.fechaHora}`;
        celdaFecha.font = { bold: true };

        sheet.addRow([]);
    }

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

    if (!workbook) {
        const buffer = await workbookInterno.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `${t('InfTratamientoComarcal')}${anioSeleccionado}.xlsx`);
    }
};

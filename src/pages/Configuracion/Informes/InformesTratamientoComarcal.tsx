import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { TFunction } from 'i18next';
import { DatosPlanBack } from '../../../types/TipadoAccion';
import { Comarcal } from '../../../types/GeneralTypes';
import { crearGeneradorNombresUnicos } from './informeObjetivo';

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

    const totalComarcales = Object.values(acciones.comarcales).reduce((sum, val) => sum + val, 0);
    const totalSupracomarcales = Object.values(acciones.supracomarcales).reduce((sum, val) => sum + val, 0);

    const filaTituloComarcal = sheet.addRow([t('tratamientoComarcal')]);
    filaTituloComarcal.font = { bold: true };
    sheet.mergeCells(`A${filaTituloComarcal.number}:C${filaTituloComarcal.number}`);

    const encabezadoComarcal = sheet.addRow(['Tratamiento', 'Cantidad', 'Porcentaje']);
    encabezadoComarcal.font = { bold: true };
    encabezadoComarcal.alignment = { horizontal: 'center', vertical: 'middle' };

    Object.entries(acciones.comarcales).forEach(([comarcal, cantidad]) => {
        const porcentaje = totalComarcales > 0 ? Math.round((cantidad / totalComarcales) * 100) : 0;
        sheet.addRow([comarcal, cantidad, `${porcentaje}%`]);
    });

    sheet.addRow([]);

    const filaTituloSupracomarcal = sheet.addRow([t('supracomarcal')]);
    filaTituloSupracomarcal.font = { bold: true };
    sheet.mergeCells(`A${filaTituloSupracomarcal.number}:C${filaTituloSupracomarcal.number}`);

    const encabezadoSupracomarcal = sheet.addRow(['Tratamiento', 'Cantidad', 'Porcentaje']);
    encabezadoSupracomarcal.font = { bold: true };
    encabezadoSupracomarcal.alignment = { horizontal: 'center', vertical: 'middle' };

    Object.entries(acciones.supracomarcales).forEach(([supracomarcales, cantidad]) => {
        const porcentaje = totalSupracomarcales > 0 ? Math.round((cantidad / totalSupracomarcales) * 100) : 0;
        sheet.addRow([supracomarcales, cantidad, `${porcentaje}%`]);
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

export const generarInformeTratamientoComarcalSeparado = async (
    datos: DatosAccionDTOLiderAccion[],
    t: TFunction<'translation'>,
    anioSeleccionado: string,
    regiones: { RegionId: string | number; NameEs: string; NameEu: string }[],
    i18n: { language: string },
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

    if (!datos || !Array.isArray(datos) || datos.length === 0) {
        if (workbook) {
            const sheet = workbook.addWorksheet('Error');
            const filaError = sheet.addRow(['No hay datos disponibles para generar el informe']);
            filaError.font = { bold: true, color: { argb: 'FFFF0000' } };
            sheet.mergeCells(`A${filaError.number}:C${filaError.number}`);
            return;
        }

        const sheet = workbookInterno.addWorksheet('Error');
        const filaError = sheet.addRow(['No hay datos disponibles para generar el informe']);
        filaError.font = { bold: true, color: { argb: 'FFFF0000' } };
        sheet.mergeCells(`A${filaError.number}:C${filaError.number}`);

        const buffer = await workbookInterno.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `${t('InfTratamientoComarcalSeparado')}_${anioSeleccionado}.xlsx`);
        return;
    }

    const { obtenerNombreUnico } = crearGeneradorNombresUnicos();

    const accionesPorRegion = datos.reduce((acc, accion) => {
        if (accion.RegionLiderId === null || accion.RegionLiderId === undefined) {
            return acc;
        }

        const regionId = accion.RegionLiderId.toString();
        if (!acc[regionId]) {
            acc[regionId] = [];
        }
        acc[regionId].push(accion);
        return acc;
    }, {} as Record<string, DatosAccionDTOLiderAccion[]>);

    for (const [regionId, accionesRegion] of Object.entries(accionesPorRegion)) {
        const region = regiones.find((r) => {
            const regionIdNum = Number(r.RegionId);
            const accionRegionIdNum = Number(regionId);
            return regionIdNum === accionRegionIdNum;
        });
        const nombreRegion = region ? (i18n.language === 'eu' ? region.NameEu : region.NameEs) : `Región ${regionId}`;

        const nombrePestana = obtenerNombreUnico(`${anioSeleccionado} - ${nombreRegion}`);
        const sheet = workbookInterno.addWorksheet(nombrePestana);

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
            celdaAnio.value = `${t('Ano')}: ${anioSeleccionado}`;
            celdaAnio.font = { bold: true };

            const filaRegion = sheet.addRow([]);
            sheet.mergeCells(`A${filaRegion.number}:C${filaRegion.number}`);
            const celdaRegion = sheet.getCell(`A${filaRegion.number}`);
            celdaRegion.value = `${t('comarcas')}: ${nombreRegion}`;
            celdaRegion.font = { bold: true };

            const filaFecha = sheet.addRow([]);
            sheet.mergeCells(`A${filaFecha.number}:C${filaFecha.number}`);
            const celdaFecha = sheet.getCell(`A${filaFecha.number}`);
            celdaFecha.value = `${t('fecha')}: ${metadatos.fechaHora}`;
            celdaFecha.font = { bold: true };

            sheet.addRow([]);
        }

        // Título de la región
        const filaTituloRegion = sheet.addRow([nombreRegion]);
        filaTituloRegion.font = { bold: true, size: 14 };
        filaTituloRegion.alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.mergeCells(`A${filaTituloRegion.number}:C${filaTituloRegion.number}`);

        const resumenRegion = generarInformeTratamientoComarcalResumen(accionesRegion);
        const totalComarcales = Object.values(resumenRegion.comarcales).reduce((sum, val) => sum + val, 0);
        const totalSupracomarcales = Object.values(resumenRegion.supracomarcales).reduce((sum, val) => sum + val, 0);

        // Tabla de tratamiento comarcal
        const filaTituloComarcal = sheet.addRow([t('tratamientoComarcal')]);
        filaTituloComarcal.font = { bold: true };
        sheet.mergeCells(`A${filaTituloComarcal.number}:C${filaTituloComarcal.number}`);

        const encabezadoComarcal = sheet.addRow([t('Tratamiento'), t('Cantidad'), t('Porcentaje')]);
        encabezadoComarcal.font = { bold: true };
        encabezadoComarcal.alignment = { horizontal: 'center', vertical: 'middle' };

        Object.entries(resumenRegion.comarcales).forEach(([comarcal, cantidad]) => {
            const porcentaje = totalComarcales > 0 ? Math.round((cantidad / totalComarcales) * 100) : 0;
            sheet.addRow([comarcal, cantidad, `${porcentaje}%`]);
        });

        sheet.addRow([]);

        // Tabla de tratamiento supracomarcal
        const filaTituloSupracomarcal = sheet.addRow([t('supracomarcal')]);
        filaTituloSupracomarcal.font = { bold: true };
        sheet.mergeCells(`A${filaTituloSupracomarcal.number}:C${filaTituloSupracomarcal.number}`);

        const encabezadoSupracomarcal = sheet.addRow([t('Tratamiento'), t('Cantidad'), t('Porcentaje')]);
        encabezadoSupracomarcal.font = { bold: true };
        encabezadoSupracomarcal.alignment = { horizontal: 'center', vertical: 'middle' };

        Object.entries(resumenRegion.supracomarcales).forEach(([supracomarcales, cantidad]) => {
            const porcentaje = totalSupracomarcales > 0 ? Math.round((cantidad / totalSupracomarcales) * 100) : 0;
            sheet.addRow([supracomarcales, cantidad, `${porcentaje}%`]);
        });

        sheet.eachRow((row) => (row.alignment = { vertical: 'middle', horizontal: 'center' }));
        sheet.columns.forEach((col) => (col.alignment = { horizontal: 'center' }));
        sheet.getColumn('A').width = 40;
        sheet.getColumn('B').width = 15;
        sheet.getColumn('C').width = 15;
    }

    if (!workbook) {
        const buffer = await workbookInterno.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `${t('InfTratamientoComarcalSeparado')}_${anioSeleccionado}.xlsx`);
    }
};

import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { TFunction } from 'i18next';
import { DatosPlanBack } from '../../../types/TipadoAccion';
import { Comarcal } from '../../../types/GeneralTypes';
import { crearGeneradorNombresUnicos } from './informeObjetivo';
import i18n from '../../../i18n';
import opcionesComarcalEs from '../../../../public/locales/objectEs.json';
import opcionesComarcalEu from '../../../../public/locales/objectEu.json';

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

// Función para traducir opciones predefinidas del tratamiento territorial
const traducirTratamientoTerritorial = (texto: string): string => {
    if (!texto) return texto;

    const idiomaActual = i18n.language;

    // Mapas de traducción entre español y euskera
    const opcionesEs = opcionesComarcalEs.opcionesComarcal;
    const opcionesEu = opcionesComarcalEu.opcionesComarcal;
    const opcionesSupraEs = opcionesComarcalEs.opcionesSupraComarcal;
    const opcionesSupraEu = opcionesComarcalEu.opcionesSupraComarcal;

    // Si el idioma es euskera, buscar en las opciones españolas y traducir
    if (idiomaActual === 'eu') {
        const indiceComarcal = opcionesEs.indexOf(texto);
        if (indiceComarcal !== -1) {
            return opcionesEu[indiceComarcal];
        }

        const indiceSupra = opcionesSupraEs.indexOf(texto);
        if (indiceSupra !== -1) {
            return opcionesSupraEu[indiceSupra];
        }
    } else {
        // Si el idioma es español, buscar en las opciones euskera y traducir
        const indiceComarcal = opcionesEu.indexOf(texto);
        if (indiceComarcal !== -1) {
            return opcionesEs[indiceComarcal];
        }

        const indiceSupra = opcionesSupraEu.indexOf(texto);
        if (indiceSupra !== -1) {
            return opcionesSupraEs[indiceSupra];
        }
    }

    // Si no es una opción predefinida, devolver el texto tal cual (texto personalizado)
    return texto;
};

const incrementar = (mapa: ConteoPorTipo, clave: Comarcal | string | null | undefined) => {
    if (!clave) return;
    const key = String(clave).trim();
    if (!key || (key || '').toLowerCase().startsWith('sin tratamiento') || (key || '').toLowerCase().startsWith('eskualde tratamendurik')) return;
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

    const encabezadoComarcal = sheet.addRow([t('tratamiento'), t('cantidad'), t('porcentaje')]);
    encabezadoComarcal.font = { bold: true };
    encabezadoComarcal.alignment = { horizontal: 'center', vertical: 'middle' };

    let sumaPorcentajeComarcales = 0;
    Object.entries(acciones.comarcales).forEach(([comarcal, cantidad]) => {
        const porcentaje = totalComarcales > 0 ? Math.round((cantidad / totalComarcales) * 100) : 0;
        sumaPorcentajeComarcales += porcentaje;
        const comarcalTraducido = traducirTratamientoTerritorial(comarcal);
        sheet.addRow([comarcalTraducido, cantidad, `${porcentaje}%`]);
    });

    const filaTotalComarcales = sheet.addRow([t('total'), totalComarcales, `${sumaPorcentajeComarcales}%`]);
    filaTotalComarcales.font = { bold: true };
    filaTotalComarcales.getCell(2).border = { top: { style: 'thin' } };
    filaTotalComarcales.getCell(3).border = { top: { style: 'thin' } };

    sheet.addRow([]);

    const filaTituloSupracomarcal = sheet.addRow([t('supracomarcal')]);
    filaTituloSupracomarcal.font = { bold: true };
    sheet.mergeCells(`A${filaTituloSupracomarcal.number}:C${filaTituloSupracomarcal.number}`);

    const encabezadoSupracomarcal = sheet.addRow([t('tratamiento'), t('cantidad'), t('porcentaje')]);
    encabezadoSupracomarcal.font = { bold: true };
    encabezadoSupracomarcal.alignment = { horizontal: 'center', vertical: 'middle' };

    let sumaPorcentajeSupracomarcales = 0;
    Object.entries(acciones.supracomarcales).forEach(([supracomarcales, cantidad]) => {
        const porcentaje = totalSupracomarcales > 0 ? Math.round((cantidad / totalSupracomarcales) * 100) : 0;
        sumaPorcentajeSupracomarcales += porcentaje;
        const supracomarcalesTraducido = traducirTratamientoTerritorial(supracomarcales);
        sheet.addRow([supracomarcalesTraducido, cantidad, `${porcentaje}%`]);
    });

    const filaTotalSupracomarcales = sheet.addRow([t('total'), totalSupracomarcales, `${sumaPorcentajeSupracomarcales}%`]);
    filaTotalSupracomarcales.font = { bold: true };
    filaTotalSupracomarcales.getCell(2).border = { top: { style: 'thin' } };
    filaTotalSupracomarcales.getCell(3).border = { top: { style: 'thin' } };

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

interface DatosRegionAcciones {
    RegionId: number;
    Anio: number;
    Acciones: DatosAccionDTOLiderAccion[];
}

export const generarInformeTratamientoComarcalSeparado = async (
    datos: DatosAccionDTOLiderAccion[] | DatosRegionAcciones[], // Soporta ambas estructuras
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
            const filaError = sheet.addRow([t('noDatosDisponiblesInforme')]);
            filaError.font = { bold: true, color: { argb: 'FFFF0000' } };
            sheet.mergeCells(`A${filaError.number}:C${filaError.number}`);
            return;
        }

        const sheet = workbookInterno.addWorksheet('Error');
        const filaError = sheet.addRow([t('noDatosDisponiblesInforme')]);
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

    const esDatosRegionAcciones = (item: DatosAccionDTOLiderAccion | DatosRegionAcciones): item is DatosRegionAcciones => {
        return 'RegionId' in item && 'Acciones' in item;
    };

    const esNuevaEstructura = datos.length > 0 && esDatosRegionAcciones(datos[0]);

    let accionesPorRegion: Record<string, DatosAccionDTOLiderAccion[]>;

    if (esNuevaEstructura) {
        accionesPorRegion = (datos as DatosRegionAcciones[]).reduce((acc, item) => {
            const regionId = item.RegionId.toString();
            acc[regionId] = item.Acciones || [];
            return acc;
        }, {} as Record<string, DatosAccionDTOLiderAccion[]>);
    } else {
        accionesPorRegion = (datos as DatosAccionDTOLiderAccion[]).reduce((acc, accion) => {
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
    }

    for (const [regionId, accionesRegion] of Object.entries(accionesPorRegion)) {
        const region = regiones.find((r) => {
            const regionIdNum = Number(r.RegionId);
            const accionRegionIdNum = Number(regionId);
            return regionIdNum === accionRegionIdNum;
        });
        const nombreRegion = region ? (i18n.language === 'eu' ? region.NameEu : region.NameEs) : `${t('region')} ${regionId}`;

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

        const encabezadoComarcal = sheet.addRow([t('tratamiento'), t('cantidad'), t('porcentaje')]);
        encabezadoComarcal.font = { bold: true };
        encabezadoComarcal.alignment = { horizontal: 'center', vertical: 'middle' };

        let sumaPorcentajeComarcales = 0;
        Object.entries(resumenRegion.comarcales).forEach(([comarcal, cantidad]) => {
            const porcentaje = totalComarcales > 0 ? Math.round((cantidad / totalComarcales) * 100) : 0;
            sumaPorcentajeComarcales += porcentaje;
            const comarcalTraducido = traducirTratamientoTerritorial(comarcal);
            sheet.addRow([comarcalTraducido, cantidad, `${porcentaje}%`]);
        });

        const filaTotalComarcales = sheet.addRow([t('total'), totalComarcales, `${sumaPorcentajeComarcales}%`]);
        filaTotalComarcales.font = { bold: true };
        filaTotalComarcales.getCell(2).border = { top: { style: 'thin' } };
        filaTotalComarcales.getCell(3).border = { top: { style: 'thin' } };

        sheet.addRow([]);

        // Tabla de tratamiento supracomarcal
        const filaTituloSupracomarcal = sheet.addRow([t('supracomarcal')]);
        filaTituloSupracomarcal.font = { bold: true };
        sheet.mergeCells(`A${filaTituloSupracomarcal.number}:C${filaTituloSupracomarcal.number}`);

        const encabezadoSupracomarcal = sheet.addRow([t('tratamiento'), t('cantidad'), t('porcentaje')]);
        encabezadoSupracomarcal.font = { bold: true };
        encabezadoSupracomarcal.alignment = { horizontal: 'center', vertical: 'middle' };

        let sumaPorcentajeSupracomarcales = 0;
        Object.entries(resumenRegion.supracomarcales).forEach(([supracomarcales, cantidad]) => {
            const porcentaje = totalSupracomarcales > 0 ? Math.round((cantidad / totalSupracomarcales) * 100) : 0;
            sumaPorcentajeSupracomarcales += porcentaje;
            const supracomarcalesTraducido = traducirTratamientoTerritorial(supracomarcales);
            sheet.addRow([supracomarcalesTraducido, cantidad, `${porcentaje}%`]);
        });

        const filaTotalSupracomarcales = sheet.addRow([t('total'), totalSupracomarcales, `${sumaPorcentajeSupracomarcales}%`]);
        filaTotalSupracomarcales.font = { bold: true };
        filaTotalSupracomarcales.getCell(2).border = { top: { style: 'thin' } };
        filaTotalSupracomarcales.getCell(3).border = { top: { style: 'thin' } };

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

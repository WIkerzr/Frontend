import ExcelJS from 'exceljs';
import saveAs from 'file-saver';
import { TFunction } from 'i18next';

interface DatoEje {
    RegionId: string;
    EjeId: number;
    NombreEje: string;
    IzenaEje: string;
    ObjetivoId: number;
    NombreObjetivo: string;
    NumeroAcciones: number;
    IzenaObjetivo: string;
    AxisType: number;
}

interface ResumenEje {
    RegionId: string;
    NombreEje: string;
    NumeroAcciones: number;
}

interface ResumenObjetivo {
    NombreObjetivo: string;
    NumeroAcciones: number;
}

interface RegionAnio {
    RegionId: number;
    Anio: number;
    Datos: DatoEje[];
}

interface RegionInfo {
    RegionId: string | number;
    NameEs: string;
    NameEu: string;
}

const generarInformeResumenComarcaEje = (datos: DatoEje[], i18n: { language: string }, regiones: RegionInfo[]): ResumenEje[] => {
    const mapa = new Map<string, ResumenEje>();

    for (const item of datos) {
        const key = `${item.RegionId}-${item.EjeId}`;
        let resumen = mapa.get(key);

        if (!resumen) {
            const region = regiones.find((r) => r.RegionId.toString() === item.RegionId.toString());
            const nombreRegion = region ? (i18n.language === 'eu' ? region.NameEu : region.NameEs) : item.RegionId;

            resumen = {
                RegionId: nombreRegion,
                NombreEje: i18n.language === 'es' ? item.NombreEje : item.IzenaEje,
                NumeroAcciones: item.NumeroAcciones,
            };
            mapa.set(key, resumen);
        }
    }

    return Array.from(mapa.values());
};

const generarInformeResumenObjetivos = (datos: DatoEje[], i18n: { language: string }, tipoEje: 0 | 1): ResumenObjetivo[] => {
    const mapa = new Map<number, ResumenObjetivo>();

    const datosFiltrados = datos.filter((d) => d.AxisType === tipoEje);

    for (const item of datosFiltrados) {
        let resumen = mapa.get(item.ObjetivoId);

        if (!resumen) {
            resumen = {
                NombreObjetivo: i18n.language === 'es' ? item.NombreObjetivo : item.IzenaObjetivo,
                NumeroAcciones: item.NumeroAcciones,
            };
            mapa.set(item.ObjetivoId, resumen);
        } else {
            resumen.NumeroAcciones += item.NumeroAcciones;
        }
    }

    return Array.from(mapa.values());
};

export const generarInformeAcciones = async (
    anios: RegionAnio[],
    t: TFunction<'translation'>,
    i18n: { language: string },
    anioSeleccionado: string,
    worksheet?: ExcelJS.Worksheet,
    workbook?: ExcelJS.Workbook,
    metadatos?: {
        nombreInforme: string;
        anio: string;
        regiones: string;
        fechaHora: string;
    },
    regiones?: RegionInfo[]
) => {
    const workbookInterno = workbook || new ExcelJS.Workbook();
    const sheet = worksheet || workbookInterno.addWorksheet('Informe de Acciones');

    if (metadatos) {
        const filaInforme = sheet.addRow([metadatos.nombreInforme]);
        filaInforme.getCell(1).font = { bold: true, size: 16 };
        filaInforme.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.mergeCells(`A${filaInforme.number}:F${filaInforme.number}`);

        const filaAnio = sheet.addRow([`${t('Ano')}: ${metadatos.anio}`]);
        filaAnio.getCell(1).font = { bold: true };
        sheet.mergeCells(`A${filaAnio.number}:F${filaAnio.number}`);

        const filaRegiones = sheet.addRow([`${t('comarcas')}: ${metadatos.regiones}`]);
        filaRegiones.getCell(1).font = { bold: true };
        sheet.mergeCells(`A${filaRegiones.number}:F${filaRegiones.number}`);

        const filaFecha = sheet.addRow([`${t('fecha')}: ${metadatos.fechaHora}`]);
        filaFecha.getCell(1).font = { bold: true };
        sheet.mergeCells(`A${filaFecha.number}:F${filaFecha.number}`);

        sheet.addRow([]);
    }

    // Tabla 1: COMARCA | EJE | ACCIONES
    const filaTitulo1 = sheet.addRow([i18n.language === 'es' ? 'RESUMEN POR COMARCA Y EJE' : 'LABURPENA ESKUALDEKA ETA ARDATZEKA']);
    sheet.mergeCells(`A${filaTitulo1.number}:C${filaTitulo1.number}`);
    filaTitulo1.getCell(1).font = { bold: true, size: 14 };
    filaTitulo1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.columns = [
        { header: t('comarca'), key: 'RegionId', width: 30 },
        { header: t('Eje'), key: 'NombreEje', width: 40 },
        { header: t('Acciones'), key: 'NumeroAcciones', width: 15 },
    ];

    const filaEncabezado1 = sheet.addRow([t('comarca'), t('Eje'), t('Acciones')]);
    filaEncabezado1.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    const datosPorAnio = anios.reduce((acc, item) => {
        if (!acc[item.Anio]) acc[item.Anio] = [];
        acc[item.Anio].push(item);
        return acc;
    }, {} as Record<number, RegionAnio[]>);

    for (const anioStr in datosPorAnio) {
        const fila = sheet.addRow([anioStr]);
        sheet.mergeCells(`A${fila.number}:C${fila.number}`);
        fila.font = { bold: true, size: 12 };
        fila.alignment = { horizontal: 'center', vertical: 'middle' };

        for (let index = 0; index < anios.length; index++) {
            const datos = anios[index].Datos;
            const resumenes = generarInformeResumenComarcaEje(datos, i18n, regiones || []);
            resumenes.forEach((r) => sheet.addRow(r));
        }
    }

    sheet.addRow([]);
    sheet.addRow([]);

    // Tabla 2: OBJETIVOS GENERALES | ACCIONES
    const filaTitulo2 = sheet.addRow([i18n.language === 'es' ? 'OBJETIVOS GENERALES' : 'HELBURU OROKORRAK']);
    sheet.mergeCells(`A${filaTitulo2.number}:C${filaTitulo2.number}`);
    filaTitulo2.getCell(1).font = { bold: true, size: 14 };
    filaTitulo2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    const filaEncabezado2 = sheet.addRow([i18n.language === 'es' ? 'Objetivo' : 'Helburua', t('Acciones'), '']);
    filaEncabezado2.getCell(1).font = { bold: true };
    filaEncabezado2.getCell(2).font = { bold: true };
    filaEncabezado2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    filaEncabezado2.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

    for (const anioStr in datosPorAnio) {
        const fila = sheet.addRow([anioStr]);
        sheet.mergeCells(`A${fila.number}:C${fila.number}`);
        fila.font = { bold: true, size: 12 };
        fila.alignment = { horizontal: 'center', vertical: 'middle' };

        for (let index = 0; index < anios.length; index++) {
            const datos = anios[index].Datos;
            const resumenesGenerales = generarInformeResumenObjetivos(datos, i18n, 0);
            resumenesGenerales.forEach((r) => {
                sheet.addRow([r.NombreObjetivo, r.NumeroAcciones, '']);
            });
        }
    }

    sheet.addRow([]);
    sheet.addRow([]);

    // Tabla 3: OBJETIVOS SECTORIALES | ACCIONES
    const filaTitulo3 = sheet.addRow([i18n.language === 'es' ? 'OBJETIVOS SECTORIALES' : 'SEKTORE HELBURUAK']);
    sheet.mergeCells(`A${filaTitulo3.number}:C${filaTitulo3.number}`);
    filaTitulo3.getCell(1).font = { bold: true, size: 14 };
    filaTitulo3.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    const filaEncabezado3 = sheet.addRow([i18n.language === 'es' ? 'Objetivo' : 'Helburua', t('Acciones'), '']);
    filaEncabezado3.getCell(1).font = { bold: true };
    filaEncabezado3.getCell(2).font = { bold: true };
    filaEncabezado3.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    filaEncabezado3.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

    for (const anioStr in datosPorAnio) {
        const fila = sheet.addRow([anioStr]);
        sheet.mergeCells(`A${fila.number}:C${fila.number}`);
        fila.font = { bold: true, size: 12 };
        fila.alignment = { horizontal: 'center', vertical: 'middle' };

        for (let index = 0; index < anios.length; index++) {
            const datos = anios[index].Datos;
            const resumenesSectoriales = generarInformeResumenObjetivos(datos, i18n, 1);
            resumenesSectoriales.forEach((r) => {
                sheet.addRow([r.NombreObjetivo, r.NumeroAcciones, '']);
            });
        }
    }

    sheet.eachRow((row) => {
        row.alignment = { vertical: 'middle', horizontal: 'left' };
    });

    if (!workbook) {
        const buffer = await workbookInterno.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `${t('InfAcciones')}${anioSeleccionado}.xlsx`);
    }
};

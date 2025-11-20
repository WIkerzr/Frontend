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

interface RegionAnio {
    RegionId: number;
    Anio: number;
    Datos: DatoEje[];
}

// La información de regiones ya no se usa en este informe (agrupamos por ejes)

// Genera resumen agrupado por EJE (ignorando comarcas)
const generarResumenPorEje = (datos: DatoEje[], i18n: { language: string }): ResumenEje[] => {
    const mapa = new Map<number, ResumenEje>();

    for (const item of datos) {
        const key = item.EjeId;
        let resumen = mapa.get(key);

        if (!resumen) {
            resumen = {
                RegionId: '', // no usado ahora, mantenemos la interfaz
                NombreEje: i18n.language === 'es' ? item.NombreEje : item.IzenaEje,
                NumeroAcciones: item.NumeroAcciones,
            };
            mapa.set(key, resumen);
        } else {
            resumen.NumeroAcciones += item.NumeroAcciones;
        }
    }

    return Array.from(mapa.values());
};

// (se eliminó el resumen por comarca: ahora agrupamos por eje)

// Genera resumen de objetivos agrupado por EJE y Objetivo (sin columna comarca)
interface ResumenObjetivoPorEje {
    NombreEje: string;
    NombreObjetivo: string;
    NumeroAcciones: number;
}

const generarResumenObjetivosPorEje = (datos: DatoEje[], i18n: { language: string }, tipoEje: 0 | 1): ResumenObjetivoPorEje[] => {
    const mapa = new Map<number, ResumenObjetivoPorEje>();

    const datosFiltrados = datos.filter((d) => d.AxisType === tipoEje);

    for (const item of datosFiltrados) {
        const key = item.ObjetivoId;
        let resumen = mapa.get(key);

        if (!resumen) {
            resumen = {
                NombreEje: '',
                NombreObjetivo: i18n.language === 'es' ? item.NombreObjetivo : item.IzenaObjetivo,
                NumeroAcciones: item.NumeroAcciones,
            };
            mapa.set(key, resumen);
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
    _regiones?: unknown[]
) => {
    // evitar warning de parámetro no usado
    void _regiones;
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

    // Tabla 1: EJE | ACCIONES (resumen agrupado por eje)
    const filaTitulo1 = sheet.addRow([i18n.language === 'es' ? 'RESUMEN POR EJE' : 'ARDATZAREN ARABERA LABURPENA']);
    sheet.mergeCells(`A${filaTitulo1.number}:B${filaTitulo1.number}`);
    filaTitulo1.getCell(1).font = { bold: true, size: 14 };
    filaTitulo1.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    sheet.columns = [
        { key: 'NombreEje', width: 60 },
        { key: 'NumeroAcciones', width: 15 },
    ];

    const filaEncabezado1 = sheet.addRow([t('Eje'), t('Acciones')]);
    filaEncabezado1.eachCell((cell) => {
        cell.font = { bold: true };
        cell.alignment = { horizontal: 'center', vertical: 'middle' };
    });

    // Acumular datos de todos los años y generar resumen único por Eje
    const todosLosDatos = anios.flatMap((a) => a.Datos || []);
    const resumenesUnicos = generarResumenPorEje(todosLosDatos, i18n);
    let totalAcciones = 0;
    resumenesUnicos.forEach((r: ResumenEje) => {
        sheet.addRow([r.NombreEje, r.NumeroAcciones]);
        totalAcciones += r.NumeroAcciones;
    });

    // Fila de total con borde superior
    const filaTotal = sheet.addRow(['', totalAcciones]);
    filaTotal.getCell(2).font = { bold: true };
    filaTotal.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    filaTotal.getCell(2).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
    };

    sheet.addRow([]);
    sheet.addRow([]);

    // Tabla 2: OBJETIVOS GENERALES | ACCIONES (sin columna Eje)
    const filaTitulo2 = sheet.addRow([i18n.language === 'es' ? 'OBJETIVOS GENERALES' : 'HELBURU OROKORRAK']);
    sheet.mergeCells(`A${filaTitulo2.number}:B${filaTitulo2.number}`);
    filaTitulo2.getCell(1).font = { bold: true, size: 14 };
    filaTitulo2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Ajustar columnas para la tabla de objetivos (Objetivo ahora va primero y toma la anchura 80)
    sheet.columns = [
        { key: 'NombreObjetivo', width: 80 },
        { key: 'NumeroAcciones', width: 15 },
    ];

    const filaEncabezado2 = sheet.addRow([i18n.language === 'es' ? 'Objetivo' : 'Helburua', t('Acciones')]);
    filaEncabezado2.getCell(1).font = { bold: true };
    filaEncabezado2.getCell(2).font = { bold: true };
    filaEncabezado2.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    filaEncabezado2.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

    // Acumular datos de todos los años y generar resumen único por Objetivo (generales)
    const resumenesGeneralesUnicos = generarResumenObjetivosPorEje(todosLosDatos, i18n, 0);
    let totalAccionesGenerales = 0;
    resumenesGeneralesUnicos.forEach((r: ResumenObjetivoPorEje) => {
        sheet.addRow([r.NombreObjetivo, r.NumeroAcciones]);
        totalAccionesGenerales += r.NumeroAcciones;
    });

    // Fila de total con borde superior
    const filaTotalGenerales = sheet.addRow(['', totalAccionesGenerales]);
    filaTotalGenerales.getCell(2).font = { bold: true };
    filaTotalGenerales.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    filaTotalGenerales.getCell(2).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
    };

    sheet.addRow([]);
    sheet.addRow([]);

    // Tabla 3: OBJETIVOS SECTORIALES | ACCIONES (sin columna Eje)
    const filaTitulo3 = sheet.addRow([i18n.language === 'es' ? 'OBJETIVOS SECTORIALES' : 'SEKTORE HELBURUAK']);
    sheet.mergeCells(`A${filaTitulo3.number}:B${filaTitulo3.number}`);
    filaTitulo3.getCell(1).font = { bold: true, size: 14 };
    filaTitulo3.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };

    // Ajustar columnas para la tabla sectorial (Objetivo ahora primero)
    sheet.columns = [
        { key: 'NombreObjetivo', width: 80 },
        { key: 'NumeroAcciones', width: 15 },
    ];

    const filaEncabezado3 = sheet.addRow([i18n.language === 'es' ? 'Objetivo' : 'Helburua', t('Acciones')]);
    filaEncabezado3.getCell(1).font = { bold: true };
    filaEncabezado3.getCell(2).font = { bold: true };
    filaEncabezado3.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
    filaEncabezado3.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };

    // Acumular datos de todos los años y generar resumen único por Objetivo (sectoriales)
    const resumenesSectorialesUnicos = generarResumenObjetivosPorEje(todosLosDatos, i18n, 1);
    let totalAccionesSectoriales = 0;
    resumenesSectorialesUnicos.forEach((r: ResumenObjetivoPorEje) => {
        sheet.addRow([r.NombreObjetivo, r.NumeroAcciones]);
        totalAccionesSectoriales += r.NumeroAcciones;
    });

    // Fila de total con borde superior
    const filaTotalSectoriales = sheet.addRow(['', totalAccionesSectoriales]);
    filaTotalSectoriales.getCell(2).font = { bold: true };
    filaTotalSectoriales.getCell(2).alignment = { horizontal: 'center', vertical: 'middle' };
    filaTotalSectoriales.getCell(2).border = {
        top: { style: 'thin', color: { argb: 'FF000000' } },
    };

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

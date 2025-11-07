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
    NumeroObjetivos: number;
    NumeroGenerales: number;
    NumeroSectoriales: number;
}
interface RegionAnio {
    RegionId: number;
    Anio: number;
    Datos: DatoEje[];
}

const generarInformeResumen = (datos: DatoEje[], i18n: { language: string }): ResumenEje[] => {
    const mapa = new Map<string, ResumenEje>();

    for (const item of datos) {
        const key = `${item.RegionId}-${item.EjeId}`;
        let resumen = mapa.get(key);

        if (!resumen) {
            resumen = {
                RegionId: item.RegionId,
                NombreEje: i18n.language === 'es' ? item.NombreEje : item.IzenaEje,
                NumeroAcciones: item.NumeroAcciones,
                NumeroObjetivos: 0,
                NumeroGenerales: 0,
                NumeroSectoriales: 0,
            };
            mapa.set(key, resumen);
        }
    }

    for (const [key, resumen] of mapa.entries()) {
        const [regionId, ejeId] = key.split('-');
        const registros = datos.filter((d) => d.RegionId === regionId && d.EjeId === Number(ejeId));

        const objetivos = new Set(registros.map((o) => o.ObjetivoId));
        resumen.NumeroObjetivos = objetivos.size;

        resumen.NumeroGenerales = new Set(registros.filter((o) => o.AxisType === 0).map((o) => o.ObjetivoId)).size;

        resumen.NumeroSectoriales = new Set(registros.filter((o) => o.AxisType === 1).map((o) => o.ObjetivoId)).size;
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
    }
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

    sheet.columns = [
        { header: t('comarca'), key: 'RegionId', width: 20 },
        { header: t('Eje'), key: 'NombreEje', width: 40 },
        { header: t('Acciones'), key: 'NumeroAcciones', width: 15 },
        { header: t('Objetivos'), key: 'NumeroObjetivos', width: 15 },
        { header: t('Generales'), key: 'NumeroGenerales', width: 15 },
        { header: t('Sectoriales'), key: 'NumeroSectoriales', width: 15 },
    ];

    const datosPorAnio = anios.reduce((acc, item) => {
        if (!acc[item.Anio]) acc[item.Anio] = [];
        acc[item.Anio].push(item);
        return acc;
    }, {} as Record<number, RegionAnio[]>);

    for (const anioStr in datosPorAnio) {
        const fila = sheet.addRow([anioStr]);
        sheet.mergeCells(`A${fila.number}:F${fila.number}`);
        fila.font = { bold: true, size: 14 };

        for (let index = 0; index < anios.length; index++) {
            const datos = anios[index].Datos;

            const resumenes = generarInformeResumen(datos, i18n);
            resumenes.forEach((r) => sheet.addRow(r));
        }
    }

    sheet.getRow(1).font = { bold: true };
    sheet.eachRow((row) => (row.alignment = { vertical: 'middle', horizontal: 'center' }));
    sheet.columns.forEach((col) => (col.alignment = { horizontal: 'center' }));

    if (!workbook) {
        const buffer = await workbookInterno.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `${t('InfAcciones')}${anioSeleccionado}.xlsx`);
    }
};

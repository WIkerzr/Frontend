import saveAs from 'file-saver';
import { TFunction } from 'i18next';
import ExcelJS from 'exceljs';

type Resultado = {
    AccionId?: number;
    NombreAccion?: string;
    Cuantia: string | number | null;
    Fuente?: string | null;
};

const FUENTES_OFICIALES = ['Gobierno Vasco', 'DDFF', 'Administraciones locales', 'Fuentes privadas', 'Autofinanciación', 'Otros'];

function parseNumber(value: string | number | null): number {
    if (value === null || value === undefined) return 0;
    if (typeof value === 'number') return value;
    // Eliminar símbolos comunes y convertir coma decimal a punto
    const cleaned = String(value).replace(/\s/g, '').replace(/,/g, '.');
    const n = parseFloat(cleaned);
    return isNaN(n) ? 0 : n;
}
function normalizeFuente(raw: string): string {
    const s = (raw || '').trim();
    if (!s) return 'No especificada';
    const match = FUENTES_OFICIALES.find((fo) => (fo || '').toLowerCase() === s.toLowerCase());
    return match ?? 'Otros';
}
interface GenerarInformePrestamoProps {
    resultados: Resultado[];
    t: TFunction<'translation'>;
    anioSeleccionado: string;
    worksheet?: ExcelJS.Worksheet;
    workbook?: ExcelJS.Workbook;
    metadatos?: {
        nombreInforme: string;
        anio: string;
        regiones: string;
        fechaHora: string;
    };
}
export const GenerarInformePrestamo = async ({ resultados, t, anioSeleccionado, worksheet, workbook, metadatos }: GenerarInformePrestamoProps): Promise<void> => {
    // 1) Agregar llave para normalizar nombres de fuente y sumar por fuente
    const mapa: Record<string, number> = {};
    for (const f of FUENTES_OFICIALES) mapa[f] = 0;
    mapa['No especificada'] = 0;
    mapa['Otros'] = 0;

    let total = 0;

    for (const r of resultados) {
        const valor = parseNumber(r.Cuantia);
        total += valor;

        const fuenteRaw = r.Fuente ?? '';
        // separar por comas, filtrar vacíos y normalizar
        const partes = fuenteRaw
            .split(',')
            .map((p) => p.trim())
            .filter((p) => p.length > 0);

        if (partes.length === 0) {
            mapa['No especificada'] += valor;
            continue;
        }

        const reparto = valor / partes.length;
        for (const p of partes) {
            const clave = normalizeFuente(p);
            mapa[clave] = (mapa[clave] || 0) + reparto;
        }
    }

    const workbookInterno = workbook || new ExcelJS.Workbook();
    const sheet = worksheet || workbookInterno.addWorksheet('Informe Presupuestos');

    sheet.getColumn(1).width = 35;
    sheet.getColumn(2).width = 20;
    sheet.getColumn(3).width = 15;

    if (metadatos) {
        const filaInforme = sheet.addRow([metadatos.nombreInforme, '', '']);
        filaInforme.getCell(1).font = { bold: true, size: 16 };
        filaInforme.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.mergeCells(`A${filaInforme.number}:C${filaInforme.number}`);

        const filaAnio = sheet.addRow([`${t('Ano')}: ${metadatos.anio}`, '', '']);
        filaAnio.getCell(1).font = { bold: true };
        sheet.mergeCells(`A${filaAnio.number}:C${filaAnio.number}`);

        const filaRegiones = sheet.addRow([`${t('comarcas')}: ${metadatos.regiones}`, '', '']);
        filaRegiones.getCell(1).font = { bold: true };
        sheet.mergeCells(`A${filaRegiones.number}:C${filaRegiones.number}`);

        const filaFecha = sheet.addRow([`${t('fecha')}: ${metadatos.fechaHora}`, '', '']);
        filaFecha.getCell(1).font = { bold: true };
        sheet.mergeCells(`A${filaFecha.number}:C${filaFecha.number}`);

        sheet.addRow([]);
    }

    const title = sheet.addRow([t('object:infFuentes'), '', '']);
    title.font = { size: 14, bold: true };
    sheet.mergeCells(`A${title.number}:C${title.number}`);

    sheet.addRow([]);
    const filaTotal = sheet.addRow([t('object:infTotalAportado'), total, total > 0 ? '100%' : '0%']);
    filaTotal.font = { bold: true };
    sheet.getColumn(2).numFmt = '#,##0.00;[Red]-#,##0.00';

    sheet.addRow([]);

    // encabezado de tabla
    const header = sheet.addRow([t('object:infFuente'), t('object:infCantidadAportada'), t('porcentaje')]);
    header.font = { bold: true };

    // escribir filas en el orden pedido, incluyendo "No especificada" y "Otros"
    const ordered = ['Gobierno Vasco', 'DDFF', 'Administraciones locales', 'Fuentes privadas', 'Autofinanciación', 'Otros'];

    const FuentesFinanciacionTraduciones = t('object:fuentesFinanciacion', { returnObjects: true }) as string[];
    let index = 0;
    for (const fuente of ordered) {
        const cantidad = mapa[fuente] ?? 0;
        const porcentaje = total > 0 ? cantidad / total : 0;
        const row = sheet.addRow([FuentesFinanciacionTraduciones[index++], cantidad, porcentaje]);
        row.getCell(2).numFmt = '#,##0.00;[Red]-#,##0.00';
        row.getCell(3).numFmt = '0.00%';
    }

    // autofiltro y estilo
    sheet.autoFilter = {
        from: { row: header.number, column: 1 },
        to: { row: header.number, column: 3 },
    };

    if (!workbook) {
        const buffer = await workbookInterno.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `${t('object:infPresupuestos')}${anioSeleccionado}.xlsx`);
    }
};

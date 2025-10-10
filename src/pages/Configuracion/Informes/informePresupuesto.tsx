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
    const s = raw.trim();
    if (!s) return 'No especificada';
    const match = FUENTES_OFICIALES.find((fo) => fo.toLowerCase() === s.toLowerCase());
    return match ?? 'Otros';
}
interface GenerarInformePrestamoProps {
    resultados: Resultado[];
    t: TFunction<'translation'>;
}
export const GenerarInformePrestamo = async ({ resultados, t }: GenerarInformePrestamoProps): Promise<void> => {
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

        // reparto igual entre las fuentes listadas
        const reparto = valor / partes.length;
        for (const p of partes) {
            const clave = normalizeFuente(p);
            mapa[clave] = (mapa[clave] || 0) + reparto;
        }
    }

    // crear workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Informe Presupuestos');

    sheet.columns = [
        { header: t('object:infFuentes'), key: 'fuente', width: 35 },
        { header: t('object:infCantidadAportada'), key: 'cantidad', width: 20 },
        { header: t('porcentaje'), key: 'porcentaje', width: 15 },
    ];

    // título y total
    const title = sheet.addRow([t('object:infFuentes')]);
    title.font = { size: 14, bold: true };
    sheet.mergeCells('A1:C1');

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

    // descargar
    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${t('object:infPresupuestos')}${new Date().toISOString()}.xlsx`);
};

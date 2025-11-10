import saveAs from 'file-saver';
import { TFunction } from 'i18next';
import ExcelJS from 'exceljs';

export interface Valor {
    Id: number;
    Year: number;
    Valor: number;
    Objetivo: string;
}

export interface Dato {
    Id: number;
    AlcanceTerritorial: string;
    Valores: Valor[];
}

export interface IndicadorImpacto {
    Id: number;
    IdIndicador?: number; // Para ListadoCompleto
    IdIndicator?: number; // Para Datos
    IdCategoria: number;
    CategoriaNameEs: string;
    CategoriaNameEu: string;
    IndiadorNameEs?: string; // Para ListadoCompleto
    IndiadorNameEu?: string; // Para ListadoCompleto
    UnitEs?: string; // Para ListadoCompleto
    UnitEu?: string; // Para ListadoCompleto
    ValorTipo?: string; // Para Datos
    Rango?: string; // Para Datos
    mostrar?: boolean;
    alcance?: string;
    datos?: Dato[];
    Datos?: Dato[]; // Datos del backend
    listado?: boolean;
    LineBase?: number | string;
    Year?: number | string;
    Valor?: number; // Para Datos
    Objetivo?: string | null; // Para Datos
    ImpactType?: number; // 1: Aumentar, 2: Disminuir, 3: Mantener
    Relaciones?: {
        IdIndicator: number;
        IdCategoria: number;
        Year: number;
        Valor: number;
        Objetivo: string | null;
    };
}

interface GenerarInformeIndicadoresImpactoProps {
    datosOriginales: IndicadorImpacto[];
    datosConValores?: IndicadorImpacto[]; // Array "Datos" de la región
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

export const generarInformeIndicadoresImpacto = async ({
    datosOriginales,
    datosConValores,
    t,
    anioSeleccionado,
    worksheet,
    workbook,
    metadatos,
}: GenerarInformeIndicadoresImpactoProps): Promise<void> => {
    const workbookInterno = workbook || new ExcelJS.Workbook();
    const sheet = worksheet || workbookInterno.addWorksheet('Indicadores de Impacto');

    // Determinar el número máximo de años para crear columnas dinámicas
    let maxAnios = 0;
    if (datosConValores) {
        datosConValores.forEach((ind) => {
            const datosArray = ind.Datos?.[0] || ind.datos?.[0];
            if (datosArray?.Valores) {
                maxAnios = Math.max(maxAnios, datosArray.Valores.length);
            }
        });
    }

    // Configurar anchos de columnas fijas
    sheet.getColumn(1).width = 35; // Indicador
    sheet.getColumn(2).width = 25; // Categoría
    sheet.getColumn(3).width = 20; // Unidad de Medida
    sheet.getColumn(4).width = 30; // Alcance Territorial
    sheet.getColumn(5).width = 12; // Año Inicial
    sheet.getColumn(6).width = 15; // Valor Inicial
    sheet.getColumn(7).width = 18; // Objetivo Inicial

    // Configurar anchos de columnas dinámicas para cada año
    for (let i = 0; i < maxAnios; i++) {
        const baseCol = 8 + i * 4;
        sheet.getColumn(baseCol).width = 10; // Año
        sheet.getColumn(baseCol + 1).width = 15; // Valor
        sheet.getColumn(baseCol + 2).width = 18; // Objetivo
        sheet.getColumn(baseCol + 3).width = 18; // % Cumplimiento
    }

    const totalColumnas = 7 + maxAnios * 4;
    const ultimaColumnaLetra = String.fromCharCode(64 + totalColumnas);

    if (metadatos) {
        const fillerArray = new Array(totalColumnas - 1).fill('');
        const filaInforme = sheet.addRow([metadatos.nombreInforme, ...fillerArray]);
        filaInforme.getCell(1).font = { bold: true, size: 16 };
        filaInforme.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.mergeCells(`A${filaInforme.number}:${ultimaColumnaLetra}${filaInforme.number}`);

        const filaAnio = sheet.addRow([`${t('Ano')}: ${metadatos.anio}`, ...fillerArray]);
        filaAnio.getCell(1).font = { bold: true };
        sheet.mergeCells(`A${filaAnio.number}:${ultimaColumnaLetra}${filaAnio.number}`);

        const filaRegiones = sheet.addRow([`${t('comarcas')}: ${metadatos.regiones}`, ...fillerArray]);
        filaRegiones.getCell(1).font = { bold: true };
        sheet.mergeCells(`A${filaRegiones.number}:${ultimaColumnaLetra}${filaRegiones.number}`);

        const filaFecha = sheet.addRow([`${t('fecha')}: ${metadatos.fechaHora}`, ...fillerArray]);
        filaFecha.getCell(1).font = { bold: true };
        sheet.mergeCells(`A${filaFecha.number}:${ultimaColumnaLetra}${filaFecha.number}`);

        sheet.addRow([]);
    }

    const filasTitulo = sheet.addRow([t('InfIndicadoresImpacto'), ...new Array(totalColumnas - 1).fill('')]);
    filasTitulo.font = { bold: true, size: 14 };
    filasTitulo.alignment = { horizontal: 'center', vertical: 'middle' };
    sheet.mergeCells(`A${filasTitulo.number}:${ultimaColumnaLetra}${filasTitulo.number}`);

    sheet.addRow([]);

    // Crear encabezado dinámico
    const encabezadoArray = ['Indicador', 'Categoría', 'Unidad de Medida', 'Alcance Territorial', 'Año Inicial', 'Valor Inicial', 'Objetivo Inicial'];

    // Agregar encabezados para cada año
    for (let i = 0; i < maxAnios; i++) {
        encabezadoArray.push('Año', 'Valor', 'Objetivo', '% Cumplimiento');
    }

    const encabezado = sheet.addRow(encabezadoArray);
    encabezado.font = { bold: true };
    encabezado.alignment = { horizontal: 'center', vertical: 'middle' };
    encabezado.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD9E1F2' },
    };

    if (!datosOriginales || !Array.isArray(datosOriginales) || datosOriginales.length === 0) {
        const filaError = sheet.addRow(['No hay datos disponibles para generar el informe', '', '', '', '', '', '', '', '', '', '']);
        filaError.font = { bold: true, color: { argb: 'FFFF0000' } };
        sheet.mergeCells(`A${filaError.number}:K${filaError.number}`);

        if (!workbook) {
            const buffer = await workbookInterno.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(blob, `${t('InfIndicadoresImpacto')}_${anioSeleccionado}.xlsx`);
        }
        return;
    }

    const transformarObjetivo = (impactType?: number): string => {
        if (impactType === 1) return 'Aumentar';
        if (impactType === 2) return 'Disminuir';
        return 'Mantener';
    };

    // Filtrar solo los indicadores que existen en datosConValores
    const indicadoresFiltrados = datosOriginales.filter((indicador) => {
        if (!datosConValores || datosConValores.length === 0) return false;

        return datosConValores.some((d) => (d.IdIndicator === indicador.IdIndicador || d.IdIndicador === indicador.IdIndicador) && d.IdCategoria === indicador.IdCategoria);
    });

    indicadoresFiltrados.forEach((indicador) => {
        const nombreIndicador = indicador.IndiadorNameEs || '';
        const categoria = indicador.CategoriaNameEs || '';
        const unidad = indicador.UnitEs || '';

        // Valores iniciales desde ListadoCompleto
        const anioInicial = typeof indicador.Year === 'string' ? parseInt(indicador.Year) : indicador.Year || 0;
        const valorInicial = typeof indicador.LineBase === 'string' ? parseFloat(indicador.LineBase) : indicador.LineBase || 0;
        const objetivoInicial = transformarObjetivo(indicador.ImpactType);

        let valoresDisponibles: Valor[] = [];
        let alcanceTerritorialReal = '';

        if (datosConValores) {
            // Buscar por IdIndicator (Datos) o IdIndicador (ListadoCompleto)
            const indicadorConValores = datosConValores.find((d) => (d.IdIndicator === indicador.IdIndicador || d.IdIndicador === indicador.IdIndicador) && d.IdCategoria === indicador.IdCategoria);

            if (indicadorConValores) {
                const datosArray = indicadorConValores.Datos?.[0] || indicadorConValores.datos?.[0];

                if (datosArray) {
                    alcanceTerritorialReal = datosArray.AlcanceTerritorial || '';
                    if (datosArray.Valores) {
                        valoresDisponibles = datosArray.Valores;
                    }
                }
            }
        }

        // Crear una sola fila con todos los años en columnas
        const filaArray = [nombreIndicador, categoria, unidad, alcanceTerritorialReal, anioInicial, valorInicial, objetivoInicial];

        // Agregar datos para cada año disponible
        valoresDisponibles.forEach((valor) => {
            const valorAnio = valor.Valor || 0;
            const objetivoAnio = valor.Objetivo || '';
            const anioActual = valor.Year;

            // No calcular el porcentaje aquí, se calculará con fórmula de Excel
            filaArray.push(anioActual, valorAnio, objetivoAnio || objetivoInicial, '');
        });

        // Si hay menos años que maxAnios, rellenar con vacíos
        const aniosActuales = valoresDisponibles.length;
        for (let i = aniosActuales; i < maxAnios; i++) {
            filaArray.push('', '', '', '');
        }

        const fila = sheet.addRow(filaArray);
        const filaNum = fila.number;

        // Aplicar formato de números
        fila.getCell(5).numFmt = '0'; // Año inicial
        fila.getCell(6).numFmt = '#,##0.00'; // Valor inicial

        // Formatear las columnas de años y agregar fórmulas
        for (let i = 0; i < valoresDisponibles.length; i++) {
            const baseCol = 8 + i * 4;
            const colValor = baseCol + 1; // Columna del valor actual
            const colPorcentaje = baseCol + 3; // Columna del % cumplimiento

            fila.getCell(baseCol).numFmt = '0'; // Año
            fila.getCell(colValor).numFmt = '#,##0.00'; // Valor
            fila.getCell(colPorcentaje).numFmt = '0.00%'; // % Cumplimiento

            // Determinar la columna del valor anterior
            let colValorAnterior: string;
            if (i === 0) {
                // Primer año: comparar con Valor Inicial (columna F = 6)
                colValorAnterior = 'F';
            } else {
                // Años siguientes: comparar con el valor del año anterior
                const colAnterior = baseCol + 1 - 4; // 4 columnas atrás
                colValorAnterior = String.fromCharCode(64 + colAnterior);
            }

            const colValorActual = String.fromCharCode(64 + colValor);

            // Fórmula: valorActual / valorAnterior
            // Usar IF para evitar división por cero o valores vacíos
            const formula = `IF(AND(ISNUMBER(${colValorActual}${filaNum}),ISNUMBER(${colValorAnterior}${filaNum}),${colValorAnterior}${filaNum}<>0),${colValorActual}${filaNum}/${colValorAnterior}${filaNum},"")`;
            fila.getCell(colPorcentaje).value = { formula };
        }

        // Rellenar columnas vacías para años sin datos
        for (let i = valoresDisponibles.length; i < maxAnios; i++) {
            const baseCol = 8 + i * 4;
            fila.getCell(baseCol).numFmt = '0'; // Año
            fila.getCell(baseCol + 1).numFmt = '#,##0.00'; // Valor
            fila.getCell(baseCol + 3).numFmt = '0.00%'; // %Cumplimiento
        }

        // Aplicar alineación y bordes
        const totalColumnas = 7 + maxAnios * 4;
        for (let col = 1; col <= totalColumnas; col++) {
            const cell = fila.getCell(col);
            if (col <= 7) {
                cell.alignment = { vertical: 'middle', horizontal: 'left' };
            } else {
                cell.alignment = { vertical: 'middle', horizontal: 'center' };
            }
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        }
    });

    const ultimaFila = sheet.lastRow?.number || 1;
    const primeraFilaTabla = encabezado.number;
    const totalColumnasTabla = 7 + maxAnios * 4;

    for (let row = primeraFilaTabla; row <= ultimaFila; row++) {
        for (let col = 1; col <= totalColumnasTabla; col++) {
            const cell = sheet.getRow(row).getCell(col);
            cell.border = {
                top: { style: 'thin' },
                left: { style: 'thin' },
                bottom: { style: 'thin' },
                right: { style: 'thin' },
            };
        }
    }

    // Aplicar formato condicional a las columnas de % Cumplimiento
    const primeraFilaDatos = encabezado.number + 1;
    for (let i = 0; i < maxAnios; i++) {
        const colObjetivo = 8 + i * 4 + 2; // Columna de Objetivo
        const colPorcentaje = 8 + i * 4 + 3; // Columna de % Cumplimiento
        const colObjetivoLetra = String.fromCharCode(64 + colObjetivo);
        const colPorcentajeLetra = String.fromCharCode(64 + colPorcentaje);

        // Formato condicional para "Aumentar" - Verde si >= 100%
        sheet.addConditionalFormatting({
            ref: `${colPorcentajeLetra}${primeraFilaDatos}:${colPorcentajeLetra}${ultimaFila}`,
            rules: [
                {
                    type: 'expression',
                    formulae: [`AND(OR(${colObjetivoLetra}${primeraFilaDatos}="Aumentar",${colObjetivoLetra}${primeraFilaDatos}="1"),${colPorcentajeLetra}${primeraFilaDatos}>=1)`],
                    style: {
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            bgColor: { argb: 'FFC6EFCE' },
                        },
                    },
                    priority: 1,
                },
            ],
        });

        // Formato condicional para "Aumentar" - Amarillo si >= 90% y < 100%
        sheet.addConditionalFormatting({
            ref: `${colPorcentajeLetra}${primeraFilaDatos}:${colPorcentajeLetra}${ultimaFila}`,
            rules: [
                {
                    type: 'expression',
                    formulae: [
                        `AND(OR(${colObjetivoLetra}${primeraFilaDatos}="Aumentar",${colObjetivoLetra}${primeraFilaDatos}="1"),${colPorcentajeLetra}${primeraFilaDatos}>=0.9,${colPorcentajeLetra}${primeraFilaDatos}<1)`,
                    ],
                    style: {
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            bgColor: { argb: 'FFFFEB9C' },
                        },
                    },
                    priority: 2,
                },
            ],
        });

        // Formato condicional para "Aumentar" - Rojo si < 90%
        sheet.addConditionalFormatting({
            ref: `${colPorcentajeLetra}${primeraFilaDatos}:${colPorcentajeLetra}${ultimaFila}`,
            rules: [
                {
                    type: 'expression',
                    formulae: [`AND(OR(${colObjetivoLetra}${primeraFilaDatos}="Aumentar",${colObjetivoLetra}${primeraFilaDatos}="1"),${colPorcentajeLetra}${primeraFilaDatos}<0.9)`],
                    style: {
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            bgColor: { argb: 'FFFFC7CE' },
                        },
                    },
                    priority: 3,
                },
            ],
        });

        // Formato condicional para "Disminuir" - Verde si <= 100%
        sheet.addConditionalFormatting({
            ref: `${colPorcentajeLetra}${primeraFilaDatos}:${colPorcentajeLetra}${ultimaFila}`,
            rules: [
                {
                    type: 'expression',
                    formulae: [`AND(OR(${colObjetivoLetra}${primeraFilaDatos}="Disminuir",${colObjetivoLetra}${primeraFilaDatos}="2"),${colPorcentajeLetra}${primeraFilaDatos}<=1)`],
                    style: {
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            bgColor: { argb: 'FFC6EFCE' },
                        },
                    },
                    priority: 4,
                },
            ],
        });

        // Formato condicional para "Disminuir" - Amarillo si > 100% y <= 110%
        sheet.addConditionalFormatting({
            ref: `${colPorcentajeLetra}${primeraFilaDatos}:${colPorcentajeLetra}${ultimaFila}`,
            rules: [
                {
                    type: 'expression',
                    formulae: [
                        `AND(OR(${colObjetivoLetra}${primeraFilaDatos}="Disminuir",${colObjetivoLetra}${primeraFilaDatos}="2"),${colPorcentajeLetra}${primeraFilaDatos}>1,${colPorcentajeLetra}${primeraFilaDatos}<=1.1)`,
                    ],
                    style: {
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            bgColor: { argb: 'FFFFEB9C' },
                        },
                    },
                    priority: 5,
                },
            ],
        });

        // Formato condicional para "Disminuir" - Rojo si > 110%
        sheet.addConditionalFormatting({
            ref: `${colPorcentajeLetra}${primeraFilaDatos}:${colPorcentajeLetra}${ultimaFila}`,
            rules: [
                {
                    type: 'expression',
                    formulae: [`AND(OR(${colObjetivoLetra}${primeraFilaDatos}="Disminuir",${colObjetivoLetra}${primeraFilaDatos}="2"),${colPorcentajeLetra}${primeraFilaDatos}>1.1)`],
                    style: {
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            bgColor: { argb: 'FFFFC7CE' },
                        },
                    },
                    priority: 6,
                },
            ],
        });

        // Formato condicional para "Mantener" - Verde si entre 95% y 105%
        sheet.addConditionalFormatting({
            ref: `${colPorcentajeLetra}${primeraFilaDatos}:${colPorcentajeLetra}${ultimaFila}`,
            rules: [
                {
                    type: 'expression',
                    formulae: [
                        `AND(OR(${colObjetivoLetra}${primeraFilaDatos}="Mantener",${colObjetivoLetra}${primeraFilaDatos}="3"),${colPorcentajeLetra}${primeraFilaDatos}>=0.95,${colPorcentajeLetra}${primeraFilaDatos}<=1.05)`,
                    ],
                    style: {
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            bgColor: { argb: 'FFC6EFCE' },
                        },
                    },
                    priority: 7,
                },
            ],
        });

        // Formato condicional para "Mantener" - Amarillo si entre 85%-95% o 105%-115%
        sheet.addConditionalFormatting({
            ref: `${colPorcentajeLetra}${primeraFilaDatos}:${colPorcentajeLetra}${ultimaFila}`,
            rules: [
                {
                    type: 'expression',
                    formulae: [
                        `AND(OR(${colObjetivoLetra}${primeraFilaDatos}="Mantener",${colObjetivoLetra}${primeraFilaDatos}="3"),OR(AND(${colPorcentajeLetra}${primeraFilaDatos}>=0.85,${colPorcentajeLetra}${primeraFilaDatos}<0.95),AND(${colPorcentajeLetra}${primeraFilaDatos}>1.05,${colPorcentajeLetra}${primeraFilaDatos}<=1.15)))`,
                    ],
                    style: {
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            bgColor: { argb: 'FFFFEB9C' },
                        },
                    },
                    priority: 8,
                },
            ],
        });

        // Formato condicional para "Mantener" - Rojo si < 85% o > 115%
        sheet.addConditionalFormatting({
            ref: `${colPorcentajeLetra}${primeraFilaDatos}:${colPorcentajeLetra}${ultimaFila}`,
            rules: [
                {
                    type: 'expression',
                    formulae: [
                        `AND(OR(${colObjetivoLetra}${primeraFilaDatos}="Mantener",${colObjetivoLetra}${primeraFilaDatos}="3"),OR(${colPorcentajeLetra}${primeraFilaDatos}<0.85,${colPorcentajeLetra}${primeraFilaDatos}>1.15))`,
                    ],
                    style: {
                        fill: {
                            type: 'pattern',
                            pattern: 'solid',
                            bgColor: { argb: 'FFFFC7CE' },
                        },
                    },
                    priority: 9,
                },
            ],
        });
    }

    sheet.eachRow((row) => {
        row.alignment = { vertical: 'middle', horizontal: 'center' };
    });

    if (!workbook) {
        const buffer = await workbookInterno.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `${t('InfIndicadoresImpacto')}_${anioSeleccionado}.xlsx`);
    }
};

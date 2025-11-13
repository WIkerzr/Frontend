import saveAs from 'file-saver';
import { TFunction } from 'i18next';
import ExcelJS from 'exceljs';
import i18n from '../../../i18n';

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

// Helper para parsear números: si vienen con puntos (.) se eliminan
const parseNumber = (v: unknown): number => {
    if (v === null || v === undefined) return 0;
    if (typeof v === 'number') return v;
    let s = String(v).trim();
    if (s === '') return 0;

    if (s.indexOf('.') !== -1) {
        s = s.replace(/\./g, '');
    }

    if (s.indexOf(',') !== -1) {
        s = s.replace(/,/g, '.');
    }

    const n = parseFloat(s);
    return isNaN(n) ? 0 : n;
};

const parseIntSafe = (v: unknown): number => {
    const n = parseNumber(v);
    return isNaN(n) ? 0 : Math.trunc(n);
};

interface GenerarInformeIndicadoresImpactoProps {
    datosOriginales: IndicadorImpacto[];
    datosConValores?: IndicadorImpacto[]; // Array "Datos" de la región
    t: TFunction<'translation'>;
    worksheet?: ExcelJS.Worksheet;
    workbook?: ExcelJS.Workbook;
    metadatos?: {
        nombreInforme: string;
        regiones: string;
        fechaHora: string;
    };
}

export const generarInformeIndicadoresImpacto = async ({ datosOriginales, datosConValores, t, worksheet, workbook, metadatos }: GenerarInformeIndicadoresImpactoProps): Promise<void> => {
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
        sheet.getColumn(baseCol + 2).width = 18; // Cumplimiento
        sheet.getColumn(baseCol + 3).width = 20; // Siguiente objetivo
    }

    const totalColumnas = 7 + maxAnios * 4;
    const ultimaColumnaLetra = String.fromCharCode(64 + totalColumnas);

    if (metadatos) {
        const fillerArray = new Array(totalColumnas - 1).fill('');
        const filaInforme = sheet.addRow([metadatos.nombreInforme, ...fillerArray]);
        filaInforme.getCell(1).font = { bold: true, size: 16 };
        filaInforme.getCell(1).alignment = { horizontal: 'center', vertical: 'middle' };
        sheet.mergeCells(`A${filaInforme.number}:${ultimaColumnaLetra}${filaInforme.number}`);

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
    const encabezadoArray = [t('indicador'), t('categoria'), t('unidadMedida'), t('alcanceTerritorial'), t('anioInicial'), t('valorInicial'), t('objetivoInicial')];

    // Agregar encabezados para cada año
    for (let i = 0; i < maxAnios; i++) {
        encabezadoArray.push(t('anio'), t('valor'), t('cumplimiento'), t('siguienteObjetivo'));
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
        const filaError = sheet.addRow([t('noDatosDisponiblesInforme'), '', '', '', '', '', '', '', '', '', '']);
        filaError.font = { bold: true, color: { argb: 'FFFF0000' } };
        sheet.mergeCells(`A${filaError.number}:K${filaError.number}`);

        if (!workbook) {
            const buffer = await workbookInterno.xlsx.writeBuffer();
            const blob = new Blob([buffer], {
                type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            });
            saveAs(blob, `${t('InfIndicadoresImpacto')}.xlsx`);
        }
        return;
    }

    // Devuelve la cadena traducida para mostrar en el informe
    const transformarObjetivo = (impactType?: number): string => {
        if (impactType === 1) return t('aumentar');
        if (impactType === 2) return t('disminuir');
        return t('mantener');
    };

    type ObjetivoKey = 'AUMENTAR' | 'DISMINUIR' | 'MANTENER';

    const objetivoKeyFromImpactType = (impactType?: number): ObjetivoKey => {
        if (impactType === 1) return 'AUMENTAR';
        if (impactType === 2) return 'DISMINUIR';
        return 'MANTENER';
    };

    const objetivoKeyFromString = (objetivo?: string | null): ObjetivoKey | null => {
        if (!objetivo) return null;
        const lower = objetivo.toLowerCase();
        if (lower.includes('aument') || lower.includes('handit')) return 'AUMENTAR';
        if (lower.includes('dismin') || lower.includes('txikit')) return 'DISMINUIR';
        if (lower.includes('manten') || lower.includes('mantend')) return 'MANTENER';
        return null;
    };

    // Función para traducir objetivos guardados en base de datos
    const traducirObjetivo = (objetivo?: string | null): string => {
        if (!objetivo) return '';
        const objetivoLower = objetivo.toLowerCase();
        if (objetivoLower.includes('aumentar') || objetivoLower.includes('handitu')) return t('aumentar');
        if (objetivoLower.includes('disminuir') || objetivoLower.includes('txikitu')) return t('disminuir');
        if (objetivoLower.includes('mantener') || objetivoLower.includes('mantendu')) return t('mantener');
        return objetivo; // Si no coincide, devolver tal cual
    };

    // Función para traducir alcance territorial guardado en base de datos
    const traducirAlcanceTerritorial = (alcance?: string): string => {
        if (!alcance) return '';

        // Mapear valores exactos que vienen del select
        const mapaAlcances: { [key: string]: string } = {
            Comarcal: t('comarcal'),
            ZEA: t('ZEA'),
            'Zona rural (ZEA + TER+ zona rural de HRD)': t('Zrural'),
            'Municipios rurales (ZEA + TER)': t('ZEATER'),
        };

        // Buscar coincidencia exacta
        if (mapaAlcances[alcance]) {
            return mapaAlcances[alcance];
        }

        // Si no hay coincidencia exacta, buscar en las traducciones inversas (por si viene ya traducido)
        const alcanceLower = alcance.toLowerCase();
        if (alcanceLower.includes('comarcal') || alcanceLower.includes('barrutiko')) {
            return t('comarcal');
        }
        if (alcanceLower === 'zea') {
            return t('ZEA');
        }
        if (alcanceLower.includes('landa-eremua') || alcanceLower.includes('zona rural')) {
            return t('Zrural');
        }
        if (alcanceLower.includes('landa-udalerriak') || alcanceLower.includes('municipios rurales')) {
            return t('ZEATER');
        }

        return alcance; // Si no coincide, devolver tal cual
    };

    // Filtrar solo los indicadores que existen en datosConValores
    const indicadoresFiltrados = datosOriginales.filter((indicador) => {
        if (!datosConValores || datosConValores.length === 0) return false;

        return datosConValores.some((d) => (d.IdIndicator === indicador.IdIndicador || d.IdIndicador === indicador.IdIndicador) && d.IdCategoria === indicador.IdCategoria);
    });

    // Calcular la primera fila de datos (para usarla en las fórmulas)
    const primeraFilaDatos = encabezado.number + 1;

    // Detectar idioma actual
    const idiomaActual = i18n.language;
    const esEuskera = idiomaActual === 'eu';

    indicadoresFiltrados.forEach((indicador) => {
        // Usar campos según idioma, con fallback al otro idioma si está vacío
        const nombreIndicador = esEuskera ? indicador.IndiadorNameEu || indicador.IndiadorNameEs || '' : indicador.IndiadorNameEs || indicador.IndiadorNameEu || '';

        const categoria = esEuskera ? indicador.CategoriaNameEu || indicador.CategoriaNameEs || '' : indicador.CategoriaNameEs || indicador.CategoriaNameEu || '';

        const unidad = esEuskera ? indicador.UnitEu || indicador.UnitEs || '' : indicador.UnitEs || indicador.UnitEu || '';

        // Valores iniciales desde ListadoCompleto (por defecto)
        let anioInicial = parseIntSafe(indicador.Year);
        let valorInicial = parseNumber(indicador.LineBase);
        let objetivoInicialDisplay = transformarObjetivo(indicador.ImpactType);
        let objetivoInicialKey: ObjetivoKey = objetivoKeyFromImpactType(indicador.ImpactType);

        let valoresDisponibles: Valor[] = [];
        let alcanceTerritorialReal = '';
        let rango = 0; // Rango de tolerancia

        if (datosConValores) {
            // Buscar por IdIndicator (Datos) o IdIndicador (ListadoCompleto)
            const indicadorConValores = datosConValores.find((d) => (d.IdIndicator === indicador.IdIndicador || d.IdIndicador === indicador.IdIndicador) && d.IdCategoria === indicador.IdCategoria);

            if (indicadorConValores) {
                // Si hay Relaciones, usar esos datos para los valores iniciales
                if (indicadorConValores.Relaciones) {
                    const rel = indicadorConValores.Relaciones;
                    // Verificar que coincidan IdIndicator e IdCategoria
                    if ((rel.IdIndicator === indicador.IdIndicador || rel.IdIndicator === indicador.IdIndicator) && rel.IdCategoria === indicador.IdCategoria) {
                        anioInicial = rel.Year;
                        valorInicial = rel.Valor;
                        const display = traducirObjetivo(rel.Objetivo) || objetivoInicialDisplay;
                        objetivoInicialDisplay = display;
                        const key = objetivoKeyFromString(rel.Objetivo);
                        if (key) objetivoInicialKey = key;
                    }
                }

                const datosArray = indicadorConValores.Datos?.[0] || indicadorConValores.datos?.[0];

                // Obtener el Rango del indicador
                const rangoStr = indicadorConValores.Rango;
                if (rangoStr !== undefined && rangoStr !== null && String(rangoStr).trim() !== '') {
                    rango = parseNumber(rangoStr);
                }

                if (datosArray) {
                    alcanceTerritorialReal = traducirAlcanceTerritorial(datosArray.AlcanceTerritorial);
                    if (datosArray.Valores) {
                        valoresDisponibles = datosArray.Valores.map((v) => ({ ...v, Valor: parseNumber(v.Valor), Year: parseIntSafe(v.Year) }));
                    }
                }
            }
        }

        // Crear una sola fila con todos los años en columnas
        const filaArray = [nombreIndicador, categoria, unidad, alcanceTerritorialReal, anioInicial, valorInicial, objetivoInicialDisplay];

        // Agregar datos para cada año disponible
        valoresDisponibles.forEach((valor) => {
            const valorAnio = parseNumber(valor.Valor);
            const anioActual = parseIntSafe(valor.Year);
            const objetivoAnioDisplay = traducirObjetivo(valor.Objetivo) || objetivoInicialDisplay;

            // Orden: Año, Valor, Cumplimiento (vacío, se calculará con fórmula), Siguiente objetivo
            filaArray.push(anioActual, valorAnio, '', objetivoAnioDisplay);
        });

        // Si hay menos años que maxAnios, rellenar con vacíos
        const aniosActuales = valoresDisponibles.length;
        for (let i = aniosActuales; i < maxAnios; i++) {
            filaArray.push('', '', '', '');
        }

        const fila = sheet.addRow(filaArray);

        // Aplicar formato de números
        fila.getCell(5).numFmt = '0'; // Año inicial
        fila.getCell(6).numFmt = '#,##0.00'; // Valor inicial

        // Formatear las columnas de años y calcular cumplimiento
        for (let i = 0; i < valoresDisponibles.length; i++) {
            const baseCol = 8 + i * 4;
            const colValor = baseCol + 1; // Columna del valor actual
            const colPorcentaje = baseCol + 2; // Columna del Cumplimiento (ahora en posición 2)

            fila.getCell(baseCol).numFmt = '0'; // Año
            fila.getCell(colValor).numFmt = '#,##0.00'; // Valor

            // Calcular valores desde TypeScript para simplificar
            const valorAct = parseNumber(valoresDisponibles[i]?.Valor);
            const valorAnt = i === 0 ? valorInicial : parseNumber(valoresDisponibles[i - 1]?.Valor);
            const diferencia = valorAct - valorAnt;
            const objetivoStr = valoresDisponibles[i]?.Objetivo;
            const keyFromVal = objetivoKeyFromString(objetivoStr);
            const tipoObjetivo: ObjetivoKey = keyFromVal || objetivoInicialKey;

            let textoResultado = '';

            // Solo calcular si hay un valor anterior válido
            if (valorAnt !== 0) {
                // Determinar si cumple basado en el Rango
                let cumple = false;
                if (rango > 0) {
                    // Si rango está en (0..100) lo interpretamos como porcentaje (%) de tolerancia
                    if (rango > 0 && rango <= 100) {
                        const tolPercent = rango; // p.ej. 1 => 1%
                        if (tipoObjetivo === 'AUMENTAR') {
                            const umbral = valorAnt * (1 + tolPercent / 100);
                            cumple = valorAct > umbral;
                        } else if (tipoObjetivo === 'DISMINUIR') {
                            const umbral = valorAnt * (1 - tolPercent / 100);
                            cumple = valorAct < umbral;
                        } else if (tipoObjetivo === 'MANTENER') {
                            const min = valorAnt * (1 - tolPercent / 100);
                            const max = valorAnt * (1 + tolPercent / 100);
                            cumple = valorAct >= min && valorAct <= max;
                        }
                    } else {
                        // Si rango es mayor a 100 lo tratamos como margen absoluto
                        if (tipoObjetivo === 'AUMENTAR') {
                            cumple = valorAct >= valorAnt + rango;
                        } else if (tipoObjetivo === 'DISMINUIR') {
                            cumple = valorAct <= valorAnt - rango;
                        } else if (tipoObjetivo === 'MANTENER') {
                            cumple = valorAct >= valorAnt - rango && valorAct <= valorAnt + rango;
                        }
                    }
                } else {
                    // Sin rango: usar una tolerancia por defecto en porcentaje (99%-101% para mantener)
                    const ratioPercent = (valorAct / valorAnt) * 100;
                    if (tipoObjetivo === 'AUMENTAR') {
                        cumple = ratioPercent > 100;
                    } else if (tipoObjetivo === 'DISMINUIR') {
                        cumple = ratioPercent < 100;
                    } else if (tipoObjetivo === 'MANTENER') {
                        cumple = ratioPercent >= 99 && ratioPercent <= 101;
                    }
                }

                textoResultado = `${cumple ? t('si') : t('no')} (${diferencia.toFixed(2)})`;

                // Aplicar color según el resultado
                const cell = fila.getCell(colPorcentaje);
                cell.value = textoResultado;
                cell.numFmt = '@';

                if (cumple) {
                    // SI - marcado siempre como verde
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFC6EFCE' }, // Verde
                    };
                } else {
                    // NO - rojo
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFC7CE' }, // Rojo
                    };
                }
            } else {
                // Si no hay valor anterior, marcar como "SIN DATOS" - rojo
                const cell = fila.getCell(colPorcentaje);
                cell.value = t('sinDatosInforme');
                cell.numFmt = '@';
                cell.fill = {
                    type: 'pattern',
                    pattern: 'solid',
                    fgColor: { argb: 'FFFFC7CE' }, // Rojo
                };
            }
        }

        // Rellenar columnas vacías para años sin datos
        for (let i = valoresDisponibles.length; i < maxAnios; i++) {
            const baseCol = 8 + i * 4;
            fila.getCell(baseCol).numFmt = '0'; // Año
            fila.getCell(baseCol + 1).numFmt = '#,##0.00'; // Valor
            fila.getCell(baseCol + 2).numFmt = '@'; // Cumplimiento - formato texto
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

    // Los colores ya se aplican directamente en las celdas durante la generación de datos

    // Agregar resumen de cumplimiento debajo de la tabla
    sheet.addRow([]); // Fila vacía
    sheet.addRow([]); // Fila vacía

    // Calcular estadísticas para todas las columnas de Cumplimiento (solo Válida / No válida)
    const estadisticasPorAnio: Array<{
        colValor: number;
        colPorcentaje: number;
        porcentajeNoValida: string;
        porcentajeValida: string;
    }> = [];

    for (let i = 0; i < maxAnios; i++) {
        const colPorcentaje = 8 + i * 4 + 2; // Columna de Cumplimiento
        const colValor = 8 + i * 4 + 1; // Columna de Valor

        // Contar valores en la columna de cumplimiento
        let totalFilas = 0;
        let contadorNoValida = 0;
        let contadorValida = 0;

        // Recorrer todas las filas de datos
        for (let rowNum = primeraFilaDatos; rowNum <= ultimaFila; rowNum++) {
            const cellValue = sheet.getRow(rowNum).getCell(colPorcentaje).value;
            if (cellValue && cellValue !== '') {
                const texto = String(cellValue);
                totalFilas++;

                // Considerar válida cualquier texto que empiece por 'si' (cumple)
                if (texto.startsWith(t('si'))) {
                    contadorValida++;
                } else {
                    // Todo lo demás se considera no válida (incluye 'sinDatosInforme' y 'no')
                    contadorNoValida++;
                }
            }
        }
        sheet.eachRow((row) => {
            row.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        const porcentajeNoValida = totalFilas > 0 ? ((contadorNoValida / totalFilas) * 100).toFixed(1) : '0.0';
        const porcentajeValida = totalFilas > 0 ? ((contadorValida / totalFilas) * 100).toFixed(1) : '0.0';

        estadisticasPorAnio.push({
            colValor,
            colPorcentaje,
            porcentajeNoValida,
            porcentajeValida,
        });
    }

    // Crear las filas de resumen una sola vez para todos los años (No válida / Válida)
    const filaResumenTitulo = sheet.addRow([]);
    const filaRoja = sheet.addRow([]);
    const filaVerde = sheet.addRow([]);

    // Aplicar los valores a cada columna
    estadisticasPorAnio.forEach((stats) => {
        // Título
        filaResumenTitulo.getCell(stats.colValor).value = t('resumenCumplimiento');
        filaResumenTitulo.getCell(stats.colValor).font = { bold: true };
        filaResumenTitulo.getCell(stats.colValor).alignment = { horizontal: 'right', vertical: 'middle' };

        // Fila roja (No válida)
        filaRoja.getCell(stats.colValor).value = t('noValida');
        filaRoja.getCell(stats.colValor).alignment = { horizontal: 'right', vertical: 'middle' };
        filaRoja.getCell(stats.colPorcentaje).value = `${stats.porcentajeNoValida}%`;
        filaRoja.getCell(stats.colPorcentaje).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC7CE' },
        };
        filaRoja.getCell(stats.colPorcentaje).alignment = { horizontal: 'center', vertical: 'middle' };

        // Fila verde (Válida)
        filaVerde.getCell(stats.colValor).value = t('valida') || 'Válida';
        filaVerde.getCell(stats.colValor).alignment = { horizontal: 'right', vertical: 'middle' };
        filaVerde.getCell(stats.colPorcentaje).value = `${stats.porcentajeValida}%`;
        filaVerde.getCell(stats.colPorcentaje).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFC6EFCE' },
        };
        filaVerde.getCell(stats.colPorcentaje).alignment = { horizontal: 'center', vertical: 'middle' };
    });

    if (!workbook) {
        const buffer = await workbookInterno.xlsx.writeBuffer();
        const blob = new Blob([buffer], {
            type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        });
        saveAs(blob, `${t('InfIndicadoresImpacto')}.xlsx`);
    }
};

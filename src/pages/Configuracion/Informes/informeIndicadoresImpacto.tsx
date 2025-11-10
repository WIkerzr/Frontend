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
        encabezadoArray.push('Año', 'Valor', 'Cumplimiento', 'Siguiente objetivo');
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

    // Calcular la primera fila de datos (para usarla en las fórmulas)
    const primeraFilaDatos = encabezado.number + 1;

    indicadoresFiltrados.forEach((indicador) => {
        const nombreIndicador = indicador.IndiadorNameEs || '';
        const categoria = indicador.CategoriaNameEs || '';
        const unidad = indicador.UnitEs || '';

        // Valores iniciales desde ListadoCompleto (por defecto)
        let anioInicial = typeof indicador.Year === 'string' ? parseInt(indicador.Year) : indicador.Year || 0;
        let valorInicial = typeof indicador.LineBase === 'string' ? parseFloat(indicador.LineBase) : indicador.LineBase || 0;
        let objetivoInicial = transformarObjetivo(indicador.ImpactType);

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
                        objetivoInicial = rel.Objetivo || objetivoInicial;
                    }
                }

                const datosArray = indicadorConValores.Datos?.[0] || indicadorConValores.datos?.[0];

                // Obtener el Rango del indicador
                const rangoStr = indicadorConValores.Rango;
                if (rangoStr) {
                    rango = typeof rangoStr === 'string' ? parseFloat(rangoStr) : rangoStr;
                }

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

            // Orden: Año, Valor, Cumplimiento (vacío, se calculará con fórmula), Siguiente objetivo
            filaArray.push(anioActual, valorAnio, '', objetivoAnio || objetivoInicial);
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
            const valorAct = valoresDisponibles[i]?.Valor ?? 0;
            const valorAnt = i === 0 ? valorInicial : valoresDisponibles[i - 1]?.Valor ?? 0;
            const diferencia = valorAct - valorAnt;
            const tipoObjetivo = objetivoInicial; // Aumentar, Disminuir, Mantener

            let textoResultado = '';

            // Solo calcular si hay un valor anterior válido
            if (valorAnt !== 0) {
                // Determinar si cumple basado en el Rango
                let cumple = false;
                if (rango > 0) {
                    // Rango define el margen de tolerancia respecto al valor anterior
                    if (tipoObjetivo === 'Aumentar') {
                        // Aumentar: Cumple si valorActual >= valorAnterior + Rango
                        cumple = valorAct >= valorAnt + rango;
                    } else if (tipoObjetivo === 'Disminuir') {
                        // Disminuir: Cumple si valorActual <= valorAnterior - Rango
                        cumple = valorAct <= valorAnt - rango;
                    } else if (tipoObjetivo === 'Mantener') {
                        // Mantener: Cumple si está dentro de [valorAnterior - Rango, valorAnterior + Rango]
                        cumple = valorAct >= valorAnt - rango && valorAct <= valorAnt + rango;
                    }
                } else {
                    // Si no hay rango, usar la lógica anterior basada en porcentajes
                    const ratio = valorAct / valorAnt;
                    if (tipoObjetivo === 'Aumentar') {
                        cumple = ratio >= 1;
                    } else if (tipoObjetivo === 'Disminuir') {
                        cumple = ratio <= 1;
                    } else if (tipoObjetivo === 'Mantener') {
                        cumple = ratio >= 0.95 && ratio <= 1.05;
                    }
                }

                textoResultado = `${cumple ? 'SI' : 'NO'} (${diferencia.toFixed(2)})`;

                // Aplicar color según el resultado
                const cell = fila.getCell(colPorcentaje);
                cell.value = textoResultado;
                cell.numFmt = '@';

                if (cumple) {
                    // SI - determinar si es verde (diferencia >= 85) o amarillo (diferencia < 85)
                    if (Math.abs(diferencia) >= 85) {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFC6EFCE' }, // Verde
                        };
                    } else {
                        cell.fill = {
                            type: 'pattern',
                            pattern: 'solid',
                            fgColor: { argb: 'FFFFEB9C' }, // Amarillo
                        };
                    }
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
                cell.value = 'SIN DATOS';
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

    // Calcular estadísticas para todas las columnas de Cumplimiento
    const estadisticasPorAnio: Array<{
        colValor: number;
        colPorcentaje: number;
        porcentajeRojo: string;
        porcentajeAmarillo: string;
        porcentajeVerde: string;
    }> = [];

    for (let i = 0; i < maxAnios; i++) {
        const colPorcentaje = 8 + i * 4 + 2; // Columna de Cumplimiento
        const colValor = 8 + i * 4 + 1; // Columna de Valor

        // Contar valores en la columna de cumplimiento
        let totalFilas = 0;
        let contadorRojos = 0;
        let contadorAmarillos = 0;
        let contadorVerdes = 0;

        // Recorrer todas las filas de datos
        for (let rowNum = primeraFilaDatos; rowNum <= ultimaFila; rowNum++) {
            const cellValue = sheet.getRow(rowNum).getCell(colPorcentaje).value;
            if (cellValue && cellValue !== '') {
                const texto = String(cellValue);
                totalFilas++;

                if (texto === 'SIN DATOS' || texto.startsWith('NO')) {
                    contadorRojos++;
                } else if (texto.startsWith('SI')) {
                    const match = texto.match(/SI \(([^)]+)\)/);
                    if (match) {
                        const diferencia = parseFloat(match[1]);
                        if (Math.abs(diferencia) >= 85) {
                            contadorVerdes++;
                        } else {
                            contadorAmarillos++;
                        }
                    } else {
                        contadorAmarillos++;
                    }
                }
            }
        }
        sheet.eachRow((row) => {
            row.alignment = { vertical: 'middle', horizontal: 'center' };
        });

        const porcentajeRojo = totalFilas > 0 ? ((contadorRojos / totalFilas) * 100).toFixed(1) : '0.0';
        const porcentajeAmarillo = totalFilas > 0 ? ((contadorAmarillos / totalFilas) * 100).toFixed(1) : '0.0';
        const porcentajeVerde = totalFilas > 0 ? ((contadorVerdes / totalFilas) * 100).toFixed(1) : '0.0';

        estadisticasPorAnio.push({
            colValor,
            colPorcentaje,
            porcentajeRojo,
            porcentajeAmarillo,
            porcentajeVerde,
        });
    }

    // Crear las filas de resumen una sola vez para todos los años
    const filaResumenTitulo = sheet.addRow([]);
    const filaRoja = sheet.addRow([]);
    const filaAmarilla = sheet.addRow([]);
    const filaVerde = sheet.addRow([]);

    // Aplicar los valores a cada columna
    estadisticasPorAnio.forEach((stats) => {
        // Título
        filaResumenTitulo.getCell(stats.colValor).value = 'Resumen de Cumplimiento';
        filaResumenTitulo.getCell(stats.colValor).font = { bold: true };
        filaResumenTitulo.getCell(stats.colValor).alignment = { horizontal: 'right', vertical: 'middle' };

        // Fila roja
        filaRoja.getCell(stats.colValor).value = 'Ejecución reducida';
        filaRoja.getCell(stats.colValor).alignment = { horizontal: 'right', vertical: 'middle' };
        filaRoja.getCell(stats.colPorcentaje).value = `${stats.porcentajeRojo}%`;
        filaRoja.getCell(stats.colPorcentaje).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFC7CE' },
        };
        filaRoja.getCell(stats.colPorcentaje).alignment = { horizontal: 'center', vertical: 'middle' };

        // Fila amarilla
        filaAmarilla.getCell(stats.colValor).value = 'Ejecución media';
        filaAmarilla.getCell(stats.colValor).alignment = { horizontal: 'right', vertical: 'middle' };
        filaAmarilla.getCell(stats.colPorcentaje).value = `${stats.porcentajeAmarillo}%`;
        filaAmarilla.getCell(stats.colPorcentaje).fill = {
            type: 'pattern',
            pattern: 'solid',
            fgColor: { argb: 'FFFFEB9C' },
        };
        filaAmarilla.getCell(stats.colPorcentaje).alignment = { horizontal: 'center', vertical: 'middle' };

        // Fila verde
        filaVerde.getCell(stats.colValor).value = 'Ejecución alta';
        filaVerde.getCell(stats.colValor).alignment = { horizontal: 'right', vertical: 'middle' };
        filaVerde.getCell(stats.colPorcentaje).value = `${stats.porcentajeVerde}%`;
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
        saveAs(blob, `${t('InfIndicadoresImpacto')}_${anioSeleccionado}.xlsx`);
    }
};

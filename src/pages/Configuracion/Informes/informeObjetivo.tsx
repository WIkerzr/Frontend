import saveAs from 'file-saver';
import { TFunction } from 'i18next';
import ExcelJS from 'exceljs';
import { IndicadorRealizacionAccionDTO, IndicadorResultadoAccionDTO } from '../../../types/TipadoAccion';
import { TiposDeIndicadores } from '../../../types/Indicadores';
import { ConvertirIndicadoresServicioAAccionDTO, MemorizarResultadoFuncion } from '../../../components/Utils/utils';
import { IndicadoresServiciosDTO } from '../../../types/GeneralTypes';

export type ListadoNombresIdicadoresItem = { id: number; nombre: string; idsResultados?: number[] | undefined };

interface ColumnasAccionDTO {
    Nombre: string;
    Ejecutado_Hombre: string;
    Ejecutado_Mujer: string;
    Ejecutado_Total: string;
    MetaAnual_Hombre: string;
    MetaAnual_Mujer: string;
    MetaAnual_Total: string;
    GradoEjecuciónHombre: string;
    GradoEjecuciónMujer: string;
    GradoEjecuciónTotal: string;
}
const CreacionDatosIndicador = (
    indicador: IndicadorRealizacionAccionDTO[] | IndicadorResultadoAccionDTO[],
    tipo: TiposDeIndicadores,
    listadoNombres: ListadoNombresIdicadoresItem[]
): ColumnasAccionDTO[] => {
    const filasIndicador: ColumnasAccionDTO[] = [];
    indicador = ProcesarIndicadores(indicador);

    for (const r of indicador) {
        let nombre = '';
        if (tipo === 'realizacion') {
            const realizacion = r as IndicadorRealizacionAccionDTO;
            if (realizacion.IndicadorRealizacionId === 10) {
                console.log(r.NameEs);
            }
            nombre = listadoNombres.find((re) => re.id === realizacion.IndicadorRealizacionId)?.nombre ?? `id-${realizacion.IndicadorRealizacionId}`;
        } else if (tipo === 'resultado') {
            const resultado = r as IndicadorResultadoAccionDTO;
            if (resultado.IndicadorResultadoId === 11) {
                console.log(r.NameEs);
            }
            nombre = listadoNombres.find((re) => re.id === resultado.IndicadorResultadoId)?.nombre ?? `id-${resultado.IndicadorResultadoId}`;
        }

        const indexExiste = filasIndicador.findIndex((f) => f.Nombre === nombre);
        if (indexExiste === -1) {
            filasIndicador.push({
                Nombre: nombre,
                Ejecutado_Hombre: r.Ejecutado_Hombre ?? '',
                Ejecutado_Mujer: r.Ejecutado_Mujer ?? '',
                Ejecutado_Total: r.Ejecutado_Total ?? '',
                MetaAnual_Hombre: r.MetaAnual_Hombre ?? '',
                MetaAnual_Mujer: r.MetaAnual_Mujer ?? '',
                MetaAnual_Total: r.MetaAnual_Total ?? '',
                GradoEjecuciónHombre: '',
                GradoEjecuciónMujer: '',
                GradoEjecuciónTotal: '',
            });
        } else {
            const fila = filasIndicador[indexExiste];
            const Ejecutado_Hombre = Number(fila.Ejecutado_Hombre) + Number(r.Ejecutado_Hombre);
            const Ejecutado_Mujer = Number(fila.Ejecutado_Mujer) + Number(r.Ejecutado_Mujer);
            const Ejecutado_Total = Number(fila.Ejecutado_Total) + Number(r.Ejecutado_Total);
            const MetaAnual_Hombre = Number(fila.MetaAnual_Hombre) + Number(r.MetaAnual_Hombre);
            const MetaAnual_Mujer = Number(fila.MetaAnual_Mujer) + Number(r.MetaAnual_Mujer);
            const MetaAnual_Total = Number(fila.MetaAnual_Total) + Number(r.MetaAnual_Total);

            fila.Ejecutado_Hombre = `${Ejecutado_Hombre}`;
            fila.Ejecutado_Mujer = `${Ejecutado_Mujer}`;
            fila.Ejecutado_Total = `${Ejecutado_Total}`;
            fila.MetaAnual_Hombre = `${MetaAnual_Hombre}`;
            fila.MetaAnual_Mujer = `${MetaAnual_Mujer}`;
            fila.MetaAnual_Total = `${MetaAnual_Total}`;
        }
    }
    return filasIndicador;
};
interface GenerarInformeObjetivosProps {
    realizacion: IndicadorRealizacionAccionDTO[];
    resultado: IndicadorResultadoAccionDTO[];
    servicios: IndicadoresServiciosDTO[];
    // eslint-disable-next-line no-unused-vars
    ListadoNombresIdicadoresSegunADR: (tipoIndicador: TiposDeIndicadores) => ListadoNombresIdicadoresItem[];
    t: TFunction<'translation'>;
    // resultados: IndicadorResultadoAccionDTO[];
}
function calcularPorcentaje(ejecutado?: string, meta?: string): number {
    if (isNaN(Number(ejecutado)) || isNaN(Number(meta)) || Number(meta) === 0) return 0;
    return Math.round((Number(ejecutado) / Number(meta)) * 100);
}

export const GenerarInformeObjetivos = async ({ realizacion, resultado, servicios, ListadoNombresIdicadoresSegunADR, t }: GenerarInformeObjetivosProps): Promise<void> => {
    const ListadoCached = MemorizarResultadoFuncion(async (tipo: TiposDeIndicadores) => Promise.resolve(ListadoNombresIdicadoresSegunADR(tipo)));
    const nombresRealizacion: ListadoNombresIdicadoresItem[] = await ListadoCached('realizacion');
    const nombresResultado: ListadoNombresIdicadoresItem[] = await ListadoCached('resultado');

    const serviciosConvertidos = ConvertirIndicadoresServicioAAccionDTO(servicios, nombresRealizacion, nombresResultado);
    realizacion.push(...serviciosConvertidos.indicadoreRealizacion);
    resultado.push(...serviciosConvertidos.indicadoreResultado);

    const filasIndicadorRealizacion: ColumnasAccionDTO[] = CreacionDatosIndicador(realizacion, 'realizacion', nombresRealizacion);
    const filasIndicadorResultado: ColumnasAccionDTO[] = CreacionDatosIndicador(resultado, 'resultado', nombresResultado);

    //crear workbook
    const workbook = new ExcelJS.Workbook();
    const sheet = workbook.addWorksheet('Informe Objetivos');

    const Columnas = [
        { header: 'Nombre del indicador', key: 'Nombre_del_indicador', width: 40 },
        { header: 'Ejecutado Hombre', key: 'Ejecutado_Hombre', width: 12 },
        { header: 'Ejecutado Mujer', key: 'Ejecutado_Mujer', width: 12 },
        { header: 'Ejecutado Total', key: 'Ejecutado_Total', width: 12 },
        { header: 'MetaAnual Hombre', key: 'MetaAnual_Hombre', width: 12 },
        { header: 'MetaAnual Mujer', key: 'MetaAnual_Mujer', width: 12 },
        { header: 'MetaAnual Total', key: 'MetaAnual_Total', width: 12 },
        { header: 'Grado de ejecución Hombre', key: 'Grado_de_ejecución_Hombre', width: 12 },
        { header: 'Grado de ejecución Mujer', key: 'Grado_de_ejecución_Mujer', width: 12 },
        { header: 'Grado de ejecución total', key: 'Grado_de_ejecución_Total', width: 12 },
    ];

    sheet.columns = Columnas.map((col) => ({
        ...col,
        style: { alignment: { wrapText: false } },
    }));
    sheet.spliceRows(1, 1);

    function genFilasIndicadores(indicadores: ColumnasAccionDTO[], titulo: string) {
        const filaTitulo = sheet.addRow([titulo]);
        sheet.mergeCells(`A${filaTitulo.number}:J${filaTitulo.number}`);
        const celda = filaTitulo.getCell(1);
        celda.alignment = { horizontal: 'center', vertical: 'middle' };
        celda.font = { bold: true, size: 14 };

        const filaEncabezado = sheet.addRow(Columnas.map((col) => col.header));

        filaEncabezado.eachCell((cell) => {
            cell.font = { bold: true };
            cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };
        });
        indicadores.forEach((re) => {
            const fila = sheet.addRow({
                Nombre_del_indicador: re.Nombre,
                Ejecutado_Hombre: re.Ejecutado_Hombre,
                Ejecutado_Mujer: re.Ejecutado_Mujer,
                Ejecutado_Total: re.Ejecutado_Total,
                MetaAnual_Hombre: re.MetaAnual_Hombre,
                MetaAnual_Mujer: re.MetaAnual_Mujer,
                MetaAnual_Total: re.MetaAnual_Total,
                Grado_de_ejecución_Hombre: `${calcularPorcentaje(re.Ejecutado_Hombre, re.MetaAnual_Hombre)}%`,
                Grado_de_ejecución_Mujer: `${calcularPorcentaje(re.Ejecutado_Mujer, re.MetaAnual_Mujer)}%`,
                Grado_de_ejecución_Total: `${calcularPorcentaje(re.Ejecutado_Total, re.MetaAnual_Total)}%`,
            });

            fila.eachCell((cell, index) => {
                cell.alignment = {
                    ...cell.alignment,
                    horizontal: index === 1 ? 'left' : 'center',
                    vertical: index === 1 ? 'top' : 'middle',
                    wrapText: true,
                };
            });
            const columnasGrado = ['Grado_de_ejecución_Hombre', 'Grado_de_ejecución_Mujer', 'Grado_de_ejecución_Total'];

            columnasGrado.forEach((colKey) => {
                const cell = fila.getCell(colKey);
                const valor = Number(String(cell.value).replace('%', ''));

                cell.alignment = { horizontal: 'center', vertical: 'middle', wrapText: true };

                if (valor > 0 && valor < 50) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFC7CE' },
                    };
                } else if (valor > 0 && valor < 80) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFFFEB9C' },
                    };
                } else if (valor >= 80) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFC6EFCE' },
                    };
                }
            });
        });
    }

    genFilasIndicadores(filasIndicadorRealizacion, t('indicadoresDeRealizacion'));
    sheet.addRow([]);
    sheet.addRow([]);
    genFilasIndicadores(filasIndicadorResultado, t('indicadoresDeResultado'));

    const buffer = await workbook.xlsx.writeBuffer();
    const blob = new Blob([buffer], {
        type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    });
    saveAs(blob, `${t('InfObjetivos')}${new Date().toISOString()}.xlsx`);
};

function ProcesarIndicadores(indicador: IndicadorRealizacionAccionDTO[] | IndicadorResultadoAccionDTO[]) {
    if (indicador.length > 0 && 'IndicadorRealizacionId' in indicador[0]) {
        return indicador as IndicadorRealizacionAccionDTO[];
    } else {
        return indicador as IndicadorResultadoAccionDTO[];
    }
}

import { AlignmentType, Document, Packer, Paragraph, Table, TableCell, TableRow, TextRun, VerticalAlign, WidthType } from 'docx';
import { saveAs } from 'file-saver';
import React from 'react';
import { OperationalIndicators, Plan, YearData } from '../../types/tipadoPlan';
import { useYear } from '../../contexts/DatosAnualContext';
import { IndicadoresServicios, Servicios } from '../../types/GeneralTypes';
import { DatosAccion } from '../../types/TipadoAccion';

export const generarDocumentoWord = (datos: YearData, pantalla: 'Plan' | 'Memoria') => {
    const sizeTitulo = 32;
    const sizeSubTitulo = 16;
    const sizeTexto = 11;
    //1
    const introduccion = () => [
        new Paragraph({
            children: [new TextRun({ text: 'Introducción', bold: true, size: 32 })],
        }),
        new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({ text: datos.plan.introduccion, size: 11 })],
        }),
    ];

    //Pantalla 2
    //Memoria 3
    const funcionamientoGeneral = (indicadores: OperationalIndicators[]) => {
        const rows: TableRow[] = [];
        rows.push(
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 60, type: WidthType.PERCENTAGE },
                        children: [new Paragraph({ text: 'Indicadores Operativos' })],
                    }),
                    new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        children: [new Paragraph({ text: 'Valor previsto' })],
                    }),
                    ...(pantalla === 'Memoria'
                        ? [
                              new TableCell({
                                  width: { size: 20, type: WidthType.PERCENTAGE },
                                  children: [new Paragraph({ text: 'Valor alcanzado' })],
                              }),
                          ]
                        : []),
                ],
            })
        );

        indicadores.forEach((indicador) => {
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            width: { size: 60, type: WidthType.PERCENTAGE },
                            children: [new Paragraph(indicador.nameEs)],
                        }),
                        new TableCell({
                            width: { size: 20, type: WidthType.PERCENTAGE },
                            children: [new Paragraph(indicador.value)],
                        }),
                        ...(pantalla === 'Memoria'
                            ? [
                                  new TableCell({
                                      width: { size: 20, type: WidthType.PERCENTAGE },
                                      children: [new Paragraph(indicador.valueAchieved)],
                                  }),
                              ]
                            : []),
                    ],
                })
            );
        });

        return [
            new Paragraph({
                spacing: { before: 200 },
                children: [new TextRun({ text: 'FUNCIONAMIENTO GENERAL DE LA ADR', bold: true, size: 20 })],
            }),
            new Paragraph({
                spacing: { before: 200 },
                children: [new TextRun({ text: 'TAREAS INTERNAS DE GESTIÓN DE LA ADR', bold: true, size: 11 })],
            }),
            new Paragraph({
                spacing: { before: 200 },
                children: [new TextRun({ text: datos.plan.generalOperationADR.adrInternalTasks, size: 11 })],
            }),
            new Paragraph({
                spacing: { before: 300, after: 100 },
                children: [new TextRun({ text: 'INDICADORES OPERATIVOS', bold: true, size: 20 })],
            }),
            new Table({
                rows,
                width: {
                    size: 100,
                    type: WidthType.PERCENTAGE,
                },
            }),
            ...(pantalla === 'Memoria'
                ? [
                      new Paragraph({
                          spacing: { before: 50 },
                          children: [new TextRun({ text: `Detalles de seguimiento: ${datos.memoria.dSeguimiento}`, size: sizeTexto })],
                      }),
                      new Paragraph({
                          spacing: { before: 50 },
                          children: [new TextRun({ text: `Valoración final y recomendaciones: ${datos.memoria.valFinal}`, size: sizeTexto })],
                      }),
                  ]
                : []),
        ];
    };

    //Pantalla 3
    //Memoria 4
    const crearTablaIndicadores = (titulo: string, indicadores: IndicadoresServicios[]) => {
        const rows: TableRow[] = [];

        rows.push(
            new TableRow({
                children: [
                    new TableCell({
                        columnSpan: 2,
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: titulo, bold: true })],
                            }),
                        ],
                        shading: {
                            fill: 'ccffcc',
                        },
                    }),
                ],
            })
        );

        rows.push(
            new TableRow({
                children: [
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: 'Indicador', bold: true })],
                            }),
                        ],
                        shading: {
                            fill: '006600',
                        },
                    }),
                    new TableCell({
                        children: [
                            new Paragraph({
                                children: [new TextRun({ text: 'Valor previsto', bold: true })],
                            }),
                        ],
                        shading: {
                            fill: '006600',
                        },
                    }),
                ],
            })
        );

        // Filas con datos
        indicadores.forEach((ind) => {
            rows.push(
                new TableRow({
                    children: [
                        new TableCell({
                            children: [new Paragraph(ind.indicador)],
                        }),
                        new TableCell({
                            children: [new Paragraph(ind.previsto.valor)],
                        }),
                    ],
                })
            );
        });

        return new Table({
            width: { size: 100, type: WidthType.PERCENTAGE },
            rows,
        });
    };

    //Pantalla 3
    //Memoria 4
    const crearBloqueServicio = (servicio: Servicios, index: number) => {
        const tituloServicio = `S. ${index + 1}.- ${servicio.nombre}`;

        return [
            new Paragraph({
                text: 'SERVICIO',
                shading: { fill: 'ccffcc' },
                alignment: AlignmentType.LEFT,
                spacing: { after: 100 },
            }),
            new Paragraph({
                children: [new TextRun({ text: tituloServicio, bold: true })],
                shading: { fill: '006600' },
            }),
            new Paragraph({
                text: 'DESCRIPCIÓN',
                shading: { fill: 'ccffcc' },
                spacing: { before: 200 },
            }),
            new Paragraph({
                text: servicio.descripcion || '-',
            }),
            crearTablaIndicadores('INDICADORES de realización', servicio.indicadores),
            //crearTablaIndicadores("INDICADORES de resultado", servicio.indicadores),
            ...(pantalla === 'Memoria'
                ? [
                      new Paragraph({
                          spacing: { before: 50 },
                          children: [new TextRun({ text: `Detalles de seguimiento: ${servicio.dSeguimiento}`, size: sizeTexto })],
                      }),
                      new Paragraph({
                          spacing: { before: 50 },
                          children: [new TextRun({ text: `Valoración final y recomendaciones: ${servicio.valFinal}`, size: sizeTexto })],
                      }),
                  ]
                : []),
        ];
    };

    //Pantalla 4
    //Memoria 5
    const plan = (plan: Plan) => [
        new Paragraph({
            spacing: { before: 400 },
            children: [new TextRun({ text: 'PLAN DE GESTIÓN ANUAL DEL PCDR: PRIORIZACIÓN DE EJES Y ACCIONES ASOCIADAS', bold: true, size: sizeTitulo })],
        }),
        new Paragraph({
            children: [new TextRun({ text: 'PROCESO', size: sizeSubTitulo })],
        }),
        new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({ text: plan.proceso, size: sizeTexto })],
        }),
        new Paragraph({
            spacing: { before: 400 },
            children: [new TextRun({ text: 'EJES PRIORITARIOS', size: sizeSubTitulo })],
        }),
        new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({ text: plan.ejesPrioritarios[0].nameEs, size: sizeTexto })],
        }),
        new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({ text: plan.ejesPrioritarios[1].nameEs, size: sizeTexto })],
        }),
        new Paragraph({
            spacing: { before: 200 },
            children: [new TextRun({ text: plan.ejesPrioritarios[2].nameEs, size: sizeTexto })],
        }),
        new Paragraph({
            spacing: { before: 400 },
            children: [new TextRun({ text: 'RESUMEN Y ENCAJE DE LAS ACCIONES EN EL PCDR', size: sizeSubTitulo })],
        }),
        //TODO RESUMEN Y ENCAJE DE LAS ACCIONES EN EL PCDR
        new Paragraph({
            spacing: { before: 400 },
            children: [new TextRun({ text: 'DESCRIPCIÓN DE LAS ACCIONES PREVISTAS PARA LA ANUALIDAD', size: sizeSubTitulo })],
        }),
    ];

    let contadorAccion = 0;
    const indicador = (accion: DatosAccion) => {
        contadorAccion++;
        const presupuestoEjecutado: TableRow[] = [];
        presupuestoEjecutado.push(
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 20, type: WidthType.PERCENTAGE },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: 'CUANTÍA', size: sizeTexto })],
                            }),
                        ],
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: { size: 40, type: WidthType.PERCENTAGE },
                        columnSpan: 3,
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: 'FUENTE DE FINANCIACIÓN', size: sizeTexto })],
                            }),
                        ],
                    }),
                    new TableCell({
                        width: { size: 40, type: WidthType.PERCENTAGE },
                        columnSpan: 3,
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: 'OBSERVACIONES', size: sizeTexto })],
                            }),
                        ],
                    }),
                ],
            })
        );
        // presupuestoEjecutado.push(
        //     new TableRow({
        //         children: [
        //             new TableCell({
        //                 width: { size: 20, type: WidthType.PERCENTAGE },
        //                 children: [
        //                     new Paragraph({
        //                         alignment: AlignmentType.CENTER,
        //                         children: [new TextRun({ text: datos., size: sizeTexto })],
        //                     }),
        //                 ],
        //             }),
        //             new TableCell({
        //                 verticalAlign: VerticalAlign.CENTER,
        //                 width: { size: 40, type: WidthType.PERCENTAGE },
        //                 columnSpan: 3,
        //                 children: [
        //                     new Paragraph({
        //                         alignment: AlignmentType.CENTER,
        //                         children: [new TextRun({ text: 'FUENTE DE FINANCIACIÓN', size: sizeTexto })],
        //                     }),
        //                 ],
        //             }),
        //             new TableCell({
        //                 width: { size: 40, type: WidthType.PERCENTAGE },
        //                 columnSpan: 3,
        //                 children: [
        //                     new Paragraph({
        //                         alignment: AlignmentType.CENTER,
        //                         children: [new TextRun({ text: 'OBSERVACIONES', size: sizeTexto })],
        //                     }),
        //                 ],
        //             }),
        //         ],
        //     })
        // );
        const indicadores: TableRow[] = [];

        indicadores.push(
            new TableRow({
                children: [
                    new TableCell({
                        width: { size: 40, type: WidthType.PERCENTAGE },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: '', size: sizeTexto })],
                            }),
                        ],
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: { size: 15, type: WidthType.PERCENTAGE },
                        columnSpan: 3,
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: 'Meta Anual', size: sizeTexto })],
                            }),
                        ],
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: { size: 15, type: WidthType.PERCENTAGE },
                        columnSpan: 3,
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: 'Ejecutado', size: sizeTexto })],
                            }),
                        ],
                    }),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: { size: 15, type: WidthType.PERCENTAGE },
                        columnSpan: 3,
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: 'Meta Final', size: sizeTexto })],
                            }),
                        ],
                    }),
                    new TableCell({
                        width: { size: 15, type: WidthType.PERCENTAGE },
                        columnSpan: 3,
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: '', size: sizeTexto })],
                            }),
                        ],
                    }),
                ],
            })
        );
        indicadores.push(
            new TableRow({
                children: [
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: { size: 40, type: WidthType.PERCENTAGE },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: 'Nombre', bold: true, size: sizeTexto })],
                            }),
                        ],
                    }),
                    ...['Hbr.', 'Muj.', 'Tot.', 'Hbr.', 'Muj.', 'Tot.', 'Hbr.', 'Muj.', 'Tot.'].map(
                        (valor) =>
                            new TableCell({
                                verticalAlign: VerticalAlign.CENTER,
                                width: { size: 5, type: WidthType.PERCENTAGE },
                                children: [
                                    new Paragraph({
                                        alignment: AlignmentType.CENTER,
                                        children: [new TextRun({ text: `${valor ?? ''}`, size: sizeTexto })],
                                    }),
                                ],
                            })
                    ),
                    new TableCell({
                        verticalAlign: VerticalAlign.CENTER,
                        width: { size: 15, type: WidthType.PERCENTAGE },
                        children: [
                            new Paragraph({
                                alignment: AlignmentType.CENTER,
                                children: [new TextRun({ text: 'Hipótesis', bold: true, size: sizeTexto })],
                            }),
                        ],
                    }),
                ],
            })
        );
        for (let index = 0; index < accion.indicadorAccion!.indicadoreRealizacion.length; index++) {
            const indicador = accion.indicadorAccion?.indicadoreRealizacion[index];
            if (!indicador) {
                continue;
            }
            indicadores.push(
                new TableRow({
                    children: [
                        new TableCell({
                            width: { size: 40, type: WidthType.PERCENTAGE },
                            verticalAlign: VerticalAlign.CENTER,
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: indicador.descripcion,
                                            size: sizeTexto,
                                        }),
                                    ],
                                }),
                            ],
                        }),

                        ...[
                            indicador.metaAnual?.hombres,
                            indicador.metaAnual?.mujeres,
                            indicador.metaAnual?.total,
                            indicador.ejecutado?.hombres,
                            indicador.ejecutado?.mujeres,
                            indicador.ejecutado?.total,
                            indicador.metaFinal?.hombres,
                            indicador.metaFinal?.mujeres,
                            indicador.metaFinal?.total,
                        ].map(
                            (valor) =>
                                new TableCell({
                                    width: { size: 5, type: WidthType.PERCENTAGE },
                                    verticalAlign: VerticalAlign.CENTER,
                                    children: [
                                        new Paragraph({
                                            alignment: AlignmentType.CENTER,
                                            children: [new TextRun({ text: `${valor ?? ''}`, size: sizeTexto })],
                                        }),
                                    ],
                                })
                        ),

                        new TableCell({
                            width: { size: 15, type: WidthType.PERCENTAGE },
                            verticalAlign: VerticalAlign.CENTER,
                            children: [
                                new Paragraph({
                                    alignment: AlignmentType.CENTER,
                                    children: [
                                        new TextRun({
                                            text: indicador.hipotesis ?? '',
                                            size: sizeTexto,
                                        }),
                                    ],
                                }),
                            ],
                        }),
                    ],
                })
            );
        }
        return [
            // new Paragraph({
            //     spacing: { before: 400 },
            //     children: [new TextRun({ text: 'PLAN DE GESTIÓN ANUAL DEL PCDR: PRIORIZACIÓN DE EJES Y ACCIONES ASOCIADAS', bold: true, size: sizeSubTitulo })],
            // }),
            new Paragraph({
                spacing: { before: 200 },
                children: [new TextRun({ text: `ACCIÓN ${contadorAccion}: ${accion.accion}`, size: sizeSubTitulo })],
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Eje: ${accion.ejeEs}`, size: sizeTexto })],
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Línea de actuación: ${accion.lineaActuaccion}`, size: sizeTexto })],
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Entidad ejecutora: ${accion.datosPlan?.ejecutora}`, size: sizeTexto })],
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Entidades implicadas: ${accion.datosPlan?.implicadas}`, size: sizeTexto })],
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Tratamiento territorial comarcal: ${accion.datosPlan?.comarcal}`, size: sizeTexto })],
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Tratamiento territorial supracomarcal: ${accion.datosPlan?.supracomarcal}`, size: sizeTexto })],
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Plurianualidad: ${accion.plurianual ? 'Si' : 'No'}`, size: sizeTexto })],
            }),
            ...(pantalla === 'Memoria'
                ? [
                      new Paragraph({
                          spacing: { before: 50 },
                          children: [new TextRun({ text: `Situación de la acción: ${accion.datosMemoria?.sActual}`, size: sizeTexto })],
                      }),
                  ]
                : []),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Objetivos de la acción: ${accion.datosPlan?.oAccion}`, size: sizeTexto })],
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Descripción de la acción: ${accion.datosPlan?.dAccion}`, size: sizeTexto })],
            }),
            ...(pantalla === 'Memoria'
                ? [
                      new Paragraph({
                          spacing: { before: 50 },
                          children: [new TextRun({ text: `Descripción de los avances: ${accion.datosMemoria?.dAccionAvances}`, size: sizeTexto })],
                      }),
                  ]
                : []),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Integración de los principios transversales: ${accion.datosPlan?.iMujHom}`, size: sizeTexto })],
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Euskera: ${accion.datosPlan?.uEuskera}`, size: sizeTexto })],
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Sostenibilidad: ${accion.datosPlan?.sostenibilidad}`, size: sizeTexto })],
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Transformación digital y desarrollo de territorios inteligentes: ${accion.datosPlan?.dInteligent}`, size: sizeTexto })],
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Objetivos de Desarrollo Sostenible (ODS) a los que contribuye: ${accion.datosPlan?.ods}`, size: sizeTexto })],
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Presupuesto: ${accion.datosPlan?.presupuesto}`, size: sizeTexto })],
            }),

            new Table({
                width: { size: 100, type: WidthType.PERCENTAGE },
                rows: indicadores,
            }),
            new Paragraph({
                spacing: { before: 50 },
                children: [new TextRun({ text: `Observaciones: ${accion.datosPlan?.observaciones}`, size: sizeTexto })],
            }),
            ...(pantalla === 'Memoria'
                ? [
                      new Paragraph({
                          spacing: { before: 50 },
                          children: [new TextRun({ text: `Detalles de seguimiento: ${accion.datosMemoria?.dSeguimiento}`, size: sizeTexto })],
                      }),
                      new Paragraph({
                          spacing: { before: 50 },
                          children: [new TextRun({ text: `Valoración final y recomendaciones: ${accion.datosMemoria?.valFinal}`, size: sizeTexto })],
                      }),
                  ]
                : []),
        ];
    };

    const contenido = [
        ...introduccion(),
        ...funcionamientoGeneral(datos.plan.generalOperationADR.operationalIndicators),
        ...crearBloqueServicio(datos.servicios![0], 0),
        ...plan(datos.plan),
        ...datos.plan.ejesPrioritarios.flatMap((eje) => eje.acciones.map((accion) => indicador(accion))).flat(),
    ];

    const doc = new Document({
        sections: [{ properties: {}, children: contenido }],
    });

    Packer.toBlob(doc).then((blob) => {
        saveAs(blob, 'documento.docx');
    });
};

const ExportarWordBtn: React.FC = () => {
    const { yearData } = useYear();

    const handleExportar = () => {
        generarDocumentoWord(yearData, 'Plan');
    };

    return (
        <button onClick={handleExportar} className="bg-blue-500 text-white px-4 py-2 rounded">
            Exportar a Word
        </button>
    );
};

export default ExportarWordBtn;

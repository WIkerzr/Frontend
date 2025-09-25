/* eslint-disable no-unused-vars */
import { Ejes, OperationalIndicators, YearData } from '../../types/tipadoPlan';
import { IndicadoresServicios, Servicios } from '../../types/GeneralTypes';
import { DatosAccion, EjecucionPresupuestaria, PresupuestoEjecutado } from '../../types/TipadoAccion';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { HMT, IndicadorRealizacionAccion, IndicadorResultadoAccion } from '../../types/Indicadores';
import IconDownloand from '../../components/Icon/IconDownloand.svg';

const formatHMT = (dato: HMT | undefined) => {
    if (dato === undefined) {
        return '';
    }
    let texto = '';
    if (dato.hombres != '0' && dato.hombres !== '') {
        texto += `H: ${dato.hombres}`;
    }
    if (dato.mujeres != '0' && dato.mujeres !== '') {
        texto += `M: ${dato.mujeres}`;
    }
    dato.total = dato.total === '' ? '' : Number(dato.total).toLocaleString();
    texto += ` T: ${dato.total}`;
    return texto;
};

export const GeneracionDelDocumentoWordPlan = async (datos: YearData, language: string, t: (key: string) => string) => {
    try {
        // 1. Cargar la plantilla desde /public
        const response = await fetch(language === 'es' ? '/plantillaPlanEs.docx' : language === 'eu' ? '/plantillaPlanEu.docx' : '/plantillaPlanEs.docx');
        const arrayBuffer = await response.arrayBuffer();

        // 2. Cargar en PizZip
        const zip = new PizZip(arrayBuffer);

        // 3. Crear instancia de docxtemplater
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Funcion para generar las acciones
        const Acciones = (ejes: Ejes[]) => {
            return ejes?.flatMap((item: Ejes) =>
                item.acciones.map((accion: DatosAccion) => ({
                    accion: `${contAccion++}: ${accion.accion}`,
                    eje: item.NameEs,
                    lineaActuaccion: accion.lineaActuaccion,
                    ejecutora: accion.datosPlan?.ejecutora,
                    implicadas: accion.datosPlan?.implicadas,
                    comarcal: accion.datosPlan?.comarcal,
                    supracomarcal: accion.datosPlan?.supracomarcal ? accion.datosPlan?.supracomarcal : `${t('sinTratamientoTerritorialSupracomarcal')}`,
                    plurianual: accion.plurianual ? 'Si' : 'No',
                    oAccion: accion.datosPlan?.oAccion,
                    dAccion: accion.datosPlan?.dAccion,
                    iMujHom: accion.datosPlan?.iMujHom,
                    uEuskera: accion.datosPlan?.uEuskera,
                    sostenibilidad: accion.datosPlan?.sostenibilidad,
                    dInteligent: accion.datosPlan?.dInteligent,
                    ods: accion.datosPlan?.ods,
                    presupuesto: accion.datosPlan?.presupuesto,
                    indicadoresRealizacion: accion.indicadorAccion?.indicadoreRealizacion.map((iR: IndicadorRealizacionAccion) => ({
                        nombre: iR.descripcion,
                        unitMed: 'unitMed', //TODO
                        metaAnual: formatHMT(iR.metaAnual),
                        metaFinal: formatHMT(iR.metaFinal),
                        anualidadMetaFinal: '', //TODO
                    })),
                    indicadoresResultado: accion.indicadorAccion?.indicadoreResultado.map((iR: IndicadorResultadoAccion) => ({
                        nombre: iR.descripcion,
                        unitMed: 'unitMed', //TODO
                        metaAnual: formatHMT(iR.metaAnual),
                        metaFinal: formatHMT(iR.metaFinal),
                        anualidadMetaFinal: '', //TODO
                    })),
                    observaciones: accion.datosPlan?.observaciones,
                }))
            );
        };

        const accionesYProyectos: Ejes[] = (datos.plan.ejesRestantes ?? []).filter((eje: Ejes) => eje.IsAccessory);
        const accionesPrioritarias: Ejes[] = datos.plan.ejesPrioritarios;

        // Funcion Hipotesis
        //TODO Verificar Funcion Hipotesis

        const hipotesis = () => {
            const indicadoresRA: {
                nombre: string;
                hipo: string;
            }[] = [];
            const indicadoresRS: {
                nombre: string;
                hipo: string;
            }[] = [];

            for (let ejes = 0; ejes < 2; ejes++) {
                const ejeRaiz = ejes === 0 ? accionesYProyectos : accionesPrioritarias;
                for (let index = 0; index < ejeRaiz.length; index++) {
                    const eje = ejeRaiz[index];
                    for (let index2 = 0; index2 < eje.acciones.length; index2++) {
                        const accion = eje.acciones[index2];
                        if (!accion.indicadorAccion) {
                            continue;
                        }
                        for (let index3 = 0; index3 < accion.indicadorAccion?.indicadoreRealizacion.length; index3++) {
                            const indicadorRA = accion.indicadorAccion?.indicadoreRealizacion[index3];
                            if (!indicadorRA.hipotesis) {
                                continue;
                            }
                            indicadoresRA.push({
                                nombre: indicadorRA.descripcion,
                                hipo: indicadorRA.hipotesis,
                            });
                        }
                        for (let index3 = 0; index3 < accion.indicadorAccion?.indicadoreResultado.length; index3++) {
                            const indicadorRS = accion.indicadorAccion?.indicadoreResultado[index3];
                            if (!indicadorRS.hipotesis) {
                                continue;
                            }
                            indicadoresRS.push({
                                nombre: indicadorRS.descripcion,
                                hipo: indicadorRS.hipotesis,
                            });
                        }
                    }
                }
            }
            return [indicadoresRA, indicadoresRS];
        };
        const [hipotesisRA, hipotesisRS] = hipotesis();

        // 4. Datos a sustituir
        let contAccion = 1;
        const data = {
            nComarca: datos.nombreRegion,
            anioComarca: datos.year,
            //2.
            tareasInternasGestion: datos.plan.generalOperationADR.adrInternalTasks,
            indicadoresOperativos: datos.plan.generalOperationADR.operationalIndicators.map((item: OperationalIndicators) => ({
                nombre: item.nameEs,
                value: item.value,
            })),
            //3.
            fichasServicio: datos.servicios?.map((item: Servicios, index) => ({
                nombre: `S. ${index + 1}.- ${item.nombre}`,
                descripcion: item.descripcion,
                indicadoresRealizacion: item.indicadores.map((iR: IndicadoresServicios) => ({
                    indicador: iR.indicador,
                    previsto: iR.previsto.valor,
                })),
            })),
            //4.1
            proceso: datos.plan.proceso,
            //4.2
            eje1: accionesPrioritarias[0]?.NameEs,
            eje2: accionesPrioritarias[1] ? accionesPrioritarias[1].NameEs : '',
            eje3: accionesPrioritarias[2] ? accionesPrioritarias[2].NameEs : '',
            //4.3
            acciones: accionesPrioritarias?.flatMap((item: Ejes) =>
                item.acciones.map((accion: DatosAccion) => ({
                    nombreEje: item.NameEs,
                    lineaActuaccion: accion.lineaActuaccion,
                    accion: accion.accion,
                }))
            ),
            //4.4
            resumenAccion: Acciones(accionesPrioritarias),
            //5.
            resumenAccionYProyectos: Acciones(accionesYProyectos),
            //6.1
            iRAAnexo1: hipotesisRA.length > 0 ? hipotesisRA : [{ nombre: '', hipo: '' }],
            iRSAnexo1: hipotesisRS.length > 0 ? hipotesisRS : [{ nombre: '', hipo: '' }],
        };

        // 5. Renderizar documento con datos
        doc.render(data);

        // 6. Generar blob final
        const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        // 7. Descargar
        const url = URL.createObjectURL(out);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultado.docx';
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generando el Word', error);
    }
};

export const GeneracionDelDocumentoWordMemoria = async (datos: YearData, language: string, t: (key: string) => string) => {
    try {
        // 1. Cargar la plantilla desde /public
        const response = await fetch(language === 'es' ? '/plantillaMemoriaEs.docx' : language === 'eu' ? '/plantillaMemoriaEu.docx' : '/plantillaMemoriaEs.docx');
        const arrayBuffer = await response.arrayBuffer();

        // 2. Cargar en PizZip
        const zip = new PizZip(arrayBuffer);

        // 3. Crear instancia de docxtemplater
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        const accionesPrioritarias: Ejes[] = datos.plan.ejesPrioritarios;
        const accionesYProyectos: Ejes[] = (datos.plan.ejesRestantes ?? []).filter((eje: Ejes) => eje.IsAccessory);

        const Presupuestos = () => {
            return 'ssssssssssssssssssssssssssssssssssssssssssssssssssss';
        };
        const presupuestosPresupuestarias: EjecucionPresupuestaria[] = [];
        const presupuestosEjecutados: PresupuestoEjecutado[] = [];
        const datosPlan = accionesPrioritarias.map((item: Ejes) => item.acciones.map((accion: DatosAccion) => accion.datosMemoria));
        for (let index = 0; index < datosPlan.length; index++) {
            const accion = datosPlan[index];
            for (let index2 = 0; index2 < accion.length; index2++) {
                const planAccion = accion[index];
                const presupuesto = planAccion?.presupuestoEjecutado;
                const presupuestoPresu = planAccion?.ejecucionPresupuestaria;
                if (!presupuestoPresu) continue;
                presupuestosPresupuestarias.push(presupuestoPresu);
                if (!presupuesto) continue;
                presupuestosEjecutados.push(presupuesto);
            }
        }
        console.log(presupuestosPresupuestarias);
        console.log(presupuestosEjecutados);

        // Funcion para generar las acciones
        const Acciones = (ejes: Ejes[]) => {
            return ejes?.flatMap((item: Ejes) =>
                item.acciones.map((accion: DatosAccion) => ({
                    accion: `${contAccion++}: ${accion.accion}`,
                    eje: item.NameEs,
                    lineaActuaccion: accion.lineaActuaccion,
                    ejecutora: accion.datosPlan?.ejecutora,
                    implicadas: accion.datosPlan?.implicadas,
                    comarcal: accion.datosPlan?.comarcal,
                    supracomarcal: accion.datosPlan?.supracomarcal ? accion.datosPlan?.supracomarcal : `${t('sinTratamientoTerritorialSupracomarcal')}`,
                    plurianual: accion.plurianual ? 'Si' : 'No',
                    situacion: accion.datosMemoria?.sActual,
                    oAccion: accion.datosPlan?.oAccion,
                    dAccion: accion.datosPlan?.dAccion,
                    iMujHom: accion.datosPlan?.iMujHom,
                    uEuskera: accion.datosPlan?.uEuskera,
                    sostenibilidad: accion.datosPlan?.sostenibilidad,
                    dInteligent: accion.datosPlan?.dInteligent,
                    ods: accion.datosPlan?.ods,
                    presupuesto: Presupuestos(),
                    indicadoresRealizacion: accion.indicadorAccion?.indicadoreRealizacion.map((iR: IndicadorRealizacionAccion) => ({
                        nombre: iR.descripcion,
                        unitMed: 'unitMed', //TODO
                        metaAnual: formatHMT(iR.metaAnual),
                        valoraAlcanzado: formatHMT(iR.ejecutado),
                        metaFinal: formatHMT(iR.metaFinal),
                        anualidadMetaFinal: '', //TODO
                    })),
                    indicadoresResultado: accion.indicadorAccion?.indicadoreResultado.map((iR: IndicadorResultadoAccion) => ({
                        nombre: iR.descripcion,
                        unitMed: 'unitMed', //TODO
                        metaAnual: formatHMT(iR.metaAnual),
                        valoraAlcanzado: formatHMT(iR.ejecutado),
                        metaFinal: formatHMT(iR.metaFinal),
                        anualidadMetaFinal: '', //TODO
                    })),
                    observaciones: accion.datosPlan?.observaciones,
                    dSeguimiento: accion.datosMemoria?.dSeguimiento,
                    valFinal: accion.datosMemoria?.valFinal,
                }))
            );
        };

        // Funcion Hipotesis
        //TODO Verificar Funcion Hipotesis
        const hipotesis = () => {
            const extraerIndicadores = (ejes: Ejes[], tipo: 'indicadoreRealizacion' | 'indicadoreResultado') =>
                ejes.flatMap((eje) =>
                    eje.acciones.flatMap(
                        (accion) =>
                            accion.indicadorAccion?.[tipo]
                                ?.filter((ind) => ind.hipotesis)
                                .map((ind) => ({
                                    nombre: ind.descripcion,
                                    hipo: ind.hipotesis as string,
                                })) ?? []
                    )
                );

            const indicadoresRA = [...extraerIndicadores(accionesYProyectos, 'indicadoreRealizacion'), ...extraerIndicadores(accionesPrioritarias, 'indicadoreRealizacion')];

            const indicadoresRS = [...extraerIndicadores(accionesYProyectos, 'indicadoreResultado'), ...extraerIndicadores(accionesPrioritarias, 'indicadoreResultado')];

            return [indicadoresRA, indicadoresRS];
        };
        const [hipotesisRA, hipotesisRS] = hipotesis();

        // 4. Datos a sustituir
        let contAccion = 1;
        const data = {
            nComarca: datos.nombreRegion,
            anioComarca: datos.year,
            //2.
            //3.
            tareasInternasGestion: datos.plan.generalOperationADR.adrInternalTasks,
            indicadoresOperativos: datos.plan.generalOperationADR.operationalIndicators.map((item: OperationalIndicators) => ({
                nombre: item.nameEs,
                value: item.value,
                valueAlcanzado: item.valueAchieved,
            })),
            dSeguimiento: datos.plan.generalOperationADR.dSeguimiento,
            valFinal: datos.plan.generalOperationADR.valFinal,
            //4.
            fichasServicio: datos.servicios?.map((item: Servicios, index) => ({
                nombre: `S. ${index + 1}.- ${item.nombre}`,
                descripcion: item.descripcion,
                indicadoresRealizacion: item.indicadores.map((iR: IndicadoresServicios) => ({
                    indicador: iR.indicador,
                    previsto: iR.previsto.valor,
                    alcanzado: iR.alcanzado?.valor ?? '',
                })),
                dSeguimiento: item.dSeguimiento,
                valFinal: item.valFinal,
            })),
            //5.1
            proceso: datos.plan.proceso,
            //5.2
            eje1: accionesPrioritarias[0]?.NameEs,
            eje2: accionesPrioritarias[1] ? accionesPrioritarias[1].NameEs : '',
            eje3: accionesPrioritarias[2] ? accionesPrioritarias[2].NameEs : '',
            //5.3
            acciones: accionesPrioritarias.flatMap((item: Ejes) =>
                item.acciones.map((accion: DatosAccion) => ({
                    nombreEje: item.NameEs,
                    lineaActuaccion: accion.lineaActuaccion,
                    accion: accion.accion,
                    situacion: accion.datosMemoria?.sActual,
                }))
            ),
            //5.4
            resumenAccion: Acciones(accionesPrioritarias),
            //6.
            resumenAccionYProyectos: Acciones(accionesYProyectos),
            //7.1
            iRAAnexo1: hipotesisRA.length > 0 ? hipotesisRA : [{ nombre: '', hipo: '' }],
            iRSAnexo1: hipotesisRS.length > 0 ? hipotesisRS : [{ nombre: '', hipo: '' }],
        };
        console.log(data);

        // 5. Renderizar documento con datos
        doc.render(data);

        // 6. Generar blob final
        const out = doc.getZip().generate({
            type: 'blob',
            mimeType: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        });

        // 7. Descargar
        const url = URL.createObjectURL(out);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resultado.docx';
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generando el Word', error);
    }
};
interface BtnExportarDocumentoWordProps {
    camposRellenos: boolean;
    yearData: YearData;
    tipo: 'Plan' | 'Memoria';
    language: string;
    t: (key: string) => string;
}

export const BtnExportarDocumentoWord: React.FC<BtnExportarDocumentoWordProps> = ({ camposRellenos, yearData, tipo, language, t }) => {
    return (
        <button
            disabled={!camposRellenos}
            onClick={() => {
                if (!camposRellenos) return;
                if (tipo === 'Plan') {
                    GeneracionDelDocumentoWordPlan(yearData, language, t);
                } else {
                    GeneracionDelDocumentoWordMemoria(yearData, language, t);
                }
            }}
            className={`px-4 py-2 rounded flex items-center justify-center gap-1 font-medium h-10 min-w-[120px]    
                                                ${camposRellenos ? 'bg-gray-400 text-white hover:bg-gray-500' : 'bg-gray-200 text-gray-400 cursor-not-allowed'}
                                                `}
        >
            <img src={IconDownloand} alt="PDF" className="w-5 h-5" style={{ minWidth: 20, minHeight: 20 }} />
            {t('descargarBorrador')}
        </button>
    );
};

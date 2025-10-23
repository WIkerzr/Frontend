/* eslint-disable no-unused-vars */
import { DatosAnioCuadroMandoBorrador, Ejes, OperationalIndicators, YearData } from '../../types/tipadoPlan';
import { IndicadoresServicios, Servicios } from '../../types/GeneralTypes';
import { DatosAccion } from '../../types/TipadoAccion';
import PizZip from 'pizzip';
import Docxtemplater from 'docxtemplater';
import { HMT, IndicadorRealizacion, IndicadorRealizacionAccion, IndicadorResultado, IndicadorResultadoAccion } from '../../types/Indicadores';
import IconDownloand from '../../components/Icon/IconDownloand.svg';
import { PlanOMemoria } from '../../pages/ADR/PlanMemoria/PlanMemoriaComponents';
import { useIndicadoresContext } from '../../contexts/IndicadoresContext';
import { obtenerFilasPorTipoAccion, TransformarYearDataACuadroBorrador } from '../../pages/Configuracion/CuadroMando/ConversorCuadroMando';
import { useYear } from '../../contexts/DatosAnualContext';
import { LlamadasBBDD } from './data/utilsData';
import { useState } from 'react';
import { LoadingOverlayPersonalizada } from '../../pages/Configuracion/Users/componentes';
import { convertirPlantillaAFileValidado, onSuccessFillFiles, plantillasOriginales } from '../../pages/Configuracion/Plantillas';

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

const Ejecutoras = (ejecutora: string | undefined) => {
    if (!ejecutora) return '';
    return ejecutora.split('§').join(', ');
};

export const GeneracionDelDocumentoWordPlan = async (
    datos: YearData,
    plantilla: File,
    indicadoresRealizacion: IndicadorRealizacion[],
    indicadoresResultado: IndicadorResultado[],
    language: string,
    t: (key: string) => string
) => {
    try {
        // 1. Cargar la plantilla desde /public
        // const response = await fetch(language === 'es' ? '/plantillaPlanEs.docx' : language === 'eu' ? '/plantillaPlanEu.docx' : '/plantillaPlanEs.docx');
        // const arrayBuffer = await response.arrayBuffer();
        const arrayBuffer = await plantilla.arrayBuffer();

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
                    ejecutora: Ejecutoras(accion.datosPlan?.ejecutora),
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
                        unitMed: indicadoresRealizacion.find((e) => `${e.Id}` === `${iR.id}`)?.UnitMed,
                        metaAnual: formatHMT(iR.metaAnual),
                        metaFinal: formatHMT(iR.metaFinal),
                        anualidadMetaFinal: 'anualidadMetaFinal', //TODO
                    })),
                    indicadoresResultado: accion.indicadorAccion?.indicadoreResultado.map((iR: IndicadorResultadoAccion) => ({
                        nombre: iR.descripcion,
                        unitMed: indicadoresResultado.find((e) => `${e.Id}` === `${iR.id}`)?.UnitMed,
                        metaAnual: formatHMT(iR.metaAnual),
                        metaFinal: formatHMT(iR.metaFinal),
                        anualidadMetaFinal: 'anualidadMetaFinal', //TODO
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
                indicadoresRealizacion: item.indicadores
                    .filter((iR: IndicadoresServicios) => iR.tipo === 'realizacion')
                    .map((iR) => ({
                        indicador: iR.indicador,
                        previsto: iR.previsto.valor,
                    })),
                indicadoresResultado: item.indicadores
                    .filter((iR: IndicadoresServicios) => iR.tipo === 'resultado')
                    .map((iR) => ({
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
        a.download = `${t('Plan')}_${datos.year}_${datos.nombreRegion}`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generando el Word', error);
        throw error; // re-lanzar para que el llamador pueda manejarlo y ver el stack en consola
    }
};

export const GeneracionDelDocumentoWordMemoria = async (
    datos: YearData,
    plantilla: File,
    indicadoresRealizacion: IndicadorRealizacion[],
    indicadoresResultado: IndicadorResultado[],
    language: string,
    t: (key: string) => string
) => {
    try {
        // 1. Cargar la plantilla desde /public
        const arrayBuffer = await plantilla.arrayBuffer();

        // const response = await fetch(language === 'es' ? '/plantillaMemoriaEs.docx' : language === 'eu' ? '/plantillaMemoriaEu.docx' : '/plantillaMemoriaEs.docx');
        // const arrayBuffer = await response.arrayBuffer();

        // 2. Cargar en PizZip
        const zip = new PizZip(arrayBuffer);

        // 3. Crear instancia de docxtemplater
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        const accionesPrioritarias: Ejes[] = datos.plan.ejesPrioritarios;
        const accionesYProyectos: Ejes[] = (datos.plan.ejesRestantes ?? []).filter((eje: Ejes) => eje.IsAccessory);

        // Funcion para generar las acciones
        const Acciones = (ejes: Ejes[]) => {
            return ejes?.flatMap((item: Ejes) =>
                item.acciones.map((accion: DatosAccion) => ({
                    accion: `${contAccion++}: ${accion.accion}`,
                    eje: item.NameEs,
                    lineaActuaccion: accion.lineaActuaccion,
                    ejecutora: Ejecutoras(accion.datosPlan?.ejecutora),
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
                    presupuestoCuantia: accion.datosMemoria?.presupuestoEjecutado.cuantia,
                    presupuestoFuenteDeFinanciacion: accion.datosMemoria?.presupuestoEjecutado.fuenteDeFinanciacion,
                    presupuestoObservaciones: accion.datosMemoria?.presupuestoEjecutado.observaciones,
                    presupuestoPrevisto: accion.datosMemoria?.ejecucionPresupuestaria.previsto,
                    presupuestoEjecutado: accion.datosMemoria?.ejecucionPresupuestaria.ejecutado,
                    presupuestoPorcentajeEjecución: accion.datosMemoria?.ejecucionPresupuestaria.porcentaje,
                    indicadoresRealizacion: accion.indicadorAccion?.indicadoreRealizacion.map((iR: IndicadorRealizacionAccion) => ({
                        nombre: iR.descripcion,
                        unitMed: indicadoresRealizacion.find((e) => `${e.Id}` === `${iR.id}`)?.UnitMed,
                        metaAnual: formatHMT(iR.metaAnual),
                        valorAlcanzado: formatHMT(iR.ejecutado),
                        metaFinal: formatHMT(iR.metaFinal),
                        anualidadMetaFinal: '', //TODO
                    })),
                    indicadoresResultado: accion.indicadorAccion?.indicadoreResultado.map((iR: IndicadorResultadoAccion) => ({
                        nombre: iR.descripcion,
                        unitMed: indicadoresResultado.find((e) => `${e.Id}` === `${iR.id}`)?.UnitMed,
                        metaAnual: formatHMT(iR.metaAnual),
                        valorAlcanzado: formatHMT(iR.ejecutado),
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

        let datosCuadro: DatosAnioCuadroMandoBorrador[] = [];
        const datoAnio: DatosAnioCuadroMandoBorrador = TransformarYearDataACuadroBorrador(datos);
        if (!datosCuadro.includes(datoAnio) && datosCuadro.every((da) => da.nombreRegion !== datoAnio.nombreRegion)) {
            datosCuadro = [...datosCuadro, datoAnio];
        }
        const cuadroAcciones = obtenerFilasPorTipoAccion('Acciones', datosCuadro[0]);
        const cuadroAccionesAccesorias = obtenerFilasPorTipoAccion('AccionesAccesorias', datosCuadro[0]);
        const cuadroServicios = obtenerFilasPorTipoAccion('Servicios', datosCuadro[0]);

        const cuadroMandoRealizacion = [...(cuadroAcciones[0] || []), ...(cuadroAccionesAccesorias[0] || []), ...(cuadroServicios[0] || [])];
        const cuadroMandoResultado = [...(cuadroAcciones[1] || []), ...(cuadroAccionesAccesorias[1] || []), ...(cuadroServicios[1] || [])];

        console.log(cuadroMandoResultado);

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
                indicadoresRealizacion: item.indicadores
                    .filter((iR: IndicadoresServicios) => iR.tipo === 'realizacion')
                    .map((iR) => ({
                        indicador: iR.indicador,
                        previsto: iR.previsto.valor,
                        alcanzado: iR.alcanzado?.valor,
                    })),
                indicadoresResultado: item.indicadores
                    .filter((iR: IndicadoresServicios) => iR.tipo === 'resultado')
                    .map((iR) => ({
                        indicador: iR.indicador,
                        previsto: iR.previsto.valor,
                        alcanzado: iR.alcanzado?.valor,
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
            //7

            cuadroMandoRealizacion: cuadroMandoRealizacion.map((item) => ({
                accion: item.nombreAccion || '',
                indicadoresRealizacion: item.descripcion || '',
                valorInicial: item.ejecutado?.total || '',
                metaA: item.metaAnual?.total || '',
                valorAlcanzado: item.metaFinal?.total || '',
                porcentaje: ((Number(item.metaFinal?.total) / Number(item.metaAnual?.total)) * 100).toFixed(2),
            })),
            cuadroMandoResultado: cuadroMandoResultado.map((item) => ({
                accion: item.nombreAccion || '',
                indicadoresResultado: item.descripcion || '',
                valorInicial: item.ejecutado?.total || '',
                metaA: item.metaAnual?.total || '',
                valorAlcanzado: item.metaFinal?.total || '',
                porcentaje: ((Number(item.metaFinal?.total) / Number(item.metaAnual?.total)) * 100).toFixed(2),
            })),

            //8
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
        a.download = `${t('Memoria')}_${datos.year}_${datos.nombreRegion}`;
        a.click();
        URL.revokeObjectURL(url);
    } catch (error) {
        console.error('Error generando el Word', error);
        throw error;
    }
};
interface BtnExportarDocumentoWordProps {
    // camposRellenos: boolean;
    tipo: PlanOMemoria;
    language: string;
    t: (key: string) => string;
}

export const BtnExportarDocumentoWord: React.FC<BtnExportarDocumentoWordProps> = ({ tipo, language, t }) => {
    const { indicadoresRealizacion, indicadoresResultado } = useIndicadoresContext();
    const { yearData, llamadaBBDDYearDataAll } = useYear();

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    return (
        <button
            // disabled={!camposRellenos}
            onClick={async () => {
                const updatedYearData = await llamadaBBDDYearDataAll(yearData.year, true, true);
                const dataToUse = updatedYearData || yearData;

                const templatesData = await new Promise<{ planEs: File[]; planEu: File[]; memoriaEs: File[]; memoriaEu: File[] }>((resolve, reject) => {
                    LlamadasBBDD({
                        method: 'GET',
                        url: `plantillas`,
                        setLoading,
                        setErrorMessage,
                        setSuccessMessage,
                        // eslint-disable-next-line @typescript-eslint/no-explicit-any
                        onSuccess: async (data: any) => {
                            const tempPlanEs: File[] = [];
                            const tempPlanEu: File[] = [];
                            const tempMemoriaEs: File[] = [];
                            const tempMemoriaEu: File[] = [];
                            await onSuccessFillFiles(
                                data,
                                (files) => tempPlanEs.push(...files),
                                (files) => tempPlanEu.push(...files),
                                (files) => tempMemoriaEs.push(...files),
                                (files) => tempMemoriaEu.push(...files)
                            );
                            resolve({ planEs: tempPlanEs, planEu: tempPlanEu, memoriaEs: tempMemoriaEs, memoriaEu: tempMemoriaEu });
                        },
                        onError: () => reject(new Error('Error loading templates')),
                    });
                });

                let plantillaEscogida =
                    tipo === 'Plan' ? (language === 'es' ? templatesData.planEs[0] : templatesData.planEu[0]) : language === 'es' ? templatesData.memoriaEs[0] : templatesData.memoriaEu[0];
                if (!plantillaEscogida) {
                    if (tipo === 'Plan') {
                        if (language === 'es') {
                            plantillaEscogida = await convertirPlantillaAFileValidado(plantillasOriginales[0].url, plantillasOriginales[0].name);
                        } else {
                            plantillaEscogida = await convertirPlantillaAFileValidado(plantillasOriginales[1].url, plantillasOriginales[1].name);
                        }
                    } else {
                        if (language === 'es') {
                            plantillaEscogida = await convertirPlantillaAFileValidado(plantillasOriginales[2].url, plantillasOriginales[2].name);
                        } else {
                            plantillaEscogida = await convertirPlantillaAFileValidado(plantillasOriginales[3].url, plantillasOriginales[3].name);
                        }
                    }
                }

                if (tipo === 'Plan') {
                    await GeneracionDelDocumentoWordPlan(dataToUse, plantillaEscogida, indicadoresRealizacion, indicadoresResultado, language, t);
                } else {
                    await GeneracionDelDocumentoWordMemoria(dataToUse, plantillaEscogida, indicadoresRealizacion, indicadoresResultado, language, t);
                }
            }}
            className={`px-4 py-2 rounded flex items-center justify-center gap-1 font-medium h-10 min-w-[120px] bg-gray-400 text-white hover:bg-gray-500`}
        >
            <LoadingOverlayPersonalizada isLoading={loading} message={{ successMessage, setSuccessMessage, errorMessage, setErrorMessage }} />

            <img src={IconDownloand} alt="PDF" className="w-5 h-5" style={{ minWidth: 20, minHeight: 20 }} />
            {t('descargarBorrador')}
        </button>
    );
};

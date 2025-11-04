/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { SaberLogoEnGenWORD } from '../Layouts/LayoutsComponents';

// Helpers para insertar/reemplazar imágenes en el paquete .docx (ZIP)
const getNextRId = (relsXml: string) => {
    const regex = /rId(\d+)/g;
    let match;
    let max = 0;
    while ((match = regex.exec(relsXml)) !== null) {
        const num = parseInt(match[1], 10);
        if (!Number.isNaN(num) && num > max) max = num;
    }
    return `rId${max + 1}`;
};

const addContentTypeOverride = (zip: PizZip, imagePartName: string, mimeType: string) => {
    const typesPath = '[Content_Types].xml';
    const typesFile = zip.file(typesPath);
    if (!typesFile) return;
    let xml = typesFile.asText();
    const overrideTag = `<Override PartName='${imagePartName}' ContentType='${mimeType}'/>`;
    if (xml.indexOf(`PartName='${imagePartName}'`) === -1) {
        xml = xml.replace('</Types>', `\n    ${overrideTag}\n</Types>`);
        zip.file(typesPath, xml);
    }
};

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
    t: (key: string) => string,
    imageADR: string
) => {
    const rutaNormalizada = imageADR.replaceAll('\\', '/');
    const match = rutaNormalizada.match(/ADR\/([^/]+)/);
    try {
        // 1. Cargar la plantilla desde /public
        const arrayBuffer = await plantilla.arrayBuffer();

        // 2. Cargar en PizZip
        const originalZip = new PizZip(arrayBuffer);
        const originalMediaFiles = Object.keys(originalZip.files).filter((f) => f.startsWith('word/media/'));

        // 3. Crear instancia de docxtemplater con una copia del zip
        const zip = new PizZip(arrayBuffer);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        // Funcion para generar las acciones
        const Acciones = (ejes: Ejes[], nivel: string) => {
            let contAccion = 1;
            return ejes?.flatMap((item: Ejes) =>
                item.acciones.map((accion: DatosAccion) => ({
                    accion: `${nivel}.${contAccion++}: ${accion.accion ?? ''}`,
                    eje: item.NameEs ?? '',
                    lineaActuaccion: accion.lineaActuaccion ?? '',
                    ejecutora: Ejecutoras(accion.datosPlan?.ejecutora) ?? '',
                    implicadas: accion.datosPlan?.implicadas ?? '',
                    comarcal: accion.datosPlan?.comarcal ?? '',
                    supracomarcal: accion.datosPlan?.supracomarcal ? accion.datosPlan?.supracomarcal : ` `,
                    plurianual: accion.plurianual ? t('Si') : t('No'),
                    oAccion: accion.datosPlan?.oAccion ?? '',
                    dAccion: accion.datosPlan?.dAccion ?? '',
                    iMujHom: accion.datosPlan?.iMujHom ?? '',
                    uEuskera: accion.datosPlan?.uEuskera ?? '',
                    sostenibilidad: accion.datosPlan?.sostenibilidad ?? '',
                    dInteligent: accion.datosPlan?.dInteligent ?? '',
                    ods: accion.datosPlan?.ods ?? '',
                    presupuesto: accion.datosPlan?.presupuesto ?? '',
                    indicadoresRealizacion: accion.indicadorAccion?.indicadoreRealizacion.map((iR: IndicadorRealizacionAccion) => ({
                        nombre: iR.descripcion ?? '',
                        unitMed: indicadoresRealizacion.find((e) => `${e.Id}` === `${iR.id}`)?.UnitMed ?? '',
                        metaAnual: formatHMT(iR.metaAnual) ?? '',
                        metaFinal: formatHMT(iR.metaFinal) ?? '',
                        anualidadMetaFinal: ' ',
                    })),
                    indicadoresResultado: accion.indicadorAccion?.indicadoreResultado.map((iR: IndicadorResultadoAccion) => ({
                        nombre: iR.descripcion ?? '',
                        unitMed: indicadoresResultado.find((e) => `${e.Id}` === `${iR.id}`)?.UnitMed ?? '',
                        metaAnual: formatHMT(iR.metaAnual) ?? '',
                        metaFinal: formatHMT(iR.metaFinal) ?? '',
                        anualidadMetaFinal: ' ',
                    })),
                    observaciones: accion.datosPlan?.observaciones ?? '',
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

        console.log(match ? match[1] : '');

        // 4. Datos a sustituir

        const data = {
            nADR: match ? match[1].match(/^\S+/)?.[0] ?? '' : '',
            nComarca: datos.nombreRegion ?? '',
            anioComarca: datos.year,
            //2.
            tareasInternasGestion: datos.plan.generalOperationADR.adrInternalTasks ?? '',
            indicadoresOperativos: datos.plan.generalOperationADR.operationalIndicators.map((item: OperationalIndicators) => ({
                nombre: item.nameEs ?? '',
                value: item.value ?? '',
            })),
            //3.
            fichasServicio: datos.servicios?.map((item: Servicios, index) => ({
                nombre: `S. ${index + 1}.- ${item.nombre ?? ''}`,
                descripcion: item.descripcion ?? '',
                indicadoresRealizacion: item.indicadores
                    .filter((iR: IndicadoresServicios) => iR.tipo === 'realizacion')
                    .map((iR) => ({
                        indicador: iR.indicador ?? '',
                        previsto: iR.previsto?.valor ?? '',
                    })),
                indicadoresResultado: item.indicadores
                    .filter((iR: IndicadoresServicios) => iR.tipo === 'resultado')
                    .map((iR) => ({
                        indicador: iR.indicador ?? '',
                        previsto: iR.previsto?.valor ?? '',
                    })),
            })),
            //4.1
            proceso: datos.plan.proceso ?? '',
            //4.2
            eje1: accionesPrioritarias[0]?.NameEs ?? '',
            eje2: accionesPrioritarias[1] ? accionesPrioritarias[1].NameEs ?? '' : '',
            eje3: accionesPrioritarias[2] ? accionesPrioritarias[2].NameEs ?? '' : '',
            //4.3
            acciones: accionesPrioritarias?.flatMap((item: Ejes) =>
                item.acciones.map((accion: DatosAccion) => ({
                    nombreEje: item.NameEs ?? '',
                    lineaActuaccion: accion.lineaActuaccion ?? '',
                    accion: accion.accion ?? '',
                }))
            ),
            //4.4
            resumenAccion: Acciones(accionesPrioritarias, '4.4'),
            //5.
            resumenAccionYProyectos: Acciones(accionesYProyectos, '5'),
            //6.1
            iRAAnexo1: hipotesisRA.length > 0 ? hipotesisRA : [{ nombre: '', hipo: '' }],
            iRSAnexo1: hipotesisRS.length > 0 ? hipotesisRS : [{ nombre: '', hipo: '' }],
        };

        // 5. Renderizar documento con datos
        doc.render(data);

        // Restaurar imágenes/medios si docxtemplater las hubiera eliminado (problemas con algunas plantillas)
        try {
            const renderedZip = doc.getZip();
            const renderedMedia = Object.keys(renderedZip.files).filter((f) => f.startsWith('word/media/'));
            const missing = originalMediaFiles.filter((f) => !renderedMedia.includes(f));
            if (missing.length > 0) {
                console.warn('Se detectaron medias faltantes tras render. Restaurando:', missing);
                for (const fname of missing) {
                    const zobj = originalZip.file(fname) as unknown;
                    if (!zobj) continue;
                    let content: Uint8Array | null = null;
                    if (typeof (zobj as any).async === 'function') {
                        content = await (zobj as any).async('uint8array');
                    } else if (typeof (zobj as any).asUint8Array === 'function') {
                        content = (zobj as any).asUint8Array();
                    } else if (typeof (zobj as any).nodeStream === 'function') {
                        const stream = (zobj as any).nodeStream();
                        const chunks: Uint8Array[] = [];
                        for await (const chunk of stream) {
                            const arr = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
                            chunks.push(arr);
                        }
                        const total = chunks.reduce((s, c) => s + c.length, 0);
                        const combined = new Uint8Array(total);
                        let offset = 0;
                        for (const c of chunks) {
                            combined.set(c, offset);
                            offset += c.length;
                        }
                        content = combined;
                    }
                    if (content) {
                        renderedZip.file(fname, content);
                    }
                }
            }
        } catch (err) {
            console.warn('No se pudo restaurar medias automáticamente:', err);
        }

        // Reemplazar imagen en la plantilla: si existe word/media/image1.png la reemplazamos,
        // si no existe, la añadimos y creamos la relación y el bloque <w:drawing> en document.xml.

        try {
            const imageResponse = await fetch(imageADR);
            if (!imageResponse.ok) {
                console.error(`Error al cargar imagen: ${imageResponse.status} ${imageResponse.statusText}`);
                throw new Error(`No se pudo cargar la imagen: ${imageResponse.status}`);
            }

            const imageBuffer = await imageResponse.arrayBuffer();
            const imageData = new Uint8Array(imageBuffer);

            const renderedZip = doc.getZip();

            // Si la plantilla ya tiene image1.png la sustituimos
            const existingMediaName = 'word/media/image1.png';
            if (renderedZip.file(existingMediaName)) {
                renderedZip.file(existingMediaName, imageData);
                addContentTypeOverride(renderedZip, `/${existingMediaName}`, 'image/png');
            } else {
                // No existe image1.png: añadimos un nuevo archivo en word/media y creamos la relación y la referencia en document.xml
                const ext = 'jpg';
                const imageName = `image_generated.${ext}`;
                const imagePart = `word/media/${imageName}`;
                renderedZip.file(imagePart, imageData);

                // actualizar [Content_Types].xml
                addContentTypeOverride(renderedZip, `/${imagePart}`, 'image/jpeg');

                const relsPath = 'word/_rels/document.xml.rels';
                let relsXml = '';
                const relsFile = renderedZip.file(relsPath);
                if (relsFile) {
                    relsXml = relsFile.asText();
                } else {
                    relsXml = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
                }

                const rId = getNextRId(relsXml);
                const relEntry = `<Relationship Id='${rId}' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='media/${imageName}'/>`;
                relsXml = relsXml.replace('</Relationships>', `${relEntry}\n</Relationships>`);
                renderedZip.file(relsPath, relsXml);

                // Insertar un w:drawing sencillo al inicio del documento.xml para mostrar la imagen
                const docPathXml = 'word/document.xml';
                const docFile = renderedZip.file(docPathXml);
                if (docFile) {
                    let docXml = docFile.asText();
                    const cx = 6000000; // ancho
                    const cy = 2000000; // alto

                    const drawingXml = `\n<w:p xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'>\n  <w:r>\n    <w:drawing>\n      <wp:inline xmlns:wp='http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing' distT='0' distB='0' distL='0' distR='0'>\n        <wp:extent cx='${cx}' cy='${cy}'/>\n        <wp:docPr id='1' name='${imageName}'/>\n        <a:graphic xmlns:a='http://schemas.openxmlformats.org/drawingml/2006/main'>\n          <a:graphicData uri='http://schemas.openxmlformats.org/drawingml/2006/picture'>\n            <pic:pic xmlns:pic='http://schemas.openxmlformats.org/drawingml/2006/picture'>\n              <pic:nvPicPr>\n                <pic:cNvPr id='0' name='${imageName}'/>\n                <pic:cNvPicPr/>\n              </pic:nvPicPr>\n              <pic:blipFill>\n                <a:blip r:embed='${rId}' xmlns:r='http://schemas.openxmlformats.org/officeDocument/2006/relationships'/>\n                <a:stretch>\n                  <a:fillRect/>\n                </a:stretch>\n              </pic:blipFill>\n              <pic:spPr/>\n            </pic:pic>\n          </a:graphicData>\n        </a:graphic>\n      </wp:inline>\n    </w:drawing>\n  </w:r>\n</w:p>\n`;

                    // Insertar justo después de <w:body> si existe
                    const bodyIndex = docXml.indexOf('<w:body>');
                    if (bodyIndex !== -1) {
                        const insertAt = bodyIndex + '<w:body>'.length;
                        docXml = docXml.slice(0, insertAt) + drawingXml + docXml.slice(insertAt);
                        renderedZip.file(docPathXml, docXml);
                    } else {
                        // fallback: añadir al final
                        docXml = docXml + drawingXml;
                        renderedZip.file(docPathXml, docXml);
                    }
                }
            }
        } catch (err) {
            console.warn('No se pudo agregar la imagen de la ADR:', err);
        }

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
    t: (key: string) => string,
    imageADR: string
) => {
    const rutaNormalizada = imageADR.replaceAll('\\', '/');
    const match = rutaNormalizada.match(/ADR\/([^/]+)/);
    try {
        // 1. Cargar la plantilla desde /public
        const arrayBuffer = await plantilla.arrayBuffer();

        // 2. Cargar en PizZip
        const originalZip2 = new PizZip(arrayBuffer);
        const originalMediaFiles2 = Object.keys(originalZip2.files).filter((f) => f.startsWith('word/media/'));

        // 3. Crear instancia de docxtemplater con una copia del zip
        const zip = new PizZip(arrayBuffer);
        const doc = new Docxtemplater(zip, {
            paragraphLoop: true,
            linebreaks: true,
        });

        const accionesPrioritarias: Ejes[] = datos.plan.ejesPrioritarios;
        const accionesYProyectos: Ejes[] = (datos.plan.ejesRestantes ?? []).filter((eje: Ejes) => eje.IsAccessory);

        // Funcion para generar las acciones
        const Acciones = (ejes: Ejes[], nivel: string) => {
            let contAccion = 1;
            return ejes?.flatMap((item: Ejes) =>
                item.acciones.map((accion: DatosAccion) => ({
                    accion: `${nivel}.${contAccion++}: ${accion.accion ?? ''}`,
                    eje: item.NameEs ?? '',
                    lineaActuaccion: accion.lineaActuaccion ?? '',
                    ejecutora: Ejecutoras(accion.datosPlan?.ejecutora) ?? '',
                    implicadas: accion.datosPlan?.implicadas ?? '',
                    comarcal: accion.datosPlan?.comarcal ?? '',
                    supracomarcal: accion.datosPlan?.supracomarcal ? accion.datosPlan?.supracomarcal : ` `,
                    plurianual: accion.plurianual ? t('Si') : t('No'),
                    situacion: accion.datosMemoria?.sActual ?? '',
                    oAccion: accion.datosPlan?.oAccion ?? '',
                    dAccion: accion.datosPlan?.dAccion ?? '',
                    iMujHom: accion.datosPlan?.iMujHom ?? '',
                    uEuskera: accion.datosPlan?.uEuskera ?? '',
                    sostenibilidad: accion.datosPlan?.sostenibilidad ?? '',
                    dInteligent: accion.datosPlan?.dInteligent ?? '',
                    ods: accion.datosPlan?.ods ?? '',
                    presupuestoCuantia: accion.datosMemoria?.presupuestoEjecutado.cuantia ?? '',
                    presupuestoFuenteDeFinanciacion: accion.datosMemoria?.presupuestoEjecutado.fuenteDeFinanciacion ?? '',
                    presupuestoObservaciones: accion.datosMemoria?.presupuestoEjecutado.observaciones ?? '',
                    presupuestoPrevisto: accion.datosMemoria?.ejecucionPresupuestaria.previsto ?? '',
                    presupuestoEjecutado: accion.datosMemoria?.ejecucionPresupuestaria.ejecutado ?? '',
                    presupuestoPorcentajeEjecución: accion.datosMemoria?.ejecucionPresupuestaria.porcentaje ?? '',
                    indicadoresRealizacion: accion.indicadorAccion?.indicadoreRealizacion.map((iR: IndicadorRealizacionAccion) => ({
                        nombre: iR.descripcion ?? '',
                        unitMed: indicadoresRealizacion.find((e) => `${e.Id}` === `${iR.id}`)?.UnitMed ?? '',
                        metaAnual: formatHMT(iR.metaAnual) ?? '',
                        valorAlcanzado: formatHMT(iR.ejecutado) ?? '',
                        metaFinal: formatHMT(iR.metaFinal) ?? '',
                        anualidadMetaFinal: ' ',
                    })),
                    indicadoresResultado: accion.indicadorAccion?.indicadoreResultado.map((iR: IndicadorResultadoAccion) => ({
                        nombre: iR.descripcion ?? '',
                        unitMed: indicadoresResultado.find((e) => `${e.Id}` === `${iR.id}`)?.UnitMed ?? '',
                        metaAnual: formatHMT(iR.metaAnual) ?? '',
                        valorAlcanzado: formatHMT(iR.ejecutado) ?? '',
                        metaFinal: formatHMT(iR.metaFinal) ?? '',
                        anualidadMetaFinal: ' ',
                    })),
                    observaciones: accion.datosPlan?.observaciones ?? '',
                    dSeguimiento: accion.datosMemoria?.dSeguimiento ?? '',
                    valFinal: accion.datosMemoria?.valFinal ?? '',
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

        // 4. Datos a sustituir
        const data = {
            nADR: match ? match[1].match(/^\S+/)?.[0] ?? '' : '',
            nComarca: datos.nombreRegion ?? '',
            anioComarca: datos.year ?? '',
            //2.
            //3.
            tareasInternasGestion: datos.plan.generalOperationADR.adrInternalTasks ?? '',
            indicadoresOperativos: datos.plan.generalOperationADR.operationalIndicators.map((item: OperationalIndicators) => ({
                nombre: item.nameEs ?? '',
                value: item.value ?? '',
                valueAlcanzado: item.valueAchieved ?? '',
            })),
            dSeguimiento: datos.plan.generalOperationADR.dSeguimiento ?? '',
            valFinal: datos.plan.generalOperationADR.valFinal ?? '',
            //4.
            fichasServicio: datos.servicios?.map((item: Servicios, index) => ({
                nombre: `S. ${index + 1}.- ${item.nombre ?? ''}`,
                descripcion: item.descripcion ?? '',
                indicadoresRealizacion: item.indicadores
                    .filter((iR: IndicadoresServicios) => iR.tipo === 'realizacion')
                    .map((iR) => ({
                        indicador: iR.indicador ?? '',
                        previsto: iR.previsto?.valor ?? '',
                        alcanzado: iR.alcanzado?.valor ?? '',
                    })),
                indicadoresResultado: item.indicadores
                    .filter((iR: IndicadoresServicios) => iR.tipo === 'resultado')
                    .map((iR) => ({
                        indicador: iR.indicador ?? '',
                        previsto: iR.previsto?.valor ?? '',
                        alcanzado: iR.alcanzado?.valor ?? '',
                    })),
                dSeguimiento: item.dSeguimiento ?? '',
                valFinal: item.valFinal ?? '',
            })),
            //5.1
            proceso: datos.plan.proceso ?? '',
            //5.2
            eje1: accionesPrioritarias[0]?.NameEs ?? '',
            eje2: accionesPrioritarias[1] ? accionesPrioritarias[1].NameEs ?? '' : '',
            eje3: accionesPrioritarias[2] ? accionesPrioritarias[2].NameEs ?? '' : '',
            //5.3
            acciones: accionesPrioritarias.flatMap((item: Ejes) =>
                item.acciones.map((accion: DatosAccion) => ({
                    nombreEje: item.NameEs ?? '',
                    lineaActuaccion: accion.lineaActuaccion ?? '',
                    accion: accion.accion ?? '',
                    situacion: accion.datosMemoria?.sActual ?? '',
                }))
            ),
            //5.4
            resumenAccion: Acciones(accionesPrioritarias, '5.4'),
            //6.
            resumenAccionYProyectos: Acciones(accionesYProyectos, '6'),
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

        // Restaurar imágenes/medios si docxtemplater las hubiera eliminado
        try {
            const renderedZip = doc.getZip();
            const renderedMedia2 = Object.keys(renderedZip.files).filter((f) => f.startsWith('word/media/'));
            const missing2 = originalMediaFiles2.filter((f) => !renderedMedia2.includes(f));
            if (missing2.length > 0) {
                console.warn('Se detectaron medias faltantes tras render (Memoria). Restaurando:', missing2);
                for (const fname of missing2) {
                    const zobj = originalZip2.file(fname) as unknown;
                    if (!zobj) continue;
                    let content: Uint8Array | null = null;
                    if (typeof (zobj as any).async === 'function') {
                        content = await (zobj as any).async('uint8array');
                    } else if (typeof (zobj as any).asUint8Array === 'function') {
                        content = (zobj as any).asUint8Array();
                    } else if (typeof (zobj as any).nodeStream === 'function') {
                        const stream = (zobj as any).nodeStream();
                        const chunks: Uint8Array[] = [];
                        for await (const chunk of stream) {
                            const arr = chunk instanceof Uint8Array ? chunk : new Uint8Array(chunk);
                            chunks.push(arr);
                        }
                        const total = chunks.reduce((s, c) => s + c.length, 0);
                        const combined = new Uint8Array(total);
                        let offset = 0;
                        for (const c of chunks) {
                            combined.set(c, offset);
                            offset += c.length;
                        }
                        content = combined;
                    }
                    if (content) {
                        renderedZip.file(fname, content);
                    }
                }
            }
        } catch (err) {
            console.warn('No se pudo restaurar medias automáticamente (Memoria):', err);
        }

        // Reemplazar imagen en la plantilla: si existe word/media/image1.png la reemplazamos,
        // si no existe, la añadimos y creamos la relación y el bloque <w:drawing> en document.xml.

        try {
            const imageResponse = await fetch(imageADR);
            if (!imageResponse.ok) {
                console.error(`Error al cargar imagen: ${imageResponse.status} ${imageResponse.statusText}`);
                throw new Error(`No se pudo cargar la imagen: ${imageResponse.status}`);
            }

            const imageBuffer = await imageResponse.arrayBuffer();
            const imageData = new Uint8Array(imageBuffer);

            const renderedZip = doc.getZip();

            // Si la plantilla ya tiene image1.png la sustituimos
            const existingMediaName = 'word/media/image1.png';
            if (renderedZip.file(existingMediaName)) {
                renderedZip.file(existingMediaName, imageData);
                addContentTypeOverride(renderedZip, `/${existingMediaName}`, 'image/png');
            } else {
                // No existe image1.png: añadimos un nuevo archivo en word/media y creamos la relación y la referencia en document.xml
                const ext = 'jpg';
                const imageName = `image_generated.${ext}`;
                const imagePart = `word/media/${imageName}`;
                renderedZip.file(imagePart, imageData);

                // actualizar [Content_Types].xml
                addContentTypeOverride(renderedZip, `/${imagePart}`, 'image/jpeg');

                const relsPath = 'word/_rels/document.xml.rels';
                let relsXml = '';
                const relsFile = renderedZip.file(relsPath);
                if (relsFile) {
                    relsXml = relsFile.asText();
                } else {
                    relsXml = '<?xml version="1.0" encoding="UTF-8"?><Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships"></Relationships>';
                }

                const rId = getNextRId(relsXml);
                const relEntry = `<Relationship Id='${rId}' Type='http://schemas.openxmlformats.org/officeDocument/2006/relationships/image' Target='media/${imageName}'/>`;
                relsXml = relsXml.replace('</Relationships>', `${relEntry}\n</Relationships>`);
                renderedZip.file(relsPath, relsXml);

                // Insertar un w:drawing sencillo al inicio del documento.xml para mostrar la imagen
                const docPathXml = 'word/document.xml';
                const docFile = renderedZip.file(docPathXml);
                if (docFile) {
                    let docXml = docFile.asText();
                    const cx = 6000000; // ancho
                    const cy = 2000000; // alto

                    const drawingXml = `\n<w:p xmlns:w='http://schemas.openxmlformats.org/wordprocessingml/2006/main'>\n  <w:r>\n    <w:drawing>\n      <wp:inline xmlns:wp='http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing' distT='0' distB='0' distL='0' distR='0'>\n        <wp:extent cx='${cx}' cy='${cy}'/>\n        <wp:docPr id='1' name='${imageName}'/>\n        <a:graphic xmlns:a='http://schemas.openxmlformats.org/drawingml/2006/main'>\n          <a:graphicData uri='http://schemas.openxmlformats.org/drawingml/2006/picture'>\n            <pic:pic xmlns:pic='http://schemas.openxmlformats.org/drawingml/2006/picture'>\n              <pic:nvPicPr>\n                <pic:cNvPr id='0' name='${imageName}'/>\n                <pic:cNvPicPr/>\n              </pic:nvPicPr>\n              <pic:blipFill>\n                <a:blip r:embed='${rId}' xmlns:r='http://schemas.openxmlformats.org/officeDocument/2006/relationships'/>\n                <a:stretch>\n                  <a:fillRect/>\n                </a:stretch>\n              </pic:blipFill>\n              <pic:spPr/>\n            </pic:pic>\n          </a:graphicData>\n        </a:graphic>\n      </wp:inline>\n    </w:drawing>\n  </w:r>\n</w:p>\n`;

                    // Insertar justo después de <w:body> si existe
                    const bodyIndex = docXml.indexOf('<w:body>');
                    if (bodyIndex !== -1) {
                        const insertAt = bodyIndex + '<w:body>'.length;
                        docXml = docXml.slice(0, insertAt) + drawingXml + docXml.slice(insertAt);
                        renderedZip.file(docPathXml, docXml);
                    } else {
                        // fallback: añadir al final
                        docXml = docXml + drawingXml;
                        renderedZip.file(docPathXml, docXml);
                    }
                }
            }
        } catch (err) {
            console.warn('No se pudo agregar la imagen de la ADR:', err);
        }

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
    const imageADR = SaberLogoEnGenWORD();

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
                    await GeneracionDelDocumentoWordPlan(dataToUse, plantillaEscogida, indicadoresRealizacion, indicadoresResultado, t, imageADR);
                } else {
                    await GeneracionDelDocumentoWordMemoria(dataToUse, plantillaEscogida, indicadoresRealizacion, indicadoresResultado, t, imageADR);
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

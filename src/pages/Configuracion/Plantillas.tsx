/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiTarget } from '../../components/Utils/data/controlDev';
import { LlamadasBBDD } from '../../components/Utils/data/utilsData';
import { AdjuntarArchivos } from '../../components/Utils/inputs';
import { Boton } from '../../components/Utils/utils';
import { LoadingOverlayPersonalizada } from './Users/componentes';

export const plantillasOriginales = [
    { url: '/Plantillas/plantillaPlanEsOriginal.docx', name: 'plantillaPlanEsOriginal.docx' },
    { url: '/Plantillas/plantillaPlanEuOriginal.docx', name: 'plantillaPlanEuOriginal.docx' },
    { url: '/Plantillas/plantillaMemoriaEsOriginal.docx', name: 'plantillaMemoriaEsOriginal.docx' },
    { url: '/Plantillas/plantillaMemoriaEuOriginal.docx', name: 'plantillaMemoriaEuOriginal.docx' },
];

const Index = () => {
    const { t } = useTranslation();

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [plantillaPlanEs, setPlantillaPlanEs] = useState<File[]>([]);
    const [plantillaPlanEu, setPlantillaPlanEu] = useState<File[]>([]);
    const [plantillaMemoriaEs, setPlantillaMemoriaEs] = useState<File[]>([]);
    const [plantillaMemoriaEu, setPlantillaMemoriaEu] = useState<File[]>([]);

    const [isPlanEsOriginal, setIsPlanEsOriginal] = useState<boolean>(true);
    const [isPlanEuOriginal, setIsPlanEuOriginal] = useState<boolean>(true);
    const [isMemoriaEsOriginal, setIsMemoriaEsOriginal] = useState<boolean>(true);
    const [isMemoriaEuOriginal, setIsMemoriaEuOriginal] = useState<boolean>(true);

    const [primeraLlamada, setPrimeraLlamada] = useState<boolean>(true);

    useEffect(() => {
        if (plantillaPlanEs.length > 0 && plantillaPlanEu.length > 0 && plantillaMemoriaEs.length > 0 && plantillaMemoriaEu.length > 0) return;
        LlamadasBBDD({
            method: 'GET',
            url: `plantillas`,
            setLoading,
            setErrorMessage,
            setSuccessMessage,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            onSuccess: async (data: any) => {
                await onSuccessFillFiles(
                    data,
                    setPlantillaPlanEs,
                    setPlantillaPlanEu,
                    setPlantillaMemoriaEs,
                    setPlantillaMemoriaEu,
                    setIsPlanEsOriginal,
                    setIsPlanEuOriginal,
                    setIsMemoriaEsOriginal,
                    setIsMemoriaEuOriginal
                );
                setPrimeraLlamada(false);
            },
            onError: () => {
                setPrimeraLlamada(false);
            },
        });
    }, []);

    useEffect(() => {
        if (primeraLlamada) return;
        if (plantillaPlanEs.length > 0 && plantillaPlanEu.length > 0 && plantillaMemoriaEs.length > 0 && plantillaMemoriaEu.length > 0) return;
        const loadDefaultFiles = async () => {
            try {
                const files = await Promise.all([
                    convertirPlantillaAFileValidado(plantillasOriginales[0].url, plantillasOriginales[0].name),
                    convertirPlantillaAFileValidado(plantillasOriginales[1].url, plantillasOriginales[1].name),
                    convertirPlantillaAFileValidado(plantillasOriginales[2].url, plantillasOriginales[2].name),
                    convertirPlantillaAFileValidado(plantillasOriginales[3].url, plantillasOriginales[3].name),
                ]);

                if (plantillaPlanEs.length == 0) setPlantillaPlanEs([files[0]]);
                if (plantillaPlanEu.length == 0) setPlantillaPlanEu([files[1]]);
                if (plantillaMemoriaEs.length == 0) setPlantillaMemoriaEs([files[2]]);
                if (plantillaMemoriaEu.length == 0) setPlantillaMemoriaEu([files[3]]);
            } catch (error) {
                console.error('Error loading default files:', error);
            }
        };
        loadDefaultFiles();
    }, [plantillaPlanEs, plantillaPlanEu, plantillaMemoriaEs, plantillaMemoriaEu, primeraLlamada]);

    const handleGuardar = async () => {
        const formData = new FormData();

        const archivosAGuardar: { file: File; slot: string; isOriginal: boolean }[] = [
            { file: plantillaPlanEs[0], slot: 'planES', isOriginal: isPlanEsOriginal },
            { file: plantillaPlanEu[0], slot: 'planEU', isOriginal: isPlanEuOriginal },
            { file: plantillaMemoriaEs[0], slot: 'memoriaEs', isOriginal: isMemoriaEsOriginal },
            { file: plantillaMemoriaEu[0], slot: 'memoriaEu', isOriginal: isMemoriaEuOriginal },
        ];

        const archivosNoOriginales = archivosAGuardar.filter((item) => item.file && !item.isOriginal);

        if (archivosNoOriginales.length === 0) {
            setSuccessMessage('No hay plantillas personalizadas para guardar');
            return;
        }

        archivosNoOriginales.forEach((item) => {
            formData.append(item.slot, item.file);
        });

        setLoading(true);

        try {
            const accessToken = sessionStorage.getItem('access_token');

            const res = await fetch(`${ApiTarget}/plantillas/Upload`, {
                method: 'POST',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
                body: formData,
            });

            if (!res.ok) {
                const text = await res.text();
                setErrorMessage(`Error en la subida: ${text}`);
                throw new Error(text);
            }

            const data = await res.json();
            setSuccessMessage(data.message || 'Archivo subido correctamente');
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
        } catch (err: any) {
            setErrorMessage(`Error en la petición: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const handleRestaurarPlantilla = async (tipo: 'planES' | 'planEU' | 'memoriaEs' | 'memoriaEu') => {
        const mapping = {
            planES: { setter: setPlantillaPlanEs, original: plantillasOriginales[0], setOriginal: setIsPlanEsOriginal },
            planEU: { setter: setPlantillaPlanEu, original: plantillasOriginales[1], setOriginal: setIsPlanEuOriginal },
            memoriaEs: { setter: setPlantillaMemoriaEs, original: plantillasOriginales[2], setOriginal: setIsMemoriaEsOriginal },
            memoriaEu: { setter: setPlantillaMemoriaEu, original: plantillasOriginales[3], setOriginal: setIsMemoriaEuOriginal },
        };

        const config = mapping[tipo];

        try {
            setLoading(true);

            const file = await convertirPlantillaAFileValidado(config.original.url, config.original.name);
            config.setter([file]);
            config.setOriginal(true);

            const accessToken = sessionStorage.getItem('access_token');
            const res = await fetch(`${ApiTarget}/plantillas/delete/${tipo}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                },
            });

            if (!res.ok) {
                console.warn(`No se pudo eliminar la plantilla del backend: ${res.status}`);
            }

            setSuccessMessage('Plantilla restaurada correctamente');
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Error desconocido';
            setErrorMessage(`Error al restaurar plantilla: ${errorMessage}`);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 panel items-center justify-center">
            <LoadingOverlayPersonalizada isLoading={loading} message={{ successMessage, setSuccessMessage, errorMessage, setErrorMessage }} />
            <div className=" panel">
                <span className="text-center block text-xl">{t('plantillasPlanes')}</span>
                <div className="flex gap-4">
                    <AdjuntarArchivos
                        files={plantillaPlanEs}
                        setFiles={(files) => {
                            setPlantillaPlanEs(files);
                            if (files.length > 0) setIsPlanEsOriginal(false);
                        }}
                        title={t('plantillaPlanEs')}
                        borrar={false}
                        tipoArchivosAceptables="docx"
                        btnPlantillas={true}
                        onRestaurar={() => handleRestaurarPlantilla('planES')}
                        hideRestaurar={isPlanEsOriginal}
                    />
                    <AdjuntarArchivos
                        files={plantillaPlanEu}
                        setFiles={(files) => {
                            setPlantillaPlanEu(files);
                            if (files.length > 0) setIsPlanEuOriginal(false);
                        }}
                        title={t('plantillaPlanEu')}
                        borrar={false}
                        tipoArchivosAceptables="docx"
                        btnPlantillas={true}
                        onRestaurar={() => handleRestaurarPlantilla('planEU')}
                        hideRestaurar={isPlanEuOriginal}
                    />
                </div>
            </div>
            <div className="panel">
                <span className="text-center block text-xl">{t('plantillasMemorias')}</span>
                <div className="flex gap-4">
                    <AdjuntarArchivos
                        files={plantillaMemoriaEs}
                        setFiles={(files) => {
                            setPlantillaMemoriaEs(files);
                            if (files.length > 0) setIsMemoriaEsOriginal(false);
                        }}
                        title={t('plantillaMemoriaEs')}
                        borrar={false}
                        tipoArchivosAceptables="docx"
                        btnPlantillas={true}
                        onRestaurar={() => handleRestaurarPlantilla('memoriaEs')}
                        hideRestaurar={isMemoriaEsOriginal}
                    />
                    <AdjuntarArchivos
                        files={plantillaMemoriaEu}
                        setFiles={(files) => {
                            setPlantillaMemoriaEu(files);
                            if (files.length > 0) setIsMemoriaEuOriginal(false);
                        }}
                        title={t('plantillaMemoriaEu')}
                        borrar={false}
                        tipoArchivosAceptables="docx"
                        btnPlantillas={true}
                        onRestaurar={() => handleRestaurarPlantilla('memoriaEu')}
                        hideRestaurar={isMemoriaEuOriginal}
                    />
                </div>
            </div>
            <Boton tipo="guardar" textoBoton={t('guardar')} onClick={() => handleGuardar()} />
        </div>
    );
};
export default Index;

function parseFileNameFromContentDisposition(header: string | null): string | null {
    if (!header) return null;
    const fileNameStarMatch = header.match(/filename\*=([^;]+)/i);
    if (fileNameStarMatch) {
        const part = fileNameStarMatch[1].trim();
        const maybe = part.split("''").pop() ?? part;
        try {
            return decodeURIComponent(maybe);
        } catch {
            return maybe.replace(/['"]/g, '');
        }
    }
    const fileNameMatch = header.match(/filename=(?:"?)([^";]+)(?:"?)/i);
    if (fileNameMatch) return fileNameMatch[1].trim().replace(/['"]/g, '');
    return null;
}

export const onSuccessFillFiles = async (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    data: any,
    setPlantillaPlanEs: (v: File[]) => void,
    setPlantillaPlanEu: (v: File[]) => void,
    setPlantillaMemoriaEs: (v: File[]) => void,
    setPlantillaMemoriaEu: (v: File[]) => void,
    setIsPlanEsOriginal?: (v: boolean) => void,
    setIsPlanEuOriginal?: (v: boolean) => void,
    setIsMemoriaEsOriginal?: (v: boolean) => void,
    setIsMemoriaEuOriginal?: (v: boolean) => void
) => {
    const slots = ['planES', 'planEU', 'memoriaEs', 'memoriaEu'] as const;
    const token = sessionStorage.getItem('access_token');

    const headers = {
        Authorization: `Bearer ${token}`,
    };

    const downloads = await Promise.all(
        slots.map(async (slot, idx) => {
            const meta = Array.isArray(data.files) ? data.files[idx] : undefined;
            if (!meta || !meta.exists) return null;

            try {
                const res = await fetch(`${ApiTarget}/plantillas/download/${slot}`, {
                    method: 'GET',
                    headers,
                });

                if (!res.ok) {
                    if (res.status === 404) return null;
                    console.error(`Error descargando ${slot}: ${res.status} ${res.statusText}`);
                    return null;
                }

                const blob = await res.blob();

                const cdHeader = res.headers.get('content-disposition');
                const cdName = parseFileNameFromContentDisposition(cdHeader);
                const fileName = (meta && meta.fileName) || cdName || `${slot}`;

                const file = new File([blob], fileName, { type: blob.type || 'application/octet-stream' });
                return file;
            } catch (err) {
                console.error(`Excepción descargando ${slot}:`, err);
                return null;
            }
        })
    );

    setPlantillaPlanEs(downloads[0] ? [downloads[0] as File] : []);
    setPlantillaPlanEu(downloads[1] ? [downloads[1] as File] : []);
    setPlantillaMemoriaEs(downloads[2] ? [downloads[2] as File] : []);
    setPlantillaMemoriaEu(downloads[3] ? [downloads[3] as File] : []);

    if (setIsPlanEsOriginal) setIsPlanEsOriginal(downloads[0] ? false : true);
    if (setIsPlanEuOriginal) setIsPlanEuOriginal(downloads[1] ? false : true);
    if (setIsMemoriaEsOriginal) setIsMemoriaEsOriginal(downloads[2] ? false : true);
    if (setIsMemoriaEuOriginal) setIsMemoriaEuOriginal(downloads[3] ? false : true);
};

export async function convertirPlantillaAFileValidado(urlPath: string, filename?: string): Promise<File> {
    const res = await fetch(urlPath, { method: 'GET', credentials: 'same-origin' });
    if (!res.ok) {
        throw new Error(`Error fetching file: ${res.status} ${res.statusText}`);
    }

    const arrayBuffer = await res.arrayBuffer();
    const u8 = new Uint8Array(arrayBuffer);

    const isZip = u8.length >= 4 && u8[0] === 0x50 && u8[1] === 0x4b && (u8[2] === 0x03 || u8[2] === 0x05 || u8[2] === 0x07);
    const contentType = res.headers.get('content-type') ?? '';

    if (!isZip) {
        let preview = '';
        try {
            const textPreview = new TextDecoder().decode(arrayBuffer.slice(0, 2048));
            preview = textPreview.slice(0, 1000).replace(/\s+/g, ' ').trim();
            // eslint-disable-next-line @typescript-eslint/no-unused-vars
        } catch (e) {
            preview = '(no se pudo decodificar preview)';
        }

        const msg = `La respuesta NO es un .docx válido. Content-Type: ${contentType}. Primeros bytes hex: ${Array.from(u8.slice(0, 8))
            .map((b) => b.toString(16).padStart(2, '0'))
            .join(' ')}. Preview: ${preview}`;
        throw new Error(msg);
    }
    const blob = new Blob([arrayBuffer], { type: contentType || 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
    const name = filename ?? new URL(urlPath, window.location.href).pathname.split('/').pop() ?? 'plantilla.docx';
    const file = new File([blob], name, { type: blob.type });

    return file;
}

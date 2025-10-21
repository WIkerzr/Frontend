/* eslint-disable no-unused-vars */
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { LlamadasBBDD } from '../../components/Utils/data/utilsData';
import { LoadingOverlayPersonalizada } from './Users/componentes';
import { AdjuntarArchivos } from '../../components/Utils/inputs';
import { Boton } from '../../components/Utils/utils';
import { ApiTarget } from '../../components/Utils/data/controlDev';

const plantillasOriginales = [
    { url: '/plantillaPlanEsOriginal.docx', name: 'plantillaPlanEsOriginal.docx' },
    { url: '/plantillaPlanEuOriginal.docx', name: 'plantillaPlanEuOriginal.docx' },
    { url: '/plantillaMemoriaEsOriginal.docx', name: 'plantillaMemoriaEsOriginal.docx' },
    { url: '/plantillaMemoriaEuOriginal.docx', name: 'plantillaMemoriaEuOriginal.docx' },
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
                await onSuccessFillFiles(data, setPlantillaPlanEs, setPlantillaPlanEu, setPlantillaMemoriaEs, setPlantillaMemoriaEu);
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
                const files = await Promise.all(
                    plantillasOriginales.map(async ({ url, name }) => {
                        const response = await fetch(url);
                        const blob = await response.blob();
                        return new File([blob], name, { type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document' });
                    })
                );

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

    // useEffect(() => {
    //     const fetchData = async () => {
    //         setLoading(true);

    //         try {
    //             const accessToken = sessionStorage.getItem('access_token');

    //             const res = await fetch(`${ApiTarget}/plantillas/download/all`, {
    //                 method: 'GET',
    //                 headers: {
    //                     Authorization: `Bearer ${accessToken}`,
    //                 },
    //             });

    //             if (!res.ok) {
    //                 const text = await res.text();
    //                 setErrorMessage(`Error en la carga de plantillas: ${text}`);
    //                 throw new Error(text);
    //             }

    //             const data = await res.json();

    //             // setPlantillaPlanEs(files[0]);
    //             // setPlantillaPlanEu(data.files[1]);
    //             // setPlantillaMemoriaEs(data.files[2]);
    //             // setPlantillaMemoriaEu(data.files[3]);
    //             setSuccessMessage('Archivos cargados correctamente');

    //             // eslint-disable-next-line @typescript-eslint/no-explicit-any
    //         } catch (err: any) {
    //             setErrorMessage(`Error en la petición: ${err.message}`);
    //         } finally {
    //             setLoading(false);
    //         }
    //     };
    //     fetchData();
    // }, []);

    const handleGuardar = async () => {
        const formData = new FormData();
        const archivos = [plantillaPlanEs, plantillaPlanEu, plantillaMemoriaEs, plantillaMemoriaEu].flat();
        archivos.forEach((file) => {
            formData.append('files', file);
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

    return (
        <div className="flex flex-col gap-4 panel items-center justify-center">
            <LoadingOverlayPersonalizada isLoading={loading} message={{ successMessage, setSuccessMessage, errorMessage, setErrorMessage }} />
            <div className=" panel">
                <span className="text-center block text-xl">{t('plantillasPlanes')}</span>
                <div className="flex gap-4">
                    <AdjuntarArchivos files={plantillaPlanEs} setFiles={setPlantillaPlanEs} title={t('plantillaPlanEs')} borrar={false} btnPlantillas={true} />
                    <AdjuntarArchivos files={plantillaPlanEu} setFiles={setPlantillaPlanEu} title={t('plantillaPlanEu')} borrar={false} btnPlantillas={true} />
                </div>
            </div>
            <div className="panel">
                <span className="text-center block text-xl">{t('plantillasMemorias')}</span>
                <div className="flex gap-4">
                    <AdjuntarArchivos files={plantillaMemoriaEs} setFiles={setPlantillaMemoriaEs} title={t('plantillaMemoriaEs')} borrar={false} btnPlantillas={true} />
                    <AdjuntarArchivos files={plantillaMemoriaEu} setFiles={setPlantillaMemoriaEu} title={t('plantillaMemoriaEu')} borrar={false} btnPlantillas={true} />
                </div>
            </div>
            <Boton tipo="guardar" textoBoton={t('guardar')} onClick={() => handleGuardar()} />
        </div>
    );
};
export default Index;

import React from 'react';

// helper para extraer filename de Content-Disposition (puedes reutilizar la versión que ya tienes)
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
    setPlantillaMemoriaEu: (v: File[]) => void
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
};

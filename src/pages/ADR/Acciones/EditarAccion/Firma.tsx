import { forwardRef, useEffect, useState } from 'react';
import { Boton } from '../../../../components/Utils/utils';
import { useTranslation } from 'react-i18next';
import { LlamadaBBDDFirma, LlamadaArbolArchivos } from '../../../../components/Utils/data/YearData/dataGestionPlanMemoria';
import { Nodo, BuscarNodo, TransformarArchivosAFile } from '../../../../components/Utils/data/YearData/yearDataTransformData';
import { AdjuntarArchivos } from '../../../../components/Utils/inputs';
import { useRegionContext } from '../../../../contexts/RegionContext';
import { useYear } from '../../../../contexts/DatosAnualContext';
import { LoadingOverlayPersonalizada } from '../../../Configuracion/Users/componentes';
import { useEstadosPorAnio } from '../../../../contexts/EstadosPorAnioContext';
import { ArchivoBodyParams, LlamarDescargarArchivo, RutasArchivos } from '../../../../components/Utils/data/utilsData';

export const PestanaFirma = forwardRef<HTMLButtonElement>(() => {
    const { t } = useTranslation();
    const [firma, setFirma] = useState<File[]>([]);
    const { regionSeleccionada, nombreRegionSeleccionada } = useRegionContext();
    const { yearData, datosEditandoAccion } = useYear();
    const { editarPlan } = useEstadosPorAnio();

    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);

    const [nombreArchivo, setNombreArchivo] = useState<string[]>([]);

    const handleGuardarFirma = async () => {
        await LlamadaBBDDFirma({
            regionSeleccionada,
            anioSeleccionada: yearData.year,
            setLoading: setLoading,
            message: {
                setErrorMessage,
                setSuccessMessage,
            },
            body: firma[0],
            onSuccess: () => {},
        });
    };

    const cambiarNombreArchivo = () => {
        setNombreArchivo([]);
        for (let index = 0; index < firma.length; index++) {
            const original = firma[index];
            const name = `A8${yearData.year}${datosEditandoAccion.accion}${nombreRegionSeleccionada}${index > 0 ? index : ''}.pdf`;
            const renamed = new File([original], name.trim(), { type: original.type, lastModified: original.lastModified });
            setFirma((prevFirma) => {
                const updatedFirma = [...prevFirma];
                updatedFirma[index] = renamed;
                return updatedFirma;
            });
            setNombreArchivo((prev) => [...prev, renamed.name]);
        }
    };

    useEffect(() => {
        LlamadaArbolArchivos({
            regionSeleccionada,
            anioSeleccionada: yearData.year,
            setLoading,
            message: { setErrorMessage, setSuccessMessage },
            onSuccess: (response) => {
                const datosRecibidos: Nodo = response.data;
                const archivoFirma: Nodo = BuscarNodo(datosRecibidos, 'Firma');
                if (archivoFirma.RutaRelativa === 'Firma') {
                    const fileRaiz = TransformarArchivosAFile(archivoFirma);
                    if (fileRaiz.length > 0) {
                        setFirma(fileRaiz);
                    }
                }
            },
        });
    }, []);

    const handleClick = (nombreArchivo: string, index: number, url: string) => {
        let ruta: RutasArchivos = index > 0 ? 'Plan/Anexos' : 'Plan';
        if (url === 'Firma') {
            ruta = 'Firma';
        }
        const body: ArchivoBodyParams = {
            NombreArchivo: nombreArchivo,
            RegionId: `${regionSeleccionada}`,
            RutaArchivo: ruta,
            Year: `${yearData.year}`,
        };

        LlamarDescargarArchivo({
            message: { setErrorMessage, setSuccessMessage },
            body: body,
            setLoading,
            ruta: 'yearData/archivosADR/descargar',
        });
    };
    useEffect(() => {
        if (!firma || firma.length === 0) return;

        if (nombreArchivo.length !== firma.length || !nombreArchivo.every((name, index) => name === firma[index].name)) {
            cambiarNombreArchivo();
        }
    }, [firma]);

    return (
        <>
            <section className="panel p-4 shadow-sm">
                <LoadingOverlayPersonalizada
                    isLoading={loading}
                    message={{
                        successMessage,
                        setSuccessMessage,
                        errorMessage,
                        setErrorMessage,
                    }}
                    timeDelay={false}
                />

                {editarPlan && (
                    <div className="flex justify-center">
                        <Boton
                            tipo="guardar"
                            disabled={firma.length === 0}
                            textoBoton={`${t('descargarFirmaVacia')}`}
                            onClick={() => {
                                const link = document.createElement('a');
                                link.href = '/Anexo8.pdf';
                                link.download = 'Anexo8.pdf';
                                document.body.appendChild(link);
                                link.click();
                                document.body.removeChild(link);
                            }}
                        />
                    </div>
                )}

                <AdjuntarArchivos files={firma} setFiles={setFirma} tipoArchivosAceptables="PDF" multiple={true} disabled={!editarPlan} borrar={editarPlan} />

                {/* {!editarPlan && ( */}
                <div className="flex justify-center">
                    <Boton tipo="guardar" disabled={firma.length === 0} textoBoton={`${t('descargar')}`} onClick={() => handleClick(firma[0].name, 0, 'Firma')} />
                </div>
                {/* )} */}

                {editarPlan && (
                    <div className="flex justify-center">
                        <Boton tipo="guardar" disabled={firma.length === 0} textoBoton={`${t('enviar')} ${t('firma')}`} onClick={handleGuardarFirma} />
                    </div>
                )}
            </section>
        </>
    );
});

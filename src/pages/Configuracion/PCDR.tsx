import { useEffect, useState } from 'react';
import { AdjuntarArchivos } from '../../components/Utils/inputs';
import { useTranslation } from 'react-i18next';
import { LoadingOverlayPersonalizada, ZonaTitulo } from './Users/componentes';
import { Boton } from '../../components/Utils/utils';
import { LlamadaBBDDSubirPCDR, LlamadaBBDDVerPCDR } from '../../components/Utils/data/configuracionData/DataPCDR';
import { useRegionContext } from '../../contexts/RegionContext';
import IconDownloand from '../../components/Icon/IconDownloand.svg';
import { ArchivoBodyParams, LlamadaBBDDBorrarArchivo, LlamarDescargarArchivo } from '../../components/Utils/data/utilsData';
import { useUser } from '../../contexts/UserContext';

const Index = () => {
    const { t } = useTranslation();
    const [archivosPCDR, setArchivosPCDR] = useState<File[]>([]);
    const { regionSeleccionada } = useRegionContext();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const { rol } = useUser();

    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [archivos, setArchivos] = useState<string[]>([]);

    const [loading, setLoading] = useState<boolean>(false);

    useEffect(() => {
        if (regionSeleccionada) {
            handleCargarFicheros();
        }
    }, [regionSeleccionada]);

    const handleCargarFicheros = async () => {
        LlamadaBBDDVerPCDR(
            regionSeleccionada,
            {
                setErrorMessage,
                setSuccessMessage,
            },
            setLoading,
            (response) => {
                const datosRecibidos: { archivos: string[] } = response.data;
                setArchivos(datosRecibidos.archivos);
            }
        );
    };
    if (!regionSeleccionada) {
        return <span className="text-sm text-gray-600">{t('seleccioneRegion')}</span>;
    }
    const handleGuardarFicheros = async () => {
        const archivos: File[] = [...archivosPCDR];
        await LlamadaBBDDSubirPCDR(
            regionSeleccionada,
            archivos,
            {
                setErrorMessage,
                setSuccessMessage,
            },
            setLoading,
            // eslint-disable-next-line no-unused-vars, @typescript-eslint/no-unused-vars
            (response) => {
                handleCargarFicheros();
                setArchivosPCDR([]);
            }
        );
    };

    const handleClick = (nombreArchivo: string) => {
        const body: ArchivoBodyParams = {
            NombreArchivo: nombreArchivo,
            RegionId: `${regionSeleccionada}`,
            RutaArchivo: '',
        };

        LlamarDescargarArchivo({
            message: { setErrorMessage, setSuccessMessage },
            body: body,
            setLoading,
            ruta: 'pcdr/descargar',
        });
    };

    const handleEliminar = (nombreArchivo: string) => {
        const body: ArchivoBodyParams = {
            NombreArchivo: nombreArchivo,
            RegionId: `${regionSeleccionada}`,
            RutaArchivo: '',
        };

        LlamadaBBDDBorrarArchivo({
            message: { setErrorMessage, setSuccessMessage },
            body: body,
            setLoading,
            ruta: 'pcdr/delete',
            onSuccess() {
                setArchivos((prevArchivos) => prevArchivos.filter((archivo) => archivo !== nombreArchivo));
            },
        });
    };

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>{t('PCDR')}</span>
                    </h2>
                }
            />
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

            <div className="panel w-full max-w-lg mx-auto mt-8 bg-white rounded shadow p-6">
                <h2 className="text-xl font-bold mb-4">{t('adjuntarAnexos', { zona: t('archivoPCDR') })}</h2>
                <ul className="space-y-3 ">
                    {archivos.map((archivo, idx) => (
                        <li
                            key={archivo}
                            className={`flex items-center justify-between p-3 rounded transition hover:bg-gray-100 ${hoveredIndex === idx ? 'bg-gray-100' : ''}`}
                            onMouseEnter={() => setHoveredIndex(idx)}
                            onMouseLeave={() => setHoveredIndex(null)}
                        >
                            <div className="flex items-center space-x-3">
                                <img src={IconDownloand} alt="PDF" className="w-6 h-6 text-red-500" style={{ minWidth: 24, minHeight: 24 }} />
                                <span className="font-medium">{archivo}</span>
                            </div>
                            <div className="flex">
                                {rol === 'ADR' && (
                                    <button type="button" className="ml-2 text-red-500 hover:text-red-700 p-3" onClick={() => handleEliminar(archivo)} aria-label={`Eliminar archivo ${archivo}`}>
                                        ❌
                                    </button>
                                )}
                                <a download className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-800 transition" onClick={() => handleClick(archivo)}>
                                    <button className="w-20 h-5 mr-2" style={{ minWidth: 20, minHeight: 20 }}>
                                        {t('descargar')}
                                    </button>
                                </a>
                            </div>
                        </li>
                    ))}
                    {rol === 'ADR' && (
                        <>
                            <section className="panel p-4 shadow-sm">
                                <AdjuntarArchivos files={archivosPCDR} setFiles={setArchivosPCDR} multiple={true} />
                            </section>
                            <Boton tipo="guardar" textoBoton={t('enviar')} onClick={handleGuardarFicheros} />
                        </>
                    )}
                </ul>
            </div>
        </div>
    );
};
export default Index;

import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { LoadingOverlay, ZonaTitulo } from '../../Configuracion/Users/componentes';
import { AdjuntarArchivos } from '../../../components/Utils/inputs';
import { useLocation, useNavigate } from 'react-router-dom';
import { useYear } from '../../../contexts/DatosAnualContext';
import { Aviso, Boton } from '../../../components/Utils/utils';
import { StatusColors, useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../../contexts/RegionContext';
import { LlamadaArbolArchivos, LlamadaBBDDEnviarArchivoPlanConAnexos } from '../../../components/Utils/data/YearData/dataGestionPlanMemoria';
import { Nodo, TransformarArchivosAFile } from '../../../components/Utils/data/YearData/yearDataTransformData';

const Index = () => {
    const navigate = useNavigate();
    const { anioSeleccionada, editarPlan } = useEstadosPorAnio();
    const { regionSeleccionada } = useRegionContext();

    const { t } = useTranslation();
    const { yearData, setYearData } = useYear();
    const [planFiles, setPlanFiles] = useState<File[]>([]);
    const [planAnexos, setPlanAnexos] = useState<File[]>([]);

    const location = useLocation();
    const pantalla = location.state?.pantalla || '';
    const txtPantalla = pantalla === 'Plan' ? 'el plan' : 'la memoria';
    const tipo = pantalla === 'Memoria' ? 'memoria' : 'plan';

    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const [loadingGuardado, setLoadingGuardado] = useState<boolean>(false);
    const [guardado, setGuardado] = useState<boolean>(false);

    function renombrarFile(file: File, nuevoNombre: string): File {
        return new File([file], nuevoNombre, { type: file.type });
    }

    const planFilesRenombrados: File[] = planFiles.map((file) => {
        const extension = file.name.split('.').pop();
        return renombrarFile(file, `${tipo}.${extension}`);
    });

    const handleGuardarFicheros = async () => {
        const archivos: File[] = [...planFilesRenombrados, ...planAnexos];
        await LlamadaBBDDEnviarArchivoPlanConAnexos({
            regionSeleccionada,
            anioSeleccionada: yearData.year,
            setLoading: setLoadingGuardado,
            message: {
                setErrorMessage,
                setSuccessMessage,
            },
            body: archivos,
            planOMemoria: pantalla,
            onSuccess: () => {
                if (yearData[tipo].status === 'proceso') {
                    return;
                }
                setYearData({
                    ...yearData,
                    [tipo]: {
                        ...yearData[tipo],
                        status: 'proceso',
                    },
                });
                setGuardado(true);
            },
        });
    };

    useEffect(() => {
        if (yearData[tipo].status === 'borrador') {
            if (regionSeleccionada && yearData.year) {
                LlamadaArbolArchivos({
                    regionSeleccionada,
                    anioSeleccionada: yearData.year,
                    setLoading,
                    message: { setErrorMessage, setSuccessMessage },
                    tipoPantalla: pantalla,
                    onSuccess: (response) => {
                        const datosRecibidos: Nodo = response.data;
                        const archivos: File[] = TransformarArchivosAFile(datosRecibidos);
                        if (archivos && archivos.length > 0) {
                            setPlanFiles([archivos[0]]);
                            setPlanAnexos(archivos.slice(1));
                        }
                    },
                });
            }
        }
    }, []);

    return (
        <div className="panel">
            <LoadingOverlay
                isLoading={loading}
                message={{
                    successMessage,
                    setSuccessMessage,
                    errorMessage,
                    setErrorMessage,
                }}
                timeDelay={false}
            />
            <LoadingOverlay
                isLoading={loadingGuardado}
                message={{
                    successMessage,
                    setSuccessMessage,
                    errorMessage,
                    setErrorMessage,
                }}
                timeDelay={false}
                onComplete={() => {
                    if (guardado) {
                        if (tipo === 'plan') {
                            navigate('/adr/planesGestion');
                        } else if (tipo === 'memoria') {
                            navigate('/adr/memoriasAnuales');
                        }
                    }
                }}
            />
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>
                            {pantalla === 'Plan' ? t('planTitulo') : t('memoriaTitulo')} {anioSeleccionada}
                        </span>
                        <span className={pantalla === 'Plan' ? `${StatusColors[yearData.plan.status]}` : `${StatusColors[yearData.memoria.status]}`}>
                            {pantalla === 'Plan' ? t(yearData.plan.status) : t(yearData.memoria.status)}
                        </span>
                    </h2>
                }
                zonaExplicativa={
                    <>
                        <span>{t('enviadoNoSePodraEditar', { txtPantalla: txtPantalla })}</span>
                        <span>{t('asegurateAntesPdfCorrecto')}</span>
                    </>
                }
            />
            {/* {mostrandoModal && (
                <ModalSave onClose={() => setMostrandoModal(false)} nav={pantalla === 'Plan' ? '/adr/planesGestion' : '/adr/memoriasAnuales'}>
                    {async () => {
                        handleGuardarFicheros();
                    }}
                </ModalSave>
            )} */}
            <div className="flex justify-center items-center">
                <div className="panel w-2/4">
                    <section className="panel p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2 text-xl">{pantalla === 'plan' ? t('archivosPdf') : t('archivoPdf')}</h3>
                        <AdjuntarArchivos files={planFiles} setFiles={setPlanFiles} title={t('archivoCorrespondiente', { zona: pantalla === 'Plan' ? 'al plan' : 'a la memoria' })} />
                    </section>

                    <section className="panel p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2 text-xl">{t('adjuntarAnexos', { zona: txtPantalla })}</h3>
                        <AdjuntarArchivos files={planAnexos} setFiles={setPlanAnexos} multiple={true} />
                    </section>

                    <div className="panel p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2 text-xl">{t('finalizarYEnviar', { zona: txtPantalla })}</h3>
                        {(pantalla === 'Plan' ? planFiles.length != 1 : planFiles.length != 1) && <Aviso textoAviso={t('faltanArchivosObligatorios')} />}
                        {pantalla !== 'Plan' && editarPlan && <Aviso textoAviso={t('faltanEnviarAntesPlan')} />}
                        <div className="flex justify-center">
                            <Boton
                                tipo="guardar"
                                textoBoton={t('finalizar', { zona: txtPantalla })}
                                disabled={pantalla === 'Plan' ? planFiles.length != 1 : editarPlan || planFiles.length != 1}
                                onClick={handleGuardarFicheros}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;

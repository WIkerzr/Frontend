import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ZonaTitulo } from '../../Configuracion/componentes';
import { StatusColors, useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { AdjuntarArchivos } from '../../../components/Utils/inputs';
import IconInfoCircle from '../../../components/Icon/IconInfoCircle';
import { useLocation } from 'react-router-dom';
import { useYear } from '../../../contexts/DatosAnualContext';

const Index = () => {
    const { anio } = useEstadosPorAnio();
    const { t } = useTranslation();
    const { yearData } = useYear();
    const [planAnexos, setPlanAnexos] = useState<File[]>([]);
    const [planFiles, setPlanFiles] = useState<File[]>([]);

    const location = useLocation();
    const pantalla = location.state?.pantalla || '';
    const txtPantalla = pantalla === 'Plan' ? 'el plan' : 'la memoria';

    const handleAnexosFilesChange = (files: File[]) => {
        setPlanAnexos(files);
    };
    const handlePlanFilesChange = (files: File[]) => {
        setPlanFiles(files);
    };

    //Todo
    const pcdrFiles = [1, 2];

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>
                            {pantalla === 'Plan' ? t('planTitulo') : t('memoriaTitulo')} {anio}
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
            <div className="flex justify-center items-center">
                <div className="panel w-2/4">
                    <section className="panel p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2 text-xl">{pantalla === 'plan' ? t('archivosPdf') : t('archivoPdf')}</h3>
                        <AdjuntarArchivos
                            files={planFiles}
                            setFiles={setPlanFiles}
                            onChange={handlePlanFilesChange}
                            title={t('archivoCorrespondiente', { zona: pantalla === 'Plan' ? 'al plan' : 'a la memoria' })}
                        />
                    </section>

                    <section className="panel p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2 text-xl">{t('adjuntarAnexos', { zona: txtPantalla })}</h3>
                        <AdjuntarArchivos files={planAnexos} setFiles={setPlanAnexos} onChange={handleAnexosFilesChange} multiple={true} />
                    </section>

                    <div className="panel p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2 text-xl">{t('finalizarYEnviar', { zona: txtPantalla })}</h3>
                        {(pantalla === 'Plan' ? planFiles.length != 1 || pcdrFiles.length != 1 : planFiles.length != 1) && (
                            <div className="bg-warning text-black text-sm rounded px-3 py-2 mb-4 flex items-center gap-2 justify-center">
                                <IconInfoCircle />
                                <span>
                                    <strong>{t('aviso')}:</strong> {t('faltanArchivosObligatorios')}
                                </span>
                            </div>
                        )}
                        <div className="flex justify-center">
                            <button
                                disabled={pantalla === 'Plan' ? planFiles.length != 1 || pcdrFiles.length != 1 : planFiles.length != 1}
                                className="px-4 py-2 bg-primary text-white rounded flex items-center justify-center font-medium h-10 min-w-[120px]"
                            >
                                {t('finalizar', { zona: txtPantalla })}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;

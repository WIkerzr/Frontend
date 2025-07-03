import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { ZonaTitulo } from '../../Configuracion/componentes';
import { StatusColors, useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { AdjuntarArchivos } from '../../../components/Utils/inputs';
import IconInfoCircle from '../../../components/Icon/IconInfoCircle';

const Index = () => {
    const { anio, estados } = useEstadosPorAnio();
    const { t } = useTranslation();
    const [planAnexos, setPlanAnexos] = useState<File[]>([]);
    const [planFiles, setPlanFiles] = useState<File[]>([]);
    const [pcdrFiles, setPcdrFiles] = useState<File[]>([]);

    const handleAnexosFilesChange = (files: File[]) => {
        setPlanAnexos(files);
    };
    const handlePlanFilesChange = (files: File[]) => {
        setPlanFiles(files);
    };
    const handlePcdrFilesChange = (files: File[]) => {
        setPcdrFiles(files);
    };
    useEffect(() => {
        console.log(planAnexos);
        console.log(planFiles);
        console.log(pcdrFiles);
    }, [pcdrFiles]);
    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>{t('planTitulo')} 2025</span>
                        <span className={`${StatusColors[estados[anio]?.plan]}`}>{t(estados[anio]?.plan)}</span>
                    </h2>
                }
                zonaExplicativa={
                    <>
                        <span>Una vez enviado el Plan, no podrá ser editado a menos que Hazi lo permita.</span>
                        <span>Asegurate antes que toda la información se ha introducido correctamente en los PDF antes de enviarlo.</span>
                    </>
                }
            />
            <div className="flex justify-center items-center">
                <div className="panel w-2/4">
                    <section className="panel p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2 text-xl">Archivos PDF obligatorios</h3>
                        <AdjuntarArchivos files={planFiles} setFiles={setPlanFiles} onChange={handlePlanFilesChange} title={t('archivoPlan')} />
                        <AdjuntarArchivos files={pcdrFiles} setFiles={setPcdrFiles} onChange={handlePcdrFilesChange} title={t('archivoPCDR')} />
                    </section>

                    <section className="panel p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2 text-xl">Adjuntar anexos del Plan</h3>
                        <AdjuntarArchivos files={planAnexos} setFiles={setPlanAnexos} onChange={handleAnexosFilesChange} multiple={true} />
                    </section>

                    <div className="panel p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2 text-xl">Finalizar y enviar el Plan</h3>
                        {(planFiles.length != 1 || pcdrFiles.length != 1) && (
                            <div className="bg-warning text-black text-sm rounded px-3 py-2 mb-4 flex items-center gap-2 justify-center">
                                <IconInfoCircle />
                                <span>
                                    <strong>{t('aviso')}:</strong> Faltan los archivos obligatorios.
                                </span>
                            </div>
                        )}
                        <div className="flex justify-center">
                            <button
                                disabled={planFiles.length != 1 || pcdrFiles.length != 1}
                                className="px-4 py-2 bg-primary text-white rounded flex items-center justify-center font-medium h-10 min-w-[120px]"
                            >
                                Finalizar Plan
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;

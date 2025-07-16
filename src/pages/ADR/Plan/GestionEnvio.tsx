import { useTranslation } from 'react-i18next';
import { useState } from 'react';
import { ZonaTitulo } from '../../Configuracion/componentes';
import { StatusColors, useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { AdjuntarArchivos } from '../../../components/Utils/inputs';
import { useLocation } from 'react-router-dom';
import { useYear } from '../../../contexts/DatosAnualContext';
import { Aviso, Boton, ModalSave } from '../../../components/Utils/utils';

const Index = () => {
    const { anio, editarPlan } = useEstadosPorAnio();

    const { t } = useTranslation();
    const { yearData, setYearData } = useYear();
    const [planAnexos, setPlanAnexos] = useState<File[]>([]);
    const [planFiles, setPlanFiles] = useState<File[]>([]);
    const [mostrandoModal, setMostrandoModal] = useState(false);

    const location = useLocation();
    const pantalla = location.state?.pantalla || '';
    const txtPantalla = pantalla === 'Plan' ? 'el plan' : 'la memoria';

    const handleAnexosFilesChange = (files: File[]) => {
        setPlanAnexos(files);
    };
    const handlePlanFilesChange = (files: File[]) => {
        setPlanFiles(files);
    };

    const handleGuardarFicheros = () => {
        //TODO llamada
        if (pantalla === 'Plan') {
            if (yearData.plan.status === 'proceso') {
                return;
            }
            setYearData({
                ...yearData,
                plan: {
                    ...yearData.plan,
                    status: 'proceso',
                },
            });
        } else if (pantalla === 'Memoria') {
            if (yearData.memoria.status === 'proceso') {
                return;
            }
            setYearData({
                ...yearData,
                memoria: {
                    ...yearData.memoria,
                    status: 'proceso',
                },
            });
        }
    };

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
            {mostrandoModal && (
                <ModalSave onClose={() => setMostrandoModal(false)} nav={pantalla === 'Plan' ? '/adr/planesGestion' : '/adr/memoriasAnuales'}>
                    {async () => {
                        handleGuardarFicheros();
                    }}
                </ModalSave>
            )}
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
                        {(pantalla === 'Plan' ? planFiles.length != 1 : planFiles.length != 1) && <Aviso textoAviso={t('faltanArchivosObligatorios')} />}
                        {pantalla !== 'Plan' && editarPlan && <Aviso textoAviso={t('faltanEnviarAntesPlan')} />}
                        <div className="flex justify-center">
                            <Boton
                                tipo="guardar"
                                textoBoton={t('finalizar', { zona: txtPantalla })}
                                disabled={pantalla === 'Plan' ? planFiles.length != 1 : editarPlan || planFiles.length != 1}
                                onClick={() => setMostrandoModal(true)}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;

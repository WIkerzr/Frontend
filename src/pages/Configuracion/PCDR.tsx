import { useState } from 'react';
import { AdjuntarArchivos, isImage } from '../../components/Utils/inputs';
import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from './componentes';

const Index = () => {
    const { t } = useTranslation();
    const [pcdrFiles, setPcdrFiles] = useState<File[]>([]);
    const [planAnexos, setPlanAnexos] = useState<File[]>([]);

    const handlePcdrFilesChange = (files: File[]) => {
        setPcdrFiles(files);
    };
    const handleAnexosFilesChange = (files: File[]) => {
        setPlanAnexos(files);
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
            <div className="w-2/4 mx-auto">
                {pcdrFiles.length === 0 ? (
                    <section className="panel p-4 shadow-sm">
                        <h3 className="font-semibold text-gray-700 mb-2 text-xl">{t('adjuntarAnexos', { zona: t('archivoPCDR') })}</h3>
                        <AdjuntarArchivos files={pcdrFiles} setFiles={setPcdrFiles} onChange={handlePcdrFilesChange} />
                    </section>
                ) : (
                    pcdrFiles.map((file, idx) => (
                        <div key={file.name + idx} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                            {isImage(file) ? (
                                <img
                                    src={URL.createObjectURL(file)}
                                    alt={file.name}
                                    className="w-12 h-12 object-cover rounded"
                                    onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)}
                                />
                            ) : (
                                <span className="text-lg">📄</span>
                            )}
                            <span className="flex-1 text-sm truncate">{file.name}</span>
                            <button
                                type="button"
                                className="ml-2 text-red-500 hover:text-red-700"
                                onClick={() => {
                                    const newFiles = pcdrFiles.filter((_, i) => i !== idx);
                                    setPcdrFiles(newFiles);
                                    handlePcdrFilesChange(newFiles);
                                }}
                                aria-label={`Eliminar archivo ${file.name}`}
                            >
                                ❌
                            </button>
                        </div>
                    ))
                )}
                <section className="panel p-4 shadow-sm">
                    <h3 className="font-semibold text-gray-700 mb-2 text-xl">{t('adjuntarAnexos', { zona: t('PCDR') })}</h3>
                    <AdjuntarArchivos files={planAnexos} setFiles={setPlanAnexos} onChange={handleAnexosFilesChange} multiple={true} />
                </section>
            </div>
        </div>
    );
};
export default Index;

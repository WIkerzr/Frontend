import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { LlamadasBBDD } from '../../components/Utils/data/utilsData';
import { LoadingOverlayPersonalizada } from './Users/componentes';
import { AdjuntarArchivos } from '../../components/Utils/inputs';

// interface BotonNuevoAnioProps {
//     setLoading: (loading: boolean) => void;
//     setSuccessMessage: (message: string) => void;
//     setErrorMessage: (message: string) => void;
// }

// const BotonNuevoAnio: React.FC<BotonNuevoAnioProps> = (props) => {
//     const { setLoading, setSuccessMessage, setErrorMessage } = props;
//     const { t } = useTranslation();

//     const [btnAnioNew, setBtnAnioNew] = useState<boolean>(false);
//     useEffect(() => {
//         const aniosRegion = sessionStorage.getItem('aniosRegion');
//         if (aniosRegion) {
//             const aniosParsed = JSON.parse(aniosRegion) as { RegionId: number; Years: number[] }[];
//             const aniosMax = Math.max(...aniosParsed.flatMap((region) => region.Years));
//             const currentYear = new Date().getFullYear();
//             if (aniosMax === currentYear) {
//                 setBtnAnioNew(true);
//             }
//         }
//     }, []);

//     const handleNuevoAnio = async () => {
//         LlamadasBBDD({
//             method: 'PUT',
//             url: `nuevoYear`,
//             setLoading,
//             setSuccessMessage,
//             setErrorMessage,
//         });
//     };
//     return <Boton tipo="guardar" disabled={!btnAnioNew} textoBoton={`${t('GenerarAnio')}`} onClick={handleNuevoAnio} />;
// };

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

    useEffect(() => {
        if (plantillaPlanEs.length > 0 && plantillaPlanEu.length > 0 && plantillaMemoriaEs.length > 0 && plantillaMemoriaEu.length > 0) return;
        LlamadasBBDD({
            method: 'GET',
            url: `plantillas`,
            setLoading,
            setErrorMessage,
            setSuccessMessage,
        });
    }, []);

    useEffect(() => {
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
    }, [plantillaPlanEs, plantillaPlanEu, plantillaMemoriaEs, plantillaMemoriaEu]);

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
        </div>
    );
};
export default Index;

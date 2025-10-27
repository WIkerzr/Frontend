/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LlamadasBBDD } from '../../components/Utils/data/utilsData';
import { Boton } from '../../components/Utils/utils';
import { LoadingOverlayPersonalizada } from './Users/componentes';
// import { useEstadosPorAnioContext } from '../../contexts/EstadosPorAnioContext';

interface BotonNuevoAnioProps {
    setLoading: (loading: boolean) => void;
    setSuccessMessage: (message: string) => void;
    setErrorMessage: (message: string) => void;
}

const BotonNuevoAnio: React.FC<BotonNuevoAnioProps> = (props) => {
    const { setLoading, setSuccessMessage, setErrorMessage } = props;
    const { t } = useTranslation();
    // const { setAnios } = useEstadosPorAnioContext();

    const [btnAnioNew, setBtnAnioNew] = useState<boolean>(false);
    useEffect(() => {
        const aniosRegion = sessionStorage.getItem('aniosRegion');
        if (aniosRegion) {
            const aniosParsed = JSON.parse(aniosRegion) as { RegionId: number; Years: number[] }[];
            const aniosMax = Math.max(...aniosParsed.flatMap((region) => region.Years));
            const aniosMin = Math.min(...aniosParsed.flatMap((region) => region.Years));
            if (aniosMax === aniosMin) {
                setBtnAnioNew(true);
            }
        }
    }, []);

    const handleNuevoAnio = async () => {
        if (window.confirm(t('confirmarAnadirAnio', { year: new Date().getFullYear() + 1 }))) {
            const body = {
                FromYear: new Date().getFullYear(),
                ToYear: new Date().getFullYear() + 1,
            };
            LlamadasBBDD({
                method: 'POST',
                url: `nuevoYear`,
                body: body,
                setLoading,
                setSuccessMessage,
                setErrorMessage,
            });

            alert('Por favor, cierre sesión y vuelva a iniciar sesión para ver los cambios.');
            // setAnios([...Anios, new Date().getFullYear() + 1]);
        }
    };
    return <Boton tipo="guardar" disabled={!btnAnioNew} textoBoton={`${t('GenerarAnio')}`} onClick={handleNuevoAnio} />;
};
const Index = () => {
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    return (
        <div className="flex flex-col gap-4 panel items-center justify-center">
            <LoadingOverlayPersonalizada isLoading={loading} message={{ successMessage, setSuccessMessage, errorMessage, setErrorMessage }} />
            <BotonNuevoAnio setLoading={setLoading} setErrorMessage={setErrorMessage} setSuccessMessage={setSuccessMessage} />
        </div>
    );
};
export default Index;

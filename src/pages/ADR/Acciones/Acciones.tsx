import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../../Configuracion/Users/componentes';
import { useYear } from '../../../contexts/DatosAnualContext';
import { useNavigate } from 'react-router-dom';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { ListadoAcciones, ModalAccion } from './ComponentesAccionesServicios';

interface ModalAvisoProps {
    isOpen: boolean;
    onClose: () => void;
    mensaje: string;
}
const ModalAviso: React.FC<ModalAvisoProps> = ({ isOpen, onClose, mensaje }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
                <h2 className="text-lg font-semibold mb-4">Aviso</h2>
                <p className="mb-6">{mensaje}</p>
                <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                    {t('Cerrar')}
                </button>
            </div>
        </div>
    );
};

const Index: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { yearData, errorMessage, successMessage, selectedId, SeleccionVaciarEditarAccion } = useYear();
    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();

    const navigate = useNavigate();
    const ejesPrioritarios = yearData.plan.ejesPrioritarios;
    const ejesSeleccionados = ejesPrioritarios.slice(0, 3);

    useEffect(() => {
        SeleccionVaciarEditarAccion();
    }, []);

    if (!(ejesPrioritarios.length > 0 && ejesPrioritarios.length <= 3)) {
        return <ModalAviso isOpen={true} mensaje={t('error:errorFaltEjesPrioritarios')} onClose={() => navigate('/adr/ejes')} />;
    }

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>
                            {t('listadoAcciones')} {anioSeleccionada}
                        </span>
                    </h2>
                }
                zonaBtn={<ModalAccion acciones="acciones" />}
                zonaExplicativa={
                    (editarPlan || editarMemoria) && (
                        <>
                            <span>{t('explicacionAccion')}</span>
                            <span>{t('explicacionAccionParte2')}</span>
                        </>
                    )
                }
            />

            <div className="w-full mx-auto mt-1 px-2">
                <div className="flex items-start  w-full h-100%">
                    {ejesSeleccionados.map((eje, index) => {
                        return (
                            <div key={eje.Id} className="flex flex-col flex-1 items-center justify-center p-1">
                                {selectedId === eje.Id && (
                                    <>
                                        {successMessage && (
                                            <div className={`mt-4 transition-opacity duration-1000 opacity-100}`}>
                                                <p className="text-green-500">{successMessage}</p>
                                            </div>
                                        )}
                                        {errorMessage && (
                                            <div>
                                                <span className="text-red-500 hover:text-red-700">{errorMessage}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                <ListadoAcciones eje={i18n.language === 'es' ? eje.NameEs : eje.NameEu} idEje={eje.Id} number={index} />
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default Index;

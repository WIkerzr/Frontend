import React from 'react';
import { ListadoAcciones, ModalAccion } from './Componentes';
import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../Configuracion/componentes';
import { useEstadosPorAnio } from '../../contexts/EstadosPorAnioContext';
import { useYear } from '../../contexts/DatosAnualContext';

const Index: React.FC = () => {
    const { yearData } = useYear();
    const ejesPrioritarios = yearData.plan.ejesPrioritarios;
    const { t, i18n } = useTranslation();
    const { anio } = useEstadosPorAnio();

    const ejesSeleccionados = ejesPrioritarios.slice(0, 3);

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>
                            {t('listadoAcciones')} {anio}
                        </span>
                    </h2>
                }
                zonaBtn={<ModalAccion />}
                zonaExplicativa={<span>{t('explicacionAccion')}</span>}
            />
            <div className="w-full mx-auto mt-1 px-2">
                <div className="flex items-start w-full h-100%">
                    {ejesSeleccionados.map((eje, index) => (
                        <div key={eje.id} className="flex flex-col flex-1 items-center justify-center p-1">
                            <ListadoAcciones eje={i18n.language === 'es' ? eje.nameEs : eje.nameEu} idEje={eje.id} number={index} />
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};
export default Index;

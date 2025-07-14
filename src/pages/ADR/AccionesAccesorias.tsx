import React from 'react';
import { ModalAccion, MostrarAvisoCampos } from './Componentes';
import { ZonaTitulo } from '../Configuracion/componentes';
import { useEstadosPorAnio } from '../../contexts/EstadosPorAnioContext';
import { useYear } from '../../contexts/DatosAnualContext';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import IconEye from '../../components/Icon/IconEye';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';

export const listAcciones = [
    { id: 1, texto: 'Capacitación en buenas prácticas agrícolas' },
    { id: 2, texto: 'Campaña de sensibilización sobre reciclaje' },
    { id: 7, texto: 'Promoción del comercio local sostenible' },
    { id: 8, texto: 'Curso de ahorro energético en hogares' },
    { id: 9, texto: 'Feria de productos ecológicos' },
    { id: 10, texto: 'Campaña de reducción de plásticos' },
    { id: 11, texto: 'Proyecto de huertos urbanos' },
    { id: 12, texto: 'Seminario de igualdad de género' },
];

const Index: React.FC = () => {
    const { anio } = useEstadosPorAnio();
    const { t } = useTranslation();
    const { yearData } = useYear();

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
            />
            <div className="w-full mx-auto mt-1 px-2">
                <div className="flex items-start w-full h-100%">
                    {yearData.accionesAccesorias?.map((accion) => {
                        const editable = true;
                        return (
                            <div key={accion.id} className="flex flex-col flex-1 items-center justify-center p-1">
                                <div key={accion.id} className={`border border-gray-200 p-6 shadow-sm rounded-lg hover:shadow-md transition-shadow flex flex-col`}>
                                    <span className="text-base">{accion.accion}</span>
                                    <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                        {t('LineaActuaccion')}: {accion.lineaActuaccion}
                                    </span>
                                    <div className="flex gap-2 justify-end mt-2">
                                        <NavLink to="/adr/acciones/editando" className="group">
                                            <button className="hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-1.5 rounded transition">{editable ? <IconPencil /> : <IconEye />}</button>
                                        </NavLink>
                                        <div>
                                            {editable === true && (
                                                <button
                                                    //onClick={() => handleDelete(accion.id)}
                                                    aria-label={`Eliminar acción ${accion.id}`}
                                                    className="hover:bg-blue-50 text-gray-500 hover:text-red-600 p-1.5 rounded transition"
                                                >
                                                    <IconTrash />
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                    <MostrarAvisoCampos datos={accion} />
                                </div>
                            </div>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};
export default Index;

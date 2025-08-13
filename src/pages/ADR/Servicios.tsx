import React, { useEffect, useState } from 'react';
import { useYear } from '../../contexts/DatosAnualContext';
import IconTrash from '../../components/Icon/IconTrash';
import { NavLink } from 'react-router-dom';
import IconPencil from '../../components/Icon/IconPencil';
import IconEye from '../../components/Icon/IconEye';
import { ZonaTitulo } from '../Configuracion/componentes';
import { useTranslation } from 'react-i18next';
import { Servicios } from '../../types/GeneralTypes';
import { MostrarAvisoCamposServicios } from './Componentes';
import { Boton } from '../../components/Utils/utils';
import { servicioIniciadoVacio } from '../../types/tipadoPlan';
import { useEstadosPorAnio } from '../../contexts/RegionEstadosContext';

const Index: React.FC = () => {
    const { anio, editarPlan, editarMemoria } = useEstadosPorAnio();
    const { t } = useTranslation();
    const { yearData, setYearData, setDatosEditandoServicio, SeleccionVaciarEditarAccion } = useYear();
    const [serviciosGrup, setServiciosGrup] = useState<Servicios[][]>([]);

    useEffect(() => {
        SeleccionVaciarEditarAccion();
        setServiciosGrup(grup5(yearData.servicios || [], 4));
    }, []);

    const handleDelete = (id: number) => {
        const servicio = yearData.servicios?.filter((item) => item.id === id);
        if (window.confirm(t('confirmacion', { p1: t('eliminar'), p2: `\n${t('Servicio')} ${servicio![0].nombre}`, p3: '' }).trim())) {
            setYearData({
                ...yearData,
                servicios: yearData.servicios?.filter((item) => item.id !== id) || [],
            });
        }
    };

    function grup5<T>(array: T[], size: number): T[][] {
        return array.reduce<T[][]>((acc, _, index) => {
            if (index % size === 0) {
                acc.push(array.slice(index, index + size));
            }
            return acc;
        }, []);
    }
    useEffect(() => {
        setServiciosGrup(grup5(yearData.servicios || [], 4));
    }, [yearData]);

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
                zonaBtn={
                    editarPlan && (
                        <NavLink to="/adr/servicios/editando" state={{ tipo: 'servicio' }} className="group">
                            <Boton tipo="guardar" textoBoton={t('anadirServicio')} onClick={() => setDatosEditandoServicio(servicioIniciadoVacio)} />
                        </NavLink>
                    )
                }
                // zonaExplicativa={(editarPlan || editarMemoria) && <></>}
            />
            <div className="w-full mx-auto mt-1 px-2">
                {serviciosGrup.map((fila: Servicios[], filaIndex: number) => (
                    <div key={filaIndex} className="flex w-full justify-start mb-4 gap-4 flex-wrap">
                        {fila.map((servicio: Servicios) => {
                            const editable = editarPlan && editarMemoria;
                            return (
                                <div key={servicio.id} className="flex-1 max-w-[25%] min-w-[180px] border border-gray-200 p-6 shadow-sm rounded-lg hover:shadow-md transition-shadow flex flex-col">
                                    <span className="text-base">{servicio.nombre}</span>
                                    <div className="flex gap-2 justify-end mt-2">
                                        <NavLink to="/adr/accionesYproyectos/editando" state={{ tipo: 'servicio' }} className="group">
                                            <button className="hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-1.5 rounded transition" onClick={() => setDatosEditandoServicio(servicio)}>
                                                {editable ? <IconPencil /> : <IconEye />}
                                            </button>
                                        </NavLink>
                                        {editable && (
                                            <button
                                                aria-label={`Eliminar acción ${servicio.id}`}
                                                className="hover:bg-blue-50 text-gray-500 hover:text-red-600 p-1.5 rounded transition"
                                                onClick={() => handleDelete(servicio.id)}
                                            >
                                                <IconTrash />
                                            </button>
                                        )}
                                    </div>
                                    <MostrarAvisoCamposServicios datos={servicio} />
                                </div>
                            );
                        })}
                    </div>
                ))}
            </div>
        </div>
    );
};
export default Index;

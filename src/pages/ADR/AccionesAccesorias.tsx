import React, { useEffect, useState } from 'react';
import { ModalAccionAccesorias, MostrarAvisoCamposAcciones } from './Componentes';
import { ZonaTitulo } from '../Configuracion/componentes';
import { useYear } from '../../contexts/DatosAnualContext';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import IconEye from '../../components/Icon/IconEye';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import { DatosAccion } from '../../types/TipadoAccion';
import { useEstadosPorAnio } from '../../contexts/RegionEstadosContext';

const Index: React.FC = () => {
    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const { t } = useTranslation();
    const { yearData, setYearData, SeleccionEditarAccionAccesoria, SeleccionVaciarEditarAccion } = useYear();
    const [accionesGrup, setAccionesGrup] = useState<DatosAccion[][]>([]);

    useEffect(() => {
        SeleccionVaciarEditarAccion();
        setAccionesGrup(grup5(yearData.accionesAccesorias || [], 4));
    }, []);

    const handleDelete = (id: string) => {
        const accionAccesoria = yearData.accionesAccesorias?.filter((item) => item.id === String(id));
        if (window.confirm(t('confirmacion', { p1: t('eliminar'), p2: `\n${t('Eje')}: ${accionAccesoria![0].ejeEs}`, p3: `\n${t('Accion')}: ${accionAccesoria![0].accion}` }).trim())) {
            setYearData({
                ...yearData,
                accionesAccesorias: yearData.accionesAccesorias?.filter((item) => item.id !== String(id)) || [],
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
        setAccionesGrup(grup5(yearData.accionesAccesorias || [], 4));
    }, [yearData]);

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
                zonaBtn={<ModalAccionAccesorias />}
                // zonaExplicativa={(editarPlan || editarMemoria) && <></>}
            />
            <div className="w-full mx-auto mt-1 px-2">
                {accionesGrup.map((fila: DatosAccion[], filaIndex: number) => (
                    <div key={filaIndex} className="flex w-full justify-start mb-4 gap-4 flex-wrap">
                        {fila.map((accion: DatosAccion) => {
                            const editable = editarPlan && editarMemoria;
                            return (
                                <div key={accion.id} className="flex-1 max-w-[25%] min-w-[180px] border border-gray-200 p-6 shadow-sm rounded-lg hover:shadow-md transition-shadow flex flex-col">
                                    <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                        {t('Eje')}: {yearData.plan.ejes.find((item) => item.Id === accion.ejeId)?.NameEs}
                                    </span>
                                    <span className="text-base">{accion.accion}</span>
                                    <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                        {t('LineaActuaccion')}: {accion.lineaActuaccion}
                                    </span>
                                    <div className="flex gap-2 justify-end mt-2">
                                        <NavLink to="/adr/accionesYproyectos/editando" state={{ tipo: 'accesoria' }} className="group">
                                            <button className="hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-1.5 rounded transition" onClick={() => SeleccionEditarAccionAccesoria(accion.id)}>
                                                {editable ? <IconPencil /> : <IconEye />}
                                            </button>
                                        </NavLink>
                                        {editable && (
                                            <button
                                                aria-label={`Eliminar acción ${accion.id}`}
                                                className="hover:bg-blue-50 text-gray-500 hover:text-red-600 p-1.5 rounded transition"
                                                onClick={() => handleDelete(accion.id)}
                                            >
                                                <IconTrash />
                                            </button>
                                        )}
                                    </div>
                                    <MostrarAvisoCamposAcciones datos={accion} navegar="/adr/accionesYproyectos/editando" />
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

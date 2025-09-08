import React, { useEffect, useState } from 'react';
import { ZonaTitulo } from '../../Configuracion/Users/componentes';
import { useYear } from '../../../contexts/DatosAnualContext';
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import IconEye from '../../../components/Icon/IconEye';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrash from '../../../components/Icon/IconTrash';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { DatosAccion } from '../../../types/TipadoAccion';
import { ModalAccion, MostrarAvisoCamposAcciones } from './ComponentesAccionesServicios';
import { EstadosLoading } from '../../../types/GeneralTypes';
import { LlamadaBBDDEjesRegion } from '../../../components/Utils/data/dataEjes';
import { useRegionContext } from '../../../contexts/RegionContext';

const Index: React.FC = () => {
    const navigate = useNavigate();
    const { regionSeleccionada } = useRegionContext();
    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const { t, i18n } = useTranslation();
    const { yearData, setYearData, SeleccionEditarAccion, SeleccionVaciarEditarAccion } = useYear();
    const [accionesGrup, setAccionesGrup] = useState<DatosAccion[][]>([]);
    const [loading, setLoading] = useState<EstadosLoading>('idle');

    useEffect(() => {
        SeleccionVaciarEditarAccion();

        const data = yearData.plan.ejes.flatMap((eje) =>
            eje.acciones.map((accion) => ({
                ...accion,
                ejeId: eje.Id,
            }))
        );

        setAccionesGrup(grup5(data, 4));
    }, [yearData]);

    useEffect(() => {
        if (loading === 'success') {
            navigate('/adr/acciones/editando');
        }
    }, [loading]);

    const handleDelete = (id: string) => {
        const data = yearData.plan.ejes.flatMap((eje) => eje.acciones);
        const accionAccesoria = data.find((item) => item.id === String(id));

        if (
            accionAccesoria &&
            window.confirm(
                t('confirmacion', {
                    p1: t('eliminar'),
                    p2: `\n${t('Eje')}: ${accionAccesoria.ejeEs}`,
                    p3: `\n${t('Accion')}: ${accionAccesoria.accion}`,
                }).trim()
            )
        ) {
            setYearData({
                ...yearData,
                accionesAccesorias: data.filter((item) => item.id !== String(id)),
            });
        }
    };

    const handleEdit = async (accion: DatosAccion) => {
        setLoading('loading');
        const ejesRegion = localStorage.getItem('ejesRegion');

        if (accion.ejeId) {
            await SeleccionEditarAccion(accion.ejeId, accion.id);
        }
        if (!ejesRegion) {
            await LlamadaBBDDEjesRegion(regionSeleccionada, t, i18n);
        }

        setLoading('success');
    };

    function grup5<T>(array: T[], size: number): T[][] {
        return array.reduce<T[][]>((acc, _, index) => {
            if (index % size === 0) {
                acc.push(array.slice(index, index + size));
            }
            return acc;
        }, []);
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
                zonaBtn={<ModalAccion acciones={'AccionesAccesorias'} />}
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
                                            <button className="hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-1.5 rounded transition" onClick={() => handleEdit(accion)}>
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
                                    <MostrarAvisoCamposAcciones datos={accion} />
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

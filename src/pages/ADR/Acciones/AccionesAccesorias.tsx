import React, { useEffect, useRef, useState } from 'react';
import { LoadingOverlay, ZonaTitulo } from '../../Configuracion/Users/componentes';
import { useYear } from '../../../contexts/DatosAnualContext';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import IconEye from '../../../components/Icon/IconEye';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrash from '../../../components/Icon/IconTrash';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { DatosAccion } from '../../../types/TipadoAccion';
import { ModalAccion, MostrarAvisoCamposAcciones } from './ComponentesAccionesServicios';
import { LlamadaBBDDEjesRegion } from '../../../components/Utils/data/dataEjes';
import { useRegionContext } from '../../../contexts/RegionContext';
import { Ejes } from '../../../types/tipadoPlan';
import { TextoSegunIdioma } from '../../../components/Utils/utils';

const Index: React.FC = () => {
    const navigate = useNavigate();
    const { regionSeleccionada } = useRegionContext();
    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const { t, i18n } = useTranslation();
    const { yearData, EliminarAccion, datosEditandoAccion, SeleccionEditarAccion, SeleccionVaciarEditarAccion } = useYear();
    const [accionesGrup, setAccionesGrup] = useState<DatosAccion[][]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [navigated, setNavigated] = useState<boolean>(false);

    function grup5<T>(array: T[], size: number): T[][] {
        return array.reduce<T[][]>((acc, _, index) => {
            if (index % size === 0) {
                acc.push(array.slice(index, index + size));
            }
            return acc;
        }, []);
    }

    const hasNavigated = useRef(false);
    useEffect(() => {
        SeleccionVaciarEditarAccion();
        setNavigated(true);
    }, []);

    useEffect(() => {
        // Solo navega si datosEditandoAccion.id no es 0
        if (hasNavigated.current) return;
        if (navigated && !hasNavigated.current && datosEditandoAccion && datosEditandoAccion.id !== '0') {
            navigate('/adr/acciones/editando', {
                state: {
                    tipo: 'accesoria',
                    ejeId: datosEditandoAccion.ejeId,
                    nombreEjeES: datosEditandoAccion.ejeEs,
                    nombreEjeEU: datosEditandoAccion.ejeEu,
                },
            });
            hasNavigated.current = true;
        }
    }, [datosEditandoAccion, navigate]);

    useEffect(() => {
        if (hasNavigated.current) return;
        const ejesRestantes = yearData.plan.ejesRestantes;
        if (!ejesRestantes) {
            return;
        }
        const ejesFiltrados: Ejes[] | undefined = ejesRestantes.filter((r) => r.IsAccessory === true);

        if (!ejesFiltrados) {
            return;
        }
        const data = ejesFiltrados.flatMap((eje) =>
            eje.acciones.map((accion) => ({
                ...accion,
                ejeId: eje.Id,
            }))
        );
        setAccionesGrup(grup5(data, 4));
    }, [yearData]);
    if (hasNavigated.current) return;

    const handleDelete = (id: string, idEje: string | undefined) => {
        const data = yearData.plan.ejesRestantes!.flatMap((eje) => eje.acciones);
        const accionAccesoria = data.find((item) => String(item.id) === String(id));

        if (!idEje) {
            console.log('Sin idEje');

            return;
        }
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
            EliminarAccion('AccionesAccesorias', idEje, id);
        }
    };

    const handleEdit = async (accion: DatosAccion) => {
        setLoading(true);
        const ejes = JSON.parse(sessionStorage.getItem('ejesRegion') || '{}');
        const ejesRegion = ejes.ejesEstrategicos;

        if (accion.ejeId) {
            await SeleccionEditarAccion(accion.ejeId, 'accesoria', accion.id, { setErrorMessage, setSuccessMessage }, setLoading);
        }
        if (!ejesRegion) {
            await LlamadaBBDDEjesRegion(regionSeleccionada, t, i18n, { setErrorMessage, setSuccessMessage });
        }
    };

    return (
        <div className="panel">
            <LoadingOverlay
                isLoading={loading}
                message={{
                    successMessage,
                    setSuccessMessage,
                    errorMessage,
                    setErrorMessage,
                }}
                timeDelay={false}
            />
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>
                            {t('listadoAcciones')} {anioSeleccionada}
                        </span>
                    </h2>
                }
                zonaBtn={editarPlan ? <ModalAccion acciones={'AccionesAccesorias'} /> : <></>}
                // zonaExplicativa={(editarPlan || editarMemoria) && <></>}
            />
            <div className="w-full mx-auto mt-1 px-2">
                {accionesGrup.map((fila: DatosAccion[], filaIndex: number) => (
                    <div key={filaIndex} className="flex w-full justify-start mb-4 gap-4 flex-wrap">
                        {fila.map((accion: DatosAccion) => {
                            const editable = editarPlan || editarMemoria;
                            return (
                                <div key={accion.id} className="flex-1 max-w-[25%] min-w-[180px] border border-gray-200 p-6 shadow-sm rounded-lg hover:shadow-md transition-shadow flex flex-col">
                                    <span className="text-base">{accion.accion}</span>
                                    <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                        {t('Eje')}: {TextoSegunIdioma(accion.ejeEs, accion.ejeEu)}
                                    </span>
                                    <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                        {t('LineaActuaccion')}: {accion.lineaActuaccion}
                                    </span>
                                    <div className="flex gap-2 justify-end mt-2">
                                        <button className="hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-1.5 rounded transition" onClick={() => handleEdit(accion)}>
                                            {editable ? <IconPencil /> : <IconEye />}
                                        </button>
                                        {editable && (
                                            <button
                                                aria-label={`Eliminar acción ${accion.id}`}
                                                className="hover:bg-blue-50 text-gray-500 hover:text-red-600 p-1.5 rounded transition"
                                                onClick={() => handleDelete(accion.id, accion.ejeId)}
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

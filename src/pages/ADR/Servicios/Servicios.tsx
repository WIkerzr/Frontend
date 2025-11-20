import React, { useEffect, useState } from 'react';

import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import IconEye from '../../../components/Icon/IconEye';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrash from '../../../components/Icon/IconTrash';
import { ErrorMessage } from '../../../components/Utils/animations';
import { eliminarServicio } from '../../../components/Utils/data/dataServices';
import { Boton, formateaConCeroDelante } from '../../../components/Utils/utils';
import { useYear } from '../../../contexts/DatosAnualContext';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../../contexts/RegionContext';
import { Servicios } from '../../../types/GeneralTypes';
import { servicioIniciadoVacio } from '../../../types/tipadoPlan';
import { LoadingOverlayPersonalizada, ZonaTitulo } from '../../Configuracion/Users/componentes';
import { ModalServicio, MostrarAvisoCamposServicios } from './ComponentesServicios';
import { ejeGeneralServicios } from './EditarServicios';

const Index: React.FC = () => {
    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const { t, i18n } = useTranslation();
    const { yearData, setYearData, setDatosEditandoServicio, SeleccionVaciarEditarAccion } = useYear();
    const [serviciosGrup, setServiciosGrup] = useState<Servicios[][]>([]);
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [loading, setLoading] = useState<boolean>(false);
    const { regionSeleccionada, nombreRegionSeleccionada, regiones } = useRegionContext();

    useEffect(() => {
        SeleccionVaciarEditarAccion();
    }, []);

    const [regionesDuplicadas, setRegionesDuplicadas] = useState<{ id: string; regionId: string }[]>([]);
    useEffect(() => {
        const todosServicios = yearData?.servicios ?? [];
        const ids = todosServicios
            .map((a) => a.ServicioDuplicadaDeId)
            .map((id) => (id == null ? '' : String(id)))
            .filter((id) => id !== '' && id !== '0');

        const idsUnicos = Array.from(new Set(ids));

        const mapped = idsUnicos.map((id) => {
            const match = todosServicios.find((s) => String(s.id) === id);
            let regionId = '';
            if (match) {
                const lider = match.serviciosCompartidas?.regionLider;
                if (lider != null) {
                    regionId = typeof lider === 'object' ? String(lider.RegionId) : String(lider);
                }
            }
            return { id, regionId };
        });

        setRegionesDuplicadas(mapped);
    }, [yearData]);

    useEffect(() => {
        if (!yearData.servicios) return;

        const serviciosOrdenados = [...yearData.servicios].sort((a, b) => a.id - b.id);
        const serviciosFiltrados = serviciosOrdenados.filter((servicio) => !regionesDuplicadas.some((r) => r.id === formateaConCeroDelante(String(servicio.id))));
        setServiciosGrup(grup5(serviciosFiltrados, 4));
    }, [yearData, regionesDuplicadas]);

    const handleDelete = async (id: number) => {
        const servicio = yearData.servicios?.filter((item) => item.id === id);
        if (window.confirm(t('confirmacion', { p1: t('eliminar'), p2: `\n${t('Servicio')} ${servicio![0].nombre}`, p3: '' }).trim())) {
            const ok = await eliminarServicio({
                idServicio: id,
                setLoading,
                setSuccessMessage,
                setErrorMessage,
            });
            if (ok) {
                setYearData({
                    ...yearData,
                    servicios: yearData.servicios?.filter((item) => item.id !== id) || [],
                });
            }
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

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>
                            {t('listadoServicios')} {anioSeleccionada}
                        </span>
                    </h2>
                }
                zonaBtn={
                    editarPlan && (
                        <NavLink to="/adr/servicios/editando" state={{ tipo: 'servicio' }} className="group">
                            <Boton tipo="guardar" textoBoton={t('anadirServicio')} onClick={() => setDatosEditandoServicio({ ...servicioIniciadoVacio })} />
                        </NavLink>
                    )
                }
                // zonaExplicativa={(editarPlan || editarMemoria) && <></>}
            />
            {successMessage && (
                <div className={`mt-4 transition-opacity duration-1000 opacity-100}`}>
                    <p className="text-green-500">{successMessage}</p>
                </div>
            )}
            <div>{errorMessage && <ErrorMessage message={errorMessage} />}</div>

            <LoadingOverlayPersonalizada isLoading={loading} message={{ successMessage, setSuccessMessage, errorMessage, setErrorMessage }} />

            <div className="w-full mx-auto mt-1 px-2">
                {serviciosGrup.map((fila: Servicios[], filaIndex: number) => (
                    <div key={filaIndex} className="flex w-full justify-start mb-4 gap-4 flex-wrap">
                        {fila.map((servicio: Servicios) => {
                            let editable = editarPlan || editarMemoria;
                            let nombreEje = '';
                            let esServicioParticipante = false;
                            let esServicioLider = false;
                            let esDuplicado = false;
                            let nombreRegionLider = '';

                            if (servicio.idEje === 'general') {
                                nombreEje = i18n.language === 'eu' ? ejeGeneralServicios.NameEu : ejeGeneralServicios.NameEs;
                            } else {
                                const eje = yearData.plan.ejes.find((e) => e.Id == servicio.idEje);
                                nombreEje = i18n.language === 'eu' ? eje?.NameEu ?? '' : eje?.NameEs ?? '';
                            }

                            if (servicio.serviciosCompartidas?.regionLider) {
                                const regionLider = formateaConCeroDelante(`${servicio.serviciosCompartidas.regionLider.RegionId}`) === regionSeleccionada;
                                if (regionLider) {
                                    editable = editable ? true : false;
                                    esServicioParticipante = false;
                                    esServicioLider = true;
                                }
                                const regionCooperando = servicio.serviciosCompartidas.regiones?.some((region) => formateaConCeroDelante(`${region.RegionId}`) === regionSeleccionada);
                                if (regionCooperando) {
                                    editable = false;
                                    esServicioParticipante = true;
                                    esServicioLider = false;
                                }
                            }
                            if (servicio.ServicioDuplicadaDeId) {
                                editable = editable ? true : false;
                                esDuplicado = true;
                                const dupId = String(servicio.ServicioDuplicadaDeId);
                                // buscar en regionesDuplicadas por id (acepta raw o formateado)
                                const match = regionesDuplicadas.find((r) => r.id === dupId || r.id === formateaConCeroDelante(dupId));
                                nombreRegionLider = match?.regionId ?? '';
                            }
                            if (nombreRegionLider && !isNaN(Number(nombreRegionLider))) {
                                nombreRegionLider = esDuplicado
                                    ? i18n.language === 'es'
                                        ? regiones.find((r) => String(r.RegionId) === nombreRegionLider)?.NameEs ?? nombreRegionLider
                                        : regiones.find((r) => String(r.RegionId) === nombreRegionLider)?.NameEu ?? nombreRegionLider
                                    : i18n.language === 'es'
                                    ? servicio.serviciosCompartidas?.regionLider?.NameEs ?? ''
                                    : servicio.serviciosCompartidas?.regionLider?.NameEu ?? '';
                            }
                            return (
                                <div
                                    key={servicio.id}
                                    className={`relative flex-1 max-w-[25%] min-w-[180px] border border-gray-200 px-6 py-8 shadow-sm rounded-lg hover:shadow-md transition-shadow flex flex-col bg-white`}
                                >
                                    {esServicioLider && <span className="badge badge-outline-dark text-xs absolute top-0.5 right-2">{t('txtsupracomarcal')}</span>}
                                    {(esServicioLider || esServicioParticipante || esDuplicado) &&
                                        (() => {
                                            return (
                                                <span className="badge badge-outline-dark text-xs absolute top-0.5 right-2">
                                                    {esServicioParticipante || esDuplicado ? t('supracomarcalGestionada', { tipo: nombreRegionLider }) : t('txtsupracomarcal')}
                                                </span>
                                            );
                                        })()}
                                    <span className="text-base">{servicio.nombre}</span>
                                    <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                        {t('Eje')}: {nombreEje}
                                    </span>
                                    {servicio.lineaActuaccion && (
                                        <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                            {t('LineaActuaccion')}: {servicio.lineaActuaccion}
                                        </span>
                                    )}
                                    {servicio.serviciosCompartidas?.regiones?.some((region) => formateaConCeroDelante(`${region.RegionId}`) === regionSeleccionada) && (
                                        <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                            {t('servicioAdministrador')}: {servicio.serviciosCompartidas?.regionLider?.NameEs}
                                        </span>
                                    )}
                                    <div className="flex gap-2 justify-end mt-2">
                                        <NavLink to="/adr/servicios/editando" state={{ tipo: 'servicio' }} className="group">
                                            <button className="hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-1.5 rounded transition" onClick={() => setDatosEditandoServicio({ ...servicio })}>
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
                                    {esServicioParticipante && editarPlan && (
                                        <ModalServicio
                                            file={servicio}
                                            button={(open) => {
                                                return (
                                                    <div className="w-full flex flex-col text-warning bg-warning-light dark:bg-warning-dark-light p-3.5">
                                                        <p>
                                                            {t('supracomarcalIncorporarAccion_part1', { region: nombreRegionLider, participant: nombreRegionSeleccionada })}{' '}
                                                            <span onClick={() => open()} style={{ color: 'blue', textDecoration: 'underline', cursor: 'pointer' }}>
                                                                {t('Aqui')}
                                                            </span>{' '}
                                                            {t('supracomarcalIncorporarAccion_part2')}
                                                        </p>
                                                    </div>
                                                );
                                            }}
                                        />
                                    )}
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

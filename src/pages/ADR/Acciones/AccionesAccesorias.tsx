import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import IconEye from '../../../components/Icon/IconEye';
import IconPencil from '../../../components/Icon/IconPencil';
import IconTrash from '../../../components/Icon/IconTrash';
import { LlamadaBBDDEjesRegion } from '../../../components/Utils/data/dataEjes';
import { formateaConCeroDelante, TextoSegunIdioma } from '../../../components/Utils/utils';
import { useYear } from '../../../contexts/DatosAnualContext';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../../contexts/RegionContext';
import { DatosAccion } from '../../../types/TipadoAccion';
import { Ejes } from '../../../types/tipadoPlan';
import { LoadingOverlayPersonalizada, ZonaTitulo } from '../../Configuracion/Users/componentes';
import { ModalAccion, MostrarAvisoCamposAcciones } from './ComponentesAccionesServicios';
const Index: React.FC = () => {
    const navigate = useNavigate();
    const { regionSeleccionada, nombreRegionSeleccionada, regiones } = useRegionContext();
    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const { t, i18n } = useTranslation();
    const { yearData, EliminarAccion, datosEditandoAccion, SeleccionEditarAccion, SeleccionVaciarEditarAccion, LoadingYearData } = useYear();
    const [accionesGrup, setAccionesGrup] = useState<DatosAccion[][]>([]);

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [navigated, setNavigated] = useState<boolean>(false);

    const [regionesDuplicadas, setRegionesDuplicadas] = useState<{ id: string; regionId: string }[]>([]);
    useEffect(() => {
        if (yearData.plan.ejesRestantes) {
            const ejesRestantes = yearData?.plan?.ejesRestantes ?? [];
            const todasAcciones = ejesRestantes.flatMap((eje) => eje.acciones ?? []);
            const ids = todasAcciones
                .map((a) => a.accionDuplicadaDeId)
                .map((id) => (id == null ? '' : String(id)))
                .filter((id) => id !== '' && id !== '0');

            const idsUnicos = Array.from(new Set(ids));
            setRegionesDuplicadas(idsUnicos.map((id) => ({ id, regionId: '' })));
        }
    }, [yearData]);

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
        hasNavigated.current = false;
        return () => {
            hasNavigated.current = false;
        };
    }, [anioSeleccionada]);

    useEffect(() => {
        if (hasNavigated.current) return;
        if (navigated && !hasNavigated.current && datosEditandoAccion && datosEditandoAccion.id !== '0') {
            navigate('/adr/accionesYproyectos/editando', {
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
        const ejesRestantes = yearData.plan.ejesRestantes;
        if (!ejesRestantes) {
            setAccionesGrup([]);
            return;
        }
        const ejesFiltrados: Ejes[] | undefined = ejesRestantes.filter((r) => r.IsAccessory === true);

        if (!ejesFiltrados) {
            setAccionesGrup([]);
            return;
        }
        const data = ejesFiltrados.flatMap((eje) =>
            eje.acciones.map((accion) => ({
                ...accion,
                ejeId: eje.Id,
            }))
        );

        const dataFiltrado = data.filter((accion) => !regionesDuplicadas.some((r) => r.id === String(accion.id)));
        setAccionesGrup(grup5(dataFiltrado, 4));
    }, [yearData, anioSeleccionada, regionesDuplicadas]);

    const handleDelete = (id: string, idEje: string | undefined) => {
        const data = yearData.plan.ejesRestantes!.flatMap((eje) => eje.acciones);
        const accionAccesoria = data.find((item) => String(item.id) === String(id));

        if (!idEje) return;
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
    if (accionesGrup.length === 0) return;
    return (
        <div className="panel">
            <LoadingOverlayPersonalizada
                isLoading={loading}
                message={{
                    successMessage,
                    setSuccessMessage,
                    errorMessage,
                    setErrorMessage,
                }}
                timeDelay={false}
            />
            <LoadingYearData />
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
                            let editable = editarPlan || editarMemoria;
                            let esAccionLider = false;
                            let esAccionParticipante = false;
                            let esAccionDuplicada = false;
                            let nombreRegion = '';

                            if (accion.accionCompartida?.regionLider) {
                                const regionLider = formateaConCeroDelante(
                                    typeof accion.accionCompartida.regionLider === 'object' ? accion.accionCompartida.regionLider.RegionId : accion.accionCompartida.regionLider
                                );
                                if (regionLider === regionSeleccionada) {
                                    editable = editable ? true : false;
                                    esAccionParticipante = false;
                                    esAccionLider = true;
                                }

                                if (regionLider != regionSeleccionada) {
                                    editable = false;
                                    esAccionParticipante = true;
                                    esAccionLider = false;
                                    const regionEncontrada2 = regiones.find((reg) => String(reg.RegionId).padStart(2, '0') === String(regionLider));
                                    nombreRegion = regionEncontrada2 ? (i18n.language === 'es' ? regionEncontrada2.NameEs : regionEncontrada2.NameEu) : '';
                                }
                            }
                            if (accion.accionDuplicadaDeId) {
                                const dupId = String(accion.accionDuplicadaDeId);
                                const found = yearData?.plan?.ejesRestantes?.flatMap((e) => e.acciones ?? []).find((a) => String(a.id) === dupId);
                                if (found) {
                                    esAccionDuplicada = true;
                                    const lider = found.accionCompartida?.regionLider;
                                    nombreRegion = lider != null ? (typeof lider === 'object' ? String(lider.RegionId) : String(lider)) : '';
                                    const regionEncontrada = regiones.find((reg) => String(reg.RegionId).padStart(2, '0') === `${nombreRegion}`);
                                    nombreRegion = regionEncontrada ? (i18n.language === 'es' ? regionEncontrada.NameEs : regionEncontrada.NameEu) : '';
                                }
                                if (!nombreRegion) {
                                    const regionLiderObj = accion.regionesAccionDuplicada?.find((rad) => String(rad?.Id) === '0')?.RegionId;
                                    const regionEncontrada = regiones.find((reg) => String(reg.RegionId).padStart(2, '0') === `${regionLiderObj}`);
                                    nombreRegion = regionEncontrada ? (i18n.language === 'es' ? regionEncontrada.NameEs : regionEncontrada.NameEu) : '';
                                }
                            }
                            return (
                                <div
                                    key={accion.id}
                                    className={`'bg-white' relative flex-1 max-w-[25%] min-w-[180px] border border-gray-200 px-6 py-8 shadow-sm rounded-lg hover:shadow-md transition-shadow flex flex-col`}
                                >
                                    {(esAccionLider || esAccionParticipante || esAccionDuplicada) &&
                                        (() => {
                                            return (
                                                <span className="badge badge-outline-dark text-xs absolute top-0.5 right-2">
                                                    {nombreRegion || esAccionParticipante ? t('supracomarcalGestionada', { tipo: nombreRegion }) : t('txtsupracomarcal')}
                                                </span>
                                            );
                                        })()}
                                    <span className="text-base">{accion.accion}</span>
                                    <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                        {t('Eje')}: {TextoSegunIdioma(accion.ejeEs, accion.ejeEu)}
                                    </span>
                                    <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                        {t('LineaActuaccion')}: {accion.lineaActuaccion}
                                    </span>
                                    {accion.accionCompartida?.regiones?.some((region) => formateaConCeroDelante(`${region.RegionId}`) === regionSeleccionada) && (
                                        <span className="block text-sm text-gray-500 text-left font-medium mb-1">
                                            {t('accionPropietaria')}: {accion.accionCompartida?.regionLider?.NameEs}
                                        </span>
                                    )}

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
                                    {esAccionParticipante && editarPlan && (
                                        <ModalAccion
                                            acciones={'AccionesAccesorias'}
                                            file={accion}
                                            button={(open) => {
                                                return (
                                                    <div className="w-full flex flex-col text-warning bg-warning-light dark:bg-warning-dark-light p-3.5">
                                                        <p>
                                                            {t('supracomarcalIncorporarAccion_part1', { region: nombreRegion, participant: nombreRegionSeleccionada })}{' '}
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
                                    <MostrarAvisoCamposAcciones datos={accion} tiposAccion="AccionesAccesorias" />
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

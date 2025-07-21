import 'tippy.js/dist/tippy.css';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { IndicadorRealizacion, IndicadorResultado } from '../../types/Indicadores';
import { Loading } from '../../components/Utils/animations';
import { useRegionContext } from '../../contexts/RegionContext';
import { ComodinFormatearCoincidenciasParaTabla, llamadaBBDDIndicadores, ModalNuevoIndicador, TablaIndicadores } from './componentesIndicadores';
import { actualizarFechaLLamada, obtenerFechaLlamada } from '../../components/Utils/utils';
import Tippy from '@tippyjs/react';
import IconRefresh from '../../components/Icon/IconRefresh';

const Index = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const { regionSeleccionada } = useRegionContext();

    const [indicadorRealizacion, setIndicadorRealizacion] = useState<IndicadorRealizacion[]>([]);
    const [indicadorResultado, setIndicadorResultado] = useState<IndicadorResultado[]>([]);
    const [modalNuevo, setModalNuevo] = useState(false);
    const [mensajeError, setMensajeError] = useState<string>('');
    const [fechaUltimoActualizadoBBDD, setFechaUltimoActualizadoBBDD] = useState<Date | null>(() => {
        const fechaStr = obtenerFechaLlamada('indicadores');
        return fechaStr ? new Date(fechaStr) : null;
    });

    const filtrarPorAdr = (indicadores: IndicadorRealizacion[]): IndicadorRealizacion[] => {
        if (regionSeleccionada) {
            return indicadores.filter((indicador) => String(indicador.RegionsId) === String(regionSeleccionada));
        }
        return [];
    };

    const [estadoLlamadaBBDDFinalizada, setEstadoLlamadaBBDDFinalizada] = useState(false);
    const llamarBBDD = () => {
        llamadaBBDDIndicadores({
            setMensajeError,
            setIndicadorRealizacion,
            setIndicadorResultado,
            setFechaUltimoActualizadoBBDD,
            t,
        }).then(() => {
            setEstadoLlamadaBBDDFinalizada(true);
        });
    };

    useEffect(() => {
        if (estadoLlamadaBBDDFinalizada) {
            const indicadoresRealizacionRegionSeleccionada = filtrarPorAdr(indicadorRealizacion);
            const indicadoresResultadoRegionSeleccionada = filtrarPorAdr(indicadorResultado);
            setIndicadorRealizacion(indicadoresRealizacionRegionSeleccionada);
            setIndicadorResultado(indicadoresResultadoRegionSeleccionada);
            setEstadoLlamadaBBDDFinalizada(false);
            setTimeout(() => {
                setLoading(false);
            }, 200);
        }
    }, [estadoLlamadaBBDDFinalizada]);

    function DatosEsRegionSeleccionada(storedRealizacion: string | null, storedResultado: string | null, indicadorPaso: number) {
        let paso = '';
        if (indicadorPaso === 1) {
            paso = 'Filtrado';
        } else if (indicadorPaso === 2) {
            paso = 'Original';
        }
        const noVacioRealizacion = storedRealizacion && storedRealizacion !== '[]';
        const noVacioResultado = storedResultado && storedResultado !== '[]';
        if (!noVacioRealizacion || !noVacioResultado) {
            console.warn(`${paso} Vacio`);
            return false;
        }
        const indicadoresRealizacion: IndicadorRealizacion[] = JSON.parse(storedRealizacion);
        if (indicadoresRealizacion.some((indicador) => String(indicador.RegionsId) === String(regionSeleccionada))) {
            const coincidencias = indicadoresRealizacion.filter((indicador) => String(indicador.RegionsId) === String(regionSeleccionada));
            console.warn(`${paso} PERFECT`);

            console.table(ComodinFormatearCoincidenciasParaTabla(coincidencias));
            return true;
        } else {
            console.warn(`${paso} Region incorrecta`);
            return false;
        }
    }

    function AsignarSetRegionDesdeLocalStorage(storedRealizacion: string, storedResultado: string) {
        const indicadoresRealizacion: IndicadorRealizacion[] = JSON.parse(storedRealizacion);
        const indicadoresResultado: IndicadorResultado[] = JSON.parse(storedResultado);
        const indicadoresRealizacionRegionSeleccionada = filtrarPorAdr(indicadoresRealizacion);
        const indicadoresResultadoRegionSeleccionada = filtrarPorAdr(indicadoresResultado);
        setIndicadorRealizacion(indicadoresRealizacionRegionSeleccionada);
        setIndicadorResultado(indicadoresResultadoRegionSeleccionada);
        localStorage.setItem('indicadoresRealizacionFiltrado', JSON.stringify(indicadoresRealizacionRegionSeleccionada));
        localStorage.setItem('indicadoresResultadoFiltrado', JSON.stringify(indicadoresResultadoRegionSeleccionada));
        setLoading(false);
    }

    useEffect(() => {
        setLoading(true);
        const storedRealizacionFiltrado = localStorage.getItem('indicadoresRealizacionFiltrado');
        const storedResultadoFiltrado = localStorage.getItem('indicadoresResultadoFiltrado');
        if (DatosEsRegionSeleccionada(storedRealizacionFiltrado, storedResultadoFiltrado, 1)) {
            AsignarSetRegionDesdeLocalStorage(storedRealizacionFiltrado!, storedResultadoFiltrado!);
        } else {
            const storedRealizacion = localStorage.getItem('indicadoresRealizacion');
            const storedResultado = localStorage.getItem('indicadoresResultado');
            if (DatosEsRegionSeleccionada(storedRealizacion, storedResultado, 2)) {
                AsignarSetRegionDesdeLocalStorage(storedRealizacion!, storedResultado!);
            } else {
                console.warn('Servidor');
                llamarBBDD();
            }
        }
    }, [regionSeleccionada]);

    useEffect(() => {
        actualizarFechaLLamada('indicadores');
    }, [fechaUltimoActualizadoBBDD]);

    return (
        <div className="flex w-full gap-5">
            {loading ? (
                <Loading />
            ) : (
                <div className="flex flex-col w-full">
                    <div className="flex flex-col justify-end mb-5 items-end">
                        {mensajeError ? (
                            <span className="ml-2 text-red-500 hover:text-red-700">{mensajeError}</span>
                        ) : (
                            <>
                                <button onClick={() => setModalNuevo(true)} className="btn btn-primary w-[300px]">
                                    Abrir modal nuevo indicador
                                </button>
                                <ModalNuevoIndicador
                                    isOpen={modalNuevo}
                                    onClose={() => setModalNuevo(false)}
                                    accion="Nuevo"
                                    onSave={(nuevoIndicadorRealizacion) => {
                                        setIndicadorRealizacion((prev) => [...prev, nuevoIndicadorRealizacion]);
                                        if (!nuevoIndicadorRealizacion.Resultados) {
                                            return;
                                        }
                                        const nuevosResultados = nuevoIndicadorRealizacion.Resultados.filter((nuevoRes) => !indicadorResultado.some((res) => res.Id === nuevoRes.Id));
                                        if (nuevosResultados.length > 0) {
                                            setIndicadorResultado((prev) => [...prev, ...nuevosResultados]);
                                        }
                                    }}
                                />
                            </>
                        )}
                    </div>
                    <div className="flex justify-end items-center space-x-2">
                        {fechaUltimoActualizadoBBDD && (
                            <div>
                                {new Date(fechaUltimoActualizadoBBDD).toLocaleString('es-ES', {
                                    dateStyle: 'medium',
                                    timeStyle: 'short',
                                })}
                            </div>
                        )}
                        <Tippy content={t('Actualizar')}>
                            <button type="button" onClick={llamarBBDD}>
                                <IconRefresh />
                            </button>
                        </Tippy>
                    </div>
                    <div className="flex flex-row justify-center mb-5 gap-5">
                        <TablaIndicadores
                            indicadorRealizacion={indicadorRealizacion}
                            indicadorResultado={indicadorResultado}
                            setIndicadorResultado={setIndicadorResultado}
                            setIndicadorRealizacion={setIndicadorRealizacion}
                        />
                    </div>
                </div>
            )}
        </div>
    );
};
export default Index;

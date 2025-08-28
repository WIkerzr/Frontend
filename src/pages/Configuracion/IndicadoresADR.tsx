import 'tippy.js/dist/tippy.css';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loading } from '../../components/Utils/animations';
import { ModalNuevoIndicador, TablaIndicadores } from './componentesIndicadores';
import Tippy from '@tippyjs/react';
import IconRefresh from '../../components/Icon/IconRefresh';
import { useIndicadoresContext } from '../../contexts/IndicadoresContext';
import { useUser } from '../../contexts/UserContext';
import { UserRole } from '../../types/users';
import { PrintFecha } from '../../components/Utils/utils';
import { indicadorInicial } from '../../types/Indicadores';
import { useRegionContext } from '../../contexts/RegionContext';

const Index = () => {
    const { t } = useTranslation();
    const {
        setIndicadoresRealizacionADR,
        indicadoresResultadoADR,
        setIndicadoresResultadoADR,
        mensajeError,
        fechaUltimoActualizadoBBDD,
        llamarIndicadoresBBDD,
        loading,
        setLoading,
        PrimeraLlamada,
        setIndicadorSeleccionado,
    } = useIndicadoresContext();
    const [modalNuevo, setModalNuevo] = useState(false);
    const [refres, setRefres] = useState(false);
    const { regionSeleccionada } = useRegionContext();
    const { user } = useUser();
    const role: UserRole = user!.role as UserRole;

    useEffect(() => {
        if (!regionSeleccionada) {
            return;
        }
        if (location.pathname === '/configuracion/indicadoresADR') {
            PrimeraLlamada(regionSeleccionada);
            setRefres(true);
        }
        if (!regionSeleccionada) {
            setLoading(false);
        }
    }, [location.pathname, regionSeleccionada]);

    useEffect(() => {
        if (!regionSeleccionada) {
            return;
        }
        const refrescar = async () => {
            if (refres) {
                setLoading(true);
                await llamarIndicadoresBBDD();
                setLoading(false);
                setRefres(false);
            }
        };
        refrescar();
    }, [refres]);
    if (!regionSeleccionada) {
        return;
    }
    return (
        <div className="flex w-full gap-5">
            {loading ? (
                <Loading />
            ) : (
                <div className="flex flex-col w-full">
                    {(role.toUpperCase() !== 'HAZI' || (role.toUpperCase() === 'HAZI' && regionSeleccionada != null)) && (
                        <div className="flex flex-col justify-end mb-5 items-end">
                            <>
                                <button
                                    onClick={() => {
                                        setModalNuevo(true);
                                        const indicadorConRegion = { ...indicadorInicial, RegionsId: regionSeleccionada ?? '' };
                                        setIndicadorSeleccionado({
                                            tipo: 'Realizacion',
                                            ADR: true,
                                            indicador: indicadorConRegion,
                                            accion: 'Crear',
                                        });
                                    }}
                                    className="btn btn-primary w-[300px]"
                                >
                                    {t('NuevoIndicador')}
                                </button>
                                {modalNuevo ? (
                                    <ModalNuevoIndicador
                                        isOpen={modalNuevo}
                                        onClose={() => setModalNuevo(false)}
                                        onSave={(nuevoIndicadorRealizacion) => {
                                            setIndicadoresRealizacionADR((prev) => [...prev, nuevoIndicadorRealizacion]);
                                            if (!nuevoIndicadorRealizacion.Resultados) {
                                                return;
                                            }
                                            const nuevosResultados = nuevoIndicadorRealizacion.Resultados.filter((nuevoRes) => !indicadoresResultadoADR.some((res) => res.Id === nuevoRes.Id));
                                            if (nuevosResultados.length > 0) {
                                                setIndicadoresResultadoADR((prev) => [...prev, ...nuevosResultados]);
                                            }
                                        }}
                                    />
                                ) : (
                                    <></>
                                )}
                            </>
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-2">
                        <div>{mensajeError && <span className="text-red-500 hover:text-red-700">{mensajeError}</span>}</div>

                        {regionSeleccionada && (
                            <div className="flex items-center space-x-2">
                                <PrintFecha date={fechaUltimoActualizadoBBDD} />
                                <Tippy content={t('Actualizar')}>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            llamarIndicadoresBBDD();
                                            setLoading(false);
                                        }}
                                    >
                                        <IconRefresh />
                                    </button>
                                </Tippy>
                            </div>
                        )}
                    </div>
                    <div className="flex flex-row justify-center mb-5 gap-5">
                        <TablaIndicadores />
                    </div>
                </div>
            )}
        </div>
    );
};
export default Index;

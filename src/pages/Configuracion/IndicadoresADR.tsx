import 'tippy.js/dist/tippy.css';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loading } from '../../components/Utils/animations';
import { ModalNuevoIndicador, TablaIndicadores } from './componentesIndicadores';
import Tippy from '@tippyjs/react';
import IconRefresh from '../../components/Icon/IconRefresh';
import { useIndicadoresContext } from '../../contexts/IndicadoresContext';
import { useRegionContext } from '../../contexts/RegionContext';
import { useUser } from '../../contexts/UserContext';
import { UserRole } from '../../types/users';

const Index = () => {
    const { t } = useTranslation();
    const { setIndicadoresRealizacionADR, indicadoresResultadoADR, setIndicadoresResultadoADR, mensajeError, fechaUltimoActualizadoBBDD, llamarBBDD, loading, setLoading, PrimeraLlamada } =
        useIndicadoresContext();
    const [modalNuevo, setModalNuevo] = useState(false);
    const { regionSeleccionada } = useRegionContext();
    const { user } = useUser();
    const role: UserRole = user!.role as UserRole;

    useEffect(() => {
        PrimeraLlamada();
    }, []);

    return (
        <div className="flex w-full gap-5">
            {loading ? (
                <Loading />
            ) : (
                <div className="flex flex-col w-full">
                    {(role.toUpperCase() !== 'HAZI' || (role.toUpperCase() === 'HAZI' && regionSeleccionada != null)) && (
                        <div className="flex flex-col justify-end mb-5 items-end">
                            <>
                                <button onClick={() => setModalNuevo(true)} className="btn btn-primary w-[300px]">
                                    {t('NuevoIndicador')}
                                </button>
                                <ModalNuevoIndicador
                                    origen="indicadoresADRNuevo"
                                    isOpen={modalNuevo}
                                    onClose={() => setModalNuevo(false)}
                                    accion="Nuevo"
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
                            </>
                        </div>
                    )}
                    <div className="flex justify-between items-center mb-2">
                        <div>{mensajeError && <span className="text-red-500 hover:text-red-700">{mensajeError}</span>}</div>

                        <div className="flex items-center space-x-2">
                            {fechaUltimoActualizadoBBDD && (
                                <div>
                                    {new Date(fechaUltimoActualizadoBBDD).toLocaleString('es-ES', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </div>
                            )}
                            <Tippy content={t('Actualizar')}>
                                <button
                                    type="button"
                                    onClick={() => {
                                        llamarBBDD();
                                        setLoading(false);
                                    }}
                                >
                                    <IconRefresh />
                                </button>
                            </Tippy>
                        </div>
                    </div>
                    <div className="flex flex-row justify-center mb-5 gap-5">
                        <TablaIndicadores origen="indicadoresADR" />
                    </div>
                </div>
            )}
        </div>
    );
};
export default Index;

import 'tippy.js/dist/tippy.css';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { indicadorInicial } from '../../types/Indicadores';
import { Loading } from '../../components/Utils/animations';
import { ModalNuevoIndicador, TablaIndicadores } from './componentesIndicadores';
import IconRefresh from '../../components/Icon/IconRefresh';
import Tippy from '@tippyjs/react';
import { useIndicadoresContext } from '../../contexts/IndicadoresContext';

const Index = () => {
    const { t } = useTranslation();
    const { setIndicadoresRealizacion, indicadoresResultado, setIndicadoresResultado, loading, mensajeError, fechaUltimoActualizadoBBDD, llamarBBDD, PrimeraLlamada } = useIndicadoresContext();

    const [modalNuevo, setModalNuevo] = useState(false);

    useEffect(() => {
        PrimeraLlamada();
    }, []);

    return (
        <div className="flex w-full gap-5">
            {loading ? (
                <Loading />
            ) : (
                <div className="flex flex-col w-full">
                    <div className="flex flex-col justify-end mb-5 items-end">
                        {mensajeError ?? <span className="ml-2 text-red-500 hover:text-red-700">{mensajeError}</span>}
                        <button onClick={() => setModalNuevo(true)} className="btn btn-primary w-[300px]">
                            Abrir modal nuevo indicador
                        </button>
                        <ModalNuevoIndicador
                            isOpen={modalNuevo}
                            onClose={() => setModalNuevo(false)}
                            accion="Nuevo"
                            datosIndicador={indicadorInicial}
                            onSave={(nuevoIndicadorRealizacion) => {
                                setIndicadoresRealizacion((prev) => [...prev, nuevoIndicadorRealizacion]);
                                if (!nuevoIndicadorRealizacion.Resultados) {
                                    return;
                                }
                                const nuevosResultados = nuevoIndicadorRealizacion.Resultados.filter((nuevoRes) => !indicadoresResultado.some((res) => res.Id === nuevoRes.Id));
                                if (nuevosResultados.length > 0) {
                                    setIndicadoresResultado((prev) => [...prev, ...nuevosResultados]);
                                }
                            }}
                        />
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
                        <TablaIndicadores />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Index;

import 'tippy.js/dist/tippy.css';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Loading } from '../../components/Utils/animations';
import { ModalNuevoIndicador, TablaIndicadores } from './componentesIndicadores';
import IconRefresh from '../../components/Icon/IconRefresh';
import Tippy from '@tippyjs/react';
import { useIndicadoresContext } from '../../contexts/IndicadoresContext';
import { PrintFecha } from '../../components/Utils/utils';

const Index = () => {
    const { t } = useTranslation();
    const {
        setIndicadoresRealizacion,
        indicadoresResultado,
        setIndicadoresResultado,
        loading,
        mensajeError,
        fechaUltimoActualizadoBBDD,
        llamarBBDD,
        PrimeraLlamada,
        setLoading,
        setIndicadorSeleccionado,
    } = useIndicadoresContext();

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
                        <button
                            onClick={() => {
                                setModalNuevo(true);
                                setIndicadorSeleccionado({
                                    tipo: 'Realizacion',
                                    ADR: false,
                                    indicador: null,
                                    accion: 'Crear',
                                });
                            }}
                            className="btn btn-primary w-[300px]"
                        >
                            {t('NuevoIndicador')}
                        </button>
                        <ModalNuevoIndicador
                            origen="indicadoresNuevo"
                            isOpen={modalNuevo}
                            onClose={() => setModalNuevo(false)}
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
                    <div className="flex justify-between items-center mb-2">
                        <div>{mensajeError && <span className="text-red-500 hover:text-red-700">{mensajeError}</span>}</div>

                        <div className="flex items-center space-x-2">
                            <PrintFecha date={fechaUltimoActualizadoBBDD} />
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
                        <TablaIndicadores origen="indicadores" />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Index;

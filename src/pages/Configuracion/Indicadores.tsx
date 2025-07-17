import 'tippy.js/dist/tippy.css';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { indicadorInicial, IndicadorRealizacion, IndicadorResultado } from '../../types/Indicadores';
import { Loading } from '../../components/Utils/animations';
import { ModalNuevoIndicador, TablaIndicadores } from './componentesIndicadores';
import IconRefresh from '../../components/Icon/IconRefresh';
import Tippy from '@tippyjs/react';
import { actualizarFechaLLamada, obtenerFechaLlamada } from '../../components/Utils/utils';

const Index = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [indicadorRealizacion, setIndicadorRealizacion] = useState<IndicadorRealizacion[]>([]);
    const [indicadorResultado, setIndicadorResultado] = useState<IndicadorResultado[]>([]);
    const [modalNuevo, setModalNuevo] = useState(false);

    const [fechaUltimoActualizadoBBDD, setFechaUltimoActualizadoBBDD] = useState<Date | null>(() => {
        const fechaStr = obtenerFechaLlamada('indicadores');
        return fechaStr ? new Date(fechaStr) : null;
    });

    const llamadaBBDDIndicadores = async () => {
        const token = localStorage.getItem('token');
        try {
            const res = await fetch('https://localhost:44300/api/indicadores', {
                headers: {
                    Authorization: `Bearer ` + token,
                    'Content-Type': 'application/json',
                },
            });

            const data = await res.json();
            const datosIndicador: IndicadorRealizacion[] = data.data;
            if (!res.ok) throw new Error(data.message || t('errorObtenerIndicadores'));
            setIndicadorRealizacion(datosIndicador);
            localStorage.setItem('indicadorRealizacion', JSON.stringify(datosIndicador));

            const indicadoresResultado: IndicadorResultado[] = datosIndicador
                .flatMap((r: IndicadorRealizacion) => r.Resultados || [])
                .filter((res, index, self) => self.findIndex((x) => x.Id === res.Id) === index)
                .sort((a, b) => a.Id - b.Id);

            setIndicadorResultado(indicadoresResultado);
            setFechaUltimoActualizadoBBDD(new Date());
            localStorage.setItem('indicadoresResultado', JSON.stringify(indicadoresResultado));
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        setLoading(true);
        const storedRealizacion = localStorage.getItem('indicadorRealizacion');
        const storedResultado = localStorage.getItem('indicadoresResultado');
        if (storedRealizacion && storedResultado) {
            const indicadoresRealizacion: IndicadorRealizacion[] = JSON.parse(storedRealizacion);
            setIndicadorRealizacion(indicadoresRealizacion);
            const indicadoresResultado: IndicadorResultado[] = JSON.parse(storedResultado);
            setIndicadorResultado(indicadoresResultado);
            setLoading(false);
            return;
        }

        llamadaBBDDIndicadores();
    }, []);

    useEffect(() => {
        actualizarFechaLLamada('indicadores');
    }, [fechaUltimoActualizadoBBDD]);

    return (
        <div className="flex w-full gap-5">
            {loading ? (
                <Loading />
            ) : (
                <div className="flex flex-col">
                    <div className="flex flex-col justify-end mb-5 items-end">
                        <button onClick={() => setModalNuevo(true)} className="btn btn-primary w-[300px]">
                            Abrir modal nuevo indicador
                        </button>
                        <ModalNuevoIndicador
                            isOpen={modalNuevo}
                            onClose={() => setModalNuevo(false)}
                            accion="Nuevo"
                            datosIndicador={indicadorInicial}
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
                            <button type="button" onClick={llamadaBBDDIndicadores}>
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

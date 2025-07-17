import 'tippy.js/dist/tippy.css';
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { indicadorInicial, IndicadorRealizacion, IndicadorResultado } from '../../types/Indicadores';
import { Loading } from '../../components/Utils/animations';
import { useRegionContext } from '../../contexts/RegionContext';
import { ModalNuevoIndicador, TablaIndicadores } from './componentesIndicadores';

const Index = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const { regionSeleccionada } = useRegionContext();

    const [indicadorRealizacion, setIndicadorRealizacion] = useState<IndicadorRealizacion[]>([]);
    const [indicadorResultado, setIndicadorResultado] = useState<IndicadorResultado[]>([]);
    const [modalNuevo, setModalNuevo] = useState(false);
    const [mensajeError, setMensajeError] = useState<string>('');

    const filtrarPorAdr = (indicadores: IndicadorRealizacion[]): IndicadorRealizacion[] => {
        return indicadores.filter((indicador) => String(indicador.RegionsId) === String(regionSeleccionada));
    };

    useEffect(() => {
        setLoading(true);

        const storedRealizacion = localStorage.getItem('indicadorRealizacion');
        const storedResultado = localStorage.getItem('indicadoresResultado');
        if (storedRealizacion && storedResultado) {
            const indicadoresRealizacion: IndicadorRealizacion[] = JSON.parse(storedRealizacion);
            const indicadoresResultado: IndicadorResultado[] = JSON.parse(storedResultado);

            const indicadoresRealizacionFiltrado = filtrarPorAdr(indicadoresRealizacion);
            const indicadoresResultadoFiltrado = filtrarPorAdr(indicadoresResultado);
            setIndicadorRealizacion(indicadoresRealizacionFiltrado);
            setIndicadorResultado(indicadoresResultadoFiltrado);
            setLoading(false);
            return;
        }
        const token = localStorage.getItem('token');
        const fetchUsers = async () => {
            try {
                const res = await fetch('https://localhost:44300/api/indicadores', {
                    headers: {
                        Authorization: `Bearer ` + token,
                        'Content-Type': 'application/json',
                    },
                });
                const data = await res.json();
                const datosIndicador: IndicadorRealizacion[] = data.data;

                if (!res.ok) {
                    setMensajeError(data.Message || t('errorObtenerUsuarios'));
                    throw new Error(data.Message || t('errorObtenerUsuarios'));
                }
                localStorage.setItem('indicadorRealizacion', JSON.stringify(datosIndicador));

                const indicadoresResultado: IndicadorResultado[] = datosIndicador
                    .flatMap((r: IndicadorRealizacion) => r.Resultados || [])
                    .filter((res, index, self) => self.findIndex((x) => x.Id === res.Id) === index)
                    .sort((a, b) => a.Id - b.Id);

                localStorage.setItem('indicadoresResultado', JSON.stringify(indicadoresResultado));

                const indicadoresRealizacionFiltrado = filtrarPorAdr(datosIndicador);
                const indicadoresResultadoFiltrado = filtrarPorAdr(indicadoresResultado);
                setIndicadorRealizacion(indicadoresRealizacionFiltrado);
                setIndicadorResultado(indicadoresResultadoFiltrado);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, [regionSeleccionada]);

    return (
        <div className="flex w-full gap-5">
            {loading ? (
                <Loading />
            ) : (
                <div className="flex flex-col">
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
                            </>
                        )}
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

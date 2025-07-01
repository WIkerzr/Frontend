import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { indicadorInicial, IndicadorRealizacion, IndicadorResultado } from '../../types/Indicadores';
import { ModalNuevoIndicador } from './componentes';
import { Loading } from '../../components/Utils/animations';
import { TablaIndicadores } from '../ADR/Componentes';

const Index = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [indicadorRealizacion, setIndicadorRealizacion] = useState<IndicadorRealizacion[]>([]);
    const [indicadorResultado, setIndicadorResultado] = useState<IndicadorResultado[]>([]);
    const [modalNuevo, setModalNuevo] = useState(false);

    useEffect(() => {
        setLoading(true);
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
                if (!res.ok) throw new Error(data.message || t('errorObtenerUsuarios'));
                setIndicadorRealizacion(datosIndicador);

                const indicadoresResultado: IndicadorResultado[] = datosIndicador
                    .flatMap((r: IndicadorRealizacion) => r.Resultados || [])
                    .filter((res, index, self) => self.findIndex((x) => x.Id === res.Id) === index)
                    .sort((a, b) => a.Id - b.Id);

                setIndicadorResultado(indicadoresResultado);
                localStorage.setItem('indicadoresResultado', JSON.stringify(indicadoresResultado));
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

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

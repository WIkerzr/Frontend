import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrash from '../../components/Icon/IconTrash';
import IconPencil from '../../components/Icon/IconPencil';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { Indicador } from '../../types/Indicadores';
import { ModalNuevoIndicador } from './componentes';

interface IndicadorProps {
    datosIndicador: Indicador[];
    tipoIndicador: 'realizacion' | 'resultado';
}

const Tabla: React.FC<IndicadorProps> = ({ datosIndicador, tipoIndicador }) => {
    const { t } = useTranslation();
    const anoActual = 2025;
    const tituloIndicador = tipoIndicador === 'realizacion' ? t('Realizacion') : t('Resultado');
    const [datosIndicadorTabla, setDatosIndicadorTabla] = useState<Indicador[]>([]);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState<boolean>(false);
    const [modalNuevo, setModalNuevo] = useState(false);
    const [modalEditar, setModalEditar] = useState(false);

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');
    const [ultimoIndicador, setUltimoIndicador] = useState<Indicador | null>(null);

    useEffect(() => {
        setDatosIndicadorTabla(datosIndicador);
    }, [datosIndicador]);

    const actualizarIndices = (nuevo: Indicador) => {
        setDatosIndicadorTabla((prev) => [...prev, nuevo]);
    };

    const eliminarIndicador = async (id: number) => {
        setErrorMessage(null);
        setSuccessMessage(null);
        const confirmDelete = window.confirm(t('¿Estás seguro de que deseas eliminar este usuario?'));

        if (!confirmDelete) return;
        try {
            const response = await fetch('/api/eliminarIndicador', {
                method: 'DELETE',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tipo: tipoIndicador,
                    id: id,
                }),
            });

            if (!response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            const data = await response.json();
            setDatosIndicadorTabla(data[tipoIndicador === 'realizacion' ? 'indicadoresRealizacion' : 'indicadoresResultado']);

            setSuccessMessage(t('eliminacionExitosa'));

            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setSuccessMessage(null);
                    setFadeOut(false);
                }, 1000);
            }, 5000);
        } catch (err: any) {
            setErrorMessage(err.message || 'Error inesperado');
        }
        setEditingIndex(null);
    };
    const handleNuevoIndicador = (indicador: Indicador) => {
        setUltimoIndicador(indicador);
        actualizarIndices(indicador);
    };

    return (
        <div className="panel h-full w-1/2">
            <div className="flex justify-center mb-5">
                <button onClick={() => setModalNuevo(true)} className="btn btn-primary">
                    Abrir modal nuevo indicador
                </button>
                <ModalNuevoIndicador
                    isOpen={modalNuevo}
                    onClose={() => setModalNuevo(false)}
                    accion="Nuevo"
                    datosIndicador={datosIndicadorTabla[datosIndicadorTabla.length - 1]}
                    tipoIndicador="realizacion"
                    onGuardar={handleNuevoIndicador}
                />
            </div>
            {errorMessage && <span className="text-red-500 text-sm mt-2">{errorMessage}</span>}
            {successMessage && (
                <div className={`mt-4 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                    <p className="text-green-500">{successMessage}</p>
                </div>
            )}
            <div></div>
            <div className="table-responsive mb-5">
                <table>
                    <thead>
                        <tr>
                            <th>{tituloIndicador}</th>
                            <th className="text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosIndicadorTabla
                            .slice()
                            .reverse()
                            .map((data) => {
                                return (
                                    <tr key={data.id}>
                                        <td>
                                            <div className="break-words">{data.descripcion}</div>
                                        </td>
                                        <td className="text-center">
                                            {data.ano === anoActual ? (
                                                <div className="flex justify-end space-x-3">
                                                    <Tippy content={t('editar')}>
                                                        <button type="button" onClick={() => setModalEditar(true)}>
                                                            <IconPencil />
                                                        </button>
                                                    </Tippy>
                                                    <ModalNuevoIndicador
                                                        isOpen={modalEditar}
                                                        onClose={() => setModalEditar(false)}
                                                        accion="Editar"
                                                        datosIndicador={data}
                                                        tipoIndicador="realizacion"
                                                        onGuardar={handleNuevoIndicador}
                                                    />
                                                    <Tippy content={t('borrar')}>
                                                        <button type="button" onClick={() => eliminarIndicador(data.id)}>
                                                            <IconTrash />
                                                        </button>
                                                    </Tippy>
                                                </div>
                                            ) : (
                                                <span className="text-gray-400"></span>
                                            )}
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

const Index = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [indicadorRealizacion, setIndicadorRealizacion] = useState<Indicador[]>([]);
    const [indicadorResultado, setIndicadorResultado] = useState<Indicador[]>([]);

    useEffect(() => {
        setLoading(true);
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/indicadores');
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || t('errorObtenerUsuarios'));
                setIndicadorRealizacion(data.indicadoresRealizacion);
                setIndicadorResultado(data.indicadoresResultado);
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };
        fetchUsers();
    }, []);

    return (
        <div className="flex w-full gap-5">
            <Tabla datosIndicador={indicadorRealizacion} tipoIndicador="realizacion" />
            <Tabla datosIndicador={indicadorResultado} tipoIndicador="resultado" />
        </div>
    );
};

export default Index;

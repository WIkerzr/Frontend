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

    const [editingIndex, setEditingIndex] = useState<number | null>(null);
    const [editValue, setEditValue] = useState('');

    useEffect(() => {
        setDatosIndicadorTabla(datosIndicador);
    }, [datosIndicador]);

    const actualizarIndices = (nuevo: Indicador) => {
        setDatosIndicadorTabla((prev) => [...prev, nuevo]);
    };

    const startEdit = (index: number, descripcion: string) => {
        setEditingIndex(index);
        setEditValue(descripcion);
    };

    const cancelEdit = () => {
        setEditingIndex(null);
        setEditValue('');
    };

    const saveEdit = async (id: number) => {
        setErrorMessage(null);
        setSuccessMessage(null);
        try {
            const response = await fetch('/api/modIndicador', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tipo: tipoIndicador,
                    id: id,
                    nuevaDescripcion: editValue,
                }),
            });

            if (!response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            const data = await response.json();
            setDatosIndicadorTabla(data[tipoIndicador === 'realizacion' ? 'indicadoresRealizacion' : 'indicadoresResultado']);

            setSuccessMessage(t('CambiosGuardados'));

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

    return (
        <div className="panel h-full w-1/2">
            <ModalNuevoIndicador
                texto={`${t('nuevoIndicador') + tituloIndicador}`}
                datosIndicador={datosIndicadorTabla.length > 0 ? datosIndicadorTabla[datosIndicadorTabla.length - 1].descripcion.slice(0, 4) : ''}
                tipoIndicador={tipoIndicador}
                onGuardar={actualizarIndices}
            />
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
                                const isEditing = editingIndex === data.id;
                                return (
                                    <tr key={data.id}>
                                        <td>
                                            {isEditing ? (
                                                <input
                                                    type="text"
                                                    className="border border-gray-300 rounded px-2 py-1 w-full"
                                                    value={editValue}
                                                    onChange={(e) => setEditValue(e.target.value)}
                                                    onKeyDown={(e) => {
                                                        if (e.key === 'Enter') saveEdit(data.id);
                                                        if (e.key === 'Escape') cancelEdit();
                                                    }}
                                                    autoFocus
                                                />
                                            ) : (
                                                <div className="break-words">{data.descripcion}</div>
                                            )}
                                        </td>
                                        <td className="text-center">
                                            {data.ano === anoActual ? (
                                                <div className="flex justify-end space-x-3">
                                                    {isEditing ? (
                                                        <>
                                                            <button onClick={() => saveEdit(data.id)} className="btn btn-primary" title={t('guardar')}>
                                                                ✓
                                                            </button>
                                                            <button onClick={cancelEdit} className="btn btn-secondary" title={t('cancelar')}>
                                                                ✗
                                                            </button>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Tippy content={t('editar')}>
                                                                <button type="button" onClick={() => startEdit(data.id, data.descripcion)}>
                                                                    <IconPencil />
                                                                </button>
                                                            </Tippy>
                                                            <Tippy content={t('borrar')}>
                                                                <button type="button" onClick={() => eliminarIndicador(data.id)}>
                                                                    <IconTrash />
                                                                </button>
                                                            </Tippy>
                                                        </>
                                                    )}
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

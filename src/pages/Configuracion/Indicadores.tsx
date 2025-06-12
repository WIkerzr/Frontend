import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrash from '../../components/Icon/IconTrash';
import IconPencil from '../../components/Icon/IconPencil';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { indicadorInicial, IndicadorRealizacion, IndicadorResultado } from '../../types/Indicadores';
import { ModalNuevoIndicador } from './componentes';
import { Loading } from '../../components/Utils/animations';

interface IndicadorProps {
    indicadorRealizacion: IndicadorRealizacion[];
    indicadorResultado: IndicadorResultado[];
    setIndicadorRealizacion: React.Dispatch<React.SetStateAction<IndicadorRealizacion[]>>;
    setIndicadorResultado: React.Dispatch<React.SetStateAction<IndicadorResultado[]>>;
}

export const TablaIndicadores: React.FC<IndicadorProps> = ({ indicadorRealizacion, indicadorResultado, setIndicadorRealizacion, setIndicadorResultado }) => {
    const { t, i18n } = useTranslation();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState<boolean>(false);
    const [modalEditarRealizacion, setModalEditarRealizacion] = useState(false);
    const [modalEditarResultado, setModalEditarResultado] = useState(false);
    const [indicadorSeleccionadoRealizacionEditar, setIndicadorSeleccionadoRealizacionEditar] = useState<IndicadorRealizacion>();
    const [indicadorSeleccionadoResultadoEditar, setIndicadorSeleccionadoResultadoEditar] = useState<IndicadorRealizacion>();
    const [datosPreEditados, setDatosPreEditados] = useState<IndicadorRealizacion>(indicadorInicial);

    const actualizarIndicadorResultadosAlEliminarEnRealizacion = (indicadorResultadoSeleccionado: IndicadorRealizacion, idExcluir: number[] = []) => {
        let resultadoIds = [...(indicadorResultadoSeleccionado.Resultados?.map((r) => r.Id) || [])];

        const resultadosRelacionados = new Set<number>();
        for (const ind of indicadorRealizacion) {
            if (ind.Id === indicadorResultadoSeleccionado.Id) continue;
            ind.Resultados?.forEach((r) => {
                resultadosRelacionados.add(r.Id);
            });
        }
        resultadoIds = resultadoIds.filter((id) => !resultadosRelacionados.has(id) && !idExcluir.includes(id));
        setIndicadorResultado((prev) => prev.filter((r) => !resultadoIds.includes(r.Id)));
    };

    const editarIndicadorResultados = (indicadorActualizado: IndicadorResultado) => {
        setIndicadorRealizacion((prev) =>
            prev.map((ind) => ({
                ...ind,
                Resultados: ind.Resultados?.map((r) => (r.Id === indicadorActualizado.Id ? { ...r, ...indicadorActualizado } : r)) || [],
            }))
        );
    };

    const actualizarIndicadorResultados = (indicadorActualizado: IndicadorRealizacion) => {
        for (const ind of indicadorActualizado.Resultados!) {
            editarIndicadorResultados(ind);
        }

        const idsPreEditados = datosPreEditados.Resultados?.map((r) => r.Id) || [];
        const idsActualizados = new Set(indicadorActualizado.Resultados?.map((r) => r.Id) || []);
        const idsEliminados = idsPreEditados.filter((id) => !idsActualizados.has(id));
        const resultadosNoRelacionados = new Set<number>();
        for (const ind of indicadorRealizacion) {
            if (ind.Id === indicadorActualizado.Id) continue;
            ind.Resultados?.forEach((r) => {
                const id = Number(r.Id);
                if (idsEliminados.includes(id)) {
                    resultadosNoRelacionados.add(id);
                }
            });
        }
        const idsParaEliminar = idsEliminados.filter((id) => !resultadosNoRelacionados.has(id));

        if (idsParaEliminar.length > 0) {
            setIndicadorResultado((prev) => {
                const filtrados = prev.filter((resultado) => !idsParaEliminar.includes(resultado.Id));
                return filtrados;
            });
        }

        const idsAgregados = Array.from(idsActualizados).filter((id) => !idsPreEditados.includes(id));
        const idsExistentes = new Set(indicadorResultado.map((r) => r.Id));
        const nuevosResultados = indicadorActualizado.Resultados?.filter((r) => idsAgregados.includes(r.Id) && !idsExistentes.has(r.Id)) || [];
        if (nuevosResultados.length > 0) {
            setIndicadorResultado((prev) => [...prev, ...nuevosResultados]);
        }
        setIndicadorResultado((prev) =>
            prev.map((resultadoExistente) => {
                const actualizado = indicadorActualizado.Resultados?.find((r) => r.Id === resultadoExistente.Id);
                if (actualizado) {
                    const cambiado =
                        resultadoExistente.NameEs !== actualizado.NameEs ||
                        resultadoExistente.NameEu !== actualizado.NameEu ||
                        resultadoExistente.Description !== actualizado.Description ||
                        resultadoExistente.DisaggregationVariables !== actualizado.DisaggregationVariables ||
                        resultadoExistente.CalculationMethodology !== actualizado.CalculationMethodology ||
                        resultadoExistente.RelatedAxes !== actualizado.RelatedAxes;

                    if (cambiado) {
                        return { ...resultadoExistente, ...actualizado };
                    }
                }
                return resultadoExistente;
            })
        );
    };

    const actualizarEliminarIndicadorRealizacion = (indicadorRealizacionSeleccionado: IndicadorRealizacion) => {
        setIndicadorRealizacion((prev) => {
            const nuevoArray = prev.filter((ind) => ind.Id !== indicadorRealizacionSeleccionado.Id);
            const idsUsados = new Set<number>();
            nuevoArray.forEach((ind) => {
                ind.Resultados?.forEach((res) => idsUsados.add(res.Id));
            });
            actualizarIndicadorResultadosAlEliminarEnRealizacion(indicadorRealizacionSeleccionado);
            return nuevoArray;
        });
    };

    const eliminarIndicadorRealizacion = async (indiRealizacionAEliminar: IndicadorRealizacion) => {
        setErrorMessage(null);
        setSuccessMessage(null);
        const token = sessionStorage.getItem('token');
        const confirmDelete = window.confirm(t('confirmarEliminar', { nombre: i18n.language === 'eu' ? indiRealizacionAEliminar.NameEu : indiRealizacionAEliminar.NameEs }));
        if (!confirmDelete) return;
        try {
            const response = await fetch(`https://localhost:44300/api/eliminarIndicadorRealizacion/${indiRealizacionAEliminar.Id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tipo: 'realizacion',
                    id: indiRealizacionAEliminar.Id,
                }),
            });

            if (!response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            const data = await response.json();
            console.log('Datos restantes despues de la eliminacion del indicador Realización con id:' + indiRealizacionAEliminar.Id);
            console.log(data);
            actualizarEliminarIndicadorRealizacion(indiRealizacionAEliminar);
            setSuccessMessage(t('eliminacionExitosa'));

            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setSuccessMessage(null);
                    setFadeOut(false);
                }, 1000);
            }, 5000);
            setIndicadorRealizacion((prev) => prev.filter((indicador) => indicador.Id !== indiRealizacionAEliminar.Id));
        } catch (err: any) {
            setErrorMessage(err.message || 'Error inesperado');
        }
    };

    const eliminarIndicadorResultado = async (indiResultadoAEliminar: IndicadorResultado) => {
        setErrorMessage(null);
        setSuccessMessage(null);
        const token = sessionStorage.getItem('token');
        const confirmDelete = window.confirm(t('confirmarEliminar', { nombre: i18n.language === 'eu' ? indiResultadoAEliminar.NameEu : indiResultadoAEliminar.NameEs }));
        if (!confirmDelete) return;
        try {
            const response = await fetch(`https://localhost:44300/api/eliminarIndicadorResultado/${indiResultadoAEliminar.Id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tipo: 'resultado',
                    id: indiResultadoAEliminar.Id,
                }),
            });

            if (!response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            setSuccessMessage(t('eliminacionExitosa'));
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setSuccessMessage(null);
                    setFadeOut(false);
                }, 1000);
            }, 5000);
            setIndicadorResultado((prev) => prev.filter((indicador) => indicador.Id !== indiResultadoAEliminar.Id));

            setIndicadorRealizacion((prev) =>
                prev.map((ind) => ({
                    ...ind,
                    Resultados: ind.Resultados?.filter((r) => r.Id !== indiResultadoAEliminar.Id) || [],
                }))
            );
        } catch (err: any) {
            setErrorMessage(err.message || 'Error inesperado');
        }
    };
    return (
        <>
            <div className={`h-full panel w-1/2}`}>
                {errorMessage && <span className="text-red-500 text-sm mt-2">{errorMessage}</span>}
                {successMessage && (
                    <div className={`mt-4 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                        <p className="text-green-500">{successMessage}</p>
                    </div>
                )}
                <div className="table-responsive mb-5">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('Realizacion')}</th>
                                <th className="text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {indicadorRealizacion
                                .slice()
                                .reverse()
                                .map((data) => {
                                    return (
                                        <tr key={data.Id}>
                                            <td>
                                                <div className="break-words">
                                                    {i18n.language === 'eu' ? (data.NameEu?.trim() ? data.NameEu : data.NameEs) : data.NameEs?.trim() ? data.NameEs : data.NameEu}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <div className="flex justify-end space-x-3">
                                                    <Tippy content={t('editar')}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIndicadorSeleccionadoRealizacionEditar(data);
                                                                setDatosPreEditados(JSON.parse(JSON.stringify(data)));
                                                                setModalEditarRealizacion(true);
                                                            }}
                                                        >
                                                            <IconPencil />
                                                        </button>
                                                    </Tippy>
                                                    <Tippy content={t('borrar')}>
                                                        <button type="button" onClick={() => eliminarIndicadorRealizacion(data)}>
                                                            <IconTrash />
                                                        </button>
                                                    </Tippy>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
                {modalEditarRealizacion && indicadorSeleccionadoRealizacionEditar && (
                    <ModalNuevoIndicador
                        isOpen={modalEditarRealizacion}
                        onClose={() => setModalEditarRealizacion(false)}
                        accion="Editar"
                        datosIndicador={indicadorSeleccionadoRealizacionEditar}
                        tipoIndicador={'realizacion'}
                        onSave={(indicadorActualizado) => {
                            setIndicadorRealizacion((prev) => prev.map((ind) => (ind.Id === indicadorActualizado.Id ? indicadorActualizado : ind)));
                            actualizarIndicadorResultados(indicadorActualizado);
                        }}
                    />
                )}
            </div>
            <div className={`h-full panel w-1/2}`}>
                {errorMessage && <span className="text-red-500 text-sm mt-2">{errorMessage}</span>}
                {successMessage && (
                    <div className={`mt-4 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                        <p className="text-green-500">{successMessage}</p>
                    </div>
                )}
                <div className="table-responsive mb-5">
                    <table>
                        <thead>
                            <tr>
                                <th>{t('Resultado')}</th>
                                <th className="text-center"></th>
                            </tr>
                        </thead>
                        <tbody>
                            {indicadorResultado
                                .slice()
                                .reverse()
                                .map((data) => {
                                    return (
                                        <tr key={data.Id}>
                                            <td>
                                                <div className="break-words">
                                                    {i18n.language === 'eu' ? (data.NameEu?.trim() ? data.NameEu : data.NameEs) : data.NameEs?.trim() ? data.NameEs : data.NameEu}
                                                </div>
                                            </td>
                                            <td className="text-center">
                                                <div className="flex justify-end space-x-3">
                                                    <Tippy content={t('editar')}>
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIndicadorSeleccionadoResultadoEditar(data);
                                                                setDatosPreEditados(JSON.parse(JSON.stringify(data)));
                                                                setModalEditarResultado(true);
                                                            }}
                                                        >
                                                            <IconPencil />
                                                        </button>
                                                    </Tippy>
                                                    <Tippy content={t('borrar')}>
                                                        <button type="button" onClick={() => eliminarIndicadorResultado(data)}>
                                                            <IconTrash />
                                                        </button>
                                                    </Tippy>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                        </tbody>
                    </table>
                </div>
                {modalEditarResultado && indicadorSeleccionadoResultadoEditar && (
                    <ModalNuevoIndicador
                        isOpen={modalEditarResultado}
                        onClose={() => setModalEditarResultado(false)}
                        accion="Editar"
                        datosIndicador={indicadorSeleccionadoResultadoEditar}
                        tipoIndicador={'resultado'}
                        onSave={(indicadorActualizado) => {
                            setIndicadorResultado((prev) => prev.map((ind) => (ind.Id === indicadorActualizado.Id ? indicadorActualizado : ind)));
                            editarIndicadorResultados(indicadorActualizado);
                        }}
                    />
                )}
            </div>
        </>
    );
};

const Index = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
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

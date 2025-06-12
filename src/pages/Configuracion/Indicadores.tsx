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
    datosIndicador: IndicadorRealizacion[];
    tipoIndicador: 'realizacion' | 'resultado';
    modal: boolean;
    onDelete?: (indicador: IndicadorResultado | IndicadorRealizacion) => void;
}

export const TablaIndicadores: React.FC<IndicadorProps> = ({ datosIndicador, tipoIndicador, modal, onDelete }) => {
    const { t, i18n } = useTranslation();
    const tituloIndicador = tipoIndicador === 'realizacion' ? t('Realizacion') : t('Resultado');
    const [datosIndicadorTabla, setDatosIndicadorTabla] = useState<IndicadorRealizacion[]>(datosIndicador);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState<boolean>(false);
    const [modalEditar, setModalEditar] = useState(false);
    const [indicadorSeleccionadoEditar, setIndicadorSeleccionadoEditar] = useState<IndicadorRealizacion>();

    useEffect(() => {
        setDatosIndicadorTabla(datosIndicador);
    }, [datosIndicador]);

    const eliminarIndicador = async (dataIndicador: IndicadorRealizacion) => {
        setErrorMessage(null);
        setSuccessMessage(null);
        const token = sessionStorage.getItem('token');
        const confirmDelete = window.confirm(t('confirmarEliminar', { nombre: i18n.language === 'eu' ? dataIndicador.NameEu : dataIndicador.NameEs }));
        if (!confirmDelete) return;
        try {
            const response = await fetch(`https://localhost:44300/api/eliminarIndicadorRealizacion/${dataIndicador.Id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tipo: tipoIndicador,
                    id: dataIndicador.Id,
                }),
            });

            if (!response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            const data = await response.json();
            //setDatosIndicadorTabla(data[tipoIndicador === 'realizacion' ? 'indicadoresRealizacion' : 'indicadoresResultado']);

            setSuccessMessage(t('eliminacionExitosa'));
            if (onDelete) {
                onDelete(dataIndicador);
            }
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setSuccessMessage(null);
                    setFadeOut(false);
                }, 1000);
            }, 5000);
            setDatosIndicadorTabla((prev) => prev.filter((indicador) => indicador.Id !== dataIndicador.Id));
        } catch (err: any) {
            setErrorMessage(err.message || 'Error inesperado');
        }
    };

    const eliminarIndicadorResultado = async (dataIndicador: IndicadorResultado) => {
        setErrorMessage(null);
        setSuccessMessage(null);
        const token = sessionStorage.getItem('token');
        const confirmDelete = window.confirm(t('confirmarEliminar', { nombre: i18n.language === 'eu' ? dataIndicador.NameEu : dataIndicador.NameEs }));
        if (!confirmDelete) return;
        try {
            const response = await fetch(`https://localhost:44300/api/eliminarIndicadorResultado/${dataIndicador.Id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    tipo: tipoIndicador,
                    id: dataIndicador.Id,
                }),
            });

            if (!response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            const data = await response.json();

            setSuccessMessage(t('eliminacionExitosa'));

            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setSuccessMessage(null);
                    setFadeOut(false);
                }, 1000);
            }, 5000);
            setDatosIndicadorTabla((prev) => prev.filter((indicador) => indicador.Id !== dataIndicador.Id));
            if (onDelete) {
                onDelete(dataIndicador);
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Error inesperado');
        }
    };

    if (datosIndicadorTabla.length === 0) {
        return <></>;
    }
    return (
        <div className={`h-full ${modal ? 'w-full' : 'panel w-1/2'}`}>
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
                                    <tr key={data.Id}>
                                        <td>
                                            <div className="break-words">
                                                {i18n.language === 'eu' ? (data.NameEu?.trim() ? data.NameEu : data.NameEs) : data.NameEs?.trim() ? data.NameEs : data.NameEu}
                                            </div>
                                        </td>
                                        <td className="text-center">
                                            <div className="flex justify-end space-x-3">
                                                <Tippy content={t('editar')}>
                                                    {!modal ? (
                                                        <button
                                                            type="button"
                                                            onClick={() => {
                                                                setIndicadorSeleccionadoEditar(data);
                                                                setModalEditar(true);
                                                            }}
                                                        >
                                                            <IconPencil />
                                                        </button>
                                                    ) : (
                                                        <></>
                                                    )}
                                                </Tippy>
                                                <Tippy content={t('borrar')}>
                                                    {!modal ? (
                                                        tipoIndicador === 'realizacion' ? (
                                                            <button type="button" onClick={() => eliminarIndicador(data)}>
                                                                <IconTrash />
                                                            </button>
                                                        ) : (
                                                            <button type="button" onClick={() => eliminarIndicadorResultado(data)}>
                                                                <IconTrash />
                                                            </button>
                                                        )
                                                    ) : (
                                                        onDelete && (
                                                            <button type="button" onClick={() => onDelete(data)}>
                                                                <IconTrash />
                                                            </button>
                                                        )
                                                    )}
                                                </Tippy>
                                            </div>
                                        </td>
                                    </tr>
                                );
                            })}
                    </tbody>
                </table>
            </div>
            {modalEditar && indicadorSeleccionadoEditar && (
                <ModalNuevoIndicador
                    isOpen={modalEditar}
                    onClose={() => setModalEditar(false)}
                    accion="Editar"
                    datosIndicador={indicadorSeleccionadoEditar}
                    tipoIndicador={tipoIndicador}
                    onSave={(indicadorActualizado) => {
                        setDatosIndicadorTabla((prev) => prev.map((ind) => (ind.Id === indicadorActualizado.Id ? indicadorActualizado : ind)));
                    }}
                />
            )}
        </div>
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

    const eliminarIndicadorResultadosAlEliminarRealizacion = (selectedOp: IndicadorRealizacion, idExcluir: number[] = []) => {
        let resultadoIds = [...(selectedOp.Resultados?.map((r) => r.Id) || [])];

        const resultadosRelacionados = new Set<number>();
        for (const ind of indicadorRealizacion) {
            if (ind.Id === selectedOp.Id) continue;
            ind.Resultados?.forEach((r) => {
                resultadosRelacionados.add(r.Id);
            });
        }

        resultadoIds = resultadoIds.filter((id) => !resultadosRelacionados.has(id) && !idExcluir.includes(id));

        setIndicadorResultado((prev) => prev.filter((r) => !resultadoIds.includes(r.Id)));
    };

    const eliminarIndicadorRealizacion = (selectedOp: IndicadorRealizacion) => {
        setIndicadorRealizacion((prev) => {
            const nuevoArray = prev.filter((ind) => ind.Id !== selectedOp.Id);
            const idsUsados = new Set<number>();
            nuevoArray.forEach((ind) => {
                ind.Resultados?.forEach((res) => idsUsados.add(res.Id));
            });
            eliminarIndicadorResultadosAlEliminarRealizacion(selectedOp);
            return nuevoArray;
        });
    };

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
                        <TablaIndicadores datosIndicador={indicadorRealizacion} tipoIndicador="realizacion" modal={false} onDelete={eliminarIndicadorRealizacion} />
                        <TablaIndicadores datosIndicador={indicadorResultado} tipoIndicador="resultado" modal={false} />
                    </div>
                </div>
            )}
        </div>
    );
};

export default Index;

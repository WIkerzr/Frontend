/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { forwardRef, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NewModal } from '../../../../components/Utils/utils';
import { TablaIndicadorAccion } from './EditarAccionComponent';
import React from 'react';
import { useYear } from '../../../../contexts/DatosAnualContext';
import { useIndicadoresContext } from '../../../../contexts/IndicadoresContext';
import { IndicadorRealizacionAccion, IndicadorResultadoAccion, TiposDeIndicadores } from '../../../../types/Indicadores';
import { sortBy } from 'lodash';

interface PestanaIndicadoresProps {
    bloqueo: { plan: boolean; memoria: boolean; bloqueoTotal: boolean };
}
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const PestanaIndicadores = React.forwardRef<HTMLButtonElement, PestanaIndicadoresProps>(({ bloqueo }, _ref) => {
    const { t } = useTranslation();
    const { datosEditandoAccion, setDatosEditandoAccion, block } = useYear();
    const [open, setOpen] = useState(false);
    const { ListadoNombresIdicadoresSegunADR, indicadoresRealizacion, indicadoresResultado, PrimeraLlamada } = useIndicadoresContext();
    const [carga, setCarga] = useState<boolean>(false);

    const [indicadoresRealizacionTabla, setIndicadoresRealizacionTabla] = useState<IndicadorRealizacionAccion[]>(sortBy(datosEditandoAccion.indicadorAccion?.indicadoreRealizacion, 'id') ?? []);
    const [indicadoresResultadoTabla, setIndicadoresResultadoTabla] = useState<IndicadorResultadoAccion[]>(sortBy(datosEditandoAccion.indicadorAccion?.indicadoreResultado, 'id') ?? []);

    const listadoNombresIndicadoresRealizacion = ListadoNombresIdicadoresSegunADR('realizacion');
    const listadoNombresIndicadoresResultado = ListadoNombresIdicadoresSegunADR('resultado');

    const [reglasEspeciales, setReglasEspeciales] = useState<{ realizacion: number[]; resultado: number[] }>({ realizacion: [], resultado: [] });

    useEffect(() => {
        if (!datosEditandoAccion || datosEditandoAccion.id === '0') return;
        if (indicadoresRealizacion.length === 0) {
            PrimeraLlamada(null);
        } else {
            const reglasReali = indicadoresRealizacion.filter((e) => e.DisaggregationVariables === 'Sexo');
            const reglasResu = indicadoresResultado.filter((e) => e.DisaggregationVariables === 'Sexo');

            const nuevosReglasEspeciales = {
                realizacion: reglasReali.map((r) => r.Id),
                resultado: reglasResu.map((r) => r.Id),
            };

            setReglasEspeciales(nuevosReglasEspeciales);
        }
    }, [indicadoresRealizacion]);

    useEffect(() => {
        if (!datosEditandoAccion) return;
        if (datosEditandoAccion.indicadorAccion?.indicadoreRealizacion) {
            setCarga(true);
        }
        const sinEspacios = datosEditandoAccion?.indicadorAccion?.indicadoreRealizacion.find((e) => e.descripcion != '');
        if (!sinEspacios) return;

        const rescargarIndicadorRealizacion = datosEditandoAccion?.indicadorAccion?.indicadoreRealizacion;
        if (!rescargarIndicadorRealizacion) {
            return;
        }
        // Solo actualizamos si realmente hay cambios
        if (JSON.stringify(sortBy(rescargarIndicadorRealizacion, 'id')) !== JSON.stringify(indicadoresRealizacionTabla)) {
            setIndicadoresRealizacionTabla(sortBy(rescargarIndicadorRealizacion, 'id'));
        }

        const rescargarIndicadorResultado = datosEditandoAccion?.indicadorAccion?.indicadoreResultado;
        if (!rescargarIndicadorResultado) {
            return;
        }
        // Solo actualizamos si realmente hay cambios
        if (JSON.stringify(sortBy(rescargarIndicadorResultado, 'id')) !== JSON.stringify(indicadoresResultadoTabla)) {
            setIndicadoresResultadoTabla(sortBy(rescargarIndicadorResultado, 'id'));
        }
    }, [datosEditandoAccion]);

    useEffect(() => {
        if (!datosEditandoAccion || datosEditandoAccion.id === '0') return;
        if (listadoNombresIndicadoresRealizacion.length === 0) return;

        const indicadorActualizado = indicadoresRealizacionTabla.map((ind) => {
            const nombre = listadoNombresIndicadoresRealizacion.find((item) => item.id === ind.id)?.nombre || ind.descripcion;
            return {
                ...ind,
                descripcion: nombre,
            };
        });

        let haCambiado = false;
        const indexCambiados: number[] = [];
        for (let index = 0; index < indicadorActualizado.length; index++) {
            const iAct = indicadorActualizado[index];
            if (iAct.descripcion !== indicadoresRealizacionTabla[index].descripcion) {
                if (iAct.descripcion !== '' && indicadoresRealizacionTabla[index].descripcion != iAct.descripcion) {
                    haCambiado = true;
                    indexCambiados.push(index);
                }
            }
        }

        if (haCambiado) {
            const indicadorResult = [];
            for (let index2 = 0; index2 < indicadoresRealizacionTabla.length; index2++) {
                const element = indicadoresRealizacionTabla[index2];

                if (indexCambiados.includes(index2)) {
                    indicadorResult.push(indicadorActualizado[index2]);
                } else {
                    indicadorResult.push(element);
                }
            }

            setIndicadoresRealizacionTabla(sortBy(indicadorResult, 'id'));
        }
    }, [listadoNombresIndicadoresRealizacion]);

    useEffect(() => {
        if (!datosEditandoAccion || datosEditandoAccion.id === '0') return;
        if (listadoNombresIndicadoresResultado.length === 0) return;

        const indicadorActualizado = indicadoresResultadoTabla.map((ind) => {
            const nombre = listadoNombresIndicadoresResultado.find((item) => item.id === ind.id)?.nombre || ind.descripcion;
            return {
                ...ind,
                descripcion: nombre,
            };
        });

        const haCambiado = indicadorActualizado.some((newInd, i) => newInd.descripcion !== indicadoresResultadoTabla[i].descripcion);

        if (haCambiado) {
            setIndicadoresResultadoTabla(sortBy(indicadorActualizado, 'id'));
        }
    }, [listadoNombresIndicadoresResultado]);

    useEffect(() => {
        if (!datosEditandoAccion || datosEditandoAccion.id === '0') return;

        const realizacionChanged = JSON.stringify(datosEditandoAccion.indicadorAccion?.indicadoreRealizacion) !== JSON.stringify(indicadoresRealizacionTabla);
        const resultadoChanged = JSON.stringify(datosEditandoAccion.indicadorAccion?.indicadoreResultado) !== JSON.stringify(indicadoresResultadoTabla);

        if (realizacionChanged || resultadoChanged) {
            setDatosEditandoAccion((prev) => ({
                ...prev,
                indicadorAccion: {
                    indicadoreRealizacion: indicadoresRealizacionTabla,
                    indicadoreResultado: indicadoresResultadoTabla,
                },
            }));
        }
    }, [indicadoresRealizacionTabla, indicadoresResultadoTabla]);

    if (!datosEditandoAccion) {
        return null;
    }

    const esRutaAcciones = window.location.pathname.includes('acciones');

    if (!esRutaAcciones && datosEditandoAccion.datosPlan !== undefined && !carga) {
        return null;
    }

    const handleSave = (seleccion: { idRealizacion: number; idsResultadosEnRealizacion: number[] }) => {
        const existeRealizacion = indicadoresRealizacionTabla.some((ind) => ind.id === seleccion.idRealizacion);
        const existeResultado = indicadoresResultadoTabla.some((ind) => seleccion.idsResultadosEnRealizacion.includes(ind.id));

        let continuar = true;

        if (existeRealizacion && existeResultado) {
            continuar = window.confirm('Algunos indicadores ya existen. ¿Deseas reemplazarlos?');
        } else if (existeRealizacion) {
            continuar = window.confirm('Algunos indicadores de Realizacion ya existen. ¿Deseas reemplazarlos?');
        }

        if (!continuar) return;

        const nuevosIndicadoresRealizacionAccion: IndicadorRealizacionAccion[] = [
            {
                id: seleccion.idRealizacion,
                descripcion: `${listadoNombresIndicadoresRealizacion.find((item) => item.id === seleccion.idRealizacion)?.nombre}`,
                metaAnual: { hombres: 0, mujeres: 0, total: 0 },
                ejecutado: { hombres: 0, mujeres: 0, total: 0 },
                metaFinal: { hombres: 0, mujeres: 0, total: 0 },
                hipotesis: '',
            },
        ];

        const nuevosIndicadoresResultadoAccion: IndicadorResultadoAccion[] = seleccion.idsResultadosEnRealizacion.map((id) => ({
            id,
            descripcion: listadoNombresIndicadoresResultado.find((item) => item.id === id)?.nombre ?? '',
            metaAnual: { hombres: 0, mujeres: 0, total: 0 },
            ejecutado: { hombres: 0, mujeres: 0, total: 0 },
            metaFinal: { hombres: 0, mujeres: 0, total: 0 },
            hipotesis: '',
        }));

        setDatosEditandoAccion((prev) => ({
            ...prev,
            indicadorAccion: {
                indicadoreRealizacion: [...(prev.indicadorAccion?.indicadoreRealizacion?.filter((ind) => ind.id !== seleccion.idRealizacion) ?? []), ...nuevosIndicadoresRealizacionAccion],
                indicadoreResultado: [
                    ...(prev.indicadorAccion?.indicadoreResultado?.filter((ind) => !seleccion.idsResultadosEnRealizacion.includes(ind.id)) ?? []),
                    ...nuevosIndicadoresResultadoAccion,
                ],
            },
        }));
    };

    const handleEliminarIndicador = (tipoIndicador: TiposDeIndicadores, rowIndex: number) => {
        if (tipoIndicador === 'realizacion') {
            const indicadorRealizacionAEliminar = indicadoresRealizacionTabla.filter((_row, idx) => idx === rowIndex);
            let textoEliminar = `${t('confirmarEliminarIndicador')} \n-${indicadorRealizacionAEliminar[0].descripcion} \n`;

            const resultadosAEliminar = listadoNombresIndicadoresRealizacion.find((r) => r.id === indicadorRealizacionAEliminar[0].id)?.idsResultados;

            if (resultadosAEliminar && resultadosAEliminar.length > 0) {
                resultadosAEliminar.forEach((raE, index) => {
                    if (index === 0) {
                        textoEliminar += '\n';
                        textoEliminar += t('confirmarEliminarIndicadorResultados');
                    }
                    const resultadosAEliminar2 = listadoNombresIndicadoresResultado.find((r) => r.id === raE);
                    if (resultadosAEliminar2) {
                        textoEliminar += `\n-${resultadosAEliminar2.nombre}`;
                    }
                });
            }

            if (window.confirm(textoEliminar)) {
                const nuevosIndicadoresRealizacion = indicadoresRealizacionTabla.filter((_row, idx) => idx !== rowIndex);
                setIndicadoresRealizacionTabla(sortBy(nuevosIndicadoresRealizacion, 'id'));

                const nuevosIndicadoresResultado =
                    resultadosAEliminar && resultadosAEliminar.length > 0 ? indicadoresResultadoTabla.filter((r) => !resultadosAEliminar.includes(r.id)) : indicadoresResultadoTabla;

                setDatosEditandoAccion({
                    ...datosEditandoAccion!,
                    indicadorAccion: {
                        indicadoreRealizacion: nuevosIndicadoresRealizacion,
                        indicadoreResultado: nuevosIndicadoresResultado,
                    },
                });
            }
        }

        if (tipoIndicador === 'resultado') {
            if (window.confirm(t('confirmarEliminarIndicador'))) {
                const nuevosIndicadores = indicadoresResultadoTabla.filter((_row, idx) => idx !== rowIndex);
                setIndicadoresResultadoTabla(sortBy(nuevosIndicadores, 'id'));
                setDatosEditandoAccion({
                    ...datosEditandoAccion!,
                    indicadorAccion: {
                        indicadoreRealizacion: datosEditandoAccion!.indicadorAccion?.indicadoreRealizacion ?? [],
                        indicadoreResultado: nuevosIndicadores,
                    },
                });
            }
        }
    };

    const handleOpenModal = () => {
        setOpen(true);
    };

    return (
        <TablaIndicadorAccion
            indicadoresRealizacion={indicadoresRealizacionTabla}
            setIndicadoresRealizacion={setIndicadoresRealizacionTabla}
            indicadoresResultado={indicadoresResultadoTabla}
            setIndicadoresResultado={setIndicadoresResultadoTabla}
            handleEliminarIndicador={handleEliminarIndicador}
            plurianual={datosEditandoAccion.plurianual}
            reglasEspeciales={reglasEspeciales}
            editarPlan={!bloqueo.plan}
            editarMemoria={!bloqueo.memoria}
            botonNuevoIndicadorAccion={
                <BtnNuevoIndicadorAccion
                    indicadoresRealizacionTabla={indicadoresRealizacionTabla}
                    indicadoresResultadoTabla={indicadoresResultadoTabla}
                    block={block}
                    editarPlan={!bloqueo.plan}
                    open={open}
                    setOpen={setOpen}
                    handleOpenModal={handleOpenModal}
                    handleSave={handleSave}
                />
            }
        />
    );
});

interface BtnNuevoIndicadorProps {
    indicadoresRealizacionTabla: IndicadorRealizacionAccion[];
    indicadoresResultadoTabla: IndicadorResultadoAccion[];
    block: boolean;
    editarPlan: boolean;
    open: boolean;
    setOpen: React.Dispatch<React.SetStateAction<boolean>>;
    handleOpenModal: () => void;
    handleSave: (data: any) => void;
}

const BtnNuevoIndicadorAccion: React.FC<BtnNuevoIndicadorProps> = ({ indicadoresRealizacionTabla, indicadoresResultadoTabla, block, editarPlan, open, setOpen, handleOpenModal, handleSave }) => {
    const { t } = useTranslation();

    return (
        <div className="flex items-center justify-between mb-5">
            {!block && editarPlan && (
                <div className="flex items-center space-x-4">
                    <button className="px-4 py-2 bg-primary text-white rounded" onClick={handleOpenModal}>
                        {t('newFileIndicador', { tipo: t('RealizacionMin') })}
                    </button>
                    {open && (
                        <ModalNuevoIndicadorAccion
                            indicadoresRealizacionTabla={indicadoresRealizacionTabla}
                            indicadoresResultadoTabla={indicadoresResultadoTabla}
                            open={open}
                            onClose={() => setOpen(false)}
                            onSave={handleSave}
                        />
                    )}
                </div>
            )}
        </div>
    );
};

type Indicador = { id: number; nombre: string; checked: boolean; idsResultados?: number[] | undefined };

interface ModalNuevoIndicadorAccionProps {
    indicadoresRealizacionTabla: IndicadorRealizacionAccion[];
    indicadoresResultadoTabla: IndicadorResultadoAccion[];
    open: boolean;
    onClose: () => void;
    // realizaciones: Indicador[];
    onSave?: (seleccion: { idRealizacion: number; idsResultadosEnRealizacion: number[] }) => void;
}

export const ModalNuevoIndicadorAccion = forwardRef<HTMLDivElement, ModalNuevoIndicadorAccionProps>(function ModalNuevoIndicadorAccion(props, ref) {
    const { open, onClose, onSave } = props;

    const [indicadorRealizacionId, setIndicadorRealizacionId] = useState<number | null>(null);
    const [resultadosRelacionados, setResultadosRelacionados] = useState<Indicador[]>([]);

    const { t } = useTranslation();
    const { ListadoNombresIdicadoresSegunADR } = useIndicadoresContext();

    const listadoNombresIndicadoresRealizacion = ListadoNombresIdicadoresSegunADR('realizacion');
    const listadoNombresIndicadoresResultado = ListadoNombresIdicadoresSegunADR('resultado');

    // const handleToggleResultado = (id: number) => {
    //     setResultadosRelacionados((prevResultados) => prevResultados.map((resultado) => (resultado.id === id ? { ...resultado, checked: !resultado.checked } : resultado)));
    // };

    const handleChangeRealizacion = (id: number) => {
        setIndicadorRealizacionId(id);
        const relacionados = listadoNombresIndicadoresRealizacion.find((r) => r.id === id)?.idsResultados ?? [];

        const resultadosFiltrados: Indicador[] = listadoNombresIndicadoresResultado
            .filter((resultado) => relacionados.includes(resultado.id))
            .map((resultado) => ({
                ...resultado,
                checked: true,
            }));

        setResultadosRelacionados(resultadosFiltrados);
    };

    const handleSave = () => {
        if (onSave && indicadorRealizacionId !== null) {
            onSave({
                idRealizacion: indicadorRealizacionId,
                idsResultadosEnRealizacion: resultadosRelacionados.filter((r) => r.checked).map((r) => r.id),
            });
        }
        onClose();
    };

    return (
        <NewModal open={open} onClose={onClose} title={t('nuevoIndicadorRealizacion')}>
            <div ref={ref}>
                <label className="block mb-2 font-semibold">{t('seleccionaElIndicador', { tipo: t('Realizacion') })}:</label>
                <select className="w-full mb-4 border rounded px-2 py-1" value={indicadorRealizacionId ?? ''} onChange={(e) => handleChangeRealizacion(Number(e.target.value))}>
                    <option value="" disabled>
                        {t('seleccionaIndicador')}
                    </option>
                    {listadoNombresIndicadoresRealizacion.map((r) => (
                        <option className={`${r.nombre[4] === '.' ? 'bg-blue-200' : 'bg-white'}`} value={r.id} key={r.id}>
                            {r.nombre}
                        </option>
                    ))}
                </select>
            </div>

            {indicadorRealizacionId && (
                <div>
                    <label className="block mb-2 font-semibold">{t('indicadoresResultadoRelacionados')}:</label>
                    <ul className="pl-0 mb-4">
                        {resultadosRelacionados.map((res) => (
                            <li key={res.id} className="mb-2">
                                <label className="flex items-center">
                                    <input type="checkbox" checked={res.checked} disabled className="mr-2" />
                                    {res.nombre}
                                </label>
                            </li>
                        ))}
                    </ul>
                </div>
            )}

            <div className="flex justify-end gap-2 mt-4">
                <button onClick={onClose} className="bg-gray-300 hover:bg-gray-400 text-black px-4 py-2 rounded">
                    {t('cancelar')}
                </button>
                <button onClick={handleSave} className="bg-primary hover:bg-blue-700 text-white px-4 py-2 rounded">
                    {t('anadir')}
                </button>
            </div>
        </NewModal>
    );
});

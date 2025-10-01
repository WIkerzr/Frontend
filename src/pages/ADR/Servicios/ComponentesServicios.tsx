import { NavLink } from 'react-router-dom';
import { IndicadoresServicios, Servicios } from '../../../types/GeneralTypes';
import IconInfoCircle from '../../../components/Icon/IconInfoCircle';
import IconInfoTriangle from '../../../components/Icon/IconInfoTriangle';
import { useTranslation } from 'react-i18next';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import React, { Dispatch, forwardRef, SetStateAction, useRef, useState } from 'react';
import { t } from 'i18next';
import { TiposDeIndicadores } from '../../../types/Indicadores';

interface ResultadoValidacionServicios {
    faltanIndicadoresPlan: boolean;
    faltanIndicadoresMemoria: boolean;
    faltanCamposPlan: boolean;
    faltanCamposMemoria: boolean;
}

export function validarCamposObligatoriosServicio(datos: Servicios): ResultadoValidacionServicios {
    const checkDataString = (value: string | undefined | null) => {
        if (value === null || value === undefined || value === '' || value === '\n') {
            return false;
        }
        return true;
    };
    const faltanIndicadoresPlan = datos.indicadores.some((item) => !item.indicador || !item.previsto?.valor) || datos.indicadores.length === 0;

    let faltanIndicadoresMemoria = true;
    if (!faltanIndicadoresPlan) {
        faltanIndicadoresMemoria = datos.indicadores[0].alcanzado ? !datos.indicadores[0].alcanzado.valor : false;
    }

    const faltanCamposPlan = !checkDataString(datos.nombre) || !checkDataString(datos.descripcion);

    const faltanCamposMemoria = !checkDataString(datos.dSeguimiento) || !checkDataString(datos.valFinal);

    return { faltanIndicadoresPlan, faltanIndicadoresMemoria, faltanCamposPlan, faltanCamposMemoria };
}

interface MostrarAvisoCamposServiciosProps {
    datos: Servicios;
    texto?: boolean;
}

export const MostrarAvisoCamposServicios: React.FC<MostrarAvisoCamposServiciosProps> = ({ datos, texto = true }) => {
    const { t } = useTranslation();
    const { editarPlan } = useEstadosPorAnio();

    const { faltanIndicadoresPlan, faltanIndicadoresMemoria, faltanCamposPlan, faltanCamposMemoria } = validarCamposObligatoriosServicio(datos);

    if (!texto) {
        return null;
    }

    if (editarPlan) {
        if (!faltanCamposPlan && !faltanIndicadoresPlan) {
            return null;
        }
    } else {
        if (!faltanCamposMemoria && !faltanIndicadoresMemoria) {
            return null;
        }
    }

    return (
        <NavLink to="/adr/servicios/editando" className="group">
            <div className="bg-warning text-black text-sm rounded px-3 py-2 mb-4 flex items-center gap-2">
                {faltanCamposPlan || (!editarPlan && faltanCamposMemoria) ? (
                    <>
                        <IconInfoCircle />
                        <span>
                            <strong>{t('aviso')}:</strong> {t('camposObligatorios', { zona: editarPlan ? t('plan') : t('memoria') })}.
                        </span>
                    </>
                ) : (
                    <>
                        <IconInfoTriangle />
                        <span>
                            <strong>{t('aviso')}:</strong> {t('indicadoresOgligatorios', { zona: editarPlan ? t('plan') : t('memoria') })}.
                        </span>
                    </>
                )}
            </div>
        </NavLink>
    );
};

interface PestanaIndicadoresServiciosProps {
    tipoIndicadores: TiposDeIndicadores;
    datosIndicadorRealizacion: IndicadoresServicios[];
    datosIndicadorResultado: IndicadoresServicios[];
    setDatosIndicadorRealizacion: Dispatch<SetStateAction<IndicadoresServicios[]>>;
    setDatosIndicadorResultado: Dispatch<SetStateAction<IndicadoresServicios[]>>;
    editarPlan: boolean;
    editarMemoria: boolean;
    erroresindicadores: boolean[][];
}

export const PestanaIndicadoresServicios = forwardRef<HTMLButtonElement, PestanaIndicadoresServiciosProps>(
    ({ tipoIndicadores, datosIndicadorRealizacion, datosIndicadorResultado, setDatosIndicadorResultado, setDatosIndicadorRealizacion, editarPlan, editarMemoria, erroresindicadores }) => {
        const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
        const setDatosIndicador = tipoIndicadores === 'realizacion' ? setDatosIndicadorRealizacion : setDatosIndicadorResultado;
        const datosIndicador = tipoIndicadores === 'realizacion' ? datosIndicadorRealizacion : datosIndicadorResultado;
        const textoTipoIndicador = tipoIndicadores === 'realizacion' ? t('Realizacion') : t('Resultado');
        const tituloTipoIndicador = tipoIndicadores === 'realizacion' ? t('indicadoresDeRealizacion') : t('indicadoresDeResultado');

        const agregarIndicador = () => {
            setDatosIndicador((prev) => [
                ...prev,
                {
                    indicador: '',
                    previsto: { valor: '' },
                    alcanzado: { valor: '' },
                    tipo: tipoIndicadores,
                },
            ]);
        };

        // if (datosEditandoServicio.indicadores?.some((ind) => !ind.indicador?.trim())) {
        //     alert(t('indicadorServicioSinRellenar'));
        //     return;
        // }
        // setServicio((prev) => ({
        //     ...prev,
        //     indicadores: [
        //         ...prev.indicadores,
        //         {
        //             indicador: '',
        //             previsto: { valor: '' },
        //             alcanzado: { valor: '' },
        //             tipo,
        //         },
        //     ],
        // }));

        const IndicadorZonaSup: React.FC = () => {
            return (
                <div className="p-2 flex justify-between items-center">
                    <span>*{tituloTipoIndicador.toUpperCase()}</span>
                    {editarPlan && (
                        <button type="button" onClick={() => agregarIndicador()} className="px-4 py-2 bg-primary text-white rounded">
                            {t('newIndicador', { tipo: textoTipoIndicador })}
                        </button>
                    )}
                </div>
            );
        };

        const IndicadorBody: React.FC = () => {
            const eliminarIndicador = async (index: number) => {
                setDatosIndicador(datosIndicador.filter((_, i) => i !== index));
            };

            return (
                <>
                    {(datosIndicador || []).map((indicador, index) => {
                        const [indicadorNombre, setIndicadorNombre] = useState<string>(indicador.indicador);
                        const [previsto, setPrevisto] = useState<string>(indicador.previsto.valor);
                        const [alcanzado, setAlcanzado] = useState<string>(indicador.alcanzado ? indicador.alcanzado.valor : '');
                        return (
                            <tr key={index}>
                                <td
                                    className={`border align-top p-1 ${editarPlan ? 'cursor-text' : ''} ${erroresindicadores[index]?.[0] ? 'border-red-500 border-2' : ''}`}
                                    onClick={() => inputRefs.current[index]?.[0]?.focus()}
                                >
                                    <input
                                        disabled={!editarPlan}
                                        ref={(el) => {
                                            if (!inputRefs.current[index]) inputRefs.current[index] = [];
                                            inputRefs.current[index][0] = el;
                                        }}
                                        type="text"
                                        value={indicadorNombre}
                                        onChange={(e) => {
                                            setIndicadorNombre(e.target.value);
                                        }}
                                        onBlur={(e) => {
                                            const nuevos = [...datosIndicador];
                                            nuevos[index] = { ...nuevos[index], indicador: e.target.value };
                                            setDatosIndicador(nuevos);
                                        }}
                                        className={`text-left w-full`}
                                    />

                                    {erroresindicadores[index]?.[0] && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                </td>

                                {/* Valor previsto */}
                                <td
                                    className={`border td align-top p-1 ${editarPlan ? 'cursor-text' : ''} ${erroresindicadores[index]?.[1] ? 'border-red-500 border-2' : ''}`}
                                    onClick={() => inputRefs.current[index]?.[1]?.focus()}
                                >
                                    <input
                                        disabled={!editarPlan}
                                        ref={(el) => {
                                            if (!inputRefs.current[index]) inputRefs.current[index] = [];
                                            inputRefs.current[index][1] = el;
                                        }}
                                        type="text"
                                        value={previsto}
                                        onChange={(e) => {
                                            setPrevisto(e.target.value);
                                        }}
                                        onBlur={(e) => {
                                            const nuevos = [...datosIndicador];
                                            nuevos[index] = {
                                                ...nuevos[index],
                                                previsto: { valor: e.target.value },
                                            };
                                            setDatosIndicador(nuevos);
                                        }}
                                        className={`text-center w-full`}
                                    />

                                    {erroresindicadores[index]?.[1] && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                </td>

                                {/* Valor real */}
                                <td
                                    className={`border td align-top p-1 ${editarPlan || editarMemoria ? 'cursor-text' : ''} ${erroresindicadores[index]?.[2] ? 'border-red-500 border-2' : ''}`}
                                    onClick={() => inputRefs.current[index]?.[2]?.focus()}
                                >
                                    <input
                                        ref={(el) => {
                                            if (!inputRefs.current[index]) inputRefs.current[index] = [];
                                            inputRefs.current[index][2] = el;
                                        }}
                                        disabled={!editarPlan && !editarMemoria}
                                        type="text"
                                        value={alcanzado}
                                        onChange={(e) => {
                                            setAlcanzado(e.target.value);
                                        }}
                                        onBlur={(e) => {
                                            const nuevos = [...datosIndicador];
                                            nuevos[index] = {
                                                ...nuevos[index],
                                                alcanzado: { valor: e.target.value },
                                            };
                                            setDatosIndicador(nuevos);
                                        }}
                                        className={`text-center w-full`}
                                    />
                                    {erroresindicadores[index]?.[2] && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                </td>

                                {/* Botón eliminar */}
                                {editarPlan && (
                                    <td className="border td text-center align-top p-1">
                                        <button type="button" onClick={() => eliminarIndicador(index)} className="text-red-600 font-bold" title="Eliminar fila">
                                            ✖
                                        </button>
                                    </td>
                                )}
                            </tr>
                        );
                    })}
                </>
            );
        };
        return (
            <div className="p-5 flex flex-col gap-4 w-full">
                <div className="flex-grow gap-4 panel">
                    <IndicadorZonaSup />
                    <div className="p-2 flex justify-between items-center">
                        <table className="w-full border-collapse   text-sm">
                            <thead>
                                <tr>
                                    <th className="borderp-1 thead th">
                                        {' '}
                                        {editarPlan ? '*' : ''}
                                        {tituloTipoIndicador}
                                    </th>
                                    <th className="border   p-1 thead th">
                                        {' '}
                                        {editarPlan ? '*' : ''}
                                        {t('valorPrevisto')}
                                    </th>
                                    <th className="border   p-1 thead th">
                                        {' '}
                                        {!editarPlan ? '*' : ''}
                                        {t('valorReal')}
                                    </th>
                                    {editarPlan && <th className="border thead p-1 text-center th">✖</th>}
                                </tr>
                            </thead>
                            <tbody>
                                <IndicadorBody />
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    }
);

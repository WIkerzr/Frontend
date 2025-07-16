/* eslint-disable no-unused-vars */
import { useTranslation } from 'react-i18next';
import { NavLink, useNavigate } from 'react-router-dom';
import { useEstadosPorAnio } from '../../contexts/EstadosPorAnioContext';
import { ZonaTitulo } from '../Configuracion/componentes';
import { TextArea } from '../../components/Utils/inputs';
import { useRef, useState } from 'react';
import { useYear } from '../../contexts/DatosAnualContext';
import { Servicios } from '../../types/GeneralTypes';

//TODO borrar si no se aprobecha
const Index: React.FC = () => {
    const { t } = useTranslation();
    const navigate = useNavigate();
    const { anio, editarPlan, editarMemoria } = useEstadosPorAnio();
    const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
    const { datosEditandoServicio, setDatosEditandoServicio, setYearData, yearData } = useYear();
    const [successMessage, setSuccessMessage] = useState<string | null>(null);

    if (!datosEditandoServicio) {
        return <p>{t('cargando')}</p>;
    }

    const setServicio = (callback: (prev: Servicios) => Servicios) => {
        if (!datosEditandoServicio) return;
        const actualizado = callback(datosEditandoServicio);
        setDatosEditandoServicio(actualizado);
    };

    const [erroresGenerales, setErroresGenerales] = useState({
        nombre: false,
        descripcion: false,
        dSeguimiento: false,
        valFinal: false,
    });

    const [erroresindicadores, setErroresIndicadores] = useState<boolean[][]>([]);

    const agregarIndicador = () => {
        setServicio((prev) => ({
            ...prev,
            indicadores: [
                ...prev.indicadores,
                {
                    indicador: '',
                    previsto: { valor: '' },
                    alcanzado: { valor: '' },
                },
            ],
        }));
    };

    const eliminarIndicador = (index: number) => {
        setServicio((prev) => ({
            ...prev,
            indicadores: prev.indicadores.filter((_, i) => i !== index),
        }));
    };

    const validarAntesDeGuardar = () => {
        if (!datosEditandoServicio) return;

        const nuevosErroresIndicadores = datosEditandoServicio.indicadores.map((ind) => [
            editarPlan && !ind.indicador.trim(),
            editarPlan && !ind.previsto.valor.trim(),
            !editarPlan && editarMemoria && !ind.alcanzado?.valor.trim(),
        ]);

        const nuevosErroresGenerales = {
            nombre: !datosEditandoServicio.nombre.trim(),
            descripcion: !datosEditandoServicio.descripcion.trim(),
            dSeguimiento: !editarPlan && editarMemoria && !datosEditandoServicio.dSeguimiento?.trim(),
            valFinal: !editarPlan && editarMemoria && !datosEditandoServicio.valFinal?.trim(),
        };

        setErroresIndicadores(nuevosErroresIndicadores);
        setErroresGenerales(nuevosErroresGenerales);

        const hayErroresIndicadores = nuevosErroresIndicadores.some((fila) => fila.includes(true));
        const hayErroresGenerales = Object.values(nuevosErroresGenerales).some((v) => v);

        if (hayErroresIndicadores || hayErroresGenerales) {
            alert(t('porFavorCompletaCamposObligatorios') || 'Por favor, completa todos los campos obligatorios.');
            return;
        }

        let nuevosServicios;

        if (datosEditandoServicio!.id === 0) {
            //TODO llamar al servidor y crear nuevo servicio e incorporar el nuevo id que responda en nuevoId
            const nuevoId = Math.max(0, ...(yearData.servicios?.map((s) => s.id) || [0])) + 1;

            const nuevoServicio = {
                ...datosEditandoServicio!,
                id: nuevoId,
            };

            nuevosServicios = [...(yearData.servicios || []), nuevoServicio];
        } else {
            nuevosServicios = yearData.servicios!.map((servicio) => (servicio.id === datosEditandoServicio!.id ? datosEditandoServicio! : servicio));
        }
        setYearData({
            ...yearData,
            servicios: nuevosServicios,
        });

        setSuccessMessage(t('CambiosGuardados'));
        setTimeout(() => {
            navigate('/adr/servicios');
        }, 1500);
    };

    return (
        <>
            {successMessage && (
                <div className={`mt-4 transition-opacity duration-1000 opacity-100}`}>
                    <p className="text-green-500">{successMessage}</p>
                </div>
            )}
            <div className="panel">
                <ZonaTitulo
                    titulo={
                        <h2 className="text-xl font-bold flex items-center space-x-2">
                            <span>
                                {t('servicioTituloEditado')} {anio}
                            </span>
                        </h2>
                    }
                    zonaBtn={
                        (editarPlan || editarMemoria) && (
                            <div className="ml-auto flex gap-4 items-center justify-end">
                                <button className="px-4 py-2 bg-primary text-white rounded" onClick={validarAntesDeGuardar}>
                                    {t('guardar')}{' '}
                                </button>
                                <NavLink to="/adr/servicios" className="group">
                                    <button className="px-4 py-2 bg-danger text-white rounded">{t('cerrar')}</button>
                                </NavLink>
                            </div>
                        )
                    }
                />
                <div className="panel">
                    <div className="bg-[#76923b] p-2 font-bold border border-black">*{t('Servicio')}</div>
                    <div className="bg-[#d3e1b4] p-2 font-bold border-l border-r border-b border-black flex items-center">
                        <label htmlFor="titulo-pcdr" className="mr-2">
                            2.-
                        </label>
                        <input
                            id="titulo-pcdr"
                            disabled={!editarPlan}
                            className={`flex-1 bg-transparent border-b border-black focus:outline-none font-bold ${erroresGenerales.nombre ? 'border-red-500 border-2' : ''}`}
                            value={datosEditandoServicio!.nombre}
                            onChange={(e) =>
                                setServicio((prev) => ({
                                    ...prev,
                                    nombre: e.target.value,
                                }))
                            }
                        />
                        {erroresGenerales.nombre && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                    </div>
                    {/* DESCRIPCIÓN */}
                    <div className="bg-[#76923b] p-2 font-bold border-l border-r border-b border-black">*{t('Descripcion').toUpperCase()}</div>
                    <div className="border-l border-r border-b border-black p-4 text-sm">
                        <TextArea
                            disabled={!editarPlan}
                            nombreInput="Descripcion"
                            className={`h-[114px] w-full ${erroresGenerales.descripcion ? 'border-red-500 border-2' : ''}`}
                            value={datosEditandoServicio!.descripcion}
                            noTitle
                            onChange={(e) =>
                                setServicio((prev) => ({
                                    ...prev,
                                    descripcion: e.target.value,
                                }))
                            }
                        />
                        {erroresGenerales.descripcion && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                    </div>
                    {/* INDICADORES */}
                    <div className="bg-[#76923b] p-2 font-bold border-l border-r border-b border-black flex justify-between items-center">
                        <span>*{t('indicadoresOperativos').toUpperCase()}</span>
                        {editarPlan && (
                            <button type="button" onClick={agregarIndicador} className="px-4 py-1 bg-[#76923b] text-white font-bold border border-black">
                                {t('agregarFila')}
                            </button>
                        )}
                    </div>

                    <table className="w-full border-collapse border-l border-r border-b border-black text-sm">
                        <thead>
                            <tr>
                                <th className="border border-black bg-[#d3e1b4] p-1">{t('indicadores')}</th>
                                <th className="border border-black bg-[#d3e1b4] p-1">{t('valorPrevisto')}</th>
                                <th className="border border-black bg-[#b6c48e] p-1">{t('valorReal')}</th>
                                {editarPlan && <th className="border border-black bg-[#b6c48e] p-1 text-center">✖</th>}
                            </tr>
                        </thead>
                        <tbody>
                            {(datosEditandoServicio!.indicadores || []).map((indicador, index) => (
                                <tr key={index}>
                                    {/* Indicador */}
                                    <td
                                        className={`border border-black align-top p-1 ${editarPlan ? 'cursor-text' : ''} ${erroresindicadores[index]?.[0] ? 'border-red-500 border-2' : ''}`}
                                        onClick={() => inputRefs.current[index]?.[0]?.focus()}
                                    >
                                        <input
                                            disabled={!editarPlan}
                                            ref={(el) => {
                                                if (!inputRefs.current[index]) inputRefs.current[index] = [];
                                                inputRefs.current[index][0] = el;
                                            }}
                                            type="text"
                                            value={indicador.indicador}
                                            onChange={(e) => {
                                                const nuevos = [...datosEditandoServicio.indicadores];
                                                nuevos[index] = { ...nuevos[index], indicador: e.target.value };
                                                setServicio((prev) => ({ ...prev, indicadores: nuevos }));
                                            }}
                                            className={`text-left w-full`}
                                        />

                                        {erroresindicadores[index]?.[0] && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                    </td>

                                    {/* Valor previsto */}
                                    <td
                                        className={`border border-black align-top p-1 ${editarPlan ? 'cursor-text' : ''} ${erroresindicadores[index]?.[1] ? 'border-red-500 border-2' : ''}`}
                                        onClick={() => inputRefs.current[index]?.[1]?.focus()}
                                    >
                                        <input
                                            disabled={!editarPlan}
                                            ref={(el) => {
                                                if (!inputRefs.current[index]) inputRefs.current[index] = [];
                                                inputRefs.current[index][1] = el;
                                            }}
                                            type="text"
                                            value={indicador.previsto?.valor || ''}
                                            onChange={(e) => {
                                                const nuevos = [...datosEditandoServicio.indicadores];
                                                nuevos[index] = {
                                                    ...nuevos[index],
                                                    previsto: { valor: e.target.value },
                                                };
                                                setServicio((prev) => ({ ...prev, indicadores: nuevos }));
                                            }}
                                            className={`text-center w-full`}
                                        />

                                        {erroresindicadores[index]?.[1] && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                    </td>

                                    {/* Valor real */}
                                    <td
                                        className={`border border-black align-top p-1 ${editarPlan || editarMemoria ? 'cursor-text' : ''} ${
                                            erroresindicadores[index]?.[2] ? 'border-red-500 border-2' : ''
                                        }`}
                                        onClick={() => inputRefs.current[index]?.[2]?.focus()}
                                    >
                                        <input
                                            ref={(el) => {
                                                if (!inputRefs.current[index]) inputRefs.current[index] = [];
                                                inputRefs.current[index][2] = el;
                                            }}
                                            disabled={!editarPlan && !editarMemoria}
                                            type="text"
                                            value={indicador.alcanzado?.valor || ''}
                                            onChange={(e) => {
                                                const nuevos = [...datosEditandoServicio.indicadores];
                                                nuevos[index] = {
                                                    ...nuevos[index],
                                                    alcanzado: { valor: e.target.value },
                                                };
                                                setServicio((prev) => ({ ...prev, indicadores: nuevos }));
                                            }}
                                            className={`text-center w-full`}
                                        />
                                        {erroresindicadores[index]?.[2] && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                                    </td>

                                    {/* Botón eliminar */}
                                    {editarPlan && (
                                        <td className="border border-black text-center align-top p-1">
                                            <button type="button" onClick={() => eliminarIndicador(index)} className="text-red-600 font-bold" title="Eliminar fila">
                                                ✖
                                            </button>
                                        </td>
                                    )}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    <div className="bg-[#76923b] p-2 font-bold border-l border-r border-b border-black">{t('dSeguimiento').toUpperCase()}</div>
                    <div className="border-l border-r border-b border-black p-4 text-sm">
                        <TextArea
                            nombreInput="dSeguimiento"
                            disabled={!editarPlan && !editarMemoria}
                            className={`h-[114px] w-full ${erroresGenerales.dSeguimiento ? 'border-red-500 border-2' : ''}`}
                            value={datosEditandoServicio!.dSeguimiento}
                            noTitle
                            onChange={(e) =>
                                setServicio((prev) => ({
                                    ...prev,
                                    dSeguimiento: e.target.value,
                                }))
                            }
                        />
                        {erroresGenerales.dSeguimiento && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                    </div>
                    <div className="bg-[#76923b] p-2 font-bold border-l border-r border-b border-black">{t('valFinal').toUpperCase()}</div>
                    <div className="border-l border-r border-b border-black p-4 text-sm">
                        <TextArea
                            nombreInput="valFinal"
                            disabled={!editarPlan && !editarMemoria}
                            className={`h-[114px] w-full ${erroresGenerales.valFinal ? 'border-red-500 border-2' : ''}`}
                            value={datosEditandoServicio!.valFinal}
                            noTitle
                            onChange={(e) =>
                                setServicio((prev) => ({
                                    ...prev,
                                    valFinal: e.target.value,
                                }))
                            }
                        />
                        {erroresGenerales.valFinal && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                    </div>
                </div>
            </div>
        </>
    );
};
export default Index;

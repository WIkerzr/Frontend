/* eslint-disable no-unused-vars */
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { LoadingOverlay, ZonaTitulo } from '../../Configuracion/Users/componentes';
import { InputField, TextArea } from '../../../components/Utils/inputs';
import { useRef, useState } from 'react';
import { useYear } from '../../../contexts/DatosAnualContext';
import { Servicios } from '../../../types/GeneralTypes';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../../contexts/RegionContext';
import { Loading } from '../../../components/Utils/animations';
import { gestionarServicio } from '../../../components/Utils/data/dataServices';

const Index: React.FC = () => {
    const { t } = useTranslation();
    // const navigate = useNavigate();
    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
    const { datosEditandoServicio, setDatosEditandoServicio, setYearData, yearData } = useYear();
    // const [successMessage, setSuccessMessage] = useState<string>('');
    // const [errorMessage, setErrorMessage] = useState<string>('');
    const { regionSeleccionada } = useRegionContext();

    const [loading, setLoading] = useState<boolean>(false);

    if (!datosEditandoServicio) {
        return <Loading />;
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
        if (datosEditandoServicio.indicadores?.some((ind) => !ind.indicador?.trim())) {
            alert(t('indicadorServicioSinRellenar'));
            return;
        }
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

    const handleChangeCampos = (campo: keyof Servicios, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDatosEditandoServicio({
            ...datosEditandoServicio,
            [campo]: e.target.value || '',
        });
    };

    const eliminarIndicador = async (index: number) => {
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
        hundleGuardarServicio();
    };

    const hundleGuardarServicio = async () => {
        if (datosEditandoServicio.id === 0) {
            const nuevoServicio = await gestionarServicio({
                datosEditandoServicio,
                regionSeleccionada: regionSeleccionada!,
                anioSeleccionada: anioSeleccionada!,
                setLoading,
                // setSuccessMessage,
                // setErrorMessage,
                method: 'POST',
            });

            if (nuevoServicio) {
                setYearData({
                    ...yearData,
                    servicios: [...(yearData.servicios || []), nuevoServicio],
                });
            }
        } else {
            const editadoServicio = await gestionarServicio({
                idServicio: datosEditandoServicio.id,
                datosEditandoServicio,
                regionSeleccionada: regionSeleccionada!,
                anioSeleccionada: anioSeleccionada!,
                setLoading,
                // setSuccessMessage,
                // setErrorMessage,
                method: 'PUT',
            });
            if (editadoServicio) {
                setYearData({
                    ...yearData,
                    servicios: [...(yearData.servicios?.filter((s) => s.id !== editadoServicio.id) || []), editadoServicio],
                });
            }
        }
    };

    const handleFinalize = () => {
        setTimeout(() => {
            // navigate('/adr/servicios');
        }, 1500);
    };

    return (
        <>
            <LoadingOverlay isLoading={loading} message={'mensajeAMostrar'} onComplete={handleFinalize} />

            <div className="panel">
                <ZonaTitulo
                    titulo={
                        <h2 className="text-xl font-bold flex items-center space-x-2">
                            <span>
                                {t('servicioTituloEditado')} {anioSeleccionada}
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
                    <div className="p-2 flex gap-4">
                        <InputField
                            nombreInput="Servicio"
                            className={`${erroresGenerales.nombre && 'border-red-500 border-2'}`}
                            required
                            disabled={!editarPlan}
                            value={datosEditandoServicio.nombre}
                            onChange={(e) => handleChangeCampos('nombre', e)}
                        />
                        {erroresGenerales.nombre && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                    </div>

                    {/* DESCRIPCIÓN */}
                    <div className="p-2 flex-1 gap-4">
                        <span>*{t('Descripcion').toUpperCase()}</span>
                        <TextArea
                            nombreInput="Descripcion"
                            className={`h-[114px] w-full ${erroresGenerales.descripcion ? 'border-red-500 border-2' : ''}`}
                            required
                            noTitle
                            disabled={!editarPlan}
                            value={datosEditandoServicio.descripcion}
                            onChange={(e) => handleChangeCampos('descripcion', e)}
                        />
                        {erroresGenerales.descripcion && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                    </div>

                    {/* INDICADORES */}
                    <div className="p-2 flex justify-between items-center">
                        <span>*{t('indicadores').toUpperCase()}</span>
                        {editarPlan && (
                            <button type="button" onClick={agregarIndicador} className="px-4 py-2 bg-primary text-white rounded">
                                {t('agregarFila')}
                            </button>
                        )}
                    </div>
                    <div className="p-2 flex justify-between items-center">
                        <table className="w-full border-collapse   text-sm">
                            <thead>
                                <tr>
                                    <th className="borderp-1 thead th">
                                        {' '}
                                        {editarPlan ? '*' : ''}
                                        {t('indicadores')}
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
                                {(datosEditandoServicio!.indicadores || []).map((indicador, index) => (
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
                                            <td className="border td text-center align-top p-1">
                                                <button type="button" onClick={() => eliminarIndicador(index)} className="text-red-600 font-bold" title="Eliminar fila">
                                                    ✖
                                                </button>
                                            </td>
                                        )}
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    <div className="p-2 flex-1">
                        <span>
                            {!editarPlan ? '*' : ''}
                            {t('dSeguimiento').toUpperCase()}
                        </span>
                        <TextArea
                            nombreInput="dSeguimiento"
                            disabled={!editarPlan && !editarMemoria}
                            className={`h-[114px] w-full ${erroresGenerales.dSeguimiento ? 'border-red-500 border-2' : ''}`}
                            value={datosEditandoServicio!.dSeguimiento}
                            noTitle
                            onChange={(e) => handleChangeCampos('dSeguimiento', e)}
                        />
                        {erroresGenerales.dSeguimiento && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                    </div>

                    <div className="p-2 flex-1">
                        <span>
                            {!editarPlan ? '*' : ''}
                            {t('valFinal').toUpperCase()}
                        </span>
                        <TextArea
                            nombreInput="valFinal"
                            disabled={!editarPlan && !editarMemoria}
                            className={`h-[114px] w-full ${erroresGenerales.valFinal ? 'border-red-500 border-2' : ''}`}
                            value={datosEditandoServicio!.valFinal}
                            noTitle
                            onChange={(e) => handleChangeCampos('valFinal', e)}
                        />
                        {erroresGenerales.valFinal && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
                    </div>
                </div>
            </div>
        </>
    );
};
export default Index;

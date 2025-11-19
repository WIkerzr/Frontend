import React, { useEffect, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import IconInfoCircle from '../../../components/Icon/IconInfoCircle';
import IconInfoTriangle from '../../../components/Icon/IconInfoTriangle';
import { gestionarServicio } from '../../../components/Utils/data/dataServices';
import { SelectorEje } from '../../../components/Utils/inputs';
import { NewModal } from '../../../components/Utils/utils';
import { useYear } from '../../../contexts/DatosAnualContext';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../../contexts/RegionContext';
import { Servicios } from '../../../types/GeneralTypes';
import { EjesBBDD, YearData } from '../../../types/tipadoPlan';
import { LoadingOverlayPersonalizada } from '../../Configuracion/Users/componentes';
import { DropdownLineaActuaccion, FetchEjesPlan } from '../Acciones/ComponentesAccionesServicios';
import { EjesBBDDToEjes } from '../EjesHelpers';

interface ResultadoValidacionServicios {
    faltanIndicadoresPlan: boolean;
    faltanIndicadoresMemoria: boolean;
    faltanCamposPlan: boolean;
    faltanCamposMemoria: boolean;
    faltaNombre: boolean;
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
    const faltaNombre = !checkDataString(datos.nombre);
    const faltanCamposPlan = !checkDataString(datos.descripcion);

    const faltanCamposMemoria = !checkDataString(datos.dSeguimiento) || !checkDataString(datos.valFinal);

    return { faltanIndicadoresPlan, faltanIndicadoresMemoria, faltanCamposPlan, faltanCamposMemoria, faltaNombre };
}

interface MostrarAvisoCamposServiciosProps {
    datos: Servicios;
    texto?: boolean;
}

export const MostrarAvisoCamposServicios: React.FC<MostrarAvisoCamposServiciosProps> = ({ datos, texto = true }) => {
    const { t } = useTranslation();
    const { editarPlan } = useEstadosPorAnio();

    const { faltanIndicadoresPlan, faltanIndicadoresMemoria, faltanCamposPlan, faltanCamposMemoria, faltaNombre } = validarCamposObligatoriosServicio(datos);

    if (!texto) {
        return null;
    }

    if (editarPlan) {
        if (!faltanCamposPlan && !faltanIndicadoresPlan && !faltaNombre) {
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
                {faltaNombre ? (
                    <>
                        <IconInfoCircle />
                        <span>
                            <strong>{t('aviso')}:</strong> {t('inroduceNombreServicio')}.
                        </span>
                    </>
                ) : faltanCamposPlan || (!editarPlan && faltanCamposMemoria) ? (
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

// interface PestanaIndicadoresServiciosProps {
//     tipoIndicadores: TiposDeIndicadores;
//     datosIndicadorRealizacion: IndicadoresServicios[];
//     datosIndicadorResultado: IndicadoresServicios[];
//     setDatosIndicadorRealizacion: Dispatch<SetStateAction<IndicadoresServicios[]>>;
//     setDatosIndicadorResultado: Dispatch<SetStateAction<IndicadoresServicios[]>>;
//     editarPlan: boolean;
//     editarMemoria: boolean;
//     erroresindicadores: boolean[][];
// }

// export const PestanaIndicadoresServicios = forwardRef<HTMLButtonElement, PestanaIndicadoresServiciosProps>(
//     ({ tipoIndicadores, datosIndicadorRealizacion, datosIndicadorResultado, setDatosIndicadorResultado, setDatosIndicadorRealizacion, editarPlan, editarMemoria, erroresindicadores }) => {
//         const inputRefs = useRef<(HTMLInputElement | null)[][]>([]);
//         const setDatosIndicador = tipoIndicadores === 'realizacion' ? setDatosIndicadorRealizacion : setDatosIndicadorResultado;
//         const datosIndicador = tipoIndicadores === 'realizacion' ? datosIndicadorRealizacion : datosIndicadorResultado;
//         const textoTipoIndicador = tipoIndicadores === 'realizacion' ? t('Realizacion') : t('Resultado');
//         const tituloTipoIndicador = tipoIndicadores === 'realizacion' ? t('indicadoresDeRealizacion') : t('indicadoresDeResultado');

//         const agregarIndicador = () => {
//             setDatosIndicador((prev) => [
//                 ...prev,
//                 {
//                     indicador: '',
//                     previsto: { valor: '' },
//                     alcanzado: { valor: '' },
//                     tipo: tipoIndicadores,
//                 },
//             ]);
//         };

//         // if (datosEditandoServicio.indicadores?.some((ind) => !ind.indicador?.trim())) {
//         //     alert(t('indicadorServicioSinRellenar'));
//         //     return;
//         // }
//         // setServicio((prev) => ({
//         //     ...prev,
//         //     indicadores: [
//         //         ...prev.indicadores,
//         //         {
//         //             indicador: '',
//         //             previsto: { valor: '' },
//         //             alcanzado: { valor: '' },
//         //             tipo,
//         //         },
//         //     ],
//         // }));

//         const IndicadorZonaSup: React.FC = () => {
//             return (
//                 <div className="p-2 flex justify-between items-center">
//                     <span>*{tituloTipoIndicador.toUpperCase()}</span>
//                     {editarPlan && (
//                         <button type="button" onClick={() => agregarIndicador()} className="px-4 py-2 bg-primary text-white rounded">
//                             {t('newIndicador', { tipo: textoTipoIndicador })}
//                         </button>
//                     )}
//                 </div>
//             );
//         };

//         const IndicadorBody: React.FC = () => {
//             const eliminarIndicador = async (index: number) => {
//                 setDatosIndicador(datosIndicador.filter((_, i) => i !== index));
//             };

//             return (
//                 <>
//                     {(datosIndicador || []).map((indicador, index) => {
//                         const [indicadorNombre, setIndicadorNombre] = useState<string>(indicador.indicador);
//                         const [previsto, setPrevisto] = useState<string>(indicador.previsto.valor);
//                         const [alcanzado, setAlcanzado] = useState<string>(indicador.alcanzado ? indicador.alcanzado.valor : '');
//                         return (
//                             <tr key={index}>
//                                 <td
//                                     className={`border align-top p-1 ${editarPlan ? 'cursor-text' : ''} ${erroresindicadores[index]?.[0] ? 'border-red-500 border-2' : ''}`}
//                                     onClick={() => inputRefs.current[index]?.[0]?.focus()}
//                                 >
//                                     <input
//                                         disabled={!editarPlan}
//                                         ref={(el) => {
//                                             if (!inputRefs.current[index]) inputRefs.current[index] = [];
//                                             inputRefs.current[index][0] = el;
//                                         }}
//                                         type="text"
//                                         value={indicadorNombre}
//                                         onChange={(e) => {
//                                             setIndicadorNombre(e.target.value);
//                                         }}
//                                         onBlur={(e) => {
//                                             const nuevos = [...datosIndicador];
//                                             nuevos[index] = { ...nuevos[index], indicador: e.target.value };
//                                             setDatosIndicador(nuevos);
//                                         }}
//                                         className={`text-left w-full`}
//                                     />

//                                     {erroresindicadores[index]?.[0] && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
//                                 </td>

//                                 {/* Valor previsto */}
//                                 <td
//                                     className={`border td align-top p-1 ${editarPlan ? 'cursor-text' : ''} ${erroresindicadores[index]?.[1] ? 'border-red-500 border-2' : ''}`}
//                                     onClick={() => inputRefs.current[index]?.[1]?.focus()}
//                                 >
//                                     <input
//                                         disabled={!editarPlan}
//                                         ref={(el) => {
//                                             if (!inputRefs.current[index]) inputRefs.current[index] = [];
//                                             inputRefs.current[index][1] = el;
//                                         }}
//                                         type="text"
//                                         value={previsto}
//                                         onChange={(e) => {
//                                             setPrevisto(e.target.value);
//                                         }}
//                                         onBlur={(e) => {
//                                             const nuevos = [...datosIndicador];
//                                             nuevos[index] = {
//                                                 ...nuevos[index],
//                                                 previsto: { valor: e.target.value },
//                                             };
//                                             setDatosIndicador(nuevos);
//                                         }}
//                                         className={`text-center w-full`}
//                                     />

//                                     {erroresindicadores[index]?.[1] && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
//                                 </td>

//                                 {/* Valor real */}
//                                 <td
//                                     className={`border td align-top p-1 ${editarPlan || editarMemoria ? 'cursor-text' : ''} ${erroresindicadores[index]?.[2] ? 'border-red-500 border-2' : ''}`}
//                                     onClick={() => inputRefs.current[index]?.[2]?.focus()}
//                                 >
//                                     <input
//                                         ref={(el) => {
//                                             if (!inputRefs.current[index]) inputRefs.current[index] = [];
//                                             inputRefs.current[index][2] = el;
//                                         }}
//                                         disabled={!editarPlan && !editarMemoria}
//                                         type="text"
//                                         value={alcanzado}
//                                         onChange={(e) => {
//                                             setAlcanzado(e.target.value);
//                                         }}
//                                         onBlur={(e) => {
//                                             const nuevos = [...datosIndicador];
//                                             nuevos[index] = {
//                                                 ...nuevos[index],
//                                                 alcanzado: { valor: e.target.value },
//                                             };
//                                             setDatosIndicador(nuevos);
//                                         }}
//                                         className={`text-center w-full`}
//                                     />
//                                     {erroresindicadores[index]?.[2] && <p className="text-red-500 text-xs">{t('campoObligatorio')}</p>}
//                                 </td>

//                                 {/* Botón eliminar */}
//                                 {editarPlan && (
//                                     <td className="border td text-center align-top p-1">
//                                         <button type="button" onClick={() => eliminarIndicador(index)} className="text-red-600 font-bold" title="Eliminar fila">
//                                             ✖
//                                         </button>
//                                     </td>
//                                 )}
//                             </tr>
//                         );
//                     })}
//                 </>
//             );
//         };
//         return (
//             <div className="p-5 flex flex-col gap-4 w-full">
//                 <div className="flex-grow gap-4 panel">
//                     <IndicadorZonaSup />
//                     <div className="p-2 flex justify-between items-center">
//                         <table className="w-full border-collapse   text-sm">
//                             <thead>
//                                 <tr>
//                                     <th className="borderp-1 thead th">
//                                         {' '}
//                                         {editarPlan ? '*' : ''}
//                                         {tituloTipoIndicador}
//                                     </th>
//                                     <th className="border   p-1 thead th">
//                                         {' '}
//                                         {editarPlan ? '*' : ''}
//                                         {t('valorPrevisto')}
//                                     </th>
//                                     <th className="border   p-1 thead th">
//                                         {' '}
//                                         {!editarPlan ? '*' : ''}
//                                         {t('valorReal')}
//                                     </th>
//                                     {editarPlan && <th className="border thead p-1 text-center th">✖</th>}
//                                 </tr>
//                             </thead>
//                             <tbody>
//                                 <IndicadorBody />
//                             </tbody>
//                         </table>
//                     </div>
//                 </div>
//             </div>
//         );
//     }
// );

interface ModalServicioProps {
    button: (open: () => void) => React.ReactNode;
    file?: Servicios;
}

export const ModalServicio: React.FC<ModalServicioProps> = ({ file, button }) => {
    const { t, i18n } = useTranslation();
    const { anioSeleccionada } = useEstadosPorAnio();
    const { yearData } = useYear();

    const servicioCompartida = file ? true : false;
    const { setYearData } = useYear();

    const [ejesPlan, setEjesPlan] = useState<EjesBBDD[]>([]);

    const { regionSeleccionada } = useRegionContext();
    const [idEjeSeleccionado, setIdEjeSeleccionado] = useState('');
    const [nuevaAccion, setNuevaAccion] = useState('');
    const [nuevaLineaActuaccion, setNuevaLineaActuaccion] = useState('');

    const [inputError, setInputError] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const isFetchingRef = useRef(false);

    useEffect(() => {
        setIdEjeSeleccionado(file ? String(file.idEje) : '');
        setNuevaAccion(file ? file.nombre : '');
        setNuevaLineaActuaccion(file ? file.lineaActuaccion : '');
    }, [file]);

    useEffect(() => {
        if (!loading && ejesPlan.length === 0) {
            FetchEjesPlan({
                regionSeleccionada,
                acciones: 'Servicios',
                t,
                i18n,
                setErrorMessage,
                setSuccessMessage,
                setLoading,
                setEjesPlan,
                isFetchingRef,
            });
        }
    }, [yearData, loading]);

    const handleServicioNuevo = async () => {
        if (file) {
            const servicioNuevo = {
                ...file,
                nombre: nuevaAccion,
                idEje: Number(idEjeSeleccionado),
                lineaActuaccion: nuevaLineaActuaccion,
            };
            const nuevoServicio = await gestionarServicio({
                idServicio: file.id,
                datosEditandoServicio: servicioNuevo,
                regionSeleccionada: regionSeleccionada!,
                anioSeleccionada: anioSeleccionada!,
                setLoading,
                setSuccessMessage,
                setErrorMessage,
                method: 'POST',
                duplicacionServicio: true,
            });
            if (nuevoServicio) {
                (setYearData as unknown as React.Dispatch<React.SetStateAction<YearData>>)((prev: YearData) => ({
                    ...prev,
                    servicios: [...(prev.servicios || []), nuevoServicio],
                }));
                setShowModal(false);
            }
        }
    };

    return (
        <>
            <LoadingOverlayPersonalizada
                isLoading={loading}
                enModal={true}
                message={{
                    successMessage,
                    setSuccessMessage,
                    errorMessage,
                    setErrorMessage,
                }}
            />

            {button(() => setShowModal(true))}
            <NewModal open={showModal} onClose={() => setShowModal(false)} title={t('duplicarServicio')}>
                <div className="space-y-5">
                    <SelectorEje idEjeSeleccionado={idEjeSeleccionado} setIdEjeSeleccionado={setIdEjeSeleccionado} ejesPlan={ejesPlan} acciones={'Servicios'} />
                    <div>
                        <label className="block font-medium mb-1">{t('NombreServicio')}</label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded ${inputError && !nuevaAccion.trim() ? 'border-red-400' : ''}`}
                            value={nuevaAccion}
                            onChange={(e) => {
                                setNuevaAccion(e.target.value);
                                setInputError(false);
                            }}
                            placeholder={t('inroduceNombreServicio')}
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">{t('LineaActuaccion')}</label>
                        <div style={{ position: 'relative', minHeight: 40 }}>
                            <DropdownLineaActuaccion
                                setNuevaLineaActuaccion={setNuevaLineaActuaccion}
                                lineaActuaccion={servicioCompartida ? nuevaLineaActuaccion : undefined}
                                idEjeSeleccionado={`${idEjeSeleccionado}`}
                                ejesPlan={EjesBBDDToEjes(ejesPlan)}
                                tipoAccion={'AccionesAccesorias'}
                            />
                        </div>
                    </div>
                    {inputError && <div className="text-xs text-red-500 text-center">{t('rellenarAmbosCampos')}</div>}
                    <button onClick={handleServicioNuevo} className={`bg-primary text-white px-4 py-2 rounded hover:bg-green-700 w-full mt-2 transition}`}>
                        {t('guardar')}
                    </button>
                </div>
            </NewModal>
        </>
    );
};

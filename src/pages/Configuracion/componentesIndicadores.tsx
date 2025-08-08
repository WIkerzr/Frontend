/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { Dispatch, SetStateAction, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useRegionContext } from '../../contexts/RegionContext';
import { IndicadorResultado, IndicadorRealizacion, indicadorInicial, indicadorResultadoinicial } from '../../types/Indicadores';
import Tippy from '@tippyjs/react';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import React from 'react';
import { Region } from '../../components/Utils/gets/getRegiones';
import { Acciones, useIndicadoresContext } from '../../contexts/IndicadoresContext';
import { ApiTarget } from '../../components/Utils/gets/controlDev';
import { Aviso, FetchConRefreshRetry, formateaConCeroDelante, gestionarErrorServidor } from '../../components/Utils/utils';
export type TipoIndicador = 'realizacion' | 'resultado';

interface RellenoIndicadorProps {
    indicadorRealizacion: IndicadorRealizacion;
    onChange: (data: IndicadorRealizacion) => void;
    tipoIndicador: TipoIndicador;
    indicadorResultado?: IndicadorResultado[] | null;
    editandoResultadoModal: 'EditandoResultado' | 'CreandoResultado' | null;
}

const rellenoIndicadorEdicion = (nombre: string, indicadorRealizacion: IndicadorRealizacion) => {
    const posicionPunto = nombre.indexOf('.');
    if (posicionPunto > 0 && posicionPunto < 5) {
        return [nombre.slice(0, 4), nombre.slice(5)];
    } else {
        return [indicadorRealizacion.NameEs.slice(0, 6), indicadorRealizacion.NameEs.slice(7)];
    }
};

export const RellenoIndicador: React.FC<RellenoIndicadorProps> = ({ indicadorRealizacion, onChange, tipoIndicador, indicadorResultado, editandoResultadoModal }) => {
    const { t, i18n } = useTranslation();
    const { ObtenerRealizacionPorRegion, ObtenerResultadosPorRegion, ControlDeFallosIndicadorSeleccionado } = useIndicadoresContext();
    const indicadorSeleccionadoSinFallo = ControlDeFallosIndicadorSeleccionado();
    const [indicadorRealizacionDeterminado, setIndicadorRealizacionDeterminado] = useState<IndicadorResultado[]>([]);
    const [indicadorResultadoDeterminado, setIndicadorResultadoDeterminado] = useState<IndicadorResultado[]>([]);

    const { regionSeleccionada, regiones } = useRegionContext();

    useEffect(() => {
        if (!indicadorSeleccionadoSinFallo.indicador.RegionsId) {
            setIndicadorRealizacionDeterminado(ObtenerRealizacionPorRegion()[0]);
            setIndicadorResultadoDeterminado(ObtenerResultadosPorRegion()[0]);
        } else {
            const regionID = Number(indicadorSeleccionadoSinFallo.indicador.RegionsId);
            setIndicadorRealizacionDeterminado(ObtenerRealizacionPorRegion()[regionID]);
            setIndicadorResultadoDeterminado(ObtenerResultadosPorRegion()[regionID]);
        }
    }, []);

    const SacarSiguienteEnumeracionIndicadores = (indicadorRealizacion: IndicadorRealizacion, tipoIndicador: TipoIndicador): string[] => {
        const ultimoIndicadorRealizacion = indicadorRealizacionDeterminado[indicadorRealizacionDeterminado.length - 1];
        const ultimoIndicadorResultado = indicadorResultadoDeterminado[indicadorResultadoDeterminado.length - 1];
        if (!ultimoIndicadorRealizacion) {
            return [];
        }
        if (!ultimoIndicadorResultado) {
            return [];
        }

        const nombre = indicadorRealizacion.NameEs;
        const inicializacionNombre = tipoIndicador === 'realizacion' ? 'RE' : 'RS';
        const accion = indicadorSeleccionadoSinFallo.accion;
        const tipo = indicadorSeleccionadoSinFallo.tipo;
        const indicador = indicadorSeleccionadoSinFallo.indicador;
        const esADR = indicador.RegionsId ? Number(indicador.RegionsId) > 0 : false;
        let codRegion = '';

        const baseKey = `${accion}_${tipo}_${esADR ? 'ADR' : 'NoADR'}`;

        const key = editandoResultadoModal ? `${baseKey}_${editandoResultadoModal}` : baseKey;

        if (esADR) {
            codRegion = ultimoIndicadorRealizacion.NameEs.slice(4, 6);
        }
        const ultimoNumeroRealizacion = Number(ultimoIndicadorRealizacion.NameEs?.slice(2, 4) ?? '00') + 1;
        const ultimoNumeroResultado = Number(ultimoIndicadorResultado.NameEs?.slice(2, 4) ?? '00') + 1;

        switch (key) {
            case 'Crear_Realizacion_NoADR': {
                const numeracion = formateaConCeroDelante(ultimoNumeroRealizacion);
                return [`${inicializacionNombre}${numeracion}`];
            }
            case 'Crear_Realizacion_NoADR_CreandoResultado': {
                let suma = 0;
                if (indicadorResultado) {
                    suma = indicadorResultado.filter((r) => r.Id === 0).length;
                }
                const numeroActual = suma ? ultimoNumeroRealizacion + suma : ultimoNumeroRealizacion;
                const num = numeroActual ?? 1;
                const numeracion = formateaConCeroDelante(num);
                return [`${inicializacionNombre}${numeracion}`];
            }
            case 'Crear_Realizacion_NoADR_EditandoResultado': {
                return [nombre.slice(0, 4), nombre.slice(5)];
            }
            case 'Editar_Realizacion_NoADR': {
                return rellenoIndicadorEdicion(nombre, indicadorRealizacion);
            }
            case 'Editar_Realizacion_NoADR_CreandoResultado': {
                let numeroActual = 0;
                numeroActual = ultimoNumeroResultado;

                let existe = indicadorResultado?.some((ind) => ind.NameEs?.includes(`${inicializacionNombre}${numeroActual}`)) ?? false;

                while (existe) {
                    numeroActual++;
                    existe = indicadorResultado?.some((ind) => ind.NameEs?.includes(`${inicializacionNombre}${numeroActual}`)) ?? false;
                }
                const numeracion = formateaConCeroDelante(Number(numeroActual));
                return [`${inicializacionNombre}${numeracion}`];
            }
            case 'Editar_Realizacion_NoADR_EditandoResultado': {
                return rellenoIndicadorEdicion(nombre, indicadorRealizacion);
            }
            case 'Crear_Realizacion_ADR': {
                const storedResultado = localStorage.getItem('indicadoresResultadoFiltrado');
                if (!(storedResultado && storedResultado !== '[]')) {
                    codRegion = regionSeleccionada ? generarCodigosRegiones(regiones)[regionSeleccionada] : '';
                }

                const numeracion = formateaConCeroDelante(ultimoNumeroRealizacion);
                return [`${inicializacionNombre}${numeracion}${codRegion}`];
            }
            case 'Editar_Realizacion_ADR_CreandoResultado':
            case 'Crear_Realizacion_ADR_CreandoResultado': {
                const numeroActual = ultimoNumeroResultado;
                const num = numeroActual ?? 1;
                let numeracion = formateaConCeroDelante(num);

                let listadoResultadosModal: number[] = [];
                if (indicadorSeleccionadoSinFallo.resultadosListado?.length) {
                    listadoResultadosModal = indicadorSeleccionadoSinFallo.resultadosListado.map((resultado) => Number(resultado.NameEs.slice(2, 4)));

                    const maxNumero = listadoResultadosModal.length > 0 ? Math.max(...listadoResultadosModal) : 0;
                    const numeracionNum = Number(numeracion);

                    if (numeracionNum <= maxNumero) {
                        numeracion = formateaConCeroDelante(maxNumero + 1);
                    }
                }

                return [`${inicializacionNombre}${numeracion}${codRegion}`];
            }
            case 'Crear_Realizacion_ADR_EditandoResultado':
            case 'Editar_Realizacion_ADR':
            case 'Editar_Realizacion_ADR_EditandoResultado':
            case 'Editar_Resultado_ADR': {
                return [nombre.slice(0, 6), nombre.slice(7)];
            }
            case 'Editar_Resultado_NoADR': {
                return [nombre.slice(0, 6), nombre.slice(7)];
            }
        }

        return [];
    };

    const [formData, setFormData] = useState<IndicadorRealizacion>({
        ...indicadorRealizacion,
        Description: indicadorRealizacion.Description ?? '',
        RelatedAxes: indicadorRealizacion.RelatedAxes ?? '',
        DisaggregationVariables: indicadorRealizacion.DisaggregationVariables ?? '',
        CalculationMethodology: indicadorRealizacion.CalculationMethodology ?? '',
    });
    const [indicador, setIndicador] = useState<string[]>([]);
    const [nombreIndicador, setNombreIndicador] = useState<string>('');

    useEffect(() => {
        setFormData({
            ...indicadorRealizacion,
            Description: indicadorRealizacion.Description ?? '',
            RelatedAxes: indicadorRealizacion.RelatedAxes ?? '',
            DisaggregationVariables: indicadorRealizacion.DisaggregationVariables ?? '',
            CalculationMethodology: indicadorRealizacion.CalculationMethodology ?? '',
        });
    }, [indicadorRealizacion]);

    useEffect(() => {
        const indicadorN = SacarSiguienteEnumeracionIndicadores(indicadorRealizacion, tipoIndicador);
        setIndicador(indicadorN);
        setNombreIndicador(indicadorN[1] ?? '');
    }, [indicadorResultadoDeterminado]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedData = { ...formData, [name]: value };
        setFormData(updatedData);
        onChange(updatedData);
    };

    const handleChangeNombre = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setNombreIndicador(value);
        const updatedData = { ...formData, [name]: `${indicador[0]}.${value}` };
        setFormData(updatedData);
        onChange(updatedData);
    };

    useEffect(() => {
        setFormData(indicadorRealizacion);
    }, []);

    return (
        <div className="space-y-4">
            <div>
                <label className="block font-medium ">{t('nombreIndicador')}</label>
                <div className="flex border rounded bg-gray-200">
                    <div className="flex items-center justify-end rounded mt-2 px-1 font-semibold ">{<label>{indicador[0]}</label>}</div>
                    <input type="text" name={i18n.language === 'eu' ? 'NameEu' : 'NameEs'} className="flex-1 p-2 border" value={nombreIndicador ?? ''} onChange={handleChangeNombre} />
                </div>
            </div>
            <div>
                <label className="block font-medium">{t('unitMed')}</label>
                {/* <select name="unidad" className="w-full p-2 border rounded" onChange={handleChange}>
                    <option value="NUMERO">NUMERO</option>
                    <option value="OTRO">OTRO</option>
                </select> */}
            </div>

            <div>
                <label className="block font-medium">{t('ejesRelacionados')}</label>
                <input type="text" name="RelatedAxes" className="w-full p-2 border rounded" value={formData.RelatedAxes ?? ''} onChange={handleChange} />
            </div>

            <div>
                <label className="block font-medium">{t('Definicion')}</label>
                <input type="text" name="Description" className="w-full p-2 border rounded" value={formData.Description ?? ''} onChange={handleChange} />
            </div>

            <div>
                <label className="block font-medium">{t('VariablesDesagregacion')}</label>
                <input type="text" name="DisaggregationVariables" className="w-full p-2 border rounded" value={formData.DisaggregationVariables ?? ''} onChange={handleChange} />
            </div>

            <div>
                <label className="block font-medium">{t('MTOCalculo')}</label>
                <input type="text" name="CalculationMethodology" className="w-full p-2 border rounded" value={formData.CalculationMethodology ?? ''} onChange={handleChange} />
            </div>
        </div>
    );
};

interface RellenoIndicadorResultadoProps {
    indicadorRealizacion: IndicadorRealizacion;
    isOpen: boolean;
    setDescripcionEditable: React.Dispatch<React.SetStateAction<IndicadorRealizacion>>;
}

export const SelectorOCreador: React.FC<RellenoIndicadorResultadoProps> = ({ indicadorRealizacion, setDescripcionEditable: setIndicadorRealizacion, isOpen }) => {
    const { t, i18n } = useTranslation();
    const indicadoresResultados: IndicadorResultado[] = JSON.parse(localStorage.getItem('indicadoresResultado') || '[]');
    const [opciones] = useState(indicadoresResultados);
    const [seleccion, setSeleccion] = useState('');
    const [modoCrear, setModoCrear] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [filaEditar, setFilaEditar] = useState(0);
    const { indicadorSeleccionado, setIndicadorSeleccionado, ObtenerResultadosPorRegion } = useIndicadoresContext();

    const [refrescarZona, setRefrescarZona] = useState(false);

    const [descripcionEditable, setDescripcionEditable] = useState<IndicadorResultado>(indicadorResultadoinicial);

    useEffect(() => {
        if (isOpen) {
            setDescripcionEditable({
                ...indicadorResultadoinicial,
            });
        }
    }, [isOpen]);

    useEffect(() => {
        if (indicadorRealizacion?.RegionsId != null) {
            const resultado = {
                ...indicadorResultadoinicial,
                RegionsId: indicadorRealizacion.RegionsId,
            };
            setDescripcionEditable(resultado);
        }
    }, [modoCrear]);

    const cambiosIndicadorEditable = (data: any) => {
        setDescripcionEditable((prev) => ({
            ...prev,
            ...data,
        }));
    };

    const nuevoIndicadorResultado = () => {
        const id = Date.now();
        const nuevoResultadoConId = {
            ...descripcionEditable,
            Id: id,
        };

        setIndicadorSeleccionado((prev) => {
            if (!prev) return null;
            if (prev.tipo !== 'Realizacion') return prev;
            return {
                ...prev,
                resultadosListado: [...(prev.resultadosListado ?? []), nuevoResultadoConId],
            };
        });

        setIndicadorRealizacion((prev) => ({
            ...prev,
            Resultados: [...(prev.Resultados || []), nuevoResultadoConId],
        }));
        setModoCrear(false);
        setDescripcionEditable(indicadorResultadoinicial);
    };

    const modificarIndicadorResultadoExistente = (data: IndicadorResultado) => {
        setIndicadorRealizacion((prev) => {
            const nuevosResultados = [...(prev.Resultados || [])];
            nuevosResultados[filaEditar] = data;

            return {
                ...prev,
                Resultados: nuevosResultados,
            };
        });
        setModoCrear(false);
        setModoEditar(false);
        setDescripcionEditable(indicadorResultadoinicial);
    };

    const incorporarIndicadorResultado = (selectedOp: IndicadorResultado) => {
        setIndicadorRealizacion((prev) => ({
            ...prev,
            Resultados: [...(prev.Resultados || []), selectedOp],
        }));
        setRefrescarZona((prev) => !prev);
    };

    const eliminarIndicadorResultado = (selectedOp: IndicadorResultado) => {
        if (indicadorRealizacion.Resultados) {
            setIndicadorSeleccionado((prev) => {
                if (!prev) return null;
                if (prev.tipo !== 'Realizacion') return prev;
                return {
                    ...prev,
                    resultadosListado: (prev.resultadosListado ?? []).filter((resultado) => resultado.Id !== selectedOp.Id),
                };
            });
            setIndicadorRealizacion((prev) => ({
                ...prev,
                Resultados: prev.Resultados?.filter((resultado) => resultado.Id !== selectedOp.Id) || [],
            }));
        }
        setRefrescarZona((prev) => !prev);
    };

    const ZonaListadoResultados = () => {
        const regionKey = indicadorRealizacion.RegionsId ?? 0;

        const opcionesPorRegion = ObtenerResultadosPorRegion()[regionKey] ?? [];

        const opcionesFiltradas = opcionesPorRegion.filter((op) => {
            if (!indicadorSeleccionado) return false;
            const yaAsignado = indicadorRealizacion.Resultados?.some((resultado) => resultado.Id === op.Id) ?? false;
            return !yaAsignado;
        });

        return (
            <>
                <label className="block font-bold mb-2">{t('seleccionaopcion')}:</label>
                <div className="flex gap-2">
                    {opcionesFiltradas.length > 0 && (
                        <select
                            className="max-w-md w-full flex-1 border p-2 rounded"
                            value={seleccion}
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                const selectedOp = opciones.find((op) => (i18n.language === 'eu' ? op.NameEu : op.NameEs) === selectedValue);
                                if (selectedOp) {
                                    incorporarIndicadorResultado(selectedOp);
                                }
                                setSeleccion('');
                            }}
                        >
                            <option value="" disabled>
                                {t('seleccionaopcion')}
                            </option>
                            {opcionesFiltradas.map((op) => (
                                <option key={op.Id} value={i18n.language === 'eu' ? op.NameEu : op.NameEs}>
                                    {i18n.language === 'eu' ? op.NameEu : op.NameEs}
                                </option>
                            ))}
                        </select>
                    )}

                    <button
                        className="bg-blue-500 text-white px-3 py-2 rounded"
                        onClick={() => {
                            setDescripcionEditable(indicadorInicial);
                            setModoCrear(true);
                        }}
                        type="button"
                    >
                        {t('crearNueva')}
                    </button>
                </div>
                <div className="h-full 'w-full">
                    <div className="table-responsive mb-5">
                        <div className="h-full w-full">
                            <div className="flex border-b font-bold pt-3">
                                <div className="flex-1">{t('Realizacion')}</div>
                            </div>

                            {indicadorRealizacion.Resultados!.slice().map((data, index) => (
                                <div key={data.Id + index} className="flex items-center border-b py-3">
                                    <div className="w-[60px] !px-0  flex-shrink-0">
                                        <div className="flex space-x-[5px]">
                                            <Tippy content={t('borrar')}>
                                                <button type="button" onClick={() => eliminarIndicadorResultado(data)}>
                                                    <IconTrash />
                                                </button>
                                            </Tippy>
                                            {data.Id === 0 && (
                                                <Tippy content={t('editar')}>
                                                    <button
                                                        type="button"
                                                        onClick={() => {
                                                            setDescripcionEditable(data);
                                                            setModoEditar(true);
                                                            setFilaEditar(index);
                                                        }}
                                                    >
                                                        <IconPencil />
                                                    </button>
                                                </Tippy>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex-1 break-words overflow-hidden">
                                        {i18n.language === 'eu' ? (data.NameEu?.trim() ? data.NameEu : data.NameEs) : data.NameEs?.trim() ? data.NameEs : data.NameEu}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </>
        );
    };

    return (
        <div className="max-w-md mx-auto p-4 rounded space-y-4">
            {!modoCrear && !modoEditar ? (
                <div key={+refrescarZona}>
                    <ZonaListadoResultados />
                </div>
            ) : (
                <div className="flex gap-2 " key={+refrescarZona}>
                    <div className="space-y-4">
                        <RellenoIndicador
                            indicadorRealizacion={descripcionEditable}
                            onChange={cambiosIndicadorEditable}
                            tipoIndicador="resultado"
                            indicadorResultado={indicadorRealizacion?.Resultados ?? null}
                            editandoResultadoModal={modoCrear ? 'CreandoResultado' : modoEditar ? 'EditandoResultado' : null}
                        />
                        <div className="flex gap-4">
                            <button
                                className="bg-gray-400 text-white px-3 py-2 rounded"
                                onClick={() => {
                                    setModoCrear(false);
                                    setModoEditar(false);
                                }}
                                type="button"
                            >
                                {t('Cancelar')}
                            </button>
                            {modoCrear ? (
                                <button className="btn-primary px-3 py-2 rounded" onClick={() => nuevoIndicadorResultado()} type="button">
                                    {t('crearindicadorRelacionado')}
                                </button>
                            ) : (
                                <button className="btn-primary px-3 py-2 rounded" onClick={() => modificarIndicadorResultadoExistente(descripcionEditable)} type="button">
                                    {t('editarindicadorRelacionado')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {seleccion && <div className="mt-2 text-green-700 font-semibold">Seleccionado: {seleccion}</div>}
        </div>
    );
};

type ModalNuevoIndicadorProps = {
    isOpen: boolean;
    onClose: () => void;
    onSave?: (indicadorActualizado: IndicadorRealizacion) => void;
    tipoIndicador?: TipoIndicador;
};

export const ModalNuevoIndicador: React.FC<ModalNuevoIndicadorProps> = ({ isOpen, onClose, onSave, tipoIndicador }) => {
    const { t, i18n } = useTranslation();
    const { regionSeleccionada } = useRegionContext();
    const { indicadorSeleccionado } = useIndicadoresContext();
    const location = useLocation();
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    const accion: Acciones = indicadorSeleccionado ? indicadorSeleccionado.accion : 'Editar';
    const datosIndicador = indicadorSeleccionado ? indicadorSeleccionado.indicador : structuredClone(indicadorInicial);
    const esADR = location.pathname?.includes('ADR');
    const esNuevo = accion === 'Crear';

    const indicadorInicialConRegionsId: IndicadorRealizacion = {
        ...indicadorInicial,
        RegionsId: datosIndicador && datosIndicador.RegionsId ? datosIndicador.RegionsId : regionSeleccionada ?? '',
    };
    const indicadorInicializado = esADR ? indicadorInicialConRegionsId : structuredClone(indicadorInicial);
    const [descripcionEditable, setDescripcionEditable] = useState<IndicadorRealizacion>(esNuevo ? indicadorInicializado : datosIndicador ?? indicadorInicializado);
    const [mensaje, setMensaje] = useState('');
    const hayResultados = tipoIndicador != 'resultado' ? (descripcionEditable.Resultados!.length > 0 ? true : false) : false;
    const [mostrarResultadoRelacionado, setMostrarResultadoRelacionado] = useState(esNuevo ? false : hayResultados);

    const { setIndicadoresRealizacion, indicadoresResultado, setIndicadoresResultado, setIndicadoresRealizacionADR, indicadoresResultadoADR, setIndicadoresResultadoADR } = useIndicadoresContext();
    useEffect(() => {
        if (accion === 'Crear') {
            setDescripcionEditable((prev) => ({
                ...prev,
                Resultados: [],
            }));
        }
    }, []);

    const alctualizarEstadoNuevo = async (indicador: IndicadorRealizacion | IndicadorRealizacion) => {
        if (accion === 'Crear') {
            const setRealizacion = esADR ? setIndicadoresRealizacionADR : setIndicadoresRealizacion;
            const setResultado = esADR ? setIndicadoresResultadoADR : setIndicadoresResultado;
            const resultadosActuales = esADR ? indicadoresResultadoADR : indicadoresResultado;

            setRealizacion((prev) => [...prev, indicador]);

            const nuevosResultados = indicador.Resultados?.filter((nuevoRes) => !resultadosActuales.some((res) => res.Id === nuevoRes.Id));

            if (nuevosResultados?.length) {
                setResultado((prev) => [...prev, ...nuevosResultados]);
            }
        }
    };

    const validadorRespuestasBBDD = async (response: any, data: any) => {
        if (response.ok) {
            const indicador: IndicadorRealizacion = {
                ...descripcionEditable,
                Id: data.data.Id,
                RegionsId: data.data.RegionsId ? `${data.data.RegionsId}` : regionSeleccionada ?? undefined,
                Resultados: data.data.Resultados,
            };
            setMensaje(t('correctoIndicadorGuardado'));
            alctualizarEstadoNuevo(indicador);
            if (accion === 'Editar') {
                setTimeout(() => {
                    if (onSave) {
                        onSave(indicador);
                    }
                }, 200);
            }
            setTimeout(() => {
                setDescripcionEditable(indicadorInicial);
                setMostrarResultadoRelacionado(false);
                setMensaje('');
                onClose();
            }, 1000);
        } else {
            setMensaje((prevMensaje) => (prevMensaje ? prevMensaje + '\n' + t('errorGuardar') + data.message : t('errorGuardar') + data.message));
        }
    };

    const handleGuardarNuevoRealizacion = async () => {
        const token = sessionStorage.getItem('access_token');
        const datosRealizacion: IndicadorRealizacion = {
            ...descripcionEditable,
            RegionsId: regionSeleccionada ?? undefined,
            Resultados: descripcionEditable.Resultados?.map((resultado) => ({
                ...resultado,
                RegionsId: regionSeleccionada ?? undefined,
            })),
        };
        const response = await FetchConRefreshRetry(`${ApiTarget}/nuevoIndicadores`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(esADR ? datosRealizacion : descripcionEditable),
        });
        if (response && !response.ok) {
            const errorInfo = gestionarErrorServidor(response);
            setErrorMessage(errorInfo.mensaje);
            return;
        }
        if (response.ok) {
            const indicadorNuevo = await response.json();

            let realizaciones: IndicadorRealizacion[] = [];
            const storedRealizacion = localStorage.getItem('indicadoresRealizacion');
            if (storedRealizacion) {
                realizaciones = JSON.parse(storedRealizacion);
            }
            realizaciones.push({
                ...descripcionEditable,
                Id: indicadorNuevo.data.Id,
                RegionsId: regionSeleccionada ?? undefined,
            });

            if (indicadorNuevo.data.Resultados && indicadorNuevo.data.Resultados.length > 0) {
                let resultados: IndicadorRealizacion[] = [];
                const storedResultado = localStorage.getItem('indicadoresResultado');
                if (storedResultado) {
                    resultados = JSON.parse(storedResultado);
                }
                const idsEnresultados = new Set(resultados.map((obj) => obj.Id));
                indicadorNuevo.data.Resultados.forEach((obj: IndicadorRealizacion) => {
                    if (!idsEnresultados.has(obj.Id)) {
                        resultados.push({
                            Id: obj.Id,
                            NameEs: obj.NameEs,
                            CalculationMethodology: obj.CalculationMethodology,
                            Description: obj.Description,
                            NameEu: obj.NameEu,
                            RegionsId: obj.RegionsId,
                            RelatedAxes: obj.RelatedAxes,
                            Resultados: obj.Resultados,
                        });
                    }
                });
            }
            validadorRespuestasBBDD(response, indicadorNuevo);
        }
    };

    const handleEditarIndicadorRealizacion = async () => {
        const token = sessionStorage.getItem('access_token');
        const response = await FetchConRefreshRetry(`${ApiTarget}/editarIndicadorRealizacion`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(descripcionEditable),
        });
        if (response && !response.ok) {
            const errorInfo = gestionarErrorServidor(response);
            setErrorMessage(errorInfo.mensaje);
            return;
        }
        if (response.ok) {
            const indicadoreditado = await response.json();
            validadorRespuestasBBDD(response, indicadoreditado);
        }
    };

    const handleEditarIndicadorResultado = async () => {
        const token = sessionStorage.getItem('access_token');
        const response = await FetchConRefreshRetry(`${ApiTarget}/editarIndicadorResultado`, {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(descripcionEditable),
        });

        if (response && !response.ok) {
            const errorInfo = gestionarErrorServidor(response);
            setErrorMessage(errorInfo.mensaje);
            return;
        }

        if (response.ok) {
            const indicadoreditado = await response.json();
            validadorRespuestasBBDD(response, indicadoreditado);
        }
    };

    const cambiosIndicadorRealizacionSinResultados = (data: IndicadorRealizacion) => {
        setDescripcionEditable((prev) => ({
            ...prev,
            NameEs: data.NameEs,
            NameEu: data.NameEu,
            RelatedAxes: data.RelatedAxes,
            Description: data.Description,
            DisaggregationVariables: data.DisaggregationVariables,
            CalculationMethodology: data.CalculationMethodology,
        }));
    };

    const BotonResultadosRelacionados: React.FC = () => {
        if (tipoIndicador === 'resultado') {
            return <></>;
        }
        return (
            <>
                {mostrarResultadoRelacionado ? (
                    <button
                        onClick={() => {
                            if (descripcionEditable.Resultados && descripcionEditable.Resultados.length > 0) {
                                const confirmacion = window.confirm(t('modalEliminarIndicadoresResultados'));
                                if (!confirmacion) return;
                                setDescripcionEditable((prev) => ({
                                    ...prev,
                                    Resultados: [],
                                }));
                            }
                            setMostrarResultadoRelacionado(false);
                        }}
                        className="btn btn-danger mx-auto block"
                    >
                        {t('sinIndicadorResultadoRelacionado')}
                    </button>
                ) : (
                    <button onClick={() => setMostrarResultadoRelacionado(true)} className="btn btn-primary mx-auto block">
                        {t('agregarIndicadorResultadoRelacionado')}
                    </button>
                )}
            </>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div
                className={`bg-white p-6 rounded-xl shadow-lg relative transition-all duration-300 flex
            ${mostrarResultadoRelacionado ? 'w-full max-w-4xl' : 'w-full max-w-md'}
        `}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`flex-1 transition-all duration-300 ${mostrarResultadoRelacionado ? 'pr-8' : ''}`}>
                    <button className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl" onClick={onClose}>
                        ×
                    </button>

                    <h2 className="text-xl font-bold mb-4">{t('newIndicador', { tipo: t('Realizacion') })}</h2>

                    <div className="space-y-4">
                        <RellenoIndicador
                            indicadorRealizacion={descripcionEditable}
                            onChange={cambiosIndicadorRealizacionSinResultados}
                            tipoIndicador={tipoIndicador ? tipoIndicador : 'realizacion'}
                            editandoResultadoModal={null}
                        />

                        <BotonResultadosRelacionados />

                        <button
                            onClick={() => {
                                let mensajeError = '';
                                if ((i18n.language === 'eu' && !descripcionEditable.NameEu) || (i18n.language === 'es' && !descripcionEditable.NameEs)) {
                                    mensajeError += `${t('errorMissingFields')}`;
                                }
                                try {
                                    if (esNuevo) {
                                        handleGuardarNuevoRealizacion();
                                    } else if (tipoIndicador === 'realizacion') {
                                        handleEditarIndicadorRealizacion();
                                    } else if (tipoIndicador === 'resultado') {
                                        handleEditarIndicadorResultado();
                                    }
                                } catch (error) {
                                    const errorInfo = gestionarErrorServidor(error);
                                    setErrorMessage(errorInfo.mensaje);
                                }

                                if (mensajeError && mensajeError?.length > 0) {
                                    setMensaje((prevMensaje) => (prevMensaje ? prevMensaje + '\n' + t('errorGuardar') + mensajeError : t('errorGuardar') + mensajeError));
                                    return;
                                }
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                        >
                            {t('guardar')}
                            {errorMessage && <Aviso textoAviso={errorMessage} tipoAviso="error" icon={false} />}
                        </button>

                        {mensaje && <p className="text-sm text-center mt-2">{mensaje}</p>}
                    </div>
                </div>

                {mostrarResultadoRelacionado && (
                    <>
                        <div className="w-px bg-gray-300 mx-4 self-stretch" />
                        <div className="flex-1 min-w-[300px]">
                            <h2 className="text-xl font-bold mb-4">
                                {t('Indicadores')} {t('Resultado')}
                            </h2>
                            <div>
                                <SelectorOCreador indicadorRealizacion={descripcionEditable} setDescripcionEditable={setDescripcionEditable} isOpen={isOpen} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export const TablaIndicadores: React.FC = () => {
    const {
        indicadoresRealizacion,
        setIndicadoresRealizacion,
        indicadoresResultado,
        setIndicadoresResultado,
        indicadoresRealizacionADR,
        setIndicadoresRealizacionADR,
        indicadoresResultadoADR,
        setIndicadoresResultadoADR,
        indicadorSeleccionado,
        setIndicadorSeleccionado,
    } = useIndicadoresContext();

    const esPaginaPorDefecto = location.pathname === '/';

    const esADR = esPaginaPorDefecto || location.pathname.includes('ADR');
    const { regionSeleccionada } = useRegionContext();

    const listaRealizacion = esADR ? indicadoresRealizacionADR : indicadoresRealizacion;
    const setListaRealizacion = esADR ? setIndicadoresRealizacionADR : setIndicadoresRealizacion;

    const listaResultado = esADR ? indicadoresResultadoADR : indicadoresResultado;
    const setListaResultado = esADR ? setIndicadoresResultadoADR : setIndicadoresResultado;

    const { t, i18n } = useTranslation();
    const [errorMessageRealizacion, setErrorMessageRealizacion] = useState<string | null>(null);
    const [errorMessageResultado, setErrorMessageResultado] = useState<string | null>(null);
    const [successMessageRealizacion, setSuccessMessageRealizacion] = useState<string | null>(null);
    const [successMessageResultado, setSuccessMessageResultado] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState<boolean>(false);
    const [modalEditarRealizacion, setModalEditarRealizacion] = useState(false);
    const [modalEditarResultado, setModalEditarResultado] = useState(false);
    const [datosPreEditados, setDatosPreEditados] = useState<IndicadorRealizacion>(indicadorInicial);

    const actualizarIndicadorResultadosAlEliminarEnRealizacion = (indicadorResultadoSeleccionado: IndicadorRealizacion, idExcluir: number[] = []) => {
        let resultadoIds = [...(indicadorResultadoSeleccionado.Resultados?.map((r) => r.Id) || [])];

        const resultadosRelacionados = new Set<number>();
        for (const ind of listaRealizacion) {
            if (ind.Id === indicadorResultadoSeleccionado.Id) continue;
            ind.Resultados?.forEach((r) => {
                resultadosRelacionados.add(r.Id);
            });
        }
        resultadoIds = resultadoIds.filter((id) => !resultadosRelacionados.has(id) && !idExcluir.includes(id));
        setListaResultado((prev) => prev.filter((r) => !resultadoIds.includes(r.Id)));
    };

    const editarIndicadorResultados = (indicadorActualizado: IndicadorResultado) => {
        if (indicadorActualizado.RegionsId) {
            setListaResultado((prev) => prev.map((ind) => (ind.RegionsId === `${indicadorActualizado.RegionsId}` && ind.Id === indicadorActualizado.Id ? indicadorActualizado : ind)));
        } else {
            setListaResultado((prev) => prev.map((ind) => (ind.Id === indicadorActualizado.Id ? indicadorActualizado : ind)));
        }
        const nuevaListaRealizacion = listaRealizacion.map((indicadorRealizado) => {
            if (indicadorRealizado.RegionsId === indicadorActualizado.RegionsId) {
                const nuevosResultados =
                    indicadorRealizado.Resultados?.map((indicadorResultado) => {
                        if (indicadorResultado.Id === indicadorActualizado.Id) {
                            // Sustituye por el actualizado
                            return { ...indicadorActualizado };
                        }
                        return indicadorResultado;
                    }) || [];
                return {
                    ...indicadorRealizado,
                    Resultados: nuevosResultados,
                };
            }
            return indicadorRealizado;
        });
        setListaRealizacion(nuevaListaRealizacion);
    };

    const actualizarBorradoIndicadorRealizacion = (indicadorActualizado: IndicadorRealizacion) => {
        const datosIndicadorRealizacionAnterior = indicadoresRealizacion.find((ind) => ind.Id === indicadorActualizado.Id);
        if (!datosIndicadorRealizacionAnterior) return;

        const resultadosAnteriores = datosIndicadorRealizacionAnterior.Resultados ?? [];
        const resultadosActualizados = indicadorActualizado.Resultados ?? [];

        const idsAnteriores = new Set(resultadosAnteriores.map((r) => r.Id));
        const idsActualizados = new Set(resultadosActualizados.map((r) => r.Id));

        const resultadosEliminados = [...idsAnteriores].filter((id) => !idsActualizados.has(id));

        if (resultadosEliminados.length === 0) return;

        const idsAEliminarDefinitivos: number[] = [];

        for (const idEliminado of resultadosEliminados) {
            const apareceEnOtroIndicador = indicadoresRealizacion.some((indicador) => indicador.Id !== indicadorActualizado.Id && indicador.Resultados?.some((r) => r.Id === idEliminado));

            if (!apareceEnOtroIndicador) {
                idsAEliminarDefinitivos.push(idEliminado);
            }
        }

        if (idsAEliminarDefinitivos.length > 0) {
            setIndicadoresResultadoADR((prev) => prev.filter((r) => !idsAEliminarDefinitivos.includes(r.Id)));
        }
    };

    const actualizarIndicadorResultados = (indicadorActualizado: IndicadorRealizacion) => {
        actualizarBorradoIndicadorRealizacion(indicadorActualizado);
        if (esADR) {
            setIndicadoresRealizacionADR((prev) => prev.map((ind) => (ind.RegionsId === regionSeleccionada && ind.Id === indicadorActualizado.Id ? indicadorActualizado : ind)));
        } else {
            setIndicadoresRealizacion((prev) => {
                const nuevoEstado = prev.map((ind) => {
                    if (ind.Id === indicadorActualizado.Id) {
                        return indicadorActualizado;
                    }
                    return ind;
                });

                return nuevoEstado;
            });
        }

        for (const ind of indicadorActualizado.Resultados!) {
            editarIndicadorResultados(ind);
        }

        const idsPreEditados = datosPreEditados.Resultados?.map((r) => r.Id) || [];
        const idsActualizados = new Set(indicadorActualizado.Resultados?.map((r) => r.Id) || []);
        const idsEliminados = idsPreEditados.filter((id) => !idsActualizados.has(id));
        const resultadosNoRelacionados = new Set<number>();
        for (const ind of listaRealizacion) {
            if (ind.Id === indicadorActualizado.Id) continue;
            ind.Resultados?.forEach((r) => {
                const id = Number(r.Id);
                if (idsEliminados.includes(id)) {
                    resultadosNoRelacionados.add(id);
                }
            });
        }
    };

    const actualizarEliminarIndicadorRealizacion = (indicadorRealizacionSeleccionado: IndicadorRealizacion) => {
        setListaRealizacion((prev) => {
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
        setErrorMessageRealizacion(null);
        setSuccessMessageRealizacion(null);
        const token = sessionStorage.getItem('access_token');
        const confirmDelete = window.confirm(t('confirmarEliminar', { nombre: i18n.language === 'eu' ? indiRealizacionAEliminar.NameEu : indiRealizacionAEliminar.NameEs }));
        if (!confirmDelete) return;
        try {
            const response = await FetchConRefreshRetry(`${ApiTarget}/eliminarIndicadorRealizacion/${indiRealizacionAEliminar.Id}`, {
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

            if (response && !response.ok) {
                const errorInfo = gestionarErrorServidor(response);
                setErrorMessageRealizacion(errorInfo.mensaje);
                return;
            }

            actualizarEliminarIndicadorRealizacion(indiRealizacionAEliminar);
            setSuccessMessageRealizacion(t('eliminacionExitosa'));

            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setSuccessMessageRealizacion(null);
                    setFadeOut(false);
                }, 1000);
            }, 5000);
        } catch (err: unknown) {
            const errorInfo = gestionarErrorServidor(err);
            setErrorMessageRealizacion(errorInfo.mensaje);
        }
    };

    const eliminarIndicadorResultado = async (indiResultadoAEliminar: IndicadorResultado) => {
        setErrorMessageResultado(null);
        setSuccessMessageResultado(null);
        const token = sessionStorage.getItem('access_token');
        const confirmDelete = window.confirm(t('confirmarEliminar', { nombre: i18n.language === 'eu' ? indiResultadoAEliminar.NameEu : indiResultadoAEliminar.NameEs }));
        if (!confirmDelete) return;
        try {
            const response = await FetchConRefreshRetry(`${ApiTarget}/eliminarIndicadorResultado/${indiResultadoAEliminar.Id}`, {
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

            if (response && !response.ok) {
                const errorInfo = gestionarErrorServidor(response);
                setErrorMessageResultado(errorInfo.mensaje);
                return;
            }
            setSuccessMessageResultado(t('eliminacionExitosa'));
            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setSuccessMessageResultado(null);
                    setFadeOut(false);
                }, 1000);
            }, 5000);

            const nuevaListaIndicadorResultado = listaResultado.filter((indicador) => indicador.Id !== indiResultadoAEliminar.Id);
            setListaResultado(nuevaListaIndicadorResultado);

            setListaRealizacion((prev) => {
                const nuevoArray = prev.map((ind) => ({
                    ...ind,
                    Resultados: ind.Resultados?.filter((r) => r.Id !== indiResultadoAEliminar.Id) || [],
                }));
                return nuevoArray;
            });
        } catch (err: unknown) {
            const errorInfo = gestionarErrorServidor(err);
            setErrorMessageResultado(errorInfo.mensaje);
        }
    };

    return (
        <>
            {listaRealizacion && listaRealizacion.length > 0 && (
                <div className={`h-full panel w-1/2}`}>
                    {indicadorSeleccionado?.tipo === 'Realizacion' && errorMessageRealizacion && <Aviso textoAviso={errorMessageRealizacion} tipoAviso="error" icon={false} />}
                    {indicadorSeleccionado?.tipo === 'Realizacion' && successMessageRealizacion && (
                        <div className={`mt-4 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                            <p className="text-green-500">{successMessageRealizacion}</p>
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
                                {listaRealizacion
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
                                                                    setDatosPreEditados(JSON.parse(JSON.stringify(data)));
                                                                    setModalEditarRealizacion(true);
                                                                    setIndicadorSeleccionado({
                                                                        tipo: 'Realizacion',
                                                                        ADR: esADR,
                                                                        indicador: data,
                                                                        accion: 'Editar',
                                                                        resultadosListado: data.Resultados ? data.Resultados : [],
                                                                    });
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
                    {modalEditarRealizacion && indicadorSeleccionado?.tipo === 'Realizacion' && (
                        <ModalNuevoIndicador
                            isOpen={modalEditarRealizacion}
                            onClose={() => {
                                setModalEditarRealizacion(false);
                                setIndicadorSeleccionado(null);
                            }}
                            tipoIndicador={'realizacion'}
                            onSave={(indicadorActualizado) => {
                                actualizarIndicadorResultados(indicadorActualizado);
                            }}
                        />
                    )}
                </div>
            )}

            {listaResultado && listaResultado.length > 0 && (
                <div className={`h-full panel w-1/2}`}>
                    {indicadorSeleccionado?.tipo === 'Resultado' && errorMessageResultado && <Aviso textoAviso={errorMessageResultado} tipoAviso="error" icon={false} />}
                    {indicadorSeleccionado?.tipo === 'Resultado' && successMessageResultado && (
                        <div className={`mt-4 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                            <p className="text-green-500">{successMessageResultado}</p>
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
                                {listaResultado
                                    .slice()
                                    .reverse()
                                    .map((data) => {
                                        if (esADR && formateaConCeroDelante(`${data.RegionsId}`) !== regionSeleccionada) {
                                            return;
                                        }
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
                                                                    setDatosPreEditados(JSON.parse(JSON.stringify(data)));
                                                                    setModalEditarResultado(true);
                                                                    setIndicadorSeleccionado({
                                                                        tipo: 'Resultado',
                                                                        ADR: esADR,
                                                                        indicador: data,
                                                                        accion: 'Editar',
                                                                    });
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
                    {modalEditarResultado && indicadorSeleccionado?.tipo === 'Resultado' && (
                        <ModalNuevoIndicador
                            isOpen={modalEditarResultado}
                            onClose={() => {
                                setModalEditarResultado(false);
                                setIndicadorSeleccionado(null);
                            }}
                            tipoIndicador={'resultado'}
                            onSave={(indicadorActualizado) => {
                                editarIndicadorResultados(indicadorActualizado);
                            }}
                        />
                    )}
                </div>
            )}
        </>
    );
};

type PropsLlamadaIndicadores = {
    setMensajeError: Dispatch<SetStateAction<string>>;
    setIndicadoresRealizacion: Dispatch<SetStateAction<IndicadorRealizacion[]>>;
    setIndicadoresResultado: Dispatch<SetStateAction<IndicadorResultado[]>>;
    setFechaUltimoActualizadoBBDD: Dispatch<SetStateAction<Date>>;
    t: (clave: string) => string;
};
export const llamadaBBDDIndicadores = async ({ setMensajeError, setIndicadoresRealizacion, setIndicadoresResultado, setFechaUltimoActualizadoBBDD, t }: PropsLlamadaIndicadores) => {
    const token = sessionStorage.getItem('access_token');
    try {
        const res = await FetchConRefreshRetry(`${ApiTarget}/indicadores`, {
            headers: {
                Authorization: `Bearer ` + token,
                'Content-Type': 'application/json',
            },
        });

        const data = await res.json();
        const datosIndicador: IndicadorRealizacion[] = data.data;
        if (!res.ok) {
            setMensajeError(data.Message || t('errorObtenerIndicadores'));
            throw new Error(data.Message || t('errorObtenerIndicadores'));
        }
        setIndicadoresRealizacion(datosIndicador);
        localStorage.setItem('indicadoresRealizacion', JSON.stringify(datosIndicador));

        const indicadoresResultado: IndicadorResultado[] = datosIndicador
            .flatMap((r: IndicadorRealizacion) => r.Resultados || [])
            .filter((res, index, self) => self.findIndex((x) => x.Id === res.Id) === index)
            .sort((a, b) => a.Id - b.Id);

        setIndicadoresResultado(indicadoresResultado);
        setFechaUltimoActualizadoBBDD(new Date());
        localStorage.setItem('indicadoresResultado', JSON.stringify(indicadoresResultado));

        const datosFiltradosBorrar = datosIndicador.filter((di) => di.RegionsId === '1');
        const resultadosFiltrados = datosIndicador.flatMap((realizacion) => realizacion.Resultados || []).filter((resultado) => resultado.RegionsId === '1');
        const maxLength = Math.max(datosFiltradosBorrar.length, resultadosFiltrados.length);
        const tabla = [];

        for (let i = 0; i < maxLength; i++) {
            tabla.push({
                Realizacion: datosFiltradosBorrar[i]?.NameEs || '',
                Resultado: resultadosFiltrados[i]?.NameEs || '',
            });
        }
    } catch (e) {
        console.error('Error llamadaBBDDIndicadores', e);
    }
};

function generarCodigoRegion(name: string): string | null {
    // Normalizar y limpiar el nombre: quitar tildes, convertir a mayúsculas
    const limpio = name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '') // quitar tildes
        .toUpperCase();

    // Dividir palabras por espacio o guion
    const palabras = limpio.split(/[\s-]+/).filter(Boolean);

    // Función para validar que un string tenga solo letras (A-Z)
    const soloLetras = (str: string) => /^[A-Z]+$/.test(str);

    // 1. Dos iniciales de las dos primeras palabras
    if (palabras.length >= 2 && soloLetras(palabras[0][0]) && soloLetras(palabras[1][0])) {
        return palabras[0][0] + palabras[1][0];
    }

    // 2. Dos iniciales de la primera palabra (si tiene al menos 2 letras)
    if (palabras.length >= 1 && palabras[0].length >= 2 && soloLetras(palabras[0].slice(0, 2))) {
        return palabras[0].slice(0, 2);
    }

    // 3. Inicial y la letra del medio de la primera palabra (si es impar y tiene al menos 3 letras)
    if (palabras.length >= 1 && palabras[0].length >= 3 && soloLetras(palabras[0][0])) {
        const palabra = palabras[0];
        const medio = Math.floor(palabra.length / 2);
        if (soloLetras(palabra[medio])) {
            return palabra[0] + palabra[medio];
        }
    }

    // 4. Otros métodos: primera y última letra (si cumple)
    if (palabras.length >= 1 && palabras[0].length >= 2 && soloLetras(palabras[0][0]) && soloLetras(palabras[0][palabras[0].length - 1])) {
        return palabras[0][0] + palabras[0][palabras[0].length - 1];
    }

    // 5. Si no cumple nada, devolver null para indicar que no hay código válido
    return null;
}

function generarCodigosRegiones(regiones: Region | Region[]): Record<string, string> {
    const codigos: Record<number, string> = {};
    const usados = new Set<string>();

    const listaRegiones = Array.isArray(regiones) ? regiones : [regiones];

    listaRegiones.forEach(({ RegionId, NameEs }) => {
        const codigo = generarCodigoRegion(NameEs);

        // Intentar evitar duplicados añadiendo un número al final (menos ideal pero para casos límite)
        let intento = codigo;
        let sufijo = 1;
        while (intento && usados.has(intento)) {
            // cambiar la segunda letra por un número o sustituir si no se puede
            intento = codigo ? codigo[0] + sufijo.toString() : null;
            sufijo++;
        }

        if (intento) {
            usados.add(intento);
            codigos[RegionId] = intento;
        } else {
            codigos[RegionId] = '??';
        }
    });

    return codigos;
}

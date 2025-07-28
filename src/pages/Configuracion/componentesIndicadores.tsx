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
import { useIndicadoresContext } from '../../contexts/IndicadoresContext';
export type TipoIndicador = 'realizacion' | 'resultado';

interface RellenoIndicadorProps {
    origen: string;
    indicadorRealizacion: IndicadorRealizacion;
    onChange: (data: IndicadorRealizacion) => void;
    tipoIndicador: TipoIndicador;
    indicadorResultado?: IndicadorResultado[] | null;
}

const rellenoIndicadorEdicion = (nombre: string, indicadorRealizacion: IndicadorRealizacion) => {
    const posicionPunto = nombre.indexOf('.');
    if (posicionPunto > 0 && posicionPunto < 5) {
        return [nombre.slice(0, 4), nombre.slice(5)];
    } else {
        return [indicadorRealizacion.NameEs.slice(0, 6), indicadorRealizacion.NameEs.slice(7)];
    }
};

export const RellenoIndicador: React.FC<RellenoIndicadorProps> = ({ origen, indicadorRealizacion, onChange, tipoIndicador, indicadorResultado }) => {
    const { t, i18n } = useTranslation();
    const { indicadoresRealizacion, indicadoresResultado, indicadorSeleccionada } = useIndicadoresContext();

    const { regionSeleccionada, regiones } = useRegionContext();

    const SacarSiguienteEnumeracionIndicadores = (indicadorRealizacion: IndicadorRealizacion, tipoIndicador: TipoIndicador): string[] => {
        const nombre = indicadorRealizacion.NameEs;
        const inicializacionNombre = tipoIndicador === 'realizacion' ? 'RE' : 'RS';
        const creacion = indicadorRealizacion.NameEs.length === 0;

        if (origen === 'indicadores/TablaIndicadoresRealizacion/Modal' || origen === 'indicadores/TablaIndicadoresResultado/Modal') {
            return rellenoIndicadorEdicion(nombre, indicadorRealizacion);
        } else if (origen === 'indicadores/TablaIndicadoresRealizacion/Modal/SelectorOCreador') {
            const posicionPunto = nombre.indexOf('.');
            const indicadorRegion = posicionPunto > 0 && posicionPunto < 5;

            if (creacion) {
                let suma = 0;
                if (indicadorRegion) {
                    return [nombre.slice(0, 4), nombre.slice(5)];
                } else {
                    const codRegion = indicadorSeleccionada?.NameEs.slice(4, 6);
                    const inicial = indicadorSeleccionada?.RegionsId;
                    if (indicadoresRealizacion) {
                        if (inicial) {
                            suma = indicadoresRealizacion.filter((r) => Array.isArray(r.RegionsId) && r.RegionsId.includes(inicial)).length;
                        }
                    }

                    const numeroActual = suma ? 1 + suma : 1;

                    const num = numeroActual ? numeroActual : 1;
                    const numeracion = num < 10 ? `0${num}` : `${num}`;
                    return [`${inicializacionNombre}${numeracion}${codRegion}`];
                }
            } else {
                return rellenoIndicadorEdicion(nombre, indicadorRealizacion);
            }
        } else if (origen === 'indicadoresNuevo/Modal') {
            const storedRealiza: IndicadorResultado[] = indicadoresRealizacion.filter((re) => re.RegionsId === '0' || re.RegionsId === undefined || re.RegionsId === null);
            const realizacion: IndicadorRealizacion = storedRealiza[storedRealiza.length - 1];
            let numeroActual = Number(realizacion.NameEs.slice(2, 4));
            numeroActual++;
            const num = numeroActual ? numeroActual : 1;
            const numeracion = num < 10 ? `0${num}` : `${num}`;
            return [`${inicializacionNombre}${numeracion}`];
        } else if (origen === 'indicadoresNuevo/Modal/SelectorOCreador') {
            const storedRealiza: IndicadorResultado[] = indicadoresResultado.filter((re) => re.RegionsId === '0' || re.RegionsId === undefined || re.RegionsId === null);
            const realizacion: IndicadorRealizacion = storedRealiza[storedRealiza.length - 1];
            let numeroActual = Number(realizacion.NameEs.slice(2, 4));

            numeroActual++;
            let suma = 0;
            if (indicadorResultado) {
                suma = indicadorResultado.filter((r) => r.Id === 0).length;
            }
            numeroActual = suma ? numeroActual + suma : numeroActual;
            const num = numeroActual ? numeroActual : 1;
            const numeracion = num < 10 ? `0${num}` : `${num}`;
            return [`${inicializacionNombre}${numeracion}`];
        } else if (origen === 'indicadoresADRNuevo/Modal') {
            const storedResultado = localStorage.getItem('indicadoresResultadoFiltrado');
            let codRegion = '';
            if (storedResultado && storedResultado !== '[]') {
                const indicadoresRealizacion: IndicadorResultado[] = JSON.parse(storedResultado);
                codRegion = indicadoresRealizacion[indicadoresRealizacion.length - 1].NameEs.slice(4, 6);
            } else {
                codRegion = regionSeleccionada ? generarCodigosRegiones(regiones)[regionSeleccionada] : '';
            }

            const storedRealiza: IndicadorResultado[] = indicadoresRealizacion.filter((re) => re.RegionsId === `${regionSeleccionada}`);

            let numeroActual = 0;
            if (storedRealiza.length > 0) {
                const realizacion: IndicadorRealizacion = storedRealiza[storedRealiza.length - 1];
                numeroActual = Number(realizacion.NameEs.slice(2, 4));
            }
            numeroActual++;
            const num = numeroActual ? numeroActual : 1;
            const numeracion = num < 10 ? `0${num}` : `${num}`;
            return [`${inicializacionNombre}${numeracion}${codRegion}`];
        } else if (origen === 'indicadoresADRNuevo/Modal/SelectorOCreador' || origen === 'indicadoresADR/TablaIndicadoresRealizacion/Modal/SelectorOCreador') {
            if (!creacion) {
                return [nombre.slice(0, 6), nombre.slice(7)];
            } else {
                const storedResultado = localStorage.getItem('indicadoresResultadoFiltrado');
                let codRegion = '';
                if (storedResultado && storedResultado !== '[]') {
                    const indicadoresRealizacion: IndicadorResultado[] = JSON.parse(storedResultado);
                    codRegion = indicadoresRealizacion[indicadoresRealizacion.length - 1].NameEs.slice(4, 6);
                } else {
                    codRegion = regionSeleccionada ? generarCodigosRegiones(regiones)[regionSeleccionada] : '';
                }

                const storedRealiza: IndicadorResultado[] = indicadoresRealizacion.filter((re) => re.RegionsId === `${regionSeleccionada}`);
                const realizacion: IndicadorRealizacion = storedRealiza[storedRealiza.length - 1];
                let numeroActual = 0;
                if (realizacion && realizacion.Resultados!.length > 0) {
                    numeroActual = realizacion.Resultados ? Number(realizacion.Resultados[realizacion.Resultados?.length - 1].NameEs.slice(2, 4)) : 0;
                } else {
                    if (indicadorResultado) {
                        numeroActual += indicadorResultado.filter((r) => r.NameEs.includes(codRegion)).length;
                    }
                }
                numeroActual = numeroActual ? 1 + numeroActual : 1;
                const num = numeroActual ? numeroActual : 1;
                const numeracion = num < 10 ? `0${num}` : `${num}`;
                return [`${inicializacionNombre}${numeracion}${codRegion}`];
            }
        } else if (origen === 'indicadoresADR/TablaIndicadoresRealizacion/Modal' || origen === 'indicadoresADR/TablaIndicadoresResultado/Modal') {
            return [nombre.slice(0, 6), nombre.slice(7)];
        }
        return [];
    };

    const [formData, setFormData] = useState<IndicadorRealizacion>(indicadorRealizacion);
    const indicador = SacarSiguienteEnumeracionIndicadores(indicadorRealizacion, tipoIndicador);
    const [nombreIndicador, setNombreIndicador] = useState<string>(indicador[1]);

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
                    <input type="text" name={i18n.language === 'eu' ? 'NameEu' : 'NameEs'} className="flex-1 p-2 border" value={nombreIndicador} onChange={handleChangeNombre} />
                </div>
            </div>
            <div>
                <label className="block font-medium">{t('unitMed')}</label>
                <select name="unidad" className="w-full p-2 border rounded" onChange={handleChange}>
                    <option value="NUMERO">NUMERO</option>
                    <option value="OTRO">OTRO</option>
                </select>
            </div>

            <div>
                <label className="block font-medium">{t('ejesRelacionados')}</label>
                <input type="text" name="RelatedAxes" className="w-full p-2 border rounded" value={formData.RelatedAxes} onChange={handleChange} />
            </div>

            <div>
                <label className="block font-medium">{t('Definicion')}</label>
                <input type="text" name="Description" className="w-full p-2 border rounded" value={formData.Description} onChange={handleChange} />
            </div>

            <div>
                <label className="block font-medium">{t('VariablesDesagregacion')}</label>
                <input type="text" name="DisaggregationVariables" className="w-full p-2 border rounded" value={formData.DisaggregationVariables} onChange={handleChange} />
            </div>

            <div>
                <label className="block font-medium">{t('MTOCalculo')}</label>
                <input type="text" name="CalculationMethodology" className="w-full p-2 border rounded" value={formData.CalculationMethodology} onChange={handleChange} />
            </div>
        </div>
    );
};

interface RellenoIndicadorResultadoProps {
    origen: string;
    indicadorRealizacion: IndicadorRealizacion;
}

export const SelectorOCreador: React.FC<RellenoIndicadorResultadoProps> = ({ origen, indicadorRealizacion }) => {
    const { t, i18n } = useTranslation();
    const indicadoresResultados: IndicadorResultado[] = JSON.parse(localStorage.getItem('indicadoresResultado') || '[]');
    const [opciones] = useState(indicadoresResultados);
    const [seleccion, setSeleccion] = useState('');
    const [modoCrear, setModoCrear] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [filaEditar, setFilaEditar] = useState(0);

    const [refrescarZona, setRefrescarZona] = useState(false);

    const indicadorResultadoConRegionsId = {
        ...indicadorResultadoinicial,
        RegionsId: indicadorRealizacion.RegionsId,
    };

    const [descripcionEditable, setDescripcionEditable] = useState<IndicadorResultado>(indicadorResultadoConRegionsId);

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
        indicadorRealizacion.Resultados = [...indicadorRealizacion.Resultados!, descripcionEditable];
        setModoCrear(false);
        setDescripcionEditable(indicadorResultadoinicial);
    };

    const modificarIndicadorResultadoExistente = (data: IndicadorResultado) => {
        indicadorRealizacion.Resultados![filaEditar] = data;
        setModoCrear(false);
        setModoEditar(false);
        setDescripcionEditable(indicadorResultadoinicial);
    };

    const incorporarIndicadorResultado = (selectedOp: IndicadorResultado) => {
        indicadorRealizacion.Resultados = [...indicadorRealizacion.Resultados!, selectedOp];
        setRefrescarZona((prev) => !prev);
    };

    const eliminarIndicadorResultado = (selectedOp: IndicadorResultado) => {
        if (indicadorRealizacion.Resultados) {
            indicadorRealizacion.Resultados = indicadorRealizacion.Resultados.filter((resultado) => resultado.Id !== selectedOp.Id);
        }
        setRefrescarZona((prev) => !prev);
    };

    const ZonaListadoResultados = React.memo(() => {
        const opcionesFiltradas = opciones.filter((op) => {
            const yaAsignado = indicadorRealizacion.Resultados!.some((resultado) => resultado.Id === op.Id);

            const regionCompatible = op.RegionsId === indicadorRealizacion.RegionsId;
            // Listado con los indicadores generales comentado
            // const regionCompatible = op.RegionsId === indicadorRealizacion.RegionsId || op.RegionsId === undefined || op.RegionsId === '0' || op.RegionsId === null;
            return !yaAsignado && regionCompatible;
        });

        return (
            <>
                <label className="block font-bold mb-2">{t('seleccionaopcion')}:</label>
                <div className="flex gap-2">
                    {opcionesFiltradas.length > 0 && (
                        <select
                            className="flex-1 border p-2 rounded"
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
    });

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
                            origen={origen + '/SelectorOCreador'}
                            indicadorRealizacion={descripcionEditable}
                            onChange={cambiosIndicadorEditable}
                            tipoIndicador="resultado"
                            indicadorResultado={indicadorRealizacion?.Resultados ?? null}
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
    origen: string;
    isOpen: boolean;
    onClose: () => void;
    accion: 'Editar' | 'Nuevo';
    datosIndicador?: IndicadorRealizacion;
    onSave?: (indicadorActualizado: IndicadorRealizacion) => void;
    tipoIndicador?: TipoIndicador;
};

export const ModalNuevoIndicador: React.FC<ModalNuevoIndicadorProps> = ({ origen, isOpen, onClose, onSave, accion, datosIndicador, tipoIndicador }) => {
    const { t, i18n } = useTranslation();
    const { regionSeleccionada } = useRegionContext();
    const location = useLocation();
    const esADR = location.pathname?.includes('ADR');
    const esNuevo = accion === 'Nuevo';

    const indicadorInicialConRegionsId: IndicadorRealizacion = {
        ...indicadorInicial,
        RegionsId: datosIndicador && datosIndicador.RegionsId ? datosIndicador.RegionsId : `${regionSeleccionada}`,
    };
    const indicadorInicializado = esADR ? indicadorInicialConRegionsId : indicadorInicial;
    const [descripcionEditable, setDescripcionEditable] = useState<IndicadorRealizacion>(esNuevo ? indicadorInicializado : datosIndicador ?? indicadorInicializado);
    const [mensaje, setMensaje] = useState('');
    const hayResultados = tipoIndicador != 'resultado' ? (descripcionEditable.Resultados!.length > 0 ? true : false) : false;
    const [mostrarResultadoRelacionado, setMostrarResultadoRelacionado] = useState(esNuevo ? false : hayResultados);

    useEffect(() => {
        if (accion === 'Nuevo') {
            setDescripcionEditable((prev) => ({
                ...prev,
                Resultados: [],
            }));
        }
    }, []);

    const { setIndicadoresRealizacion, indicadoresResultado, setIndicadoresResultado, setIndicadoresRealizacionADR, indicadoresResultadoADR, setIndicadoresResultadoADR } = useIndicadoresContext();

    const alctualizarEstadoNuevo = async (indicador: IndicadorRealizacion | IndicadorRealizacion) => {
        if (accion === 'Nuevo') {
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
                RegionsId: data.data.RegionsId ? `${data.data.RegionsId}` : regionSeleccionada ? `${regionSeleccionada}` : undefined,
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
        const token = sessionStorage.getItem('token');
        const datosRealizacion: IndicadorRealizacion = {
            ...descripcionEditable,
            RegionsId: regionSeleccionada ? regionSeleccionada.toString() : undefined,
            Resultados: descripcionEditable.Resultados?.map((resultado) => ({
                ...resultado,
                RegionsId: regionSeleccionada ? regionSeleccionada.toString() : undefined,
            })),
        };
        const response = await fetch('https://localhost:44300/api/nuevoIndicadores', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(esADR ? datosRealizacion : descripcionEditable),
        });
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
                RegionsId: regionSeleccionada ? regionSeleccionada.toString() : undefined,
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
        const token = sessionStorage.getItem('token');
        const response = await fetch('https://localhost:44300/api/editarIndicadorRealizacion', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(descripcionEditable),
        });

        if (response.ok) {
            const indicadoreditado = await response.json();
            validadorRespuestasBBDD(response, indicadoreditado);
        }
    };

    const handleEditarIndicadorResultado = async () => {
        const token = sessionStorage.getItem('token');
        const response = await fetch('https://localhost:44300/api/editarIndicadorResultado', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(descripcionEditable),
        });

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
                            origen={origen + '/Modal'}
                            indicadorRealizacion={descripcionEditable}
                            onChange={cambiosIndicadorRealizacionSinResultados}
                            tipoIndicador={tipoIndicador ? tipoIndicador : 'realizacion'}
                        />

                        <BotonResultadosRelacionados />

                        <button
                            onClick={() => {
                                let mensajeError = '';
                                if ((i18n.language === 'eu' && !descripcionEditable.NameEu) || (i18n.language === 'es' && !descripcionEditable.NameEs)) {
                                    mensajeError += `${t('errorMissingFields')}`;
                                }
                                if (esNuevo) {
                                    handleGuardarNuevoRealizacion();
                                } else if (tipoIndicador === 'realizacion') {
                                    handleEditarIndicadorRealizacion();
                                } else if (tipoIndicador === 'resultado') {
                                    handleEditarIndicadorResultado();
                                }
                                if (mensajeError && mensajeError?.length > 0) {
                                    setMensaje((prevMensaje) => (prevMensaje ? prevMensaje + '\n' + t('errorGuardar') + mensajeError : t('errorGuardar') + mensajeError));
                                    return;
                                }
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                        >
                            {t('guardar')}
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
                                <SelectorOCreador indicadorRealizacion={descripcionEditable} origen={origen + '/Modal'} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

interface TablaIndicadoresProps {
    origen: string;
}

export const TablaIndicadores: React.FC<TablaIndicadoresProps> = ({ origen }) => {
    const { indicadoresRealizacion, setIndicadoresRealizacion, indicadoresResultado, setIndicadoresResultado } = useIndicadoresContext();
    const { indicadoresRealizacionADR, setIndicadoresRealizacionADR, indicadoresResultadoADR, setIndicadoresResultadoADR, SeleccionEditarIndicador } = useIndicadoresContext();
    const esADR = location.pathname.includes('ADR');
    const { regionSeleccionada } = useRegionContext();

    const listaRealizacion = esADR ? indicadoresRealizacionADR : indicadoresRealizacion;
    const setListaRealizacion = esADR ? setIndicadoresRealizacionADR : setIndicadoresRealizacion;

    const listaResultado = esADR ? indicadoresResultadoADR : indicadoresResultado;
    const setListaResultado = esADR ? setIndicadoresResultadoADR : setIndicadoresResultado;

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
            setIndicadoresRealizacionADR((prev) => prev.map((ind) => (ind.RegionsId === `${regionSeleccionada}` && ind.Id === indicadorActualizado.Id ? indicadorActualizado : ind)));
        } else {
            setIndicadoresRealizacion((prev) => prev.map((ind) => (ind.Id === indicadorActualizado.Id ? indicadorActualizado : ind)));
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
        const idsParaEliminar = idsEliminados.filter((id) => !resultadosNoRelacionados.has(id));

        if (idsParaEliminar.length > 0) {
            setListaResultado((prev) => {
                const filtrados = prev.filter((resultado) => !idsParaEliminar.includes(resultado.Id));
                return filtrados;
            });
        }

        const idsAgregados = Array.from(idsActualizados).filter((id) => !idsPreEditados.includes(id));
        const idsExistentes = new Set(listaResultado.map((r) => r.Id));
        const nuevosResultados = indicadorActualizado.Resultados?.filter((r) => idsAgregados.includes(r.Id) && !idsExistentes.has(r.Id)) || [];
        if (nuevosResultados.length > 0) {
            setListaResultado((prev) => [...prev, ...nuevosResultados]);
        }
        setListaResultado((prev) =>
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

            actualizarEliminarIndicadorRealizacion(indiRealizacionAEliminar);
            setSuccessMessage(t('eliminacionExitosa'));

            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setSuccessMessage(null);
                    setFadeOut(false);
                }, 1000);
            }, 5000);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setErrorMessage(err.message || 'Error inesperado');
            } else {
                console.error('Error desconocido', err);
            }
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
            if (err instanceof Error) {
                setErrorMessage(err.message || 'Error inesperado');
            } else {
                console.error('Error desconocido', err);
            }
        }
    };

    return (
        <>
            {listaRealizacion && listaRealizacion.length > 0 && (
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
                                                                    setIndicadorSeleccionadoRealizacionEditar(data);
                                                                    setDatosPreEditados(JSON.parse(JSON.stringify(data)));
                                                                    setModalEditarRealizacion(true);
                                                                    SeleccionEditarIndicador(data);
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
                            origen={origen + '/TablaIndicadoresRealizacion'}
                            isOpen={modalEditarRealizacion}
                            onClose={() => {
                                setModalEditarRealizacion(false);
                            }}
                            accion="Editar"
                            datosIndicador={indicadorSeleccionadoRealizacionEditar}
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
                                {listaResultado
                                    .slice()
                                    .reverse()
                                    .map((data) => {
                                        if (esADR && data.RegionsId !== `${regionSeleccionada}`) {
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
                            origen={origen + '/TablaIndicadoresResultado'}
                            isOpen={modalEditarResultado}
                            onClose={() => setModalEditarResultado(false)}
                            accion="Editar"
                            datosIndicador={indicadorSeleccionadoResultadoEditar}
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
    const token = localStorage.getItem('token');
    try {
        const res = await fetch('https://localhost:44300/api/indicadores', {
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

        // console.table(tabla);
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

function generarCodigosRegiones(regiones: Region | Region[]): Record<number, string> {
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

export function ComodinFormatearCoincidenciasParaTabla(coincidencias: IndicadorRealizacion[]): Record<string, string | number>[] {
    const tablaIndicador = coincidencias
        .slice()
        .reverse()
        .map((indicador, index) => {
            const fila: Record<string, string | number> = {
                Índice: index,
                Id: indicador.Id,
                NameEs: indicador.NameEs,
                RegionsId: indicador.RegionsId ?? '',
            };

            if (Array.isArray(indicador.Resultados)) {
                indicador.Resultados.reverse().forEach((resultado, i) => {
                    fila[`Resultado[${i}].NameEs`] = resultado?.NameEs ?? '';
                });
            }

            return fila;
        });

    localStorage.setItem('COMODIN', JSON.stringify(tablaIndicador));
    return tablaIndicador;
}

export function compararFilasDeTabla(tablaA: Record<string, string | number>[], tablaB: Record<string, string | number>[]): void {
    const longitudMax = Math.max(tablaA.length, tablaB.length);

    for (let i = 0; i < longitudMax; i++) {
        const filaA = tablaA[i];
        const filaB = tablaB[i];

        if (!filaA || !filaB) {
            console.warn(`⚠️ Fila ${i} está ausente en una de las tablas.`);
            continue;
        }

        const claves = new Set([...Object.keys(filaA), ...Object.keys(filaB)]);

        claves.forEach((clave) => {
            const valorA = filaA[clave];
            const valorB = filaB[clave];

            if (valorA !== valorB) {
                console.log(`⚠️ Diferencia en fila ${i}, campo "${clave}":\n\t🅰️ "${valorA}"\n\t🅱️ "${valorB}"`);
            }
        });
    }
}

export const FiltrarPorAdr = (indicadores: IndicadorRealizacion[], regionSeleccionada: number | null): IndicadorRealizacion[] => {
    if (regionSeleccionada) {
        return indicadores.filter((indicador) => String(indicador.RegionsId) === String(regionSeleccionada));
    }
    return [];
};

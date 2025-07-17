/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useLocation } from 'react-router-dom';
import { useRegionContext } from '../../contexts/RegionContext';
import { IndicadorResultado, IndicadorRealizacion, indicadorInicial, indicadorResultadoinicial } from '../../types/Indicadores';
import Tippy from '@tippyjs/react';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import React from 'react';

type ResultadoMaximos = {
    REmaxSoloNum?: string;
    REmaxConLetras?: string;
    RSmaxSoloNum?: string;
    RSmaxConLetras?: string;
};

let cache: ResultadoMaximos | null = null;

const SacarSiguienteEnumeracionIndicadores = (): ResultadoMaximos => {
    if (cache) return cache;

    const storedRealizacion = localStorage.getItem('indicadorRealizacion');
    const storedResultado = localStorage.getItem('indicadoresResultado');
    const extraNum = (s: string) => +(s.match(/\d+/g)?.pop() || 0);

    let REmaxSoloNum: string | undefined;
    let REmaxConLetras: string | undefined;
    let RSmaxSoloNum: string | undefined;
    let RSmaxConLetras: string | undefined;

    if (storedRealizacion) {
        const indicadoresRealizacion = JSON.parse(storedRealizacion) as { NameEs?: string }[];
        const REiR = indicadoresRealizacion.map((i) => i.NameEs?.split('.')[0]).filter(Boolean) as string[];
        const REsoloNum = REiR.filter((c) => /\d$/.test(c));
        const REconLetras = REiR.filter((c) => !/\d$/.test(c));
        if (REsoloNum.length) REmaxSoloNum = REsoloNum.reduce((a, b) => (extraNum(b) > extraNum(a) ? b : a));
        if (REconLetras.length) REmaxConLetras = REconLetras.reduce((a, b) => (extraNum(b) > extraNum(a) ? b : a));
    }

    if (storedResultado) {
        const indicadoresResultado = JSON.parse(storedResultado) as { NameEs?: string }[];
        const RSiR = indicadoresResultado.map((i) => i.NameEs?.split('.')[0]).filter(Boolean) as string[];
        const RSsoloNum = RSiR.filter((c) => /\d$/.test(c));
        const RSconLetras = RSiR.filter((c) => !/\d$/.test(c));
        if (RSsoloNum.length) RSmaxSoloNum = RSsoloNum.reduce((a, b) => (extraNum(b) > extraNum(a) ? b : a));
        if (RSconLetras.length) RSmaxConLetras = RSconLetras.reduce((a, b) => (extraNum(b) > extraNum(a) ? b : a));
    }

    cache = { REmaxSoloNum, REmaxConLetras, RSmaxSoloNum, RSmaxConLetras };
    return cache;
};

function getNextRECode(code?: string, sumar?: number): string {
    if (!code) return 'RE01';

    const match = code.match(/^([A-Z]+)(\d+)([A-Z]*)$/i);
    if (!match) return 'RE01';

    const [, prefix, numStr, suffix] = match;
    const increment = 1 + (sumar ?? 0);
    const nextNum = String(parseInt(numStr, 10) + increment).padStart(numStr.length, '0');
    return `${prefix}${nextNum}${suffix}.`;
}

interface RellenoIndicadorProps {
    indicadorRealizacion: IndicadorRealizacion;
    onChange: (data: IndicadorRealizacion) => void;
    tipoIndicador: 'realizacion' | 'resultado';
    sumar?: number;
}
const RellenoIndicador: React.FC<RellenoIndicadorProps> = ({ indicadorRealizacion, onChange, tipoIndicador, sumar }) => {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState<IndicadorRealizacion>(indicadorRealizacion);
    const location = useLocation();
    const { REmaxSoloNum, REmaxConLetras, RSmaxSoloNum, RSmaxConLetras } = SacarSiguienteEnumeracionIndicadores();
    const esADR = location.pathname?.includes('ADR');

    const [nombreIndicador, setNombreIndicador] = useState<string[]>();

    useEffect(() => {
        const indicadorNombre = i18n.language === 'eu' ? formData.NameEu : formData.NameEs;
        if (indicadorNombre && indicadorNombre != '') {
            const [izquierda, ...resto] = indicadorNombre.split('.');
            const izquierdaConPunto = izquierda + '.';
            const derecha = resto.join('.').trim();
            setNombreIndicador([izquierdaConPunto, derecha]);
        } else {
            let siguienteindicador = '';

            if (tipoIndicador === 'realizacion') {
                siguienteindicador = getNextRECode(esADR ? REmaxConLetras : REmaxSoloNum, sumar);
            } else if (tipoIndicador === 'resultado') {
                siguienteindicador = getNextRECode(esADR ? RSmaxConLetras : RSmaxSoloNum, sumar);
            }
            setNombreIndicador([siguienteindicador, '']);
        }
    }, [formData]);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedData = { ...formData, [name]: value };
        setFormData(updatedData);
        onChange(updatedData);
    };
    const handleChangeNombre = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const finalData = nombreIndicador ? `${nombreIndicador[0]}${value}` : value;
        setNombreIndicador([nombreIndicador ? nombreIndicador[0] : '', value]);
        const updatedData = { ...formData, [name]: finalData };
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
                    <div className="flex items-center justify-end rounded mt-2 px-1 font-semibold ">{nombreIndicador && <label>{nombreIndicador[0]}</label>}</div>
                    <input
                        type="text"
                        name={i18n.language === 'eu' ? 'NameEu' : 'NameEs'}
                        className="flex-1 p-2 border"
                        value={nombreIndicador ? nombreIndicador[1] : ''}
                        onChange={handleChangeNombre}
                    />
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
    indicadorRealizacion: IndicadorRealizacion;
}

const SelectorOCreador: React.FC<RellenoIndicadorResultadoProps> = ({ indicadorRealizacion }) => {
    const { t, i18n } = useTranslation();
    const indicadoresResultados: IndicadorResultado[] = JSON.parse(localStorage.getItem('indicadoresResultado') || '[]');
    const [opciones] = useState(indicadoresResultados);
    const [seleccion, setSeleccion] = useState('');
    const [modoCrear, setModoCrear] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [filaEditar, setFilaEditar] = useState(0);

    const [refrescarZona, setRefrescarZona] = useState(false);
    const [descripcionEditable, setDescripcionEditable] = useState<IndicadorResultado>(indicadorResultadoinicial);

    const cambiosIndicadorEditable = (data: any) => {
        setDescripcionEditable(data);
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
        return (
            <>
                <label className="block font-bold mb-2">{t('seleccionaopcion')}:</label>
                <div className="flex gap-2">
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
                        {opciones
                            .filter((op) => {
                                return !indicadorRealizacion.Resultados!.some((resultado) => resultado.Id === op.Id);
                            })
                            .map((op) => (
                                <option key={op.Id} value={i18n.language === 'eu' ? op.NameEu : op.NameEs}>
                                    {i18n.language === 'eu' ? op.NameEu : op.NameEs}
                                </option>
                            ))}
                    </select>

                    <button className="bg-blue-500 text-white px-3 py-2 rounded" onClick={() => setModoCrear(true)} type="button">
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
                                <div key={data.Id} className="flex items-center border-b py-3">
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
                            indicadorRealizacion={descripcionEditable}
                            onChange={cambiosIndicadorEditable}
                            tipoIndicador="resultado"
                            sumar={indicadorRealizacion?.Resultados!.filter((r) => r.Id === 0).length}
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
    accion: 'Editar' | 'Nuevo';
    datosIndicador: IndicadorResultado;
    onSave?: (indicadorActualizado: IndicadorRealizacion) => void;
    tipoIndicador?: 'realizacion' | 'resultado';
};

export const ModalNuevoIndicador: React.FC<ModalNuevoIndicadorProps> = ({ isOpen, onClose, onSave, accion, datosIndicador, tipoIndicador }) => {
    const { t, i18n } = useTranslation();
    const { regionSeleccionada } = useRegionContext();
    const location = useLocation();

    const [descripcionEditable, setDescripcionEditable] = useState<IndicadorRealizacion>(datosIndicador);
    const [mensaje, setMensaje] = useState('');
    const hayResultados = tipoIndicador != 'resultado' ? (descripcionEditable.Resultados!.length > 0 ? true : false) : false;
    const [mostrarResultadoRelacionado, setMostrarResultadoRelacionado] = useState(accion === 'Nuevo' ? false : hayResultados);

    const validadorRespuestasBBDD = async (response: any, data: any) => {
        if (response.ok) {
            const indicador: IndicadorRealizacion = {
                ...descripcionEditable,
                Id: data.data.Id,
                Resultados: data.data.Resultados,
            };
            setMensaje(t('correctoIndicadorGuardado'));
            setTimeout(() => {
                if (onSave) {
                    onSave(indicador);
                }
            }, 200);
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
            body: JSON.stringify(location.pathname === '/configuracion/indicadoresADR' ? datosRealizacion : descripcionEditable),
        });
        if (response.ok) {
            const indicadorNuevo = await response.json();

            let realizaciones: IndicadorRealizacion[] = [];
            const storedRealizacion = localStorage.getItem('indicadorRealizacion');
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
        const indicadoreditado = await response.json();
        validadorRespuestasBBDD(response, indicadoreditado);
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
        const indicadorEditado = await response.json();
        validadorRespuestasBBDD(response, indicadorEditado);
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
                        />

                        <BotonResultadosRelacionados />

                        <button
                            onClick={() => {
                                let mensajeError = '';
                                if ((i18n.language === 'eu' && !descripcionEditable.NameEu) || (i18n.language === 'es' && !descripcionEditable.NameEs)) {
                                    mensajeError += `${t('errorMissingFields')}`;
                                }
                                if (accion === 'Nuevo') {
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
                                <SelectorOCreador indicadorRealizacion={descripcionEditable} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
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

    useEffect(() => {
        localStorage.setItem('indicadorRealizacion', JSON.stringify(indicadorRealizacion));
    }, [indicadorRealizacion]);

    useEffect(() => {
        localStorage.setItem('indicadoresResultado', JSON.stringify(indicadorResultado));
    }, [indicadorResultado]);

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

            const nuevaListaIndicadorResultado = indicadorResultado.filter((indicador) => indicador.Id !== indiResultadoAEliminar.Id);
            setIndicadorResultado(nuevaListaIndicadorResultado);

            setIndicadorRealizacion((prev) => {
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
            {indicadorRealizacion.length > 0 && (
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
            )}

            {indicadorResultado.length > 0 && (
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
            )}
        </>
    );
};

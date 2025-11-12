/* eslint-disable no-unused-vars */
/* eslint-disable @typescript-eslint/no-explicit-any */
import i18n from 'i18next';
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode, useEffect, useRef, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserRole } from '../../types/users';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from './animations';
import { t } from 'i18next';
import IconInfoTriangle from '../Icon/IconInfoTriangle';
import IconXCircle from '../Icon/IconXCircle';
import IconThumbUp from '../Icon/IconThumbUp';
import { ApiTargetToken } from './data/controlDev';
import { EjeIndicadorBBDD } from '../../types/tipadoPlan';
import { HMTServicios, IndicadoresServicios, IndicadoresServiciosDTO } from '../../types/GeneralTypes';
import { HMT, IndicadorRealizacionAccion, IndicadorResultadoAccion } from '../../types/Indicadores';
import { DatosAccion, IndicadorRealizacionAccionDTO, IndicadorResultadoAccionDTO } from '../../types/TipadoAccion';
import { ListadoNombresIdicadoresItem } from '../../pages/Configuracion/Informes/informeObjetivo';

export const SinDatos = () => {
    return (
        <div role="alert" aria-live="assertive" className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md text-sm font-medium">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.68-1.36 3.445 0l6.518 11.593A1.75 1.75 0 0 1 17.518 17H2.482a1.75 1.75 0 0 1-1.702-2.308L8.257 3.1zM11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-6.25a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75s.75-.336.75-.75v-3.5A.75.75 0 0 0 10 6.75z"
                    clipRule="evenodd"
                />
            </svg>
            {t('sinDatos')}
        </div>
    );
};
export const SeleccioneRegion = () => {
    return (
        <div role="alert" aria-live="assertive" className="inline-flex items-center gap-2 px-3 py-2 bg-yellow-100 border border-yellow-300 text-yellow-800 rounded-md text-sm font-medium">
            <svg className="w-4 h-4" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.68-1.36 3.445 0l6.518 11.593A1.75 1.75 0 0 1 17.518 17H2.482a1.75 1.75 0 0 1-1.702-2.308L8.257 3.1zM11 13a1 1 0 1 1-2 0 1 1 0 0 1 2 0zm-1-6.25a.75.75 0 0 0-.75.75v3.5c0 .414.336.75.75.75s.75-.336.75-.75v-3.5A.75.75 0 0 0 10 6.75z"
                    clipRule="evenodd"
                />
            </svg>
            {t('seleccioneRegion')}
        </div>
    );
};
interface ModalProps {
    open: boolean;
    onClose: () => void;
    title?: ReactNode;
    children: ReactNode;
}

export function NewModal({ open, onClose, title, children }: ModalProps) {
    return (
        <Transition appear show={open} as={Fragment}>
            <Dialog as="div" open={open} onClose={onClose}>
                <Transition.Child as={Fragment} enter="ease-out duration-300" enterFrom="opacity-0" enterTo="opacity-100" leave="ease-in duration-200" leaveFrom="opacity-100" leaveTo="opacity-0">
                    <div className="fixed inset-0" />
                </Transition.Child>
                <div className="fixed inset-0 bg-[black]/60 z-[999] overflow-y-auto">
                    <div className="flex items-center justify-center min-h-screen px-4">
                        <Transition.Child
                            as={Fragment}
                            enter="ease-out duration-300"
                            enterFrom="opacity-0 scale-95"
                            enterTo="opacity-100 scale-100"
                            leave="ease-in duration-200"
                            leaveFrom="opacity-100 scale-100"
                            leaveTo="opacity-0 scale-95"
                        >
                            <Dialog.Panel as="div" className="panel border-0 p-0 rounded-lg overflow-hidden w-full max-w-lg my-8 text-black dark:text-white-dark">
                                <div className="flex bg-[#fbfbfb] dark:bg-[#121c2c] items-center justify-between px-5 py-3">
                                    <h5 className="font-bold text-lg">{title}</h5>
                                    <button type="button" className="text-white-dark hover:text-dark" onClick={onClose}>
                                        <svg width="24" height="24" fill="none" stroke="currentColor" strokeWidth={2}>
                                            <path d="M6 6l12 12M18 6L6 18" />
                                        </svg>
                                    </button>
                                </div>
                                <div className="p-5">{children}</div>
                            </Dialog.Panel>
                        </Transition.Child>
                    </div>
                </div>
            </Dialog>
        </Transition>
    );
}

interface SideBarListProps {
    link: string;
    src: string;
    texto: string;
    role?: UserRole;
    disabled?: boolean;
}

export function SideBarList({ link, src, texto, role, disabled }: SideBarListProps) {
    if (role === 'GOBIERNOVASCO' || role === 'DF') {
        return null;
    }

    const baseClasses = 'flex items-center';

    if (disabled) {
        return (
            <li className="nav-item">
                <NavLink to={link} className="group opacity-80 cursor-not-allowed pointer-events-none">
                    <div className={baseClasses}>
                        <img src={src} alt={texto} className="w-6 h-6" />
                        <span className="ltr:pl-3 rtl:pr-3 text-gray-400">{texto}</span>
                    </div>
                </NavLink>
            </li>
        );
    }

    return (
        <li className="nav-item">
            <NavLink to={link} className="group">
                <div className={baseClasses}>
                    <img src={src} alt={texto} className="w-6 h-6" />
                    <span className="ltr:pl-3 rtl:pr-3 text-black dark:text-[#506690] dark:group-hover:text-white-dark">{texto}</span>
                </div>
            </NavLink>
        </li>
    );
}
interface ModalSaveProps {
    title?: ReactNode;
    children: () => Promise<void> | void;
    nav?: string;
    onClose?: () => void;
}

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

export function ModalSave({ title = 'Guardando...', children, nav }: ModalSaveProps) {
    const { t } = useTranslation();
    const navigate = useNavigate();

    const [open, setOpen] = useState(true);
    const [mensaje, setMensaje] = useState(t('GuardandoCambios'));
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(false);
    const [guardado, setGuardado] = useState(false);

    useEffect(() => {
        const ejecutar = async () => {
            try {
                await children();
                setLoading(false);
                setMensaje(t('CambiosGuardados'));
                setGuardado(true);
                await delay(3000);
                setOpen(false);
            } catch (err: unknown) {
                setLoading(false);
                setError(true);
                setMensaje(err instanceof Error ? err.message : String(err));
            }
        };

        ejecutar();
    }, [children, t]);

    useEffect(() => {
        if (!open && nav) {
            navigate(nav);
        }
    }, [open]);
    return (
        <NewModal open={open} onClose={() => setOpen(false)} title={title}>
            {error && <ErrorMessage message={mensaje} />}
            <div className="flex justify-center mt-4">
                <button
                    type="button"
                    className="bg-indigo-500 text-white px-4 py-2 rounded flex items-center disabled:opacity-70 disabled:cursor-not-allowed"
                    disabled={loading}
                    onClick={() => setOpen(false)}
                >
                    {loading && !guardado && (
                        <svg className="mr-3 h-5 w-5 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                        </svg>
                    )}
                    {mensaje}
                </button>
            </div>
        </NewModal>
    );
}

type TipoAviso = 'warning' | 'success' | 'error';
type AvisoProps = {
    textoAviso: string;
    icon?: boolean;
    tipoAviso?: TipoAviso;
};
export function Aviso({ textoAviso, icon = true, tipoAviso = 'warning' }: AvisoProps) {
    const { t } = useTranslation();
    let bgColor = 'bg-warning';
    let icone = <IconInfoTriangle />;
    if (tipoAviso === 'success') {
        bgColor = 'bg-success';
        icone = <IconThumbUp />;
    } else if (tipoAviso === 'error') {
        bgColor = 'bg-red-600';
        icone = <IconXCircle />;
    }

    return (
        <div className={`${bgColor} text-black text-sm rounded px-3 py-2 mb-4 flex items-center gap-2 justify-center`}>
            {icon && icone}
            <span>
                <strong>{t('aviso')}:</strong> {textoAviso}
            </span>
        </div>
    );
}

interface BotonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    tipo: 'guardar' | 'cerrar' | 'restaurar';
    textoBoton?: string;
    title?: string;
}

export function Boton({ tipo, disabled = false, textoBoton = '', onClick, title = '' }: BotonProps) {
    return (
        <button
            disabled={disabled}
            title={title}
            className={`${
                tipo === 'guardar' ? 'mb-4 bg-primary' : tipo === 'restaurar' ? 'mb-4 bg-green-700' : 'mb-4 bg-danger'
            } px-4 py-2 text-white rounded flex items-center justify-center font-medium h-10 min-w-[120px] disabled:cursor-not-allowed`}
            onClick={onClick}
        >
            {textoBoton}
        </button>
    );
}
type ClaveFecha = 'indicadores' | 'users' | 'acciones' | 'ejes' | 'YearData' | 'ejesRegion';
export function actualizarFechaLLamada(clave: ClaveFecha, fecha: Date = new Date()) {
    const keyStorage = 'fechasUltimaLlamada';
    const fechasRaw = localStorage.getItem(keyStorage);
    const fechas = fechasRaw ? JSON.parse(fechasRaw) : {};

    fechas[clave] = fecha.toISOString();

    localStorage.setItem(keyStorage, JSON.stringify(fechas));
}

export function obtenerFechaLlamada(clave: ClaveFecha): string | undefined {
    const fechasRaw = localStorage.getItem('fechasUltimaLlamada');
    if (!fechasRaw) return undefined;

    const fechas: Partial<Record<ClaveFecha, string>> = JSON.parse(fechasRaw);
    return fechas[clave];
}

export function formateaConCeroDelante(numero: number | string): string {
    return Number(numero) < 10 ? `0${numero}` : `${numero}`;
}

interface ErrorTraducido {
    mensaje: string;
    tipo: 'error' | 'warning' | 'info';
}
export interface BackendError {
    Message: string;
    ExceptionMessage: string;
    ExceptionType?: string;
    StackTrace?: string;
}

export interface Message {
    Message: string;
}
export interface FetchErrorResult {
    ok: boolean;
    status: number;
    data: BackendError | Message | null;
}
export function gestionarErrorServidor(error: unknown, data?: any): ErrorTraducido {
    if (error instanceof Response) {
        switch (error.status) {
            case 400:
                if (data && data.Message) {
                    if (data.Message === 'El email ya está registrado.') {
                        return { mensaje: t('emailYaRegistrado'), tipo: 'warning' };
                    }
                }
                console.error(`400:${t('error:errorPeticionIncorrecta')}`);
                return { mensaje: t('error:errorPeticionIncorrecta'), tipo: 'warning' };
            case 401:
                console.error(`401:${t('error:errorNoAutorizado')}`);
                window.alert(t('error:errorNoAutorizado'));
                sessionStorage.clear();
                Object.keys(localStorage).forEach((key) => {
                    if (key !== 'app_version') {
                        localStorage.removeItem(key);
                    }
                });
                window.location.href = '/Authenticacion/Login';
                return { mensaje: t('error:errorNoAutorizado'), tipo: 'error' };
            case 403:
                console.error(`403:${t('error:errorAccesoDenegado')}`);
                return { mensaje: t('error:errorAccesoDenegado'), tipo: 'error' };
            case 404:
                console.error(`404:${t('error:errorNoEncontrado')}`);
                return { mensaje: t('error:errorNoEncontrado'), tipo: 'warning' };
            case 409:
                console.error(`409:${t('error:errorConflicto')}`);
                return { mensaje: t('error:errorConflicto'), tipo: 'warning' };
            case 422:
                console.error(`422:${t('error:errorDatosInvalidos')}`);
                return { mensaje: t('error:errorDatosInvalidos'), tipo: 'warning' };
            case 500:
                console.error(`500:${t('error:errorInternoServidor')}`);
                return { mensaje: t('error:errorInternoServidor'), tipo: 'error' };
            default:
                console.error(t('error:errorDesconocidoConCodigo', { codigo: error.status }));
                return { mensaje: t('error:errorDesconocidoConCodigo', { codigo: error.status }), tipo: 'error' };
        }
    }

    if (error instanceof TypeError && error.message.includes('Failed to fetch')) {
        console.error(t('error:errorNoSePudoConectarServidor'));
        return {
            mensaje: t('error:errorNoSePudoConectarServidor'),
            tipo: 'error',
        };
    }

    if (error instanceof Error) {
        const mensajeError = error.message || t('error:errorGenerico');
        console.error(t('error:errorGenericoConMensaje', { mensaje: mensajeError }));
        return {
            mensaje: t('error:errorGenericoConMensaje', { mensaje: mensajeError }),
            tipo: 'error',
        };
    }

    if (error) {
        const errorProcesando = error as FetchErrorResult;
        if (errorProcesando.data && 'ExceptionMessage' in errorProcesando.data) {
            const ExceptionMessage = errorProcesando.data?.ExceptionMessage || t('error:errorGenerico');
            console.error(ExceptionMessage);
            return {
                mensaje: t('error:errorGenericoConMensaje', { mensaje: ExceptionMessage }),
                tipo: 'error',
            };
        } else if (errorProcesando.data && 'Message' in errorProcesando.data) {
            const Message = errorProcesando.data?.Message || t('error:errorGenerico');
            console.error(Message);
            return {
                mensaje: t('error:errorGenericoConMensaje', { mensaje: Message }),
                tipo: 'error',
            };
        }
    }

    console.error(t('error:errorGenerico'));
    return {
        mensaje: t('error:errorGenerico'),
        tipo: 'error',
    };
}

export interface FetchResult<T> {
    ok: boolean;
    status: number;
    data: T | null;
}

export async function FetchConRefreshRetry<T = any>(input: RequestInfo, init?: RequestInit): Promise<FetchResult<T>> {
    const accessToken = sessionStorage.getItem('access_token');
    const refreshToken = sessionStorage.getItem('refresh_token');

    // Construimos headers
    const headers = new Headers(init?.headers);
    if (accessToken) headers.set('Authorization', `Bearer ${accessToken}`);

    let response = await fetch(input, { ...init, headers });

    // Si 401 y tenemos refresh token, intentamos refrescar
    if (response.status === 401 && refreshToken) {
        const refreshResponse = await fetch(`${ApiTargetToken}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: new URLSearchParams({
                grant_type: 'refresh_token',
                refresh_token: refreshToken,
                client_id: 'webApp',
            }),
        });

        if (refreshResponse.ok) {
            const datosRefresh = await refreshResponse.json();
            console.log('%c✅ Sesión recuperada correctamente', 'color: green; font-weight: bold;');

            // Guardamos tokens nuevos
            sessionStorage.setItem('access_token', datosRefresh.access_token);
            if (datosRefresh.refresh_token) {
                sessionStorage.setItem('refresh_token', datosRefresh.refresh_token);
            }

            // Reintentamos la petición original con token nuevo
            headers.set('Authorization', `Bearer ${datosRefresh.access_token}`);
            response = await fetch(input, { ...init, headers });
        } else {
            // No se pudo refrescar token, devolvemos la 401 original
            return { ok: response.ok, status: response.status, data: null };
        }
    }

    // Leemos y parseamos el body una sola vez
    let data: T | null = null;
    try {
        const raw = await response.text();
        console.debug('📄 Respuesta cruda del servidor:', raw);
        data = raw ? (JSON.parse(raw) as T) : null;
    } catch (err) {
        console.error('❌ Error parseando JSON en FetchConRefreshRetry:', err);
    }

    return { ok: response.ok, status: response.status, data };
}

interface FechaProps {
    date: string | Date | null;
    solohora?: boolean;
}
interface FechaTextoProps {
    date: string | Date | null;
    solohora?: boolean;
    idioma: { language: string; locales?: string }; //idioma pasarle directamente i18n
}
const mesesEu = ['urtarrila', 'otsaila', 'martxoa', 'apirila', 'maiatza', 'ekaina', 'uztaila', 'abuztua', 'iraila', 'urria', 'azaroa', 'abendua'];

export function PrintFechaTexto({ date, solohora, idioma }: FechaTextoProps): string {
    if (!date) return '';

    const fechaObj = date instanceof Date ? date : new Date(date);

    const formatter = new Intl.DateTimeFormat(idioma.language, {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
    });
    function formatFechaEu(date: Date) {
        const day = date.getDate();
        const month = mesesEu[date.getMonth()];
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        return `${day} ${month} ${hour}:${minute}`;
    }

    const formatterHor = new Intl.DateTimeFormat(idioma.language, {
        hour: '2-digit',
        minute: '2-digit',
    });

    function formatFechaHoraEu(date: Date) {
        const hour = date.getHours().toString().padStart(2, '0');
        const minute = date.getMinutes().toString().padStart(2, '0');
        return `${hour}:${minute}`;
    }

    if (idioma.language === 'eu') {
        return solohora ? formatFechaHoraEu(fechaObj) : formatFechaEu(fechaObj);
    }

    return solohora ? formatterHor.format(fechaObj) : formatter.format(fechaObj);
}

export function PrintFecha({ date, solohora }: FechaProps) {
    const { i18n } = useTranslation();

    if (!date) {
        return <></>;
    }
    const texto = PrintFechaTexto({ date, solohora, idioma: i18n });
    if (!texto) return <></>;
    return <div>{texto}</div>;
}

interface PropsMultiSelectDOM {
    objeto: EjeIndicadorBBDD[];
    preSelected: EjeIndicadorBBDD[];
    onChange: (selected: EjeIndicadorBBDD[]) => void;
    disabled?: boolean;
}

export const MultiSelectDOM: React.FC<PropsMultiSelectDOM> = ({ objeto, preSelected, onChange, disabled = false }) => {
    const [drop, setDrop] = useState<EjeIndicadorBBDD[]>([]);
    const [selected, setSelected] = useState<EjeIndicadorBBDD[]>([]);
    const [isOpen, setIsOpen] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);
    const { i18n } = useTranslation();
    const prevIsOpen = useRef(isOpen);
    const [mostrarTodos, setMostrarTodos] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        setSelected((prev) => (JSON.stringify(prev) === JSON.stringify(preSelected) ? prev : preSelected));
    }, [preSelected]);

    useEffect(() => {
        setDrop((objeto as EjeIndicadorBBDD[]).filter((eje) => !selected.some((s) => s.EjeId === eje.EjeId)));
        if (selected.length > 0 && selected.length === objeto.length) {
            setMostrarTodos(true);
        } else {
            setMostrarTodos(false);
        }
    }, [objeto, selected]);

    useEffect(() => {
        if (prevIsOpen.current && !isOpen && !disabled) {
            onChange(selected);
        }
        prevIsOpen.current = isOpen;
    }, [isOpen, selected, disabled]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const toggleOption = (eje: EjeIndicadorBBDD) => {
        if (disabled) return;
        setSelected((prev) => (prev.some((s) => s.EjeId === eje.EjeId) ? prev.filter((s) => s.EjeId !== eje.EjeId) : [...prev, eje]));
    };

    const toggleSelectAll = () => {
        if (disabled) return;
        setSelected(selected.length > 0 && selected.length === objeto.length ? [] : [...objeto]);
    };

    return (
        <div className="relative" ref={containerRef}>
            <div className={`max-h-24 overflow-y-auto flex flex-wrap gap-1 mb-1 p-1 border rounded ${disabled ? 'bg-gray-200' : 'bg-gray-100'}`}>
                {mostrarTodos ? (
                    <span className={`px-2 py-1 rounded ${disabled ? 'bg-gray-300 text-gray-700' : 'bg-blue-200 text-blue-800 cursor-pointer'}`} onClick={() => !disabled && setMostrarTodos(false)}>
                        {t('TODOS')} {!disabled && '×'}
                    </span>
                ) : (
                    selected.map((eje) => (
                        <span
                            key={eje.EjeId}
                            className={`px-2 py-1 rounded ${disabled ? 'bg-gray-300 text-gray-700' : 'bg-blue-200 text-blue-800 cursor-pointer'}`}
                            onClick={() => !disabled && toggleOption(eje)}
                        >
                            {i18n.language === 'eu' ? eje.NameEu : eje.NameEs} {!disabled && '×'}
                        </span>
                    ))
                )}
            </div>

            <div className={`border rounded p-2 bg-white ${disabled ? 'text-gray-500 cursor-not-allowed' : 'cursor-pointer'}`} onClick={() => !disabled && setIsOpen((prev) => !prev)}>
                {selected.length === 0 ? t('selecionaOpciones') : t('seleccionadosOpciones', { count: selected.length })}
            </div>

            {!disabled && isOpen && (
                <div className="absolute w-full max-h-60 overflow-y-auto border rounded mt-1 bg-white z-50 shadow-lg">
                    <div className="p-2 border-b cursor-pointer hover:bg-gray-200 font-semibold" onClick={toggleSelectAll}>
                        {selected.length > 0 && selected.length === objeto.length ? t('deseleccionarTodo') : t('seleccionarTodo')}
                    </div>
                    {drop.map((eje) => (
                        <div key={eje.EjeId} className={`p-2 cursor-pointer hover:bg-gray-200 ${selected.some((s) => s.EjeId === eje.EjeId) ? 'bg-gray-100' : ''}`} onClick={() => toggleOption(eje)}>
                            {i18n.language === 'eu' ? eje.NameEu : eje.NameEs}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export function convertirArrayACadena<T>(valores: T[]): string {
    if (!valores || valores.length === 0) return '';
    return valores.map((v) => String(v)).join(',');
}

export function compararObjetosGenerico(prev: Record<string, any>, actual: Record<string, any>): string[] {
    const cambios: string[] = [];

    const keys = new Set([...Object.keys(prev), ...Object.keys(actual)]);

    keys.forEach((key) => {
        if (prev[key] !== actual[key]) {
            cambios.push(`${key} ${prev[key]} --> ${actual[key]}`);
        }
    });

    return cambios;
}

//ejemplo
//     const prevDatosPlan = useEffectPrevio(datosEditandoAccion);
//
//     useEffect(() => {
//         if (datosEditandoAccion.accionCompartida) {
//             if (prevDatosPlan) {
//                 const cambios = compararObjetosGenerico(prevDatosPlan, datosEditandoAccion);
//                 console.log('Cambios detectados:', cambios);
//             }
//         }
//     }, [datosEditandoAccion]);

export function useEffectPrevio<T>(value: T): T | undefined {
    const ref = useRef<T>();
    useEffect(() => {
        ref.current = value;
    }, [value]);
    return ref.current;
}

export const TextoSegunIdioma = (es: string | undefined, eu: string | undefined) => (i18n.language === 'es' ? es : eu);

function ConvertirHMTServiciosAHMT(hmt?: HMTServicios): HMT | undefined {
    if (!hmt) return undefined;
    return {
        hombres: hmt.hombres ?? '',
        mujeres: hmt.mujeres ?? '',
        total: hmt.valor,
    };
}

export function ConvertirIndicadoresServicioAAccion(indicadores: IndicadoresServicios[]): DatosAccion['indicadorAccion'] {
    const indicadoreRealizacion: IndicadorRealizacionAccion[] = [];
    const indicadoreResultado: IndicadorResultadoAccion[] = [];

    indicadores.forEach((ind) => {
        const base = {
            id: ind.id ?? 0,
            descripcion: ind.indicador,
            metaAnual: ConvertirHMTServiciosAHMT(ind.previsto),
            ejecutado: ConvertirHMTServiciosAHMT(ind.alcanzado),
            metaFinal: undefined,
            hipotesis: '',
        };

        if (ind.tipo === 'realizacion') {
            indicadoreRealizacion.push({
                ...base,
                indicadorRealizacionId: ind.id ?? 0,
            });
        } else {
            indicadoreResultado.push({
                ...base,
                indicadorResultadoId: ind.id ?? 0,
            });
        }
    });

    return {
        indicadoreRealizacion,
        indicadoreResultado,
    };
}

function ConvertirHMTAHMTServicios(hmt?: HMT): HMTServicios | undefined {
    if (!hmt) return undefined;
    return {
        hombres: hmt.hombres?.toString(),
        mujeres: hmt.mujeres?.toString(),
        valor: hmt.total?.toString(),
    };
}

export function ConvertirIndicadoresAccionAServicio(indicadorAccion?: DatosAccion['indicadorAccion']): IndicadoresServicios[] {
    if (!indicadorAccion) return [];

    const resultado: IndicadoresServicios[] = [];

    indicadorAccion.indicadoreRealizacion?.forEach((ind) => {
        resultado.push({
            id: ind.indicadorRealizacionId ?? ind.id,
            indicador: ind.descripcion,
            tipo: 'realizacion',
            previsto: ConvertirHMTAHMTServicios(ind.metaAnual) ?? { valor: '' },
            alcanzado: ConvertirHMTAHMTServicios(ind.ejecutado),
        });
    });

    indicadorAccion.indicadoreResultado?.forEach((ind) => {
        resultado.push({
            id: ind.indicadorResultadoId ?? ind.id,
            indicador: ind.descripcion,
            tipo: 'resultado',
            previsto: ConvertirHMTAHMTServicios(ind.metaAnual) ?? { valor: '' },
            alcanzado: ConvertirHMTAHMTServicios(ind.ejecutado),
        });
    });

    return resultado;
}

export function MemorizarResultadoFuncion<F extends (...args: any[]) => Promise<any>>(fn: F) {
    const cache = new Map<string, ReturnType<F>>();
    return async (...args: Parameters<F>) => {
        const key = JSON.stringify(args);
        if (cache.has(key)) return cache.get(key);
        const res = await fn(...args);
        cache.set(key, res);
        return res;
    };
}

export function ConvertirIndicadoresServicioAAccionDTO(
    indicadores: IndicadoresServiciosDTO[],
    listadoNombresRealizacion: ListadoNombresIdicadoresItem[],
    listadoNombresResultado: ListadoNombresIdicadoresItem[]
): {
    indicadoreRealizacion: IndicadorRealizacionAccionDTO[];
    indicadoreResultado: IndicadorResultadoAccionDTO[];
} {
    const indicadoreRealizacion: IndicadorRealizacionAccionDTO[] = [];
    const indicadoreResultado: IndicadorResultadoAccionDTO[] = [];

    // Obtener los indicadores desde localStorage para buscar por NameEs/NameEu
    const indicadoresRealizacionStorage = localStorage.getItem('indicadoresRealizacion');
    const indicadoresResultadoStorage = localStorage.getItem('indicadoresResultado');
    const indicadoresRealizacionADRStorage = sessionStorage.getItem('indicadoresRealizacionFiltrado');
    const indicadoresResultadoADRStorage = sessionStorage.getItem('indicadoresResultadoFiltrado');

    const todosIndicadoresRealizacion = [
        ...(indicadoresRealizacionStorage ? JSON.parse(indicadoresRealizacionStorage) : []),
        ...(indicadoresRealizacionADRStorage ? JSON.parse(indicadoresRealizacionADRStorage) : []),
    ];

    const todosIndicadoresResultado = [
        ...(indicadoresResultadoStorage ? JSON.parse(indicadoresResultadoStorage) : []),
        ...(indicadoresResultadoADRStorage ? JSON.parse(indicadoresResultadoADRStorage) : []),
    ];

    indicadores.forEach((ind) => {
        const base = {
            id: ind.Id ?? 0,
            descripcion: ind.Indicador,
            Ejecutado_Hombre: ind.AlcanzadoHombres,
            Ejecutado_Mujer: ind.AlcanzadoMujeres,
            Ejecutado_Total: ind.AlcanzadoValor,
            MetaAnual_Hombre: ind.PrevistoHombres,
            MetaAnual_Mujer: ind.PrevistoMujeres,
            MetaAnual_Total: ind.PrevistoValor,
            hipotesis: '',
        };

        if (ind.Tipo === 'realizacion') {
            // Buscar primero en listadoNombres
            let idIndicadorOriginal = listadoNombresRealizacion.find((re) => re.nombre === ind.Indicador)?.id;
            let nameEs = ind.Indicador;
            let nameEu = ind.Indicador;

            // Si no se encuentra, buscar en los indicadores almacenados por NameEs/NameEu
            if (!idIndicadorOriginal) {
                const indicadorEncontrado = todosIndicadoresRealizacion.find((indReal: any) => indReal.NameEs === ind.Indicador || indReal.NameEu === ind.Indicador);
                if (indicadorEncontrado) {
                    idIndicadorOriginal = indicadorEncontrado.Id;
                    nameEs = indicadorEncontrado.NameEs;
                    nameEu = indicadorEncontrado.NameEu;
                }
            }

            indicadoreRealizacion.push({
                ...base,
                IndicadorRealizacionId: idIndicadorOriginal ?? ind.Id ?? 0,
                NameEs: nameEs,
                NameEu: nameEu,
                DatosAccionId: ind.Id ?? 0,
            });
        } else {
            // Buscar primero en listadoNombres
            let idIndicadorOriginal = listadoNombresResultado.find((re) => re.nombre === ind.Indicador)?.id;
            let nameEs = ind.Indicador;
            let nameEu = ind.Indicador;

            // Si no se encuentra, buscar en los indicadores almacenados por NameEs/NameEu
            if (!idIndicadorOriginal) {
                const indicadorEncontrado = todosIndicadoresResultado.find((indRes: any) => indRes.NameEs === ind.Indicador || indRes.NameEu === ind.Indicador);
                if (indicadorEncontrado) {
                    idIndicadorOriginal = indicadorEncontrado.Id;
                    nameEs = indicadorEncontrado.NameEs;
                    nameEu = indicadorEncontrado.NameEu;
                }
            }

            indicadoreResultado.push({
                ...base,
                IndicadorResultadoId: idIndicadorOriginal ?? ind.Id ?? 0,
                NameEs: nameEs,
                NameEu: nameEu,
                DatosAccionId: ind.Id ?? 0,
            });
        }
    });

    return {
        indicadoreRealizacion,
        indicadoreResultado,
    };
}

export function downloadFile(file: File) {
    if (typeof (window.navigator as any).msSaveOrOpenBlob === 'function') {
        (window.navigator as any).msSaveOrOpenBlob(file, file.name);
        return;
    }

    const url = URL.createObjectURL(file);
    const a = document.createElement('a');
    a.style.display = 'none';
    a.href = url;
    a.download = file.name || 'download';
    a.rel = 'noopener noreferrer';

    document.body.appendChild(a);
    a.click();

    setTimeout(() => {
        try {
            URL.revokeObjectURL(url);
        } catch (e) {
            console.error('Error revoking object URL:', e);
        }
        a.remove();
    }, 500);
}

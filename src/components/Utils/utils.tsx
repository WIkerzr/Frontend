/* eslint-disable @typescript-eslint/no-explicit-any */
import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserRole } from '../../types/users';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from './animations';
import { t } from 'i18next';
import IconInfoTriangle from '../Icon/IconInfoTriangle';
import IconXCircle from '../Icon/IconXCircle';
import IconThumbUp from '../Icon/IconThumbUp';
import { ApiTargetToken } from './data/controlDev';

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
    if (role === 'GOBIERNOVASCO') {
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
    tipo: 'guardar' | 'cerrar';
    textoBoton?: string;
}

export function Boton({ tipo, disabled = false, textoBoton = '', onClick }: BotonProps) {
    return (
        <button
            disabled={disabled}
            className={`${
                tipo === 'guardar' ? 'mb-4 bg-primary' : 'mb-4 bg-danger'
            } px-4 py-2  text-white rounded flex items-center justify-center font-medium h-10 min-w-[120px] disabled:cursor-not-allowed`}
            onClick={onClick}
        >
            {textoBoton}
        </button>
    );
}
type ClaveFecha = 'indicadores' | 'users' | 'acciones';
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
                console.error(t('error:errorDesconocidoConCodigo'));
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
        console.error(t('error:errorGenericoConMensaje'));
        return {
            mensaje: t('error:errorGenericoConMensaje', { mensaje: error.message }),
            tipo: 'error',
        };
    }

    console.error(t('error:errorGenerico'));
    return {
        mensaje: t('error:errorGenerico'),
        tipo: 'error',
    };
}

export async function FetchConRefreshRetry(input: RequestInfo, init?: RequestInit): Promise<Response> {
    const accessToken = sessionStorage.getItem('access_token');
    const refreshToken = sessionStorage.getItem('refresh_token');

    // Añadimos Authorization
    const headers = new Headers(init?.headers);
    if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
    }

    const response = await fetch(input, { ...init, headers });

    if (response.status !== 401) {
        return response;
    }

    if (!refreshToken) {
        return response;
    }

    // Intentamos refrescar token
    const refreshResponse = await fetch(`${ApiTargetToken}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams({
            grant_type: 'refresh_token',
            refresh_token: refreshToken,
            client_id: 'webApp',
        }),
    });

    if (!refreshResponse.ok) {
        // No se pudo refrescar token, devolver 401 original
        return response;
    }
    if (refreshResponse.ok) {
        console.log('%c✅ Sesión recuperada correctamente', 'color: green; font-weight: bold;');
    }
    const datosRefresh = await refreshResponse.json();

    // Guardamos tokens nuevos
    sessionStorage.setItem('access_token', datosRefresh.access_token);
    if (datosRefresh.refresh_token) {
        sessionStorage.setItem('refresh_token', datosRefresh.refresh_token);
    }

    // Reintentamos la petición original con token nuevo
    headers.set('Authorization', `Bearer ${datosRefresh.access_token}`);

    const retryResponse = await fetch(input, { ...init, headers });

    return retryResponse;
}

interface FechaProps {
    date: string | Date | null;
}
const mesesEu = ['urtarrila', 'otsaila', 'martxoa', 'apirila', 'maiatza', 'ekaina', 'uztaila', 'abuztua', 'iraila', 'urria', 'azaroa', 'abendua'];

function formatFechaEu(date: Date) {
    const day = date.getDate();
    const month = mesesEu[date.getMonth()];
    const hour = date.getHours().toString().padStart(2, '0');
    const minute = date.getMinutes().toString().padStart(2, '0');
    const second = date.getSeconds().toString().padStart(2, '0');
    return `${day} ${month} ${hour}:${minute}:${second}`;
}

export function PrintFecha({ date }: FechaProps) {
    if (!date) {
        return <></>;
    }
    const { i18n } = useTranslation();

    const locale = i18n.language === 'eu' ? 'eu' : 'es-ES';

    const fechaObj = date instanceof Date ? date : new Date(date);

    const formatter = new Intl.DateTimeFormat(locale, {
        day: 'numeric',
        month: 'long',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
    });

    return <div>{locale === 'eu' ? formatFechaEu(fechaObj) : formatter.format(fechaObj)}</div>;
}

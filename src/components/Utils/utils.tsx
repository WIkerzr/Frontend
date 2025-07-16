import { Dialog, Transition } from '@headlessui/react';
import { Fragment, ReactNode, useEffect, useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { UserRole } from '../../types/users';
import { useTranslation } from 'react-i18next';
import { ErrorMessage } from './animations';
import IconInfoCircle from '../Icon/IconInfoCircle';

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

export function Aviso({ textoAviso }: { textoAviso: string }) {
    const { t } = useTranslation();
    return (
        <div className="bg-warning text-black text-sm rounded px-3 py-2 mb-4 flex items-center gap-2 justify-center">
            <IconInfoCircle />
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

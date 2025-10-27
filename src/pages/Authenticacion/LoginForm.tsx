import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiTarget } from '../../components/Utils/data/controlDev';
import { gestionarErrorServidor } from '../../components/Utils/utils';
import { useUser } from '../../contexts/UserContext';
import { useBrowserWarning } from '../../App';

interface LoginFormProps {
    email: string;
    setEmail: React.Dispatch<React.SetStateAction<string>>;
    password: string;
    setPassword: React.Dispatch<React.SetStateAction<string>>;
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    error: string;
}

const LoginForm: React.FC<LoginFormProps> = ({ email, setEmail, password, setPassword, onSubmit, error }) => {
    const { t } = useTranslation();
    const [recordar, setRecordar] = useState<boolean>(false);
    const { recordarSesion, setRecordarSesion } = useUser();
    const [recordarSegundoPaso, setRecordarSegundoPaso] = useState<boolean>(false);

    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const isBrowserIncompatible = useBrowserWarning();

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const stored = localStorage.getItem('app_version') || null;

            let current: string | undefined;
            try {
                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                const mod: any = await import('../../version');
                current = (mod?.default ?? mod?.version ?? mod?.APP_VERSION ?? mod?.appVersion)?.toString();
            } catch {
                // Error ignorado intencionalmente
            }

            const cmp = (a?: string | null, b?: string | null) => {
                if (!a || !b) return 0;
                const pa = a.split('.').map((n) => Number.parseInt(n, 10) || 0);
                const pb = b.split('.').map((n) => Number.parseInt(n, 10) || 0);
                const len = Math.max(pa.length, pb.length);
                for (let i = 0; i < len; i++) {
                    const ai = pa[i] ?? 0;
                    const bi = pb[i] ?? 0;
                    if (ai < bi) return -1;
                    if (ai > bi) return 1;
                }
                return 0;
            };

            if (stored && current && cmp(stored, current) < 0) {
                const proceed = window.confirm('Se ha detectado una nueva versión de la aplicación.\n\nSe limpiará la caché y se recargará la página para actualizar.\n\n¿Deseas continuar?');
                if (!proceed) {
                    return;
                }
            }
        } catch {
            setErrorMessage(null);
            setSuccessMessage(null);
        }

        try {
            const alreadyCleared = sessionStorage.getItem('cacheClearedForLogin') === '1';
            if (!alreadyCleared) {
                try {
                    sessionStorage.setItem('autoLoginAfterReload', '1');
                    sessionStorage.setItem('autoLoginEmail', email ?? '');
                    sessionStorage.setItem('autoLoginPassword', password ?? '');
                } catch (err) {
                    void err;
                }
                if (typeof window !== 'undefined' && 'caches' in window) {
                    try {
                        const cacheNames = await caches.keys();
                        await Promise.all(cacheNames.map((name) => caches.delete(name)));
                    } catch (err) {
                        console.warn('Error clearing caches before login:', err);
                    }
                }

                if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
                    try {
                        const regs = await navigator.serviceWorker.getRegistrations();
                        await Promise.all(regs.map((reg) => reg.unregister()));
                    } catch (err) {
                        console.warn('Error unregistering service workers before login:', err);
                    }
                }

                try {
                    sessionStorage.setItem('cacheClearedForLogin', '1');
                } catch (err) {
                    void err;
                }

                window.location.reload();
                return;
            } else {
                try {
                    sessionStorage.removeItem('cacheClearedForLogin');
                } catch (err) {
                    void err;
                }
            }
        } catch (err) {
            console.warn('Cache clearance step failed, continuing with login.', err);
        }

        if (isBrowserIncompatible) {
            const continuar = window.confirm(`${t('browserWarningTitle')}\n\n${t('browserWarningMessage')}`);
            if (!continuar) {
                return;
            }
        }

        setIsSubmitting(true);
        try {
            await onSubmit(e);
        } finally {
            setIsSubmitting(false);
        }
    };

    React.useEffect(() => {
        try {
            const auto = sessionStorage.getItem('autoLoginAfterReload') === '1';
            if (!auto) return;
            const storedEmail = sessionStorage.getItem('autoLoginEmail') ?? '';
            const storedPassword = sessionStorage.getItem('autoLoginPassword') ?? '';

            try {
                setEmail(storedEmail);
                setPassword(storedPassword);
            } catch (err) {
                void err;
            }

            try {
                sessionStorage.removeItem('autoLoginAfterReload');
                sessionStorage.removeItem('autoLoginEmail');
                sessionStorage.removeItem('autoLoginPassword');
            } catch (err) {
                void err;
            }

            setTimeout(() => {
                try {
                    const form = document.querySelector('form');
                    if (form && form instanceof HTMLFormElement) {
                        if (typeof (form as HTMLFormElement).requestSubmit === 'function') {
                            (form as HTMLFormElement).requestSubmit();
                        } else {
                            (form as HTMLFormElement).submit();
                        }
                    }
                } catch (err) {
                    void err;
                }
            }, 300);
        } catch (err) {
            void err;
        }
    }, []);

    useEffect(() => {
        if (!recordar) return;
        const recordarPassword = async () => {
            try {
                const response = await fetch(`${ApiTarget}/Usuario/RecordarPassword`, {
                    method: 'POST',
                    headers: {
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ email }),
                });

                if (response && !response.ok) {
                    const errorInfo = gestionarErrorServidor(response);
                    setErrorMessage(errorInfo.mensaje);
                    return;
                }

                setErrorMessage(null);

                setTimeout(() => setSuccessMessage(null), 6000);

                setTimeout(() => {
                    setRecordarSegundoPaso(false);
                    setRecordar(false);
                }, 5000);
            } catch (err: unknown) {
                const errorInfo = gestionarErrorServidor(err);
                setErrorMessage(errorInfo.mensaje);

                setTimeout(() => {
                    setRecordarSegundoPaso(false);
                    setRecordar(false);
                }, 5000);
            }
        };

        recordarPassword();
    }, [recordarSegundoPaso]);

    return (
        <div className="relative flex flex-col items-center justify-center">
            <div className="h-[400px] w-[440px]">
                <div className="mb-10">
                    <h1 className="text-center text-3xl font-extrabold uppercase !leading-snug md:text-4xl" style={{ color: '#268D8C' }}>
                        {t('IniciaSesion')}
                    </h1>
                </div>
                {!recordarSegundoPaso ? (
                    <form className="space-y-5 dark:text-white" onSubmit={handleLogin}>
                        <div>
                            <label htmlFor="Email">{t('email')}</label>
                            <div className="relative text-white-dark">
                                <img className="absolute left-3 top-1/2 -translate-y-1/2 max-h-[24px] w-auto" src="/assets/images/auth/email.svg" alt="logo" />
                                <input
                                    id="Email"
                                    type="email"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    placeholder={t('introduceEmail')}
                                    className="form-input ps-12 placeholder:text-white-dark"
                                />
                            </div>
                            {successMessage && <div className="w-full flex flex-col  text-success bg-warning-ligh p-3.5">{successMessage}</div>}
                            {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
                        </div>
                        {recordar ? (
                            <></>
                        ) : (
                            <div>
                                <label htmlFor="Password">{t('contrasena')}</label>
                                <div className="relative text-white-dark">
                                    <img className="absolute left-3 top-1/2 -translate-y-1/2 max-h-[24px] w-auto" src="/assets/images/auth/contrasena.svg" alt="logo" />
                                    <input
                                        id="Password"
                                        type="password"
                                        value={password}
                                        onChange={(e) => setPassword(e.target.value)}
                                        placeholder={t('IntroduceContrasena')}
                                        className="form-input ps-10 placeholder:text-white-dark"
                                    />
                                </div>
                            </div>
                        )}
                        {error && <p className="text-red-500">{error}</p>}
                        {!recordar ? (
                            <>
                                <div>
                                    <label className="flex cursor-pointer items-center">
                                        <input checked={recordarSesion} type="checkbox" className="form-checkbox bg-white dark:bg-black" onChange={(e) => setRecordarSesion(e.target.checked)} />
                                        <span className="text-white-dark">{t('RecordarSesion')}</span>
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    className="!mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(33,92,79,0.44)] text-white font-bold py-3 rounded bg-gradient-to-r from-[#215C4F] to-[#268D8C] hover:opacity-90 transition flex items-center justify-center gap-3"
                                    disabled={isSubmitting}
                                >
                                    {isSubmitting ? (
                                        <>
                                            <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
                                            </svg>
                                            {t('Entrando')}
                                        </>
                                    ) : (
                                        t('Entrar')
                                    )}
                                </button>
                            </>
                        ) : (
                            <button
                                type="button"
                                className="!mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(33,92,79,0.44)] text-white font-bold py-3 rounded bg-gradient-to-r from-[#215C4F] to-[#268D8C] hover:opacity-90 transition"
                                onClick={() => {
                                    setRecordarSegundoPaso(true);
                                }}
                            >
                                {t('Restablecer')}
                            </button>
                        )}
                    </form>
                ) : (
                    <>
                        <h2 className="text-lg font-bold text-center">{t('EmailRestaurarEnviado')}</h2>
                        <h2 className="text-lg font-bold text-center">{t('EmailRestaurarRevisa')}</h2>
                        <p className="text-center text-sm text-gray-500 mt-2">{t('ReenviandoLogin')}...</p>
                        <div className="w-full bg-gray-300 rounded h-2 mt-4 overflow-hidden">
                            <div className="h-2 bg-blue-500 animate-[progreso_5s_linear_forwards]" style={{ animationName: 'progreso' }}></div>
                        </div>
                        <style>{`@keyframes progreso { from { width: 100%; } to { width: 0%; }}`}</style>
                    </>
                )}
                {!recordar && (
                    <div className=" mt-5 text-center dark:text-white">
                        {t('OlvidadoContra')}&nbsp;
                        <span className="uppercase text-primary underline transition hover:text-black dark:hover:text-white" onClick={() => setRecordar(true)}>
                            {t('Aqui')}
                        </span>
                    </div>
                )}
            </div>
            <div className={`flex justify-between w-[60%] mx-auto ${error ? 'mt-14' : 'mt-8'}`}>
                <img className="max-h-[40px] w-auto" src="/assets/images/meneko.png" alt="logo" />
                <img className="max-h-[40px] w-auto" src="/assets/images/logo.svg" alt="logo" />
                <img className="max-h-[40px] w-auto" src="/assets/images/GobiernoVasco.svg" alt="logo" />
            </div>
        </div>
    );
};

export default LoginForm;

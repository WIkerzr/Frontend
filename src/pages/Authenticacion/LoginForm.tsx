import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ApiTarget } from '../../components/Utils/gets/controlDev';
import { gestionarErrorServidor } from '../../components/Utils/utils';
import { useUser } from '../../contexts/UserContext';

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

    const handleLogin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setIsSubmitting(true);
        try {
            await onSubmit(e);
        } finally {
            setIsSubmitting(false);
        }
    };

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
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
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
                <img className="max-h-[40px] w-auto" src="/assets/images/logo.svg" alt="logo" />
                <img className="max-h-[40px] w-auto" src="/assets/images/meneko.png" alt="logo" />
                <img className="max-h-[40px] w-auto" src="/assets/images/GobiernoVasco.svg" alt="logo" />
            </div>
        </div>
    );
};

export default LoginForm;

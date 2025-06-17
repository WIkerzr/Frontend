import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useTranslation } from 'react-i18next';

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
    const [recordarSegundoPaso, setRecordarSegundoPaso] = useState<boolean>(false);
    {
        useEffect(() => {
            const timer = setTimeout(() => {
                setRecordarSegundoPaso(false);
                setRecordar(false);
            }, 5000);

            return () => clearTimeout(timer);
        }, [recordarSegundoPaso]);
    }
    return (
        <div className="relative flex flex-col items-center justify-center">
            <div className="h-[400px] w-[440px]">
                <div className="mb-10">
                    <h1 className="text-center text-3xl font-extrabold uppercase !leading-snug md:text-4xl" style={{ color: '#268D8C' }}>
                        {t('IniciaSesion')}
                    </h1>
                </div>
                {!recordarSegundoPaso ? (
                    <form className="space-y-5 dark:text-white" onSubmit={onSubmit}>
                        <div>
                            <label htmlFor="Email">E-mail</label>
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
                                        <input type="checkbox" className="form-checkbox bg-white dark:bg-black" defaultChecked={true} />
                                        <span className="text-white-dark">{t('RecordarSesion')}</span>
                                    </label>
                                </div>
                                <button
                                    type="submit"
                                    className="!mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(33,92,79,0.44)] text-white font-bold py-3 rounded bg-gradient-to-r from-[#215C4F] to-[#268D8C] hover:opacity-90 transition"
                                >
                                    {t('Entrar')}
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
                        <h2 className="text-lg font-bold text-center">{t('EmailRestaurarEnviado')} </h2>
                        <h2 className="text-lg font-bold text-center">{t('EmailRestaurarRevisa')}</h2>
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
            <div className="flex justify-between w-[60%] mx-auto mt-8">
                <img className="max-h-[40px] w-auto" src="/assets/images/logo.svg" alt="logo" />
                <img className="max-h-[40px] w-auto" src="/assets/images/meneko.png" alt="logo" />
                <img className="max-h-[40px] w-auto" src="/assets/images/GobiernoVasco.svg" alt="logo" />
            </div>
        </div>
    );
};

export default LoginForm;

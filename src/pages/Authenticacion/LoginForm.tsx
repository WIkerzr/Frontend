import React from 'react';
import { Link } from 'react-router-dom';
import { LanguageSelector } from '../../components/Utils/inputs';
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
    return (
        <div>
            <div className="absolute top-6 end-6">
                <div>
                    <LanguageSelector />
                </div>
            </div>
            <div className="mb-10">
                <h1 className="text-3xl font-extrabold uppercase !leading-snug text-primary md:text-4xl">{t('IniciaSesion')}</h1>
            </div>
            <form className="space-y-5 dark:text-white" onSubmit={onSubmit}>
                <div>
                    <label htmlFor="Email">Email</label>
                    <div className="relative text-white-dark">
                        <input
                            id="Email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder={t('introduceEmail')}
                            className="form-input ps-10 placeholder:text-white-dark"
                        />
                    </div>
                </div>
                <div>
                    <label htmlFor="Password">{t('introduceEmail')}</label>
                    <div className="relative text-white-dark">
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
                {error && <p className="text-red-500">{error}</p>}
                <div>
                    <label className="flex cursor-pointer items-center">
                        <input type="checkbox" className="form-checkbox bg-white dark:bg-black" />
                        <span className="text-white-dark">{t('recordarContraseña')}</span>
                    </label>
                </div>
                <button type="submit" className="btn btn-gradient !mt-6 w-full border-0 uppercase shadow-[0_10px_20px_-10px_rgba(67,97,238,0.44)]">
                    {t('Entrar')}
                </button>
            </form>
            <div className="text-center dark:text-white">
                {t('OlvidadoContra')}&nbsp;
                <Link to="/auth/boxed-signup" className="uppercase text-primary underline transition hover:text-black dark:hover:text-white">
                    {t('Aqui')}
                </Link>
            </div>
            <div className="flex justify-between w-full mt-8">
                <img className="max-h-[40px] w-auto" src="/assets/images/logo.svg" alt="logo" />
                <img className="max-h-[40px] w-auto" src="/assets/images/meneko.png" alt="logo" />
                <img className="max-h-[40px] w-auto" src="/assets/images/GobiernoVasco.svg" alt="logo" />
            </div>
        </div>
    );
};

export default LoginForm;

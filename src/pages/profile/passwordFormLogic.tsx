import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';
import { useEffect, useState } from 'react';
import PasswordForm from './passwordForm';
import { ApiTarget } from '../../components/Utils/gets/controlDev';
import { Aviso } from '../../components/Utils/utils';

interface LoginProps {
    code?: string;
}

const PasswordFormLogic: React.FC<LoginProps> = ({ code }) => {
    const [passwordData, setPasswordData] = useState({
        email: '',
        contraNueva: '',
        repetirContra: '',
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState<boolean>(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();

    useEffect(() => {
        if (successMessage && code) {
            const timer = setTimeout(() => {
                setSuccessMessage(null);
                window.close();
            }, 4000);

            return () => clearTimeout(timer);
        }
    }, [successMessage, code]);

    const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setPasswordData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        if (isSubmitting) {
            setErrorMessage(null);
            setSuccessMessage(null);
        }
    };

    const handleSubmitUserPassword = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (passwordData.contraNueva !== passwordData.repetirContra) {
            setErrorMessage(t('ContrasenaNoCoincide'));
            setSuccessMessage(null);
            setIsSubmitting(false);
            return;
        }

        try {
            let user;
            const token = sessionStorage.getItem('token');
            const savedUser = sessionStorage.getItem('user');
            if (savedUser) {
                user = JSON.parse(savedUser);
            }
            if (!savedUser) throw new Error(t('usuarioNoAutenticado'));

            const response = await fetch(`${ApiTarget}/user/changePassword`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    UserId: user.user.id,
                    NewPassword: passwordData.contraNueva,
                }),
            });

            if (!response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            setErrorMessage(null);
            setSuccessMessage(t('CambiosGuardados'));
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
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleSubmitUserPasswordRecovery = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (passwordData.contraNueva !== passwordData.repetirContra) {
            setErrorMessage(t('ContrasenaNoCoincide'));
            setSuccessMessage(null);
            setIsSubmitting(false);
            return;
        }

        try {
            const response = await fetch(`${ApiTarget}/Usuario/RecuperarPassword`, {
                method: 'POST',
                headers: {
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email: passwordData.email,
                    code: code,
                    password: passwordData.contraNueva,
                }),
            });

            if (!response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            setErrorMessage(null);
            setSuccessMessage(t('CambiosGuardados'));
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
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            {successMessage && code ? (
                <>
                    <Aviso textoAviso={successMessage} tipoAviso="succes" />
                    <Aviso textoAviso={t('seProcederaACerrarLaPestana')} />
                </>
            ) : (
                <PasswordForm
                    onSubmit={code ? handleSubmitUserPasswordRecovery : handleSubmitUserPassword}
                    passwordData={passwordData}
                    onChange={handlePasswordChange}
                    errorMessage={errorMessage}
                    successMessage={successMessage}
                    fadeOut={fadeOut}
                    code={code}
                />
            )}
        </>
    );
};

export default PasswordFormLogic;

import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';
import { useState } from 'react';
import PasswordForm from './passwordForm';

const PasswordFormLogic = () => {
    const [passwordData, setPasswordData] = useState({
        contraNueva: '',
        repetirContra: '',
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState<boolean>(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();

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
            setErrorMessage(t('ContraseñaNoCoincide'));
            setSuccessMessage(null);
            setIsSubmitting(false);
            return;
        }

        try {
            const stored = localStorage.getItem('user');
            if (!stored) throw new Error(t('usuarioNoAutenticado'));

            const parsed = JSON.parse(stored);
            const email = parsed.email;

            const response = await fetch('/api/user/password', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    email,
                    newPassword: passwordData.contraNueva,
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
        } catch (err: any) {
            setErrorMessage(err.message || 'Error inesperado');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <PasswordForm onSubmit={handleSubmitUserPassword} passwordData={passwordData} onChange={handlePasswordChange} errorMessage={errorMessage} successMessage={successMessage} fadeOut={fadeOut} />
    );
};

export default PasswordFormLogic;

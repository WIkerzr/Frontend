import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';
import { useState } from 'react';
import PasswordForm from './passwordform';

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
    const handleSubmitUserPassword = (e: React.FormEvent) => {
        e.preventDefault();

        if (passwordData.contraNueva !== passwordData.repetirContra) {
            setErrorMessage(t('ContraseñaNoCoincide'));
            setSuccessMessage(null);
            setIsSubmitting(false);
            return;
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
        console.log('Formulario enviado');
        console.log('Contraseña nueva:', passwordData.contraNueva);
        console.log('Repetir contraseña:', passwordData.repetirContra);
        setIsSubmitting(false);
    };

    return (
        <PasswordForm onSubmit={handleSubmitUserPassword} passwordData={passwordData} onChange={handlePasswordChange} errorMessage={errorMessage} successMessage={successMessage} fadeOut={fadeOut} />
    );
};

export default PasswordFormLogic;

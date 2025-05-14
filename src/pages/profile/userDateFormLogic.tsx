import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';
import { useState } from 'react';
import UserDataForm from './userDateForm';

const FormUserDateLogic = () => {
    type Rol = 'hazi' | 'adr' | 'gobVasco';

    const [UserData, setUserData] = useState<{
        name: string;
        apellido1: string;
        apellido2: string;
        rol: Rol;
        email: string;
        ambito: string;
    }>({
        name: 'Jimmy',
        apellido1: 'Turner',
        apellido2: 'Carter',
        rol: 'adr',
        email: 'test@hazi.com',
        ambito: 'Ariano',
    });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState<boolean>(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const { t } = useTranslation();

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
        if (isSubmitting) {
            setErrorMessage(null);
            setSuccessMessage(null);
        }
    };
    const handleSubmitUserUser = (e: React.FormEvent) => {
        e.preventDefault();

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
        console.log('name:', UserData.name);
        console.log('apellido1:', UserData.apellido1);
        console.log('apellido2:', UserData.apellido2);
        console.log('rol:', UserData.rol);
        console.log('email:', UserData.email);
        console.log('rol:', UserData.rol);
        setIsSubmitting(false);
    };

    return <UserDataForm onSubmit={handleSubmitUserUser} userData={UserData} onChange={handleUserChange} errorMessage={errorMessage} successMessage={successMessage} fadeOut={fadeOut} />;
};

export default FormUserDateLogic;

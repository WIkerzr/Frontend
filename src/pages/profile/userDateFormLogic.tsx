import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';
import { useState } from 'react';
import UserDataForm from './userDateForm';

const FormUserDateLogic = () => {
    type Rol = 'hazi' | 'adr' | 'gobVasco';

    const getInitialUserData = (): {
        name: string;
        apellido1: string;
        apellido2: string;
        rol: Rol;
        email: string;
        ambito: string;
    } => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return {
                    name: parsed.name || '',
                    apellido1: parsed.apellido1 || '',
                    apellido2: parsed.apellido2 || '',
                    rol: parsed.rol || 'gobVasco',
                    email: parsed.email || '',
                    ambito: parsed.ambito || '-',
                };
            } catch (e) {
                console.error('Error parsing localStorage user:', e);
            }
        }
        return {
            name: '',
            apellido1: '',
            apellido2: '',
            rol: 'gobVasco',
            email: '',
            ambito: '-',
        };
    };

    const initialData = getInitialUserData();
    const [UserData, setUserData] = useState(initialData);
    const [originalEmail] = useState(initialData.email);
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

    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);

        try {
            const response = await fetch('/api/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: UserData.name,
                    lastName: UserData.apellido1,
                    secondSurname: UserData.apellido2,
                    //rol bloqueado asi que se queda con el original
                    rol: initialData.rol,
                    email: UserData.email,
                    ambit: UserData.ambito,
                    originalEmail,
                }),
            });

            if (!response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            //Guardar cambios actualizados en localStorage
            localStorage.setItem(
                'user',
                JSON.stringify({
                    name: UserData.name,
                    apellido1: UserData.apellido1,
                    apellido2: UserData.apellido2,
                    //rol bloqueado asi que se queda con el original
                    rol: initialData.rol,
                    email: UserData.email,
                    ambito: UserData.ambito,
                })
            );

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

    return <UserDataForm onSubmit={handleSubmitUser} userData={UserData} onChange={handleUserChange} errorMessage={errorMessage} successMessage={successMessage} fadeOut={fadeOut} />;
};

export default FormUserDateLogic;

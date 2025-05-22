import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';
import { useState } from 'react';
import UserDataForm from './userDateForm';
import { UserID } from '../../types/users';

const UserDateFormLogic: React.FC = () => {
    const getInitialUserData = (): UserID => {
        const stored = localStorage.getItem('user');
        if (stored) {
            try {
                const parsed = JSON.parse(stored);
                return {
                    name: parsed.name || '',
                    lastName: parsed.lastName || '',
                    secondSurname: parsed.secondSurname || '',
                    role: parsed.role || 'gobiernoVasco',
                    email: parsed.email || '',
                    ambit: parsed.ambit || '-',
                    status: false,
                    id: parsed.id || 9999,
                };
            } catch (e) {
                console.error('Error parsing localStorage user:', e);
            }
        }
        return {
            name: '',
            lastName: '',
            secondSurname: '',
            role: 'GV',
            email: '',
            ambit: '-',
            status: false,
            id: 9999,
        };
    };

    const initialData = getInitialUserData();
    const [UserData, setUserData] = useState(initialData);
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
            const response = await fetch('https://localhost:44300/api/user', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: UserData.name,
                    lastName: UserData.lastName,
                    secondSurname: UserData.secondSurname,
                    role: initialData.role,
                    email: UserData.email,
                    ambit: UserData.ambit,
                    id: UserData.id,
                }),
            });

            if (!response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            localStorage.setItem(
                'user',
                JSON.stringify({
                    name: UserData.name,
                    lastName: UserData.lastName,
                    secondSurname: UserData.secondSurname,
                    role: initialData.role,
                    email: UserData.email,
                    ambit: UserData.ambit,
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

export default UserDateFormLogic;

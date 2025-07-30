import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';
import { useState } from 'react';
import UserDataForm from './userDateForm';
import { UserID } from '../../types/users';
import { ApiTarget } from '../../components/Utils/gets/controlDev';
import { gestionarErrorServidor } from '../../components/Utils/utils';

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
                    status: true,
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
            status: true,
            id: '9999',
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
        const token = sessionStorage.getItem('token');

        try {
            const response = await fetch(`${ApiTarget}/user`, {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    name: UserData.name,
                    lastName: UserData.lastName,
                    secondSurname: UserData.secondSurname,
                    role: initialData.role,
                    email: UserData.email,
                    RegionId: UserData.ambit,
                    id: UserData.id,
                    status: UserData.status,
                }),
            });

            if (response && !response.ok) {
                const errorInfo = gestionarErrorServidor(response);
                setErrorMessage(errorInfo.mensaje);
                return;
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
                    status: UserData.status,
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
        } catch (err: unknown) {
            const errorInfo = gestionarErrorServidor(err);
            setErrorMessage(errorInfo.mensaje);
        } finally {
            setIsSubmitting(false);
        }
    };

    return <UserDataForm onSubmit={handleSubmitUser} userData={UserData} onChange={handleUserChange} errorMessage={errorMessage} successMessage={successMessage} fadeOut={fadeOut} />;
};

export default UserDateFormLogic;

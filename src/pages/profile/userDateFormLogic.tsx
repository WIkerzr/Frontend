import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';
import { useState } from 'react';
import UserDataForm from './userDateForm';
import { TableUsersHazi } from '../../types/users';

const UserDateFormLogic: React.FC<{
    refIdEmail?: string;
    roleDisabled?: boolean;
    recargeToSave?: () => void;
}> = ({ refIdEmail, roleDisabled = true, recargeToSave }) => {
    type role = 'hazi' | 'adr' | 'gobiernoVasco';

    const getInitialUserData = (): TableUsersHazi => {
        if (refIdEmail) {
            const usersRaw = localStorage.getItem('users');
            try {
                const users: TableUsersHazi[] = JSON.parse(usersRaw!);

                const matched = users.find((user) => user.email === refIdEmail);
                if (matched) {
                    return {
                        name: matched.name || '',
                        lastName: matched.lastName || '',
                        secondSurname: matched.secondSurname || '',
                        role: matched.role || 'gobiernoVasco',
                        email: matched.email || '',
                        ambit: matched.ambit || '-',
                        status: matched.status || false,
                    };
                }
            } catch (e) {
                console.error('Error parsing localStorage user:', e);
            }
        } else {
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
                    };
                } catch (e) {
                    console.error('Error parsing localStorage user:', e);
                }
            }
        }
        return {
            name: '',
            lastName: '',
            secondSurname: '',
            role: 'gobiernoVasco',
            email: '',
            ambit: '-',
            status: false,
        };
    };

    const initialData = getInitialUserData();
    const [UserData, setUserData] = useState(initialData);
    const [idEmail] = useState(initialData.email);
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
                    lastName: UserData.lastName,
                    secondSurname: UserData.secondSurname,
                    role: refIdEmail ? UserData.role : initialData.role,
                    email: UserData.email,
                    ambit: UserData.ambit,
                    idEmail,
                }),
            });

            if (!response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            if (!refIdEmail) {
                //Guardar cambios actualizados en localStorage si esta en perfil o no
                localStorage.setItem(
                    'user',
                    JSON.stringify({
                        name: UserData.name,
                        lastName: UserData.lastName,
                        secondSurname: UserData.secondSurname,
                        role: refIdEmail ? UserData.role : initialData.role,
                        email: UserData.email,
                        ambit: UserData.ambit,
                    })
                );
            }

            setSuccessMessage(t('CambiosGuardados'));
            if (refIdEmail) {
                return recargeToSave && recargeToSave();
            }
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
        <UserDataForm
            onSubmit={handleSubmitUser}
            userData={UserData}
            onChange={handleUserChange}
            errorMessage={errorMessage}
            successMessage={successMessage}
            fadeOut={fadeOut}
            roleDisabled={roleDisabled}
        />
    );
};

export default UserDateFormLogic;

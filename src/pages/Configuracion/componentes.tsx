import { useState } from 'react';
import { Indicador } from '../../types/Indicadores';
import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';

import { PublicUser } from '../../types/users';
import UserDataForm from '../profile/userDateForm';

const newUser: PublicUser = {
    name: '',
    lastName: '',
    secondSurname: '',
    role: 'gobiernoVasco',
    email: '',
    ambit: '',
    status: true,
};

interface BaseProps {
    recargeToSave?: () => void;
}

interface EditarProps extends BaseProps {
    accion: 'editar';
    userData: PublicUser;
}

interface NuevoProps extends BaseProps {
    accion: 'nuevo';
    userData?: undefined;
}

type UserDataProps = EditarProps | NuevoProps;

export const updateUserInLocalStorage = (updatedUser: PublicUser, accion: 'editar' | 'nuevo' | 'eliminar') => {
    try {
        const usersRaw = localStorage.getItem('users');
        const users: PublicUser[] = usersRaw ? JSON.parse(usersRaw) : [];

        let updatedUsers: PublicUser[];

        switch (accion) {
            case 'editar': {
                const exists = users.some((user) => user.email === updatedUser.email);
                if (!exists) {
                    throw new Error(`No se encontró el usuario con email: ${updatedUser.email}`);
                }
                updatedUsers = users.map((user) => (user.email === updatedUser.email ? { ...user, ...updatedUser } : user));
                break;
            }

            case 'nuevo': {
                const exists = users.some((user) => user.email === updatedUser.email);
                if (exists) {
                    throw new Error(`El usuario con email ${updatedUser.email} ya existe`);
                }
                updatedUsers = [...users, updatedUser];
                break;
            }

            case 'eliminar': {
                const exists = users.some((user) => user.email === updatedUser.email);
                if (!exists) {
                    throw new Error(`No se puede eliminar: usuario con email ${updatedUser.email} no encontrado`);
                }
                updatedUsers = users.filter((user) => user.email !== updatedUser.email);
                break;
            }

            default:
                throw new Error(`Acción no reconocida: ${accion}`);
        }

        localStorage.setItem('users', JSON.stringify(updatedUsers));
    } catch (e) {
        console.error('Error en updateUserInLocalStorage:', e);
    }
};

export const UsersDateModalLogic: React.FC<UserDataProps> = ({ userData, accion, recargeToSave }) => {
    const getInitialUserData = (): PublicUser => {
        const usersRaw = localStorage.getItem('users');
        try {
            const users: PublicUser[] = JSON.parse(usersRaw!);

            const matched = users.find((user) => user.email === userData!.email);
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

    const initialData = accion === 'editar' ? getInitialUserData() : newUser;
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
        let response: Response | null = null;

        try {
            if (accion === 'editar') {
                response = await fetch('/api/user', {
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
                        idEmail,
                    }),
                });

                updateUserInLocalStorage(UserData, 'editar');
            } else if (accion === 'nuevo') {
                response = await fetch('/api/newUser', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: UserData.name,
                        lastName: UserData.lastName,
                        secondSurname: UserData.secondSurname,
                        role: UserData.role,
                        email: UserData.email,
                        ambit: UserData.ambit,
                        status: true,
                    }),
                });
                updateUserInLocalStorage(UserData, 'nuevo');
            }

            if (response && !response.ok) {
                throw new Error(t('errorEnviarServidor'));
            }

            setSuccessMessage(t('CambiosGuardados'));

            setTimeout(() => {
                setFadeOut(true);
                setTimeout(() => {
                    setSuccessMessage(null);
                    setFadeOut(false);
                }, 1000);
            }, 5000);
            return recargeToSave && recargeToSave();
        } catch (err: any) {
            setErrorMessage(err.message || 'Error inesperado');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <UserDataForm onSubmit={handleSubmitUser} userData={UserData} onChange={handleUserChange} errorMessage={errorMessage} successMessage={successMessage} fadeOut={fadeOut} roleDisabled={false} />
    );
};

export const ModalNuevoIndicador: React.FC<{ texto: string; datosIndicador: string | undefined; tipoIndicador: 'realizacion' | 'resultado'; onGuardar: (nuevoIndicador: Indicador) => void }> = ({
    texto,
    datosIndicador,
    tipoIndicador,
    onGuardar,
}) => {
    const { t } = useTranslation();

    const [isOpen, setIsOpen] = useState(false);
    const [descripcionEditable, setDescripcionEditable] = useState('');
    const [ano, setAno] = useState(2025);
    const [tipo, setTipo] = useState<'realizacion' | 'resultado'>(tipoIndicador);

    const [mensaje, setMensaje] = useState('');

    const getSiguienteCodigo = () => {
        const prefijo = datosIndicador!.slice(0, 2);
        const numero = parseInt(datosIndicador!.slice(2, 4), 10);
        const siguienteNumero = numero + 1;
        const siguienteCodigo = `${prefijo}${String(siguienteNumero).padStart(2, '0')}.`;
        return siguienteCodigo;
    };

    let siguienteIndicador = getSiguienteCodigo();

    const handleGuardar = async () => {
        const descripcionFinal = `${siguienteIndicador ?? ''} ${descripcionEditable}`.trim();

        const response = await fetch('/api/nuevoIndicador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion: descripcionFinal, ano, tipo }),
        });

        const data = await response.json();

        if (response.ok) {
            setMensaje(t('correctoIndicadorGuardado'));
            setDescripcionEditable('');
            setAno(2025);
            setTipo(tipoIndicador);
            onGuardar(data.indicador);
            setTimeout(() => {
                setMensaje('');
                setIsOpen(false);
            }, 1000);
        } else {
            setMensaje(t('errorGuardar') + data.message);
        }
    };

    return (
        <div className="flex justify-center mb-5">
            <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 btn btn-primary w-1/2">
                {texto}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
                        <button className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl" onClick={() => setIsOpen(false)}>
                            ×
                        </button>

                        <h2 className="text-xl font-bold mb-4">{t('newIndicador')}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-medium">{t('Descripcion')}</label>
                                <div className="flex">
                                    <span className="p-2 bg-gray-100 border border-r-0 rounded-l text-gray-700 whitespace-nowrap">{siguienteIndicador}</span>
                                    <input type="text" className="w-full p-2 border rounded-r" value={descripcionEditable} onChange={(e) => setDescripcionEditable(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium">{t('Ano')}</label>
                                <input type="number" className="w-full p-2 border rounded" value={ano} onChange={(e) => setAno(Number(e.target.value))} />
                            </div>

                            <div>
                                <label className="block font-medium">{t('Tipo')}</label>
                                <select className="w-full p-2 border rounded" value={tipo} onChange={(e) => setTipo(e.target.value as 'realizacion' | 'resultado')}>
                                    <option value="realizacion">{t('Realizacion')}</option>
                                    <option value="resultado">{t('Resultado')}</option>
                                </select>
                            </div>

                            <button onClick={handleGuardar} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full">
                                {t('guardar')}
                            </button>

                            {mensaje && <p className="text-sm text-center mt-2">{mensaje}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

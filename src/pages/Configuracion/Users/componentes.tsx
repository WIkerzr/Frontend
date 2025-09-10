/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserID } from '../../../types/users';
import { ReactNode, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';

import { User } from '../../../types/users';
import UserDataForm from '../../profile/userDateForm';
import 'mantine-datatable/styles.layer.css';
import '@mantine/core/styles.css';
import { formateaConCeroDelante } from '../../../components/Utils/utils';
import { useUsers } from '../../../contexts/UsersContext';
import { useRegionContext } from '../../../contexts/RegionContext';
import { LlamadasBBDD } from '../../../components/Utils/data/utilsData';
export const newUser: UserID = {
    name: '',
    lastName: '',
    secondSurname: '',
    role: 'ADR',
    email: '',
    ambit: '',
    status: true,
    id: '0',
};

interface BaseProps {
    recargeToSave?: () => void;
}

export const updateUserInLocalStorage = (updatedUser: UserID, accion: 'editar' | 'nuevo' | 'eliminar') => {
    try {
        const usersRaw = localStorage.getItem('users');
        const users: UserID[] = usersRaw ? JSON.parse(usersRaw) : [];

        let updatedUsers: UserID[] = [...users];

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

interface EditarProps extends BaseProps {
    accion: 'editar';
    userData: UserID;
    onClose: () => void;
    title?: boolean;
}

interface NuevoProps extends BaseProps {
    accion: 'nuevo';
    userData?: User;
    onClose: () => void;
    title?: boolean;
}

type UserDataProps = EditarProps | NuevoProps;

export const UsersDateModalLogic: React.FC<UserDataProps> = ({ userData, accion, onClose, title = true }) => {
    const getInitialUserData = (): UserID => {
        const usersRaw = localStorage.getItem('users');
        try {
            const users: UserID[] = JSON.parse(usersRaw!);

            const matched = users.find((user) => user.email === userData!.email);
            if (matched) {
                return {
                    name: matched.name || '',
                    email: matched.email || '',
                    lastName: matched.lastName || '',
                    secondSurname: matched.secondSurname || '',
                    role: matched.role || 'gobiernoVasco',
                    ambit: matched.RegionId || '-',
                    status: matched.status || false,
                    id: matched.id || '9999',
                };
            }
        } catch (e) {
            console.error('Error parsing localStorage user:', e);
        }

        return {
            name: '',
            lastName: '',
            secondSurname: '',
            role: 'GOBIERNOVASCO',
            email: '',
            RegionId: '-',
            id: '9999',
            status: false,
        };
    };
    const { agregarUsuario, actualizarUsuario } = useUsers();
    const { regiones } = useRegionContext();

    const initialData = accion === 'editar' ? getInitialUserData() : { ...newUser };
    const [UserData, setUserData] = useState(initialData);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');
    const [fadeOut, setFadeOut] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState<boolean>(false);

    const { i18n } = useTranslation();

    const handleUserChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setUserData((prevData) => {
            const updatedData = {
                ...prevData,
                [name]: value,
            };

            if (name === 'role' && value !== 'adr') {
                updatedData.ambit = '';
            }

            return updatedData;
        });

        if (isSubmitting) {
            setErrorMessage('');
            setSuccessMessage('');
        }
    };

    const handleCloseModal = async () => {
        setTimeout(() => {
            setTimeout(() => {
                setSuccessMessage('');
                setErrorMessage('');
                if (!(errorMessage && errorMessage.length > 3)) {
                    onClose();
                }
                setFadeOut(false);
            }, 1000);
        }, 1000);
    };

    const handleSubmitUser = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage('');
        setSuccessMessage('');
        try {
            if (accion === 'editar') {
                if ('id' in UserData) {
                    LlamadasBBDD({
                        method: 'PUT',
                        url: `user`,
                        setLoading: setIsLoading,
                        body: {
                            name: UserData.name,
                            lastName: UserData.lastName === '' ? '-' : UserData.lastName,
                            secondSurname: UserData.secondSurname === '' ? '-' : UserData.secondSurname,
                            role: UserData.role,
                            email: UserData.email,
                            ambit: UserData.role === 'ADR' ? UserData.ambit : '-',
                            RegionId: UserData.role === 'ADR' ? formateaConCeroDelante(`${UserData.ambit}`) : null,
                            id: UserData.id,
                            status: true,
                        },
                        setErrorMessage,
                        setSuccessMessage,
                        onSuccess(data) {
                            const region = regiones.find((r) => `${r.RegionId}` === formateaConCeroDelante(data.data.RegionId));
                            const datosUsuario = {
                                ...data.data,
                                RegionName: region ? (i18n.language === 'es' ? region.NameEs : region.NameEu) : '-',
                            };
                            actualizarUsuario(datosUsuario);
                        },
                    });
                }
            } else if (accion === 'nuevo') {
                LlamadasBBDD({
                    method: 'POST',
                    url: `newUser`,
                    setLoading: setIsLoading,
                    body: {
                        name: UserData.name,
                        lastName: UserData.lastName === '' ? '-' : UserData.lastName,
                        secondSurname: UserData.secondSurname === '' ? '-' : UserData.secondSurname,
                        role: UserData.role,
                        email: UserData.email,
                        ambit: UserData.role === 'ADR' ? UserData.ambit : '-',
                        RegionId: UserData.role === 'ADR' ? formateaConCeroDelante(`${UserData.ambit}`) : null,
                        id: UserData.id,
                        status: true,
                    },
                    setErrorMessage,
                    setSuccessMessage,
                    onSuccess(data) {
                        const region = regiones.find((r) => `${r.RegionId}` === formateaConCeroDelante(data.data.RegionId));
                        const dataConRegionName = {
                            ...data.data,
                            RegionName: region ? (i18n.language === 'es' ? region.NameEs : region.NameEu) : '-',
                        };
                        agregarUsuario(dataConRegionName);
                    },
                });
            }
        } catch (err: any) {
            setErrorMessage(err.message || 'Error inesperado');
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <>
            <LoadingOverlay
                isLoading={isLoading}
                enModal={true}
                message={{
                    successMessage,
                    setSuccessMessage,
                    errorMessage,
                    setErrorMessage,
                }}
                onComplete={handleCloseModal}
            />
            <UserDataForm
                onSubmit={handleSubmitUser}
                userData={UserData}
                onChange={handleUserChange}
                errorMessage={errorMessage}
                setErrorMessage={setErrorMessage}
                successMessage={successMessage}
                fadeOut={fadeOut}
                roleDisabled={false}
                isNewUser={accion === 'nuevo'}
                title={title}
            />
        </>
    );
};

interface PanelEjesProps {
    titulo: ReactNode;
    zonaBtn?: ReactNode;
    zonaExplicativa?: ReactNode;
    zonaExtra?: ReactNode;
}

export const ZonaTitulo: React.FC<PanelEjesProps> = ({ titulo, zonaBtn, zonaExplicativa, zonaExtra }) => {
    return (
        <>
            <div className="flex flex-col justify-between mb-6 ">
                <div className="flex items-center justify-between mb-6 h-[48px]">
                    {titulo}
                    <div className="flex items-end space-x-4">{zonaBtn}</div>
                </div>
                {zonaExplicativa && (
                    <div className="w-full rounded inline-flex items-center mb-6">
                        <div className="w-full flex flex-col  text-warning bg-warning-light dark:bg-warning-dark-light p-3.5">{zonaExplicativa}</div>
                    </div>
                )}
                {zonaExtra && <>{zonaExtra}</>}
            </div>
        </>
    );
};

interface MessageProps {
    successMessage: string;
    setSuccessMessage?: React.Dispatch<React.SetStateAction<string>>;
    errorMessage: string;
    setErrorMessage?: React.Dispatch<React.SetStateAction<string>>;
}
interface LoadingOverlayProps {
    isLoading: boolean;
    message: MessageProps;
    enModal?: boolean;
    onComplete?: () => void;
    timeDelay?: boolean;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, enModal, message, onComplete, timeDelay = true }) => {
    const { successMessage, errorMessage } = message;
    const setSuccessMessage = message?.setSuccessMessage ?? (() => {});
    const setErrorMessage = message?.setErrorMessage ?? (() => {});

    const estadoLlamada: 'idle' | 'loading' | 'success' | 'error' = useMemo(() => {
        if (successMessage) return 'success';
        if (errorMessage) return 'error';
        if (!isLoading) return 'idle';
        return 'loading';
    }, [isLoading, successMessage, errorMessage]);

    useEffect(() => {
        // if (!isLoading) {
        //     setSuccessMessage('');
        //     setErrorMessage('');
        //     return;
        // }

        if (estadoLlamada === 'success' || estadoLlamada === 'error') {
            const timeout = setTimeout(
                () => {
                    if (onComplete) onComplete();
                    setSuccessMessage('');
                    setErrorMessage('');
                },
                timeDelay ? 1500 : 0
            );
            return () => clearTimeout(timeout);
        }
    }, [isLoading, estadoLlamada, onComplete, setSuccessMessage, setErrorMessage]);

    if (!isLoading) return null;

    const Loading = () => (
        <div role="status" aria-live="polite" aria-busy={'true'} className="fixed inset-0 flex justify-center items-center cursor-wait z-50 rounded-lg">
            <>
                {/* <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div> */}
                {/* <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div> */}
                {/* <span className="animate-spin border-8 border-[#f1f2f3] border-l-primary rounded-full w-14 h-14 inline-block align-middle m-auto"></span> */}
                <span className="w-16 h-16 border-8 animate-[spin_2s_linear_infinite] border-[#f1f2f3] border-l-primary border-r-primary rounded-full inline-block align-middle"></span>
            </>
        </div>
    );

    const Success = () => (
        <div role="status" aria-live="polite" aria-busy={'false'} className="backdrop-blur-sm fixed inset-0 flex justify-center items-center cursor-wait z-50 rounded-lg">
            <div className="flex flex-col items-center bg-white p-2">
                <div className="w-12 h-12 text-green-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                    </svg>
                </div>
                <p className="mt-2 text-green-600 font-semibold ">{successMessage}</p>
            </div>
        </div>
    );

    const Error = () => (
        <div role="status" aria-live="polite" aria-busy={'false'} className="backdrop-blur-sm bg-opacity-20 fixed inset-0 flex justify-center items-center cursor-wait z-50 rounded-lg">
            <div className="flex flex-col items-center bg-white p-2">
                <div className="w-12 h-12 text-red-500">
                    <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" strokeLinejoin="round" />
                        <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                </div>
                <p className="mt-2 text-red-600 font-semibold bg-white">{errorMessage}</p>
            </div>
        </div>
    );

    return (
        <div className={`${!enModal ? 'fixed inset-0 backdrop-blur-sm flex items-center justify-center bg-black bg-opacity-50 z-50' : ''}`}>
            {estadoLlamada === 'loading' && <Loading />}
            {estadoLlamada === 'success' && <Success />}
            {estadoLlamada === 'error' && <Error />}
        </div>
    );
};

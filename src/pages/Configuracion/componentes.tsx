/* eslint-disable @typescript-eslint/no-explicit-any */
import { UserID } from '../../types/users';
import { ReactNode, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';

import { User } from '../../types/users';
import UserDataForm from '../profile/userDateForm';
import 'mantine-datatable/styles.layer.css';
import '@mantine/core/styles.css';
import { useRegionContext } from '../../contexts/RegionContext';
import { EstadosLoading } from '../../types/GeneralTypes';
import { ApiTarget } from '../../components/Utils/data/controlDev';
import { FetchConRefreshRetry, formateaConCeroDelante, gestionarErrorServidor } from '../../components/Utils/utils';
import { useUsers } from '../../contexts/UsersContext';
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
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [fadeOut, setFadeOut] = useState<boolean>(false);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isLoading, setIsLoading] = useState<EstadosLoading>('idle');

    const [mensajeAMostrar, setMensajeAMostrar] = useState('');
    const { t, i18n } = useTranslation();

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
            setErrorMessage(null);
            setSuccessMessage(null);
        }
    };

    const handleCloseModal = async () => {
        setTimeout(() => {
            setTimeout(() => {
                setSuccessMessage(null);
                if (!(errorMessage && errorMessage.length > 3)) {
                    onClose();
                }
                setFadeOut(false);
                setIsLoading('idle');
            }, 1000);
        }, 1000);
    };

    const handleSubmitUser = async (e: React.FormEvent) => {
        const token = sessionStorage.getItem('access_token');
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        let response: Response | null = null;
        try {
            setIsLoading('loading');
            if (accion === 'editar') {
                if ('id' in UserData) {
                    response = await FetchConRefreshRetry(`${ApiTarget}/user`, {
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
                            role: UserData.role,
                            email: UserData.email,
                            RegionId: formateaConCeroDelante(`${UserData.ambit}`),
                            id: UserData.id,
                            status: UserData.status,
                        }),
                    });
                    if (response && !response.ok) {
                        const errorInfo = gestionarErrorServidor(response);
                        setErrorMessage(errorInfo.mensaje);
                        return;
                    }
                    if (response.ok) {
                        setErrorMessage(null);
                        setIsLoading('success');
                        setSuccessMessage(t('CambiosGuardados'));
                        const data = await response.json();
                        const region = regiones.find((r) => `${r.RegionId}` === formateaConCeroDelante(data.data.RegionId));
                        const datosUsuario = {
                            ...data.data,
                            RegionName: region ? (i18n.language === 'es' ? region.NameEs : region.NameEu) : '-',
                        };
                        actualizarUsuario(datosUsuario);
                    }
                }
            } else if (accion === 'nuevo') {
                response = await FetchConRefreshRetry(`${ApiTarget}/newUser`, {
                    method: 'POST',
                    headers: {
                        Authorization: `Bearer ${token}`,
                        Accept: 'application/json',
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        name: UserData.name,
                        lastName: UserData.lastName,
                        secondSurname: UserData.secondSurname,
                        role: UserData.role,
                        email: UserData.email,
                        ambit: UserData.ambit,
                        RegionId: formateaConCeroDelante(`${UserData.ambit}`),
                        id: UserData.id,
                        status: true,
                    }),
                });
                const data = await response.json();
                if (response && !response.ok) {
                    setIsLoading('error');
                    const errorInfo = gestionarErrorServidor(response);
                    setErrorMessage(errorInfo.mensaje);
                    return;
                }
                if (response.ok) {
                    setIsLoading('success');
                    setSuccessMessage(t('UsuarioCreadoCorrectamente'));
                    const region = regiones.find((r) => `${r.RegionId}` === formateaConCeroDelante(data.data.RegionId));
                    const dataConRegionName = {
                        ...data.data,
                        RegionName: region ? (i18n.language === 'es' ? region.NameEs : region.NameEu) : 'Desconocido',
                    };
                    agregarUsuario(dataConRegionName);
                }
            }
        } catch (err: any) {
            setIsLoading('error');
            setErrorMessage(err.message || 'Error inesperado');
        } finally {
            setIsSubmitting(false);
        }
    };

    useEffect(() => {
        if (isLoading === 'success') {
            setMensajeAMostrar(successMessage ? successMessage : '');
        } else if (isLoading === 'error') {
            setMensajeAMostrar(errorMessage ? errorMessage : '');
        }
    }, [isLoading]);

    return (
        <>
            <LoadingOverlay isLoading={isLoading} message={mensajeAMostrar} onComplete={handleCloseModal} />
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

interface LoadingOverlayProps {
    isLoading: EstadosLoading;
    message?: string;
    onComplete?: () => void;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({ isLoading, message, onComplete }) => {
    useEffect(() => {
        if (isLoading === 'success' || isLoading === 'error') {
            const timeout = setTimeout(() => {
                if (onComplete) onComplete();
            }, 1500);
            return () => clearTimeout(timeout);
        }
    }, [isLoading, onComplete]);

    if (isLoading === 'idle') {
        return null;
    }

    const Loading = () => {
        return (
            <div role="status" aria-live="polite" aria-busy={'true'} className="fixed inset-0 flex justify-center items-center cursor-wait z-50 rounded-lg">
                <>
                    {/* <div className="w-16 h-16 border-4 border-t-transparent border-white rounded-full animate-spin"></div> */}
                    {/* <div className="w-16 h-16 border-4 border-t-transparent border-blue-500 border-solid rounded-full animate-spin"></div> */}
                    {/* <span className="animate-spin border-8 border-[#f1f2f3] border-l-primary rounded-full w-14 h-14 inline-block align-middle m-auto"></span> */}
                    <span className="w-16 h-16 border-8 animate-[spin_2s_linear_infinite] border-[#f1f2f3] border-l-primary border-r-primary rounded-full inline-block align-middle"></span>
                </>
            </div>
        );
    };

    const Success = () => {
        return (
            <div role="status" aria-live="polite" aria-busy={'false'} className="backdrop-blur-sm fixed inset-0 flex justify-center items-center cursor-wait z-50 rounded-lg">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 text-green-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                    </div>
                    <p className="mt-2 text-green-600 font-semibold bg-white">{message}</p>
                </div>
            </div>
        );
    };
    const Error = () => {
        return (
            <div role="status" aria-live="polite" aria-busy={'false'} className="backdrop-blur-sm bg-opacity-20 fixed inset-0 flex justify-center items-center cursor-wait z-50 rounded-lg">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 text-red-500">
                        <svg xmlns="http://www.w3.org/2000/svg" className="w-full h-full" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="15" y1="9" x2="9" y2="15" strokeLinecap="round" strokeLinejoin="round" />
                            <line x1="9" y1="9" x2="15" y2="15" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {/* <IconXCircle/> */}
                    </div>
                    <p className="mt-2 text-red-600 font-semibold bg-white">{message}</p>
                </div>
            </div>
        );
    };

    switch (isLoading) {
        case 'loading':
            break;

        default:
            break;
    }
    return (
        <>
            {isLoading === 'loading' && <Loading />}
            {isLoading === 'success' && <Success />}
            {isLoading === 'error' && <Error />}
        </>
    );
};

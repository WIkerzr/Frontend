import { DataTable, DataTableSortStatus } from 'mantine-datatable';
import { useSelector } from 'react-redux';
import { IRootState } from '../../store';
import { sortBy } from 'lodash';
import { UserID } from '../../types/users';
import Tippy from '@tippyjs/react';
import { forwardRef, ReactNode, useEffect, useState } from 'react';
import { Indicador, indicadorInicial, IndicadorRealizacion, IndicadorResultado, indicadorResultadoinicial } from '../../types/Indicadores';
import { useTranslation } from 'react-i18next';
import 'tippy.js/dist/tippy.css';

import { User } from '../../types/users';
import UserDataForm from '../profile/userDateForm';
import IconTrash from '../../components/Icon/IconTrash';
import IconPencil from '../../components/Icon/IconPencil';
import 'mantine-datatable/styles.layer.css';
import '@mantine/core/styles.css';
import { TablaIndicadores } from './Indicadores';
import { useUsers } from './Usuarios';

const newUser: UserID = {
    name: '',
    lastName: '',
    secondSurname: '',
    role: 'GOBIERNOVASCO',
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
}

interface NuevoProps extends BaseProps {
    accion: 'nuevo';
    userData?: User;
    onClose: () => void;
}

type UserDataProps = EditarProps | NuevoProps;

export const UsersDateModalLogic: React.FC<UserDataProps> = ({ userData, accion, onClose }) => {
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

    const initialData = accion === 'editar' ? getInitialUserData() : newUser;
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
        const token = sessionStorage.getItem('token');
        e.preventDefault();
        setIsSubmitting(true);
        setErrorMessage(null);
        setSuccessMessage(null);
        let response: Response | null = null;

        try {
            if (accion === 'editar') {
                if ('id' in UserData) {
                    response = await fetch('https://localhost:44300/api/user', {
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
                            ambit: UserData.ambit,
                            id: UserData.id,
                            status: UserData.status,
                        }),
                    });
                    if (response.ok) {
                        actualizarUsuario(UserData);
                    }
                }
            } else if (accion === 'nuevo') {
                response = await fetch('https://localhost:44300/api/newUser', {
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
                        ambit: UserData.ambit,
                        id: UserData.id,
                        status: true,
                    }),
                });
                const data = await response.json();
                if (response.ok) {
                    agregarUsuario(data.data);
                }
            }

            if (response && !response.ok) {
                throw new Error(t('errorEnviarServidor'));
            } else {
                setSuccessMessage(t('CambiosGuardados'));

                setTimeout(() => {
                    setFadeOut(true);
                    setTimeout(() => {
                        setSuccessMessage(null);
                        setFadeOut(false);
                        onClose();
                    }, 1000);
                }, 1000);
            }
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

type ModalNuevoIndicadorProps = {
    isOpen: boolean;
    onClose: () => void;
    accion: 'Editar' | 'Nuevo';
    datosIndicador: IndicadorResultado;
    onSave?: (indicadorActualizado: IndicadorRealizacion) => void;
    tipoIndicador?: 'realizacion' | 'resultado';
};

export const ModalNuevoIndicador: React.FC<ModalNuevoIndicadorProps> = ({ isOpen, onClose, onSave, accion, datosIndicador, tipoIndicador }) => {
    const { t, i18n } = useTranslation();
    const [descripcionEditable, setDescripcionEditable] = useState<IndicadorRealizacion>(datosIndicador);
    const [mensaje, setMensaje] = useState('');
    const hayResultados = tipoIndicador != 'resultado' ? (descripcionEditable.Resultados!.length > 0 ? true : false) : false;
    const [mostrarResultadoRelacionado, setMostrarResultadoRelacionado] = useState(accion === 'Nuevo' ? false : hayResultados);

    const validadorRespuestasBBDD = async (response: any) => {
        const data = await response.json();

        if (response.ok) {
            const indicador: IndicadorRealizacion = {
                ...descripcionEditable,
                Id: data.data.Id,
                Resultados: data.data.Resultados,
            };
            setMensaje(t('correctoIndicadorGuardado'));
            setTimeout(() => {
                if (onSave) {
                    onSave(indicador);
                }
            }, 200);
            setTimeout(() => {
                setDescripcionEditable(indicadorInicial);
                setMostrarResultadoRelacionado(false);
                setMensaje('');
                onClose();
            }, 1000);
        } else {
            setMensaje((prevMensaje) => (prevMensaje ? prevMensaje + '\n' + t('errorGuardar') + data.message : t('errorGuardar') + data.message));
        }
    };

    const handleGuardarNuevoRealizacion = async () => {
        const token = sessionStorage.getItem('token');
        const response = await fetch('https://localhost:44300/api/nuevoIndicadores', {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(descripcionEditable),
        });
        validadorRespuestasBBDD(response);
    };

    const handleEditarIndicadorRealizacion = async () => {
        const token = sessionStorage.getItem('token');
        const response = await fetch('https://localhost:44300/api/editarIndicadorRealizacion', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(descripcionEditable),
        });
        validadorRespuestasBBDD(response);
    };

    const handleEditarIndicadorResultado = async () => {
        const token = sessionStorage.getItem('token');
        const response = await fetch('https://localhost:44300/api/editarIndicadorResultado', {
            method: 'PUT',
            headers: {
                Authorization: `Bearer ${token}`,
                Accept: 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(descripcionEditable),
        });

        validadorRespuestasBBDD(response);
    };

    const cambiosIndicadorRealizacionSinResultados = (data: IndicadorRealizacion) => {
        setDescripcionEditable((prev) => ({
            ...prev,
            NameEs: data.NameEs,
            NameEu: data.NameEu,
            RelatedAxes: data.RelatedAxes,
            Description: data.Description,
            DisaggregationVariables: data.DisaggregationVariables,
            CalculationMethodology: data.CalculationMethodology,
        }));
    };

    const BotonResultadosRelacionados: React.FC = () => {
        if (tipoIndicador === 'resultado') {
            return <></>;
        }
        return (
            <>
                {mostrarResultadoRelacionado ? (
                    <button
                        onClick={() => {
                            if (descripcionEditable.Resultados && descripcionEditable.Resultados.length > 0) {
                                const confirmacion = window.confirm(t('modalEliminarIndicadoresResultados'));
                                if (!confirmacion) return;
                                setDescripcionEditable((prev) => ({
                                    ...prev,
                                    Resultados: [],
                                }));
                            }
                            setMostrarResultadoRelacionado(false);
                        }}
                        className="btn btn-danger mx-auto block"
                    >
                        {t('sinIndicadorResultadoRelacionado')}
                    </button>
                ) : (
                    <button onClick={() => setMostrarResultadoRelacionado(true)} className="btn btn-primary mx-auto block">
                        {t('agregarIndicadorResultadoRelacionado')}
                    </button>
                )}
            </>
        );
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50" onClick={onClose}>
            <div
                className={`bg-white p-6 rounded-xl shadow-lg relative transition-all duration-300 flex
            ${mostrarResultadoRelacionado ? 'w-full max-w-4xl' : 'w-full max-w-md'}
        `}
                onClick={(e) => e.stopPropagation()}
            >
                <div className={`flex-1 transition-all duration-300 ${mostrarResultadoRelacionado ? 'pr-8' : ''}`}>
                    <button className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl" onClick={onClose}>
                        ×
                    </button>

                    <h2 className="text-xl font-bold mb-4">{t('newIndicador', { tipo: t('Realizacion') })}</h2>

                    <div className="space-y-4">
                        <RellenoIndicador indicadorRealizacion={descripcionEditable} onChange={cambiosIndicadorRealizacionSinResultados} />

                        <BotonResultadosRelacionados />

                        <button
                            onClick={() => {
                                let mensajeError = '';
                                if ((i18n.language === 'eu' && !descripcionEditable.NameEu) || (i18n.language === 'es' && !descripcionEditable.NameEs)) {
                                    mensajeError += `${t('errorMissingFields')}`;
                                }
                                if (accion === 'Nuevo') {
                                    handleGuardarNuevoRealizacion();
                                } else if (tipoIndicador === 'realizacion') {
                                    handleEditarIndicadorRealizacion();
                                } else if (tipoIndicador === 'resultado') {
                                    handleEditarIndicadorResultado();
                                }
                                if (mensajeError && mensajeError?.length > 0) {
                                    setMensaje((prevMensaje) => (prevMensaje ? prevMensaje + '\n' + t('errorGuardar') + mensajeError : t('errorGuardar') + mensajeError));
                                    return;
                                }
                            }}
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full"
                        >
                            {t('guardar')}
                        </button>

                        {mensaje && <p className="text-sm text-center mt-2">{mensaje}</p>}
                    </div>
                </div>

                {mostrarResultadoRelacionado && (
                    <>
                        <div className="w-px bg-gray-300 mx-4 self-stretch" />
                        <div className="flex-1 min-w-[300px]">
                            <h2 className="text-xl font-bold mb-4">
                                {t('Indicadores')} {t('Resultado')}
                            </h2>
                            <div>
                                <SelectorOCreador indicadorRealizacion={descripcionEditable} />
                            </div>
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};
interface RellenoIndicadorProps {
    indicadorRealizacion: IndicadorRealizacion;
    onChange: (data: IndicadorRealizacion) => void;
}

const RellenoIndicador: React.FC<RellenoIndicadorProps> = ({ indicadorRealizacion, onChange }) => {
    const { t, i18n } = useTranslation();
    const [formData, setFormData] = useState<IndicadorRealizacion>(indicadorRealizacion);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        const updatedData = { ...formData, [name]: value };
        setFormData(updatedData);
        onChange(updatedData);
    };

    useEffect(() => {
        setFormData(indicadorRealizacion);
    }, []);

    return (
        <div className="space-y-4">
            <div className="flex gap-4">
                <div className="w-1/2">
                    <label className="block font-medium">{t('Nombre Indicador')}</label>
                    <input
                        type="text"
                        name={i18n.language === 'eu' ? 'NameEu' : 'NameEs'}
                        className="w-full p-2 border rounded"
                        value={i18n.language === 'eu' ? formData.NameEu : formData.NameEs}
                        onChange={handleChange}
                    />
                </div>
                <div className="w-1/2">
                    <label className="block font-medium">{t('unitMed')}</label>
                    <select
                        name="unidad"
                        className="w-full p-2 border rounded"
                        //value={formData.unidad}
                        onChange={handleChange}
                    >
                        <option value="NUMERO">NUMERO</option>
                        <option value="OTRO">OTRO</option>
                    </select>
                </div>
            </div>

            <div>
                <label className="block font-medium">{t('Ejes relacionados')}</label>
                <input type="text" name="RelatedAxes" className="w-full p-2 border rounded" value={formData.RelatedAxes} onChange={handleChange} />
            </div>

            <div>
                <label className="block font-medium">{t('Definicion')}</label>
                <input type="text" name="Description" className="w-full p-2 border rounded" value={formData.Description} onChange={handleChange} />
            </div>

            <div>
                <label className="block font-medium">{t('Variables de desagregacion')}</label>
                <input type="text" name="DisaggregationVariables" className="w-full p-2 border rounded" value={formData.DisaggregationVariables} onChange={handleChange} />
            </div>

            <div>
                <label className="block font-medium">{t('Metologia de calculo')}</label>
                <input type="text" name="CalculationMethodology" className="w-full p-2 border rounded" value={formData.CalculationMethodology} onChange={handleChange} />
            </div>
        </div>
    );
};

const opcionesIniciales = ['Opción A', 'Opción B', 'Opción C'];
interface RellenoIndicadorResultadoProps {
    indicadorRealizacion: IndicadorRealizacion;
}

const SelectorOCreador: React.FC<RellenoIndicadorResultadoProps> = ({ indicadorRealizacion }) => {
    const { t, i18n } = useTranslation();
    const indicadoresResultados: IndicadorResultado[] = JSON.parse(localStorage.getItem('indicadoresResultado') || '[]');
    const [opciones, setOpciones] = useState(indicadoresResultados);
    const [seleccion, setSeleccion] = useState('');
    const [modoCrear, setModoCrear] = useState(false);
    const [modoEditar, setModoEditar] = useState(false);
    const [filaEditar, setFilaEditar] = useState(0);

    const [indicadoresResultado, setIndicadoresResultado] = useState<IndicadorResultado>(indicadorResultadoinicial);
    const [descripcionEditable, setDescripcionEditable] = useState<IndicadorResultado>(indicadorResultadoinicial);

    const cambiosIndicadorEditable = (data: any) => {
        setDescripcionEditable(data);
    };

    const cambiosIndicadorResultado = (data: any) => {
        setIndicadoresResultado(data);
    };

    const nuevoIndicadorResultado = () => {
        indicadorRealizacion.Resultados = [...indicadorRealizacion.Resultados!, descripcionEditable];
        setModoCrear(false);
        cambiosIndicadorResultado(indicadorRealizacion.Resultados);
        setDescripcionEditable(indicadorResultadoinicial);
    };

    const modificarIndicadorResultadoExistente = (data: IndicadorResultado) => {
        indicadorRealizacion.Resultados![filaEditar] = data;
        setModoCrear(false);
        setModoEditar(false);
        cambiosIndicadorResultado(indicadorRealizacion.Resultados);
        setDescripcionEditable(indicadorResultadoinicial);
    };

    const incorporarIndicadorResultado = (selectedOp: IndicadorResultado) => {
        indicadorRealizacion.Resultados = [...indicadorRealizacion.Resultados!, selectedOp];
        cambiosIndicadorResultado(indicadorRealizacion.Resultados);
    };

    const eliminarIndicadorResultado = (selectedOp: IndicadorResultado) => {
        if (indicadorRealizacion.Resultados) {
            indicadorRealizacion.Resultados = indicadorRealizacion.Resultados.filter((resultado) => resultado.Id !== selectedOp.Id);
            cambiosIndicadorResultado(indicadorRealizacion.Resultados);
        }
    };

    return (
        <div className="max-w-md mx-auto p-4 rounded space-y-4">
            {!modoCrear && !modoEditar ? (
                <>
                    <label className="block font-bold mb-2">{t('seleccionaopcion')}:</label>
                    <div className="flex gap-2">
                        <select
                            className="max-w-md w-full flex-1 border p-2 rounded"
                            value={seleccion}
                            onChange={(e) => {
                                const selectedValue = e.target.value;
                                const selectedOp = opciones.find((op) => (i18n.language === 'eu' ? op.NameEu : op.NameEs) === selectedValue);
                                if (selectedOp) {
                                    setIndicadoresResultado(selectedOp);
                                    incorporarIndicadorResultado(selectedOp);
                                }
                                setSeleccion('');
                            }}
                        >
                            <option value="" disabled>
                                {t('seleccionaopcion')}
                            </option>
                            {opciones
                                .filter((op) => {
                                    return !indicadorRealizacion.Resultados!.some((resultado) => resultado.Id === op.Id);
                                })
                                .map((op) => (
                                    <option key={op.Id} value={i18n.language === 'eu' ? op.NameEu : op.NameEs}>
                                        {i18n.language === 'eu' ? op.NameEu : op.NameEs}
                                    </option>
                                ))}
                        </select>

                        <button className="bg-blue-500 text-white px-3 py-2 rounded" onClick={() => setModoCrear(true)} type="button">
                            {t('crearNueva')}
                        </button>
                    </div>
                    <div className={`h-full 'w-full'}`}>
                        <div className="table-responsive mb-5">
                            <table>
                                <thead>
                                    <tr>
                                        <th>{t('Realizacion')}</th>
                                        <th className="text-center"></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {indicadorRealizacion.Resultados!.slice().map((data, index) => {
                                        return (
                                            <tr key={data.Id}>
                                                <td>
                                                    <div className="break-words">
                                                        {i18n.language === 'eu' ? (data.NameEu?.trim() ? data.NameEu : data.NameEs) : data.NameEs?.trim() ? data.NameEs : data.NameEu}
                                                    </div>
                                                </td>
                                                <td className="text-center">
                                                    <div className="flex justify-end space-x-3">
                                                        <Tippy content={t('editar')}>
                                                            <button
                                                                type="button"
                                                                onClick={() => {
                                                                    setDescripcionEditable(data);
                                                                    setModoEditar(true);
                                                                    setFilaEditar(index);
                                                                }}
                                                            >
                                                                <IconPencil />
                                                            </button>
                                                        </Tippy>
                                                        <Tippy content={t('borrar')}>
                                                            <button type="button" onClick={() => eliminarIndicadorResultado(data)}>
                                                                <IconTrash />
                                                            </button>
                                                        </Tippy>
                                                    </div>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </div>
                </>
            ) : (
                <div className="flex gap-2 ">
                    <div className="space-y-4">
                        <RellenoIndicador indicadorRealizacion={descripcionEditable} onChange={cambiosIndicadorEditable} />
                        <div className="flex gap-4">
                            <button className="bg-gray-400 text-white px-3 py-2 rounded" onClick={() => setModoCrear(false)} type="button">
                                {t('Cancelar')}
                            </button>
                            {modoCrear ? (
                                <button className="btn-primary px-3 py-2 rounded" onClick={() => nuevoIndicadorResultado()} type="button">
                                    {t('crearindicadorRelacionado')}
                                </button>
                            ) : (
                                <button className="btn-primary px-3 py-2 rounded" onClick={() => modificarIndicadorResultadoExistente(descripcionEditable)} type="button">
                                    {t('editarindicadorRelacionado')}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {seleccion && <div className="mt-2 text-green-700 font-semibold">Seleccionado: {seleccion}</div>}
        </div>
    );
};

interface EditUserProps {
    user: UserID;
    onChange: () => void;
}

export const EditUser = forwardRef<HTMLButtonElement, EditUserProps>(({ user, onChange }, ref) => {
    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);

    const handleOpen = () => setShowModal(true);
    const handleClose = () => {
        setIsClosing(true);
        onChange();
        setTimeout(() => {
            setShowModal(false);
            setIsClosing(false);
        }, 300);
    };

    return (
        <>
            <button type="button" onClick={handleOpen} ref={ref}>
                <IconPencil />
            </button>
            {showModal && (
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                    onClick={handleClose}
                >
                    <div
                        className={`bg-white p-5 rounded-lg max-w-md w-full transform transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <UsersDateModalLogic accion="editar" userData={user} onClose={() => handleClose()} />
                    </div>
                </div>
            )}
        </>
    );
});

export const DeleteUser = forwardRef<HTMLButtonElement, EditUserProps>(({ user, onChange }, ref) => {
    const { t } = useTranslation();
    const { eliminarUsuario } = useUsers();
    const handleDelete = async () => {
        const confirmDelete = window.confirm(t('¿Estás seguro de que deseas eliminar este usuario?'));
        const token = sessionStorage.getItem('token');

        if (!confirmDelete) return;

        try {
            const response = await fetch('https://localhost:44300/api/deleteUser', {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ id: user.id }),
            });

            if (!response.ok) {
                throw new Error(t('noSePudoEliminarUsuario'));
            }

            alert(t('usuarioEliminadoCorrectamente'));

            if (response.ok) {
                eliminarUsuario(user.id);
                onChange();
            }
        } catch (error: any) {
            alert(error.message || t('errorEliminarUsuario'));
        }
    };

    return (
        <button type="button" onClick={handleDelete} ref={ref} title={t('Eliminar usuario')}>
            <IconTrash />
        </button>
    );
});
interface ChangeStatusProps {
    value: UserID;
    onSuccess?: () => void;
}

export const ChangeStatus = forwardRef<HTMLTableCellElement, ChangeStatusProps>(({ value, onSuccess }, ref) => {
    const { t } = useTranslation();
    const [localStatus, setLocalStatus] = useState<boolean>(!!value.status);

    const handleToggle = async () => {
        const token = sessionStorage.getItem('token');
        const newStatus = !localStatus;
        setLocalStatus(newStatus);

        const datosUsuario = {
            name: value.name,
            lastName: value.lastName,
            secondSurname: value.secondSurname,
            role: value.role,
            email: value.email,
            ambit: value.ambit,
            status: newStatus,
            id: value.id,
        };
        try {
            await fetch('https://localhost:44300/api/user', {
                method: 'PUT',
                headers: {
                    Authorization: `Bearer ${token}`,
                    Accept: 'application/json',
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    ...datosUsuario,
                    id: value.id,
                }),
            });
            updateUserInLocalStorage(datosUsuario, 'editar');
            onSuccess?.();
        } catch (err) {
            console.error('Error actualizando el estado:', err);
            setLocalStatus(!newStatus);
        }
    };

    return (
        <button type="button" onClick={handleToggle} className="cursor-pointer" title={t('cambiarEstado')}>
            {localStatus ? '🟢' : '🔴'}
        </button>
    );
});

interface ElimarUserProps {
    onChange: () => void;
}

export const NewUser = forwardRef<HTMLButtonElement, ElimarUserProps>(({ onChange }) => {
    const { t } = useTranslation();

    const [showModal, setShowModal] = useState(false);
    const [isClosing, setIsClosing] = useState(false);
    useEffect(() => {
        setTimeout(() => {
            handleClose();
        }, 1500);
    }, []);

    const handleOpen = () => setShowModal(true);
    const handleClose = () => {
        setIsClosing(true);
        setTimeout(() => {
            setShowModal(false);
            onChange();
            setIsClosing(false);
        }, 300);
    };

    return (
        <>
            <div className="flex-grow"></div>
            <button type="button" className="btn btn-primary w-1/4 " onClick={handleOpen}>
                {t('agregarUsuario')}
            </button>

            {showModal && (
                <div
                    className={`fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-[1000] transition-opacity duration-300 ${isClosing ? 'opacity-0' : 'opacity-100'}`}
                    onClick={handleClose}
                >
                    <div
                        className={`bg-white p-5 rounded-lg max-w-md w-full transform transition-all duration-300 ${isClosing ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}
                        onClick={(e) => e.stopPropagation()}
                    >
                        <UsersDateModalLogic accion="nuevo" onClose={() => handleClose()} />
                    </div>
                </div>
            )}
        </>
    );
});

export const UsersTable = forwardRef<HTMLButtonElement>((ref) => {
    const { users, refrescarUsuarios } = useUsers();

    const { t } = useTranslation();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl' ? true : false;
    const [page, setPage] = useState(1);
    const PAGE_SIZES = [10, 15, 20, 30, 50, 100];
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);

    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus<UserID>>({ columnAccessor: 'id', direction: 'asc' });

    const [datosMostrar, setDatosMostrar] = useState<UserID[]>([]);
    const [recordsPaginados, setRecordsPaginados] = useState<UserID[]>([]);

    useEffect(() => {
        let data = [...users];

        if (search.trim()) {
            const s = search.toLowerCase();
            data = data.filter(
                (item) =>
                    (item.status && String(item.status).toLowerCase().includes(s)) ||
                    (item.name as string).toLowerCase().includes(s) ||
                    (item.lastName as string).toLowerCase().includes(s) ||
                    (item.secondSurname as string).toLowerCase().includes(s) ||
                    (item.email as string).toLowerCase().includes(s) ||
                    (item.role as string).toLowerCase().includes(s) ||
                    (item.RegionName && (item.RegionName as string).toLowerCase().includes(s))
            );
        }

        data = sortBy(data, sortStatus.columnAccessor);
        if (sortStatus.direction === 'desc') data = data.reverse();

        setDatosMostrar(data);
        setPage(1);
    }, [users, search, sortStatus]);

    useEffect(() => {
        const from = (page - 1) * pageSize;
        const to = from + pageSize;
        setRecordsPaginados(datosMostrar.slice(from, to));
    }, [datosMostrar, page, pageSize]);

    return (
        <div>
            <div className="flex items-center space-x-4 mb-5 w-[100%]">
                <input type="text" className="border border-gray-300 rounded p-2 w-full max-w-xs" placeholder={t('buscarUsuario')} value={search} onChange={(e) => setSearch(e.target.value)} />
                <NewUser onChange={() => refrescarUsuarios()} />
            </div>
            <div className="panel mt-6">
                <div className="datatables">
                    <DataTable<UserID>
                        records={recordsPaginados}
                        totalRecords={datosMostrar.length}
                        recordsPerPage={pageSize}
                        page={page}
                        onPageChange={(p) => setPage(p)}
                        recordsPerPageOptions={PAGE_SIZES}
                        onRecordsPerPageChange={setPageSize}
                        sortStatus={sortStatus}
                        onSortStatusChange={setSortStatus}
                        highlightOnHover
                        className={`${isRtl ? 'whitespace-nowrap table-hover' : 'whitespace-nowrap table-hover'}`}
                        columns={[
                            {
                                accessor: 'status',
                                title: '',
                                render: (row) => <ChangeStatus key={`status-${row.email}`} value={row} />,
                            },
                            { accessor: 'name', title: t('name'), sortable: true },
                            { accessor: 'lastName', title: t('lastName'), sortable: true },
                            { accessor: 'secondSurname', title: t('secondSurname'), sortable: true },
                            { accessor: 'email', title: t('email'), sortable: true },
                            { accessor: 'role', title: t('role'), sortable: true },
                            { accessor: 'RegionName', title: t('ambit'), sortable: true },
                            {
                                accessor: 'vacio2',
                                title: '',
                                render: (row) => (
                                    <div className="flex justify-end space-x-3">
                                        <Tippy content={t('editar')}>
                                            <EditUser user={row} onChange={() => refrescarUsuarios()} />
                                        </Tippy>
                                        <Tippy content={t('borrar')}>
                                            <DeleteUser user={row} onChange={() => refrescarUsuarios()} />
                                        </Tippy>
                                    </div>
                                ),
                            },
                        ]}
                        minHeight={200}
                        paginationText={({ from, to, totalRecords }) => t('paginacion', { from: `${from}`, to: `${to}`, totalRecords: `${totalRecords}` })}
                        recordsPerPageLabel={t('recorsPerPage')}
                    />
                </div>
            </div>
        </div>
    );
});
interface PanelEjesProps {
    titulo: ReactNode;
    zonaBtn?: ReactNode;
    zonaExplicativa?: ReactNode;
    zonaExtra?: ReactNode;
}

export const ZonaTitulo: React.FC<PanelEjesProps> = ({ titulo, zonaBtn, zonaExplicativa, zonaExtra }) => {
    const { t } = useTranslation();
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

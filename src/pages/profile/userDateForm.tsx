/* eslint-disable no-unused-vars */
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/Utils/inputs';
import BtnFormsSaveCancel from '../../components/Utils/BtnSaveCancel';
import { User, UserID } from '../../types/users';
import { useEffect, useState } from 'react';
import { newUser } from '../Configuracion/Users/componentes';
import { formateaConCeroDelante } from '../../components/Utils/utils';
import { useUser } from '../../contexts/UserContext';
import { useUsers } from '../../contexts/UsersContext';
import { useRegionContext } from '../../contexts/RegionContext';

interface UserDataFormProps {
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    userData: UserID | User;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    errorMessage?: string | null;
    setErrorMessage: React.Dispatch<React.SetStateAction<string | null>>;
    successMessage?: string | null;
    fadeOut: boolean;
    roleDisabled?: boolean;
    isNewUser?: boolean;
    title?: boolean;
}

const UserDataForm: React.FC<UserDataFormProps> = ({ onSubmit, userData, onChange, errorMessage, setErrorMessage, successMessage, fadeOut, roleDisabled = true, isNewUser, title = true }) => {
    const { t, i18n } = useTranslation();
    const { regiones } = useRegionContext();
    const [regionSeleccionada, setRegionSeleccionada] = useState(regiones.find((r) => `${r.RegionId}` === formateaConCeroDelante(`${userData.ambit}`)) || null);
    const [conditional, setConditional] = useState<boolean>(false);
    const [datosUsuario, setDatosUsuario] = useState(userData);
    const { user } = useUser();
    const [email, setEmail] = useState<string[]>([]);
    const { users } = useUsers();

    useEffect(() => {
        if ((user!.role as string) === 'HAZI') {
            setEmail(users.map((usuario) => usuario.email));
        }
    }, []);

    useEffect(() => {
        setDatosUsuario(userData);
    }, [userData]);

    useEffect(() => {
        if (isNewUser) {
            setDatosUsuario(newUser);
        }
    }, []);

    useEffect(() => {
        if ('id' in userData && regionSeleccionada) {
            const regionNames = regiones.find((region) => region.RegionId === regionSeleccionada.RegionId);
            if (!regionNames) {
                return;
            }
            setDatosUsuario((prev) => ({
                ...prev,
                ambit: regionSeleccionada!.RegionId,
                RegionName: i18n.language === 'eu' ? regionNames.NameEu : regionNames.NameEs,
            }));
        }
    }, [regionSeleccionada]);

    useEffect(() => {
        const todosLosCamposRellenosUserModal = Object.entries(datosUsuario).every(([key, value]) => {
            if (key === 'lastName' || key === 'secondSurname') {
                return true;
            }
            if (key === 'ambit' || key === 'RegionName') {
                if (datosUsuario.role !== 'ADR') {
                    return true;
                }
                return typeof value === 'string' ? value.trim() !== '' : value !== null && value !== undefined;
            }

            if (typeof value === 'string') {
                return value.trim() !== '';
            }

            return value !== null && value !== undefined;
        });
        if (errorMessage) {
            setConditional(false);
        } else {
            setConditional(todosLosCamposRellenosUserModal);
        }
    }, [datosUsuario, regionSeleccionada]);

    const handleRoleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        if (e.target.value !== 'HAZI') {
            userData.RegionName = '';
            userData.ambit = '';
            setRegionSeleccionada(null);
        }
        onChange(e);
    };

    const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value.replace(/\s/g, '');
        const otrosEmails = email.filter((e) => e !== user!.email);
        if (otrosEmails.includes(value)) {
            setErrorMessage(t('emailYaRegistrado'));
        } else {
            setErrorMessage(null);
        }
        const customEvent = {
            ...e,
            target: {
                ...e.target,
                name: 'email',
                value: value,
            },
        } as React.ChangeEvent<HTMLInputElement>;
        onChange(customEvent);
    };

    return (
        <div>
            <form className="panel h-full" onSubmit={onSubmit}>
                {title && <h2 className="text-lg font-semibold mb-4">{t('datosUsuarios')}</h2>}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">{t('email')}</label>
                        <div className="flex">
                            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                @
                            </div>
                            <input
                                type="text"
                                placeholder={`${t('email')}@email.com`}
                                className="form-input ltr:rounded-l-none rtl:rounded-r-none"
                                value={userData.email as string}
                                name="email"
                                onChange={(e) => handleEmailChange(e)}
                            />
                        </div>
                    </div>
                    <Input nombreInput={t('name')} type="text" value={userData.name as string} onChange={onChange} name="name" />
                    <Input nombreInput={t('lastName')} type="text" value={userData.lastName as string} onChange={onChange} name="lastName" />
                    <Input nombreInput={t('secondSurname')} type="text" value={userData.secondSurname as string} onChange={onChange} name="secondSurname" />
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('role')}</label>
                        <select className="form-select w-full" name="role" value={userData.role as string} onChange={(e) => handleRoleChange(e)} disabled={roleDisabled}>
                            <option value="ADR">{t('adr')}</option>
                            <option value="HAZI">{t('hazi')}</option>
                            <option value="GV">{t('gobiernoVasco')}</option>
                        </select>
                    </div>
                    {userData.role === 'ADR' || userData.role === 'adr' ? (
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('comarca')}</label>
                            <select
                                className="form-select min-w-max w-full"
                                style={{ minWidth: 'calc(100% + 10px)' }}
                                value={i18n.language === 'eu' ? regionSeleccionada?.NameEu : regionSeleccionada?.NameEs}
                                name="RegionName"
                                onChange={(e) => {
                                    const regionIdSeleccionado = e.target.value;
                                    const region = regiones.find((r) => (i18n.language === 'eu' ? r.NameEu : r.NameEs) === regionIdSeleccionado);
                                    setRegionSeleccionada(region!);

                                    const evento = {
                                        target: {
                                            name: 'ambit',
                                            value: region?.RegionId,
                                        },
                                    };

                                    onChange(evento as unknown as React.ChangeEvent<HTMLInputElement>);
                                }}
                            >
                                <option value="notSelect">{t('sinSeleccionar')}</option>
                                {regiones.map((region) => (
                                    <option key={region.RegionId} value={i18n.language === 'eu' ? region.NameEu : region.NameEs}>
                                        {i18n.language === 'eu' ? region.NameEu : region.NameEs}
                                    </option>
                                ))}
                            </select>
                        </div>
                    ) : (
                        <></>
                    )}
                </div>
                {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
                {successMessage && (
                    <div className={`mt-4 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                        <p className="text-green-500">{successMessage}</p>
                    </div>
                )}
                <BtnFormsSaveCancel options="save" conditionalSave={!conditional} />
            </form>
        </div>
    );
};

export default UserDataForm;

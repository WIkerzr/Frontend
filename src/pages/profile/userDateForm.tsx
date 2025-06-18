/* eslint-disable no-unused-vars */
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/Utils/inputs';
import BtnFormsSaveCancel from '../../components/Utils/BtnSaveCancel';
import { User, UserID } from '../../types/users';
import { useEffect, useState } from 'react';
import { useRegionContext } from '../../contexts/RegionContext';

interface UserDataFormProps {
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    userData: UserID | User;
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    errorMessage: string | null;
    successMessage: string | null;
    fadeOut: boolean;
    roleDisabled?: boolean;
}

const UserDataForm: React.FC<UserDataFormProps> = ({ onSubmit, userData, onChange, errorMessage, successMessage, fadeOut, roleDisabled = true }) => {
    const { t, i18n } = useTranslation();
    const { regiones } = useRegionContext();
    const [regionSeleccionada, setRegionSeleccionada] = useState(regiones.find((r) => r.RegionId === userData.ambit) || null);

    useEffect(() => {
        userData.ambit = regionSeleccionada?.RegionId;
    }, [regionSeleccionada]);

    return (
        <div>
            <form className="panel h-full" onSubmit={onSubmit}>
                <h2 className="text-lg font-semibold mb-4">{t('datosUsuarios')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">{t('email')}</label>
                        <div className="flex">
                            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                @
                            </div>
                            <input
                                type="text"
                                placeholder="{t('email')}@E-mail.com"
                                className="form-input ltr:rounded-l-none rtl:rounded-r-none"
                                value={userData.email as string}
                                name="email"
                                onChange={onChange}
                            />
                        </div>
                    </div>
                    <Input nombreInput={t('name')} type="text" value={userData.name as string} onChange={onChange} name="name" />
                    <Input nombreInput={t('lastName')} type="text" value={userData.lastName as string} onChange={onChange} name="lastName" />
                    <Input nombreInput={t('secondSurname')} type="text" value={userData.secondSurname as string} onChange={onChange} name="secondSurname" />
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('role')}</label>
                        <select className="form-select w-full" name="role" value={userData.role as string} onChange={onChange} disabled={roleDisabled}>
                            <option value="ADR">{t('adr')}</option>
                            <option value="HAZI">{t('hazi')}</option>
                            <option value="GV">{t('gobiernoVasco')}</option>
                        </select>
                    </div>
                    {userData.role === 'ADR' || userData.role === 'adr' ? (
                        <div>
                            <label className="block text-sm font-medium mb-1">{t('region')}</label>
                            <select
                                className="form-select min-w-max w-full"
                                style={{ minWidth: 'calc(100% + 10px)' }}
                                value={i18n.language === 'eu' ? regionSeleccionada?.NameEu : regionSeleccionada?.NameEs}
                                onChange={(e) => {
                                    setRegionSeleccionada(regiones.find((r) => (i18n.language === 'eu' ? r.NameEu : r.NameEs) === e.target.value)!);
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
                    .
                </div>
                {errorMessage && <p className="text-red-500 text-sm mt-2">{errorMessage}</p>}
                {successMessage && (
                    <div className={`mt-4 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                        <p className="text-green-500">{successMessage}</p>
                    </div>
                )}
                <BtnFormsSaveCancel options="save" />
            </form>
        </div>
    );
};

export default UserDataForm;

import { useTranslation } from 'react-i18next';
import Input from '../../components/Utils/inputs';
import BtnFormsSaveCancel from '../../components/Utils/BtnSaveCancel';

interface UserDataFormProps {
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    userData: {
        name: string;
        apellido1: string;
        apellido2: string;
        rol: 'hazi' | 'adr' | 'gobVasco';
        email: string;
        ambito: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
    errorMessage: string | null;
    successMessage: string | null;
    fadeOut: boolean;
}

const UserDataForm: React.FC<UserDataFormProps> = ({ onSubmit, userData, onChange, errorMessage, successMessage, fadeOut }) => {
    const { t } = useTranslation();

    return (
        <div>
            <form className="panel h-full" onSubmit={onSubmit}>
                <h2 className="text-lg font-semibold mb-4">{t('datosUsuarios')}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input nombreInput="nombre" type="text" value={userData.name} onChange={onChange} name="name"></Input>
                    <Input nombreInput="apellido1" type="text" value={userData.apellido1} onChange={onChange} name="apellido1"></Input>
                    <Input nombreInput="apellido2" type="text" value={userData.apellido2} onChange={onChange} name="apellido2"></Input>
                    <div>
                        <label className="block text-sm font-medium mb-1">{t('rol')}</label>
                        <select className="form-select w-full" name="rol" value={userData.rol} onChange={onChange}>
                            <option value="adr">{t('adr')}</option>
                            <option value="hazi">{t('hazi')}</option>
                            <option value="gobVasco">{t('gobVasco')}</option>
                        </select>
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-sm font-medium mb-1">E-mail</label>
                        <div className="flex">
                            <div className="bg-[#eee] flex justify-center items-center ltr:rounded-l-md rtl:rounded-r-md px-3 font-semibold border ltr:border-r-0 rtl:border-l-0 border-white-light dark:border-[#17263c] dark:bg-[#1b2e4b]">
                                @
                            </div>
                            <input type="text" placeholder="E-mail@E-mail.com" className="form-input ltr:rounded-l-none rtl:rounded-r-none" value={userData.email} name="email" onChange={onChange} />
                        </div>
                    </div>
                    <Input nombreInput="ambito" type="text" value={userData.ambito} onChange={onChange} name="ambito"></Input>
                </div>
                {successMessage && (
                    <div className={`mt-4 transition-opacity duration-1000 ${fadeOut ? 'opacity-0' : 'opacity-100'}`}>
                        <p className="text-green-500">{successMessage}</p>
                    </div>
                )}
                <BtnFormsSaveCancel options="save"></BtnFormsSaveCancel>
            </form>
        </div>
    );
};

export default UserDataForm;

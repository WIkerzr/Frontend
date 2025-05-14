import { useTranslation } from 'react-i18next';
import Input from '../../components/Utils/inputs';
import BtnFormsSaveCancel from '../../components/Utils/BtnSaveCancel';

interface PasswordFormProps {
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    passwordData: {
        contraNueva: string;
        repetirContra: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errorMessage: string | null;
    successMessage: string | null;
    fadeOut: boolean;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ onSubmit, passwordData, onChange, errorMessage, successMessage, fadeOut }) => {
    const { t } = useTranslation();

    return (
        <div>
            <form className="panel h-full" onSubmit={onSubmit}>
                <h2 className="text-lg font-semibold mb-4">{t('CambioContraseña')}</h2>
                <div className="space-y-4">
                    <Input nombreInput="contraNueva" type="password" value={passwordData.contraNueva} onChange={onChange} name="contraNueva" />
                    <Input nombreInput="repetirContra" type="password" value={passwordData.repetirContra} onChange={onChange} name="repetirContra" />
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

export default PasswordForm;

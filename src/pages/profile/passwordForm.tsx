/* eslint-disable no-unused-vars */
import { useTranslation } from 'react-i18next';
import { Input } from '../../components/Utils/inputs';
import BtnFormsSaveCancel from '../../components/Utils/BtnSaveCancel';
import { useEffect, useState } from 'react';

interface PasswordFormProps {
    onSubmit: React.FormEventHandler<HTMLFormElement>;
    passwordData: {
        email: string;
        contraNueva: string;
        repetirContra: string;
    };
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    errorMessage: string | null;
    successMessage: string | null;
    fadeOut: boolean;
    code?: string;
}

const PasswordForm: React.FC<PasswordFormProps> = ({ onSubmit, passwordData, onChange, errorMessage, successMessage, fadeOut, code }) => {
    const { t } = useTranslation();
    const [conditional, setConditional] = useState<boolean>(false);
    const [mensaje, setMensaje] = useState<string>('');

    useEffect(() => {
        if (passwordData.contraNueva.length != 0) {
            if (passwordData.contraNueva.length < 8) {
                setMensaje(t('minimoPassword'));
                setConditional(false);
            } else if (passwordData.contraNueva != passwordData.repetirContra) {
                setMensaje(t('diferentesPassword'));
                setConditional(false);
            } else {
                setMensaje('');
                setConditional(true);
            }
        }
    }, [passwordData, t]);
    return (
        <div>
            <form className="panel h-full" onSubmit={onSubmit}>
                <h2 className="text-lg font-semibold mb-4">{t('CambioContrasena')}</h2>
                <div className="space-y-4">
                    {code && <Input nombreInput="email" type="email" value={passwordData.email} onChange={onChange} name="email" />}
                    <Input nombreInput="contraNueva" type="password" value={passwordData.contraNueva} onChange={onChange} name="contraNueva" />
                    <Input nombreInput="repetirContra" type="password" value={passwordData.repetirContra} onChange={onChange} name="repetirContra" />
                </div>
                {mensaje && <div className="w-full flex flex-col  text-warning bg-warning-light dark:bg-warning-dark-light p-3.5">{mensaje}</div>}
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

export default PasswordForm;

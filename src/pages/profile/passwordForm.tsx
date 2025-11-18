/* eslint-disable no-unused-vars */
import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import BtnFormsSaveCancel from '../../components/Utils/BtnSaveCancel';
import { Input } from '../../components/Utils/inputs';

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
        const nueva = passwordData.contraNueva || '';
        const repetir = passwordData.repetirContra || '';

        if (nueva.length === 0) {
            setMensaje('');
            setConditional(false);
            return;
        }

        const faltantes: string[] = [];
        if (nueva.length < 12) faltantes.push(t('passwordLongitud12'));
        if (!/[a-z]/.test(nueva)) faltantes.push(t('passwordMinuscula'));
        if (!/[A-Z]/.test(nueva)) faltantes.push(t('passwordMayuscula'));
        if (!/\d/.test(nueva)) faltantes.push(t('passwordNumero'));
        // Caracter especial: cualquier no alfanumérico
        if (!/[^A-Za-z0-9]/.test(nueva)) faltantes.push(t('passwordEspecial'));

        if (repetir.length > 0 && nueva !== repetir) {
            faltantes.push(t('diferentesPassword'));
        }

        if (faltantes.length > 0) {
            setMensaje(`${t('passwordRequisitosFaltantes')} ${faltantes.join(', ')}`);
            setConditional(false);
        } else {
            setMensaje('');
            setConditional(true);
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

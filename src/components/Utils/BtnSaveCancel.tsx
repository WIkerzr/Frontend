import { useTranslation } from 'react-i18next';

interface BtnSaveCancelProps {
    options: 'save' | 'cancel';
    className?: string;
    onCancel?: () => void;
}

const BtnFormsSaveCancel = ({ options: tipo, className, onCancel }: BtnSaveCancelProps) => {
    const { t } = useTranslation();

    const handleCancel = () => {
        if (onCancel) {
            onCancel();
        }
    };

    return (
        <div className={`mt-4 flex flex-col justify-end items-end ${className ? className : ''}`}>
            {tipo === 'save' ? (
                <button type="submit" className="btn btn-primary">
                    {t('guardar')}
                </button>
            ) : (
                <button type="button" className="btn btn-secondary" onClick={handleCancel}>
                    {t('cancelar')}
                </button>
            )}
        </div>
    );
};

export default BtnFormsSaveCancel;

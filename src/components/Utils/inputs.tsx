import { useTranslation } from 'react-i18next';

interface InputProps {
    nombreInput: string;
    type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'date';
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value: string;
    name: string;
    className?: string;
}

const Input = ({ nombreInput, type, className, onChange, value, name }: InputProps) => {
    const { t } = useTranslation();

    return (
        <div>
            <label className={`block text-sm font-medium mb-1 ${className ? className : ''}`}>{t(nombreInput)}</label>
            <input type={type} className="form-input w-full" value={value} onChange={onChange} name={name} />
        </div>
    );
};

export default Input;

import { useTranslation } from 'react-i18next';
import { useRegionContext } from '../../contexts/RegionContext';
import { useEffect, useRef } from 'react';
import { yearIniciado } from '../../types/tipadoPlan';
import { useUser } from '../../contexts/UserContext';
import { UserRole } from '../../types/users';
import { useYear } from '../../contexts/DatosAnualContext';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    nombreInput: string;
    required?: boolean;
    divClassName?: string;
}
interface TextAreaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    nombreInput: string;
    required?: boolean;
    divClassName?: string;
}

export const Input = ({ nombreInput, divClassName, className, required, ...rest }: InputProps) => {
    const { t } = useTranslation();

    return (
        <div className={divClassName}>
            <label className={`block text-sm font-medium mb-1 ${className ? className : ''}`}>
                {required ? '*' : ''}
                {t(nombreInput)}
            </label>
            <input {...rest} className={`form-input w-full`} />
        </div>
    );
};

export const InputField = ({ nombreInput, divClassName, className, required, ...rest }: InputProps) => {
    const { t } = useTranslation();

    return (
        <div className={`flex-1 ${divClassName}`}>
            <label htmlFor={nombreInput}>
                {required ? '*' : ''}
                {t(nombreInput)}
            </label>
            <input {...rest} required={required} name={nombreInput} className={`w-full border rounded p-2 resize-y ${className}`} />
        </div>
    );
};
export const TextArea = ({ nombreInput, className = '', required, value, onChange, ...rest }: TextAreaProps) => {
    const { t } = useTranslation();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto'; // Reset height
            el.style.height = `${el.scrollHeight}px`; // Set to scroll height
        }
    }, [value]);

    return (
        <div className="flex-1">
            <label htmlFor={nombreInput} className="block mb-1">
                {required ? '*' : ''} {t(nombreInput)}
            </label>
            <textarea
                ref={textareaRef}
                required={required}
                name={nombreInput}
                value={value}
                onChange={onChange}
                className={`w-full border rounded p-2 resize-none overflow-hidden ${className}`}
                {...rest}
            />
        </div>
    );
};

export const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLang = e.target.value;
        i18n.changeLanguage(selectedLang);
        localStorage.setItem('idioma', selectedLang);
    };

    return (
        <select id="idioma" className="form-select text-white-dark min-w-max mr-5" style={{ minWidth: 'calc(100% + 10px)' }} value={i18n.language} onChange={handleLanguageChange}>
            <option value="es">ES</option>
            <option value="eu">EU</option>
        </select>
    );
};

interface RegionSelectProps {
    disabled?: boolean;
    header?: boolean;
    noInput?: boolean;
}

export const RegionSelect: React.FC<RegionSelectProps> = ({ disabled, header = false }) => {
    const { i18n, t } = useTranslation();
    const { user } = useUser();
    const role: UserRole = user!.role as UserRole;
    const { setYearData } = useYear();
    const { regiones, regionSeleccionada, setRegionSeleccionada } = useRegionContext();

    const getRegionName = (region: { NameEs: string; NameEu: string }) => (i18n.language === 'eu' ? region.NameEu : region.NameEs);
    useEffect(() => {
        const savedRegion = sessionStorage.getItem('regionSeleccionada');
        if (savedRegion !== null && !isNaN(Number(savedRegion))) {
            setRegionSeleccionada(Number(savedRegion));
        }
    }, []);

    useEffect(() => {
        if (regionSeleccionada !== null) {
            sessionStorage.setItem('regionSeleccionada', regionSeleccionada.toString());
        }
        setYearData(yearIniciado);
    }, [regionSeleccionada]);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'notSelect') {
            setRegionSeleccionada(null);
        } else {
            setRegionSeleccionada(Number(value));
        }
    };
    const region = regiones.find((r) => r.RegionId === regionSeleccionada);

    return (
        <div>
            {header ? <></> : <label className="block text-sm font-medium mb-1">{t('region')}</label>}
            {role.toUpperCase() != 'ADR' ? (
                <select
                    disabled={disabled}
                    className="form-select min-w-max w-full"
                    style={{ minWidth: 'calc(100% + 10px)' }}
                    value={regionSeleccionada === null || regionSeleccionada === undefined ? 'notSelect' : regionSeleccionada.toString()}
                    onChange={handleChange}
                >
                    <option value="notSelect">{t('sinSeleccionar')}</option>
                    {regiones.map((region) => (
                        <option key={region.RegionId} value={region.RegionId.toString()}>
                            {getRegionName(region)}
                        </option>
                    ))}
                </select>
            ) : (
                <div>{region ? region.NameEs : t('noRegionSeleccionada')}</div>
            )}
        </div>
    );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    title: string;
    options: readonly string[];
}
export const SimpleDropdown = ({ title, options, value }: SelectProps) => {
    const { t } = useTranslation();
    return (
        <div className="flex-1">
            <label>{t(title)}</label>
            <select className="w-full border rounded p-2 resize-y" value={value}>
                <option disabled>{t('seleccionaopcion')}</option>
                {options.map((text) => (
                    <option key={text} value={text}>
                        {text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()}
                    </option>
                ))}
            </select>
        </div>
    );
};

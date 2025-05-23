import { useTranslation } from 'react-i18next';
import { Region } from './gets/getRegiones';
import { useRegionContext } from '../../contexts/RegionContext';

interface InputProps {
    nombreInput: string;
    type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'date';
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value: string;
    name: string;
    className?: string;
}

export const Input = ({ nombreInput, type, className, onChange, value, name }: InputProps) => {
    const { t } = useTranslation();

    return (
        <div>
            <label className={`block text-sm font-medium mb-1 ${className ? className : ''}`}>{t(nombreInput)}</label>
            <input type={type} className="form-input w-full" value={value} onChange={onChange} name={name} />
        </div>
    );
};

export const LanguageSelector = () => {
    const { i18n } = useTranslation();

    const handleLanguageChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedLang = e.target.value.toLowerCase();
        i18n.changeLanguage(selectedLang);
    };

    return (
        <select id="idioma" className="form-select text-white-dark min-w-max mr-5" style={{ minWidth: 'calc(100% + 10px)' }} value={i18n.language.toUpperCase()} onChange={handleLanguageChange}>
            <option value="ES">ES</option>
            <option value="EU">EU</option>
        </select>
    );
};

export const RegionSelect: React.FC = () => {
    const { i18n, t } = useTranslation();
    const { regiones, loading, error, regionSeleccionada, setRegionSeleccionada } = useRegionContext();

    const getRegionName = (region: { NameEs: string; NameEu: string }) => (i18n.language === 'eu' ? region.NameEu : region.NameEs);

    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const value = e.target.value;
        if (value === 'notSelect') {
            setRegionSeleccionada(null);
        } else {
            setRegionSeleccionada(Number(value));
        }
    };

    if (loading)
        return (
            <select disabled className="form-select text-white-dark min-w-max" style={{ minWidth: 'calc(100% + 10px)' }}>
                <option>{t('cargando')}</option>
            </select>
        );
    if (error) return <div>{t('errorCargandoRegiones')}</div>;

    return (
        <select
            className="form-select text-white-dark min-w-max"
            style={{ minWidth: 'calc(100% + 10px)' }}
            value={regionSeleccionada === null ? 'notSelect' : regionSeleccionada}
            onChange={handleChange}
        >
            <option value="notSelect">{t('sinSeleccionar')}</option>
            {regiones.map((region) => (
                <option key={region.RegionId} value={region.RegionId}>
                    {getRegionName(region)}
                </option>
            ))}
        </select>
    );
};

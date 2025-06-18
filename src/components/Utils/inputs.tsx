/* eslint-disable no-unused-vars */
import { useTranslation } from 'react-i18next';
import { useRegionContext } from '../../contexts/RegionContext';
import { useEffect } from 'react';
import { yearIniciado } from '../../types/tipadoPlan';
import { useUser } from '../../contexts/UserContext';
import { UserRole } from '../../types/users';
import { useYear } from '../../contexts/DatosAnualContext';

interface InputProps {
    nombreInput: string;
    type: 'text' | 'password' | 'email' | 'number' | 'tel' | 'date';
    onChange?: (e: React.ChangeEvent<HTMLInputElement>) => void;
    value: string;
    name: string;
    className?: string;
    divClassName?: string;
}

export const Input = ({ nombreInput, type, className, onChange, value, name, divClassName }: InputProps) => {
    const { t } = useTranslation();

    return (
        <div className={divClassName}>
            <label className={`block text-sm font-medium mb-1 ${className ? className : ''}`}>{t(nombreInput)}</label>
            <input type={type} className="form-input w-full" value={value} onChange={onChange} name={name} />
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

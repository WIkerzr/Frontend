/* eslint-disable no-unused-vars */
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
    noTitle?: boolean;
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
export const TextArea = ({ nombreInput, className = '', required, value, onChange, noTitle, ...rest }: TextAreaProps) => {
    const { t } = useTranslation();
    const textareaRef = useRef<HTMLTextAreaElement>(null);

    useEffect(() => {
        const el = textareaRef.current;
        if (el) {
            el.style.height = 'auto';
            el.style.height = `${el.scrollHeight}px`;
        }
    }, [value]);

    return (
        <div className="flex-1">
            {!noTitle && (
                <label htmlFor={nombreInput} className="block mb-1">
                    {required ? '*' : ''} {t(nombreInput)}
                </label>
            )}
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
            sessionStorage.setItem('regionSeleccionada', regionSeleccionada);
        }
        //TODO llamada YearData segun region
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
    const region = regiones.find((r) => `${r.RegionId}` === (regionSeleccionada ?? ''));

    return (
        <div>
            {header ? <></> : <label className="block text-sm font-medium mb-1">{t('comarca')}</label>}
            {role.toUpperCase() != 'ADR' ? (
                <select
                    disabled={disabled}
                    className="form-select min-w-max w-full"
                    style={{ minWidth: 'calc(100% + 10px)' }}
                    value={regionSeleccionada === null || regionSeleccionada === undefined ? 'notSelect' : regionSeleccionada}
                    onChange={handleChange}
                >
                    <option value="notSelect">{t('sinSeleccionar')}</option>
                    {regiones.map((region) => (
                        <option key={region.RegionId} value={region.RegionId}>
                            {getRegionName(region)}
                        </option>
                    ))}
                </select>
            ) : (
                <div>{region ? region.NameEs : t('noComarcaSeleccionada')}</div>
            )}
        </div>
    );
};

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    title?: string;
    options: readonly number[] | string[];
    mostrarSeleccionaopcion?: boolean;
    onChange?: (event: React.ChangeEvent<HTMLSelectElement>) => void;
}
export const SimpleDropdown = ({ title, options, value, disabled, mostrarSeleccionaopcion = false, onChange }: SelectProps) => {
    const { t } = useTranslation();
    return (
        <div className="flex-1">
            {title && <label>{t(title)}</label>}
            <select className="w-full border rounded p-2 resize-y" disabled={disabled} value={value} onChange={onChange}>
                <option disabled={!mostrarSeleccionaopcion}>{t('seleccionaopcion')}</option>
                {options.map((text) => (
                    <option key={text} value={text}>
                        {typeof text === 'string' ? text.charAt(0).toUpperCase() + text.slice(1).toLowerCase() : text}
                    </option>
                ))}
            </select>
        </div>
    );
};

interface AttachProps {
    files: File[];
    setFiles: React.Dispatch<React.SetStateAction<File[]>>;
    onChange: (files: File[]) => void;
    multiple?: boolean;
    title?: string;
}

export function isImage(file: File) {
    return /^image\//.test(file.type);
}

export const AdjuntarArchivos = ({ files, setFiles, onChange, multiple, title }: AttachProps) => {
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const newFiles = e.target.files ? Array.from(e.target.files) : [];
        setFiles(newFiles);
        onChange(newFiles);
    };

    // Drag and drop handlers
    const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
        const newFiles = Array.from(e.dataTransfer.files).filter((file) => file.type === 'application/pdf' || file.type.startsWith('image/'));
        setFiles(newFiles);
        onChange(newFiles);
    };

    const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
        e.preventDefault();
        e.stopPropagation();
    };

    return (
        <div className="mb-5 flex flex-col">
            {title && <span className="mb-1">{title}</span>}
            <div className="flex flex-row gap-2 items-center">
                <div
                    className="flex-1 bg-gray-100 border border-gray-300 rounded px-4 py-2 flex items-center justify-center cursor-pointer select-none transition-all text-gray-700 hover:bg-gray-200"
                    onClick={() => fileInputRef.current?.click()}
                    onDrop={handleDrop}
                    onDragOver={handleDragOver}
                >
                    Escoge o suelta un archivo aquí a subir
                    <input ref={fileInputRef} type="file" accept=".pdf,image/*" multiple={multiple} style={{ display: 'none' }} onChange={handleChange} />
                </div>
                <button type="button" className="px-4 py-2 bg-blue-100 text-blue-700 rounded border border-blue-300 hover:bg-blue-200 transition-all" onClick={() => fileInputRef.current?.click()}>
                    Explorar
                </button>
            </div>
            <div className="mt-4 space-y-2">
                {files.map((file, idx) => (
                    <div key={file.name + idx} className="flex items-center gap-2 p-2 border rounded bg-gray-50">
                        {isImage(file) ? (
                            <img src={URL.createObjectURL(file)} alt={file.name} className="w-12 h-12 object-cover rounded" onLoad={(e) => URL.revokeObjectURL((e.target as HTMLImageElement).src)} />
                        ) : (
                            <span className="text-lg">📄</span>
                        )}
                        <span className="flex-1 text-sm truncate">{file.name}</span>
                        <button
                            type="button"
                            className="ml-2 text-red-500 hover:text-red-700"
                            onClick={() => {
                                const newFiles = files.filter((_, i) => i !== idx);
                                setFiles(newFiles);
                                onChange(newFiles);
                            }}
                            aria-label={`Eliminar archivo ${file.name}`}
                        >
                            ❌
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

/* eslint-disable no-unused-vars */
import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { LlamadasBBDD } from '../../components/Utils/data/utilsData';
import { Boton } from '../../components/Utils/utils';
import { LoadingOverlayPersonalizada } from './Users/componentes';
// import { useEstadosPorAnioContext } from '../../contexts/EstadosPorAnioContext';

interface BotonNuevoAnioProps {
    btnAnioNew: boolean;
    setLoading: (loading: boolean) => void;
    setSuccessMessage: (message: string) => void;
    setErrorMessage: (message: string) => void;
}

const BotonNuevoAnio: React.FC<BotonNuevoAnioProps> = (props) => {
    const { btnAnioNew, setLoading, setSuccessMessage, setErrorMessage } = props;
    const { t } = useTranslation();

    const handleNuevoAnio = async () => {
        if (window.confirm(t('confirmarAnadirAnio', { year: new Date().getFullYear() + 1 }))) {
            const body = {
                FromYear: new Date().getFullYear(),
                ToYear: new Date().getFullYear() + 1,
            };
            LlamadasBBDD({
                method: 'POST',
                url: `nuevoYear`,
                body: body,
                setLoading,
                setSuccessMessage,
                setErrorMessage,
            });

            alert('Por favor, cierre sesión y vuelva a iniciar sesión para ver los cambios.');
        }
    };
    return <Boton tipo="guardar" disabled={!btnAnioNew} textoBoton={`${t('GenerarAnio')}`} onClick={handleNuevoAnio} />;
};
const Index = () => {
    const { t } = useTranslation();
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [btnAnioNew, setBtnAnioNew] = useState<boolean>(false);
    const [years, setYears] = useState<number[]>([]);
    const [selectedYears, setSelectedYears] = useState<{ [year: number]: boolean }>({});
    const [impactYearsFromDB, setImpactYearsFromDB] = useState<{ Id: number; Year: number; Status: boolean }[]>([]);

    useEffect(() => {
        const aniosRegion = sessionStorage.getItem('aniosRegion');
        if (aniosRegion) {
            const aniosParsed = JSON.parse(aniosRegion) as { RegionId: number; Years: number[] }[];
            const aniosMax = Math.max(...aniosParsed.flatMap((region) => region.Years));
            const aniosMin = Math.min(...aniosParsed.flatMap((region) => region.Years));
            const uniqueYears: number[] = Array.from(new Set(aniosParsed.flatMap((region) => region.Years))).sort((a, b) => b - a);
            setYears(uniqueYears);

            if (aniosMax === aniosMin) {
                setBtnAnioNew(true);
            }

            cargarIndicadoresImpacto(uniqueYears);
        }
    }, []);

    const cargarIndicadoresImpacto = (availableYears: number[]) => {
        LlamadasBBDD({
            method: 'GET',
            url: 'impactIndicatorYears',
            setLoading,
            setSuccessMessage,
            setErrorMessage,
            onSuccess: (data: { data: { Id: number; Year: number; Status: boolean }[] }) => {
                const impactYears = data.data || [];
                setImpactYearsFromDB(impactYears);

                const initialSelected: { [year: number]: boolean } = {};
                availableYears.forEach((year) => {
                    const yearInDB = impactYears.find((y) => y.Year === year);
                    initialSelected[year] = yearInDB ? yearInDB.Status : false;
                });
                setSelectedYears(initialSelected);
            },
            onError: () => {
                const initialSelected: { [year: number]: boolean } = {};
                availableYears.forEach((year) => {
                    initialSelected[year] = false;
                });
                setSelectedYears(initialSelected);
            },
        });
    };

    const handleCheckboxChange = (year: number) => {
        setSelectedYears((prev) => ({
            ...prev,
            [year]: !prev[year],
        }));
    };

    const handleGuardarIndicadoresImpacto = async () => {
        const aniosSeleccionados = Object.keys(selectedYears)
            .filter((year) => selectedYears[Number(year)])
            .map(Number)
            .sort((a, b) => b - a);

        const promesas = years.map(async (year) => {
            const isSelected = selectedYears[year];
            const existingYear = impactYearsFromDB.find((y) => y.Year === year);

            if (existingYear) {
                return LlamadasBBDD({
                    method: 'PUT',
                    url: `impactIndicatorYears/${year}`,
                    body: { Year: year, Status: isSelected },
                    setLoading: () => {},
                    setSuccessMessage: () => {},
                    setErrorMessage: () => {},
                });
            } else if (isSelected) {
                return LlamadasBBDD({
                    method: 'POST',
                    url: 'impactIndicatorYears',
                    body: { Year: year, Status: true },
                    setLoading: () => {},
                    setSuccessMessage: () => {},
                    setErrorMessage: () => {},
                });
            }
        });

        try {
            setLoading(true);
            await Promise.all(promesas);
            setSuccessMessage(t('configuracionGuardada') || 'Configuración guardada correctamente');

            cargarIndicadoresImpacto(years);

            sessionStorage.setItem('indicadoresImpactoYears', JSON.stringify(aniosSeleccionados));
        } catch {
            setErrorMessage('Error al guardar la configuración');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 panel items-center justify-center">
            <LoadingOverlayPersonalizada isLoading={loading} message={{ successMessage, setSuccessMessage, errorMessage, setErrorMessage }} />
            <div className="flex flex-col gap-4 w-full max-w-md">
                <div>
                    <h3 className="text-lg font-semibold mb-1">{t('genAnio')}</h3>
                </div>
                <BotonNuevoAnio btnAnioNew={btnAnioNew} setLoading={setLoading} setErrorMessage={setErrorMessage} setSuccessMessage={setSuccessMessage} />
            </div>

            <div className="flex flex-col gap-4 w-full max-w-md">
                <div>
                    <h3 className="text-lg font-semibold mb-1">{t('yearsIndicadoresImpacto')}</h3>
                    <p className="text-sm text-gray-500 mb-3">{t('yearsIndicadoresImpactoDescription')}</p>
                </div>

                <div className="flex flex-col gap-2">
                    {years.map((year) => (
                        <label key={year} className="flex items-center gap-3 p-3 border rounded hover:bg-gray-50 cursor-pointer transition-colors">
                            <input
                                type="checkbox"
                                checked={selectedYears[year] || false}
                                onChange={() => handleCheckboxChange(year)}
                                className="form-checkbox h-5 w-5 text-primary rounded cursor-pointer"
                            />
                            <span className="text-base font-medium">{year}</span>
                        </label>
                    ))}
                </div>

                {years.length > 0 && <Boton tipo="guardar" textoBoton={t('guardar') || 'Guardar configuración'} onClick={handleGuardarIndicadoresImpacto} />}
            </div>
        </div>
    );
};
export default Index;

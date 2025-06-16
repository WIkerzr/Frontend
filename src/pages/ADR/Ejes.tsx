import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../Configuracion/componentes';
import { Ejes } from '../../types/tipadoPlan';
import { useYear } from '../../contexts/DatosAnualContext';

const Index = () => {
    const { t, i18n } = useTranslation();
    const { yearData, setYearData } = useYear();

    const [selected, setSelected] = useState<string[]>([]);
    const [locked, setLocked] = useState(false);
    const [ejes, setEjes] = useState<Ejes[]>();

    const handleCheck = (id: string) => {
        if (locked) return;
        if (selected.includes(id)) {
            setSelected((prev) => prev.filter((i) => i !== id));
            setEjes((prev) => prev!.filter((i) => i));
        } else if (selected.length < 3) {
            setSelected((prev) => [...prev, id]);
            setEjes((prev) => prev!.filter((i) => i));
        }
    };

    useEffect(() => {
        setEjes(yearData.plan.ejes);
        setSelected(yearData.plan.ejesPrioritarios.map((eje) => eje.id));
    }, []);

    const handleSave = () => {
        if (selected.length === 3) setLocked(true);
        const ejesPrioritarios = { ...yearData };
        const ejesSeleccionados = yearData.plan.ejes.filter((eje) => selected.includes(eje.id));

        ejesPrioritarios.plan.ejesPrioritarios = ejesSeleccionados;
        setYearData(ejesPrioritarios);
    };

    return (
        <div className="panel">
            <div className="w-full mx-auto mt-1 px-2">
                <ZonaTitulo
                    titulo={<h2 className="text-xl font-bold">{t('ejesTitulo')}</h2>}
                    zonaBtn={
                        <>
                            <span className="text-red-600 font-semibold">{t('seleccionarCheckbox3Ejes')}</span>
                            <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400" onClick={handleSave} disabled={locked || selected.length !== 3}>
                                {t('guardar')}
                            </button>
                        </>
                    }
                    zonaExplicativa={
                        <>
                            <span>{t('explicacionEje')}</span>
                            <span>{t('seleccionar3Ejes')}</span>
                        </>
                    }
                />
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-2 w-full">
                    {ejes &&
                        ejes
                            .slice()
                            .sort((a, b) => (i18n.language === 'es' ? a.nameEs.localeCompare(b.nameEs) : a.nameEu.localeCompare(b.nameEu)))
                            .map((accion) => (
                                <li key={accion.id} className={`flex items-center p-2 rounded transition ${selected.includes(accion.id) ? 'bg-green-100' : ''}`}>
                                    <input
                                        type="checkbox"
                                        className="form-checkbox h-5 w-5 text-green-600 accent-green-600"
                                        checked={selected.includes(accion.id)}
                                        onChange={() => handleCheck(accion.id)}
                                        disabled={locked || (!selected.includes(accion.id) && selected.length === 3)}
                                        id={`checkbox-${accion.id}`}
                                    />
                                    <label htmlFor={`checkbox-${accion.id}`} className={`ml-3 cursor-pointer w-full ${selected.includes(accion.id) ? 'text-green-700 font-semibold' : ''}`}>
                                        {i18n.language === 'es' ? accion.nameEs : accion.nameEu}
                                    </label>
                                </li>
                            ))}
                </ul>
            </div>
        </div>
    );
};

export default Index;

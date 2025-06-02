import { Checkbox } from '@mantine/core';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
const ejesBBDD = [
    { id: 1, nombre: 'Abastecimiento de agua y Saneamiento' },
    { id: 2, nombre: 'Suministro de energía (eléctrico, gas…) y energías renovables y sostenibles' },
    { id: 3, nombre: 'Telecomunicaciones' },
    { id: 4, nombre: 'Red viaria y caminos' },
    { id: 5, nombre: 'Accesibilidad' },
    { id: 6, nombre: 'Transporte y movilidad' },
    { id: 7, nombre: 'Educación infantil' },
    { id: 8, nombre: 'Educación obligatoria' },
    { id: 9, nombre: 'Educación superior no obligatoria' },
    { id: 10, nombre: 'Atención sanitaria primaria' },
    { id: 11, nombre: 'Atención sanitaria especializada' },
    { id: 12, nombre: 'Atención farmacéutica' },
    { id: 13, nombre: 'Atención social' },
    { id: 14, nombre: 'Cultura' },
    { id: 15, nombre: 'Deporte' },
    { id: 16, nombre: 'Ocio' },
    { id: 17, nombre: 'Innovación social' },
    { id: 18, nombre: 'Capacitación en innovación' },
    { id: 19, nombre: 'Investigación' },
    { id: 20, nombre: 'Transformación Digital' },
    { id: 21, nombre: 'Conservación del patrimonio cultural' },
    { id: 22, nombre: 'Divulgación del patrimonio cultural' },
    { id: 23, nombre: 'Promoción del Euskera' },
    { id: 24, nombre: 'Instrumentos de Ordenación del Territorio' },
    { id: 25, nombre: 'Oferta de vivienda' },
    { id: 26, nombre: 'Rehabilitación patrimonio inmobiliario' },
    { id: 27, nombre: 'Reto demográfico' },
    { id: 28, nombre: 'Participación y atención comunitaria' },
    { id: 29, nombre: 'Igualdad de género' },
    { id: 30, nombre: 'Juventud' },
    { id: 31, nombre: 'Emprendimiento' },
    { id: 32, nombre: 'Mejorar la competitividad del tejido actual' },
    { id: 33, nombre: 'Empleo y Formación' },
    { id: 34, nombre: 'Sectores prioritarios - Cadena de Valor de la Alimentación' },
    { id: 35, nombre: 'Sectores prioritarios - Cadena de Valor de la Madera' },
    { id: 36, nombre: 'Sectores prioritarios - Turismo, comercio y actividades relacionadas' },
    { id: 37, nombre: 'Sectores prioritarios - Energía, bioeconomía y ecosistemas' },
    { id: 38, nombre: 'Sectores prioritarios - Salud y bienestar' },
    { id: 39, nombre: 'Infraestructura verde y Espacios Protegidos del Patrimonio Natural' },
    { id: 40, nombre: 'Conservación y puesta en valor del patrimonio natural' },
    { id: 41, nombre: 'Protección mantenimiento y restauración del suelo agrario y del hábitat rural' },
];

const Index = () => {
    const { t } = useTranslation();

    const [selected, setSelected] = useState<number[]>([37, 36, 3]);
    const [locked, setLocked] = useState(false);

    const handleCheck = (id: number) => {
        if (locked) return;
        if (selected.includes(id)) {
            setSelected((prev) => prev.filter((i) => i !== id));
        } else if (selected.length < 3) {
            setSelected((prev) => [...prev, id]);
        }
    };

    const handleSave = () => {
        if (selected.length === 3) setLocked(true);
    };

    return (
        <div>
            <span>{t('seleccionar3Ejes')}</span>
            <div className="w-full mx-auto mt-8 px-2">
                <div className="flex justify-between items-center mb-6">
                    <div></div>
                    <div className="flex items-center space-x-4">
                        <span className="text-sm text-red-600 font-semibold">{t('seleccionarCheckbox3Ejes')}</span>
                        <button className="bg-blue-600 text-white px-4 py-2 rounded disabled:bg-gray-400" onClick={handleSave} disabled={locked || selected.length !== 3}>
                            Guardar
                        </button>
                    </div>
                </div>
                <ul className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-x-4 gap-y-2 w-full">
                    {ejesBBDD
                        .slice()
                        .sort((a, b) => a.nombre.localeCompare(b.nombre))
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
                                    {accion.nombre}
                                </label>
                            </li>
                        ))}
                </ul>
            </div>
        </div>
    );
};

export default Index;

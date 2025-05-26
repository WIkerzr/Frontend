import { Checkbox } from '@mantine/core';
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
const ListadosEjes = () => {
    return (
        <ul>
            {ejesBBDD.map((accion) => (
                <li className="p-1">
                    <div className="card-li">
                        <Checkbox className="mr-4" />
                        <div className="flex w-full items-center">
                            <span className="w-1/2 pr-3">{accion.nombre}</span>
                            <select className="form-select w-1/2">
                                <option value="0">Selecciona una opción</option>
                                <option value="1">Estratégico</option>
                                <option value="2">De interes</option>
                            </select>
                        </div>
                    </div>
                </li>
            ))}
        </ul>
    );
};
const Index = () => {
    return (
        <div>
            <span>Se establecerán un máximo de tres ejes</span>
            <ListadosEjes />
        </div>
    );
};

export default Index;

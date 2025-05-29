import React from 'react';
import { ListadoAcciones, ModalAccion } from './Componentes';
import { DatosAccion } from '../../types/TipadoAccion';

export const datosAcciones: DatosAccion[] = [
    {
        id: 1,
        accion: '1.- Organización del X Lautada Eguna, VII Semana del desarrollo rural y apoyo/difusión de otras actividades culturales',
        lineaActuaccion: 'Conocimiento de la Lautada por los propios habitantes',
        eje: 'Cohesión comarcal',
    },
    {
        id: 2,
        accion: '2.- Apoyo a la comercialización del producto local en circuitos cortos',
        lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
        eje: 'Desarrollo de la actividad económica',
    },
    {
        id: 3,
        accion: '3.- Socialización sobre la importancia de mantener un sector agroalimentario vivo y el consumo de producto local.',
        lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
        eje: 'Desarrollo de la actividad económica',
    },
    {
        id: 4,
        accion: '4.- Trabajo en coordinación con Turismo de la Cuadrilla para el impulso de esta',
        lineaActuaccion: 'Impulso de los recursos turísticos específicos propios de la comarca y a su puesta en valor',
        eje: 'Desarrollo de la actividad económica',
    },
    {
        id: 5,
        accion: '5.- Fomento de la Transformación Agroalimentario de la Llanada Alavesa',
        lineaActuaccion: 'Impulso a la transformación y la diferenciación de los productos',
        eje: 'Desarrollo de la actividad económica',
    },
    {
        id: 6,
        accion: '6.- Organización de jornadas y talleres para la sostenibilidad en las explotaciones agroalimentarias (energética, medioambiental)',
        lineaActuaccion:
            'Fomento de iniciativas de producción agrarias sostenibles: impulso a sistemas en ecológico,producción integrada, regenerativa, utilización de variedades autóctonas.Mejora de la eficiencia energética: sustitución de luminarias públicas, campañas de ahorro energético.',
        eje: 'Desarrollo sostenible',
    },
];

const Index: React.FC = () => {
    const ejesUnicos = Array.from(new Set(datosAcciones.map((a) => a.eje)));
    const arraysPorEje = ejesUnicos.map((eje) => datosAcciones.filter((a) => a.eje === eje));

    return (
        <>
            <ModalAccion listadosAcciones={datosAcciones} />
            <div className="flex items-start w-full h-100%">
                <div className="flex flex-col flex-1 items-center justify-center  p-1">
                    <ListadoAcciones nombre={ejesUnicos[0]} listadoMap={arraysPorEje[0]} />
                </div>
                <div className="flex flex-col flex-1 items-center justify-center  p-1">
                    <ListadoAcciones nombre={ejesUnicos[1]} listadoMap={arraysPorEje[1]} />
                </div>
                <div className="flex flex-col flex-1 items-center justify-center  p-1">
                    <ListadoAcciones nombre={ejesUnicos[2]} listadoMap={arraysPorEje[2]} />
                </div>
            </div>
        </>

        // <div className="p-4 bg-[#FAFAFB]">
        //     <label>{'Maximo 5 Acciones por eje prioritario (15)'}</label>
        //     <ListadoAcciones nombre="Acciones" listadoMap={listAcciones} ACCIONES_MAX={15} />
        // </div>
    );
};
export default Index;

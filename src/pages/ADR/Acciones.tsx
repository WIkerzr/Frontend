import React from 'react';
import { ListadoAcciones, ModalAccion } from './Componentes';
import { DatosAccion } from '../../types/TipadoAccion';

export const datosAcciones: DatosAccion[] = [
    {
        id: 1,
        accion: '1.- Organización del X Lautada Eguna, VII Semana del desarrollo rural y apoyo/difusión de otras actividades culturales',
        lineaActuaccion: 'Conocimiento de la Lautada por los propios habitantes',
        eje: 'Sectores prioritarios - Turismo, comercio y actividades relacionadas',
        datosPlan: {
            ejecutora: '1',
            implicadas: '2',
            comarcal: '3',
            supracomarcal: '4',
            rangoAnios: '5',
            oAccion: '6',
            ods: '7',
            dAccion: '8',
            presupuesto: '9',
            iMujHom: '10',
            uEuskera: '11',
            sostenibilidad: '12',
            dInteligent: '13',
            observaciones: '14',
        },
        datosMemoria: {
            ejecutora: '1',
            implicadas: '2',
            comarcal: '3',
            supracomarcal: '4',
            rangoAnios: '5',
            sActual: 'Actuación en espera',
            oAccion: '7',
            ods: '8',
            dAccionAvances: '9',
            presupuestoEjecutado: {
                total: '10',
                autofinanciacion: '11',
                financiacionPublica: '12',
                origenPublica: '13',
                financiacionPrivada: '14',
            },
            ejecucionPresupuestaria: {
                previsto: '15',
                ejecutado: '16',
                porcentaje: '17',
            },
            iMujHom: '18',
            uEuskera: '19',
            sostenibilidad: '20',
            dInteligent: '21',
            observaciones: '22',
            dSeguimiento: '23',
            valFinal: '24',
        },
        indicadorAccion: {
            indicadoreRealizacion: [
                {
                    id: 4,
                    descripcion: 'RE04. Número de infraestructuras y/o servicios mejorados',
                    metaAnual: {
                        hombres: 10,
                        mujeres: 10,
                        total: 20,
                    },
                    ejecutado: {
                        hombres: 7,
                        mujeres: 5,
                        total: 12,
                    },
                    metaFinal: {
                        hombres: 20,
                        mujeres: 20,
                        total: 40,
                    },
                    hipotesis: 'Se espera un ligero aumento.',
                    idsResultados: [4],
                },
                {
                    id: 5,
                    descripcion: 'RE05. Número de personas emprendedoras apoyadas',
                    metaAnual: {
                        hombres: 0,
                        mujeres: 0,
                        total: 100,
                    },
                    ejecutado: {
                        hombres: 0,
                        mujeres: 0,
                        total: 92,
                    },
                    metaFinal: {
                        hombres: 0,
                        mujeres: 0,
                        total: 300,
                    },
                    idsResultados: [5],
                },
            ],
            indicadoreResultado: [
                {
                    id: 4,
                    descripcion: 'RS04. Número de personas beneficiadas de las infraestructuras y/o servicios mejorados',
                    metaAnual: {
                        hombres: 10,
                        mujeres: 10,
                        total: 20,
                    },
                    ejecutado: {
                        hombres: 7,
                        mujeres: 5,
                        total: 12,
                    },
                    metaFinal: {
                        hombres: 20,
                        mujeres: 20,
                        total: 40,
                    },
                    hipotesis: '',
                },
                {
                    id: 5,
                    descripcion: 'RS05. Número de empresas creadas por personas emprendedoras',
                    metaAnual: {
                        hombres: 0,
                        mujeres: 0,
                        total: 100,
                    },
                    ejecutado: {
                        hombres: 0,
                        mujeres: 0,
                        total: 92,
                    },
                    metaFinal: {
                        hombres: 0,
                        mujeres: 0,
                        total: 300,
                    },
                },
            ],
        },
    },
    {
        id: 2,
        accion: '2.- Apoyo a la comercialización del producto local en circuitos cortos',
        lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
        eje: 'Sectores prioritarios - Energía, bioeconomía y ecosistemas',
    },
    {
        id: 3,
        accion: '3.- Socialización sobre la importancia de mantener un sector agroalimentario vivo y el consumo de producto local.',
        lineaActuaccion: 'Fomento de un sistema comercialización en circuito corto de producto local y fomento del comercio comarcal a través de diferentes actividades',
        eje: 'Sectores prioritarios - Energía, bioeconomía y ecosistemas',
    },
    {
        id: 4,
        accion: '4.- Trabajo en coordinación con Turismo de la Cuadrilla para el impulso de esta',
        lineaActuaccion: 'Impulso de los recursos turísticos específicos propios de la comarca y a su puesta en valor',
        eje: 'Sectores prioritarios - Energía, bioeconomía y ecosistemas',
    },
    {
        id: 5,
        accion: '5.- Fomento de la Transformación Agroalimentario de la Llanada Alavesa',
        lineaActuaccion: 'Impulso a la transformación y la diferenciación de los productos',
        eje: 'Sectores prioritarios - Energía, bioeconomía y ecosistemas',
    },
    {
        id: 6,
        accion: '6.- Organización de jornadas y talleres para la sostenibilidad en las explotaciones agroalimentarias (energética, medioambiental)',
        lineaActuaccion:
            'Fomento de iniciativas de producción agrarias sostenibles: impulso a sistemas en ecológico,producción integrada, regenerativa, utilización de variedades autóctonas.Mejora de la eficiencia energética: sustitución de luminarias públicas, campañas de ahorro energético.',
        eje: 'Telecomunicaciones',
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

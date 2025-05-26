import React from 'react';
import { ListadoAcciones } from './Componentes';

export const listAcciones = [
    { id: 1, texto: 'Capacitación en buenas prácticas agrícolas' },
    { id: 2, texto: 'Campaña de sensibilización sobre reciclaje' },
    { id: 3, texto: 'Programa de consumo responsable de agua' },
    { id: 4, texto: 'Talleres sobre economía circular' },
    { id: 5, texto: 'Charlas de corresponsabilidad familiar' },
    { id: 6, texto: 'Jornadas de limpieza comunitaria' },
    { id: 7, texto: 'Promoción del comercio local sostenible' },
    { id: 8, texto: 'Curso de ahorro energético en hogares' },
    { id: 9, texto: 'Feria de productos ecológicos' },
    { id: 10, texto: 'Campaña de reducción de plásticos' },
    { id: 11, texto: 'Proyecto de huertos urbanos' },
    { id: 12, texto: 'Seminario de igualdad de género' },
];

const Index: React.FC = () => {
    return (
        <div className="p-4 bg-[#FAFAFB]">
            <label>{'Maximo 5 Acciones por eje prioritario (15)'}</label>
            <ListadoAcciones nombre="Acciones" listadoMap={listAcciones} ACCIONES_MAX={15} />
        </div>
    );
};
export default Index;

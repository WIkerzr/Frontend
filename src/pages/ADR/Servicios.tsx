import React from 'react';
import { ListadoAccionesAccesorias } from './Componentes';
import { useYear } from '../../contexts/DatosAnualContext';
const Index: React.FC = () => {
    const { yearData } = useYear();

    return (
        <div className="p-4 bg-[#FAFAFB] min-h-screen">
            <ListadoAccionesAccesorias nombre="Servicios" listadoMap={yearData.servicios!.map((servicio) => ({ id: servicio.id, texto: servicio.nombre }))} ACCIONES_MAX={15} />
        </div>
    );
};
export default Index;

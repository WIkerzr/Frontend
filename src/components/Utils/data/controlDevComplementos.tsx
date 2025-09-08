import { Estado } from '../../../types/GeneralTypes';
import { useLocation } from 'react-router-dom';
import { useEstadosPorAnioContext } from '../../../contexts/EstadosPorAnioContext';

export const SelectorEstado: React.FC = () => {
    const context = useEstadosPorAnioContext();
    if (!context) return null;

    const location = useLocation();
    const { anioSeleccionada, estados, cambiarEstadoPlan, cambiarEstadoMemoria } = context;

    const opciones: Estado[] = ['borrador', 'proceso', 'cerrado', 'aceptado'];

    const hundleCambioEstadoPlan = (e: Estado) => {
        cambiarEstadoPlan(e);
    };
    const hundleCambioEstadoMemoria = (e: Estado) => {
        cambiarEstadoMemoria(e);
    };

    if (!location.pathname.includes('adr')) return null;
    if (!anioSeleccionada || estados[anioSeleccionada].plan == null || estados[anioSeleccionada].memoria == null) return null;

    return (
        <div className="px-2 flex">
            <span>Control de estados modo DEV </span>
            <div className="px-2">
                <span>Plan: </span>
                <select value={estados[anioSeleccionada].plan} onChange={(e) => hundleCambioEstadoPlan(e.target.value as Estado)} className="border rounded p-2">
                    {opciones.map((op) => (
                        <option key={op} value={op}>
                            {op.charAt(0).toUpperCase() + op.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            <div className="px-2">
                <span>Memoria: </span>
                <select value={estados[anioSeleccionada].memoria} onChange={(e) => hundleCambioEstadoMemoria(e.target.value as Estado)} className="border rounded p-2">
                    {opciones.map((op) => (
                        <option key={op} value={op}>
                            {op.charAt(0).toUpperCase() + op.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
        </div>
    );
};

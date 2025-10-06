import { Estado } from '../../../types/GeneralTypes';
import { useLocation } from 'react-router-dom';
import { useEstadosPorAnioContext } from '../../../contexts/EstadosPorAnioContext';
import { useYear } from '../../../contexts/DatosAnualContext';

export const SelectorEstado: React.FC = () => {
    const context = useEstadosPorAnioContext();
    if (!context) return null;

    const location = useLocation();
    const { anioSeleccionada, cambiarEstadoPlan, cambiarEstadoMemoria } = context;
    const { yearData } = useYear();

    const opciones: Estado[] = ['borrador', 'proceso', 'cerrado', 'aceptado'];

    const hundleCambioEstadoPlan = (e: Estado) => {
        cambiarEstadoPlan(e);
    };
    const hundleCambioEstadoMemoria = (e: Estado) => {
        cambiarEstadoMemoria(e);
    };

    if (!location.pathname.includes('adr')) return null;
    if (!anioSeleccionada || yearData.plan.status == null || yearData.memoria.status == null) return null;

    return (
        <div className="px-2 flex">
            <span>Control de estados modo DEV </span>
            <div className="px-2">
                <span>Plan: </span>
                <select value={yearData.plan.status} onChange={(e) => hundleCambioEstadoPlan(e.target.value as Estado)} className="border rounded p-2">
                    {opciones.map((op) => (
                        <option key={op} value={op}>
                            {op.charAt(0).toUpperCase() + op.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            <div className="px-2">
                <span>Memoria: </span>
                <select value={yearData.memoria.status} onChange={(e) => hundleCambioEstadoMemoria(e.target.value as Estado)} className="border rounded p-2">
                    {opciones.map((op) => (
                        <option key={op} value={op}>
                            {op.charAt(0).toUpperCase() + op.slice(1)}
                        </option>
                    ))}
                </select>
            </div>
            <div>
                <button
                    className="bg-green-500 text-white px-2 py-1 rounded"
                    onClick={() => {
                        sessionStorage.removeItem('DataYear');
                        window.location.reload();
                    }}
                >
                    Resetear Datos años
                </button>
            </div>
        </div>
    );
};

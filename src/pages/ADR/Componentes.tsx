import { useRef, useState } from 'react';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import { useTranslation } from 'react-i18next';

type Accion = { id: number; texto: string };
interface ListadoAccionesProps {
    nombre: string;
    listadoMap: Accion[];
    ACCIONES_MAX: number;
}
export const ListadoAcciones = ({ nombre, listadoMap, ACCIONES_MAX }: ListadoAccionesProps) => {
    const idCounter = useRef(1000);
    const [acciones, setAcciones] = useState<Accion[]>(listadoMap);
    const [nuevaAccion, setNuevaAccion] = useState('');
    const [inputError, setInputError] = useState(false);
    const { t } = useTranslation();

    const handleNuevaAccion = () => {
        if (!nuevaAccion.trim() || acciones.length >= ACCIONES_MAX) {
            setInputError(!nuevaAccion.trim());
            return;
        }
        setAcciones((prev) => [{ id: idCounter.current++, texto: nuevaAccion.trim() }, ...prev.slice(0, ACCIONES_MAX - 1)]);
        setNuevaAccion('');
        setInputError(false);
    };

    const handleEdit = (id: number) => alert('Editar acción ' + id);
    const handleDelete = (id: number) => setAcciones((prev) => prev.filter((a) => a.id !== id));

    const mostrarInput = acciones.length < ACCIONES_MAX;
    const accionesMostradas = mostrarInput ? acciones.slice(0, ACCIONES_MAX - 1) : acciones.slice(0, ACCIONES_MAX);
    return (
        <div className="grid grid-cols-3 gap-x-6 gap-y-6">
            {mostrarInput && (
                <div className="bg-white rounded-xl border border-[#ECECEC] p-6 flex flex-col shadow-sm">
                    <label className="text-sm text-gray-500 mb-2">{nombre}</label>
                    <input
                        className={`border border-[#ECECEC] rounded p-2 mb-4 text-sm bg-[#FAFAFB] focus:outline-none focus:ring-2 focus:ring-blue-200 transition ${inputError ? 'border-red-400' : ''}`}
                        value={nuevaAccion}
                        onChange={(e) => {
                            setNuevaAccion(e.target.value);
                            setInputError(false);
                        }}
                        placeholder="Introduce el nombre"
                        maxLength={200}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter') handleNuevaAccion();
                        }}
                    />
                    <button
                        className="bg-[#4463F7] text-white px-4 py-2 rounded hover:bg-[#254edb] self-end text-sm transition disabled:bg-gray-300"
                        onClick={handleNuevaAccion}
                        disabled={acciones.length >= ACCIONES_MAX}
                    >
                        + {nombre}
                    </button>
                </div>
            )}
            {accionesMostradas.map((accion) => (
                <div key={accion.id} className="card-div">
                    <div className="flex-1 text-base text-[#222] mb-0 pr-2">{accion.texto}</div>
                    <div className="flex flex-col justify-start items-end gap-2 border-l border-[#ECECEC] pl-4">
                        <button onClick={() => handleEdit(accion.id)} aria-label={`Editar acción ${accion.id}`} className="hover:bg-gray-100 p-1.5 rounded transition">
                            <IconPencil />
                        </button>
                        <button onClick={() => handleDelete(accion.id)} aria-label={`Eliminar acción ${accion.id}`} className="hover:bg-gray-100 p-1.5 rounded transition">
                            <IconTrash />
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

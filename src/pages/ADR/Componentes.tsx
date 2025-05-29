import { useEffect, useRef, useState } from 'react';
import IconPencil from '../../components/Icon/IconPencil';
import IconTrash from '../../components/Icon/IconTrash';
import { useTranslation } from 'react-i18next';
import { NewModal } from '../../components/Utils/utils';
import { NavLink } from 'react-router-dom';
import AnimateHeight from 'react-animate-height';
import { DatosAccion } from '../../types/TipadoAccion';

type AccionAccesoria = { id: number; texto: string };
interface ListadoAccionesAccesoriasProps {
    nombre: string;
    listadoMap: AccionAccesoria[];
    ACCIONES_MAX: number;
}
export const ListadoAccionesAccesorias = ({ nombre, listadoMap }: ListadoAccionesAccesoriasProps) => {
    const idCounter = useRef(1000);
    const [acciones, setAcciones] = useState<AccionAccesoria[]>(listadoMap);
    const [nuevaAccion, setNuevaAccion] = useState('');
    const [inputError, setInputError] = useState(false);
    const { t } = useTranslation();

    const handleNuevaAccion = () => {
        if (!nuevaAccion.trim() || acciones.length >= 5) {
            setInputError(!nuevaAccion.trim());
            return;
        }
        setAcciones((prev) => [{ id: idCounter.current++, texto: nuevaAccion.trim() }, ...prev.slice(0, 5 - 1)]);
        setNuevaAccion('');
        setInputError(false);
    };

    const handleEdit = (id: number) => alert('Editar acción ' + id);
    const handleDelete = (id: number) => setAcciones((prev) => prev.filter((a) => a.id !== id));

    const mostrarInput = acciones.length < 5;
    const accionesMostradas = mostrarInput ? acciones.slice(0, 5 - 1) : acciones.slice(0, 5);
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
                        disabled={acciones.length >= 5}
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

interface ModalAccionProps {
    listadosAcciones: DatosAccion[];
}

export const ModalAccion = ({ listadosAcciones }: ModalAccionProps) => {
    const { t } = useTranslation();
    let ejes = Array.from(new Set(listadosAcciones!.map((a) => a.eje)));

    const accionesPorEje: Record<string, DatosAccion[]> = {};
    ejes.forEach((eje) => {
        accionesPorEje[eje] = listadosAcciones!.filter((a) => a.eje === eje);
    });

    const [selectedEje, setSelectedEje] = useState(() => {
        const firstAvailable = ejes.find((eje) => accionesPorEje[eje].length < 5);
        return firstAvailable || ejes[0];
    });
    let title = t('newAccion');
    const [nuevaAccion, setNuevaAccion] = useState('');
    const [nuevaLineaActuaccion, setNuevaLineaActuaccion] = useState('');
    const [inputError, setInputError] = useState(false);
    const [showModal, setShowModal] = useState(false);

    const getEjeLimitado = (eje: string) => accionesPorEje[eje]?.length >= 5;

    const handleNuevaAccion = () => {
        if (!nuevaAccion.trim() || !nuevaLineaActuaccion.trim() || getEjeLimitado(selectedEje)) {
            setInputError(true);
            return;
        }

        //LLamada al servidor con la nueva accion

        setNuevaAccion('');
        setNuevaLineaActuaccion('');
        setInputError(false);
        setShowModal(false);
    };

    return (
        <>
            <div className="flex justify-center">
                <button className="bg-blue-600 text-white px-4 py-2 rounded shadow hover:bg-blue-700 transition" onClick={() => setShowModal(true)}>
                    Añadir Acción
                </button>
            </div>
            <NewModal open={showModal} onClose={() => setShowModal(false)} title={title}>
                <div className="space-y-5">
                    <div>
                        <label className="block font-medium mb-1">{t('Ejes')}</label>
                        <select className="form-select text-gray-800 w-full" style={{ minWidth: 'calc(100% + 10px)' }} value={selectedEje} onChange={(e) => setSelectedEje(e.target.value)}>
                            {ejes.map((eje) => (
                                <option key={eje} value={eje} disabled={getEjeLimitado(eje)}>
                                    {eje} {getEjeLimitado(eje) ? '(Límite alcanzado)' : ''}
                                </option>
                            ))}
                        </select>
                        {getEjeLimitado(selectedEje) && <div className="text-xs text-red-500 mt-1">{t('Límite de acciones alcanzado para este eje')}</div>}
                    </div>
                    <div>
                        <label className="block font-medium mb-1">{t('NombreAccion')}</label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded ${inputError && !nuevaAccion.trim() ? 'border-red-400' : ''}`}
                            value={nuevaAccion}
                            onChange={(e) => {
                                setNuevaAccion(e.target.value);
                                setInputError(false);
                            }}
                            placeholder={t('Introduce nombre acción')}
                            disabled={getEjeLimitado(selectedEje)}
                        />
                    </div>
                    <div>
                        <label className="block font-medium mb-1">{t('LineaActuaccion')}</label>
                        <input
                            type="text"
                            className={`w-full p-2 border rounded ${inputError && !nuevaLineaActuaccion.trim() ? 'border-red-400' : ''}`}
                            value={nuevaLineaActuaccion}
                            onChange={(e) => {
                                setNuevaLineaActuaccion(e.target.value);
                                setInputError(false);
                            }}
                            placeholder={t('Introduce línea de actuación')}
                            disabled={getEjeLimitado(selectedEje)}
                            autoComplete="off"
                        />
                    </div>
                    {inputError && <div className="text-xs text-red-500 text-center">{t('Por favor rellena ambos campos antes de guardar.')}</div>}
                    <button
                        onClick={handleNuevaAccion}
                        className={`bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full mt-2 transition ${getEjeLimitado(selectedEje) ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                        {t('guardar')}
                    </button>
                </div>
            </NewModal>
        </>
    );
};

interface ListadoAccionesProps {
    nombre: string;
    listadoMap: DatosAccion[];
}
export const ListadoAcciones = ({ nombre, listadoMap }: ListadoAccionesProps) => {
    const [acciones, setAcciones] = useState<DatosAccion[]>(listadoMap);
    const { t } = useTranslation();

    const handleDelete = (id: number) => setAcciones((prev) => prev.filter((a) => a.id !== id));

    const mostrarInput = acciones.length < 5;
    const accionesMostradas = mostrarInput ? acciones.slice(0, 5 - 1) : acciones.slice(0, 5);

    return (
        <div className="rounded-lg space-y-5 text-center p-2 border border-gray-200 bg-white max-w-lg w-full mx-auto shadow-sm">
            <span className="text-lg font-semibold text-gray-700 tracking-wide block mb-2">{nombre}</span>

            <div className="space-y-4">
                {accionesMostradas.map((accion) => (
                    <div key={accion.id} className="bg-white border border-gray-200 p-6 shadow-sm rounded-lg hover:shadow-md transition-shadow flex flex-col">
                        <span className="text-lg">{accion.accion}</span>
                        <span className="block text-sm text-gray-500 text-left font-medium mb-1">{t('LineaActuaccion')}:</span>
                        <span className="text-base">{accion.lineaActuaccion}</span>
                        <div className="flex gap-2 justify-end mt-2">
                            <NavLink to="/adr/acciones/editando" className="group">
                                <button aria-label={`Editar acción`} className="hover:bg-blue-50 text-gray-500 hover:text-blue-600 p-1.5 rounded transition">
                                    <IconPencil />
                                </button>
                            </NavLink>
                            <button
                                onClick={() => handleDelete(accion.id)}
                                aria-label={`Eliminar acción ${accion.id}`}
                                className="hover:bg-blue-50 text-gray-500 hover:text-red-600 p-1.5 rounded transition"
                            >
                                <IconTrash />
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export const Acordeon: React.FC<{ texto: string; num: number; active: string; togglePara: (n: string) => void }> = ({ texto, num, active, togglePara }) => (
    <div className="space-y-2 font-semibold w-1/3 p-1">
        <div className="border border-[#d3d3d3] rounded dark:border-[#1b2e4b]">
            <button
                type="button"
                className="w-full p-1 flex items-center text-white-dark dark:bg-[#1b2e4b] min-h-[2.5rem] text-left"
                onClick={() => togglePara(`${num}`)}
                style={{ lineHeight: '1.5' }}
            >
                <span className="truncate overflow-hidden whitespace-nowrap block w-full">{texto}</span>
            </button>
            <AnimateHeight duration={300} height={active === `${num}` ? 'auto' : 0}>
                <div className="space-y-2 p-4 text-white-dark text-[13px] border-t border-[#d3d3d3] dark:border-[#1b2e4b]">
                    <p>{texto}</p>
                </div>
            </AnimateHeight>
        </div>
    </div>
);

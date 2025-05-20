import { useState } from 'react';
import { Indicador } from '../../types/Indicadores';
import { useTranslation } from 'react-i18next';

export const ModalNuevoIndicador: React.FC<{ texto: string; datosIndicador: string | undefined; tipoIndicador: 'realizacion' | 'resultado'; onGuardar: (nuevoIndicador: Indicador) => void }> = ({
    texto,
    datosIndicador,
    tipoIndicador,
    onGuardar,
}) => {
    const { t } = useTranslation();

    const [isOpen, setIsOpen] = useState(false);
    const [descripcionEditable, setDescripcionEditable] = useState('');
    const [ano, setAno] = useState(2025);
    const [tipo, setTipo] = useState<'realizacion' | 'resultado'>(tipoIndicador);

    const [mensaje, setMensaje] = useState('');

    const getSiguienteCodigo = () => {
        const prefijo = datosIndicador!.slice(0, 2);
        const numero = parseInt(datosIndicador!.slice(2, 4), 10);
        const siguienteNumero = numero + 1;
        const siguienteCodigo = `${prefijo}${String(siguienteNumero).padStart(2, '0')}.`;
        return siguienteCodigo;
    };

    let siguienteIndicador = getSiguienteCodigo();

    const handleGuardar = async () => {
        const descripcionFinal = `${siguienteIndicador ?? ''} ${descripcionEditable}`.trim();

        const response = await fetch('/api/nuevoIndicador', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ descripcion: descripcionFinal, ano, tipo }),
        });

        const data = await response.json();

        if (response.ok) {
            setMensaje(t('correctoIndicadorGuardado'));
            setDescripcionEditable('');
            setAno(2025);
            setTipo(tipoIndicador);
            onGuardar(data.indicador);
            setTimeout(() => {
                setMensaje('');
                setIsOpen(false);
            }, 1000);
        } else {
            setMensaje(t('errorGuardar') + data.message);
        }
    };

    return (
        <div className="flex justify-center mb-5">
            <button onClick={() => setIsOpen(true)} className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 btn btn-primary w-1/2">
                {texto}
            </button>

            {isOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md shadow-lg relative">
                        <button className="absolute top-2 right-3 text-gray-500 hover:text-black text-xl" onClick={() => setIsOpen(false)}>
                            ×
                        </button>

                        <h2 className="text-xl font-bold mb-4">{t('newIndicador')}</h2>

                        <div className="space-y-4">
                            <div>
                                <label className="block font-medium">{t('Descripcion')}</label>
                                <div className="flex">
                                    <span className="p-2 bg-gray-100 border border-r-0 rounded-l text-gray-700 whitespace-nowrap">{siguienteIndicador}</span>
                                    <input type="text" className="w-full p-2 border rounded-r" value={descripcionEditable} onChange={(e) => setDescripcionEditable(e.target.value)} />
                                </div>
                            </div>

                            <div>
                                <label className="block font-medium">{t('Ano')}</label>
                                <input type="number" className="w-full p-2 border rounded" value={ano} onChange={(e) => setAno(Number(e.target.value))} />
                            </div>

                            <div>
                                <label className="block font-medium">{t('Tipo')}</label>
                                <select className="w-full p-2 border rounded" value={tipo} onChange={(e) => setTipo(e.target.value as 'realizacion' | 'resultado')}>
                                    <option value="realizacion">{t('Realizacion')}</option>
                                    <option value="resultado">{t('Resultado')}</option>
                                </select>
                            </div>

                            <button onClick={handleGuardar} className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700 w-full">
                                {t('guardar')}
                            </button>

                            {mensaje && <p className="text-sm text-center mt-2">{mensaje}</p>}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

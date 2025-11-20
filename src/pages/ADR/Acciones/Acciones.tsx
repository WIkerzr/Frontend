import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useYear } from '../../../contexts/DatosAnualContext';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../../contexts/RegionContext';
import { DatosAccion } from '../../../types/TipadoAccion';
import { Ejes } from '../../../types/tipadoPlan';
import { ZonaTitulo } from '../../Configuracion/Users/componentes';
import { ListadoAcciones, ListadoAccionesCompartidas, ModalAccion } from './ComponentesAccionesServicios';

interface ModalAvisoProps {
    isOpen: boolean;
    onClose: () => void;
    mensaje: string;
}
const ModalAviso: React.FC<ModalAvisoProps> = ({ isOpen, onClose, mensaje }) => {
    const { t } = useTranslation();
    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
            <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-md text-center">
                <h2 className="text-lg font-semibold mb-4">Aviso</h2>
                <p className="mb-6">{mensaje}</p>
                <button onClick={onClose} className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded">
                    {t('Cerrar')}
                </button>
            </div>
        </div>
    );
};

const Index: React.FC = () => {
    const { t, i18n } = useTranslation();
    const { yearData, errorMessageYearData, successMessageYearData, selectedId, SeleccionVaciarEditarAccion, LoadingYearData } = useYear();
    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const { nombreRegionSeleccionada } = useRegionContext();

    const navigate = useNavigate();
    const ejesPrioritarios = yearData.plan.ejesPrioritarios;
    const ejesSeleccionados = ejesPrioritarios.slice(0, 3);

    const ejesCompartidosStorage = sessionStorage.getItem('ejesPrioritariosCompartidos');
    const [ejesPrioritariosCompartidos, setEjesPrioritariosCompartidos] = useState<Ejes[]>(ejesCompartidosStorage ? JSON.parse(ejesCompartidosStorage) : []);

    const [regionesDuplicadas, setRegionesDuplicadas] = useState<string[]>([]);

    useEffect(() => {
        if (ejesPrioritarios.length > 0) {
            const todasAcciones = ejesPrioritarios.flatMap((eje) => eje.acciones ?? []);
            const ids = todasAcciones
                .map((a) => a.accionDuplicadaDeId)
                .map((id) => (id == null ? '' : String(id)))
                .filter((id) => id !== '' && id !== '0');

            const idsUnicos = Array.from(new Set(ids));
            setRegionesDuplicadas(idsUnicos);
        }
    }, [yearData]);

    useEffect(() => {
        if (regionesDuplicadas.length === 0) return;
        if (!ejesPrioritariosCompartidos || ejesPrioritariosCompartidos.length === 0) return;

        const ejesFiltrados = ejesPrioritariosCompartidos
            .map((eje) => {
                const accionesFiltradas = (eje.acciones ?? []).filter((accion) => {
                    const accionId = String(accion.id);
                    return !regionesDuplicadas.includes(accionId);
                });
                return { ...eje, acciones: accionesFiltradas };
            })
            .filter((eje) => (eje.acciones ?? []).length > 0);

        setEjesPrioritariosCompartidos(ejesFiltrados);
    }, [regionesDuplicadas]);

    useEffect(() => {
        SeleccionVaciarEditarAccion();
    }, []);

    if (!(ejesPrioritarios.length > 0 && ejesPrioritarios.length <= 3)) {
        return <ModalAviso isOpen={true} mensaje={t('error:errorFaltEjesPrioritarios')} onClose={() => navigate('/adr/ejes')} />;
    }

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>
                            {t('listadoAcciones')} {anioSeleccionada}
                        </span>
                    </h2>
                }
                zonaBtn={editarPlan ? <ModalAccion acciones="Acciones" numAcciones={yearData.plan.ejesPrioritarios.map((eje) => eje.acciones.length)} /> : <></>}
                zonaExplicativa={
                    (editarPlan || editarMemoria) && (
                        <>
                            <span>{t('explicacionAccion')}</span>
                            <span>{t('explicacionAccionParte2')}</span>
                        </>
                    )
                }
            />

            <div className="w-full mx-auto mt-1 px-2">
                <LoadingYearData />
                <div className="flex items-start  w-full h-100%">
                    {ejesSeleccionados.map((eje, index) => {
                        return (
                            <div key={eje.Id} className="flex flex-col flex-1 items-center justify-center p-1">
                                {selectedId === eje.Id && (
                                    <>
                                        {successMessageYearData && (
                                            <div className={`mt-4 transition-opacity duration-1000 opacity-100}`}>
                                                <p className="text-green-500">{successMessageYearData}</p>
                                            </div>
                                        )}
                                        {errorMessageYearData && (
                                            <div>
                                                <span className="text-red-500 hover:text-red-700">{errorMessageYearData}</span>
                                            </div>
                                        )}
                                    </>
                                )}
                                <ListadoAcciones eje={i18n.language === 'es' ? eje.NameEs : eje.NameEu} idEje={eje.Id} number={index} setEjesPrioritariosCompartidos={setEjesPrioritariosCompartidos} />
                            </div>
                        );
                    })}
                    {ejesPrioritariosCompartidos.length > 0 && (
                        <div className="flex flex-col flex-1 items-center justify-center p-1">
                            <div className="rounded-lg space-y-5  p-2 border border-gray-200 bg-white max-w-lg w-full mx-auto shadow-sm">
                                <span className="min-h-[90px] text-xl text-center font-semibold text-gray-700 tracking-wide block mb-2">
                                    {t('supracomarcalIncorporarAccion', { participant: nombreRegionSeleccionada })}
                                    {ejesPrioritariosCompartidos.map((eje) => {
                                        console.log(JSON.stringify(eje));
                                        const datosEjes: DatosAccion[] = eje.acciones?.filter((accion) => accion.accionCompartida?.regionLider) ?? [];
                                        if (datosEjes.length === 0) return;
                                        return <ListadoAccionesCompartidas key={eje.Id} eje={eje} idEje={eje.Id} />;
                                    })}
                                </span>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};
export default Index;

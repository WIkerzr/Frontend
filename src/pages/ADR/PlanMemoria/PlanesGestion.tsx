import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import IconDownloand from '../../../components/Icon/IconDownloand.svg';
import IconEnviar from '../../../components/Icon/IconEnviar.svg';
import { ZonaTitulo } from '../../Configuracion/Users/componentes';
import {
    BotonesAceptacionYRechazo,
    BotonReapertura,
    CamposPlanMemoria,
    validarAccionesEjes,
    validarAccionesEjesAccesorias,
    validarCamposPlanGestionAnual,
    validarServicios,
} from './PlanMemoriaComponents';
import { useYear } from '../../../contexts/DatosAnualContext';
import { useEffect, useState } from 'react';
import { BtnExportarDocumentoWord } from '../../../components/Utils/genWORD';
import { StatusColors, useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';

interface Archivo {
    nombre: string;
    url: string;
}

const archivos: Archivo[] = [
    { nombre: 'Memoria.pdf', url: '/docs/Memoria.pdf' },
    { nombre: 'Anexo1.pdf', url: '/docs/Anexo1.pdf' },
    { nombre: 'Anexo2.pdf', url: '/docs/Anexo2.pdf' },
];

const Index = () => {
    const { anioSeleccionada, editarPlan } = useEstadosPorAnio();
    const { yearData, llamadaBBDDYearDataAll, LoadingYearData } = useYear();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const [camposRellenos, setCamposRellenos] = useState<boolean>(false);
    const [mensajeError, setMensajeError] = useState<string>('');
    const [successMessageSuperior, setSuccessMessageSuperior] = useState<string>('');

    const [guardado, setGuardado] = useState<boolean>(false);
    const guardadoProps = { value: guardado, set: setGuardado };
    const { t, i18n } = useTranslation();
    const [visibleMessageSuperior, setVisibleMessageSuperior] = useState('');
    const [validarDatos, setValidarDatos] = useState<boolean>(false);

    useEffect(() => {
        if (successMessageSuperior) {
            setVisibleMessageSuperior(successMessageSuperior);
        } else {
            const timer = setTimeout(() => setVisibleMessageSuperior(''), 5000);
            return () => clearTimeout(timer);
        }
    }, [successMessageSuperior]);

    useEffect(() => {
        if (!validarDatos) return;
        if (!validarAccionesEjes(yearData.plan.ejesPrioritarios, editarPlan, false, t)) {
            setMensajeError(t('faltanCamposAccionesEjesPrioritarios'));
            setCamposRellenos(false);
            return;
        }
        if (!validarAccionesEjesAccesorias(yearData.plan.ejesRestantes!, editarPlan, false)) {
            setMensajeError(t('faltanCamposAccionesEjes'));
            setCamposRellenos(false);
            return;
        }
        if (!validarServicios(yearData.servicios!, false, t)) {
            setMensajeError(t('faltanCamposServicios'));
            setCamposRellenos(false);
            return;
        }
        setMensajeError('');
        setCamposRellenos(true);
    }, [yearData]);

    return (
        <div className="panel ">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>
                            {t('planTitulo')} {anioSeleccionada}
                        </span>
                        <span className={`${StatusColors[yearData.plan.status]}`}>{t(yearData.plan.status)}</span>
                    </h2>
                }
                zonaBtn={
                    <>
                        {editarPlan && (
                            <div className="flex flex-col items-center gap-4 justify-end ">
                                <div className="flex items-center gap-4 justify-end ">
                                    <button className="px-4 py-2 bg-primary text-white rounded flex items-center justify-center font-medium h-10 min-w-[120px]" onClick={() => setGuardado(true)}>
                                        {t('guardar')}
                                    </button>
                                    <button
                                        className="px-4 py-2 bg-primary text-white rounded flex items-center justify-center font-medium h-10 min-w-[120px]"
                                        onClick={() => {
                                            if (!validarCamposPlanGestionAnual(yearData)) {
                                                setMensajeError(t('faltanCamposPlanGestion'));
                                                setCamposRellenos(false);
                                                return;
                                            } else {
                                                setValidarDatos(true);
                                                llamadaBBDDYearDataAll(anioSeleccionada!, true, true);
                                            }
                                        }}
                                    >
                                        {t('validarDatosAnio')}
                                    </button>
                                    <BtnExportarDocumentoWord camposRellenos={camposRellenos} tipo="Plan" yearData={yearData} language={i18n.language} t={t} />
                                    <NavLink
                                        to={camposRellenos ? '/adr/planesGestion/gestionEnvio' : '#'}
                                        state={{ pantalla: 'Plan' }}
                                        onClick={(e) => {
                                            if (!camposRellenos) e.preventDefault();
                                        }}
                                        className="min-w-[120px]"
                                    >
                                        <button
                                            disabled={!camposRellenos}
                                            className={`px-4 py-2 rounded flex items-center justify-center gap-1 font-medium h-10 w-full ${
                                                camposRellenos ? 'bg-green-500 text-white hover:bg-green-600' : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                                            }`}
                                        >
                                            <img src={IconEnviar} alt="PDF" className="w-5 h-5" style={{ minWidth: 20, minHeight: 20 }} />
                                            {t('enviar')}
                                        </button>
                                    </NavLink>
                                </div>
                                <div className="flex flex-wrap gap-4 justify-end mt-2">
                                    {visibleMessageSuperior && <div className="text-success bg-warning-ligh ">{visibleMessageSuperior}</div>}
                                    {mensajeError && <div className="text-red-500">{mensajeError}</div>}
                                </div>
                            </div>
                        )}
                        <BotonesAceptacionYRechazo pantalla="Plan" />
                        <BotonReapertura pantalla="Plan" />
                    </>
                }
                zonaExplicativa={
                    editarPlan && (
                        <>
                            <span>{t('explicacionPlanParte1')}</span>
                            <span>{t('explicacionPlanParte2')}</span>
                        </>
                    )
                }
            />
            <LoadingYearData />

            {editarPlan && <CamposPlanMemoria pantalla="Plan" guardadoProps={guardadoProps} setSuccessMessageSuperior={setSuccessMessageSuperior} />}
            {(yearData.plan.status === 'proceso' || yearData.plan.status === 'aceptado') && (
                <div className="panel w-full max-w-lg mx-auto mt-8 bg-white rounded shadow p-6">
                    <h2 className="text-xl font-bold mb-4">Archivos Memoria 2025</h2>
                    <ul className="space-y-3 ">
                        {archivos.map((archivo, idx) => (
                            <li
                                key={archivo.nombre}
                                className={`flex items-center justify-between p-3 rounded transition hover:bg-gray-100 ${hoveredIndex === idx ? 'bg-gray-100' : ''}`}
                                onMouseEnter={() => setHoveredIndex(idx)}
                                onMouseLeave={() => setHoveredIndex(null)}
                            >
                                <div className="flex items-center space-x-3">
                                    <img src={IconDownloand} alt="PDF" className="w-6 h-6 text-red-500" style={{ minWidth: 24, minHeight: 24 }} />
                                    <span className="font-medium">{archivo.nombre}</span>
                                </div>
                                <a href={archivo.url} download className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-800 transition">
                                    <button className="w-20 h-5 mr-2" style={{ minWidth: 20, minHeight: 20 }}>
                                        {t('descargar')}
                                    </button>
                                </a>
                            </li>
                        ))}
                    </ul>
                </div>
            )}
        </div>
    );
};

export default Index;

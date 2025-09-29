import { useTranslation } from 'react-i18next';
import { LoadingOverlay, ZonaTitulo } from '../../Configuracion/Users/componentes';
import { BotonesAceptacionYRechazo, BotonReapertura, CamposPlanMemoria, ValidacionAnualPlanMemoria, validarCamposMemoriaSeguimientoAnual } from './PlanMemoriaComponents';
import { NavLink } from 'react-router-dom';
import IconDownloand from '../../../components/Icon/IconDownloand.svg';
import IconEnviar from '../../../components/Icon/IconEnviar.svg';
import { useEffect, useState } from 'react';
import { BtnExportarDocumentoWord } from '../../../components/Utils/genWORD';
import { useYear } from '../../../contexts/DatosAnualContext';
import { useEstadosPorAnio, StatusColors } from '../../../contexts/EstadosPorAnioContext';
import { GeneralOperationADR, Memoria } from '../../../types/tipadoPlan';
import { DescargarArchivoBodyParams, LlamarDescargarArchivo } from '../../../components/Utils/data/utilsData';
import { LlamadaArbolArchivosPlan } from '../../../components/Utils/data/YearData/dataGestionPlanMemoria';
import { Archivo, Nodo, TransformarArchivos } from '../../../components/Utils/data/YearData/yearDataTransformData';
import { useRegionContext } from '../../../contexts/RegionContext';

const Index = () => {
    const { anioSeleccionada, editarPlan, editarMemoria } = useEstadosPorAnio();
    const { t, i18n } = useTranslation();
    const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
    const { yearData, llamadaBBDDYearDataAll, LoadingYearData } = useYear();
    const [camposRellenos, setCamposRellenos] = useState<boolean>(false);
    const [mensajeError, setMensajeError] = useState<string>('');
    const [successMessageSuperior, setSuccessMessageSuperior] = useState<string>('');
    const [visibleMessageSuperior, setVisibleMessageSuperior] = useState('');
    const { regionSeleccionada } = useRegionContext();

    const [guardado, setGuardado] = useState<boolean>(false);
    const guardadoProps = { value: guardado, set: setGuardado };

    const [tablaIndicadoresOperativos, setTablaIndicadoresOperativos] = useState<GeneralOperationADR>(yearData.plan.generalOperationADR);
    const [camposMemoria, setCamposMemoria] = useState<Memoria>(yearData.memoria);

    const [validarDatos, setValidarDatos] = useState<boolean>(false);

    const [memoriaGuardado, setMemoriaGuardado] = useState<Archivo[]>();
    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    useEffect(() => {
        if (JSON.stringify(camposMemoria) !== JSON.stringify(yearData.memoria)) {
            setCamposMemoria(yearData.memoria);
        }
        if (JSON.stringify(tablaIndicadoresOperativos) !== JSON.stringify(yearData.plan.generalOperationADR)) {
            setTablaIndicadoresOperativos(yearData.plan.generalOperationADR);
        }
    }, [yearData]);

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
        ValidacionAnualPlanMemoria({
            yearData,
            editarPlan,
            editarMemoria,
            verificando: 'Memoria',
            t,
            setMensajeError,
            setCamposRellenos,
            setVisibleMessageSuperior,
        });
    }, [validarDatos]);

    useEffect(() => {
        if (yearData.plan.status != 'borrador') {
            if (regionSeleccionada && yearData.year) {
                LlamadaArbolArchivosPlan({
                    regionSeleccionada,
                    anioSeleccionada: yearData.year,
                    setLoading,
                    message: { setErrorMessage, setSuccessMessage },
                    onSuccess: (response) => {
                        console.log(response.data);
                        const datosRecibidos: Nodo = response.data;
                        const archivos: Archivo[] = TransformarArchivos(datosRecibidos);
                        setMemoriaGuardado(archivos);
                    },
                });
            }
        }
    }, []);

    const handleClick = (nombreArchivo: string, index: number) => {
        const body: DescargarArchivoBodyParams = {
            NombreArchivo: nombreArchivo,
            RegionId: `${regionSeleccionada}`,
            RutaArchivo: index > 0 ? 'Memoria/Anexos' : 'Memoria',
            Year: `${yearData.year}`,
        };

        LlamarDescargarArchivo({
            message: { setErrorMessage, setSuccessMessage },
            body: body,
            setLoading,
        });
    };

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>
                            {t('memoriaTitulo')} {anioSeleccionada}
                        </span>
                        <span className={`${StatusColors[camposMemoria.status]}`}>{t(camposMemoria.status)}</span>
                    </h2>
                }
                zonaBtn={
                    <>
                        {editarMemoria && (
                            <div className="flex flex-col items-center gap-4 justify-end ">
                                <div className="flex items-center gap-4 justify-end">
                                    <button className="px-4 py-2 bg-primary text-white rounded flex items-center justify-center font-medium h-10 min-w-[120px]" onClick={() => setGuardado(true)}>
                                        {t('guardar')}
                                    </button>
                                    <button
                                        className={`px-4 py-2 bg-primary text-white rounded flex items-center justify-center font-medium h-10 min-w-[120px]`}
                                        onClick={() => {
                                            if (!validarCamposMemoriaSeguimientoAnual(yearData)) {
                                                setMensajeError(t('faltanCamposMemoriaSeguimiento'));
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
                                    <BtnExportarDocumentoWord camposRellenos={camposRellenos} tipo="Memoria" yearData={yearData} language={i18n.language} t={t} />
                                    <NavLink
                                        to={camposRellenos ? '/adr/memoriasAnuales/gestionEnvio' : '#'}
                                        state={{ pantalla: 'Memoria' }}
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
                        <BotonesAceptacionYRechazo pantalla="Memoria" />
                        <BotonReapertura pantalla="Memoria" />
                    </>
                }
                zonaExplicativa={
                    editarMemoria && (
                        <>
                            {camposMemoria.status === 'borrador' && <span className="block mb-2">{t('explicacionMemoriaParte1')}</span>}
                            <span className="block">{t(`explicacionMemoriaParte2${camposMemoria.status}`)}</span>
                        </>
                    )
                }
            />
            <LoadingYearData />
            <LoadingOverlay
                isLoading={loading}
                message={{
                    successMessage,
                    setSuccessMessage,
                    errorMessage,
                    setErrorMessage,
                }}
                timeDelay={false}
            />
            <>
                {(camposMemoria.status === 'borrador' || camposMemoria.status === 'cerrado') && (
                    <CamposPlanMemoria pantalla="Memoria" guardadoProps={guardadoProps} setSuccessMessageSuperior={setSuccessMessageSuperior} />
                )}
                {(camposMemoria.status === 'proceso' || camposMemoria.status === 'aceptado') && (
                    <div className="panel w-full max-w-lg mx-auto mt-8 bg-white rounded shadow p-6">
                        <h2 className="text-xl font-bold mb-4">Archivos Memoria 2025</h2>
                        <ul className="space-y-3 ">
                            {memoriaGuardado &&
                                memoriaGuardado.map((archivo, idx) => (
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
                                        <a
                                            download
                                            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-800 transition"
                                            onClick={() => handleClick(archivo.nombre, idx)}
                                        >
                                            <button className="w-20 h-5 mr-2" style={{ minWidth: 20, minHeight: 20 }}>
                                                {t('descargar')}
                                            </button>
                                        </a>
                                    </li>
                                ))}
                        </ul>
                    </div>
                )}
            </>
        </div>
    );
};

export default Index;

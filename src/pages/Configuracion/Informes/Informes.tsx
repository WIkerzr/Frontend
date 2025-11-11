import { useTranslation } from 'react-i18next';
import { LoadingOverlayPersonalizada, ZonaTitulo } from '../Users/componentes';
import { SelectorAnio, SelectorInformes } from '../../../components/Utils/inputs';
import { useEffect, useState } from 'react';
import Multiselect from 'multiselect-react-dropdown';
import { useRegionContext } from '../../../contexts/RegionContext';
import { RegionInterface } from '../../../components/Utils/data/getRegiones';
import { Boton } from '../../../components/Utils/utils';
import { LlamadasBBDD } from '../../../components/Utils/data/utilsData';
import { GenerarInformePrestamo } from './informePresupuesto';
import { GenerarInformeObjetivos, crearGeneradorNombresUnicos } from './informeObjetivo';
import { useIndicadoresContext } from '../../../contexts/IndicadoresContext';
import { generarInformeAcciones } from './informeAcciones';
import { generarInformeTratamientoComarcal, generarInformeTratamientoComarcalSeparado } from './InformesTratamientoComarcal';
import { generarInformeIndicadoresImpacto } from './informeIndicadoresImpacto';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { useUser } from '../../../contexts/UserContext';
import ExcelJS from 'exceljs';
import saveAs from 'file-saver';

export type Informes = 'InfObjetivos' | 'InfObjetivosSeparados' | 'InfAcciones' | 'InfTratamientoComarcal' | 'InfTratamientoComarcalSeparado' | 'InfPresupuestos' | 'InfIndicadoresImpacto';

export const tiposInformes: Informes[] = [
    'InfObjetivos',
    'InfObjetivosSeparados',
    'InfAcciones',
    'InfTratamientoComarcal',
    'InfTratamientoComarcalSeparado',
    'InfPresupuestos',
    'InfIndicadoresImpacto',
];

const Index = () => {
    const { t, i18n } = useTranslation();
    const { regiones, regionSeleccionada } = useRegionContext();
    const { ListadoNombresIdicadoresSegunADR } = useIndicadoresContext();
    const { anios } = useEstadosPorAnio();
    const { user } = useUser();

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [years, setYears] = useState<string[]>(['TODOS', ...anios.map(String)]);
    const [anioSeleccionado, setAnioSeleccionado] = useState<string>('TODOS');
    const [informeSeleccionado, setInformeSeleccionado] = useState<Informes>('InfObjetivos');
    const [regionesEnDropdow, setRegionesEnDropdow] = useState<RegionInterface[]>([]);
    const [multiselectKey, setMultiselectKey] = useState<number>(0);

    const handleChangeRegionsSupracomarcal = (selected: RegionInterface[]) => {
        setRegionesEnDropdow(selected);
    };

    useEffect(() => {
        if (user && user.role === 'ADR') {
            const region = regiones.find((r) => r.RegionId.toString() === regionSeleccionada);
            setRegionesEnDropdow(region ? [region] : []);
        } else {
            const aniosRegion = sessionStorage.getItem('aniosRegion');
            if (aniosRegion) {
                const anioRegiones: { RegionId: number; Years: number[] }[] = JSON.parse(aniosRegion);
                if (regionSeleccionada) {
                    const data: { RegionId: number; Years: number[] } | undefined = anioRegiones.find((a: { RegionId: number; Years: number[] }) => a.RegionId.toString() === regionSeleccionada);
                    if (data && data.Years) {
                        setYears(['TODOS', ...data.Years.map(String)]);
                    }
                } else {
                    if (anioRegiones) {
                        const aniosMax = Math.max(...anioRegiones.flatMap((region) => region.Years));
                        const aniosMin = Math.min(...anioRegiones.flatMap((region) => region.Years));
                        const yearsRange = [];
                        for (let y = aniosMin; y <= aniosMax; y++) {
                            yearsRange.push(String(y));
                        }
                        setYears(['TODOS', ...yearsRange]);
                    }
                }
            }
        }
    }, [regionSeleccionada]);

    const handleObtenerInforme = async () => {
        /* eslint-disable @typescript-eslint/no-explicit-any */
        const idRegionesSeleccionadas: number[] = regionesEnDropdow.map((r) => Number(r.RegionId));

        const callForYear = (yearStr: string) =>
            new Promise<any>((resolve) => {
                let resultData: any = null;
                LlamadasBBDD({
                    method: 'POST',
                    url: `informes`,
                    body: {
                        AnioSeleccionado: [yearStr],
                        InformeSeleccionado: informeSeleccionado,
                        RegionesId: idRegionesSeleccionadas,
                    },
                    setLoading: () => {},
                    setErrorMessage: setErrorMessage,
                    setSuccessMessage: setSuccessMessage,
                    onSuccess: (data: any) => {
                        resultData = data;
                    },
                    onFinally: () => {
                        resolve(resultData);
                    },
                });
            });

        if (anioSeleccionado === 'TODOS' && informeSeleccionado !== 'InfIndicadoresImpacto') {
            try {
                setLoading(true);

                const workbook = new ExcelJS.Workbook();

                const regionesNombres = regionesEnDropdow.map((r) => (i18n.language === 'eu' ? r.NameEu : r.NameEs)).join(', ');
                const metadatos = {
                    nombreInforme: t(informeSeleccionado),
                    anio: t('TODOS'),
                    regiones: regionesNombres || t('todasLasComarcas'),
                    fechaHora: new Date().toLocaleString(i18n.language === 'eu' ? 'eu-ES' : 'es-ES'),
                };

                if (informeSeleccionado === 'InfObjetivosSeparados') {
                    const data = await new Promise<any>((resolve) => {
                        let resultData: any = null;
                        LlamadasBBDD({
                            method: 'POST',
                            url: `informes`,
                            body: {
                                AnioSeleccionado: anios.map(Number),
                                InformeSeleccionado: informeSeleccionado,
                                RegionesId: idRegionesSeleccionadas,
                            },
                            setLoading: () => {},
                            setErrorMessage,
                            setSuccessMessage,
                            onSuccess: (data) => {
                                resultData = data;
                            },
                            onFinally: () => {
                                resolve(resultData);
                            },
                        });
                    });

                    if (!data || !data.data) {
                        setLoading(false);
                        return;
                    }

                    const { obtenerNombreUnico } = crearGeneradorNombresUnicos();

                    for (const regionAnioData of data.data) {
                        const region = regionesEnDropdow.find((r) => Number(r.RegionId) === regionAnioData.RegionId);
                        if (!region) continue;

                        const regionName = i18n.language === 'eu' ? region.NameEu : region.NameEs;
                        const nombrePestana = obtenerNombreUnico(`${regionAnioData.Anio} - ${regionName}`);
                        const worksheet = workbook.addWorksheet(nombrePestana);

                        const metadatosRegionAnio = {
                            ...metadatos,
                            anio: String(regionAnioData.Anio),
                            regiones: regionName,
                        };

                        await GenerarInformeObjetivos({
                            realizacion: regionAnioData.IndicadoresRealizacion || [],
                            resultado: regionAnioData.IndicadoresResultado || [],
                            servicios: regionAnioData.IndicadoresServicios || [],
                            ListadoNombresIdicadoresSegunADR,
                            t,
                            anioSeleccionado: String(regionAnioData.Anio),
                            worksheet,
                            workbook,
                            metadatos: metadatosRegionAnio,
                        });
                    }
                } else if (informeSeleccionado === 'InfTratamientoComarcalSeparado') {
                    const aniosProcesar = years.filter((y) => y !== 'TODOS');

                    for (const y of aniosProcesar) {
                        const data = await callForYear(y);

                        if (!data || !data.data) {
                            continue;
                        }

                        await generarInformeTratamientoComarcalSeparado(data.data, t, y, regionesEnDropdow, i18n, undefined, workbook, { ...metadatos, anio: y });
                    }
                } else {
                    const aniosProcesar = years.filter((y) => y !== 'TODOS');

                    for (const y of aniosProcesar) {
                        const data = await callForYear(y);
                        if (!data) continue;
                        sessionStorage.setItem('lastInformeData', JSON.stringify(data));

                        const worksheet = workbook.addWorksheet(`Año ${y}`);

                        const metadatosAnio = { ...metadatos, anio: y };

                        if (informeSeleccionado === 'InfObjetivos') {
                            await GenerarInformeObjetivos({
                                realizacion: data.response.indicadoresRealizacion,
                                resultado: data.response.indicadoresResultado,
                                servicios: data.response.indicadoresServicios,
                                ListadoNombresIdicadoresSegunADR,
                                t,
                                anioSeleccionado: y,
                                worksheet,
                                workbook,
                                metadatos: metadatosAnio,
                            });
                        }
                        if (informeSeleccionado === 'InfAcciones') {
                            await generarInformeAcciones(data.data, t, i18n, y, worksheet, workbook, metadatosAnio, regionesEnDropdow);
                        }
                        if (informeSeleccionado === 'InfTratamientoComarcal') {
                            await generarInformeTratamientoComarcal(data.data, t, y, worksheet, workbook, metadatosAnio);
                        }
                        if (informeSeleccionado === 'InfPresupuestos') {
                            await GenerarInformePrestamo({ resultados: data.data, t, anioSeleccionado: y, worksheet, workbook, metadatos: metadatosAnio });
                        }
                    }
                }

                const buffer = await workbook.xlsx.writeBuffer();
                const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                saveAs(blob, `${t(informeSeleccionado)} ${t('todosLosAnios')}.xlsx`);
            } finally {
                setLoading(false);
            }
            return;
        }

        LlamadasBBDD({
            method: 'POST',
            url: `informes`,
            body: {
                AnioSeleccionado: informeSeleccionado !== 'InfIndicadoresImpacto' ? [anioSeleccionado] : [2025],
                InformeSeleccionado: informeSeleccionado,
                RegionesId: idRegionesSeleccionadas,
            },
            setLoading: setLoading ?? (() => {}),
            setErrorMessage: setErrorMessage,
            setSuccessMessage: setSuccessMessage,
            onSuccess: async (data: any) => {
                sessionStorage.setItem('lastInformeData', JSON.stringify(data));

                if (informeSeleccionado === 'InfObjetivosSeparados' && data.data) {
                    const workbook = new ExcelJS.Workbook();

                    // Crear generador de nombres únicos para pestañas
                    const { obtenerNombreUnico } = crearGeneradorNombresUnicos();

                    for (const regionAnioData of data.data) {
                        const region = regionesEnDropdow.find((r) => Number(r.RegionId) === regionAnioData.RegionId);
                        if (!region) continue;

                        const regionName = i18n.language === 'eu' ? region.NameEu : region.NameEs;
                        const nombrePestana = obtenerNombreUnico(`${regionAnioData.Anio} - ${regionName}`);
                        const worksheet = workbook.addWorksheet(nombrePestana);

                        const metadatos = {
                            nombreInforme: t(informeSeleccionado),
                            anio: String(regionAnioData.Anio),
                            regiones: regionName,
                            fechaHora: new Date().toLocaleString(i18n.language === 'eu' ? 'eu-ES' : 'es-ES'),
                        };

                        await GenerarInformeObjetivos({
                            realizacion: regionAnioData.IndicadoresRealizacion || [],
                            resultado: regionAnioData.IndicadoresResultado || [],
                            servicios: regionAnioData.IndicadoresServicios || [],
                            ListadoNombresIdicadoresSegunADR,
                            t,
                            anioSeleccionado: String(regionAnioData.Anio),
                            worksheet,
                            workbook,
                            metadatos,
                        });
                    }

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    saveAs(blob, `${t(informeSeleccionado)}_${anioSeleccionado}.xlsx`);
                    return;
                }

                if (informeSeleccionado === 'InfObjetivos') {
                    GenerarInformeObjetivos({
                        realizacion: data.response.indicadoresRealizacion,
                        resultado: data.response.indicadoresResultado,
                        servicios: data.response.indicadoresServicios,
                        ListadoNombresIdicadoresSegunADR,
                        t,
                        anioSeleccionado,
                    });
                }
                if (informeSeleccionado === 'InfAcciones') {
                    generarInformeAcciones(data.data, t, i18n, anioSeleccionado, undefined, undefined, undefined, regionesEnDropdow);
                }
                if (informeSeleccionado === 'InfTratamientoComarcal') {
                    generarInformeTratamientoComarcal(data.data, t, anioSeleccionado);
                }
                if (informeSeleccionado === 'InfTratamientoComarcalSeparado') {
                    generarInformeTratamientoComarcalSeparado(data.data, t, anioSeleccionado, regionesEnDropdow, i18n);
                }
                if (informeSeleccionado === 'InfPresupuestos') {
                    GenerarInformePrestamo({ resultados: data.data, t, anioSeleccionado });
                }
                if (informeSeleccionado === 'InfIndicadoresImpacto') {
                    if (data.data && Array.isArray(data.data) && data.data.length > 0) {
                        const workbook = new ExcelJS.Workbook();
                        const { obtenerNombreUnico } = crearGeneradorNombresUnicos();

                        for (const regionData of data.data) {
                            const regionId = regionData.RegionId;
                            const listadoCompleto = regionData.ListadoCompleto || [];
                            const datosConValores = regionData.Datos || [];

                            if (listadoCompleto.length > 0) {
                                const region = regionesEnDropdow.find((r) => Number(r.RegionId) === regionId);
                                const regionName = region ? (i18n.language === 'eu' ? region.NameEu : region.NameEs) : `Región ${regionId}`;

                                const nombrePestana = obtenerNombreUnico(regionName);
                                const worksheet = workbook.addWorksheet(nombrePestana);

                                const metadatos = {
                                    nombreInforme: t('InfIndicadoresImpacto'),
                                    anio: anioSeleccionado,
                                    regiones: regionName,
                                    fechaHora: new Date().toLocaleString(i18n.language === 'eu' ? 'eu-ES' : 'es-ES'),
                                };

                                await generarInformeIndicadoresImpacto({
                                    datosOriginales: listadoCompleto,
                                    datosConValores: datosConValores,
                                    t,
                                    worksheet,
                                    workbook,
                                    metadatos,
                                });
                            }
                        }

                        if (workbook.worksheets.length > 0) {
                            const buffer = await workbook.xlsx.writeBuffer();
                            const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                            saveAs(blob, `${t('InfIndicadoresImpacto')}_${anioSeleccionado}.xlsx`);
                        }
                    }
                }
            },
        });
    };

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>{t('informes')}</span>
                    </h2>
                }
            />
            <LoadingOverlayPersonalizada
                isLoading={loading}
                message={{
                    errorMessage,
                    setErrorMessage,
                    successMessage,
                    setSuccessMessage,
                }}
            />

            <div className="panel flex flex-row gap-x-4">
                <SelectorAnio years={years} yearFilter={t(`${anioSeleccionado}`)} setYearFilter={setAnioSeleccionado} />
                <SelectorInformes informeSeleccionado={informeSeleccionado} setInformeSeleccionado={setInformeSeleccionado} />
                {user && user.role === 'HAZI' && (
                    <div className="w-full resize-y ">
                        <label className="block mb-1">{t('seleccionaComarca')}</label>
                        <div className="flex flex-row gap-x-4 w-full">
                            {regionesEnDropdow.length === regiones.length ? (
                                <Boton
                                    tipo="cerrar"
                                    textoBoton={t('borrar')}
                                    onClick={() => {
                                        setRegionesEnDropdow([]);
                                        setMultiselectKey((prev) => prev + 1);
                                    }}
                                />
                            ) : (
                                <Boton tipo="guardar" textoBoton={t('TODOS')} onClick={() => setRegionesEnDropdow(regiones)} />
                            )}
                            <div style={{ width: '100%' }}>
                                <Multiselect
                                    key={multiselectKey}
                                    placeholder={t('seleccionaMultiOpcion')}
                                    options={regiones}
                                    selectedValues={regionesEnDropdow}
                                    displayValue={i18n.language === 'eu' ? 'NameEu' : 'NameEs'}
                                    onSelect={handleChangeRegionsSupracomarcal}
                                    onRemove={handleChangeRegionsSupracomarcal}
                                    emptyRecordMsg={t('error:errorNoOpciones')}
                                    style={{
                                        multiselectContainer: {
                                            width: '100%',
                                        },
                                        searchBox: {
                                            width: '100%',
                                        },
                                        optionContainer: {
                                            width: '100%',
                                        },
                                    }}
                                />
                            </div>
                            {/* <Boton tipo="guardar" textoBoton={t('descargar')} onClick={handlePruebas} /> */}
                        </div>
                    </div>
                )}
                <div className="w-full resize-y ">
                    <label className="block mb-1">{t('descargarInforme')}</label>
                    <div className="flex flex-row gap-x-4 w-full">
                        <Boton tipo="guardar" textoBoton={t('descargar')} onClick={handleObtenerInforme} />
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Index;

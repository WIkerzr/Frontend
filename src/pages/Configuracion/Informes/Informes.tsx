import { useTranslation } from 'react-i18next';
import { LoadingOverlayPersonalizada, ZonaTitulo } from '../Users/componentes';
import { SelectorInformes } from '../../../components/Utils/inputs';
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
import { Checkbox } from '@mantine/core';

export type Informes =
    | 'InfObjetivos'
    | 'InfObjetivosSeparado'
    | 'InfAcciones'
    | 'InfAccionesSeparado'
    | 'InfTratamientoComarcal'
    | 'InfTratamientoComarcalSeparado'
    | 'InfPresupuestos'
    | 'InfPresupuestosSeparado'
    | 'InfIndicadoresImpacto'
    | 'InfIndicadoresImpactoSeparado';

export const tiposInformes: Informes[] = [
    'InfObjetivos',
    'InfObjetivosSeparado',
    'InfAcciones',
    'InfAccionesSeparado',
    'InfTratamientoComarcal',
    'InfTratamientoComarcalSeparado',
    'InfPresupuestos',
    'InfPresupuestosSeparado',
    'InfIndicadoresImpacto',
    'InfIndicadoresImpactoSeparado',
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
    const [informeSeleccionado, setInformeSeleccionado] = useState<Informes>('InfObjetivos');
    const [regionesEnDropdow, setRegionesEnDropdow] = useState<RegionInterface[]>([]);
    const [multiselectKey, setMultiselectKey] = useState<number>(0);
    const yearOptions = years.filter((y) => y !== 'TODOS').map((y) => ({ value: y, label: y }));
    const [selectedYearsMulti, setSelectedYearsMulti] = useState<string[]>(yearOptions.map((o) => o.value));

    useEffect(() => {
        setSelectedYearsMulti(yearOptions.map((o) => o.value));
    }, [years]);

    const [SeparadosComarcas, setSeparadosComarcas] = useState<boolean>(false);

    const getCorrespondingInforme = (informe: Informes, separados: boolean): Informes => {
        const infStr = informe as string;
        if (separados) {
            return (infStr.endsWith('Separado') ? infStr : `${infStr}Separado`) as Informes;
        }
        return (infStr.endsWith('Separado') ? infStr.replace(/Separado$/, '') : infStr) as Informes;
    };

    useEffect(() => {
        setInformeSeleccionado((prev) => getCorrespondingInforme(prev, SeparadosComarcas));
    }, [SeparadosComarcas]);

    useEffect(() => {
        const baseInforme = (informeSeleccionado as string).replace(/Separado$/, '');
        if (baseInforme === 'InfIndicadoresImpacto') {
            setSeparadosComarcas(selectedYearsMulti.length > 1);
        }
    }, [selectedYearsMulti, informeSeleccionado]);

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

        if (selectedYearsMulti.length > 1 && informeSeleccionado !== 'InfIndicadoresImpacto' && informeSeleccionado !== 'InfIndicadoresImpactoSeparado') {
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

                if (informeSeleccionado === 'InfObjetivosSeparado') {
                    const data = await new Promise<any>((resolve) => {
                        let resultData: any = null;
                        LlamadasBBDD({
                            method: 'POST',
                            url: `informes`,
                            body: {
                                AnioSeleccionado: selectedYearsMulti,
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
                } else if (informeSeleccionado === 'InfAccionesSeparado') {
                    const data = await new Promise<any>((resolve) => {
                        let resultData: any = null;
                        LlamadasBBDD({
                            method: 'POST',
                            url: `informes`,
                            body: {
                                AnioSeleccionado: selectedYearsMulti,
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

                    const { obtenerNombreUnico: obtenerNombreUnicoAcc } = crearGeneradorNombresUnicos();

                    for (const regionAnioData of data.data) {
                        const region = regionesEnDropdow.find((r) => Number(r.RegionId) === regionAnioData.RegionId);
                        if (!region) continue;

                        const regionName = i18n.language === 'eu' ? region.NameEu : region.NameEs;
                        const nombrePestana = obtenerNombreUnicoAcc(`${regionAnioData.Anio} - ${regionName}`);
                        const worksheet = workbook.addWorksheet(nombrePestana);

                        const metadatosRegionAnio = {
                            ...metadatos,
                            anio: String(regionAnioData.Anio),
                            regiones: regionName,
                        };

                        const payloadForAcciones = Array.isArray(regionAnioData.Datos) ? [regionAnioData] : Array.isArray(regionAnioData.data) ? regionAnioData.data : [regionAnioData];
                        await generarInformeAcciones(payloadForAcciones, t, i18n, String(regionAnioData.Anio), worksheet, workbook, metadatosRegionAnio, regionesEnDropdow);
                    }
                } else if (informeSeleccionado === 'InfPresupuestosSeparado') {
                    const data = await new Promise<any>((resolve) => {
                        let resultData: any = null;
                        LlamadasBBDD({
                            method: 'POST',
                            url: `informes`,
                            body: {
                                AnioSeleccionado: selectedYearsMulti,
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

                    const { obtenerNombreUnico: obtenerNombreUnicoPres } = crearGeneradorNombresUnicos();

                    for (const regionAnioData of data.data) {
                        const region = regionesEnDropdow.find((r) => Number(r.RegionId) === regionAnioData.RegionId);
                        if (!region) continue;

                        const regionName = i18n.language === 'eu' ? region.NameEu : region.NameEs;
                        const nombrePestana = obtenerNombreUnicoPres(`${regionAnioData.Anio} - ${regionName}`);
                        const worksheet = workbook.addWorksheet(nombrePestana);

                        const metadatosRegionAnio = {
                            ...metadatos,
                            anio: String(regionAnioData.Anio),
                            regiones: regionName,
                        };

                        const payloadForPresupuestos = Array.isArray(regionAnioData.Datos)
                            ? regionAnioData.Datos
                            : Array.isArray(regionAnioData.data)
                            ? regionAnioData.data
                            : regionAnioData.resultados
                            ? regionAnioData.resultados
                            : [regionAnioData];

                        await GenerarInformePrestamo({ resultados: payloadForPresupuestos, t, anioSeleccionado: String(regionAnioData.Anio), worksheet, workbook, metadatos: metadatosRegionAnio });
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
                AnioSeleccionado: informeSeleccionado !== 'InfObjetivosSeparado' ? selectedYearsMulti : [2025],
                InformeSeleccionado: informeSeleccionado,
                RegionesId: idRegionesSeleccionadas,
            },
            setLoading: setLoading ?? (() => {}),
            setErrorMessage: setErrorMessage,
            setSuccessMessage: setSuccessMessage,
            onSuccess: async (data: any) => {
                sessionStorage.setItem('lastInformeData', JSON.stringify(data));

                if (informeSeleccionado === 'InfObjetivosSeparado' && data.data) {
                    const workbook = new ExcelJS.Workbook();

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
                    saveAs(blob, `${t(informeSeleccionado)}_${selectedYearsMulti}.xlsx`);
                    return;
                }

                if (informeSeleccionado === 'InfPresupuestosSeparado' && data.data) {
                    const workbook = new ExcelJS.Workbook();

                    const { obtenerNombreUnico: obtenerNombreUnicoPres } = crearGeneradorNombresUnicos();

                    for (const regionAnioData of data.data) {
                        const region = regionesEnDropdow.find((r) => Number(r.RegionId) === regionAnioData.RegionId);
                        if (!region) continue;

                        const regionName = i18n.language === 'eu' ? region.NameEu : region.NameEs;
                        const nombrePestana = obtenerNombreUnicoPres(`${regionAnioData.Anio} - ${regionName}`);
                        const worksheet = workbook.addWorksheet(nombrePestana);

                        const metadatos = {
                            nombreInforme: t(informeSeleccionado),
                            anio: String(regionAnioData.Anio),
                            regiones: regionName,
                            fechaHora: new Date().toLocaleString(i18n.language === 'eu' ? 'eu-ES' : 'es-ES'),
                        };

                        const resultados = Array.isArray(regionAnioData.Datos)
                            ? regionAnioData.Datos
                            : Array.isArray(regionAnioData.data)
                            ? regionAnioData.data
                            : regionAnioData.resultados
                            ? regionAnioData.resultados
                            : [];

                        await GenerarInformePrestamo({ resultados: resultados, t, anioSeleccionado: String(regionAnioData.Anio), worksheet, workbook, metadatos });
                    }

                    const buffer = await workbook.xlsx.writeBuffer();
                    const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                    saveAs(blob, `${t(informeSeleccionado)}_${selectedYearsMulti}.xlsx`);
                    return;
                }

                if (informeSeleccionado === 'InfIndicadoresImpactoSeparado' && data.data) {
                    const workbook = new ExcelJS.Workbook();
                    const { obtenerNombreUnico } = crearGeneradorNombresUnicos();

                    const grupos = new Map<number, any[]>();
                    for (const item of data.data) {
                        const rid = Number(item.RegionId);
                        if (!grupos.has(rid)) grupos.set(rid, []);
                        grupos.get(rid)!.push(item);
                    }

                    for (const [regionId, items] of grupos.entries()) {
                        const region = regionesEnDropdow.find((r) => Number(r.RegionId) === regionId);
                        const regionName = region ? (i18n.language === 'eu' ? region.NameEu : region.NameEs) : `Región ${regionId}`;

                        const nombrePestana = obtenerNombreUnico(`${regionName}`);
                        const worksheet = workbook.addWorksheet(nombrePestana);

                        const metadatosRegion = {
                            nombreInforme: t(informeSeleccionado),
                            regiones: regionName,
                            fechaHora: new Date().toLocaleString(i18n.language === 'eu' ? 'eu-ES' : 'es-ES'),
                        };

                        const listadoCompleto = items[0].ListadoCompleto || [];

                        const datosConValores = items.flatMap((it) => (Array.isArray(it.Datos) ? it.Datos : Array.isArray(it.data) ? it.data : []));

                        if (listadoCompleto.length > 0) {
                            await generarInformeIndicadoresImpacto({ datosOriginales: listadoCompleto, datosConValores: datosConValores, t, worksheet, workbook, metadatos: metadatosRegion });
                        }
                    }

                    if (workbook.worksheets.length > 0) {
                        const buffer = await workbook.xlsx.writeBuffer();
                        const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
                        saveAs(blob, `${t(informeSeleccionado)}_${selectedYearsMulti}.xlsx`);
                    }

                    return;
                }

                if (informeSeleccionado === 'InfObjetivos' && selectedYearsMulti.length === 1) {
                    GenerarInformeObjetivos({
                        realizacion: data.response.indicadoresRealizacion,
                        resultado: data.response.indicadoresResultado,
                        servicios: data.response.indicadoresServicios,
                        ListadoNombresIdicadoresSegunADR,
                        t,
                        anioSeleccionado: selectedYearsMulti[0],
                    });
                }
                if (informeSeleccionado === 'InfAcciones' && selectedYearsMulti.length === 1) {
                    generarInformeAcciones(data.data, t, i18n, selectedYearsMulti[0], undefined, undefined, undefined, regionesEnDropdow);
                }
                if (informeSeleccionado === 'InfTratamientoComarcal' && selectedYearsMulti.length === 1) {
                    generarInformeTratamientoComarcal(data.data, t, selectedYearsMulti[0]);
                }
                if (informeSeleccionado === 'InfTratamientoComarcalSeparado' && selectedYearsMulti.length === 1) {
                    generarInformeTratamientoComarcalSeparado(data.data, t, selectedYearsMulti[0], regionesEnDropdow, i18n);
                }
                if (informeSeleccionado === 'InfPresupuestos' && selectedYearsMulti.length === 1) {
                    GenerarInformePrestamo({ resultados: data.data, t, anioSeleccionado: selectedYearsMulti[0] });
                }
                if (informeSeleccionado === 'InfIndicadoresImpacto' && selectedYearsMulti.length === 1) {
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
                                    anio: selectedYearsMulti[0],
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
                            saveAs(blob, `${t('InfIndicadoresImpacto')}_${selectedYearsMulti[0]}.xlsx`);
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
                <div className="flex flex-col items-center h-10 ">
                    <label className="w-[200px] text-center">{t('seleccionaAnio')}</label>
                    <Multiselect
                        placeholder={''}
                        options={yearOptions}
                        selectedValues={yearOptions.filter((o) => selectedYearsMulti.includes(o.value))}
                        displayValue="label"
                        onSelect={(selectedList) => setSelectedYearsMulti((selectedList as any[]).map((o) => o.value))}
                        onRemove={(selectedList) => setSelectedYearsMulti((selectedList as any[]).map((o) => o.value))}
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
                <SelectorInformes informeSeleccionado={informeSeleccionado} setInformeSeleccionado={setInformeSeleccionado} SeparadosComarcas={SeparadosComarcas} />
                {user && user.role === 'HAZI' && (
                    <div className="flex flex-col items-center h-10 ">
                        <label className="w-[200px] text-center">{t('informesSeparados')}</label>
                        <Checkbox className="mt-2" checked={SeparadosComarcas} title={t('informesSeparados')} onChange={(e) => setSeparadosComarcas(e.target.checked)} />
                    </div>
                )}
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

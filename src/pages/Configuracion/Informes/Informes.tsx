import { useTranslation } from 'react-i18next';
import { LoadingOverlayPersonalizada, ZonaTitulo } from '../Users/componentes';
import { SelectorAnio, SelectorInformes } from '../../../components/Utils/inputs';
import { useState } from 'react';
import Multiselect from 'multiselect-react-dropdown';
import { useRegionContext } from '../../../contexts/RegionContext';
import { RegionInterface } from '../../../components/Utils/data/getRegiones';
import { Boton } from '../../../components/Utils/utils';
import { LlamadasBBDD } from '../../../components/Utils/data/utilsData';
import { GenerarInformePrestamo } from './informePresupuesto';
import { GenerarInformeObjetivos } from './informeObjetivo';
import { useIndicadoresContext } from '../../../contexts/IndicadoresContext';
import { generarInformeAcciones } from './informeAcciones';
import { generarInformeTratamientoComarcal } from './InformesTratamientoComarcal';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';

export type Informes = 'InfObjetivos' | 'InfAcciones' | 'InfTratamientoComarcal' | 'InfPresupuestos';

export const tiposInformes: Informes[] = ['InfObjetivos', 'InfAcciones', 'InfTratamientoComarcal', 'InfPresupuestos'];

const Index = () => {
    const { t, i18n } = useTranslation();
    const { regiones } = useRegionContext();
    const { ListadoNombresIdicadoresSegunADR } = useIndicadoresContext();
    const { anios } = useEstadosPorAnio();

    const [loading, setLoading] = useState<boolean>(false);
    const [errorMessage, setErrorMessage] = useState<string>('');
    const [successMessage, setSuccessMessage] = useState<string>('');

    const [years] = useState<string[]>(['TODOS', ...anios.map(String)]);
    const [anioSeleccionado, setAnioSeleccionado] = useState<string>('TODOS');
    const [informeSeleccionado, setInformeSeleccionado] = useState<Informes>('InfObjetivos');
    const [regionesEnDropdow, setRegionesEnDropdow] = useState<RegionInterface[]>([]);
    const handleChangeRegionsSupracomarcal = (selected: RegionInterface[]) => {
        setRegionesEnDropdow(selected);
    };

    // const handlePruebas = () => {
    //     //TODO borrar
    //     const sessionData = sessionStorage.getItem('lastInformeData');
    //     const data = sessionData ? JSON.parse(sessionData) : null;
    //     generarInformeTratamientoComarcal(data.data, t);
    // };

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

        if (anioSeleccionado === 'TODOS') {
            try {
                setLoading(true);
                for (const y of anios.map(String)) {
                    const data = await callForYear(y);
                    if (!data) continue;
                    sessionStorage.setItem('lastInformeData', JSON.stringify(data));
                    if (informeSeleccionado === 'InfObjetivos') {
                        GenerarInformeObjetivos({
                            realizacion: data.response.indicadoresRealizacion,
                            resultado: data.response.indicadoresResultado,
                            servicios: data.response.indicadoresServicios,
                            ListadoNombresIdicadoresSegunADR,
                            t,
                            anioSeleccionado: y,
                        });
                    }
                    if (informeSeleccionado === 'InfAcciones') {
                        generarInformeAcciones(data.data, t, i18n, y);
                    }
                    if (informeSeleccionado === 'InfTratamientoComarcal') {
                        generarInformeTratamientoComarcal(data.data, t, y);
                    }
                    if (informeSeleccionado === 'InfPresupuestos') {
                        GenerarInformePrestamo({ resultados: data.data, t, anioSeleccionado: y });
                    }
                }
            } finally {
                setLoading(false);
            }
            return;
        }

        LlamadasBBDD({
            method: 'POST',
            url: `informes`,
            body: {
                AnioSeleccionado: [anioSeleccionado],
                InformeSeleccionado: informeSeleccionado,
                RegionesId: idRegionesSeleccionadas,
            },
            setLoading: setLoading ?? (() => {}),
            setErrorMessage: setErrorMessage,
            setSuccessMessage: setSuccessMessage,
            onSuccess: (data: any) => {
                sessionStorage.setItem('lastInformeData', JSON.stringify(data));
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
                    generarInformeAcciones(data.data, t, i18n, anioSeleccionado);
                }
                if (informeSeleccionado === 'InfTratamientoComarcal') {
                    generarInformeTratamientoComarcal(data.data, t, anioSeleccionado);
                }
                if (informeSeleccionado === 'InfPresupuestos') {
                    GenerarInformePrestamo({ resultados: data.data, t, anioSeleccionado });
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
                <div className="w-full resize-y ">
                    <label className="block mb-1">{t('seleccionaComarca')}</label>
                    <div className="flex flex-row gap-x-4 w-full">
                        {regionesEnDropdow.length === regiones.length ? (
                            <Boton tipo="cerrar" textoBoton={t('borrar')} onClick={() => setRegionesEnDropdow([])} />
                        ) : (
                            <Boton tipo="guardar" textoBoton={t('TODOS')} onClick={() => setRegionesEnDropdow(regiones)} />
                        )}
                        <div style={{ width: '100%' }}>
                            <Multiselect
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
                        <Boton tipo="guardar" textoBoton={t('descargar')} onClick={handleObtenerInforme} />
                        {/* <Boton tipo="guardar" textoBoton={t('descargar')} onClick={handlePruebas} /> */}
                    </div>
                </div>
            </div>
        </div>
    );
};
export default Index;

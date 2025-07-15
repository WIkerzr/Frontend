/* eslint-disable no-unused-vars */
import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { servicioIniciadoVacio, YearData, yearIniciado } from '../types/tipadoPlan';
import { DatosAccion, datosInicializadosAccion } from '../types/TipadoAccion';
import { useRegionContext } from './RegionContext';
import { Servicios } from '../types/GeneralTypes';

export type TiposAccion = 'Acciones' | 'AccionesAccesorias';
interface YearContextType {
    yearData: YearData;
    block: boolean;
    setYearData: (data: YearData) => void;
    datosEditandoAccion: DatosAccion;
    setDatosEditandoAccion: React.Dispatch<React.SetStateAction<DatosAccion>>;
    datosEditandoServicio: Servicios | null;
    setDatosEditandoServicio: React.Dispatch<React.SetStateAction<Servicios | null>>;
    SeleccionEditarServicio: (idServicio: string | null) => void;
    SeleccionEditarAccion: (idEjePrioritario: string, idAccion: string) => void;
    SeleccionEditarAccionAccesoria: (idAccion: string) => void;
    SeleccionVaciarEditarAccion: () => void;
    SeleccionEditarGuardar: () => void;
    SeleccionEditarGuardarAccesoria: () => void;
    GuardarEdicionServicio: () => void;
    AgregarAccion: (tipo: TiposAccion, idEje: string, nuevaAccion: string, nuevaLineaActuaccion: string, plurianual: boolean) => void;
}

const YearContext = createContext<YearContextType | undefined>(undefined);

export const RegionDataProvider = ({ children }: { children: ReactNode }) => {
    const { regionSeleccionada } = useRegionContext();
    const [idEjeEditado, setIdEjeEditado] = useState<string>('');
    const [yearData, setYearDataState] = useState<YearData>(() => {
        const stored = localStorage.getItem('datosAno');
        return stored ? JSON.parse(stored) : yearIniciado;
    });
    const setYearData = (data: YearData) => {
        setYearDataState(data);
    };

    const [datosEditandoAccion, setDatosEditandoAccion] = useState<DatosAccion>(() => {
        const stored = localStorage.getItem('datosAccionModificado');
        return JSON.parse(stored!);
    });

    useEffect(() => {
        localStorage.setItem('datosAno', JSON.stringify(yearData));
    }, [yearData]);

    useEffect(() => {
        localStorage.setItem('datosAccionModificado', JSON.stringify(datosEditandoAccion));
    }, [datosEditandoAccion]);

    const SeleccionEditarAccion = (idEjePrioritario: string, idAccion: string) => {
        setIdEjeEditado(idEjePrioritario);
        const ejeSeleccionado = yearData.plan.ejesPrioritarios.filter((eje) => idEjePrioritario.includes(eje.id));
        const accionSeleccionado = ejeSeleccionado[0].acciones.filter((accion) => idAccion.includes(accion.id));
        setDatosEditandoAccion(accionSeleccionado[0]);

        if (accionSeleccionado[0].accionCompartida && Array.isArray(accionSeleccionado[0].accionCompartida.regiones)) {
            const regionCompleta = accionSeleccionado[0].accionCompartida.regiones.find((r) => r.RegionId === regionSeleccionada);
            if (regionCompleta) {
                setBlock(true);
            }
        } else {
            setBlock(false);
        }
    };

    const SeleccionVaciarEditarAccion = () => {
        localStorage.removeItem('datosAccionModificado');
        setDatosEditandoAccion({
            id: '0',
            accion: '',
            ejeEs: '',
            ejeEu: '',
            lineaActuaccion: '',
            plurianual: false,
            datosPlan: {
                ejecutora: '',
                implicadas: '',
                comarcal: 'Sin tratamiento territorial comarcal',
                supracomarcal: 'Sin tratamiento territorial supracomarcal',
                rangoAnios: '',
                oAccion: '',
                ods: '',
                dAccion: '',
                presupuesto: '',
                iMujHom: '',
                uEuskera: '',
                sostenibilidad: '',
                dInteligent: '',
                observaciones: '',
            },
        });
    };

    const SeleccionEditarAccionAccesoria = (idAccion: string) => {
        const accionAccesoria = yearData.accionesAccesorias!.find((r) => r.id === idAccion);
        if (accionAccesoria) {
            setDatosEditandoAccion(accionAccesoria);
        }
    };

    const [datosEditandoServicio, setDatosEditandoServicio] = useState<Servicios | null>(() => {
        const stored = localStorage.getItem('datosEditandoServicio');
        return stored ? JSON.parse(stored) : null;
    });
    useEffect(() => {
        localStorage.setItem('datosEditandoServicio', JSON.stringify(datosEditandoServicio));
    }, [datosEditandoServicio]);

    const SeleccionEditarServicio = (idServicio: string | null) => {
        if (idServicio) {
            const servicioSeleccionado = yearData.servicios!.find((servicio) => `${servicio.id}` === idServicio);
            if (servicioSeleccionado) {
                setDatosEditandoServicio(servicioSeleccionado);
            }
        } else {
            setDatosEditandoServicio(servicioIniciadoVacio);
        }
    };

    const SeleccionEditarGuardar = () => {
        const nuevosEjes = yearData.plan.ejesPrioritarios.map((eje) => {
            if (eje.id !== idEjeEditado) {
                return eje;
            }

            const nuevasAcciones = eje.acciones.map((accion) => (accion.id === datosEditandoAccion.id ? datosEditandoAccion : accion));

            return {
                ...eje,
                acciones: nuevasAcciones,
            };
        });

        setYearDataState({
            ...yearData,
            plan: {
                ...yearData.plan,
                ejesPrioritarios: nuevosEjes,
            },
        });

        setIdEjeEditado('');
    };
    const SeleccionEditarGuardarAccesoria = () => {
        const accionEditada = yearData.accionesAccesorias!.map((accion) => (accion.id === datosEditandoAccion.id ? datosEditandoAccion : accion));

        setYearData({
            ...yearData,
            accionesAccesorias: accionEditada,
        });
    };

    const GuardarEdicionServicio = () => {
        if (!datosEditandoServicio) return;

        const nuevosServicios = yearData.servicios!.map((servicio) => (servicio.id === datosEditandoServicio.id ? datosEditandoServicio : servicio));

        setYearData({
            ...yearData,
            servicios: nuevosServicios,
        });
    };

    const AgregarAccion = (tipo: TiposAccion, idEje: string, nuevaAccion: string, nuevaLineaActuaccion: string, plurianual: boolean) => {
        const fuenteEjes = tipo === 'Acciones' ? yearData.plan.ejesPrioritarios : yearData.plan.ejes;
        const ejeSeleccionado = fuenteEjes.find((eje) => eje.id === idEje);
        if (!ejeSeleccionado) return;

        const datos = {
            ...datosInicializadosAccion,
            accion: nuevaAccion,
            ejeEs: ejeSeleccionado.nameEs,
            ejeEu: ejeSeleccionado.nameEu,
            lineaActuaccion: nuevaLineaActuaccion,
            plurianual,
        };

        if (tipo === 'Acciones') {
            const nuevosEjes = yearData.plan.ejesPrioritarios.map((eje) =>
                eje.id === idEje
                    ? {
                          ...eje,
                          acciones: [...eje.acciones, datos],
                      }
                    : eje
            );

            setYearData({
                ...yearData,
                plan: {
                    ...yearData.plan,
                    ejesPrioritarios: nuevosEjes,
                },
            });
        } else {
            setYearData({
                ...yearData,
                accionesAccesorias: [...(yearData.accionesAccesorias || []), datos],
            });
        }
    };

    const [block, setBlock] = useState<boolean>(false);

    return (
        <YearContext.Provider
            value={{
                yearData,
                block,
                setYearData,
                datosEditandoAccion,
                setDatosEditandoAccion,
                AgregarAccion,
                SeleccionEditarAccion,
                SeleccionEditarAccionAccesoria,
                SeleccionVaciarEditarAccion,
                SeleccionEditarGuardar,
                SeleccionEditarGuardarAccesoria,
                SeleccionEditarServicio,
                datosEditandoServicio,
                setDatosEditandoServicio,
                GuardarEdicionServicio,
            }}
        >
            {children}
        </YearContext.Provider>
    );
};

export const useYear = (): YearContextType => {
    const context = useContext(YearContext);
    if (!context) {
        throw new Error('');
    }
    return context;
};

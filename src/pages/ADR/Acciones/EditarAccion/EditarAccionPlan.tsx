import { forwardRef, useEffect, useState } from 'react';
import { useYear } from '../../../../contexts/DatosAnualContext';
import { DatosPlan } from '../../../../types/TipadoAccion';
import { DivInputFieldMulti, DropdownTraducido, InputField, TextArea } from '../../../../components/Utils/inputs';
import { opcionesComarcal, opcionesODS, opcionesSupraComarcal } from '../../../../types/GeneralTypes';
import Multiselect from 'multiselect-react-dropdown';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@mantine/core';
import { RegionInterface } from '../../../../components/Utils/data/getRegiones';
import { useEstadosPorAnio } from '../../../../contexts/EstadosPorAnioContext';
import { useRegionContext } from '../../../../contexts/RegionContext';

export const PestanaPlan = forwardRef<HTMLButtonElement>(() => {
    const { t, i18n } = useTranslation();
    const { regiones, regionActual } = useRegionContext();
    const { editarPlan } = useEstadosPorAnio();
    const { datosEditandoAccion, setDatosEditandoAccion, block } = useYear();
    const [bloqueo, setBloqueo] = useState<boolean>(block);
    const [regionesSupracomarcal, setRegionesSupracomarcal] = useState<boolean>(false);

    const opcionesComarcalES = t('object:opcionesComarcal', { returnObjects: true }) as string[];
    const opcionesSupraComarcalSegunIdioma = t('object:opcionesSupraComarcal', { returnObjects: true }) as string[];
    const opcionesODSEUSegunIdioma = t('object:opcionesODS', { returnObjects: true }) as string[];
    const [entidades, setEntidades] = useState<string[]>(datosEditandoAccion.datosPlan!.ejecutora ? datosEditandoAccion.datosPlan!.ejecutora.split('§') : []);
    const [dataMultiselect, setDataMultiselect] = useState<RegionInterface[]>();

    useEffect(() => {
        if (datosEditandoAccion.accionCompartida && datosEditandoAccion.accionCompartida.regionLider && Number(datosEditandoAccion.accionCompartida.regionLider.RegionId) > 0) {
            setRegionesSupracomarcal(true);
        }
        if (!editarPlan) {
            setBloqueo(true);
        } else {
            if (!block) {
                setBloqueo(false);
            }
        }
        const regionesPreselecionadasEnDropdow: RegionInterface[] = datosEditandoAccion.accionCompartida?.regiones ?? [];
        const regionesCompletadas = regionesPreselecionadasEnDropdow.map((r) => {
            const regionIdNormalizado = r.RegionId.padStart(2, '0');

            const regionCompleta = regiones.find((reg) => reg.RegionId.padStart(2, '0') === regionIdNormalizado);

            return {
                RegionId: regionIdNormalizado,
                NameEs: regionCompleta?.NameEs || '',
                NameEu: regionCompleta?.NameEu || '',
            };
        });

        setDataMultiselect(regionesCompletadas);
    }, []);

    useEffect(() => {
        if (!entidades || entidades.length == 0) return;
        const entidadesString = entidades.join('§');
        setDatosEditandoAccion({
            ...datosEditandoAccion,
            datosPlan: {
                ...datosEditandoAccion.datosPlan!,
                ejecutora: entidadesString || '',
            },
        });
    }, [entidades]);

    if (!datosEditandoAccion || !datosEditandoAccion.datosPlan) {
        return;
    }

    const handleNuevaEntidad = (entidad: string) => {
        if (!entidad) return;
        setEntidades((prev) => [...prev, entidad]);
    };

    const handleBorrarEntidad = (index: number) => {
        setEntidades((prev) => prev.filter((_, i) => i !== index));
    };

    const handleChangeCampos = (campo: keyof DatosPlan, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        let valor = e.target.value || '';

        if (campo === 'presupuesto') {
            valor = valor.replace(/[^0-9]/g, '');
        }

        setDatosEditandoAccion({
            ...datosEditandoAccion,
            datosPlan: {
                ...datosEditandoAccion.datosPlan!,
                [campo]: valor,
            },
        });
    };

    const handleChangeRangoAnio = (valor: string) => {
        let valorLimpio = valor.replace(/[^0-9]/g, '');

        if (valorLimpio.length > 8) {
            valorLimpio = valorLimpio.slice(0, 8);
        }
        let valorFormateado = valorLimpio;
        if (valorLimpio.length > 4) {
            valorFormateado = `${valorLimpio.slice(0, 4)}-${valorLimpio.slice(4)}`;
        }

        setDatosEditandoAccion({
            ...datosEditandoAccion,
            datosPlan: {
                ...datosEditandoAccion.datosPlan!,
                rangoAnios: valorFormateado,
            },
        });
    };

    const validarRangoAnios = () => {
        const rangoActual = datosEditandoAccion.datosPlan?.rangoAnios || '';

        if (!rangoActual || rangoActual === '-' || rangoActual === '') {
            return;
        }

        const partes = rangoActual.split('-');
        const anioInicio = partes[0] || '';
        const anioFin = partes[1] || '';

        if (anioInicio.length !== 4 || anioFin.length !== 4) {
            setDatosEditandoAccion({
                ...datosEditandoAccion,
                datosPlan: {
                    ...datosEditandoAccion.datosPlan!,
                    rangoAnios: '',
                },
            });
            return;
        }

        const anioInicioNum = parseInt(anioInicio);
        const anioFinNum = parseInt(anioFin);

        if (anioInicioNum <= 2020 || anioFinNum <= 2020) {
            setDatosEditandoAccion({
                ...datosEditandoAccion,
                datosPlan: {
                    ...datosEditandoAccion.datosPlan!,
                    rangoAnios: '',
                },
            });
            return;
        }

        if (anioFinNum <= anioInicioNum) {
            setDatosEditandoAccion({
                ...datosEditandoAccion,
                datosPlan: {
                    ...datosEditandoAccion.datosPlan!,
                    rangoAnios: '',
                },
            });
            return;
        }
    };

    const handleChangeCheckboxSupracomarcal = (supracomarcal: boolean) => {
        if (supracomarcal) {
            if (!regionActual || (typeof regionActual === 'object' && Object.keys(regionActual).length === 0)) {
                alert(t('error:errorFaltaRegionLider'));
                return;
            }
            setDatosEditandoAccion({
                ...datosEditandoAccion,
                accionCompartida: {
                    idCompartida: datosEditandoAccion.accionCompartidaid,
                    regionLider: {
                        id: regionActual.RegionId,
                        RegionId: regionActual.RegionId,
                        NameEs: '',
                        NameEu: '',
                    },
                    regiones: [],
                },
            });
        } else {
            setDatosEditandoAccion({
                ...datosEditandoAccion,
                accionCompartida: undefined,
            });
        }
        setRegionesSupracomarcal(supracomarcal);
    };

    // const handleChangeRegionsSupracomarcal = (selected: RegionInterface[]) => {
    //     if (!regionActual || (typeof regionActual === 'object' && Object.keys(regionActual).length === 0)) {
    //         alert(t('error:errorFaltaRegionLider'));
    //         return;
    //     }
    //     setDatosEditandoAccion({
    //         ...datosEditandoAccion,
    //         accionCompartida: {
    //             regionLider: regionActual,
    //             regiones: selected,
    //         },
    //     });
    // };

    const handleChangeRegionsSupracomarcal = (selectedList: RegionInterface[]) => {
        setDataMultiselect(selectedList);

        setDatosEditandoAccion({
            ...datosEditandoAccion,
            accionCompartida: {
                regionLider: {
                    RegionId: regionActual?.RegionId ?? '0',
                    NameEs: '',
                    NameEu: '',
                },
                regiones: selectedList,
            },
        });
    };
    const opcionesComarcalSinOtros = opcionesComarcal.filter((op) => op !== 'Otros');
    const opcionesSupraComarcalSinOtros = opcionesSupraComarcal.filter((op) => op !== 'Otros');

    const opcionesRegionesMultiselect = regiones?.filter((r) => r.RegionId !== (regionActual?.RegionId ?? '')) ?? [];
    return (
        <div className="p-5 flex flex-col gap-4 w-full">
            <div className="flex gap-4 panel flex-col">
                <div className="flex gap-4">
                    <DivInputFieldMulti nombreInput="ejecutora" required disabled={bloqueo} camposTextos={entidades} handleBorrar={handleBorrarEntidad} handleNueva={handleNuevaEntidad} />
                    <InputField nombreInput="implicadas" required disabled={bloqueo} value={datosEditandoAccion.datosPlan.implicadas} onChange={(e) => handleChangeCampos('implicadas', e)} />
                    {datosEditandoAccion.plurianual && (
                        <div className="flex-1 flex flex-col">
                            <label className="text-sm font-medium mb-2">
                                {t('rangoAnios')} <span className="text-red-500">*</span>
                            </label>
                            <input
                                type="text"
                                className="form-input"
                                disabled={bloqueo}
                                maxLength={9}
                                value={datosEditandoAccion.datosPlan.rangoAnios || ''}
                                onChange={(e) => handleChangeRangoAnio(e.target.value)}
                                onBlur={validarRangoAnios}
                            />
                        </div>
                    )}
                </div>
                <div className="flex gap-4">
                    <DropdownTraducido
                        title={'tratamientoComarcal'}
                        disabled={bloqueo}
                        value={opcionesComarcalSinOtros.includes(datosEditandoAccion.datosPlan?.comarcal) ? datosEditandoAccion.datosPlan?.comarcal : 'Otros'}
                        options={opcionesComarcal}
                        visualOptions={opcionesComarcalES}
                        onChange={(e) => handleChangeCampos('comarcal', e)}
                    />
                    {!opcionesComarcalSinOtros.includes(datosEditandoAccion.datosPlan?.comarcal || '') && (
                        <InputField nombreInput="tratamientoComarcal" required disabled={bloqueo} value={datosEditandoAccion.datosPlan.comarcal} onChange={(e) => handleChangeCampos('comarcal', e)} />
                    )}

                    <div className="flex flex-col items-center">
                        <label>{t('esSupracomarcal')}</label>
                        <Checkbox checked={regionesSupracomarcal} disabled={bloqueo} onChange={(e) => handleChangeCheckboxSupracomarcal(e.target.checked)} />
                    </div>
                </div>
                {regionesSupracomarcal && (
                    <div className="w-full resize-y">
                        <div className="flex gap-4">
                            <DropdownTraducido
                                title={'supracomarcal'}
                                disabled={bloqueo}
                                value={
                                    regionesSupracomarcal
                                        ? opcionesSupraComarcalSinOtros.includes(datosEditandoAccion.datosPlan?.supracomarcal)
                                            ? datosEditandoAccion.datosPlan?.supracomarcal
                                            : 'Otros'
                                        : `${t('sinOpcionesSupraComarcal')}`
                                }
                                options={opcionesSupraComarcal}
                                visualOptions={opcionesSupraComarcalSegunIdioma}
                                onChange={(e) => handleChangeCampos('supracomarcal', e)}
                            />
                            {!opcionesSupraComarcalSinOtros.includes(datosEditandoAccion.datosPlan?.supracomarcal || '') && (
                                <InputField
                                    nombreInput="supracomarcal"
                                    required
                                    disabled={bloqueo}
                                    value={datosEditandoAccion.datosPlan.supracomarcal != 'Otros' ? datosEditandoAccion.datosPlan.supracomarcal : ''}
                                    onChange={(e) => handleChangeCampos('supracomarcal', e)}
                                />
                            )}
                        </div>
                        <label>{t('comarcasIncluidasSupracomarcal')} </label>
                        <Multiselect
                            placeholder={t('seleccionaMultiOpcion')}
                            options={opcionesRegionesMultiselect}
                            selectedValues={dataMultiselect}
                            displayValue={i18n.language === 'eu' ? 'NameEu' : 'NameEs'}
                            onSelect={handleChangeRegionsSupracomarcal}
                            onRemove={handleChangeRegionsSupracomarcal}
                            emptyRecordMsg={t('error:errorNoOpciones')}
                            disable={bloqueo}
                        />
                    </div>
                )}
            </div>
            <div className="flex-1"></div>
            <div className="flex gap-4 panel">
                <TextArea required nombreInput="oAccion" className={'h-[38px]'} disabled={bloqueo} value={datosEditandoAccion.datosPlan.oAccion} onChange={(e) => handleChangeCampos('oAccion', e)} />
                <DropdownTraducido
                    title={'ods'}
                    disabled={bloqueo}
                    value={datosEditandoAccion.datosPlan.ods}
                    options={opcionesODS}
                    visualOptions={opcionesODSEUSegunIdioma}
                    onChange={(e) => handleChangeCampos('ods', e)}
                    mostrarSeleccionaopcion
                />
            </div>

            <div className="panel">
                <TextArea required nombreInput="dAccion" className={'h-[114px]'} disabled={bloqueo} value={datosEditandoAccion.datosPlan.dAccion} onChange={(e) => handleChangeCampos('dAccion', e)} />
            </div>

            <div className="panel">
                <TextArea
                    nombreInput="presupuesto"
                    className={'h-[38px]'}
                    disabled={bloqueo}
                    value={datosEditandoAccion.datosPlan.presupuesto}
                    onChange={(e) => handleChangeCampos('presupuesto', e)}
                />
            </div>

            <div className="panel">
                <div className="flex gap-4">
                    <TextArea nombreInput="iMujHom" className={'h-[76px]'} disabled={bloqueo} value={datosEditandoAccion.datosPlan.iMujHom} onChange={(e) => handleChangeCampos('iMujHom', e)} />
                    <TextArea nombreInput="uEuskera" className={'h-[76px]'} disabled={bloqueo} value={datosEditandoAccion.datosPlan.uEuskera} onChange={(e) => handleChangeCampos('uEuskera', e)} />
                </div>
                <div className="flex gap-4 ">
                    <TextArea
                        nombreInput="sostenibilidad"
                        className={'h-[76px]'}
                        disabled={bloqueo}
                        value={datosEditandoAccion.datosPlan.sostenibilidad}
                        onChange={(e) => handleChangeCampos('sostenibilidad', e)}
                    />
                    <TextArea
                        nombreInput="dInteligent"
                        className={'h-[76px]'}
                        disabled={bloqueo}
                        value={datosEditandoAccion.datosPlan.dInteligent}
                        onChange={(e) => handleChangeCampos('dInteligent', e)}
                    />
                </div>
            </div>

            <div className="panel">
                <TextArea
                    nombreInput="observaciones"
                    className={'h-[38px]'}
                    disabled={bloqueo}
                    value={datosEditandoAccion.datosPlan.observaciones}
                    onChange={(e) => handleChangeCampos('observaciones', e)}
                />
            </div>
        </div>
    );
});

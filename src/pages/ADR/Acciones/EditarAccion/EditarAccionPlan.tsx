import { forwardRef, useEffect, useState } from 'react';
import { useYear } from '../../../../contexts/DatosAnualContext';
import { DatosPlan } from '../../../../types/TipadoAccion';
import { DropdownTraducido, InputField, TextArea } from '../../../../components/Utils/inputs';
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

    if (!datosEditandoAccion || !datosEditandoAccion.datosPlan) {
        return;
    }

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
    }, []);

    const handleChangeCampos = (campo: keyof DatosPlan, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDatosEditandoAccion({
            ...datosEditandoAccion,
            datosPlan: {
                ...datosEditandoAccion.datosPlan!,
                [campo]: e.target.value || '',
            },
        });
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
                    regionLider: regionActual,
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

    const handleChangeRegionsSupracomarcal = (selected: RegionInterface[]) => {
        if (!regionActual || (typeof regionActual === 'object' && Object.keys(regionActual).length === 0)) {
            alert(t('error:errorFaltaRegionLider'));
            return;
        }
        setDatosEditandoAccion({
            ...datosEditandoAccion,
            accionCompartida: {
                regionLider: regionActual,
                regiones: selected,
            },
        });
    };

    const regionesEnDropdow = regiones.map((region) => ({
        id: region.RegionId,
        NameEs: region.NameEs,
        NameEu: region.NameEu,
    }));

    const regionesPreselecionadasEnDropdow = datosEditandoAccion.accionCompartida?.regiones.map((region) => ({
        id: region.RegionId,
        NameEs: region.NameEs,
        NameEu: region.NameEu,
    }));
    const opcionesComarcalSinOtros = opcionesComarcal.filter((op) => op !== 'Otros');
    const opcionesSupraComarcalSinOtros = opcionesSupraComarcal.filter((op) => op !== 'Otros');
    return (
        <div className="p-5 flex flex-col gap-4 w-full">
            <div className="flex gap-4 panel flex-col">
                <div className="flex gap-4">
                    <InputField nombreInput="ejecutora" required disabled={bloqueo} value={datosEditandoAccion.datosPlan.ejecutora} onChange={(e) => handleChangeCampos('ejecutora', e)} />
                    <InputField nombreInput="implicadas" required disabled={bloqueo} value={datosEditandoAccion.datosPlan.implicadas} onChange={(e) => handleChangeCampos('implicadas', e)} />
                    {datosEditandoAccion.plurianual && (
                        <InputField nombreInput="rangoAnios" required disabled={bloqueo} value={datosEditandoAccion.datosPlan.rangoAnios} onChange={(e) => handleChangeCampos('rangoAnios', e)} />
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
                    <DropdownTraducido
                        title={'supracomarcal'}
                        disabled={bloqueo}
                        value={opcionesSupraComarcalSinOtros.includes(datosEditandoAccion.datosPlan?.supracomarcal) ? datosEditandoAccion.datosPlan?.supracomarcal : 'Otros'}
                        options={opcionesSupraComarcal}
                        visualOptions={opcionesSupraComarcalSegunIdioma}
                        onChange={(e) => handleChangeCampos('supracomarcal', e)}
                    />
                    {!opcionesSupraComarcalSinOtros.includes(datosEditandoAccion.datosPlan?.supracomarcal || '') && (
                        <InputField
                            nombreInput="supracomarcal"
                            required
                            disabled={bloqueo}
                            value={datosEditandoAccion.datosPlan.supracomarcal}
                            onChange={(e) => handleChangeCampos('supracomarcal', e)}
                        />
                    )}
                    <div className="flex flex-col items-center">
                        <label>{t('esSupracomarcal')}</label>
                        <Checkbox checked={regionesSupracomarcal} disabled={bloqueo} onChange={(e) => handleChangeCheckboxSupracomarcal(e.target.checked)} />
                    </div>
                </div>
                {regionesSupracomarcal && (
                    <div className="w-full resize-y">
                        <label>{t('comarcasIncluidasSupracomarcal')} </label>
                        <Multiselect
                            placeholder={t('seleccionaMultiOpcion')}
                            options={regionesEnDropdow}
                            selectedValues={regionesPreselecionadasEnDropdow}
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

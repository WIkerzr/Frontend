import { forwardRef, useEffect, useState } from 'react';
import { useYear } from '../../../contexts/DatosAnualContext';
import { DatosPlan } from '../../../types/TipadoAccion';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { InputField, SimpleDropdown, TextArea } from '../../../components/Utils/inputs';
import { opcionesComarcal, opcionesSupraComarcal } from '../../../types/GeneralTypes';
import Multiselect from 'multiselect-react-dropdown';
import { useRegionContext } from '../../../contexts/RegionContext';
import { useTranslation } from 'react-i18next';
import { Checkbox } from '@mantine/core';
import { Region } from '../../../components/Utils/gets/getRegiones';

export const PestanaPlan = forwardRef<HTMLButtonElement>(() => {
    const { t, i18n } = useTranslation();
    const { regiones, regionActual } = useRegionContext();
    const { planState } = useEstadosPorAnio();
    const { datosEditandoAccion, setDatosEditandoAccion, block } = useYear();
    const [planDesabilitado] = useState<boolean>(planState != 'borrador');
    const [bloqueo] = useState<boolean>(block ? block : planDesabilitado);
    const [regionesSupracomarcal, setRegionesSupracomarcal] = useState<boolean>(false);

    if (!datosEditandoAccion || !datosEditandoAccion.datosPlan) {
        return;
    }

    useEffect(() => {
        if (datosEditandoAccion.accionCompartida && datosEditandoAccion.accionCompartida.regionLider && datosEditandoAccion.accionCompartida.regionLider.RegionId > 0) {
            setRegionesSupracomarcal(true);
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

    const handleChangeRegionsSupracomarcal = (selected: Region[]) => {
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

    return (
        <div className="p-5 flex flex-col gap-4 w-full">
            <div className="flex gap-4 panel flex-col">
                <div className="flex gap-4">
                    <InputField nombreInput="ejecutora" required disabled={bloqueo} value={datosEditandoAccion.datosPlan.ejecutora} onChange={(e) => handleChangeCampos('ejecutora', e)} />
                    <InputField nombreInput="implicadas" required disabled={bloqueo} value={datosEditandoAccion.datosPlan.implicadas} onChange={(e) => handleChangeCampos('implicadas', e)} />
                    <SimpleDropdown title={'comarcal'} disabled={bloqueo} value={datosEditandoAccion.datosPlan?.comarcal} options={opcionesComarcal} />
                    <SimpleDropdown title={'supracomarcal'} disabled={bloqueo} value={datosEditandoAccion.datosPlan?.supracomarcal} options={opcionesSupraComarcal} />

                    {datosEditandoAccion.plurianual && (
                        <InputField nombreInput="rangoAnios" required disabled={bloqueo} value={datosEditandoAccion.datosPlan.rangoAnios} onChange={(e) => handleChangeCampos('rangoAnios', e)} />
                    )}
                    <div className="flex-1">
                        <label>{t('esSupracomarcal')}</label>
                        <Checkbox checked={regionesSupracomarcal} onChange={(e) => handleChangeCheckboxSupracomarcal(e.target.checked)} />
                    </div>
                </div>
                {regionesSupracomarcal && (
                    <div className="w-full resize-y">
                        <label>{t('regionesIncluidasSupracomarcal')} </label>
                        <Multiselect
                            placeholder={t('seleccionaMultiOpcion')}
                            options={regionesEnDropdow}
                            selectedValues={regionesPreselecionadasEnDropdow}
                            displayValue={i18n.language === 'eu' ? 'NameEu' : 'NameEs'}
                            onSelect={handleChangeRegionsSupracomarcal}
                            onRemove={handleChangeRegionsSupracomarcal}
                            emptyRecordMsg={t('error:errorNoOpciones')}
                        />
                    </div>
                )}
            </div>
            <div className="flex-1"></div>
            <div className="flex gap-4 panel">
                <TextArea required nombreInput="oAccion" className={'h-[38px]'} disabled={bloqueo} value={datosEditandoAccion.datosPlan.oAccion} onChange={(e) => handleChangeCampos('oAccion', e)} />
                <TextArea required nombreInput="ods" className={'h-[38px]'} disabled={bloqueo} value={datosEditandoAccion.datosPlan.ods} onChange={(e) => handleChangeCampos('ods', e)} />
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

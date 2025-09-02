import { forwardRef, useEffect, useState } from 'react';
import { CustomSelect } from './EditarAccionComponent';
import { useTranslation } from 'react-i18next';
import { DatosMemoria, EstadoLabel, FuenteFinanciacion } from '../../../../types/TipadoAccion';
import { useYear } from '../../../../contexts/DatosAnualContext';
import Select, { MultiValue } from 'react-select';
import { TextArea } from '../../../../components/Utils/inputs';
import { useEstadosPorAnio } from '../../../../contexts/EstadosPorAnioContext';

export const PestanaMemoria = forwardRef<HTMLButtonElement>(() => {
    const { t } = useTranslation();

    const { datosEditandoAccion, setDatosEditandoAccion, block } = useYear();
    const { editarMemoria } = useEstadosPorAnio();
    const [bloqueo, setBloqueo] = useState<boolean>(block);

    if (!datosEditandoAccion || !datosEditandoAccion.datosMemoria) {
        return;
    }

    useEffect(() => {
        if (!editarMemoria) {
            setBloqueo(true);
        } else {
            if (!block) {
                setBloqueo(false);
            }
        }
    }, []);

    const FuentesFinanciacionTraduciones = t('object:fuentesFinanciacion', { returnObjects: true }) as string[];

    const Fuentes_Financiacion = [
        { label: FuentesFinanciacionTraduciones[0], value: 'Gobierno Vasco' },
        { label: FuentesFinanciacionTraduciones[1], value: 'DDFF' },
        { label: FuentesFinanciacionTraduciones[2], value: 'Administraciones locales' },
        { label: FuentesFinanciacionTraduciones[3], value: 'Fuentes Privadas' },
        { label: FuentesFinanciacionTraduciones[4], value: 'Autofinanciación' },
        { label: FuentesFinanciacionTraduciones[5], value: 'Otros' },
    ] satisfies { label: string; value: FuenteFinanciacion }[];

    const handleChangeCampos = (campo: keyof DatosMemoria, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDatosEditandoAccion({
            ...datosEditandoAccion,
            datosMemoria: {
                ...datosEditandoAccion.datosMemoria!,
                [campo]: e.target.value || '',
            },
        });
    };

    const handlePresupuestoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDatosEditandoAccion({
            ...datosEditandoAccion,
            datosMemoria: {
                ...datosEditandoAccion.datosMemoria!,
                presupuestoEjecutado: {
                    ...datosEditandoAccion.datosMemoria!.presupuestoEjecutado!,
                    [name]: value || '',
                },
            },
        });
    };

    const handleFuentesFinanciacionChange = (selected: MultiValue<{ label: string; value: FuenteFinanciacion }>) => {
        const valores: FuenteFinanciacion[] = selected.map((op) => op.value);

        setDatosEditandoAccion({
            ...datosEditandoAccion,
            datosMemoria: {
                ...datosEditandoAccion.datosMemoria!,
                presupuestoEjecutado: {
                    ...datosEditandoAccion.datosMemoria!.presupuestoEjecutado!,
                    fuenteDeFinanciacion: valores,
                },
            },
        });
    };

    const handleEjecucionChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setDatosEditandoAccion({
            ...datosEditandoAccion,
            datosMemoria: {
                ...datosEditandoAccion.datosMemoria!,
                ejecucionPresupuestaria: {
                    ...datosEditandoAccion.datosMemoria!.ejecucionPresupuestaria!,
                    [name]: value || '',
                },
            },
        });
    };

    const handleSituacionActual = (value: EstadoLabel) => {
        setDatosEditandoAccion({
            ...datosEditandoAccion,
            datosMemoria: {
                ...datosEditandoAccion.datosMemoria!,
                sActual: value,
            },
        });
    };

    return (
        <div className="p-5 flex flex-col gap-4 w-full">
            <div className="flex gap-4 panel">
                <div className="flex-1">
                    <label htmlFor="sActual">*{t('sActual')}</label>
                    <CustomSelect disabled={bloqueo} value={datosEditandoAccion.datosMemoria.sActual} onChange={handleSituacionActual} />
                </div>
            </div>

            {/* <div className="flex gap-4 panel">
                <TextArea nombreInput="oAccion" required className={'h-[114px]'} disabled={bloqueo} value={datosEditandoAccion.datosMemoria.oAccion} onChange={(e) => handleChangeCampos('oAccion', e)} />
                <InputField nombreInput="ods" required disabled={bloqueo} value={datosEditandoAccion.datosMemoria.ods} onChange={(e) => handleChangeCampos('ods', e)} />
            </div> */}

            {/* <div className="panel">
                <TextArea
                    nombreInput="dAccionAvances"
                    required
                    className={'h-[114px]'}
                    disabled={bloqueo}
                    value={datosEditandoAccion.datosMemoria.dAccionAvances}
                    onChange={(e) => handleChangeCampos('dAccionAvances', e)}
                />
            </div> */}

            <div className="panel">
                <label htmlFor="presupuestoEjecutado" className="block font-medium mb-1">
                    *{t('presupuestoEjecutado')}
                </label>
                <table id="presupuestoEjecutado" className="min-w-full border rounded overflow-hidden panel">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-center font-semibold">{t('cuantia')}</th>
                            <th className="px-4 py-2 text-center font-semibold">{t('autofinanciación')}</th>
                            <th className="px-4 py-2 text-center font-semibold">{t('observaciones')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-4 py-2">
                                <input
                                    type="number"
                                    disabled={bloqueo}
                                    className="w-full border rounded px-2 py-1 h-[38px]"
                                    name="cuantia"
                                    value={datosEditandoAccion.datosMemoria.presupuestoEjecutado?.cuantia}
                                    onChange={handlePresupuestoChange}
                                />
                            </td>
                            <td className="px-5 py-2">
                                <Select
                                    placeholder={t('seleccionaopcion')}
                                    options={Fuentes_Financiacion}
                                    isDisabled={bloqueo}
                                    isMulti
                                    isSearchable={false}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    onChange={handleFuentesFinanciacionChange}
                                    value={Fuentes_Financiacion.filter((opt) => datosEditandoAccion.datosMemoria?.presupuestoEjecutado?.fuenteDeFinanciacion?.includes(opt.value))}
                                />
                            </td>
                            <td className="px-5 py-2">
                                <textarea
                                    className="w-full border rounded px-2 py-1 h-[38px] align-middle"
                                    name="observaciones"
                                    disabled={bloqueo}
                                    value={datosEditandoAccion.datosMemoria.presupuestoEjecutado?.observaciones}
                                    onChange={handlePresupuestoChange}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="panel w-1/2">
                <label htmlFor="ejecucionPresupuestaria" className="block font-medium mb-1">
                    *Ejecución presupuestaria
                </label>
                <table id="ejecucionPresupuestaria" className="min-w-full border rounded overflow-hidden panel">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-center font-semibold">{t('presuPrevisto')}</th>
                            <th className="px-4 py-2 text-center font-semibold">{t('presuEjecutado')}</th>
                            <th className="px-4 py-2 text-center font-semibold">{t('porcentEjecutado')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-4 py-2">
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1 h-[38px]"
                                    name="previsto"
                                    disabled={bloqueo}
                                    value={datosEditandoAccion.datosMemoria.ejecucionPresupuestaria?.previsto}
                                    onChange={handleEjecucionChange}
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1 h-[38px]"
                                    name="ejecutado"
                                    disabled={bloqueo}
                                    value={datosEditandoAccion.datosMemoria.ejecucionPresupuestaria?.ejecutado}
                                    onChange={handleEjecucionChange}
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1 h-[38px]"
                                    name="porcentaje"
                                    disabled={bloqueo}
                                    value={datosEditandoAccion.datosMemoria.ejecucionPresupuestaria?.porcentaje}
                                    onChange={handleEjecucionChange}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            {/* <div className="panel">
                <div className="flex gap-4">
                    <TextArea nombreInput="iMujHom" className={'h-[76px]'} disabled={bloqueo} value={datosEditandoAccion.datosMemoria.iMujHom} onChange={(e) => handleChangeCampos('iMujHom', e)} />
                    <TextArea nombreInput="uEuskera" className={'h-[76px]'} disabled={bloqueo} value={datosEditandoAccion.datosMemoria.uEuskera} onChange={(e) => handleChangeCampos('uEuskera', e)} />
                </div>
                <div className="flex gap-4">
                    <TextArea
                        nombreInput="sostenibilidad"
                        className={'h-[76px]'}
                        disabled={bloqueo}
                        value={datosEditandoAccion.datosMemoria.sostenibilidad}
                        onChange={(e) => handleChangeCampos('sostenibilidad', e)}
                    />
                    <TextArea
                        nombreInput="dInteligent"
                        className={'h-[76px]'}
                        disabled={bloqueo}
                        value={datosEditandoAccion.datosMemoria.dInteligent}
                        onChange={(e) => handleChangeCampos('dInteligent', e)}
                    />
                </div>
            </div> */}

            <div className=" panel">
                <TextArea
                    nombreInput="observaciones"
                    className={'h-[76px]'}
                    disabled={bloqueo}
                    value={datosEditandoAccion.datosMemoria.observaciones}
                    onChange={(e) => handleChangeCampos('observaciones', e)}
                />
            </div>

            <div className="flex gap-4 panel">
                <TextArea
                    nombreInput="dSeguimiento"
                    className={'h-[76px]'}
                    disabled={bloqueo}
                    value={datosEditandoAccion.datosMemoria.dSeguimiento}
                    onChange={(e) => handleChangeCampos('dSeguimiento', e)}
                />
            </div>

            <div className="flex gap-4 panel">
                <TextArea nombreInput="valFinal" className={'h-[76px]'} disabled={bloqueo} value={datosEditandoAccion.datosMemoria.valFinal} onChange={(e) => handleChangeCampos('valFinal', e)} />
            </div>
        </div>
    );
});

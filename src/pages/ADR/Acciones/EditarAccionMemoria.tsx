import { forwardRef } from 'react';
import { CustomSelect } from './EditarAccionComponent';
import { useTranslation } from 'react-i18next';
import { DatosMemoria, EstadoLabel, FuenteFinanciacion } from '../../../types/TipadoAccion';
import { useYear } from '../../../contexts/DatosAnualContext';
import Select, { MultiValue } from 'react-select';

export const PestanaMemoria = forwardRef<HTMLButtonElement>(() => {
    const { t } = useTranslation();

    const { datosEditandoAccion, setDatosEditandoAccion } = useYear();
    if (!datosEditandoAccion || !datosEditandoAccion.datosMemoria) {
        return;
    }

    const Fuentes_Financiacion = [
        { label: 'Gobierno Vasco', value: 'Gobierno Vasco' },
        { label: 'DDFF', value: 'DDFF' },
        { label: 'Administraciones locales', value: 'Administraciones locales' },
        { label: 'Fuentes Privadas', value: 'Fuentes Privadas' },
        { label: 'Autofinanciación', value: 'Autofinanciación' },
        { label: 'Otros', value: 'Otros' },
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
        console.log(datosEditandoAccion);
    };

    return (
        <div className="p-5 flex flex-col gap-4 w-full">
            <div className="flex gap-4 panel">
                <div className="flex-1">
                    <label htmlFor="sActual">*{t('sActual')}</label>
                    <CustomSelect value={datosEditandoAccion.datosMemoria.sActual} onChange={handleSituacionActual} />
                </div>
            </div>

            <div className="flex gap-4 panel">
                <div className="flex-1">
                    <label htmlFor="oAccion">*{t('oAccion')}</label>
                    <textarea
                        id="oAccion"
                        name="oAccion"
                        className="w-full border rounded p-2 h-[38px] resize-y"
                        value={datosEditandoAccion.datosMemoria.oAccion}
                        onChange={(e) => handleChangeCampos('oAccion', e)}
                    />
                </div>
                <div className="flex-1">
                    <label htmlFor="ods">*{t('ods')}</label>
                    <textarea id="ods" name="ods" className="w-full border rounded p-2 h-[38px] resize-y" value={datosEditandoAccion.datosMemoria.ods} onChange={(e) => handleChangeCampos('ods', e)} />
                </div>
            </div>

            <div className="panel">
                <label htmlFor="dAccionAvances">*{t('dAccionAvances')}</label>
                <textarea
                    id="dAccionAvances"
                    name="dAccionAvances"
                    className="w-full border rounded p-2 h-[114px] resize-y"
                    value={datosEditandoAccion.datosMemoria.dAccionAvances}
                    onChange={(e) => handleChangeCampos('dAccionAvances', e)}
                />
            </div>

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
                                    className="w-full border rounded px-2 py-1 h-[38px]"
                                    name="cuantia"
                                    value={datosEditandoAccion.datosMemoria.presupuestoEjecutado.cuantia}
                                    onChange={handlePresupuestoChange}
                                />
                            </td>
                            <td className="px-5 py-2">
                                <textarea
                                    className="w-full border rounded px-2 py-1 h-[38px] align-middle"
                                    name="origenPublica"
                                    value={datosEditandoAccion.datosMemoria.presupuestoEjecutado.fuenteDeFinanciacion}
                                    onChange={handlePresupuestoChange}
                                />
                            </td>
                            <td className="px-5 py-2">
                                <Select
                                    placeholder="Select an option"
                                    options={Fuentes_Financiacion}
                                    isMulti
                                    isSearchable={false}
                                    menuPortalTarget={document.body}
                                    styles={{ menuPortal: (base) => ({ ...base, zIndex: 9999 }) }}
                                    onChange={handleFuentesFinanciacionChange}
                                    value={Fuentes_Financiacion.filter((opt) => datosEditandoAccion.datosMemoria?.presupuestoEjecutado?.fuenteDeFinanciacion?.includes(opt.value))}
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
                                    value={datosEditandoAccion.datosMemoria.ejecucionPresupuestaria.previsto}
                                    onChange={handleEjecucionChange}
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1 h-[38px]"
                                    name="ejecutado"
                                    value={datosEditandoAccion.datosMemoria.ejecucionPresupuestaria.ejecutado}
                                    onChange={handleEjecucionChange}
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1 h-[38px]"
                                    name="porcentaje"
                                    value={datosEditandoAccion.datosMemoria.ejecucionPresupuestaria.porcentaje}
                                    onChange={handleEjecucionChange}
                                />
                            </td>
                        </tr>
                    </tbody>
                </table>
            </div>

            <div className="panel">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label htmlFor="iMujHom">{t('iMujHom')}</label>
                        <textarea
                            id="iMujHom"
                            name="iMujHom"
                            className="w-full border rounded p-2 h-[76px] resize-y"
                            value={datosEditandoAccion.datosMemoria.iMujHom}
                            onChange={(e) => handleChangeCampos('iMujHom', e)}
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="uEuskera">{t('uEuskera')}</label>
                        <textarea
                            id="uEuskera"
                            name="uEuskera"
                            className="w-full border rounded p-2 h-[76px] resize-y"
                            value={datosEditandoAccion.datosMemoria.uEuskera}
                            onChange={(e) => handleChangeCampos('uEuskera', e)}
                        />
                    </div>
                </div>
                <div className="flex gap-4 ">
                    <div className="flex-1">
                        <label htmlFor="sostenibilidad">{t('sostenibilidad')}</label>
                        <textarea
                            id="sostenibilidad"
                            name="sostenibilidad"
                            className="w-full border rounded p-2 h-[76px] resize-y"
                            value={datosEditandoAccion.datosMemoria.sostenibilidad}
                            onChange={(e) => handleChangeCampos('sostenibilidad', e)}
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="dInteligent">{t('dInteligent')}</label>
                        <textarea
                            id="dInteligent"
                            name="dInteligent"
                            className="w-full border rounded p-2 h-[76px] resize-y"
                            value={datosEditandoAccion.datosMemoria.dInteligent}
                            onChange={(e) => handleChangeCampos('dInteligent', e)}
                        />
                    </div>
                </div>
            </div>

            <div className=" panel">
                <label htmlFor="observaciones" className="block font-medium mb-1">
                    {t('observaciones')}
                </label>
                <textarea
                    id="observaciones"
                    name="observaciones"
                    className="w-full border rounded p-2 h-[38px]"
                    value={datosEditandoAccion.datosMemoria.observaciones}
                    onChange={(e) => handleChangeCampos('observaciones', e)}
                />
            </div>

            <div className="flex gap-4 panel">
                <div className="flex-1">
                    <label htmlFor="dSeguimiento">{t('detalleSeguimiento')}</label>
                    <textarea
                        id="dSeguimiento"
                        name="dSeguimiento"
                        className="w-full border rounded p-2 h-[38px] resize-y"
                        value={datosEditandoAccion.datosMemoria.dSeguimiento}
                        onChange={(e) => handleChangeCampos('dSeguimiento', e)}
                    />
                </div>
            </div>

            <div className="flex gap-4 panel">
                <div className="flex-1">
                    <label htmlFor="valFinal">{t('valoracionFinal')}</label>
                    <textarea
                        id="valFinal"
                        name="valFinal"
                        className="w-full border rounded p-2 h-[38px] resize-y"
                        value={datosEditandoAccion.datosMemoria.valFinal}
                        onChange={(e) => handleChangeCampos('valFinal', e)}
                    />
                </div>
            </div>
        </div>
    );
});

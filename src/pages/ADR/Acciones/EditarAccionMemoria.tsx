import { forwardRef, useState } from 'react';
import { CustomSelect } from './EditarAccionComponent';
import { useTranslation } from 'react-i18next';
import { datosMemoria, EstadoLabel } from '../../../types/TipadoAccion';

const plurianualidad = true;

export const PestanaMemoria = forwardRef<HTMLButtonElement>(() => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(datosMemoria);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
    };

    const handlePresupuestoChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            presupuestoEjecutado: {
                ...prev.presupuestoEjecutado,
                [name]: value,
            },
        }));
    };

    const handleEjecucionChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            ejecucionPresupuestaria: {
                ...prev.ejecucionPresupuestaria,
                [name]: value,
            },
        }));
    };

    const handleSituacionActual = (value: EstadoLabel) => {
        setFormData((prev) => ({
            ...prev,
            sActual: value,
        }));
    };

    return (
        <div className="p-5 flex flex-col gap-4 w-full">
            <div className="flex gap-4 panel">
                <div className="flex-1">
                    <label htmlFor="ejecutora">*{t('ejecutora')}</label>
                    <textarea id="ejecutora" name="ejecutora" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.ejecutora} onChange={handleChange} />
                </div>
                <div className="flex-1">
                    <label htmlFor="implicadas">*{t('implicadas')}</label>
                    <textarea id="implicadas" name="implicadas" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.implicadas} onChange={handleChange} />
                </div>
                <div className="flex-1">
                    <label htmlFor="comarcal">*{t('comarcal')}</label>
                    <textarea id="comarcal" name="comarcal" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.comarcal} onChange={handleChange} />
                </div>
                <div className="flex-1">
                    <label htmlFor="supracomarcal">{t('supracomarcal')}</label>
                    <textarea id="supracomarcal" name="supracomarcal" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.supracomarcal} onChange={handleChange} />
                </div>
                {plurianualidad && (
                    <div className="flex-1">
                        <label htmlFor="rangoAnios" className="block font-medium mb-1">
                            {t('rangoAnios')}
                        </label>
                        <input type="text" id="rangoAnios" name="rangoAnios" className="w-full border rounded p-2 h-[38px]" value={formData.rangoAnios} onChange={handleChange} />
                    </div>
                )}
                <div className="flex-1">
                    <label htmlFor="sActual">*{t('sActual')}</label>
                    <CustomSelect value={formData.sActual} onChange={handleSituacionActual} />
                </div>
            </div>

            <div className="flex gap-4 panel">
                <div className="flex-1">
                    <label htmlFor="oAccion">*{t('oAccion')}</label>
                    <textarea id="oAccion" name="oAccion" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.oAccion} onChange={handleChange} />
                </div>
                <div className="flex-1">
                    <label htmlFor="ods">*{t('ods')}</label>
                    <textarea id="ods" name="ods" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.ods} onChange={handleChange} />
                </div>
            </div>

            <div className="panel">
                <label htmlFor="dAccionAvances">*{t('dAccionAvances')}</label>
                <textarea id="dAccionAvances" name="dAccionAvances" className="w-full border rounded p-2 h-[114px] resize-y" value={formData.dAccionAvances} onChange={handleChange} />
            </div>

            <div className="panel">
                <label htmlFor="presupuestoEjecutado" className="block font-medium mb-1">
                    *{t('presupuestoEjecutado')}
                </label>
                <table id="presupuestoEjecutado" className="min-w-full border rounded overflow-hidden panel">
                    <thead className="bg-gray-100">
                        <tr>
                            <th className="px-4 py-2 text-center font-semibold">{t('tTotal')}</th>
                            <th className="px-4 py-2 text-center font-semibold">{t('autofinanciación')}</th>
                            <th className="px-4 py-2 text-center font-semibold">{t('fPublicas')}</th>
                            <th className="px-4 py-2 text-center font-semibold">{t('origenFPublicas')}</th>
                            <th className="px-4 py-2 text-center font-semibold">{t('fuentesFPrivadas')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td className="px-4 py-2">
                                <input type="number" className="w-full border rounded px-2 py-1 h-[38px]" name="total" value={formData.presupuestoEjecutado.total} onChange={handlePresupuestoChange} />
                            </td>
                            <td className="px-4 py-2">
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1 h-[38px]"
                                    name="autofinanciacion"
                                    value={formData.presupuestoEjecutado.autofinanciacion}
                                    onChange={handlePresupuestoChange}
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1 h-[38px]"
                                    name="financiacionPublica"
                                    value={formData.presupuestoEjecutado.financiacionPublica}
                                    onChange={handlePresupuestoChange}
                                />
                            </td>
                            <td className="px-5 py-2">
                                <textarea
                                    className="w-full border rounded px-2 py-1 h-[38px] align-middle"
                                    name="origenPublica"
                                    value={formData.presupuestoEjecutado.origenPublica}
                                    onChange={handlePresupuestoChange}
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1 h-[38px]"
                                    name="financiacionPrivada"
                                    value={formData.presupuestoEjecutado.financiacionPrivada}
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
                                    value={formData.ejecucionPresupuestaria.previsto}
                                    onChange={handleEjecucionChange}
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1 h-[38px]"
                                    name="ejecutado"
                                    value={formData.ejecucionPresupuestaria.ejecutado}
                                    onChange={handleEjecucionChange}
                                />
                            </td>
                            <td className="px-4 py-2">
                                <input
                                    type="number"
                                    className="w-full border rounded px-2 py-1 h-[38px]"
                                    name="porcentaje"
                                    value={formData.ejecucionPresupuestaria.porcentaje}
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
                        <textarea id="iMujHom" name="iMujHom" className="w-full border rounded p-2 h-[76px] resize-y" value={formData.iMujHom} onChange={handleChange} />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="uEuskera">{t('uEuskera')}</label>
                        <textarea id="uEuskera" name="uEuskera" className="w-full border rounded p-2 h-[76px] resize-y" value={formData.uEuskera} onChange={handleChange} />
                    </div>
                </div>
                <div className="flex gap-4 ">
                    <div className="flex-1">
                        <label htmlFor="sostenibilidad">{t('sostenibilidad')}</label>
                        <textarea id="sostenibilidad" name="sostenibilidad" className="w-full border rounded p-2 h-[76px] resize-y" value={formData.sostenibilidad} onChange={handleChange} />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="dInteligent">{t('dInteligent')}</label>
                        <textarea id="dInteligent" name="dInteligent" className="w-full border rounded p-2 h-[76px] resize-y" value={formData.dInteligent} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className=" panel">
                <label htmlFor="observaciones" className="block font-medium mb-1">
                    {t('observaciones')}
                </label>
                <textarea id="observaciones" name="observaciones" className="w-full border rounded p-2 h-[38px]" value={formData.observaciones} onChange={handleChange} />
            </div>

            <div className="flex gap-4 panel">
                <div className="flex-1">
                    <label htmlFor="dSeguimiento">{t('detalleSeguimiento')}</label>
                    <textarea id="dSeguimiento" name="dSeguimiento" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.dSeguimiento} onChange={handleChange} />
                </div>
            </div>

            <div className="flex gap-4 panel">
                <div className="flex-1">
                    <label htmlFor="valFinal">{t('valoracionFinal')}</label>
                    <textarea id="valFinal" name="valFinal" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.valFinal} onChange={handleChange} />
                </div>
            </div>
        </div>
    );
});

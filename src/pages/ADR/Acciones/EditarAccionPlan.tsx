import { forwardRef } from 'react';
import { useTranslation } from 'react-i18next';
import { useYear } from '../../../contexts/DatosAnualContext';
import { DatosPlan } from '../../../types/TipadoAccion';

export const PestanaPlan = forwardRef<HTMLButtonElement>(() => {
    const { t } = useTranslation();
    const { datosEditandoAccion, setDatosEditandoAccion } = useYear();
    if (!datosEditandoAccion || !datosEditandoAccion.datosPlan) {
        return;
    }

    const handleChangeCampos = (campo: keyof DatosPlan, e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        setDatosEditandoAccion({
            ...datosEditandoAccion,
            datosPlan: {
                ...datosEditandoAccion.datosPlan!,
                [campo]: e.target.value || '',
            },
        });
        console.log(datosEditandoAccion);
    };
    const classNameTextArea = 'w-full border rounded p-2 h-[38px] resize-y';

    return (
        <div className="p-5 flex flex-col gap-4 w-full">
            <div className="flex gap-4 panel">
                <div className="flex-1">
                    <label htmlFor="ejecutora">*{t('ejecutora')}</label>
                    <textarea required name="ejecutora" className={classNameTextArea} value={datosEditandoAccion.datosPlan.ejecutora} onChange={(e) => handleChangeCampos('ejecutora', e)} />
                </div>
                <div className="flex-1">
                    <label htmlFor="implicadas">*{t('implicadas')}</label>
                    <textarea required name="implicadas" className={classNameTextArea} value={datosEditandoAccion.datosPlan.implicadas} onChange={(e) => handleChangeCampos('implicadas', e)} />
                </div>
                <div className="flex-1">
                    <label htmlFor="comarcal">*{t('comarcal')}</label>
                    <textarea required name="comarcal" className={classNameTextArea} value={datosEditandoAccion.datosPlan.comarcal} onChange={(e) => handleChangeCampos('comarcal', e)} />
                </div>
                <div className="flex-1">
                    <label htmlFor="supracomarcal">{t('supracomarcal')}</label>
                    <textarea name="supracomarcal" className={classNameTextArea} value={datosEditandoAccion.datosPlan.supracomarcal} onChange={(e) => handleChangeCampos('supracomarcal', e)} />
                </div>
                {datosEditandoAccion.plurianual && (
                    <div className="flex-1">
                        <label htmlFor="rangoAnios" className="block font-medium mb-1">
                            *{t('rangoAnios')}
                        </label>
                        <input
                            required
                            type="text"
                            name="rangoAnios"
                            className="w-full border rounded p-2 h-[38px]"
                            value={datosEditandoAccion.datosPlan.rangoAnios}
                            onChange={(e) => handleChangeCampos('rangoAnios', e)}
                        />
                    </div>
                )}
            </div>

            <div className="flex gap-4 panel">
                <div className="flex-1">
                    <label htmlFor="oAccion">*{t('oAccion')}</label>
                    <textarea required name="oAccion" className={classNameTextArea} value={datosEditandoAccion.datosPlan.oAccion} onChange={(e) => handleChangeCampos('oAccion', e)} />
                </div>
                <div className="flex-1">
                    <label htmlFor="ods">*{t('ods')}</label>
                    <textarea required name="ods" className={classNameTextArea} value={datosEditandoAccion.datosPlan.ods} onChange={(e) => handleChangeCampos('ods', e)} />
                </div>
            </div>

            <div className="panel">
                <label htmlFor="dAccion">*{t('dAccion')}</label>
                <textarea
                    required
                    name="dAccion"
                    className="w-full border rounded p-2 h-[114px] resize-y"
                    value={datosEditandoAccion.datosPlan.dAccion}
                    onChange={(e) => handleChangeCampos('dAccion', e)}
                />
            </div>

            <div className="panel">
                <label htmlFor="presupuesto" className="block font-medium mb-1">
                    {t('presupuesto')}
                </label>
                <input
                    type="text"
                    name="presupuesto"
                    className="w-full border rounded p-2 h-[38px]"
                    value={datosEditandoAccion.datosPlan.presupuesto}
                    onChange={(e) => handleChangeCampos('presupuesto', e)}
                />
            </div>

            <div className="panel">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label htmlFor="iMujHom">{t('iMujHom')}</label>
                        <textarea
                            name="iMujHom"
                            className="w-full border rounded p-2 h-[76px] resize-y"
                            value={datosEditandoAccion.datosPlan.iMujHom}
                            onChange={(e) => handleChangeCampos('iMujHom', e)}
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="uEuskera">{t('uEuskera')}</label>
                        <textarea
                            name="uEuskera"
                            className="w-full border rounded p-2 h-[76px] resize-y"
                            value={datosEditandoAccion.datosPlan.uEuskera}
                            onChange={(e) => handleChangeCampos('uEuskera', e)}
                        />
                    </div>
                </div>
                <div className="flex gap-4 ">
                    <div className="flex-1">
                        <label htmlFor="sostenibilidad">{t('sostenibilidad')}</label>
                        <textarea
                            name="sostenibilidad"
                            className="w-full border rounded p-2 h-[76px] resize-y"
                            value={datosEditandoAccion.datosPlan.sostenibilidad}
                            onChange={(e) => handleChangeCampos('sostenibilidad', e)}
                        />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="dInteligent">{t('dInteligent')}</label>
                        <textarea
                            name="dInteligent"
                            className="w-full border rounded p-2 h-[76px] resize-y"
                            value={datosEditandoAccion.datosPlan.dInteligent}
                            onChange={(e) => handleChangeCampos('dInteligent', e)}
                        />
                    </div>
                </div>
            </div>

            <div className="panel">
                <label htmlFor="observaciones" className="block font-medium mb-1">
                    {t('observaciones')}
                </label>
                <textarea
                    name="observaciones"
                    className="w-full border rounded p-2 h-[38px]"
                    value={datosEditandoAccion.datosPlan.observaciones}
                    onChange={(e) => handleChangeCampos('observaciones', e)}
                />
            </div>
        </div>
    );
});

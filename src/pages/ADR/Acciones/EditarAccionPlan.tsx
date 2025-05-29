import { forwardRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { DatosPlan } from '../../../types/TipadoAccion';

const plurianualidad = true;
interface planProps {
    datosPlan: DatosPlan;
}

export const PestanaPlan = forwardRef<HTMLButtonElement, planProps>(({ datosPlan }, ref) => {
    const { t } = useTranslation();
    const [formData, setFormData] = useState(datosPlan);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }));
        console.log(formData);
    };
    return (
        <div className="p-5 flex flex-col gap-4 w-full">
            <div className="flex gap-4 panel">
                <div className="flex-1">
                    <label htmlFor="ejecutora">*{t('ejecutora')}</label>
                    <textarea required name="ejecutora" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.ejecutora} onChange={handleChange} />
                </div>
                <div className="flex-1">
                    <label htmlFor="implicadas">*{t('implicadas')}</label>
                    <textarea required name="implicadas" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.implicadas} onChange={handleChange} />
                </div>
                <div className="flex-1">
                    <label htmlFor="comarcal">*{t('comarcal')}</label>
                    <textarea required name="comarcal" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.comarcal} onChange={handleChange} />
                </div>
                <div className="flex-1">
                    <label htmlFor="supracomarcal">{t('supracomarcal')}</label>
                    <textarea name="supracomarcal" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.supracomarcal} onChange={handleChange} />
                </div>
                {plurianualidad && (
                    <div className="flex-1">
                        <label htmlFor="rangoAnios" className="block font-medium mb-1">
                            *{t('rangoAnios')}
                        </label>
                        <input required type="text" name="rangoAnios" className="w-full border rounded p-2 h-[38px]" value={formData.rangoAnios} onChange={handleChange} />
                    </div>
                )}
            </div>

            <div className="flex gap-4 panel">
                <div className="flex-1">
                    <label htmlFor="oAccion">*{t('oAccion')}</label>
                    <textarea required name="oAccion" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.oAccion} onChange={handleChange} />
                </div>
                <div className="flex-1">
                    <label htmlFor="ods">*{t('ods')}</label>
                    <textarea required name="ods" className="w-full border rounded p-2 h-[38px] resize-y" value={formData.ods} onChange={handleChange} />
                </div>
            </div>

            <div className="panel">
                <label htmlFor="dAccion">*{t('dAccion')}</label>
                <textarea required name="dAccion" className="w-full border rounded p-2 h-[114px] resize-y" value={formData.dAccion} onChange={handleChange} />
            </div>

            <div className="panel">
                <label htmlFor="presupuesto" className="block font-medium mb-1">
                    {t('presupuesto')}
                </label>
                <input type="text" name="presupuesto" className="w-full border rounded p-2 h-[38px]" value={formData.presupuesto} onChange={handleChange} />
            </div>

            <div className="panel">
                <div className="flex gap-4">
                    <div className="flex-1">
                        <label htmlFor="iMujHom">{t('iMujHom')}</label>
                        <textarea name="iMujHom" className="w-full border rounded p-2 h-[76px] resize-y" value={formData.iMujHom} onChange={handleChange} />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="uEuskera">{t('uEuskera')}</label>
                        <textarea name="uEuskera" className="w-full border rounded p-2 h-[76px] resize-y" value={formData.uEuskera} onChange={handleChange} />
                    </div>
                </div>
                <div className="flex gap-4 ">
                    <div className="flex-1">
                        <label htmlFor="sostenibilidad">{t('sostenibilidad')}</label>
                        <textarea name="sostenibilidad" className="w-full border rounded p-2 h-[76px] resize-y" value={formData.sostenibilidad} onChange={handleChange} />
                    </div>
                    <div className="flex-1">
                        <label htmlFor="dInteligent">{t('dInteligent')}</label>
                        <textarea name="dInteligent" className="w-full border rounded p-2 h-[76px] resize-y" value={formData.dInteligent} onChange={handleChange} />
                    </div>
                </div>
            </div>

            <div className="panel">
                <label htmlFor="observaciones" className="block font-medium mb-1">
                    {t('observaciones')}
                </label>
                <textarea name="observaciones" className="w-full border rounded p-2 h-[38px]" value={formData.observaciones} onChange={handleChange} />
            </div>
        </div>
    );
});

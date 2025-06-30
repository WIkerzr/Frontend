import { forwardRef, useState } from 'react';
import { useYear } from '../../../contexts/DatosAnualContext';
import { DatosPlan } from '../../../types/TipadoAccion';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';
import { InputField, TextArea } from '../../../components/Utils/inputs';

export const PestanaPlan = forwardRef<HTMLButtonElement>(() => {
    const { planState } = useEstadosPorAnio();
    const { datosEditandoAccion, setDatosEditandoAccion, block } = useYear();
    const [planDesabilitado] = useState<boolean>(planState != 'borrador');
    const [bloqueo] = useState<boolean>(block ? block : planDesabilitado);

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
    };

    return (
        <div className="p-5 flex flex-col gap-4 w-full">
            <div className="flex gap-4 panel">
                <InputField nombreInput="ejecutora" required disabled={bloqueo} value={datosEditandoAccion.datosPlan.ejecutora} onChange={(e) => handleChangeCampos('ejecutora', e)} />
                <InputField nombreInput="implicadas" required disabled={bloqueo} value={datosEditandoAccion.datosPlan.implicadas} onChange={(e) => handleChangeCampos('implicadas', e)} />
                <InputField nombreInput="comarcal" required disabled={bloqueo} value={datosEditandoAccion.datosPlan.comarcal} onChange={(e) => handleChangeCampos('comarcal', e)} />
                <InputField nombreInput="supracomarcal" required disabled={bloqueo} value={datosEditandoAccion.datosPlan.supracomarcal} onChange={(e) => handleChangeCampos('supracomarcal', e)} />

                {datosEditandoAccion.plurianual && (
                    <InputField nombreInput="rangoAnios" required disabled={bloqueo} value={datosEditandoAccion.datosPlan.rangoAnios} onChange={(e) => handleChangeCampos('rangoAnios', e)} />
                )}
            </div>

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

import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../Configuracion/componentes';
import { TablaCuadroMando } from './Componentes';
import { useYear } from '../../contexts/DatosAnualContext';

const Index = () => {
    const { t } = useTranslation();
    const { yearData } = useYear();

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <div className="text-xl font-bold flex items-center space-x-2 ">
                        <span>{t('CuadroMando')}</span>
                    </div>
                }
            />

            <div className="p-5 flex flex-col gap-4 w-full">
                {yearData.plan.ejesPrioritarios.map(
                    (ejes, ejesIdx) =>
                        ejes.acciones.length > 0 && (
                            <div key={ejes.id || ejesIdx} className="paneln0">
                                {ejes.acciones.map((acciones, accionesIdx) => (
                                    <div key={acciones.id || accionesIdx} className="panel">
                                        <h5 className="font-semibold text-lg dark:text-white-light mb-5">{acciones.accion}</h5>
                                        <TablaCuadroMando indicador={acciones.indicadorAccion?.indicadoreRealizacion ?? []} titulo={t('indicadoresDeRealizacion')} />
                                        <TablaCuadroMando indicador={acciones.indicadorAccion?.indicadoreResultado ?? []} titulo={t('indicadoresDeResultado')} />
                                    </div>
                                ))}
                            </div>
                        )
                )}
            </div>
        </div>
    );
};

export default Index;

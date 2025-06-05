import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../Configuracion/componentes';
import { datosAcciones } from './Acciones';
import { TablaCuadroMando } from './Componentes';

const PanelAccionCuadroMando: React.FC = () => {
    const { t } = useTranslation();

    return (
        <>
            <h5 className="font-semibold text-lg dark:text-white-light mb-5">{datosAcciones[0].accion}</h5>
            {/* <TablaCuadroMando indicador={datosAcciones[0].indicadorAccion?.indicadoreRealizacion ?? []} titulo={t('indicadoresDeRealizacion')} /> */}
            {/* <TablaCuadroMando indicador={datosAcciones[0].indicadorAccion?.indicadoreResultado ?? []} titulo={t('indicadoresDeResultado')} /> */}
        </>
    );
};

const Index = () => {
    const { t } = useTranslation();

    return (
        <div className="panel h-[830px]">
            <ZonaTitulo
                titulo={
                    <div className="text-xl font-bold flex items-center space-x-2 ">
                        <span>{t('CuadroMando')}</span>
                    </div>
                }
            />
            <div className="panel">
                <PanelAccionCuadroMando />
            </div>
        </div>
    );
};

export default Index;

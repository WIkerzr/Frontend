import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../Configuracion/componentes';

const Index = () => {
    const { t } = useTranslation();

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>{t('CuadroMando')}</span>
                    </h2>
                }
            />
        </div>
    );
};

export default Index;

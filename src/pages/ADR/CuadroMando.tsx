import { useTranslation } from 'react-i18next';
import { ZonaTitulo } from '../Configuracion/componentes';

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
        </div>
    );
};

export default Index;

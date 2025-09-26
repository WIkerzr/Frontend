import { NavLink } from 'react-router-dom';
import { Servicios } from '../../../types/GeneralTypes';
import IconInfoCircle from '../../../components/Icon/IconInfoCircle';
import IconInfoTriangle from '../../../components/Icon/IconInfoTriangle';
import { useTranslation } from 'react-i18next';
import { useEstadosPorAnio } from '../../../contexts/EstadosPorAnioContext';

interface ResultadoValidacionServicios {
    faltanIndicadoresPlan: boolean;
    faltanIndicadoresMemoria: boolean;
    faltanCamposPlan: boolean;
    faltanCamposMemoria: boolean;
}

export function validarCamposObligatoriosServicio(datos: Servicios): ResultadoValidacionServicios {
    const checkDataString = (value: string | undefined | null) => {
        if (value === null || value === undefined || value === '' || value === '\n') {
            return false;
        }
        return true;
    };
    const faltanIndicadoresPlan = datos.indicadores.some((item) => !item.indicador || !item.previsto?.valor) || datos.indicadores.length === 0;

    let faltanIndicadoresMemoria = true;
    if (!faltanIndicadoresPlan) {
        faltanIndicadoresMemoria = datos.indicadores[0].alcanzado ? !datos.indicadores[0].alcanzado.valor : false;
    }

    const faltanCamposPlan = !checkDataString(datos.nombre) || !checkDataString(datos.descripcion);

    const faltanCamposMemoria = !checkDataString(datos.dSeguimiento) || !checkDataString(datos.valFinal);

    return { faltanIndicadoresPlan, faltanIndicadoresMemoria, faltanCamposPlan, faltanCamposMemoria };
}

interface MostrarAvisoCamposServiciosProps {
    datos: Servicios;
    texto?: boolean;
}

export const MostrarAvisoCamposServicios: React.FC<MostrarAvisoCamposServiciosProps> = ({ datos, texto = true }) => {
    const { t } = useTranslation();
    const { editarPlan } = useEstadosPorAnio();

    const { faltanIndicadoresPlan, faltanIndicadoresMemoria, faltanCamposPlan, faltanCamposMemoria } = validarCamposObligatoriosServicio(datos);

    if (!texto) {
        return null;
    }

    if (editarPlan) {
        if (!faltanCamposPlan && !faltanIndicadoresPlan) {
            return null;
        }
    } else {
        if (!faltanCamposMemoria && !faltanIndicadoresMemoria) {
            return null;
        }
    }

    return (
        <NavLink to="/adr/servicios/editando" className="group">
            <div className="bg-warning text-black text-sm rounded px-3 py-2 mb-4 flex items-center gap-2">
                {faltanCamposPlan || (!editarPlan && faltanCamposMemoria) ? (
                    <>
                        <IconInfoCircle />
                        <span>
                            <strong>{t('aviso')}:</strong> {t('camposObligatorios', { zona: editarPlan ? t('plan') : t('memoria') })}.
                        </span>
                    </>
                ) : (
                    <>
                        <IconInfoTriangle />
                        <span>
                            <strong>{t('aviso')}:</strong> {t('indicadoresOgligatorios', { zona: editarPlan ? t('plan') : t('memoria') })}.
                        </span>
                    </>
                )}
            </div>
        </NavLink>
    );
};

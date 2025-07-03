import { useTranslation } from 'react-i18next';
import { NavLink } from 'react-router-dom';
import { useEstadosPorAnio } from '../../contexts/EstadosPorAnioContext';
import { ZonaTitulo } from '../Configuracion/componentes';
import { Servicios } from '../../types/GeneralTypes';
import { TextArea } from '../../components/Utils/inputs';

const Index: React.FC = () => {
    const { t } = useTranslation();
    const { anio } = useEstadosPorAnio();
    const servicioPlan: Servicios = {
        id: 1,
        nombre: 'Capacitación en buenas prácticas agrícolas',
        descripcion: `TAREAS INTERNAS:
En las tareas internas generales se realiza: elaboración del plan de gestión y presupuestos anuales y seguimiento de los mismos; elaboración de cuentas y memoria anuales; encuentros con otras áreas de la Cuadrilla; coordinación de la participación de la asociación y gestión de la información de la misma; trámites administrativos (pagos de nóminas, facturas, actas, escritos, certificaciones, etc…);
Juntas Directivas y Asambleas Generales o Extraordinarias; atención al público (presencial,teléfono, mail, etc…); solicitud y firma de convenios con Gobierno Vasco, Diputación Foral de Álava y Cuadrilla de Llanada Alavesa y su justificación (parciales y final); prevención de riesgos laborales; gestiones y consultas laborales y fiscales con la gestoría. Gestión del cobro de las aportaciones de los ayuntamientos. Análisis de convocatorias de ayudas (ferias de DFA, cooperación, eventos de G.V.) y colaboración de otros agentes para actividades concretas (tríptico y actividades semana desarrollo rural, identificativo para producto local, etc…).`,
        indicadores: [
            {
                indicador: 'Tareas Internas ADR. Horas',
                previsto: {
                    valor: '500 horas',
                },
            },
            {
                indicador: `Cursos y Jornadas de Formación
Nº y horas`,
                previsto: {
                    valor: `4 cursos
80 horas`,
                },
            },
        ],
    };

    return (
        <div className="panel">
            <ZonaTitulo
                titulo={
                    <h2 className="text-xl font-bold flex items-center space-x-2">
                        <span>
                            {t('servicioTituloEditado')} {anio}
                        </span>
                    </h2>
                }
                zonaBtn={
                    <div className="ml-auto flex gap-4 items-center justify-end">
                        <button className="px-4 py-2 bg-primary text-white rounded">{t('guardar')} </button>
                        <NavLink to="/adr/servicios" className="group">
                            <button className="px-4 py-2 bg-danger text-white rounded">{t('cerrar')}</button>
                        </NavLink>
                    </div>
                }
            />
            <div className="panel">
                <div className="bg-[#76923b] p-2 font-bold border border-black">{t('Servicio')}</div>
                <div className="bg-[#d3e1b4] p-2 font-bold border-l border-r border-b border-black flex items-center">
                    <label htmlFor="titulo-pcdr" className="mr-2">
                        2.-
                    </label>
                    <input
                        id="titulo-pcdr"
                        className="flex-1 bg-transparent border-b border-black focus:outline-none font-bold"
                        defaultValue="Liderar la realización y el despliegue del nuevo PROGRAMA COMARCAL DE DESARROLLO RURAL (PCDR)."
                    />
                </div>
                {/* DESCRIPCIÓN */}
                <div className="bg-[#76923b] p-2 font-bold border-l border-r border-b border-black">{t('Descripcion').toUpperCase()}</div>
                <div className="border-l border-r border-b border-black p-4 text-sm">
                    <TextArea required nombreInput="Descripcion" className={'h-[114px]'} value={servicioPlan.descripcion} noTitle />
                </div>
                {/* INDICADORES */}
                <div className="bg-[#76923b] p-2 font-bold border-l border-r border-b border-black">{t('indicadoresOperativos').toUpperCase()}</div>
                <table className="w-full border-collapse border-l border-r border-b border-black text-sm">
                    <thead>
                        <tr>
                            <th className="border border-black bg-[#d3e1b4] p-1">{t('indicadores')}</th>
                            <th className="border border-black bg-[#d3e1b4] p-1">{t('valorPrevisto')}</th>
                            <th className="border border-black bg-[#b6c48e] p-1">{t('valorReal')}</th>
                        </tr>
                    </thead>
                    <tbody>
                        {servicioPlan.indicadores.map((indicador) => (
                            <tr key={indicador.indicador}>
                                <td className="border border-black align-top p-1">{indicador.indicador}</td>
                                <td className="border border-black text-center align-top p-1">{indicador.previsto.valor}</td>
                                <td className="border border-black text-center align-top p-1">{indicador.alcanzado?.valor}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
export default Index;

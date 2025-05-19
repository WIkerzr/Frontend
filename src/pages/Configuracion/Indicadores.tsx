import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrash from '../../components/Icon/IconTrash';
import IconPencil from '../../components/Icon/IconPencil';
import { useTranslation } from 'react-i18next';

interface IndicadorInterface {
    id: number;
    indicador: string;
    editable: boolean;
}

interface IndicadorProps {
    datosIndicadorTabla: IndicadorInterface[];
    nombreIndicador: string;
}
const datosIndicador: IndicadorInterface[] = [
    {
        id: 1,
        indicador: 'Indicador 1',
        editable: true,
    },
];

const Tabla: React.FC<IndicadorProps> = ({ datosIndicadorTabla, nombreIndicador }) => {
    const { t } = useTranslation();
    return (
        <div className="panel h-full w-1/2">
            <div className="flex justify-center mb-5">
                <button type="button" className="btn btn-primary w-1/2">
                    {t('nuevoIndicador') + nombreIndicador}
                </button>
            </div>
            <div className="table-responsive mb-5">
                <table>
                    <thead>
                        <tr>
                            <th>{nombreIndicador}</th>
                            <th className="text-center"></th>
                        </tr>
                    </thead>
                    <tbody>
                        {datosIndicadorTabla.map((data) => {
                            return (
                                <tr key={data.id}>
                                    <td>
                                        <div className="whitespace-nowrap">{data.indicador}</div>
                                    </td>
                                    <td className="text-center">
                                        {data.editable ? (
                                            <div className="flex justify-end space-x-3">
                                                <Tippy content={t('editar')}>
                                                    <button type="button">
                                                        <IconPencil />
                                                    </button>
                                                </Tippy>
                                                <Tippy content={t('borrar')}>
                                                    <button type="button">
                                                        <IconTrash />
                                                    </button>
                                                </Tippy>
                                            </div>
                                        ) : (
                                            <span className="text-gray-400"></span>
                                        )}
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>
        </div>
    );
};
const Index = () => {
    const { t } = useTranslation();
    return (
        <div className="flex w-full gap-5">
            <Tabla datosIndicadorTabla={datosIndicador} nombreIndicador={t('Realizacion')} />
            <Tabla datosIndicadorTabla={datosIndicador} nombreIndicador={t('Resultado')} />
        </div>
    );
};

export default Index;

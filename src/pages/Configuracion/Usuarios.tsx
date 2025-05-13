import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import IconTrash from '../../components/Icon/IconTrash';
import IconPencil from '../../components/Icon/IconPencil';
import { useTranslation } from 'react-i18next';

interface UsuarioInterface {
    id: number;
    nombre: string;
    apellido1: string;
    apellido2: string;
    rol: string;
    ambito: string;
    email: string;
    editable: boolean;
    habilitado: boolean;
}

interface UsuarioProps {
    datosUsuariosTabla: UsuarioInterface[];
}

const datosUsuario: UsuarioInterface[] = [
    {
        id: 1,
        nombre: 'Caleb',
        apellido1: 'Watts',
        apellido2: 'Saer',
        rol: 'Hazi',
        ambito: '-',
        email: 'Caleb@hazi.com',
        editable: true,
        habilitado: true,
    },
    {
        id: 2,
        nombre: 'Ana',
        apellido1: 'Riv',
        apellido2: 'Phur',
        rol: 'ADR',
        ambito: 'Añana',
        email: 'Ana@anana.com',
        editable: true,
        habilitado: false,
    },
    {
        id: 3,
        nombre: 'Marco',
        apellido1: 'Petter',
        apellido2: 'Yens',
        rol: 'ADR',
        ambito: 'Añana',
        email: 'MarcoPetter@anana.com',
        editable: true,
        habilitado: true,
    },
];

const Index = () => {
    const { t } = useTranslation();
    return (
        <div className="flex w-full gap-5">
            <div className="panel h-full w-full">
                <div className="flex justify-center mb-5">
                    <button type="button" className="btn btn-primary w-1/2">
                        {t('agregarUsuario')}
                    </button>
                </div>
                <div className="table-responsive mb-5">
                    <table>
                        <thead>
                            <tr>
                                <th></th>
                                <th>Nombre</th>
                                <th>1er Apellido</th>
                                <th>2do Apellido</th>
                                <th>Rol</th>
                                <th>Ámbito</th>
                                <th>E-mail</th>
                                <th>btn</th>
                            </tr>
                        </thead>
                        <tbody>
                            {datosUsuario.map((data) => {
                                return (
                                    <tr key={data.id}>
                                        <td>
                                            <div className="whitespace-nowrap">{data.habilitado ? '🟢' : '🔴'}</div>
                                        </td>
                                        <td>
                                            <div className="whitespace-nowrap">{data.nombre}</div>
                                        </td>
                                        <td>
                                            <div className="whitespace-nowrap">{data.apellido1}</div>
                                        </td>
                                        <td>
                                            <div className="whitespace-nowrap">{data.apellido2}</div>
                                        </td>
                                        <td>
                                            <div className="whitespace-nowrap">{data.rol}</div>
                                        </td>
                                        <td>
                                            <div className="whitespace-nowrap">{data.ambito}</div>
                                        </td>
                                        <td>
                                            <div className="whitespace-nowrap">{data.email}</div>
                                        </td>
                                        <td className="text-center">
                                            {data.editable ? (
                                                <div className="flex justify-end space-x-3">
                                                    <Tippy content={t('Editar')}>
                                                        <button type="button">
                                                            <IconPencil />
                                                        </button>
                                                    </Tippy>
                                                    <Tippy content={t('Borrar')}>
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
        </div>
    );
};

export default Index;

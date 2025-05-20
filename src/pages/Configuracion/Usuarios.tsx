import Tippy from '@tippyjs/react';
import 'tippy.js/dist/tippy.css';
import { useTranslation } from 'react-i18next';
import { useEffect, useState } from 'react';
import { TableUsersHazi } from '../../types/users';
import { ErrorMessage, Loading } from '../../components/Utils/animations';
import { ChangeStatus, DeleteUser, EditUser, NewUser } from './componentes';

const Index = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<TableUsersHazi[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshKey, setRefreshKey] = useState(0);

    const handleRefresh = () => {
        setRefreshKey((prev) => prev + 1);
    };
    useEffect(() => {
        setLoading(true);
        const fetchUsers = async () => {
            try {
                const res = await fetch('/api/users');
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || t('errorObtenerUsuarios'));
                setUsers(data.users);
                localStorage.setItem('users', JSON.stringify(data.users));
            } catch (err: any) {
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchUsers();
    }, []);

    useEffect(() => {
        const storedUsers = localStorage.getItem('users');
        if (storedUsers) {
            try {
                const parsedUsers = JSON.parse(storedUsers);
                setUsers(parsedUsers);
            } catch (error) {
                console.error(error);
            }
        }
    }, [refreshKey]);

    if (loading) return <Loading />;
    if (error) return <ErrorMessage message={error} />;
    if (users.length === 0) return <div>No hay datos para mostrar</div>;

    const headers = Object.keys(users[0]) as (keyof TableUsersHazi)[];
    const headersOrdered = [...headers].sort((a, b) => {
        if (a === 'status') return -1;
        if (b === 'status') return 1;
        return 0;
    });

    return (
        <div className="flex w-full gap-5">
            <div className="panel h-full w-full">
                <div className="flex justify-center mb-5">
                    <NewUser recargeToSave={handleRefresh} />
                </div>
                <div className="table-responsive mb-5">
                    <table>
                        <thead>
                            <tr>
                                {headersOrdered.map((key) => (
                                    <th key={key as string}>{key === 'status' ? '' : t(key)}</th>
                                ))}
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {users.map((row) => (
                                <tr key={row.email}>
                                    {headersOrdered.map((key) => (
                                        <ChangeStatus key={`${row.email}-${key}`} keyName={key} value={row} onSuccess={handleRefresh} />
                                    ))}
                                    <td className="text-center">
                                        <div className="flex justify-end space-x-3">
                                            <Tippy content={t('editar')}>
                                                <EditUser user={row} recargeToSave={handleRefresh} />
                                            </Tippy>
                                            <Tippy content={t('borrar')}>
                                                <DeleteUser user={row} recargeToSave={handleRefresh} />
                                            </Tippy>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

export default Index;

import { useEffect, useState } from 'react';
import { NewUser, UsersTable } from './componentes';
import { TableUsersHazi, UserID } from '../../types/users';
import { useTranslation } from 'react-i18next';
import { ErrorMessage, Loading } from '../../components/Utils/animations';

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

    const usersConId: UserID[] = users.map((user, index) => ({ id: index + 1, ...user }));
    return (
        <div className="flex w-full gap-5">
            <div className="panel h-full w-full">
                <div className="flex justify-center mb-5">
                    <NewUser recargeToSave={handleRefresh} />
                </div>
                <UsersTable users={usersConId} onSuccess={handleRefresh} />
            </div>
        </div>
    );
};

export default Index;

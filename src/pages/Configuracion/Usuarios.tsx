import { useEffect, useState } from 'react';
import { NewUser, UsersTable } from './componentes';
import { UserID } from '../../types/users';
import { useTranslation } from 'react-i18next';
import { ErrorMessage, Loading } from '../../components/Utils/animations';

const Index = () => {
    const { t } = useTranslation();
    const [users, setUsers] = useState<UserID[]>([]);
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
                const res = await fetch('https://localhost:44300/api/users');
                const data = await res.json();
                if (!res.ok) throw new Error(data.message || t('errorObtenerUsuarios'));
                const dataArray: UserID[] = Object.values(data);

                setUsers(Object.values(dataArray));

                localStorage.setItem('users', JSON.stringify(dataArray));
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
    if (users && Object.keys(users).length === 0) return <div>No hay datos para mostrar</div>;

    return (
        <div className="flex w-full gap-5">
            <div className="panel h-full w-full">
                <div className="flex justify-center mb-5">
                    <NewUser recargeToSave={handleRefresh} />
                </div>
                <UsersTable users={users} onSuccess={handleRefresh} />
            </div>
        </div>
    );
};

export default Index;

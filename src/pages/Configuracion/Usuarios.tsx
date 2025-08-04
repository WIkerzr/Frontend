import { useEffect, useMemo, useState } from 'react';
import { ErrorMessage, Loading } from '../../components/Utils/animations';
import { ChangeStatus, DeleteUser, EditUser, NewUser } from './componentesUser';
import { useUsers } from '../../contexts/UsersContext';
import Tippy from '@tippyjs/react';
import { DataTableSortStatus, DataTable } from 'mantine-datatable';
import { useTranslation } from 'react-i18next';
import { useSelector } from 'react-redux';
import IconRefresh from '../../components/Icon/IconRefresh';
import { IRootState } from '../../store';
import { UserID } from '../../types/users';

const Index = () => {
    const { users, setUsers, loading, error, llamadaBBDDUsers, fechaUltimoActualizadoBBDD } = useUsers();
    const { t } = useTranslation();
    const isRtl = useSelector((state: IRootState) => state.themeConfig.rtlClass) === 'rtl';

    const PAGE_SIZES = [10, 15, 20, 30, 50, 100];
    const [page, setPage] = useState(1);
    const [pageSize, setPageSize] = useState(PAGE_SIZES[0]);
    const [search, setSearch] = useState('');
    const [sortStatus, setSortStatus] = useState<DataTableSortStatus<UserID>>({ columnAccessor: 'id', direction: 'asc' });
    const [errorMessage, setErrorMessage] = useState<string | null>(null);

    useEffect(() => {
        llamadaBBDDUsers(true);
    }, []);

    useEffect(() => {
        localStorage.setItem('users', JSON.stringify(users));
    }, [users]);

    useEffect(() => {
        if (!errorMessage) return;
        const timer = setTimeout(() => setErrorMessage(null), 5000);
        return () => clearTimeout(timer);
    }, [errorMessage]);

    const filteredUsers = useMemo(() => {
        if (!search) return users;
        const s = search.toLowerCase();
        return users.filter(
            (user) =>
                user.name.toLowerCase().includes(s) ||
                user.lastName.toLowerCase().includes(s) ||
                user.secondSurname.toLowerCase().includes(s) ||
                user.email.toLowerCase().includes(s) ||
                user.role.toLowerCase().includes(s)
        );
    }, [search, users]);

    const sortedUsers = useMemo(() => {
        const sorted = [...filteredUsers];
        const { columnAccessor, direction } = sortStatus;

        if (!columnAccessor) return sorted;

        sorted.sort((a, b) => {
            const aValue = a[columnAccessor as keyof UserID];
            const bValue = b[columnAccessor as keyof UserID];

            if (aValue == null) return 1;
            if (bValue == null) return -1;

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                return direction === 'asc' ? aValue.localeCompare(bValue) : bValue.localeCompare(aValue);
            }

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return direction === 'asc' ? aValue - bValue : bValue - aValue;
            }

            return direction === 'asc' ? String(aValue).localeCompare(String(bValue)) : String(bValue).localeCompare(String(aValue));
        });

        return sorted;
    }, [filteredUsers, sortStatus]);

    const pagedUsers = useMemo(() => {
        const start = (page - 1) * pageSize;
        return sortedUsers.slice(start, start + pageSize);
    }, [sortedUsers, page, pageSize]);

    const handleChangeDelete = (id: string) => {
        setUsers((prev) => prev.filter((u) => u.id !== id));
    };

    if (loading) return <Loading />;
    if (error) return <ErrorMessage message={error} />;
    if (!users || users.length === 0) return <div>{t('noData')}</div>;

    return (
        <div className="flex w-full gap-5">
            <div className="panel h-full w-full">
                <div>
                    <div className="flex items-center space-x-4 mb-5 w-[100%]">
                        <input
                            type="text"
                            aria-label={t('buscarUsuario')}
                            className="border border-gray-300 rounded p-2 w-full max-w-xs"
                            placeholder={t('buscarUsuario')}
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                        <NewUser />
                    </div>

                    <div className="flex justify-between items-center mb-2">
                        <div>{errorMessage && <span className="text-red-500 hover:text-red-700">{errorMessage}</span>}</div>

                        <div className="flex items-center space-x-2">
                            {fechaUltimoActualizadoBBDD && (
                                <div>
                                    {new Date(fechaUltimoActualizadoBBDD).toLocaleString('es-ES', {
                                        dateStyle: 'medium',
                                        timeStyle: 'short',
                                    })}
                                </div>
                            )}
                            <Tippy content={t('Actualizar')}>
                                <button type="button" onClick={() => llamadaBBDDUsers()}>
                                    <IconRefresh />
                                </button>
                            </Tippy>
                        </div>
                    </div>
                    <div className="panel mt-6">
                        <div className="datatables">
                            <DataTable<UserID>
                                records={pagedUsers}
                                totalRecords={sortedUsers.length}
                                recordsPerPage={pageSize}
                                page={page}
                                onPageChange={(p) => setPage(p)}
                                recordsPerPageOptions={PAGE_SIZES}
                                onRecordsPerPageChange={(size) => {
                                    setPageSize(size);
                                    setPage(1);
                                }}
                                sortStatus={sortStatus}
                                onSortStatusChange={setSortStatus}
                                highlightOnHover
                                className={`${isRtl ? 'whitespace-nowrap table-hover' : 'whitespace-nowrap table-hover'}`}
                                columns={[
                                    {
                                        accessor: 'status',
                                        title: '',
                                        render: (row) => <ChangeStatus key={`status-${row.email}`} setErrorMessage={setErrorMessage} value={row} />,
                                    },
                                    { accessor: 'name', title: t('name'), sortable: true },
                                    { accessor: 'lastName', title: t('lastName'), sortable: true },
                                    { accessor: 'secondSurname', title: t('secondSurname'), sortable: true },
                                    { accessor: 'email', title: t('email'), sortable: true },
                                    {
                                        accessor: 'role',
                                        title: t('role'),
                                        sortable: true,
                                        render: (row) => {
                                            const ROLE_MAP: Record<string, string> = {
                                                GV: 'Inst. Pública',
                                            };

                                            const roleKey = String(row.role);
                                            return ROLE_MAP[roleKey] || roleKey;
                                        },
                                    },
                                    { accessor: 'RegionName', title: t('ambit'), sortable: true },
                                    {
                                        accessor: 'acciones',
                                        title: '',
                                        render: (row) => (
                                            <div className="flex justify-end space-x-3">
                                                <Tippy content={t('editar')}>
                                                    <EditUser editUser={row} onChange={() => {}} />
                                                </Tippy>
                                                <Tippy content={t('borrar')}>
                                                    <DeleteUser editUser={row} setErrorMessage={setErrorMessage} onChange={() => handleChangeDelete(row.id)} />
                                                </Tippy>
                                            </div>
                                        ),
                                    },
                                ]}
                                minHeight={200}
                                paginationText={({ from, to, totalRecords }) => t('paginacion', { from: `${from}`, to: `${to}`, totalRecords: `${totalRecords}` })}
                                recordsPerPageLabel={t('recorsPerPage')}
                            />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Index;

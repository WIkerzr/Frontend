export type UserRole = 'hazi' | 'adr' | 'gobiernoVasco';

export interface User {
    name: string;
    lastName: string;
    secondSurname: string;
    role: UserRole;
    email: string;
    ambit: string;
    password: string;
    status: boolean;
}

export type PublicUser = Omit<User, 'password'>;
export type TableUsersHazi = Omit<User, 'password'>;
export interface UpdateUserPayload extends Omit<TableUsersHazi, 'password'> {
    idEmail: string;
}

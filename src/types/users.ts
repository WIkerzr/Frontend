export type UserRole = 'ADR' | 'HAZI' | 'GV';

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
export interface UserID extends Omit<User, 'password'> {
    id: number;
}

// export type TableUsersHazi = Omit<User, 'password'>;

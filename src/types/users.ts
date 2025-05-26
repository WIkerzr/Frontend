export type UserRole = 'ADR' | 'HAZI' | 'GV';

export interface User {
    name: string;
    lastName: string;
    secondSurname: string;
    role: UserRole;
    email: string;
    ambit: string | number;
    password: string;
    status: boolean;
}
export interface UserID extends Omit<User, 'password'> {
    id: number;
    RegionName?: string;
}

export interface UserRegionId extends Omit<UserID, 'ambit'> {
    RegionId: number;
    RegionName: string;
}
// export type TableUsersHazi = Omit<User, 'password'>;

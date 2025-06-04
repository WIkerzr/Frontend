export type UserRole = 'ADR' | 'HAZI' | 'GOBIERNOVASCO';

export interface User {
    name: string;
    lastName: string;
    secondSurname: string;
    role: UserRole;
    email: string;
    ambit: string | number;
    password: string;
    status: boolean;
    [key: string]: unknown;
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

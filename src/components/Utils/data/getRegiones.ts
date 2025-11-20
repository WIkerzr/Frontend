export interface RegionInterface {
    id?: string;
    Id?: string;
    RegionId: string;
    NameEs: string;
    NameEu: string;
}

export interface GetRegionesResponse {
    success: boolean;
    message: string;
    data: RegionInterface[];
}

export interface ProvinceInterface {
    ProvinceId: string;
    NameEs: string;
    NameEu: string;
    RegionIds: number[];
}
export interface GetProvinceResponse {
    success: boolean;
    message: string;
    data: ProvinceInterface[];
}

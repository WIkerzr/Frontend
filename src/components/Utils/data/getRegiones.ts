export interface RegionInterface {
    RegionId: string;
    NameEs: string;
    NameEu: string;
}

export interface GetRegionesResponse {
    success: boolean;
    message: string;
    data: RegionInterface[];
}

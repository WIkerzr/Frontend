import api from '../../../api/axios';

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

export async function getRegiones(): Promise<RegionInterface[]> {
    const response = await api.get<GetRegionesResponse>('/regions'); //`${ApiTarget}/regions`
    if (!response.data.success) {
        throw new Error('Error al obtener regiones' + response.data.message);
    }
    return response.data.data;
}

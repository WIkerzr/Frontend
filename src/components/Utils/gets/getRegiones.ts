import api from '../../../api/axios';

export interface Region {
    RegionId: number;
    NameEs: string;
    NameEu: string;
}

export interface GetRegionesResponse {
    success: boolean;
    message: string;
    data: Region[];
}

export async function GetRegiones(): Promise<Region[]> {
    const response = await api.get<GetRegionesResponse>('/regions');
    if (!response.data.success) {
        throw new Error('Error al obtener regiones' + response.data.message);
    }
    return response.data.data;
}

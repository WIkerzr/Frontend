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

export async function getRegiones(): Promise<Region[]> {
    const token = sessionStorage.getItem('token');
    const response = await fetch('https://localhost:44300/api/regions', {
        method: 'GET',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Error al obtener regiones');
    }
    const result: GetRegionesResponse = await response.json();
    return result.data;
}

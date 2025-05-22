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
    const response = await fetch('https://localhost:44300/api/regions', {
        method: 'GET',
        headers: {
            Accept: 'application/json',
        },
    });
    if (!response.ok) {
        throw new Error('Error al obtener regiones');
    }
    const result: GetRegionesResponse = await response.json();
    return result.data;
}

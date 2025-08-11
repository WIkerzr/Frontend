import { ApiTarget } from '../../components/Utils/data/controlDev';

type LoginData = {
    userName: string;
    password: string;
    useRefreshTokens?: boolean;
};

const serviceBase = ApiTarget;

export async function authlogin(loginData: LoginData): Promise<unknown> {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', loginData.userName);
    params.append('password', loginData.password);
    const token = sessionStorage.getItem('access_token');

    const response = await fetch(serviceBase + 'token', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${token}`,
            Accept: 'application/json',
            'Content-Type': 'application/json',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        throw new Error('Login failed: ' + response.statusText);
    }

    const result = await response.json();
    return result;
}

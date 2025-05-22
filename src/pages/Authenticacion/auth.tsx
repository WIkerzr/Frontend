type LoginData = {
    userName: string;
    password: string;
    useRefreshTokens?: boolean;
};

const serviceBase = 'https://localhost:44300/';

export async function authlogin(loginData: LoginData): Promise<any> {
    const params = new URLSearchParams();
    params.append('grant_type', 'password');
    params.append('username', loginData.userName);
    params.append('password', loginData.password);

    const response = await fetch(serviceBase + 'token', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: params.toString(),
    });

    if (!response.ok) {
        throw new Error('Login failed: ' + response.statusText);
    }

    const result = await response.json();
    console.log('result');
    console.log(result);
    return result;
}

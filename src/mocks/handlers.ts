import { http, HttpResponse } from 'msw';

// Simula una API .NET WebAPI
export const handlers = [
    http.post('/api/login', async ({ request }) => {
        const { email, password } = (await request.json()) as { email: string; password: string };

        if (email === 'test@hazi.com' && password === '7!u6${956Wed') {
            return HttpResponse.json(
                {
                    success: true,
                    message: 'Login successful',
                    data: {
                        token: 'mock-jwt-token',
                        user: { email, name: 'Jon', rol: 'hazi' },
                    },
                },
                { status: 200 }
            );
        } else if (email === 'test@anana.com' && password === '7!u6${956Wed') {
            return HttpResponse.json(
                {
                    success: true,
                    message: 'Login successful',
                    data: {
                        token: 'mock-jwt-token',
                        user: { email, name: 'Natalia', rol: 'adr' },
                    },
                },
                { status: 200 }
            );
        } else {
            return HttpResponse.json(
                {
                    success: false,
                    message: 'Email o contraseña no valida',
                },
                { status: 401 }
            );
        }
    }),

    http.get('/api/users', () => {
        return HttpResponse.json(
            {
                success: true,
                data: [{ id: 1, name: 'Usuario 1' }],
            },
            { status: 200 }
        );
    }),

    http.get('/api/unknown', () => {
        return HttpResponse.json(
            {
                success: false,
                message: 'Resource not found',
            },
            { status: 404 }
        );
    }),
];

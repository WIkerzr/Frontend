import { http, HttpResponse } from 'msw';

const users = [
    {
        name: 'Jon',
        apellido1: 'Turner',
        apellido2: 'Carter',
        rol: 'hazi',
        email: 'jon.turner@hazi.com',
        ambito: '-',
        password: 'HaziPass123!',
    },
    {
        name: 'Natalia',
        apellido1: 'Lopez',
        apellido2: 'Martinez',
        rol: 'adr',
        email: 'natalia.lopez@adr.com',
        ambito: 'Amurrio',
        password: 'AdrSecure456!',
    },
    {
        name: 'Iker',
        apellido1: 'Gomez',
        apellido2: 'Fernandez',
        rol: 'gobVasco',
        email: 'iker.gomez@gv.eus',
        ambito: '-',
        password: 'GovSecure789!',
    },
    {
        name: 'Laura',
        apellido1: 'Sanchez',
        apellido2: 'Ruiz',
        rol: 'adr',
        email: 'laura.sanchez@adr.com',
        ambito: 'Zamudio',
        password: 'LauraZamudio22!',
    },
    {
        name: 'David',
        apellido1: 'Martín',
        apellido2: 'Perez',
        rol: 'hazi',
        email: 'david.martin@hazi.com',
        ambito: '-',
        password: 'DavidHazi90#',
    },
    {
        name: 'Amaia',
        apellido1: 'Uribe',
        apellido2: 'Agirre',
        rol: 'adr',
        email: 'amaia.uribe@adr.com',
        ambito: 'Durango',
        password: 'Durango123!',
    },
];

// Simula una API .NET WebAPI
export const handlers = [
    http.post('/api/login', async ({ request }) => {
        const body = (await request.json()) as { email: string; password: string };

        const user = users.find((u) => u.email === body.email && u.password === body.password);

        if (user) {
            return HttpResponse.json(
                {
                    success: true,
                    message: 'Login successful',
                    data: {
                        token: 'mock-jwt-token',
                        user: {
                            name: user.name,
                            apellido1: user.apellido1,
                            apellido2: user.apellido2,
                            rol: user.rol,
                            email: user.email,
                            ambito: user.ambito,
                        },
                    },
                },
                { status: 200 }
            );
        } else {
            return HttpResponse.json(
                {
                    success: false,
                    message: 'Email o contraseña no válida',
                },
                { status: 401 }
            );
        }
    }),

    http.put('/api/user', async ({ request }) => {
        const updatedUser = (await request.json()) as {
            originalEmail: string;
            name: string;
            lastName: string;
            secondSurname: string;
            rol: 'hazi' | 'adr' | 'gobVasco';
            email: string;
            ambit: string;
        };

        const { originalEmail, name, lastName, secondSurname, rol, email, ambit } = updatedUser;

        const index = users.findIndex((u) => u.email === originalEmail);

        if (index === -1) {
            return HttpResponse.json(
                {
                    success: false,
                    message: 'Usuario no encontrado',
                },
                { status: 404 }
            );
        }

        users[index] = {
            ...users[index],
            name,
            apellido1: lastName,
            apellido2: secondSurname,
            rol,
            email,
            ambito: ambit,
        };

        return HttpResponse.json(
            {
                success: true,
                message: 'Datos de usuario actualizados correctamente',
                data: users[index],
            },
            { status: 200 }
        );
    }),

    http.put('/api/user/password', async ({ request }) => {
        const body = (await request.json()) as {
            email: string;
            newPassword: string;
        };

        const { email: email, newPassword } = body;

        const userIndex = users.findIndex((u) => u.email === email);

        if (userIndex === -1) {
            return HttpResponse.json(
                {
                    success: false,
                    message: 'Usuario no encontrado',
                },
                { status: 404 }
            );
        }

        users[userIndex].password = newPassword;

        return HttpResponse.json(
            {
                success: true,
                message: 'Contraseña actualizada correctamente',
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

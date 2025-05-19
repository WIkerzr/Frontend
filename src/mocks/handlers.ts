import { http, HttpResponse } from 'msw';
import { users } from './usersList';

export const handlers = [
    http.post('/api/login', async ({ request }) => {
        const body = (await request.json()) as { email: string; password: string };
        const user = users.find((u) => u.email === body.email && u.password === body.password);

        if (user && user.status != false) {
            return HttpResponse.json(
                {
                    success: true,
                    message: 'Login successful',
                    data: {
                        token: 'mock-jwt-token',
                        user: {
                            name: user.name,
                            lastName: user.lastName,
                            secondSurname: user.secondSurname,
                            role: user.role,
                            email: user.email,
                            ambit: user.ambit,
                        },
                    },
                },
                { status: 200 }
            );
        } else {
            let errorMessage = 'Email o contraseña no válida';

            if (user?.status == false) {
                errorMessage = 'Usuario deshabilitado';
            }

            return HttpResponse.json(
                {
                    success: false,
                    message: errorMessage,
                },
                { status: 401 }
            );
        }
    }),

    http.put('/api/user', async ({ request }) => {
        const updatedUser = (await request.json()) as {
            idEmail: string;
            name: string;
            lastName: string;
            secondSurname: string;
            role: 'hazi' | 'adr' | 'gobiernoVasco';
            email: string;
            ambit: string;
            status: boolean;
        };

        const { idEmail, name, lastName, secondSurname, role, email, ambit, status } = updatedUser;

        const index = users.findIndex((u) => u.email === idEmail);

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
            name: name,
            lastName: lastName,
            secondSurname: secondSurname,
            role: role,
            email: email,
            ambit: ambit,
            status: typeof status === 'boolean' ? status : users[index].status,
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

        const { email, newPassword } = body;

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

    http.get('/api/users', () => {
        const usersWithoutPassword = users.map(({ password, ...rest }) => rest);

        return new Promise((resolve) => {
            setTimeout(() => {
                resolve(
                    HttpResponse.json(
                        {
                            success: true,
                            users: usersWithoutPassword,
                        },
                        { status: 200 }
                    )
                );
            }, 3000);
        });
    }),

    http.post('/api/newUser', async ({ request }) => {
        const body = (await request.json()) as {
            name: string;
            lastName: string;
            secondSurname: string;
            role: 'hazi' | 'adr' | 'gobiernoVasco';
            email: string;
            ambit: string;
        };

        const { name, lastName, secondSurname, role, email, ambit } = body;

        // Validación mínima
        if (!name || !lastName || !role || !email || !ambit) {
            return HttpResponse.json(
                {
                    success: false,
                    message: 'Faltan campos obligatorios',
                },
                { status: 400 }
            );
        }

        const id = users.length + 1;

        const newUser = {
            name,
            lastName,
            secondSurname,
            role,
            email,
            ambit,
            password: `${lastName}1`,
            status: true,
        };

        users.push(newUser);

        return HttpResponse.json(
            {
                success: true,
                message: 'Usuario creado exitosamente',
                user: {
                    id,
                    name,
                    lastName,
                    secondSurname,
                    role,
                    email,
                    ambit,
                    status: newUser.status,
                },
            },
            { status: 201 }
        );
    }),

    http.delete('/api/deleteUser', async ({ request }) => {
        const { idEmail } = (await request.json()) as { idEmail: string };

        const index = users.findIndex((u) => u.email === idEmail);

        if (index === -1) {
            return HttpResponse.json(
                {
                    success: false,
                    message: 'Usuario no encontrado',
                },
                { status: 404 }
            );
        }

        // Elimina el usuario del array
        const deletedUser = users.splice(index, 1)[0];

        return HttpResponse.json(
            {
                success: true,
                message: 'Usuario eliminado correctamente',
                data: deletedUser, // opcional, útil para confirmar al cliente
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

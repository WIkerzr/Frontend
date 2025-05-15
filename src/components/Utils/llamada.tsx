import { useTranslation } from 'react-i18next';
import { UpdateUserPayload } from '../../types/users';

export interface UpdateUserResponse {
    success: boolean;
    message: string;
    data?: any;
}
export const updateUser = async (payload: UpdateUserPayload): Promise<UpdateUserResponse> => {
    const { t } = useTranslation();
    const response = await fetch('/api/user', {
        method: 'PUT',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
    });

    if (!response.ok) {
        throw new Error(t('errorActualizarUsuario') + ` ${response.statusText}`);
    }

    return response.json();
};

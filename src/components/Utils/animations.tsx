import { useTranslation } from 'react-i18next';

export const Loading = () => {
    const { t } = useTranslation();

    return <div className="text-center text-blue-600 font-semibold animate-pulse"> {t('loading')} </div>;
};
export const ErrorMessage = ({ message }: { message: string }) => {
    return <div className="text-center text-red-600 font-semibold animate-pulse">{message}</div>;
};

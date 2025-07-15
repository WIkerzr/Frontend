import { useTranslation } from 'react-i18next';

export const Loading = ({ text }: { text?: string }) => {
    const { t } = useTranslation();
    if (!text) {
        text = t('loading');
    }
    return <div className="text-center text-blue-600 font-semibold animate-pulse"> {text} </div>;
};

export const ErrorMessage = ({ message }: { message: string }) => {
    return <div className="text-center text-red-600 font-semibold animate-pulse">{message}</div>;
};

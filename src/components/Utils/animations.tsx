export const Loading = () => {
    return <div className="text-center text-blue-600 font-semibold animate-pulse"> loading </div>;
};
export const ErrorMessage = ({ message }: { message: string }) => {
    return <div className="text-center text-red-600 font-semibold animate-pulse">{message}</div>;
};

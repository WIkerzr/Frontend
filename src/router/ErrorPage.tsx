import { useEffect } from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';

export function NotFound() {
    return (
        <div style={{ padding: '2rem', textAlign: 'center' }}>
            <h1>404 - Página no encontrada</h1>
            <p>Lo sentimos, la página que buscas no existe.</p>
        </div>
    );
}

export function ErrorPage() {
    const error = useRouteError() as Error;
    const navigate = useNavigate();
    return (
        <div className="h-screen flex flex-col items-center justify-center text-center p-4">
            <h1 className="text-3xl font-bold mb-4">⚠️ Ha ocurrido un error</h1>
            <p>{error?.message || 'Ha ocurrido un error inesperado.'}</p>
            <button className="mt-4 px-4 py-2 bg-blue-600 text-white rounded" onClick={() => navigate('/')}>
                Recargar página
            </button>
        </div>
    );
}
export function FalloFetch() {
    useEffect(() => {
        throw new Error('💥 Error de prueba');
    }, []);

    // Aunque nunca se renderice, el componente debe devolver algo
    return <div>Esto nunca debería verse 😅</div>;
}
export function FalloRender() {
    // Error directo en el render
    throw new Error('💥 Error de prueba en render');

    return <div>Esto nunca se verá</div>;
}

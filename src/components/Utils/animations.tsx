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

import { useEffect, useMemo, useRef } from 'react';
import { DesactivarAvisos } from './data/controlDev';

type UseUnsavedOptions = {
    debounceMs?: number;
    message?: string;
};

/**
 * Hook reusable para gestionar aviso de cambios no guardados.
 * - data: objeto a serializar para detectar cambios
 * - devuelve isDirty y funciones para resetear el snapshot inicial
 */
export function ComprobacionYAvisosDeCambios<T extends object | null>(data: T, options?: UseUnsavedOptions) {
    const { debounceMs = 500, message } = options || {};
    const initialRef = useRef<string | null>(null);
    const stableTimerRef = useRef<number | null>(null);

    useEffect(() => {
        if (DesactivarAvisos) {
            // marcar como limpio inmediatamente cuando los avisos están desactivados
            try {
                initialRef.current = data ? JSON.stringify(data) : null;
            } catch {
                initialRef.current = null;
            }
            return;
        }

        if (!data || initialRef.current !== null) return;
        if (stableTimerRef.current) {
            clearTimeout(stableTimerRef.current);
        }
        stableTimerRef.current = window.setTimeout(() => {
            try {
                initialRef.current = JSON.stringify(data);
            } catch {
                initialRef.current = null;
            }
            stableTimerRef.current = null;
        }, debounceMs);

        return () => {
            if (stableTimerRef.current) {
                clearTimeout(stableTimerRef.current);
                stableTimerRef.current = null;
            }
        };
    }, [data, debounceMs]);

    const aSidoModificado = useMemo(() => {
        if (!data) return false;
        if (!initialRef.current) return false;
        try {
            return JSON.stringify(data) !== initialRef.current;
        } catch {
            return false;
        }
    }, [data]);

    useEffect(() => {
        if (DesactivarAvisos) return;

        const confirmText = message || 'Hay cambios sin guardar. ¿Deseas salir sin guardar?';

        const handleBeforeUnload = (e: BeforeUnloadEvent) => {
            if (aSidoModificado) {
                e.preventDefault();
                e.returnValue = '';
                return '';
            }
            return undefined;
        };

        const handleDocumentClick = (e: MouseEvent) => {
            if (!aSidoModificado) return;
            const target = e.target as HTMLElement | null;
            if (!target) return;
            let el: HTMLElement | null = target;
            while (el && el.tagName !== 'A') el = el.parentElement;
            if (!el) return;
            const anchor = el as HTMLAnchorElement;
            const href = anchor.getAttribute('href');
            const targetBlank = anchor.getAttribute('target') === '_blank';
            if (!href || targetBlank) return;
            if (href.startsWith('http') || href.startsWith('mailto') || href.startsWith('//')) return;
            const confirmar = window.confirm(confirmText);
            if (!confirmar) {
                e.preventDefault();
                e.stopPropagation();
            }
        };

        const handlePopState = () => {
            if (!aSidoModificado) return;
            const confirmar = window.confirm(confirmText);
            if (!confirmar) {
                window.history.pushState(null, '', window.location.pathname + window.location.search + window.location.hash);
            }
        };

        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('click', handleDocumentClick, true);
        window.addEventListener('popstate', handlePopState);

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('click', handleDocumentClick, true);
            window.removeEventListener('popstate', handlePopState);
        };
    }, [aSidoModificado, message]);

    const restablecer = (newData?: T) => {
        try {
            initialRef.current = newData ? JSON.stringify(newData) : data ? JSON.stringify(data) : null;
        } catch {
            initialRef.current = null;
        }
    };

    const clearInitialSnapshot = () => {
        initialRef.current = null;
    };

    return { aSidoModificado, restablecer, clearInitialSnapshot };
}

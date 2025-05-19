import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from '../public/locales/es.json';
import eu from '../public/locales/eu.json';

i18n.use(initReactI18next).init({
    resources: {
        es: { translation: es },
        eu: { translation: eu },
    },
    lng: 'es',
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
});

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import es from '../public/locales/es.json';
import eu from '../public/locales/eu.json';
import errorEs from '../public/locales/errorEs.json';
import errorEu from '../public/locales/errorEu.json';
import objectEs from '../public/locales/objectEs.json';
import objectEu from '../public/locales/objectEu.json';

const idiomaGuardado = localStorage.getItem('idioma') || 'es';

i18n.use(initReactI18next).init({
    resources: {
        es: { translation: es, error: errorEs, object: objectEs },
        eu: { translation: eu, error: errorEu, object: objectEu },
    },
    lng: idiomaGuardado,
    fallbackLng: 'es',
    interpolation: { escapeValue: false },
});

export default i18n;

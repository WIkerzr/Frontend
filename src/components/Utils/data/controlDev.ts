export const Modos = 'DEV' as 'DEV' | 'HAZI' | 'Produccion';
export const ModoDev = Modos === 'DEV' ? true : false;
const EdicionTotal = true;
export const ModoDevEdicionTotal = ModoDev ? EdicionTotal : false;

export const ApiTarget =
    Modos === 'DEV'
        ? 'https://localhost:44300/api' // API local DEV
        : Modos === 'HAZI'
        ? 'https://localhost:44333/api' // API local HAZI
        : 'https://api.hazi.grupo-campus.com/api'; // API real (Produccion)

export const ApiTargetToken = Modos === 'DEV' ? 'https://localhost:44300/token' : Modos === 'HAZI' ? 'https://localhost:44333/token' : 'https://api.hazi.grupo-campus.com/token';

//npx eslint
export const DesactivarAvisos = false; // Si es true, desactiva los avisos de cambios sin guardar en las páginas

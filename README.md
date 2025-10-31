controlDev.ts

export const ModoDev = true;
const EdicionTotal = false;
export const ModoDevEdicionTotal = ModoDev ? EdicionTotal : false;
export const ApiTarget = ModoDev
    ? 'https://localhost:44300/api' // API local
    : 'https://api.hazi.grupo-campus.com/api'; // API real
export const ApiTargetToken = ModoDev ? 'https://localhost:44300/token' : 'https://api.hazi.grupo-campus.com/token';

//npx eslint
export const DesactivarAvisos = false; // Si es true, desactiva los avisos de cambios sin guardar en las páginas

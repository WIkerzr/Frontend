export const ModoDev = false;
export const ApiTarget = ModoDev
    ? 'https://localhost:44300/api' // API local
    : 'https://api.hazi.grupo-campus.com/api'; // API real
export const ApiTargetToken = ModoDev ? 'https://localhost:44300/token' : 'https://api.hazi.grupo-campus.com/token';
export let Fases = 8;

if (!ModoDev) {
    //Modificar el siguiente a la fase actual si no esta en desarrollo
    Fases = 2;
}

//npx eslint .

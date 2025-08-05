export const ModoDev = true;
export const ApiTarget = ModoDev
    ? 'https://localhost:44300/api' // API local
    : 'https://api.hazi.grupo-campus.com/api'; // API real
export const ApiTargetToken = ModoDev ? 'https://localhost:44300/token' : 'https://api.hazi.grupo-campus.com/token';
export const Fases = 2;

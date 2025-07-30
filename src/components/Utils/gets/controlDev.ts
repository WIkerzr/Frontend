const modoDev = false;

export const ApiTarget = modoDev
    ? 'https://localhost:44300/api' // API local
    : 'https://api.hazi.grupo-campus.com/api'; // API real

export const ApiTargetToken = modoDev ? 'https://localhost:44300/token' : 'https://api.hazi.grupo-campus.com/token';

export const Fases = 1;

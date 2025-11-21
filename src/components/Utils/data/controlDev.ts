type ModoConfig = 'DEV' | 'HAZI' | 'Produccion' | 0 | 1 | 2;
type ModoNombre = 'DEV' | 'HAZI' | 'Produccion';

const ModoSeleccionado: ModoConfig = 0;

const mapearModo = (modo: ModoConfig): ModoNombre => {
    // Si estamos en producción (build) y el modo es DEV (0), cambiar a Produccion (2)
    const modoBuild = import.meta.env.PROD && (modo === 0 || modo === 'DEV') ? 2 : modo;

    if (modoBuild === 0 || modoBuild === 'DEV') return 'DEV';
    if (modoBuild === 1 || modoBuild === 'HAZI') return 'HAZI';
    return 'Produccion';
};

export const Modos = mapearModo(ModoSeleccionado);
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

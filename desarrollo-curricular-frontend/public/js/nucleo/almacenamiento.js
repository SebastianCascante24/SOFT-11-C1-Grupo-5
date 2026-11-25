/*
 * post y get de local storage
 */
const Almacenamiento = {
    obtener(clave, valorPorDefecto = null) {
        try {
            const crudo = localStorage.getItem(clave);
            return crudo === null ? valorPorDefecto : JSON.parse(crudo);
        } catch (error) {
            console.error(`No se pudo leer "${clave}" de Local Storage.`, error);
            return valorPorDefecto;
        }
    },

    guardar(clave, valor) {
        try {
            localStorage.setItem(clave, JSON.stringify(valor));
            return true;
        } catch (error) {
            console.error(`No se pudo guardar "${clave}" en Local Storage.`, error);
            return false;
        }
    },
};
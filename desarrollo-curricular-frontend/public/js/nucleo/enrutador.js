/*
 * enrutador.js
 * router general segun lo indicado en el parametro del url.
 */
const Enrutador = {
    obtenerParametro(nombre) {
        return new URLSearchParams(window.location.search).get(nombre);
    },

    irA(ruta) {
        window.location.href = ruta;
    }
};
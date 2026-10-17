/*
 * formateadores.js
 * normalizador, reutilizable para filtros de busqueda
 */
const Formateadores = {
    /* en minuscula, sin tildes, trimeados */
    normalizarTexto(texto) {
        return String(texto)
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }
};
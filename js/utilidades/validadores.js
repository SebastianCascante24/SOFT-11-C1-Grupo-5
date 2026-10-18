/*
 * validadores.js
 * reglas de validacion reutilizables devuelven booleanos
 * los mensajes de error y la combinación de reglas por campo
 * las reglas se definen en el js de cada modulo y se llaman cuando sean necesarias
 * todo: formato establecido (codigos)?
 */
const Validadores = {
  estaVacio(valor) {
    return valor === null || valor === undefined || String(valor).trim() === '';
  },

  tieneLongitudMinima(valor, minimo) {
    return String(valor).trim().length >= minimo;
  },

  superaLongitudMaxima(valor, maximo) {
    return String(valor).trim().length > maximo;
  },

  esEnteroPositivo(valor) {
    const texto = String(valor).trim();
    return /^\d+$/.test(texto) && Number(texto) > 0;
  },
};
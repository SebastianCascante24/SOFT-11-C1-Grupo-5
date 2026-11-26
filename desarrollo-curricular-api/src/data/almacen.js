// almacen.js: un archivo general que simula guardar docs en mongo, 
// la idea es que lo usen para que cuando pasemos a mongo solo tengamos que cambiar este

const fs = require('fs/promises');
const path = require('path');

function rutaArchivo(coleccion) {
    return path.join(__dirname, `${coleccion}.json`);
}

async function leer(coleccion) {
    try {
        const texto = await fs.readFile(rutaArchivo(coleccion), 'utf8');
        return JSON.parse(texto);
    } catch (error) {
        if (error.code === 'ENOENT') return []; // el archivo aun no existe
        throw error;
    }
}

async function escribir(coleccion, registros) {
    await fs.writeFile(rutaArchivo(coleccion), JSON.stringify(registros, null, 2), 'utf8');
}

async function listar(coleccion) {
    return leer(coleccion);
}

async function buscar(coleccion, clave, valor) {
    const registros = await leer(coleccion);
    return registros.find((registro) => String(registro[clave]) === String(valor)) || null;
}

async function crear(coleccion, registro) {
    const registros = await leer(coleccion);
    registros.push(registro);
    await escribir(coleccion, registros);
    return registro;
}

async function actualizar(coleccion, clave, valor, cambios) {
    const registros = await leer(coleccion);
    const indice = registros.findIndex((registro) => String(registro[clave]) === String(valor));
    if (indice === -1) return null;

    registros[indice] = { ...registros[indice], ...cambios, [clave]: registros[indice][clave] };
    await escribir(coleccion, registros);
    return registros[indice];
}

async function eliminar(coleccion, clave, valor) {
    const registros = await leer(coleccion);
    const restantes = registros.filter((registro) => String(registro[clave]) !== String(valor));

    if (restantes.length === registros.length) return false;

    await escribir(coleccion, restantes);
    return true;
}

module.exports = { listar, buscar, crear, actualizar, eliminar };
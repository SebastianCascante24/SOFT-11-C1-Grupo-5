const almacen = require('../data/almacen');
const RECURSOS = require('./recursos.config');

// Si algo falla de forma inesperada, responde 500 en vez de dejar la peticion colgada
function manejar(funcion) {
    return (req, res) => {
        funcion(req, res).catch((error) => {
            console.error(error);
            res.status(500).json({ mensaje: 'Error interno del servidor' });
        });
    };
}

// Se ejecuta cuando la ruta trae :recurso. Rechaza los que no estan en la lista blanca.
function validarRecurso(req, res, next, nombre) {
    const config = RECURSOS[nombre];
    if (!config) {
        return res.status(404).json({ mensaje: 'Recurso no disponible' });
    }
    req.config = config;
    next();
}

// Convierte la clave al tipo esperado. Devuelve null si no es valida.
function normalizarClave(config, valor) {
    if (config.tipoClave === 'entero') {
        const numero = Number(valor);
        return Number.isInteger(numero) && numero > 0 ? numero : null;
    }
    const texto = String(valor ?? '').trim();
    return texto === '' ? null : texto;
}

// Se queda solo con los campos permitidos
function filtrarCampos(config, cuerpo) {
    const resultado = {};
    config.campos.forEach((campo) => {
        if (cuerpo[campo] !== undefined) resultado[campo] = cuerpo[campo];
    });
    return resultado;
}

// Quita los campos que nunca deben salir hacia el frontend
function limpiar(config, registro) {
    if (!config.ocultar) return registro;
    const copia = { ...registro };
    config.ocultar.forEach((campo) => delete copia[campo]);
    return copia;
}

const listar = manejar(async (req, res) => {
    const registros = await almacen.listar(req.config.coleccion);
    res.json(registros.map((registro) => limpiar(req.config, registro)));
});

const buscar = manejar(async (req, res) => {
    const { config } = req;
    const registro = await almacen.buscar(config.coleccion, config.clave, req.params.codigo);
    if (!registro) return res.status(404).json({ mensaje: 'Registro no encontrado' });
    res.json(limpiar(config, registro));
});

const crear = manejar(async (req, res) => {
    const { config } = req;
    const cuerpo = req.body || {};

    const clave = normalizarClave(config, cuerpo[config.clave]);
    if (clave === null) {
        return res.status(400).json({ mensaje: 'El código no es válido.' });
    }

    const existente = await almacen.buscar(config.coleccion, config.clave, clave);
    if (existente) {
        return res.status(409).json({ mensaje: config.mensajeDuplicado });
    }

    const registro = { ...filtrarCampos(config, cuerpo), [config.clave]: clave, activo: cuerpo.activo !== false };
    await almacen.crear(config.coleccion, registro);
    res.status(201).json(limpiar(config, registro));
});

module.exports = { validarRecurso, listar, buscar, crear };
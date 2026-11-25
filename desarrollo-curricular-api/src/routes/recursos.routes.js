const express = require('express');
const controlador = require('../controllers/recursos.controller');

const router = express.Router();

// Valida que :recurso este en la lista blanca antes de cualquier ruta
router.param('recurso', controlador.validarRecurso);

router.get('/:recurso', controlador.listar);
router.get('/:recurso/:codigo', controlador.buscar);
router.post('/:recurso', controlador.crear);

module.exports = router;
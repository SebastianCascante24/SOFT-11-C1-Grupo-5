// Modulos que usan el CURD generico
//   coleccion: nombre del archivo (hoy) o de la coleccion (con Mongo)
//   clave: campo que identifica al registro
//   tipoClave: 'entero' o 'texto'
//   campos: unicos campos que se aceptan al guardar
//   ocultar: campos que nunca se devuelven al frontend
//   mensajeDuplicado: respuesta cuando la clave ya existe

const RECURSOS = {
    'areas-sfia': {
        coleccion: 'areas-sfia',
        clave: 'codigo',
        tipoClave: 'entero',
        campos: ['codigo', 'nombre', 'descripcion', 'activo'],
        mensajeDuplicado: 'Ya existe un área SFIA con este código.'
    },
    'tematicas': {
        coleccion: 'tematicas',
        clave: 'codigo',
        tipoClave: 'entero',
        campos: ['codigo', 'nombre', 'descripcion', 'activo'],
        mensajeDuplicado: 'Ya existe una temática con este código.'
    },
    'metodologias': {
        coleccion: 'metodologias',
        clave: 'codigo',
        tipoClave: 'entero',
        campos: ['codigo', 'nombre', 'descripcion', 'activo'],
        mensajeDuplicado: 'Ya existe una metodología con este código.'
    },
    'casas-certificadoras': {
        coleccion: 'casas-certificadoras',
        clave: 'codigo',
        tipoClave: 'entero',
        campos: ['codigo', 'nombre', 'activo'],
        mensajeDuplicado: 'Ya existe una casa certificadora con este código.'
    },
    'niveles-complejidad': {
        coleccion: 'niveles-complejidad',
        clave: 'codigo',
        tipoClave: 'entero',
        campos: ['codigo', 'nombre', 'descripcion', 'activo'],
        mensajeDuplicado: 'Ya existe un nivel de complejidad con este código.'
    },

    'escuelas': {
        coleccion: 'escuelas',
        clave: 'codigo',
        tipoClave: 'texto',
        campos: ['codigo', 'nombre', 'director', 'activo'],
        mensajeDuplicado: 'Ya existe una escuela con este código.'
    },
    'carreras': {
        coleccion: 'carreras',
        clave: 'codigo',
        tipoClave: 'texto',
        campos: ['codigo', 'nombre', 'escuelaCodigo', 'directorId', 'activo'],
        generarId: true,
        registrarFecha: true,
        mensajeDuplicado: 'Ya existe una carrera con este código.'
    }

};

module.exports = RECURSOS;
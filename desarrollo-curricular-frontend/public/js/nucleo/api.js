// api.js: el unico archivo del frontend que se comunica con la API.

// Direccion de la API
const URL_API = 'http://localhost:4000/api';

// login
const RUTA_LOGIN = (location.pathname.includes('/modulos/') ? '../../' : '') + 'modulos/autenticacion/login.html';

// Envia una peticion a la API y devuelve los datos de la respuesta.
//   metodo: 'GET', 'POST', 'PUT' o 'DELETE'
//   ruta:   el final de la direccion, por ejemplo '/cursos'
//   datos:  el objeto que se envia; solo con POST y PUT
async function pedirApi(metodo, ruta, datos) {
    // Prepara las opciones de la peticion.
    //    credentials: 'include' envia la cookie de sesion en cada peticion.
    const opciones = { method: metodo, headers: {}, credentials: 'include' };
    if (datos !== undefined) {
        opciones.headers['Content-Type'] = 'application/json';
        opciones.body = JSON.stringify(datos);
    }

    // Envia la peticion y espera la respuesta.
    let respuesta;
    try {
        respuesta = await fetch(URL_API + ruta, opciones);
    } catch (error) {
        throw new Error('No se pudo conectar con la API');
    }

    // Convierte el cuerpo de la respuesta en un objeto.
    //    Si el cuerpo no es JSON, usa un objeto vacio.
    const contenido = await respuesta.json().catch(() => ({}));

    // Si la sesion expiro (401), vuelve al login. El login mismo se excluye:
    if (respuesta.status === 401 && ruta !== '/auth/login' && !location.pathname.includes('/autenticacion/')) {
        window.location.href = RUTA_LOGIN;
    }

    // Si la API respondio con un error, lo lanza con su mensaje.
    if (!respuesta.ok) {
        const error = new Error(contenido.mensaje || 'Ocurrió un error');
        error.estado = respuesta.status;
        throw error;
    }

    return contenido;
}

// Atajos
const Api = {
    obtener: (ruta) => pedirApi('GET', ruta),
    crear: (ruta, datos) => pedirApi('POST', ruta, datos),
};
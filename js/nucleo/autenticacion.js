/*
 * autenticacion.js
 * sesion del usuario que inicio sesion
 * la sesion se guarda en localstorage
 */
const Autenticacion = {
    claveSesion: 'grupo5_sesion',

    rutaLogin: new URL('../../modulos/autenticacion/login.html', document.currentScript.src).href,

    iniciarSesion(usuario) {
        return Almacenamiento.guardar(this.claveSesion, {
            id: usuario.id,
            nombre: usuario.nombre,
            correo: usuario.correo,
            rol: usuario.rol,
            inicio: new Date().toISOString()
        });
    },

    obtenerSesion() {
        try {
            return JSON.parse(localStorage.getItem(this.claveSesion));
        } catch (error) {
            return null;
        }
    },

    estaAutenticado() {
        return this.obtenerSesion() !== null;
    },

    protegerPagina() {
    const rutaActual = window.location.pathname;
    const esLogin = rutaActual === new URL(this.rutaLogin).pathname;

    const rutaRegistro = new URL(
        '../../modulos/usuarios/usuario-registro.html',
        document.currentScript.src
    ).pathname;

    const rutaRegistroAlterna = new URL('../../modulos/usuarios/registro.html', document.currentScript.src).pathname;
    const esRegistro = rutaActual === rutaRegistro || rutaActual === rutaRegistroAlterna;

    let usuarios = [];

    try {
        usuarios = JSON.parse(
            localStorage.getItem('grupo5_usuarios') || '[]'
        );
    } catch (error) {
        usuarios = [];
    }

    const sinUsuarios = Array.isArray(usuarios) && usuarios.length === 0;

    // Permitir el registro inicial únicamente si no hay usuarios.
    if (
        esLogin ||
        this.estaAutenticado() ||
        (esRegistro && sinUsuarios)
    ) {
        return;
    }

    document.documentElement.style.display = 'none';
    window.location.replace(this.rutaLogin);
},

    cerrarSesion() {
        try {
            localStorage.removeItem(this.claveSesion);
        } catch (error) {
            console.error('No se pudo cerrar la sesión.', error);
        }
        window.location.replace(`${this.rutaLogin}?sesion=cerrada`);
    }
};

Autenticacion.protegerPagina();

window.addEventListener('pageshow', (evento) => {
    if (evento.persisted) Autenticacion.protegerPagina();
});

document.addEventListener('DOMContentLoaded', () => {
    const boton = document.getElementById('encabezado-cerrar-sesion');
    if (boton) boton.addEventListener('click', () => Autenticacion.cerrarSesion());
    const avatar = document.getElementById('encabezado-avatar');
    if (avatar) {
        const sesion = Autenticacion.obtenerSesion();
        try {
            const usuarios = JSON.parse(localStorage.getItem('grupo5_usuarios') || '[]');
            const usuario = usuarios.find(u => sesion && u.id === sesion.id);
            if (usuario) avatar.textContent = usuario.avatar || (usuario.nombre || 'A').charAt(0).toUpperCase();
        } catch (error) { /* El perfil mostrará el error si corresponde. */ }
        avatar.addEventListener('click', () => {
            window.location.href = new URL('../../modulos/usuarios/perfil.html', document.currentScript?.src || Autenticacion.rutaLogin).href;
        });
    }
});
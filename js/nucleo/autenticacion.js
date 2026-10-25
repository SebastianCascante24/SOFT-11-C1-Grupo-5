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
        const esLogin = window.location.pathname === new URL(this.rutaLogin).pathname;
        if (esLogin || this.estaAutenticado()) return;

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
});
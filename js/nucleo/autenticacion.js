/*
 * autenticacion.js
 * sesion del usuario que inicio sesion
 * la sesion se guarda en localstorage
 */
const Autenticacion = {
    claveSesion: 'grupo5_sesion',

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
        return Almacenamiento.obtener(this.claveSesion, null);
    },

    estaAutenticado() {
        return this.obtenerSesion() !== null;
    },

    cerrarSesion() {
        try {
            localStorage.removeItem(this.claveSesion);
        } catch (error) {
            console.error('No se pudo cerrar la sesión.', error);
        }
    }
};
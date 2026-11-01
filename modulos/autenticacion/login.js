const Login = (function () {
    'use strict';

    const RUTA_INICIO = '../../index.html';

    let formulario = null;
    let errorGeneral = null;
    let campoUsuario = null;
    let campoContrasena = null;

    function validarObligatorio(campo, mensaje) {
        if (Validadores.estaVacio(campo.value)) {
            Notificacion.mostrarErrorCampo(campo, mensaje);
            return false;
        }
        Notificacion.limpiarErrorCampo(campo);
        return true;
    }

    function buscarUsuarioRegistrado(identificador) {
        return Usuarios.obtenerTodos().find(
            (usuario) => String(usuario.correo).toLowerCase() === identificador
        ) || null;
    }

    function mostrarFalloLogin(mensaje) {
        Notificacion.mostrarErrorGeneral(errorGeneral, mensaje);
        campoContrasena.value = '';
        campoUsuario.focus();
    }

    function manejarEnvio(evento) {
        evento.preventDefault();
        Notificacion.limpiarErrorGeneral(errorGeneral);

        const usuarioValido = validarObligatorio(campoUsuario, 'Ingrese su usuario.');
        const contrasenaValida = validarObligatorio(campoContrasena, 'Ingrese su contraseña.');

        if (!usuarioValido || !contrasenaValida) {
            Notificacion.mostrarErrorGeneral(
                errorGeneral,
                'Hay datos que necesitan revisión. Corrija los campos señalados.'
            );
            (usuarioValido ? campoContrasena : campoUsuario).focus();
            return;
        }

        const identificador = campoUsuario.value.trim().toLowerCase();
        const usuario = buscarUsuarioRegistrado(identificador);

        if (!usuario) {
            mostrarFalloLogin('Usuario o contraseña incorrectos.');
            return;
        }

        if (usuario.activo === false) {
            mostrarFalloLogin('Su usuario está inactivo. Contacte al administrador.');
            return;
        }

        if (!Autenticacion.iniciarSesion(usuario)) {
            mostrarFalloLogin('No se pudo iniciar la sesión. Intente de nuevo.');
            return;
        }

        Enrutador.irA(RUTA_INICIO);
    }

    function mostrarAvisoSesionCerrada() {
        const url = new URL(window.location.href);
        if (url.searchParams.get('sesion') !== 'cerrada') return;

        Notificacion.mostrar('info', 'Sesión cerrada correctamente.');
        url.searchParams.delete('sesion');
        window.history.replaceState(null, '', url.pathname + url.search + url.hash);
    }

    function iniciar() {
        formulario = document.getElementById('login-formulario');
        errorGeneral = document.getElementById('login-error-general');
        campoUsuario = document.getElementById('login-usuario');
        campoContrasena = document.getElementById('login-contrasena');

        formulario.addEventListener('submit', manejarEnvio);
        [campoUsuario, campoContrasena].forEach((campo) => {
            campo.addEventListener('input', () => Notificacion.limpiarErrorCampo(campo));
        });
        mostrarAvisoSesionCerrada();
    }

    return { iniciar };
})();

document.addEventListener('DOMContentLoaded', () => {
    if (
        typeof Almacenamiento !== 'undefined' &&
        typeof Validadores !== 'undefined' &&
        typeof Notificacion !== 'undefined' &&
        typeof Usuarios !== 'undefined' &&
        typeof Autenticacion !== 'undefined'
    ) {
        Login.iniciar();
    } else {
        console.error('Faltan dependencias del módulo de inicio de sesión.');
    }
});
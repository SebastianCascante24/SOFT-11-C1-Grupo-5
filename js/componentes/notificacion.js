/*
 * notificacion.js
 * mensajes reutilizables: avisos temporales, errores por campo
 * y mensaje general de formulario. Usa clases de Bootstrap (alert, is-invalid, invalid-feedback)
 */
const Notificacion = {
    /* tipos que usa el proyecto -> clase de Bootstrap */
    TIPOS: {
        exito: 'success',
        error: 'danger',
        advertencia: 'warning',
        info: 'info'
    },

    /* aviso temporal */
    mostrar(tipo, mensaje, duracion = 4000) {
        let contenedor = document.getElementById('contenedor-notificaciones');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'contenedor-notificaciones';
            contenedor.className = 'position-fixed top-0 end-0 p-3 d-flex flex-column gap-2';
            contenedor.style.zIndex = '1100';
            contenedor.style.width = 'min(380px, 100%)';
            contenedor.setAttribute('aria-live', 'polite');
            document.body.appendChild(contenedor);
        }

        const clase = this.TIPOS[tipo] || 'info';
        const aviso = document.createElement('div');
        aviso.className = `alert alert-${clase} shadow-sm mb-0`;
        aviso.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
        aviso.textContent = mensaje;
        contenedor.appendChild(aviso);

        setTimeout(() => aviso.remove(), duracion);
    },

    /* marca un campo como invalido y muestra su mensaje abajo */
    mostrarErrorCampo(campo, mensaje) {
        this.limpiarErrorCampo(campo);

        const error = document.createElement('div');
        error.id = `error-${campo.id}`;
        error.className = 'invalid-feedback';
        error.textContent = mensaje;

        campo.classList.add('is-invalid');
        campo.setAttribute('aria-invalid', 'true');
        campo.setAttribute('aria-describedby', error.id);
        campo.insertAdjacentElement('afterend', error);
    },

    /* marca un campo como valido (solo si tiene contenido) */
    marcarCampoValido(campo) {
        if (campo.value.trim() !== '') campo.classList.add('is-valid');
    },

    /* devuelve el campo a su estado original */
    limpiarErrorCampo(campo) {
        campo.classList.remove('is-invalid', 'is-valid');
        campo.removeAttribute('aria-invalid');
        campo.removeAttribute('aria-describedby');

        const error = document.getElementById(`error-${campo.id}`);
        if (error) error.remove();
    },

    /* mensaje general de campos invalidos en la parte superior del formulario */
    mostrarErrorGeneral(contenedor, mensaje) {
        contenedor.textContent = mensaje;
        contenedor.hidden = false;
    },

    limpiarErrorGeneral(contenedor) {
        contenedor.textContent = '';
        contenedor.hidden = true;
    }
};
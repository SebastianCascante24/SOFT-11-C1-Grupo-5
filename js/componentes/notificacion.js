/*
 * notificacion.js
 * mensajes reutilizables: avisos temporales de errores por campo
 * y mensaje general de formulario, usa las clases de /css/componentes/alertas.css
 */
const Notificacion = {
    /* aviso temporal */
    mostrar(tipo, mensaje, duracion = 4000) {
        let contenedor = document.getElementById('contenedor-notificaciones');
        if (!contenedor) {
            contenedor = document.createElement('div');
            contenedor.id = 'contenedor-notificaciones';
            contenedor.setAttribute('aria-live', 'polite');
            document.body.appendChild(contenedor);
        }

        const aviso = document.createElement('div');
        aviso.className = `alerta alerta-${tipo}`;
        aviso.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
        aviso.textContent = mensaje;
        contenedor.appendChild(aviso);

        setTimeout(() => aviso.remove(), duracion);
    },

    /* marcar un campo como invalido y muestra su mensaje abajo */
    mostrarErrorCampo(campo, mensaje) {
        this.limpiarErrorCampo(campo);

        const error = document.createElement('p');
        error.id = `error-${campo.id}`;
        error.className = 'alerta alerta-error mensaje-error';
        error.textContent = mensaje;

        campo.classList.add('campo-invalido');
        campo.setAttribute('aria-invalid', 'true');
        campo.setAttribute('aria-describedby', error.id);
        campo.insertAdjacentElement('afterend', error);
    },

    /* devuelve el campo a su estado original (sin alerta) */
    limpiarErrorCampo(campo) {
        campo.classList.remove('campo-invalido');
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
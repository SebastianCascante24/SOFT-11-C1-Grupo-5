/**
 * modal.js
 * componente reutilizable de ventanas emergentes basado en <dialog>
 * usa focus y soporta esc
 */
const Modal = {
    /**
     * muestra una ventana de confirmacion
     * devuelve true si se confirma y false si se cancela o cierra con esc
     */
    confirmar({ titulo, mensaje, textoConfirmar = 'Aceptar', textoCancelar = 'Cancelar' }) {
        return new Promise((resolver) => {
            const dialogo = document.createElement('dialog');
            dialogo.className = 'modal';
            dialogo.setAttribute('aria-labelledby', 'modal-titulo');     // accesibilidad
            dialogo.setAttribute('aria-describedby', 'modal-mensaje');   // accesibilidad

            const encabezado = document.createElement('h2');
            encabezado.id = 'modal-titulo';
            encabezado.textContent = titulo;

            const parrafo = document.createElement('p');
            parrafo.id = 'modal-mensaje';
            parrafo.textContent = mensaje;

            const acciones = document.createElement('div');
            acciones.className = 'modal-acciones';

            const botonCancelar = document.createElement('button');
            botonCancelar.type = 'button';
            botonCancelar.className = 'boton-secundario';
            botonCancelar.textContent = textoCancelar;

            const botonConfirmar = document.createElement('button');
            botonConfirmar.type = 'button';
            botonConfirmar.textContent = textoConfirmar;

            acciones.append(botonCancelar, botonConfirmar);
            dialogo.append(encabezado, parrafo, acciones);

            let confirmado = false;
            botonConfirmar.addEventListener('click', () => {
                confirmado = true;
                dialogo.close();
            });
            botonCancelar.addEventListener('click', () => dialogo.close());
            dialogo.addEventListener('close', () => {
                dialogo.remove();
                resolver(confirmado);
            });

            document.body.appendChild(dialogo);
            dialogo.showModal();
            botonCancelar.focus(); // focus en l;a opcion segura
        });
    }
};
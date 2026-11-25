/*
 * modal.js
 * componente reutilizable de ventanas emergentes basado en el modal de Bootstrap
 * (requiere bootstrap.bundle.min.js cargado antes)
 */
const Modal = {
    /*
     * muestra una ventana de confirmacion
     * devuelve true si se confirma y false si se cancela o cierra con esc
     * estiloConfirmar: 'primary' (por defecto) o 'danger' para acciones sensibles
     */
    confirmar({ titulo, mensaje, textoConfirmar = 'Aceptar', textoCancelar = 'Cancelar', estiloConfirmar = 'primary' }) {
        return new Promise((resolver) => {
            const elemento = document.createElement('div');
            elemento.className = 'modal fade';
            elemento.tabIndex = -1;
            elemento.setAttribute('aria-labelledby', 'modal-titulo');
            elemento.setAttribute('aria-describedby', 'modal-mensaje');

            elemento.innerHTML = `
                <div class="modal-dialog modal-dialog-centered">
                    <div class="modal-content">
                        <div class="modal-header">
                            <h2 class="modal-title fs-5" id="modal-titulo"></h2>
                            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Cerrar"></button>
                        </div>
                        <div class="modal-body" id="modal-mensaje"></div>
                        <div class="modal-footer">
                            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal"></button>
                            <button type="button" class="btn btn-${estiloConfirmar}" data-confirmar></button>
                        </div>
                    </div>
                </div>`;

            // textContent para que el texto nunca se interprete como HTML
            elemento.querySelector('#modal-titulo').textContent = titulo;
            elemento.querySelector('#modal-mensaje').textContent = mensaje;
            const botonCancelar = elemento.querySelector('.modal-footer .btn-secondary');
            const botonConfirmar = elemento.querySelector('[data-confirmar]');
            botonCancelar.textContent = textoCancelar;
            botonConfirmar.textContent = textoConfirmar;

            document.body.appendChild(elemento);
            const modal = new bootstrap.Modal(elemento);

            let confirmado = false;
            botonConfirmar.addEventListener('click', () => {
                confirmado = true;
                modal.hide();
            });

            elemento.addEventListener('shown.bs.modal', () => botonCancelar.focus()); // focus en la opcion segura
            elemento.addEventListener('hidden.bs.modal', () => {
                modal.dispose();
                elemento.remove();
                resolver(confirmado);
            });

            modal.show();
        });
    }
};
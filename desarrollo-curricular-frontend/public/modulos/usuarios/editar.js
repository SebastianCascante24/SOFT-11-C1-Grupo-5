
/*
 * HU-09: Modificar usuarios registrados
 * Proyecto Integrador - Grupo 5
 * Prototipo académico con localStorage.
 */

"use strict";

const EditarUsuario = {

    clave: "grupo5_usuarios",

    obtenerTodos() {
        try {
            const datos = JSON.parse(
                localStorage.getItem(this.clave) || "[]"
            );

            return Array.isArray(datos) ? datos : [];

        } catch {
            return [];
        }
    },

    obtenerSesion() {
        try {
            return JSON.parse(
                localStorage.getItem("grupo5_sesion") || "null"
            );

        } catch {
            return null;
        }
    },

    // Obtener la fecha máxima permitida: 18 años atrás.
    obtenerFechaMaximaNacimiento() {

        const hoy = new Date();
        const anio = hoy.getFullYear() - 18;
        const mes = hoy.getMonth();

        const ultimoDia = new Date(anio, mes + 1, 0).getDate();
        const dia = Math.min(hoy.getDate(), ultimoDia);

        return `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    },

    // Comprobar que la fecha exista realmente.
    esFechaValida(valor) {

        if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
            return false;
        }

        const fecha = new Date(valor + "T00:00:00");

        if (Number.isNaN(fecha.getTime())) {
            return false;
        }

        const [anio, mes, dia] = valor.split("-").map(Number);

        return anio > 0 &&
            fecha.getFullYear() === anio &&
            fecha.getMonth() + 1 === mes &&
            fecha.getDate() === dia &&
            fecha <= new Date();
    },

    // Validar que el usuario tenga al menos 18 años.
    esMayorDeEdad(nacimiento) {

        return this.esFechaValida(nacimiento) &&
            nacimiento <= this.obtenerFechaMaximaNacimiento();
    },

    mostrarMensaje(texto, tipo = "danger") {

        const mensaje = document.getElementById("mensaje-edicion");

        if (!mensaje) return;

        mensaje.className = `alert alert-${tipo}`;
        mensaje.textContent = texto;
        mensaje.hidden = false;

        mensaje.setAttribute(
            "role",
            tipo === "danger" ? "alert" : "status"
        );
    },

    limpiarErrores(formulario) {

        formulario.querySelectorAll(".is-invalid").forEach(campo => {

            campo.classList.remove("is-invalid");
            campo.removeAttribute("aria-invalid");

        });

        formulario.querySelectorAll(".invalid-feedback").forEach(elemento => {

            elemento.textContent = "";

        });

        const mensaje = document.getElementById("mensaje-edicion");

        if (mensaje) {

            mensaje.textContent = "";
            mensaje.hidden = true;

        }
    },

    mostrarErrores(errores) {

        Object.entries(errores).forEach(([id, texto]) => {

            const campo = document.getElementById(id);
            const error = document.getElementById("error-" + id);

            if (campo) {

                campo.classList.add("is-invalid");
                campo.setAttribute("aria-invalid", "true");

            }

            if (error) {
                error.textContent = texto;
            }
        });

        this.mostrarMensaje("Revise los campos señalados.");

        const primerCampo = Object.keys(errores)[0];

        if (primerCampo) {

            document.getElementById(primerCampo)?.focus();

        }
    },

    validar(datos, id) {

        const errores = {};

        // Validación del nombre completo.
        if (!datos.nombre) {

            errores["editar-nombre"] =
                "Ingrese el nombre completo.";

        } else if (datos.nombre.length > 80) {

            errores["editar-nombre"] =
                "Máximo 80 caracteres.";

        } else if (datos.nombre.split(/\s+/).length < 2) {

            errores["editar-nombre"] =
                "Debe ingresar al menos un nombre y un apellido.";

        } else if (!/^[\p{L}]+(?:[ '’-][\p{L}]+)*$/u.test(datos.nombre)) {

            errores["editar-nombre"] =
                "El nombre solo puede contener letras, espacios, apóstrofes y guiones.";
        }

        // Validación del correo institucional.
        if (
            !datos.correo ||
            datos.correo.length > 80 ||
            !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)
        ) {

            errores["editar-correo"] =
                "Ingrese un correo válido.";

        } else if (

            this.obtenerTodos().some(usuario =>
                usuario.id !== id &&
                String(usuario.correo).trim().toLowerCase() === datos.correo
            )

        ) {

            errores["editar-correo"] =
                "Ese correo ya pertenece a otro usuario.";
        }

        // Validación del teléfono.
        const telefonoLimpio =
            datos.telefono.replace(/[\s()-]/g, "");

        if (!/^\+?\d{8,15}$/.test(telefonoLimpio)) {

            errores["editar-telefono"] =
                "Ingrese un teléfono válido de 8 a 15 dígitos.";
        }

        // Validación de la fecha de nacimiento.
        if (!datos.nacimiento) {

            errores["editar-nacimiento"] =
                "Ingrese la fecha de nacimiento.";

        } else if (!this.esFechaValida(datos.nacimiento)) {

            errores["editar-nacimiento"] =
                "Ingrese una fecha de nacimiento válida.";

        } else if (!this.esMayorDeEdad(datos.nacimiento)) {

            errores["editar-nacimiento"] =
                "El usuario debe tener al menos 18 años.";
        }

        // Validación del género.
        if (!["f", "m", "o", "n"].includes(datos.genero)) {

            errores["editar-genero"] =
                "Seleccione una opción válida.";
        }

        // Validación del rol.
        if (!["admin", "rectoria", "vice", "dc", "dir"].includes(datos.rol)) {

            errores["editar-rol"] =
                "Seleccione un rol válido.";
        }

        return errores;
    },

    iniciar() {

        const formulario =
            document.getElementById("form-editar-usuario");

        if (!formulario) return;

        // Desactivar mensajes nativos del navegador.
        formulario.noValidate = true;

        const botonGuardar = formulario.querySelector(
            'button[type="submit"]'
        );

        const parametros =
            new URLSearchParams(window.location.search);

        const id = parametros.get("id");

        const sesion = this.obtenerSesion();

        // Verificación de permisos del prototipo.
        if (!sesion || sesion.rol !== "admin") {

            this.mostrarMensaje(
                "Solo el administrador puede modificar usuarios."
            );

            if (botonGuardar) {
                botonGuardar.disabled = true;
            }

            return;
        }

        const usuarios = this.obtenerTodos();

        const usuario = usuarios.find(u => u.id === id);

        if (!usuario) {

            this.mostrarMensaje(
                "No se encontró el usuario solicitado."
            );

            if (botonGuardar) {
                botonGuardar.disabled = true;
            }

            return;
        }

        // Cargar los datos existentes.
        document.getElementById("editar-nombre").value =
            usuario.nombre || "";

        document.getElementById("editar-correo").value =
            usuario.correo || "";

        document.getElementById("editar-telefono").value =
            usuario.telefono || "";

        document.getElementById("editar-nacimiento").value =
            usuario.nacimiento || "";

        document.getElementById("editar-genero").value =
            usuario.genero || "";

        document.getElementById("editar-rol").value =
            usuario.rol || "";

        // Restringir el calendario a mayores de edad.
        const campoNacimiento =
            document.getElementById("editar-nacimiento");

        if (campoNacimiento) {

            campoNacimiento.max =
                this.obtenerFechaMaximaNacimiento();
        }

        // Limpiar las validaciones al modificar un campo.
        const limpiarCampo = evento => {

            const campo = evento.target;

            if (!campo.id) return;

            campo.classList.remove("is-invalid");
            campo.removeAttribute("aria-invalid");

            const error =
                document.getElementById("error-" + campo.id);

            if (error) {
                error.textContent = "";
            }
        };

        formulario.addEventListener("input", limpiarCampo);
        formulario.addEventListener("change", limpiarCampo);

        let guardando = false;

        formulario.addEventListener("submit", evento => {

            evento.preventDefault();

            if (guardando) return;

            this.limpiarErrores(formulario);

            const sesionActual = this.obtenerSesion();

            if (!sesionActual || sesionActual.rol !== "admin") {

                this.mostrarMensaje(
                    "No tiene permisos para realizar esta operación."
                );

                return;
            }

            const datos = {

                nombre: document.getElementById("editar-nombre")
                    .value.trim(),

                correo: document.getElementById("editar-correo")
                    .value.trim().toLowerCase(),

                telefono: document.getElementById("editar-telefono")
                    .value.trim(),

                nacimiento: document.getElementById("editar-nacimiento")
                    .value,

                genero: document.getElementById("editar-genero")
                    .value,

                rol: document.getElementById("editar-rol")
                    .value
            };

            const errores = this.validar(datos, id);

            if (Object.keys(errores).length > 0) {

                this.mostrarErrores(errores);

                return;
            }

            const actuales = this.obtenerTodos();

            const indice = actuales.findIndex(u => u.id === id);

            if (indice === -1) {

                this.mostrarMensaje(
                    "El usuario ya no existe."
                );

                return;
            }

            const usuarioAnterior = actuales[indice];

            // El correo institucional debe ser diferente del personal.
            if (

                String(usuarioAnterior.correoPersonal || "")
                    .trim().toLowerCase() === datos.correo

            ) {

                this.mostrarErrores({

                    "editar-correo":
                        "El correo institucional debe ser diferente del personal."

                });

                return;
            }

            // Conservar los campos que no se están modificando.
            actuales[indice] = {

                ...usuarioAnterior,
                ...datos,

                telefono: datos.telefono.replace(/[\s()-]/g, ""),

                fechaModificacion: new Date().toISOString()
            };

            const correoAnterior = String(usuarioAnterior.correo)
                .trim().toLowerCase();

            const claveCredenciales = "grupo5_credenciales_demo";

            let credenciales = null;

            try {

                if (correoAnterior !== datos.correo) {

                    credenciales = JSON.parse(

                        localStorage.getItem(claveCredenciales) || "{}"

                    );

                    if (Object.hasOwn(credenciales, correoAnterior)) {

                        delete credenciales[correoAnterior];

                    } else {

                        credenciales = null;
                    }
                }

                localStorage.setItem(

                    this.clave,

                    JSON.stringify(actuales)

                );

            } catch {

                this.mostrarMensaje(
                    "No se pudieron guardar los cambios."
                );

                return;
            }

            // Invalidar la credencial de demostración si cambia el correo.
            if (credenciales !== null) {

                try {

                    localStorage.setItem(

                        claveCredenciales,

                        JSON.stringify(credenciales)

                    );

                } catch {

                    this.mostrarMensaje(

                        "Usuario actualizado, pero no se pudo invalidar la credencial anterior.",

                        "warning"

                    );

                    return;
                }
            }

            // Evitar envíos duplicados.
            guardando = true;

            if (botonGuardar) {
                botonGuardar.disabled = true;
            }

            // Mostrar confirmación antes de redirigir.
            this.mostrarMensaje(

                "Usuario actualizado correctamente. Redirigiendo al listado...",

                "success"

            );

            // Regresar automáticamente al listado.
            setTimeout(() => {

                window.location.href = "listado.html";

            }, 1500);

        });
    }
};

document.addEventListener("DOMContentLoaded", () => {

    EditarUsuario.iniciar();

});

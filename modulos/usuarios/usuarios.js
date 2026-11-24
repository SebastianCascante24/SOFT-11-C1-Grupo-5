/*
 * Módulo: Gestión de usuarios
 * HU-01: Registrar usuario
 * HU-08: Consultar usuarios registrados
 * Proyecto Integrador - Grupo 5
 *
 * Migración a Bootstrap.
 * Prototipo académico: no almacena contraseñas.
 */

const Usuarios = {
    clave: "grupo5_usuarios",

    obtenerTodos() {
        const datos = Almacenamiento.obtener(this.clave, []);
        return Array.isArray(datos) ? datos : [];
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

    // Validación de mayoría de edad.
    esMayorDeEdad(nacimiento) {
        return this.esFechaValida(nacimiento) &&
            nacimiento <= this.obtenerFechaMaximaNacimiento();
    },

    validar(datos) {
        const errores = {};
        const usuarios = this.obtenerTodos();
        const formatoCorreo = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

        // Validación de identificación.
        if (!datos.identificacion) {
            errores["u-identificacion"] =
                "Ingrese el número de identificación.";

        } else if (!/^[A-Za-z0-9-]{5,20}$/.test(datos.identificacion)) {
            errores["u-identificacion"] =
                "La identificación debe tener entre 5 y 20 caracteres, usando letras, números o guiones.";

        } else if (
            usuarios.some(usuario =>
                usuario.identificacion === datos.identificacion
            )
        ) {
            errores["u-identificacion"] =
                "Ya existe un usuario con esta identificación.";
        }

        // Validación del nombre.
        if (Validadores.estaVacio(datos.nombre)) {
            errores["u-nombre"] =
                "Ingrese el nombre completo.";

        } else if (
            Validadores.superaLongitudMaxima(datos.nombre, 80)
        ) {
            errores["u-nombre"] =
                "Máximo 80 caracteres.";

        } else if (datos.nombre.trim().split(/\s+/).length < 2) {
            errores["u-nombre"] =
                "Debe ingresar al menos un nombre y un apellido.";

        } else if (
            !/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u.test(datos.nombre)
        ) {
            errores["u-nombre"] =
                "El nombre solo puede contener letras, espacios, apóstrofes y guiones.";
        }

        // Validación del teléfono.
        if (!datos.telefono) {
            errores["u-telefono"] =
                "Ingrese el número telefónico.";

        } else {
            const telefonoLimpio =
                datos.telefono.replace(/[\s()-]/g, "");

            if (!/^\+?\d{8,15}$/.test(telefonoLimpio)) {
                errores["u-telefono"] =
                    "Ingrese un teléfono válido de 8 a 15 dígitos.";
            }
        }

        // Validación del correo institucional.
        if (Validadores.estaVacio(datos.correo)) {
            errores["u-correo"] =
                "Ingrese el correo institucional.";

        } else if (
            datos.correo.length > 80 ||
            !formatoCorreo.test(datos.correo)
        ) {
            errores["u-correo"] =
                "Ingrese un correo válido.";

        } else if (
            usuarios.some(usuario =>
                (usuario.correo || "").trim().toLowerCase() ===
                datos.correo
            )
        ) {
            errores["u-correo"] =
                "Este correo ya está registrado.";
        }

        // Validación del correo personal.
        if (!datos.correoPersonal) {
            errores["u-correo-personal"] =
                "Ingrese el correo personal.";

        } else if (
            datos.correoPersonal.length > 80 ||
            !formatoCorreo.test(datos.correoPersonal)
        ) {
            errores["u-correo-personal"] =
                "Ingrese un correo personal válido.";

        } else if (datos.correoPersonal === datos.correo) {
            errores["u-correo-personal"] =
                "El correo personal debe ser diferente del institucional.";

        } else if (
            usuarios.some(usuario =>
                (usuario.correoPersonal || "").trim().toLowerCase() ===
                datos.correoPersonal
            )
        ) {
            errores["u-correo-personal"] =
                "Este correo personal ya está registrado.";
        }

        // Validación de la fecha de nacimiento.
        if (!datos.nacimiento) {
            errores["u-nacimiento"] =
                "Ingrese la fecha de nacimiento.";

        } else if (!this.esFechaValida(datos.nacimiento)) {
            errores["u-nacimiento"] =
                "Ingrese una fecha de nacimiento válida.";

        } else if (!this.esMayorDeEdad(datos.nacimiento)) {
            errores["u-nacimiento"] =
                "El usuario debe tener al menos 18 años.";
        }

        // Validación del género.
        if (!["f", "m", "o", "n"].includes(datos.genero)) {
            errores["u-genero"] =
                "Seleccione una opción.";
        }

        // Validación del rol.
        if (
            !["admin", "rectoria", "vice", "dc", "dir"]
                .includes(datos.rol)
        ) {
            errores["u-rol"] =
                "Seleccione un rol válido.";
        }

        // Validación de la contraseña.
        if (
            !/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9\s])\S{8,15}$/
                .test(datos.password)
        ) {
            errores["u-password"] =
                "Use de 8 a 15 caracteres, mayúscula, minúscula, número y símbolo.";
        }

        return errores;
    },

    registrar(datos) {
        const usuarios = this.obtenerTodos();

        // Nunca almacenar contraseñas en localStorage.
        const nuevo = {
            id: crypto.randomUUID(),
            identificacion: datos.identificacion,
            nombre: datos.nombre,
            telefono: datos.telefono,
            correo: datos.correo,
            correoPersonal: datos.correoPersonal,
            nacimiento: datos.nacimiento,
            genero: datos.genero,
            rol: datos.rol,
            fechaRegistro: new Date().toISOString()
        };

        usuarios.push(nuevo);

        return Almacenamiento.guardar(this.clave, usuarios);
    },

    limpiarErrores(formulario) {
        formulario.querySelectorAll(".mensaje-error")
            .forEach(elemento => {
                elemento.textContent = "";
            });

        formulario.querySelectorAll(".is-invalid, .is-valid")
            .forEach(elemento => {
                elemento.classList.remove("is-invalid", "is-valid");
            });

        formulario.querySelectorAll("[aria-invalid]")
            .forEach(elemento => {
                elemento.removeAttribute("aria-invalid");
            });

        const resumen = document.getElementById("resumen-errores");

        if (resumen) {
            resumen.hidden = true;
            resumen.textContent = "";
        }
    },

    mostrarMensaje(mensaje, tipo = "danger") {
        const resumen = document.getElementById("resumen-errores");

        if (!resumen) return;

        resumen.classList.remove(
            "alert-danger",
            "alert-success",
            "alert-warning",
            "alert-info"
        );

        resumen.classList.add("alert", `alert-${tipo}`);

        resumen.setAttribute(
            "role",
            tipo === "success" ? "status" : "alert"
        );

        resumen.textContent = mensaje;
        resumen.hidden = false;
    },

    mostrarErrores(errores) {
        Object.entries(errores).forEach(([campo, mensaje]) => {
            const entrada = document.getElementById(campo);
            const error = document.getElementById("error-" + campo);

            if (entrada) {
                entrada.classList.add("is-invalid");
                entrada.setAttribute("aria-invalid", "true");
            }

            if (error) {
                error.textContent = mensaje;
            }
        });

        this.mostrarMensaje(
            "Revise los campos señalados antes de continuar.",
            "danger"
        );

        const primerCampo =
            document.getElementById(Object.keys(errores)[0]);

        if (primerCampo) {
            primerCampo.focus();
        }
    },

    iniciarFormulario() {
        const formulario = document.getElementById("form-usuario");

        if (!formulario) return;

        // Desactivar mensajes nativos del navegador.
        formulario.noValidate = true;

        // Limitar el calendario a personas mayores de edad.
        const campoNacimiento =
            document.getElementById("u-nacimiento");

        if (campoNacimiento) {
            campoNacimiento.max =
                this.obtenerFechaMaximaNacimiento();
        }

        // Limpiar el error cuando se modifica un campo.
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

        formulario.addEventListener("submit", evento => {
            evento.preventDefault();

            this.limpiarErrores(formulario);

            const obtenerValor = id =>
                document.getElementById(id)?.value || "";

            const datos = {
                identificacion:
                    obtenerValor("u-identificacion").trim(),

                nombre:
                    obtenerValor("u-nombre").trim(),

                telefono:
                    obtenerValor("u-telefono").trim(),

                correo:
                    obtenerValor("u-correo").trim().toLowerCase(),

                correoPersonal:
                    obtenerValor("u-correo-personal").trim().toLowerCase(),

                nacimiento:
                    obtenerValor("u-nacimiento"),

                genero:
                    obtenerValor("u-genero"),

                rol:
                    obtenerValor("u-rol"),

                password:
                    obtenerValor("u-password")
            };

            const errores = this.validar(datos);

            if (Object.keys(errores).length > 0) {
                this.mostrarErrores(errores);
                return;
            }

            try {
                const registroExitoso = this.registrar(datos);

                if (registroExitoso) {
                    formulario.reset();

                    this.limpiarErrores(formulario);

                    this.mostrarMensaje(
                        "El usuario se registró correctamente. Redirigiendo al listado...",
                        "success"
                    );

                    // Evitar registros duplicados durante la redirección.
                    formulario
                        .querySelectorAll('button[type="submit"], input[type="submit"]')
                        .forEach(boton => {
                            boton.disabled = true;
                        });

                    // Redirigir al listado después del registro.
                    setTimeout(() => {
                        window.location.href = "listado.html";
                    }, 1500);

                } else {
                    this.mostrarMensaje(
                        "No se pudo guardar el registro. Intente nuevamente.",
                        "danger"
                    );
                }

            } catch (error) {
                console.error("Error al registrar usuario:", error);

                this.mostrarMensaje(
                    "Ocurrió un error al registrar el usuario.",
                    "danger"
                );
            }
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {
    if (
        typeof Almacenamiento !== "undefined" &&
        typeof Validadores !== "undefined"
    ) {
        Usuarios.iniciarFormulario();
    } else {
        console.error(
            "Faltan dependencias del módulo de usuarios."
        );
    }
});
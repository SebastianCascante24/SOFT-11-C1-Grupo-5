
"use strict";

/*
 * Módulo: Gestión de escuelas
 * Registro y modificación de escuelas
 * Proyecto Integrador - Grupo 5
 * Prototipo académico con localStorage y Bootstrap
 */

const Escuelas = {

    clave: "grupo5_escuelas",

    claveUsuarios: "grupo5_usuarios",

    // Obtener las escuelas registradas.
    obtenerEscuelas() {

        const datos = JSON.parse(
            localStorage.getItem(this.clave) || "[]"
        );

        if (!Array.isArray(datos)) {

            throw new Error(
                "Formato de almacenamiento de escuelas inválido."
            );
        }

        return datos;
    },

    // Obtener los usuarios registrados.
    obtenerUsuarios() {

        const datos = JSON.parse(
            localStorage.getItem(this.claveUsuarios) || "[]"
        );

        if (!Array.isArray(datos)) {

            throw new Error(
                "Formato de almacenamiento de usuarios inválido."
            );
        }

        return datos;
    },

    // Obtener únicamente usuarios con rol de director.
    obtenerDirectores() {

        return this.obtenerUsuarios().filter(usuario =>

            usuario.rol === "dir" &&

            String(usuario.nombre || "").trim() !== ""

        );
    },

    // Normalizar códigos para evitar duplicados.
    normalizarCodigo(codigo) {

        return String(codigo || "")
            .trim()
            .toUpperCase();
    },

    // Mostrar mensajes integrados en Bootstrap.
    mostrarMensaje(texto, tipo = "danger") {

        const mensaje = document.getElementById(
            "mensajeRegistro"
        );

        if (!mensaje) return;

        mensaje.className = `alert alert-${tipo} mt-3`;

        mensaje.textContent = texto;

        mensaje.hidden = false;

        mensaje.setAttribute(

            "role",

            tipo === "danger" ? "alert" : "status"

        );
    },

    // Limpiar mensajes anteriores.
    limpiarMensaje() {

        const mensaje = document.getElementById(
            "mensajeRegistro"
        );

        if (!mensaje) return;

        mensaje.textContent = "";

        mensaje.hidden = true;
    },

    // Mostrar errores debajo de cada campo.
    mostrarError(campo, texto) {

        campo.input.classList.add("is-invalid");

        campo.input.setAttribute(
            "aria-invalid",
            "true"
        );

        campo.error.textContent = texto;
    },

    // Limpiar errores individuales.
    limpiarError(campo) {

        campo.input.classList.remove("is-invalid");

        campo.input.removeAttribute("aria-invalid");

        campo.error.textContent = "";
    },

    // Cargar directores en el selector.
    cargarDirectores(directorActual = "") {

        const selector = document.getElementById(
            "directorEscuela"
        );

        selector.replaceChildren();

        const opcionInicial = document.createElement(
            "option"
        );

        opcionInicial.value = "";

        opcionInicial.textContent =
            "Seleccione un director";

        selector.append(opcionInicial);

        const directores = this.obtenerDirectores();

        const nombres = [...new Set(

            directores.map(usuario =>

                String(usuario.nombre).trim()

            )

        )];

        nombres.sort((a, b) =>

            a.localeCompare(b, "es")

        );

        nombres.forEach(nombre => {

            const opcion = document.createElement(
                "option"
            );

            opcion.value = nombre;

            opcion.textContent = nombre;

            selector.append(opcion);

        });

        // Conservar el director previamente asignado
        // cuando se modifica una escuela existente.
        if (

            directorActual &&

            !nombres.includes(directorActual)

        ) {

            const opcion = document.createElement(
                "option"
            );

            opcion.value = directorActual;

            opcion.textContent =
                directorActual + " (Asignación actual)";

            selector.append(opcion);
        }

        selector.value = directorActual || "";

        return nombres.length;
    },

    // Validar los datos del formulario.
    validar(escuela, escuelas, escuelaOriginal = null) {

        const errores = {};

        // Código de escuela.
        if (!escuela.codigo) {

            errores.codigo =
                "El código de la escuela es obligatorio.";

        } else if (escuela.codigo.length > 20) {

            errores.codigo =
                "El código debe tener un máximo de 20 caracteres.";

        } else if (

            !/^[A-Z0-9-]+$/.test(escuela.codigo)

        ) {

            errores.codigo =
                "El código solo puede contener letras, números y guiones.";

        } else if (

            !escuelaOriginal &&

            escuelas.some(item =>

                this.normalizarCodigo(item.codigo) ===
                escuela.codigo

            )

        ) {

            errores.codigo =
                "Ya existe una escuela registrada con este código.";
        }

        // Nombre de escuela.
        if (!escuela.nombre) {

            errores.nombre =
                "El nombre de la escuela es obligatorio.";

        } else if (escuela.nombre.length > 100) {

            errores.nombre =
                "El nombre debe tener un máximo de 100 caracteres.";
        }

        // Director de escuela.
        if (!escuela.director) {

            errores.director =
                "Seleccione un director de escuela.";

        } else {

            const directorValido =
                this.obtenerDirectores().some(usuario =>

                    String(usuario.nombre).trim() ===
                    escuela.director

                );

            const esDirectorAnterior =

                escuelaOriginal !== null &&

                escuelaOriginal.director ===
                escuela.director;

            if (!directorValido && !esDirectorAnterior) {

                errores.director =
                    "Seleccione un usuario con rol de director.";
            }
        }

        return errores;
    },

    // Inicializar el módulo.
    iniciar() {

        const formulario = document.getElementById(
            "formularioEscuela"
        );

        if (!formulario) return;

        const parametros = new URLSearchParams(
            window.location.search
        );

        const codigoEditar = parametros.get("codigo");

        const modoEdicion = parametros.has("codigo");

        const tituloFormulario = document.getElementById(
            "tituloFormularioEscuela"
        );

        const botonGuardar = document.getElementById(
            "botonGuardarEscuela"
        );

        const campos = {

            codigo: {

                input: document.getElementById(
                    "codigoEscuela"
                ),

                error: document.getElementById(
                    "errorCodigo"
                )
            },

            nombre: {

                input: document.getElementById(
                    "nombreEscuela"
                ),

                error: document.getElementById(
                    "errorNombre"
                )
            },

            director: {

                input: document.getElementById(
                    "directorEscuela"
                ),

                error: document.getElementById(
                    "errorDirector"
                )
            }
        };

        let escuelaOriginal = null;

        let guardando = false;

        formulario.noValidate = true;

        this.limpiarMensaje();

        // Cargar los datos iniciales.
        try {

            if (modoEdicion) {

                tituloFormulario.textContent =
                    "Modificar escuela";

                botonGuardar.textContent =
                    "Guardar cambios";

                document.title =
                    "Modificar escuela | Desarrollo Curricular y Docente";

                const descripcion = tituloFormulario.nextElementSibling;

                if (descripcion) {

                    descripcion.textContent =
                        "Actualice los datos de la escuela seleccionada.";
                }

                escuelaOriginal = this.obtenerEscuelas().find(

                    escuela => escuela.codigo === codigoEditar

                );

                if (!escuelaOriginal) {

                    throw new Error(
                        "No se encontró la escuela seleccionada."
                    );
                }

                campos.codigo.input.value =
                    escuelaOriginal.codigo;

                campos.nombre.input.value =
                    escuelaOriginal.nombre;

                campos.codigo.input.readOnly = true;

                this.cargarDirectores(
                    escuelaOriginal.director || ""
                );

            } else {

                const cantidadDirectores =
                    this.cargarDirectores();

                if (cantidadDirectores === 0) {

                    this.mostrarMensaje(

                        "No hay usuarios con rol de director. Registre un director antes de crear una escuela.",

                        "warning"

                    );
                }
            }

        } catch (error) {

            console.error(
                "Error al inicializar el formulario:",
                error
            );

            this.mostrarMensaje(

                "No fue posible cargar los datos del formulario. Regrese al listado e inténtelo nuevamente."

            );

            formulario.querySelectorAll(
                "input, select, button"
            ).forEach(elemento => {

                elemento.disabled = true;

            });

            return;
        }

        // Limpiar los errores al modificar un campo.
        Object.values(campos).forEach(campo => {

            const limpiar = () => {

                this.limpiarError(campo);

                this.limpiarMensaje();
            };

            campo.input.addEventListener(
                "input",
                limpiar
            );

            campo.input.addEventListener(
                "change",
                limpiar
            );
        });

        // Convertir el código a mayúsculas.
        campos.codigo.input.addEventListener(
            "blur",
            () => {

                if (!modoEdicion) {

                    campos.codigo.input.value =
                        this.normalizarCodigo(
                            campos.codigo.input.value
                        );
                }
            }
        );

        // Registrar o modificar una escuela.
        formulario.addEventListener("submit", evento => {

            evento.preventDefault();

            if (guardando) return;

            this.limpiarMensaje();

            Object.values(campos).forEach(campo => {

                this.limpiarError(campo);

            });

            const escuela = {

                codigo: modoEdicion

                    ? escuelaOriginal.codigo

                    : this.normalizarCodigo(
                        campos.codigo.input.value
                    ),

                nombre: campos.nombre.input.value.trim(),

                director: campos.director.input.value.trim()
            };

            try {

                const escuelas = this.obtenerEscuelas();

                const indiceEscuela = modoEdicion

                    ? escuelas.findIndex(item =>

                        item.codigo === codigoEditar

                    )

                    : -1;

                if (modoEdicion && indiceEscuela === -1) {

                    this.mostrarMensaje(
                        "No se encontró la escuela que desea modificar."
                    );

                    return;
                }

                const errores = this.validar(

                    escuela,

                    escuelas,

                    modoEdicion
                        ? escuelas[indiceEscuela]
                        : null

                );

                // Mostrar errores de validación.
                if (Object.keys(errores).length > 0) {

                    Object.entries(errores).forEach(

                        ([clave, texto]) => {

                            this.mostrarError(
                                campos[clave],
                                texto
                            );
                        }
                    );

                    this.mostrarMensaje(

                        "Revise los campos señalados antes de continuar."

                    );

                    campos[
                        Object.keys(errores)[0]
                    ].input.focus();

                    return;
                }

                // Actualizar o registrar la escuela.
                if (modoEdicion) {

                    escuelas[indiceEscuela] = {

                        ...escuelas[indiceEscuela],

                        nombre: escuela.nombre,

                        director: escuela.director

                    };

                } else {

                    escuelas.push(escuela);
                }

                // Guardar los datos.
                localStorage.setItem(

                    this.clave,

                    JSON.stringify(escuelas)

                );

                guardando = true;

                formulario.querySelectorAll(
                    "input, select, button"
                ).forEach(elemento => {

                    elemento.disabled = true;

                });

                this.mostrarMensaje(

                    modoEdicion

                        ? "Escuela modificada correctamente."

                        : "Escuela registrada correctamente.",

                    "success"

                );

                // Redireccionar automáticamente al listado.
                setTimeout(() => {

                    window.location.href = "listado.html";

                }, 1500);

            } catch (error) {

                console.error(
                    "Error al guardar la escuela:",
                    error
                );

                this.mostrarMensaje(

                    "No fue posible guardar la escuela. Revise el almacenamiento del navegador."

                );
            }
        });

        // Restablecer el formulario.
        formulario.addEventListener("reset", evento => {

            if (guardando) {

                evento.preventDefault();

                return;
            }

            if (modoEdicion) {

                evento.preventDefault();

                campos.codigo.input.value =
                    escuelaOriginal.codigo;

                campos.nombre.input.value =
                    escuelaOriginal.nombre;

                campos.director.input.value =
                    escuelaOriginal.director || "";
            }

            Object.values(campos).forEach(campo => {

                this.limpiarError(campo);

            });

            this.limpiarMensaje();
        });
    }
};

// Ejecutar cuando el documento esté disponible.
document.addEventListener("DOMContentLoaded", () => {

    Escuelas.iniciar();

});

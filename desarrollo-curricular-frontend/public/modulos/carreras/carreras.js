
"use strict";

/*
 * Módulo: Gestión de carreras
 * Registro y modificación de carreras
 * Proyecto Integrador - Grupo 5
 */

const Carreras = {

    clave: "grupo5_carreras",

    claveEscuelas: "grupo5_escuelas",

    claveUsuarios: "grupo5_usuarios",

    // Leer información del almacenamiento.
    leer(clave) {

        const datos = JSON.parse(
            localStorage.getItem(clave) || "[]"
        );

        if (!Array.isArray(datos)) {

            throw new Error(
                "Formato de almacenamiento inválido."
            );
        }

        return datos;
    },

    // Normalizar el código de carrera.
    normalizarCodigo(codigo) {

        return String(codigo || "")
            .trim()
            .toUpperCase();
    },

    // Obtener usuarios con rol de director.
    obtenerDirectores() {

        return this.leer(this.claveUsuarios)
            .filter(usuario => usuario.rol === "dir");
    },

    // Agregar opciones a un selector.
    opciones(select, items, valor, texto) {

        items.forEach(item => {

            const opcion = document.createElement("option");

            opcion.value = String(valor(item));

            opcion.textContent = texto(item);

            select.append(opcion);
        });
    },

    // Mostrar notificaciones de Bootstrap.
    mostrarMensaje(texto, tipo = "danger") {

        const mensaje = document.getElementById(
            "mensaje-carrera"
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

    // Limpiar notificaciones.
    limpiarMensaje() {

        const mensaje = document.getElementById(
            "mensaje-carrera"
        );

        if (!mensaje) return;

        mensaje.textContent = "";

        mensaje.hidden = true;
    },

    // Mostrar errores individuales.
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

    // Validar la información de la carrera.
    validar(carrera, carreras, modoEdicion) {

        const errores = {};

        const escuelas = this.leer(this.claveEscuelas);

        const directores = this.obtenerDirectores();

        // Validación del código.
        if (!carrera.codigo) {

            errores.codigo =
                "El código de la carrera es obligatorio.";

        } else if (carrera.codigo.length > 20) {

            errores.codigo =
                "El código debe tener un máximo de 20 caracteres.";

        } else if (

            !modoEdicion &&

            !/^[A-Z0-9-]+$/.test(carrera.codigo)

        ) {

            errores.codigo =
                "El código solo puede contener letras, números y guiones.";

        } else if (

            !modoEdicion &&

            carreras.some(item =>

                this.normalizarCodigo(item.codigo) ===
                carrera.codigo

            )

        ) {

            errores.codigo =
                "Ya existe una carrera registrada con este código.";
        }

        // Validación del nombre.
        if (!carrera.nombre) {

            errores.nombre =
                "El nombre de la carrera es obligatorio.";

        } else if (carrera.nombre.length > 100) {

            errores.nombre =
                "El nombre debe tener un máximo de 100 caracteres.";
        }

        // Validación de la escuela.
        if (!carrera.escuelaCodigo) {

            errores.escuela =
                "Seleccione una escuela.";

        } else if (

            !escuelas.some(escuela =>

                String(escuela.codigo) ===
                carrera.escuelaCodigo

            )

        ) {

            errores.escuela =
                "La escuela seleccionada no está disponible.";
        }

        // Validación del director.
        if (!carrera.directorId) {

            errores.director =
                "Seleccione un director de carrera.";

        } else if (

            !directores.some(usuario =>

                String(usuario.id) ===
                carrera.directorId

            )

        ) {

            errores.director =
                "Seleccione un usuario con rol de director.";
        }

        return errores;
    },

    // Inicializar el formulario.
    iniciar() {

        const formulario = document.getElementById(
            "form-carrera"
        );

        if (!formulario) return;

        const parametros = new URLSearchParams(
            window.location.search
        );

        const codigoEditar = parametros.get("codigo");

        const modoEdicion = parametros.has("codigo");

        const titulo = document.getElementById(
            "tituloCarrera"
        );

        const descripcion = document.getElementById(
            "descripcionCarrera"
        );

        const botonGuardar = document.getElementById(
            "botonGuardarCarrera"
        );

        const botonRestablecer = document.getElementById(
            "botonRestablecerCarrera"
        );

        const botonSalir = document.getElementById(
            "botonSalirCarrera"
        );

        const campos = {

            codigo: {

                input: document.getElementById("codigo"),

                error: document.getElementById(
                    "errorCodigoCarrera"
                )
            },

            nombre: {

                input: document.getElementById("nombre"),

                error: document.getElementById(
                    "errorNombreCarrera"
                )
            },

            escuela: {

                input: document.getElementById("escuela"),

                error: document.getElementById(
                    "errorEscuelaCarrera"
                )
            },

            director: {

                input: document.getElementById("director"),

                error: document.getElementById(
                    "errorDirectorCarrera"
                )
            }
        };

        let carreraOriginal = null;

        let guardando = false;

        formulario.noValidate = true;

        botonRestablecer.hidden = false;

        this.limpiarMensaje();

        // Recuperar los valores originales.
        const restaurarDatos = () => {

            if (!carreraOriginal) return;

            campos.codigo.input.value =
                carreraOriginal.codigo;

            campos.nombre.input.value =
                carreraOriginal.nombre;

            campos.escuela.input.value =
                String(carreraOriginal.escuelaCodigo || "");

            campos.director.input.value =
                String(carreraOriginal.directorId || "");
        };

        // Cargar escuelas y directores.
        try {

            const escuelas = this.leer(this.claveEscuelas);

            const directores = this.obtenerDirectores();

            this.opciones(

                campos.escuela.input,

                escuelas,

                escuela => escuela.codigo,

                escuela =>
                    escuela.nombre +
                    " (" + escuela.codigo + ")"

            );

            this.opciones(

                campos.director.input,

                directores,

                usuario => usuario.id,

                usuario =>

                    usuario.nombre +

                    (usuario.correo
                        ? " — " + usuario.correo
                        : "")

            );

            // Configurar el modo de edición.
            if (modoEdicion) {

                carreraOriginal = this.leer(this.clave)
                    .find(carrera =>

                        carrera.codigo === codigoEditar

                    );

                if (!carreraOriginal) {

                    throw new Error(
                        "No se encontró la carrera seleccionada."
                    );
                }

                titulo.textContent = "Modificar carrera";

                document.title =
                    "Modificar carrera | Desarrollo Curricular y Docente";

                if (descripcion) {

                    descripcion.textContent =
                        "Actualice los datos de la carrera seleccionada.";
                }

                botonGuardar.textContent = "Guardar cambios";

                botonSalir.textContent = "Cancelar";

                campos.codigo.input.readOnly = true;

                restaurarDatos();

            }

            // Advertir si faltan datos relacionados.
            if (!escuelas.length) {

                this.mostrarMensaje(

                    "Primero debe registrar una escuela.",

                    "warning"

                );

            } else if (!directores.length) {

                this.mostrarMensaje(

                    "Primero debe registrar un usuario con rol de director.",

                    "warning"

                );
            }

        } catch (error) {

            console.error(
                "Error al cargar el formulario:",
                error
            );

            this.mostrarMensaje(

                "No fue posible cargar los datos de la carrera. Regrese al listado e inténtelo nuevamente."

            );

            formulario.querySelectorAll(
                "input, select, button"
            ).forEach(elemento => {

                elemento.disabled = true;

            });

            return;
        }

        // Limpiar errores al modificar los campos.
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

        // Registrar o modificar una carrera.
        formulario.addEventListener("submit", evento => {

            evento.preventDefault();

            if (guardando) return;

            this.limpiarMensaje();

            Object.values(campos).forEach(campo => {

                this.limpiarError(campo);

            });

            const carrera = {

                codigo: modoEdicion

                    ? carreraOriginal.codigo

                    : this.normalizarCodigo(
                        campos.codigo.input.value
                    ),

                nombre:
                    campos.nombre.input.value.trim(),

                escuelaCodigo:
                    campos.escuela.input.value,

                directorId:
                    campos.director.input.value
            };

            try {

                const carreras = this.leer(this.clave);

                const indice = modoEdicion

                    ? carreras.findIndex(item =>

                        item.codigo === codigoEditar

                    )

                    : -1;

                if (modoEdicion && indice === -1) {

                    this.mostrarMensaje(

                        "No se encontró la carrera que desea modificar."

                    );

                    return;
                }

                const errores = this.validar(

                    carrera,

                    carreras,

                    modoEdicion

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

                // Modificar una carrera existente.
                if (modoEdicion) {

                    carreras[indice] = {

                        ...carreras[indice],

                        nombre: carrera.nombre,

                        escuelaCodigo: carrera.escuelaCodigo,

                        directorId: carrera.directorId
                    };

                } else {

                    // Registrar una nueva carrera.
                    carreras.push({

                        id: crypto.randomUUID(),

                        ...carrera,

                        fechaRegistro:
                            new Date().toISOString()

                    });
                }

                // Guardar los datos.
                localStorage.setItem(

                    this.clave,

                    JSON.stringify(carreras)

                );

                guardando = true;

                formulario.querySelectorAll(
                    "input, select, button"
                ).forEach(elemento => {

                    elemento.disabled = true;

                });

                this.mostrarMensaje(

                    modoEdicion

                        ? "Carrera modificada correctamente."

                        : "Carrera registrada correctamente.",

                    "success"

                );

                // Regresar automáticamente al listado.
                setTimeout(() => {

                    window.location.href = "listado.html";

                }, 1500);

            } catch (error) {

                console.error(
                    "Error al guardar la carrera:",
                    error
                );

                this.mostrarMensaje(

                    "No fue posible guardar la carrera. Revise el almacenamiento del navegador."

                );
            }
        });

        // Restablecer correctamente el formulario.
        formulario.addEventListener("reset", evento => {

            if (guardando) {

                evento.preventDefault();

                return;
            }

            if (modoEdicion) {

                // Impedir que el navegador vacíe los campos.
                evento.preventDefault();

                // Recuperar los valores originales.
                restaurarDatos();
            }

            Object.values(campos).forEach(campo => {

                this.limpiarError(campo);

            });

            this.limpiarMensaje();
        });
    }
};

document.addEventListener("DOMContentLoaded", () => {

    Carreras.iniciar();

});

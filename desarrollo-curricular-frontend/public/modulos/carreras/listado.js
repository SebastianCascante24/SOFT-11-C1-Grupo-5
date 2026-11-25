
"use strict";

/*
 * Módulo: Gestión de carreras
 * Consulta, búsqueda y asignación de directores
 * Proyecto Integrador - Grupo 5
 */

const ListadoCarreras = {

    clave: "grupo5_carreras",

    claveEscuelas: "grupo5_escuelas",

    claveUsuarios: "grupo5_usuarios",

    carreras: [],

    escuelas: [],

    usuarios: [],

    carreraSeleccionada: null,

    modalDirector: null,

    // Leer información almacenada.
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

    // Normalizar textos para facilitar las búsquedas.
    normalizarTexto(valor) {

        return String(valor ?? "")
            .trim()
            .toLocaleLowerCase("es")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    },

    // Mostrar notificaciones.
    mostrarMensaje(texto, tipo = "info") {

        const mensaje = document.getElementById(
            "mensaje-carreras"
        );

        mensaje.className = `alert alert-${tipo}`;

        mensaje.textContent = texto;

        mensaje.hidden = false;
    },

    // Limpiar notificaciones.
    limpiarMensaje() {

        const mensaje = document.getElementById(
            "mensaje-carreras"
        );

        mensaje.textContent = "";

        mensaje.hidden = true;
    },

    // Cargar los datos de los módulos relacionados.
    cargarDatos() {

        this.carreras = this.leer(this.clave);

        this.escuelas = this.leer(this.claveEscuelas);

        this.usuarios = this.leer(this.claveUsuarios);
    },

    // Cargar las escuelas disponibles para el filtro.
    cargarFiltroEscuelas() {

        const filtro = document.getElementById(
            "filtrar-escuela"
        );

        const opcionInicial = document.createElement(
            "option"
        );

        opcionInicial.value = "";

        opcionInicial.textContent = "Todas las escuelas";

        filtro.replaceChildren(opcionInicial);

        const escuelasOrdenadas = [...this.escuelas]
            .sort((a, b) =>

                String(a.nombre).localeCompare(
                    String(b.nombre),
                    "es"
                )

            );

        escuelasOrdenadas.forEach(escuela => {

            const opcion = document.createElement(
                "option"
            );

            opcion.value = String(escuela.codigo);

            opcion.textContent = escuela.nombre;

            filtro.append(opcion);
        });
    },

    // Mostrar una fila informativa.
    mostrarFilaVacia(texto) {

        const tabla = document.getElementById(
            "tabla-carreras"
        );

        const fila = tabla.insertRow();

        const celda = fila.insertCell();

        celda.colSpan = 5;

        celda.className =
            "text-center text-secondary py-4";

        celda.textContent = texto;
    },

    // Actualizar el contador.
    actualizarTotal(coincidencias, filtrando) {

        const contador = document.getElementById(
            "total-carreras"
        );

        contador.textContent = filtrando

            ? `Mostrando ${coincidencias} de ${this.carreras.length} carreras registradas.`

            : `Total de carreras registradas: ${this.carreras.length}`;
    },

    // Crear una fila de la tabla.
    crearFila(carrera) {

        const tabla = document.getElementById(
            "tabla-carreras"
        );

        const fila = tabla.insertRow();

        const escuela = this.escuelas.find(item =>

            String(item.codigo) ===
            String(carrera.escuelaCodigo)

        );

        const director = this.usuarios.find(usuario =>

            String(usuario.id) ===
            String(carrera.directorId)

        );

        const campos = [

            carrera.codigo,

            carrera.nombre,

            escuela?.nombre || "Escuela no disponible",

            director?.nombre || "Director no disponible"

        ];

        campos.forEach(valor => {

            const celda = fila.insertCell();

            celda.textContent =
                valor || "No disponible";

        });

        // Contenedor de acciones.
        const celdaAcciones = fila.insertCell();

        const acciones = document.createElement("div");

        acciones.className =
            "d-flex flex-wrap gap-2";

        // Acción para modificar la carrera.
        const modificar = document.createElement("a");

       modificar.className =
    "btn btn-secondary btn-sm d-inline-flex align-items-center justify-content-center px-3 py-2";

        modificar.textContent = "Modificar carrera";

        modificar.href =
            "formulario.html?codigo=" +
            encodeURIComponent(carrera.codigo);

        modificar.setAttribute(

            "aria-label",

            "Modificar carrera " + carrera.nombre

        );

        // Acción para cambiar director.
        const cambiarDirector =
            document.createElement("button");

        cambiarDirector.type = "button";

        cambiarDirector.className =
    "btn btn-secondary btn-sm d-inline-flex align-items-center justify-content-center px-3 py-2";

        cambiarDirector.textContent =
            "Cambiar director";

        cambiarDirector.setAttribute(

            "aria-label",

            "Cambiar director de " + carrera.nombre

        );

        cambiarDirector.addEventListener("click", () => {

            this.abrirModalDirector(carrera);

        });

        acciones.append(
            modificar,
            cambiarDirector
        );

        celdaAcciones.append(acciones);
    },

    // Aplicar búsqueda y filtro simultáneamente.
    renderizar() {

        const tabla = document.getElementById(
            "tabla-carreras"
        );

        const buscador = document.getElementById(
            "buscar-carrera"
        );

        const filtro = document.getElementById(
            "filtrar-escuela"
        );

        const texto = this.normalizarTexto(
            buscador.value
        );

        const escuelaSeleccionada = filtro.value;

        const filtrando =

            texto !== "" ||

            escuelaSeleccionada !== "";

        tabla.replaceChildren();

        this.limpiarMensaje();

        const coincidencias = this.carreras.filter(carrera => {

            const coincideBusqueda =

                this.normalizarTexto(carrera.codigo)
                    .includes(texto) ||

                this.normalizarTexto(carrera.nombre)
                    .includes(texto);

            const coincideEscuela =

                escuelaSeleccionada === "" ||

                String(carrera.escuelaCodigo) ===
                escuelaSeleccionada;

            return coincideBusqueda && coincideEscuela;

        });

        this.actualizarTotal(

            coincidencias.length,

            filtrando

        );

        if (this.carreras.length === 0) {

            this.mostrarFilaVacia(
                "No hay carreras registradas."
            );

            return;
        }

        if (coincidencias.length === 0) {

            this.mostrarMensaje(

                "No se encontraron carreras con los criterios seleccionados.",

                "info"

            );

            this.mostrarFilaVacia(
                "No hay resultados para mostrar."
            );

            return;
        }

        coincidencias.forEach(carrera => {

            this.crearFila(carrera);

        });
    },

    // Limpiar errores del modal.
    limpiarErrorDirector() {

        const selector = document.getElementById(
            "nuevoDirectorCarrera"
        );

        const error = document.getElementById(
            "errorNuevoDirector"
        );

        const mensaje = document.getElementById(
            "mensajeModalDirector"
        );

        selector.classList.remove("is-invalid");

        selector.removeAttribute("aria-invalid");

        error.textContent = "";

        mensaje.textContent = "";

        mensaje.hidden = true;
    },

    // Mostrar un error dentro del modal.
    mostrarErrorModal(texto) {

        const mensaje = document.getElementById(
            "mensajeModalDirector"
        );

        mensaje.textContent = texto;

        mensaje.hidden = false;
    },

    // Abrir el modal para cambiar director.
    abrirModalDirector(carrera) {

        this.carreraSeleccionada = carrera.codigo;

        this.limpiarErrorDirector();

        const selector = document.getElementById(
            "nuevoDirectorCarrera"
        );

        const nombreCarrera = document.getElementById(
            "nombreCarreraDirector"
        );

        const botonGuardar = document.getElementById(
            "guardarNuevoDirector"
        );

        nombreCarrera.textContent =
            "Carrera: " + carrera.nombre +
            " (" + carrera.codigo + ")";

        botonGuardar.disabled = false;

        const opcionInicial = document.createElement(
            "option"
        );

        opcionInicial.value = "";

        opcionInicial.textContent =
            "Seleccione un director";

        selector.replaceChildren(opcionInicial);

        try {

            const directores = this.leer(this.claveUsuarios)
                .filter(usuario =>

                    usuario.rol === "dir"

                );

            directores.sort((a, b) =>

                String(a.nombre).localeCompare(
                    String(b.nombre),
                    "es"
                )

            );

            directores.forEach(usuario => {

                const opcion = document.createElement(
                    "option"
                );

                opcion.value = String(usuario.id);

                opcion.textContent =

                    usuario.nombre +

                    (usuario.correo
                        ? " — " + usuario.correo
                        : "");

                selector.append(opcion);
            });

            const directorActual =
                String(carrera.directorId ?? "");

            const existeDirector = directores.some(usuario =>

                String(usuario.id) === directorActual

            );

            selector.value = existeDirector

                ? directorActual

                : "";

            if (directores.length === 0) {

                this.mostrarErrorModal(

                    "No hay usuarios disponibles con rol de director."

                );

                botonGuardar.disabled = true;
            }

        } catch (error) {

            console.error(
                "Error al cargar directores:",
                error
            );

            this.mostrarErrorModal(

                "No fue posible cargar los directores disponibles."

            );

            botonGuardar.disabled = true;
        }

        this.modalDirector.show();
    },

    // Guardar el nuevo director.
    guardarDirector(evento) {

        evento.preventDefault();

        this.limpiarErrorDirector();

        const selector = document.getElementById(
            "nuevoDirectorCarrera"
        );

        const error = document.getElementById(
            "errorNuevoDirector"
        );

        const botonGuardar = document.getElementById(
            "guardarNuevoDirector"
        );

        const directorId = selector.value;

        try {

            const usuarios = this.leer(this.claveUsuarios);

            const directorValido = usuarios.some(usuario =>

                String(usuario.id) === directorId &&

                usuario.rol === "dir"

            );

            if (!directorId || !directorValido) {

                selector.classList.add("is-invalid");

                selector.setAttribute(
                    "aria-invalid",
                    "true"
                );

                error.textContent =
                    "Seleccione un director válido.";

                selector.focus();

                return;
            }

            const carreras = this.leer(this.clave);

            const indice = carreras.findIndex(carrera =>

                carrera.codigo ===
                this.carreraSeleccionada

            );

            if (indice === -1) {

                this.mostrarErrorModal(

                    "No se encontró la carrera seleccionada."

                );

                return;
            }

            botonGuardar.disabled = true;

            carreras[indice] = {

                ...carreras[indice],

                directorId: directorId

            };

            localStorage.setItem(

                this.clave,

                JSON.stringify(carreras)

            );

            // Actualizar los datos sin recargar la página.
            this.carreras = carreras;

            this.usuarios = usuarios;

            this.modalDirector.hide();

            this.renderizar();

            this.mostrarMensaje(

                "Director de carrera actualizado correctamente.",

                "success"

            );

        } catch (error) {

            console.error(
                "Error al cambiar director:",
                error
            );

            this.mostrarErrorModal(

                "No fue posible guardar el nuevo director."

            );

        } finally {

            botonGuardar.disabled = false;
        }
    },

    // Inicializar el listado.
    iniciar() {

        const tabla = document.getElementById(
            "tabla-carreras"
        );

        if (!tabla) return;

        const buscador = document.getElementById(
            "buscar-carrera"
        );

        const filtro = document.getElementById(
            "filtrar-escuela"
        );

        const formularioDirector = document.getElementById(
            "formCambiarDirector"
        );

        const selectorDirector = document.getElementById(
            "nuevoDirectorCarrera"
        );

        const elementoModal = document.getElementById(
            "modalCambiarDirector"
        );

        try {

            this.modalDirector = new bootstrap.Modal(
                elementoModal
            );

            this.cargarDatos();

            this.cargarFiltroEscuelas();

            this.renderizar();

        } catch (error) {

            console.error(
                "Error al cargar carreras:",
                error
            );

            this.mostrarMensaje(

                "No fue posible cargar las carreras registradas.",

                "danger"

            );

            this.mostrarFilaVacia(
                "Información no disponible."
            );

            document.getElementById(
                "total-carreras"
            ).textContent = "Total no disponible.";

            buscador.disabled = true;

            filtro.disabled = true;

            return;
        }

        // Búsqueda en tiempo real.
        buscador.addEventListener("input", () => {

            this.renderizar();

        });

        // Filtro por escuela.
        filtro.addEventListener("change", () => {

            this.renderizar();

        });

        // Guardar cambios de director.
        formularioDirector.addEventListener("submit", evento => {

            this.guardarDirector(evento);

        });

        // Limpiar errores al seleccionar un director.
        selectorDirector.addEventListener("change", () => {

            this.limpiarErrorDirector();

        });

        // Limpiar el modal cuando se cierre.
        elementoModal.addEventListener("hidden.bs.modal", () => {

            this.carreraSeleccionada = null;

            this.limpiarErrorDirector();

            formularioDirector.reset();

        });
    }
};

document.addEventListener("DOMContentLoaded", () => {

    ListadoCarreras.iniciar();

});


"use strict";

/*
 * Módulo: Gestión de escuelas
 * Consulta y búsqueda de escuelas registradas
 * Proyecto Integrador - Grupo 5
 * Prototipo académico con localStorage y Bootstrap
 */

const ListadoEscuelas = {

    clave: "grupo5_escuelas",

    // Obtener las escuelas registradas.
    obtenerTodas() {

        const datos = JSON.parse(
            localStorage.getItem(this.clave) || "[]"
        );

        if (!Array.isArray(datos)) {

            throw new Error("Formato de escuelas inválido.");
        }

        return datos;
    },

    // Normalizar texto para facilitar las búsquedas.
    normalizarTexto(valor) {

        return String(valor ?? "")
            .trim()
            .toLocaleLowerCase("es")
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    },

    // Mostrar mensajes integrados en Bootstrap.
    mostrarMensaje(texto, tipo = "info") {

        const mensaje = document.getElementById(
            "mensajeBusquedaEscuela"
        );

        if (!mensaje) return;

        mensaje.className = `alert alert-${tipo}`;

        mensaje.textContent = texto;

        mensaje.hidden = false;
    },

    // Ocultar mensajes anteriores.
    limpiarMensaje() {

        const mensaje = document.getElementById(
            "mensajeBusquedaEscuela"
        );

        if (!mensaje) return;

        mensaje.textContent = "";

        mensaje.hidden = true;
    },

    // Mostrar el contador de escuelas.
    actualizarTotal(total, coincidencias, filtrando) {

        const contador = document.getElementById(
            "totalEscuelas"
        );

        if (!contador) return;

        contador.textContent = filtrando

            ? `Mostrando ${coincidencias} de ${total} escuelas registradas.`

            : `Total de escuelas registradas: ${total}`;
    },

    // Mostrar una fila informativa cuando no existan datos.
    mostrarFilaVacia(texto) {

        const tabla = document.getElementById(
            "tablaEscuelas"
        );

        const fila = tabla.insertRow();

        const celda = fila.insertCell();

        celda.colSpan = 4;

        celda.className =
            "text-center text-secondary py-4";

        celda.textContent = texto;
    },

    // Crear una fila para cada escuela.
    crearFila(escuela) {

        const tabla = document.getElementById(
            "tablaEscuelas"
        );

        const fila = tabla.insertRow();

        const campos = [

            escuela.codigo,

            escuela.nombre,

            escuela.director

        ];

        campos.forEach(valor => {

            const celda = fila.insertCell();

            celda.textContent =
                valor || "No disponible";

        });

        // Acciones disponibles.
        const celdaAcciones = fila.insertCell();

        const enlaceModificar =
            document.createElement("a");

        enlaceModificar.className =
            "btn btn-secondary btn-sm";

        enlaceModificar.textContent = "Modificar";

        enlaceModificar.href =
            "formulario.html?codigo=" +
            encodeURIComponent(escuela.codigo);

        enlaceModificar.setAttribute(

            "aria-label",

            "Modificar escuela " +
            (escuela.nombre || escuela.codigo)

        );

        celdaAcciones.append(enlaceModificar);
    },

    // Mostrar las escuelas en la tabla.
    renderizar(escuelas, busqueda = "") {

        const tabla = document.getElementById(
            "tablaEscuelas"
        );

        tabla.replaceChildren();

        this.limpiarMensaje();

        const texto = this.normalizarTexto(busqueda);

        const filtrando = texto.length > 0;

        // Buscar por código, nombre o director.
        const coincidencias = escuelas.filter(escuela => {

            const campos = [

                escuela.codigo,

                escuela.nombre,

                escuela.director

            ];

            return campos.some(valor =>

                this.normalizarTexto(valor).includes(texto)

            );
        });

        this.actualizarTotal(

            escuelas.length,

            coincidencias.length,

            filtrando

        );

        // Verificar si existen escuelas registradas.
        if (escuelas.length === 0) {

            this.mostrarFilaVacia(
                "No hay escuelas registradas."
            );

            return;
        }

        // Verificar si la búsqueda tiene resultados.
        if (coincidencias.length === 0) {

            this.mostrarMensaje(

                "No se encontraron escuelas con ese criterio.",

                "info"

            );

            this.mostrarFilaVacia(
                "No hay resultados para mostrar."
            );

            return;
        }

        // Generar las filas correspondientes.
        coincidencias.forEach(escuela => {

            this.crearFila(escuela);

        });
    },

    // Inicializar el módulo.
    iniciar() {

        const tabla = document.getElementById(
            "tablaEscuelas"
        );

        const buscador = document.getElementById(
            "buscarEscuela"
        );

        if (!tabla || !buscador) {

            console.error(
                "Faltan elementos del listado de escuelas."
            );

            return;
        }

        let escuelas;

        try {

            escuelas = this.obtenerTodas();

        } catch (error) {

            console.error(
                "Error al consultar las escuelas:",
                error
            );

            this.mostrarMensaje(

                "No se pudieron cargar las escuelas registradas.",

                "danger"

            );

            this.mostrarFilaVacia(
                "Información no disponible."
            );

            document.getElementById(
                "totalEscuelas"
            ).textContent = "Total no disponible.";

            buscador.disabled = true;

            return;
        }

        // Mostrar el listado inicial.
        this.renderizar(escuelas);

        // Búsqueda en tiempo real.
        buscador.addEventListener("input", () => {

            this.renderizar(

                escuelas,

                buscador.value

            );

        });
    }
};

// Ejecutar cuando el documento esté disponible.
document.addEventListener("DOMContentLoaded", () => {

    ListadoEscuelas.iniciar();

});

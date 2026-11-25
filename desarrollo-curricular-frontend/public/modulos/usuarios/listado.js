
/*
 * Módulo: Gestión de usuarios
 * HU-08: Consultar usuarios registrados
 * Proyecto Integrador - Grupo 5
 *
 * Lógica independiente del listado de usuarios.
 * Migración a Bootstrap - Tercera iteración.
 */

const ListadoUsuarios = {

    clave: "grupo5_usuarios",

    usuarios: [],

    generos: {
        f: "Femenino",
        m: "Masculino",
        o: "Otro",
        n: "Prefiero no indicarlo"
    },

    roles: {
        admin: "Administrador",
        rectoria: "Rectoría",
        vice: "Vicerrectoría",
        dc: "Desarrollo Curricular",
        dir: "Dirección de Escuela / Carrera"
    },

    // Obtener los usuarios almacenados.
    obtenerUsuarios() {

        const datos = JSON.parse(
            localStorage.getItem(this.clave) || "[]"
        );

        return Array.isArray(datos) ? datos : [];
    },

    // Mostrar mensajes integrados en la interfaz.
    mostrarMensaje(texto, tipo = "normal") {

        const mensaje = document.getElementById("mensaje");

        if (!mensaje) return;

        mensaje.className = tipo === "normal"
            ? "text-muted small mb-3"
            : `alert alert-${tipo} mb-3`;

        mensaje.setAttribute(
            "role",
            tipo === "danger" ? "alert" : "status"
        );

        mensaje.textContent = texto;
    },

    // Convertir la fecha al formato de Costa Rica.
    formatearFecha(valor) {

        if (!valor) {
            return "No disponible";
        }

        const fecha = new Date(valor);

        if (Number.isNaN(fecha.getTime())) {
            return "No disponible";
        }

        return fecha.toLocaleDateString("es-CR");
    },

    // Crear una celda de la tabla.
    crearCelda(valor) {

        const celda = document.createElement("td");

        celda.textContent = valor || "No disponible";

        return celda;
    },

    // Crear los botones de acciones.
    crearAcciones(usuario) {

        const celda = document.createElement("td");

        const acciones = document.createElement("div");

        acciones.className = "d-flex flex-wrap gap-2";

        // Botón editar usuario seleccionado.
        const enlaceEditar = document.createElement("a");

        enlaceEditar.href =
            "editar.html?id=" +
            encodeURIComponent(usuario.id);

        enlaceEditar.textContent = "Editar";

        enlaceEditar.className =
            "btn btn-outline-primary btn-sm";

        acciones.appendChild(enlaceEditar);

        // Botón consultar perfil del usuario seleccionado.
        const enlacePerfil = document.createElement("a");

        enlacePerfil.href =
            "perfil.html?id=" +
            encodeURIComponent(usuario.id);

        enlacePerfil.textContent = "Ver perfil";

        enlacePerfil.className =
            "btn btn-outline-secondary btn-sm";

        acciones.appendChild(enlacePerfil);

        celda.appendChild(acciones);

        return celda;
    },

    // Construir la tabla de usuarios.
    renderizarTabla(usuarios) {

        const tabla = document.getElementById("tabla-usuarios");

        if (!tabla) return;

        tabla.replaceChildren();

        usuarios.forEach(usuario => {

            const fila = document.createElement("tr");

            const valores = [

                usuario.nombre || "No disponible",

                usuario.correo || "No disponible",

                this.generos[usuario.genero] ||
                    usuario.genero ||
                    "No disponible",

                this.roles[usuario.rol] ||
                    usuario.rol ||
                    "No disponible",

                this.formatearFecha(usuario.fechaRegistro)
            ];

            valores.forEach(valor => {

                fila.appendChild(
                    this.crearCelda(valor)
                );

            });

            fila.appendChild(
                this.crearAcciones(usuario)
            );

            tabla.appendChild(fila);

        });
    },

    // Normalizar texto para facilitar las búsquedas.
    normalizarTexto(valor) {

        return String(valor || "")
            .trim()
            .toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "");
    },

    // Buscar usuarios por nombre o correo institucional.
    filtrarUsuarios(texto) {

        const busqueda = this.normalizarTexto(texto);

        const encontrados = this.usuarios.filter(usuario => {

            const nombre = this.normalizarTexto(usuario.nombre);

            const correo = this.normalizarTexto(usuario.correo);

            return nombre.includes(busqueda) ||
                correo.includes(busqueda);
        });

        this.renderizarTabla(encontrados);

        if (this.usuarios.length === 0) {

            this.mostrarMensaje(
                "No existen usuarios registrados.",
                "info"
            );

        } else if (encontrados.length === 0) {

            this.mostrarMensaje(
                "No se encontraron usuarios que coincidan con la búsqueda.",
                "info"
            );

        } else if (busqueda) {

            this.mostrarMensaje(
                `Usuarios encontrados: ${encontrados.length}`
            );

        } else {

            this.mostrarMensaje(
                `Total de usuarios registrados: ${this.usuarios.length}`
            );
        }
    },

    // Inicializar el listado.
    iniciar() {

        const tabla = document.getElementById("tabla-usuarios");

        const buscador = document.getElementById("buscar-usuario");

        const mensaje = document.getElementById("mensaje");

        if (!tabla || !buscador || !mensaje) {
            return;
        }

        try {

            this.usuarios = this.obtenerUsuarios();

        } catch (error) {

            console.error(
                "Error al consultar usuarios:",
                error
            );

            this.mostrarMensaje(
                "No fue posible leer los usuarios almacenados.",
                "danger"
            );

            return;
        }

        // Mostrar todos los usuarios inicialmente.
        this.filtrarUsuarios("");

        // Actualizar resultados durante la búsqueda.
        buscador.addEventListener("input", () => {

            this.filtrarUsuarios(buscador.value);

        });
    }
};

// Ejecutar cuando el documento esté disponible.
document.addEventListener("DOMContentLoaded", () => {

    ListadoUsuarios.iniciar();

});

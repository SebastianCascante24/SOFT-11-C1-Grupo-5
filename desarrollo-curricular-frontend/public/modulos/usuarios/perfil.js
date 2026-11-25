
"use strict";

/*
 * Módulo: Gestión de usuarios
 * Consulta y modificación del perfil personal
 * Consulta de perfiles por el administrador
 * Proyecto Integrador - Grupo 5
 * Prototipo académico con localStorage y Bootstrap
 */

const Perfil = {

    clave: "grupo5_usuarios",

    opciones: ["👤", "👩‍💻", "👨‍💻", "🎓", "⭐", "🌿"],

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

    // Obtener los usuarios registrados.
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

    // Obtener la sesión actual.
    obtenerSesion() {

        try {

            return JSON.parse(
                localStorage.getItem("grupo5_sesion") || "null"
            );

        } catch {

            return null;
        }
    },

    // Obtener el usuario autenticado.
    obtenerUsuarioAutenticado() {

        const sesion = this.obtenerSesion();

        if (!sesion) return null;

        return this.obtenerTodos().find(
            usuario => String(usuario.id) === String(sesion.id)
        ) || null;
    },

    // Comprobar que el usuario puede modificar su propio perfil.
    puedeModificarPerfil(id) {

        const usuario = this.obtenerUsuarioAutenticado();

        return usuario !== null &&
            String(usuario.id) === String(id);
    },

    // Obtener la fecha máxima de nacimiento permitida.
    obtenerFechaMaximaNacimiento() {

        const hoy = new Date();

        const anio = hoy.getFullYear() - 18;

        const mes = hoy.getMonth();

        const ultimoDia =
            new Date(anio, mes + 1, 0).getDate();

        const dia = Math.min(
            hoy.getDate(),
            ultimoDia
        );

        return `${anio}-${String(mes + 1).padStart(2, "0")}-${String(dia).padStart(2, "0")}`;
    },

    // Validar que la fecha exista realmente.
    esFechaValida(valor) {

        if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) {
            return false;
        }

        const fecha = new Date(valor + "T00:00:00");

        if (Number.isNaN(fecha.getTime())) {
            return false;
        }

        const [anio, mes, dia] =
            valor.split("-").map(Number);

        return anio > 0 &&
            fecha.getFullYear() === anio &&
            fecha.getMonth() + 1 === mes &&
            fecha.getDate() === dia &&
            fecha <= new Date();
    },

    // Validar mayoría de edad.
    esMayorDeEdad(nacimiento) {

        return this.esFechaValida(nacimiento) &&
            nacimiento <= this.obtenerFechaMaximaNacimiento();
    },

    // Mostrar mensajes integrados en Bootstrap.
    mostrarMensaje(id, texto, tipo = "success") {

        const mensaje = document.getElementById(id);

        if (!mensaje) return;

        mensaje.className = `alert alert-${tipo} mt-3`;

        mensaje.textContent = texto;

        mensaje.hidden = false;

        mensaje.setAttribute(
            "role",
            tipo === "danger" ? "alert" : "status"
        );
    },

    limpiarMensaje(id) {

        const mensaje = document.getElementById(id);

        if (!mensaje) return;

        mensaje.textContent = "";

        mensaje.hidden = true;
    },

    // Calcular la edad del usuario.
    calcularEdad(nacimiento) {

        if (!this.esFechaValida(nacimiento)) {

            return "No disponible";
        }

        const fecha = new Date(nacimiento + "T00:00:00");

        const hoy = new Date();

        let edad = hoy.getFullYear() - fecha.getFullYear();

        if (

            hoy.getMonth() < fecha.getMonth() ||

            (
                hoy.getMonth() === fecha.getMonth() &&
                hoy.getDate() < fecha.getDate()
            )

        ) {

            edad--;
        }

        return edad + " años";
    },

    // Formatear fecha de nacimiento.
    formatearFecha(fecha) {

        if (!this.esFechaValida(fecha)) {

            return "No disponible";
        }

        const valor = new Date(fecha + "T00:00:00");

        return valor.toLocaleDateString("es-CR", {

            day: "2-digit",

            month: "2-digit",

            year: "numeric"

        });
    },

    // Configurar los títulos según el perfil consultado.
    configurarVista(esPerfilPropio) {

        document.getElementById(
            "titulo-pagina-perfil"
        ).textContent = esPerfilPropio

            ? "Mi perfil"

            : "Consultar perfil de usuario";

        document.getElementById(
            "descripcion-perfil"
        ).textContent = esPerfilPropio

            ? "Consulte y actualice su información personal y configure su avatar."

            : "Consulte la información del usuario seleccionado.";

        document.getElementById(
            "titulo-perfil"
        ).textContent = esPerfilPropio

            ? "Información de mi perfil"

            : "Información del usuario";

        document.getElementById(
            "boton-editar-perfil"
        ).hidden = !esPerfilPropio;

        document.getElementById(
            "seccion-avatar"
        ).hidden = !esPerfilPropio;

        document.getElementById(
            "form-editar-perfil"
        ).hidden = true;
    },

    // Mostrar información del usuario seleccionado.
    mostrarDatos(usuario) {

        const datos = document.getElementById("perfil-datos");

        datos.replaceChildren();

        datos.className = "";

        datos.setAttribute("role", "status");

        // Encabezado del perfil.
        const encabezado = document.createElement("div");

        encabezado.className =
            "d-flex align-items-center gap-3 py-3 mb-4 border-bottom";

        // Avatar alineado a la izquierda.
        const icono = document.createElement("div");

        icono.id = "avatar-actual";

        icono.className =
            "rounded-circle d-flex align-items-center justify-content-center flex-shrink-0 fs-1";

        icono.style.width = "84px";

        icono.style.height = "84px";

        icono.style.backgroundColor = "var(--azul-suave)";

        icono.style.border = "1px solid var(--borde)";

        icono.style.lineHeight = "1";

        icono.textContent = usuario.avatar || "👤";

        // Información junto al avatar.
        const informacion = document.createElement("div");

        informacion.className = "flex-grow-1";

        informacion.style.minWidth = "0";

        const nombre = document.createElement("h3");

        nombre.className = "h5 fw-semibold mb-1 text-break";

        nombre.textContent =
            usuario.nombre || "No disponible";

        const rol = document.createElement("p");

        rol.className = "text-body-secondary mb-1";

        rol.textContent =
            this.roles[usuario.rol] ||
            usuario.rol ||
            "No disponible";

        const correo = document.createElement("p");

        correo.className =
            "text-body-secondary small mb-0 text-break";

        correo.textContent =
            usuario.correo || "No disponible";

        informacion.append(nombre, rol, correo);

        encabezado.append(icono, informacion);

        datos.append(encabezado);

        // Sección de datos personales.
        const titulo = document.createElement("h3");

        titulo.className = "h5 mb-3";

        titulo.textContent = "Datos personales";

        datos.append(titulo);

        const campos = [

            ["Identificación", usuario.identificacion],

            ["Número telefónico", usuario.telefono],

            ["Correo personal", usuario.correoPersonal],

            ["Género", this.generos[usuario.genero]],

            ["Edad", this.calcularEdad(usuario.nacimiento)],

            [
                "Fecha de nacimiento",
                this.formatearFecha(usuario.nacimiento)
            ]
        ];

        const fila = document.createElement("div");

        fila.className = "row g-3 mb-4";

        campos.forEach(([titulo, valor]) => {

            const columna = document.createElement("div");

            columna.className = "col-12 col-md-6";

            const etiqueta = document.createElement("strong");

            etiqueta.className = "d-block mb-1";

            etiqueta.textContent = titulo;

            const contenido = document.createElement("p");

            contenido.className =
                "mb-2 text-body-secondary text-break";

            contenido.textContent =
                valor || "No disponible";

            columna.append(etiqueta, contenido);

            fila.append(columna);

        });

        datos.append(fila);
    },

    // Personalización exclusiva del avatar propio.
    mostrarAvatares(usuario) {

        if (!this.puedeModificarPerfil(usuario.id)) {
            return;
        }

        const contenedor = document.getElementById("avatares");

        contenedor.replaceChildren();

        contenedor.className = "d-flex flex-wrap gap-2";

        this.opciones.forEach(opcion => {

            const boton = document.createElement("button");

            boton.type = "button";

            boton.textContent = opcion;

            const seleccionado =
                (usuario.avatar || "👤") === opcion;

            boton.className = seleccionado

                ? "btn btn-primary rounded-circle d-flex align-items-center justify-content-center fs-4"

                : "btn btn-secondary rounded-circle d-flex align-items-center justify-content-center fs-4";

            boton.style.width = "52px";

            boton.style.height = "52px";

            boton.style.padding = "0";

            boton.style.lineHeight = "1";

            boton.setAttribute(
                "aria-label",
                "Elegir avatar " + opcion
            );

            boton.setAttribute(
                "aria-pressed",
                String(seleccionado)
            );

            boton.addEventListener("click", () => {

                if (!this.puedeModificarPerfil(usuario.id)) {

                    this.mostrarMensaje(
                        "mensaje-avatar",
                        "No tiene permisos para modificar este perfil.",
                        "danger"
                    );

                    return;
                }

                const actuales = this.obtenerTodos();

                const indice = actuales.findIndex(

                    u => String(u.id) === String(usuario.id)

                );

                if (indice === -1) {

                    this.mostrarMensaje(
                        "mensaje-avatar",
                        "No se encontró el usuario.",
                        "danger"
                    );

                    return;
                }

                actuales[indice].avatar = opcion;

                try {

                    localStorage.setItem(

                        this.clave,

                        JSON.stringify(actuales)

                    );

                    usuario.avatar = opcion;

                    this.mostrarDatos(usuario);

                    contenedor.querySelectorAll("button").forEach(b => {

                        const activo = b === boton;

                        b.classList.toggle("btn-primary", activo);

                        b.classList.toggle("btn-secondary", !activo);

                        b.setAttribute(
                            "aria-pressed",
                            String(activo)
                        );

                    });

                    const encabezado = document.getElementById(
                        "encabezado-avatar"
                    );

                    if (encabezado) {

                        encabezado.textContent = opcion;
                    }

                    this.mostrarMensaje(
                        "mensaje-avatar",
                        "Avatar guardado correctamente."
                    );

                } catch {

                    this.mostrarMensaje(
                        "mensaje-avatar",
                        "No se pudo guardar el avatar.",
                        "danger"
                    );
                }
            });

            contenedor.append(boton);

        });
    },

    // Limpiar las validaciones anteriores.
    limpiarValidaciones(formulario) {

        formulario.querySelectorAll(".is-invalid").forEach(campo => {

            campo.classList.remove("is-invalid");

            campo.removeAttribute("aria-invalid");

        });

        formulario.querySelectorAll(".invalid-feedback").forEach(error => {

            error.textContent = "";

        });

        this.limpiarMensaje("mensaje-editar-perfil");
    },

    // Mostrar error debajo del campo correspondiente.
    marcarError(id, texto) {

        const campo = document.getElementById(id);

        const error = document.getElementById("error-" + id);

        if (!campo) return;

        campo.classList.add("is-invalid");

        campo.setAttribute("aria-invalid", "true");

        if (error) {

            error.textContent = texto;
        }
    },

    // Validar los datos personales.
    validar(datos, usuario) {

        const errores = {};

        // Nombre completo.
        if (!datos.nombre) {

            errores["perfil-nombre"] =
                "Ingrese el nombre completo.";

        } else if (datos.nombre.length > 80) {

            errores["perfil-nombre"] =
                "Máximo 80 caracteres.";

        } else if (datos.nombre.split(/\s+/).length < 2) {

            errores["perfil-nombre"] =
                "Ingrese al menos un nombre y un apellido.";

        } else if (

            !/^[\p{L}]+(?:[ '’-][\p{L}]+)*$/u.test(datos.nombre)

        ) {

            errores["perfil-nombre"] =
                "El nombre solo puede contener letras, espacios, apóstrofes y guiones.";
        }

        // Número telefónico.
        const telefonoLimpio = datos.telefono.replace(
            /[\s()-]/g,
            ""
        );

        if (!/^\+?\d{8,15}$/.test(telefonoLimpio)) {

            errores["perfil-telefono"] =
                "Ingrese un teléfono válido de 8 a 15 dígitos.";
        }

        // Correo personal.
        if (datos.correoPersonal) {

            if (

                datos.correoPersonal.length > 80 ||

                !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correoPersonal)

            ) {

                errores["perfil-correo-personal"] =
                    "Ingrese un correo personal válido.";

            } else if (

                datos.correoPersonal ===
                String(usuario.correo || "").trim().toLowerCase()

            ) {

                errores["perfil-correo-personal"] =
                    "El correo personal debe ser diferente del institucional.";

            } else if (

                this.obtenerTodos().some(u =>

                    String(u.id) !== String(usuario.id) &&

                    (
                        String(u.correoPersonal || "")
                            .trim().toLowerCase() === datos.correoPersonal ||

                        String(u.correo || "")
                            .trim().toLowerCase() === datos.correoPersonal
                    )
                )

            ) {

                errores["perfil-correo-personal"] =
                    "Este correo ya está registrado.";
            }
        }

        // Fecha de nacimiento.
        if (!datos.nacimiento) {

            errores["perfil-nacimiento"] =
                "Ingrese la fecha de nacimiento.";

        } else if (!this.esFechaValida(datos.nacimiento)) {

            errores["perfil-nacimiento"] =
                "Ingrese una fecha de nacimiento válida.";

        } else if (!this.esMayorDeEdad(datos.nacimiento)) {

            errores["perfil-nacimiento"] =
                "El usuario debe tener al menos 18 años.";
        }

        // Género.
        if (!["f", "m", "o", "n"].includes(datos.genero)) {

            errores["perfil-genero"] =
                "Seleccione un género válido.";
        }

        return errores;
    },

    // Inicialización del módulo.
    iniciar() {

        const usuarioAutenticado =
            this.obtenerUsuarioAutenticado();

        const usuarios = this.obtenerTodos();

        const parametros =
            new URLSearchParams(window.location.search);

        const idConsultado = parametros.get("id");

        const botonEditar = document.getElementById(
            "boton-editar-perfil"
        );

        const formulario = document.getElementById(
            "form-editar-perfil"
        );

        const botonCancelar = document.getElementById(
            "cancelar-edicion-perfil"
        );

        const seccionAvatar = document.getElementById(
            "seccion-avatar"
        );

        const volverUsuarios = document.getElementById(
            "volver-usuarios"
        );

        if (!botonEditar || !formulario ||
            !botonCancelar || !seccionAvatar) {

            console.error("Faltan elementos del módulo de perfil.");

            return;
        }

        // Ocultar inicialmente las acciones personales.
        botonEditar.hidden = true;

        formulario.hidden = true;

        seccionAvatar.hidden = true;

        // Verificar que exista una sesión válida.
        if (!usuarioAutenticado) {

            this.mostrarMensaje(
                "perfil-datos",
                "No se encontró una sesión válida. Inicie sesión nuevamente.",
                "danger"
            );

            if (volverUsuarios) {

                volverUsuarios.hidden = true;
            }

            return;
        }

        const esAdministrador =
            usuarioAutenticado.rol === "admin";

        if (volverUsuarios) {

            volverUsuarios.hidden = !esAdministrador;
        }

        // Determinar qué usuario se desea consultar.
        const idObjetivo = parametros.has("id")

            ? idConsultado

            : String(usuarioAutenticado.id);

        const esPerfilPropio =
            String(usuarioAutenticado.id) === idObjetivo;

        // Solo el administrador puede consultar perfiles ajenos.
        if (!esPerfilPropio && !esAdministrador) {

            this.mostrarMensaje(
                "perfil-datos",
                "No tiene permisos para consultar el perfil de otro usuario.",
                "danger"
            );

            return;
        }

        // Buscar al usuario seleccionado.
        const usuario = usuarios.find(

            u => String(u.id) === idObjetivo

        );

        if (!usuario) {

            this.mostrarMensaje(
                "perfil-datos",
                "No se encontró el usuario solicitado.",
                "danger"
            );

            return;
        }

        // Configurar la pantalla según el perfil.
        this.configurarVista(esPerfilPropio);

        this.mostrarDatos(usuario);

        // Mantener el avatar del encabezado correspondiente
        // al usuario autenticado, no al usuario consultado.
        const avatarEncabezado = document.getElementById(
            "encabezado-avatar"
        );

        if (avatarEncabezado) {

            avatarEncabezado.textContent =
                usuarioAutenticado.avatar || "👤";
        }

        // Si se consulta otro usuario, finalizar aquí.
        // No se habilitan eventos de edición ni de avatar.
        if (!esPerfilPropio) {

            return;
        }

        formulario.noValidate = true;

        this.limpiarMensaje("mensaje-avatar");

        this.limpiarMensaje("mensaje-editar-perfil");

        this.mostrarAvatares(usuario);

        // Restringir la fecha de nacimiento.
        document.getElementById("perfil-nacimiento").max =
            this.obtenerFechaMaximaNacimiento();

        // Abrir formulario de edición personal.
        botonEditar.addEventListener("click", () => {

            if (!this.puedeModificarPerfil(usuario.id)) {
                return;
            }

            this.limpiarValidaciones(formulario);

            document.getElementById("perfil-nombre").value =
                usuario.nombre || "";

            document.getElementById("perfil-telefono").value =
                usuario.telefono || "";

            document.getElementById("perfil-correo-personal").value =
                usuario.correoPersonal || "";

            document.getElementById("perfil-nacimiento").value =
                usuario.nacimiento || "";

            document.getElementById("perfil-nacimiento").max =
                this.obtenerFechaMaximaNacimiento();

            document.getElementById("perfil-genero").value =
                usuario.genero || "";

            formulario.hidden = false;

            formulario.scrollIntoView({

                behavior: "smooth",

                block: "start"

            });

            document.getElementById("perfil-nombre").focus({

                preventScroll: true

            });
        });

        // Limpiar errores al modificar un campo.
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

        // Cancelar edición.
        botonCancelar.addEventListener("click", () => {

            formulario.reset();

            this.limpiarValidaciones(formulario);

            formulario.hidden = true;

            botonEditar.focus();

        });

        // Guardar cambios del perfil personal.
        formulario.addEventListener("submit", evento => {

            evento.preventDefault();

            this.limpiarValidaciones(formulario);

            if (!this.puedeModificarPerfil(usuario.id)) {

                this.mostrarMensaje(
                    "mensaje-editar-perfil",
                    "No tiene permisos para modificar este perfil.",
                    "danger"
                );

                return;
            }

            const datos = {

                nombre: document.getElementById("perfil-nombre")
                    .value.trim(),

                telefono: document.getElementById("perfil-telefono")
                    .value.trim(),

                correoPersonal: document.getElementById("perfil-correo-personal")
                    .value.trim().toLowerCase(),

                nacimiento: document.getElementById("perfil-nacimiento")
                    .value,

                genero: document.getElementById("perfil-genero")
                    .value
            };

            const errores = this.validar(datos, usuario);

            if (Object.keys(errores).length > 0) {

                Object.entries(errores).forEach(([campo, mensaje]) => {

                    this.marcarError(campo, mensaje);

                });

                this.mostrarMensaje(
                    "mensaje-editar-perfil",
                    "Revise los campos señalados.",
                    "danger"
                );

                document.getElementById(
                    Object.keys(errores)[0]
                )?.focus();

                return;
            }

            const actuales = this.obtenerTodos();

            const indice = actuales.findIndex(

                u => String(u.id) === String(usuario.id)

            );

            if (indice === -1) {

                this.mostrarMensaje(
                    "mensaje-editar-perfil",
                    "No se encontró el usuario.",
                    "danger"
                );

                return;
            }

            actuales[indice] = {

                ...actuales[indice],

                ...datos,

                telefono: datos.telefono.replace(
                    /[\s()-]/g,
                    ""
                ),

                fechaModificacion: new Date().toISOString()
            };

            try {

                localStorage.setItem(

                    this.clave,

                    JSON.stringify(actuales)

                );

                Object.assign(usuario, actuales[indice]);

                this.mostrarDatos(usuario);

                this.mostrarMensaje(
                    "mensaje-editar-perfil",
                    "Perfil actualizado correctamente."
                );

            } catch {

                this.mostrarMensaje(
                    "mensaje-editar-perfil",
                    "No se pudieron guardar los cambios.",
                    "danger"
                );
            }
        });
    }
};

// Ejecutar cuando el documento esté disponible.
document.addEventListener("DOMContentLoaded", () => {

    Perfil.iniciar();

});

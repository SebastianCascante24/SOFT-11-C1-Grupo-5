
"use strict";

/*
 * Módulo: Gestión de usuarios
 * Consulta y modificación del perfil personal
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
    dir: "Director"
  },

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

  calcularEdad(nacimiento) {
    if (!nacimiento) return "No disponible";

    const fecha = new Date(nacimiento + "T00:00:00");
    const hoy = new Date();

    if (Number.isNaN(fecha.getTime()) || fecha > hoy) {
      return "No disponible";
    }

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

  formatearFecha(fecha) {
    if (!fecha) return "No disponible";

    const valor = new Date(fecha + "T00:00:00");

    if (Number.isNaN(valor.getTime())) {
      return "No disponible";
    }

    return valor.toLocaleDateString("es-CR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric"
    });
  },

  // Mostrar información personal del usuario
  mostrarDatos(usuario) {
    const datos = document.getElementById("perfil-datos");

    datos.replaceChildren();

    // Encabezado del perfil
    const encabezado = document.createElement("div");

    encabezado.className =
      "d-flex align-items-center gap-3 py-3 mb-4 border-bottom";

    // Avatar alineado a la izquierda
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

    // Información alineada junto al avatar
    const informacion = document.createElement("div");

    informacion.className = "flex-grow-1";
    informacion.style.minWidth = "0";

    const nombre = document.createElement("h3");

    nombre.className = "h5 fw-semibold mb-1 text-break";
    nombre.textContent = usuario.nombre || "No disponible";

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

    // Sección de datos personales
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

      contenido.textContent = valor || "No disponible";

      columna.append(etiqueta, contenido);
      fila.append(columna);
    });

    datos.append(fila);
  },

  // Personalización del avatar
  mostrarAvatares(usuario) {
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
        const actuales = this.obtenerTodos();

        const indice = actuales.findIndex(
          u => u.id === usuario.id
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

  // Limpiar errores anteriores
  limpiarValidaciones(formulario) {
    formulario.querySelectorAll(".is-invalid").forEach(campo => {
      campo.classList.remove("is-invalid");
      campo.removeAttribute("aria-invalid");
    });

    formulario.querySelectorAll(".error-perfil").forEach(error => {
      const campo = document.getElementById(
        error.dataset.campo
      );

      if (campo) {
        const referencias = (
          campo.getAttribute("aria-describedby") || ""
        ).split(/\s+/).filter(
          id => id && id !== error.id
        );

        if (referencias.length) {
          campo.setAttribute(
            "aria-describedby",
            referencias.join(" ")
          );
        } else {
          campo.removeAttribute("aria-describedby");
        }
      }

      error.remove();
    });

    this.limpiarMensaje("mensaje-editar-perfil");
  },

  // Mostrar error debajo del campo
  marcarError(id, texto) {
    const campo = document.getElementById(id);

    if (!campo) return;

    campo.classList.add("is-invalid");
    campo.setAttribute("aria-invalid", "true");

    const error = document.createElement("div");

    error.id = id + "-error";
    error.dataset.campo = id;
    error.className = "invalid-feedback error-perfil";
    error.textContent = texto;

    campo.after(error);

    const referencias = (
      campo.getAttribute("aria-describedby") || ""
    ).split(/\s+/).filter(Boolean);

    referencias.push(error.id);

    campo.setAttribute(
      "aria-describedby",
      referencias.join(" ")
    );
  },

  // Validación de los datos personales
  validar(datos, usuario) {
    const errores = {};

    // Nombre completo
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
      !/^[\p{L}]+(?:[ '-][\p{L}]+)*$/u.test(datos.nombre)
    ) {
      errores["perfil-nombre"] =
        "El nombre solo puede contener letras, espacios, apóstrofes y guiones.";
    }

    // Número telefónico
    const telefonoLimpio = datos.telefono.replace(
      /[\s()-]/g,
      ""
    );

    if (!/^\+?\d{8,15}$/.test(telefonoLimpio)) {
      errores["perfil-telefono"] =
        "Ingrese un teléfono válido de 8 a 15 dígitos.";
    }

    // Correo personal
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
          u.id !== usuario.id &&
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

    // Fecha de nacimiento
    const fecha = new Date(
      datos.nacimiento + "T00:00:00Z"
    );

    if (
      !datos.nacimiento ||
      Number.isNaN(fecha.getTime()) ||
      fecha.toISOString().slice(0, 10) !== datos.nacimiento ||
      new Date(datos.nacimiento + "T00:00:00") > new Date()
    ) {
      errores["perfil-nacimiento"] =
        "Ingrese una fecha de nacimiento válida.";
    }

    // Género
    if (!["f", "m", "o", "n"].includes(datos.genero)) {
      errores["perfil-genero"] =
        "Seleccione un género válido.";
    }

    return errores;
  },

  // Inicialización del módulo
  iniciar() {
    const sesion = this.obtenerSesion();
    const usuarios = this.obtenerTodos();

    const usuario = sesion
      ? usuarios.find(u => u.id === sesion.id)
      : null;

    const botonEditar = document.getElementById(
      "boton-editar-perfil"
    );

    const formulario = document.getElementById(
      "form-editar-perfil"
    );

    const botonCancelar = document.getElementById(
      "cancelar-edicion-perfil"
    );

    if (!botonEditar || !formulario || !botonCancelar) {
      console.error("Faltan elementos del módulo de perfil.");
      return;
    }

    // Verificar usuario de la sesión
    if (!usuario) {
      this.mostrarMensaje(
        "perfil-datos",
        "No se encontró el usuario de la sesión. Inicie sesión nuevamente.",
        "danger"
      );

      botonEditar.disabled = true;
      formulario.hidden = true;

      return;
    }

    formulario.noValidate = true;

    this.limpiarMensaje("mensaje-avatar");
    this.limpiarMensaje("mensaje-editar-perfil");

    this.mostrarDatos(usuario);
    this.mostrarAvatares(usuario);

    // Abrir formulario de edición
    botonEditar.addEventListener("click", () => {
      this.limpiarValidaciones(formulario);

      document.getElementById("perfil-nombre").value =
        usuario.nombre || "";

      document.getElementById("perfil-telefono").value =
        usuario.telefono || "";

      document.getElementById("perfil-correo-personal").value =
        usuario.correoPersonal || "";

      document.getElementById("perfil-nacimiento").value =
        usuario.nacimiento || "";

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

    // Cancelar edición
    botonCancelar.addEventListener("click", () => {
      formulario.reset();

      this.limpiarValidaciones(formulario);

      formulario.hidden = true;

      botonEditar.focus();
    });

    // Guardar cambios del perfil
    formulario.addEventListener("submit", evento => {
      evento.preventDefault();

      this.limpiarValidaciones(formulario);

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
        ).focus();

        return;
      }

      const actuales = this.obtenerTodos();

      const indice = actuales.findIndex(
        u => u.id === usuario.id
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

document.addEventListener("DOMContentLoaded", () => {
  Perfil.iniciar();
});

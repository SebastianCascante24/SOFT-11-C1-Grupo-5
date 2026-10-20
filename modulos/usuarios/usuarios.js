
/*
 * Módulo: Gestión de usuarios
 * HU-01: Registrar usuario
 * HU-08: Consultar usuarios registrados
 * Proyecto Integrador - Grupo 5
 *
 * Prototipo académico: no almacena contraseñas.
 */

const Usuarios = {
  clave: "grupo5_usuarios",

  obtenerTodos() {
    const datos = Almacenamiento.obtener(this.clave, []);
    return Array.isArray(datos) ? datos : [];
  },

  validar(datos) {
    const errores = {};

    if (Validadores.estaVacio(datos.nombre)) {
      errores["u-nombre"] = "Ingrese el nombre completo.";
    } else if (Validadores.superaLongitudMaxima(datos.nombre, 80)) {
      errores["u-nombre"] = "Máximo 80 caracteres.";
    }

    if (Validadores.estaVacio(datos.correo)) {
      errores["u-correo"] = "Ingrese el correo.";
    } else if (
      datos.correo.length > 80 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(datos.correo)
    ) {
      errores["u-correo"] = "Ingrese un correo válido.";
    } else if (
      this.obtenerTodos().some(
        usuario => usuario.correo === datos.correo
      )
    ) {
      errores["u-correo"] = "Este correo ya está registrado.";
    }

    const fecha = new Date(datos.nacimiento + "T00:00:00");
    if (
      !datos.nacimiento ||
      Number.isNaN(fecha.getTime()) ||
      fecha.toISOString().slice(0, 10) !== datos.nacimiento ||
      fecha > new Date()
    ) {
      errores["u-nacimiento"] = "Ingrese una fecha válida.";
    }

    if (!["f", "m", "o", "n"].includes(datos.genero)) {
      errores["u-genero"] = "Seleccione una opción.";
    }

    if (
      !["admin", "rectoria", "vice", "dc", "dir"]
        .includes(datos.rol)
    ) {
      errores["u-rol"] = "Seleccione un rol válido.";
    }

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

    // Nunca guardar contraseñas en localStorage.
    const nuevo = {
      id: crypto.randomUUID(),
      nombre: datos.nombre,
      correo: datos.correo,
      nacimiento: datos.nacimiento,
      genero: datos.genero,
      rol: datos.rol,
      fechaRegistro: new Date().toISOString()
    };

    usuarios.push(nuevo);

    return Almacenamiento.guardar(this.clave, usuarios);
  },

  iniciarFormulario() {
    const formulario = document.getElementById("form-usuario");
    if (!formulario) return;

    formulario.addEventListener("submit", evento => {
      evento.preventDefault();

      const datos = {
        nombre: document.getElementById("u-nombre").value.trim(),
        correo: document.getElementById("u-correo").value.trim().toLowerCase(),
        nacimiento: document.getElementById("u-nacimiento").value,
        genero: document.getElementById("u-genero").value,
        rol: document.getElementById("u-rol").value,
        password: document.getElementById("u-password").value
      };

      const errores = this.validar(datos);
      const resumen = document.getElementById("resumen-errores");

      formulario.querySelectorAll(".mensaje-error").forEach(elemento => {
        elemento.textContent = "";
      });

      formulario.querySelectorAll("[aria-invalid]").forEach(elemento => {
        elemento.removeAttribute("aria-invalid");
      });

      resumen.hidden = true;
      resumen.textContent = "";

      if (Object.keys(errores).length > 0) {
        Object.entries(errores).forEach(([campo, mensaje]) => {
          document.getElementById("error-" + campo).textContent = mensaje;
          document.getElementById(campo).setAttribute("aria-invalid", "true");
        });

        resumen.textContent = "Revise los campos señalados.";
        resumen.hidden = false;
        document.getElementById(Object.keys(errores)[0]).focus();
        return;
      }

      if (this.registrar(datos)) {
        formulario.reset();
        resumen.setAttribute("role", "status");
        resumen.textContent =
          "Registro de demostración guardado correctamente.";
        resumen.hidden = false;
      } else {
        resumen.textContent = "No se pudo guardar el registro.";
        resumen.hidden = false;
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
    console.error("Faltan dependencias del módulo de usuarios.");
  }
});

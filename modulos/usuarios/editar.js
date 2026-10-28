
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
      const datos = JSON.parse(localStorage.getItem(this.clave) || "[]");
      return Array.isArray(datos) ? datos : [];
    } catch {
      return [];
    }
  },

  iniciar() {
    const formulario = document.getElementById("form-editar-usuario");
    const mensaje = document.getElementById("mensaje-edicion");
    const parametros = new URLSearchParams(window.location.search);
    const id = parametros.get("id");

    const sesion = JSON.parse(localStorage.getItem('grupo5_sesion') || 'null');
    if (!sesion || sesion.rol !== 'admin') {
      mensaje.textContent = 'Solo el administrador puede modificar usuarios.';
      formulario.querySelector('button[type="submit"]').disabled = true;
      return;
    }
    const usuarios = this.obtenerTodos();
    const usuario = usuarios.find(u => u.id === id);

    if (!usuario) {
      mensaje.textContent = "No se encontró el usuario solicitado.";
      formulario.querySelector('button[type="submit"]').disabled = true;
      return;
    }

    document.getElementById("editar-nombre").value = usuario.nombre || "";
    document.getElementById("editar-correo").value = usuario.correo || "";
    document.getElementById("editar-nacimiento").value =
      usuario.nacimiento || "";
    document.getElementById("editar-genero").value = usuario.genero || "";
    document.getElementById("editar-rol").value = usuario.rol || "";

    formulario.addEventListener("submit", evento => {
      evento.preventDefault();

      const nombre = document.getElementById("editar-nombre")
        .value.trim();

      const correo = document.getElementById("editar-correo")
        .value.trim().toLowerCase();

      const nacimiento = document.getElementById("editar-nacimiento").value;
      const genero = document.getElementById("editar-genero").value;
      const rol = document.getElementById("editar-rol").value;

      mensaje.textContent = "";

      if (!nombre || nombre.length > 80) {
        mensaje.textContent = "Ingrese un nombre válido.";
        return;
      }

      if (
        correo.length > 80 ||
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)
      ) {
        mensaje.textContent = "Ingrese un correo válido.";
        return;
      }

      const fecha = new Date(nacimiento + "T00:00:00");

      if (
        !nacimiento ||
        Number.isNaN(fecha.getTime()) ||
        fecha.toISOString().slice(0, 10) !== nacimiento ||
        fecha > new Date()
      ) {
        mensaje.textContent = "Ingrese una fecha de nacimiento válida.";
        return;
      }

      if (!["f", "m", "o", "n"].includes(genero)) {
        mensaje.textContent = "Seleccione un género válido.";
        return;
      }

      if (!["admin", "rectoria", "vice", "dc", "dir"].includes(rol)) {
        mensaje.textContent = "Seleccione un rol válido.";
        return;
      }

      const actuales = this.obtenerTodos();

      if (actuales.some(u =>
        u.id !== id &&
        String(u.correo).toLowerCase() === correo
      )) {
        mensaje.textContent = "Ese correo ya pertenece a otro usuario.";
        return;
      }

      const indice = actuales.findIndex(u => u.id === id);

      if (indice === -1) {
        mensaje.textContent = "El usuario ya no existe.";
        return;
      }

      actuales[indice] = {
        ...actuales[indice],
        nombre,
        correo,
        nacimiento,
        genero,
        rol,
        fechaModificacion: new Date().toISOString()
      };

      try {
        localStorage.setItem(this.clave, JSON.stringify(actuales));
        // Conservar la credencial de demostración al modificar el correo.
        if (usuario.correo !== correo) {
          const claveCredenciales = "grupo5_credenciales_demo";
          const credenciales = JSON.parse(localStorage.getItem(claveCredenciales) || "{}");
          const anterior = String(usuario.correo).toLowerCase();
          if (Object.hasOwn(credenciales, anterior)) {
            // La huella usa correo + contraseña: se invalida y requiere reactivación de prueba.
            delete credenciales[anterior];
            localStorage.setItem(claveCredenciales, JSON.stringify(credenciales));
          }
        }
        mensaje.textContent = "Usuario actualizado correctamente.";
      } catch {
        mensaje.textContent = "No se pudieron guardar los cambios.";
      }
    });
  }
};

document.addEventListener("DOMContentLoaded", () => {
  EditarUsuario.iniciar();
});

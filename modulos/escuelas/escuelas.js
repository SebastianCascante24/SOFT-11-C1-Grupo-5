
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formularioEscuela");
  if (!formulario) return;

  const mensaje = document.getElementById("mensajeRegistro");

  const campos = [
    {
      input: document.getElementById("codigoEscuela"),
      error: document.getElementById("errorCodigo"),
      nombre: "El código de la escuela"
    },
    {
      input: document.getElementById("nombreEscuela"),
      error: document.getElementById("errorNombre"),
      nombre: "El nombre de la escuela"
    },
    {
      input: document.getElementById("directorEscuela"),
      error: document.getElementById("errorDirector"),
      nombre: "El nombre del director"
    }
  ];

  function mostrarMensaje(texto, tipo = "error") {
    if (!mensaje) return;

    mensaje.textContent = texto;
    mensaje.classList.remove("alerta-error", "alerta-exito");
    mensaje.classList.add(
      tipo === "exito" ? "alerta-exito" : "alerta-error"
    );
    mensaje.hidden = false;
  }

  function limpiarMensaje() {
    if (!mensaje) return;

    mensaje.textContent = "";
    mensaje.classList.remove("alerta-error", "alerta-exito");
    mensaje.hidden = true;
  }

  function mostrarError(campo, texto) {
    if (!campo.input) return;

    campo.input.setAttribute("aria-invalid", "true");
    campo.input.classList.add("campo-invalido");

    if (campo.error) {
      campo.error.textContent = texto;
      campo.error.classList.add("mensaje-error-escuela");
    }
  }

  function limpiarError(campo) {
    if (!campo.input) return;

    campo.input.removeAttribute("aria-invalid");
    campo.input.classList.remove("campo-invalido");

    if (campo.error) {
      campo.error.textContent = "";
    }
  }

  function obtenerEscuelas() {
    const datos = JSON.parse(
      localStorage.getItem("grupo5_escuelas") || "[]"
    );

    if (!Array.isArray(datos)) {
      throw new Error("Formato de almacenamiento inválido");
    }

    return datos;
  }

  campos.forEach(campo => {
    if (!campo.input) return;

    campo.input.addEventListener("input", () => {
      limpiarError(campo);
      limpiarMensaje();
    });
  });

  formulario.addEventListener("submit", evento => {
    evento.preventDefault();
    limpiarMensaje();

    campos.forEach(limpiarError);

    let hayErrores = false;
    let primerCampoInvalido = null;

    campos.forEach(campo => {
      if (!campo.input) {
        hayErrores = true;
        return;
      }

      if (!campo.input.value.trim()) {
        mostrarError(
          campo,
          `${campo.nombre} es obligatorio.`
        );

        hayErrores = true;

        if (!primerCampoInvalido) {
          primerCampoInvalido = campo.input;
        }
      }
    });

    if (hayErrores) {
      mostrarMensaje(
        "Revise los campos señalados antes de continuar."
      );

      if (primerCampoInvalido) {
        primerCampoInvalido.focus();
      }

      return;
    }

    const escuela = {
      codigo: campos[0].input.value.trim().toUpperCase(),
      nombre: campos[1].input.value.trim(),
      director: campos[2].input.value.trim()
    };

    try {
      const escuelas = obtenerEscuelas();

      const codigoDuplicado = escuelas.some(
        item =>
          String(item.codigo || "").trim().toUpperCase() ===
          escuela.codigo
      );

      if (codigoDuplicado) {
        mostrarError(
          campos[0],
          "Ya existe una escuela registrada con este código."
        );

        mostrarMensaje(
          "No se pudo registrar la escuela porque el código ya existe."
        );

        campos[0].input.focus();
        return;
      }

      escuelas.push(escuela);

      localStorage.setItem(
        "grupo5_escuelas",
        JSON.stringify(escuelas)
      );

      formulario.reset();
      campos.forEach(limpiarError);

      mostrarMensaje(
        "Escuela registrada correctamente.",
        "exito"
      );
    } catch (error) {
      mostrarMensaje(
        "No fue posible guardar la escuela. Revise el almacenamiento del navegador."
      );
      console.error("Error al registrar escuela:", error);
    }
  });

  formulario.addEventListener("reset", () => {
    campos.forEach(limpiarError);
    limpiarMensaje();
  });
});

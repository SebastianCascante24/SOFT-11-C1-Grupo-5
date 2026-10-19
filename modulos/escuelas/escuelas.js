
"use strict";

document.addEventListener("DOMContentLoaded", () => {
  const formulario = document.getElementById("formularioEscuela");
  if (!formulario) return;

  const mensaje = document.getElementById("mensajeRegistro");

  formulario.addEventListener("submit", (evento) => {
    evento.preventDefault();

    const campos = [...formulario.querySelectorAll("input[required]")];

    if (campos.some(campo => !campo.value.trim())) {
      mostrarMensaje("Todos los campos son obligatorios.", true);
      return;
    }

    const escuela = {
      codigo: campos[0].value.trim().toUpperCase(),
      nombre: campos[1].value.trim(),
      director: campos[2].value.trim()
    };

    const escuelas = JSON.parse(
      localStorage.getItem("grupo5_escuelas") || "[]"
    );

    if (escuelas.some(e => e.codigo === escuela.codigo)) {
      mostrarMensaje("Ya existe una escuela con ese código.", true);
      return;
    }

    escuelas.push(escuela);
    localStorage.setItem("grupo5_escuelas", JSON.stringify(escuelas));

    formulario.reset();
    mostrarMensaje("Escuela registrada correctamente.", false);
  });

  function mostrarMensaje(texto, esError) {
    if (mensaje) {
      mensaje.textContent = texto;
      mensaje.style.color = esError ? "#b42318" : "#16703c";
    } else {
      alert(texto);
    }
  }
});

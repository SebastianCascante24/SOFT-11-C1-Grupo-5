"use strict";
const Perfil = {
  opciones: ["👤", "👩‍💻", "👨‍💻", "🎓", "⭐", "🌿"],
  iniciar() {
    const sesion = JSON.parse(localStorage.getItem("grupo5_sesion") || "null");
    const usuarios = JSON.parse(localStorage.getItem("grupo5_usuarios") || "[]");
    const usuario = Array.isArray(usuarios) && sesion ? usuarios.find(u => u.id === sesion.id) : null;
    const datos = document.getElementById("perfil-datos");
    if (!usuario) { datos.textContent = "No se encontró el usuario de la sesión. Inicie sesión nuevamente."; return; }
    const icono = document.createElement("div"); icono.className = "foto-perfil"; icono.id = "avatar-actual";
    icono.textContent = usuario.avatar || "👤"; datos.append(icono);
    // Calcular la edad a partir de la fecha de nacimiento
let edad = "No disponible";

if (usuario.nacimiento) {
  const nacimiento = new Date(usuario.nacimiento + "T00:00:00");
  const hoy = new Date();

  if (!Number.isNaN(nacimiento.getTime()) && nacimiento <= hoy) {
    let anios = hoy.getFullYear() - nacimiento.getFullYear();

    const cumplio =
      hoy.getMonth() > nacimiento.getMonth() ||
      (
        hoy.getMonth() === nacimiento.getMonth() &&
        hoy.getDate() >= nacimiento.getDate()
      );

    if (!cumplio) {
      anios--;
    }

    edad = anios + " años";
  }
}

// Convertir el código de género en un texto comprensible
const generos = {
  f: "Femenino",
  m: "Masculino",
  o: "Otro",
  n: "Prefiero no indicarlo"
};

// Mostrar los datos del usuario
const campos = [
  ["Nombre completo", usuario.nombre],
  ["Identificación", usuario.identificacion],
  ["Número telefónico", usuario.telefono],
  ["Correo institucional", usuario.correo],
  ["Correo personal", usuario.correoPersonal],
  ["Género", generos[usuario.genero] || usuario.genero],
  ["Edad", edad],
  ["Fecha de nacimiento", usuario.nacimiento],
  ["Rol", usuario.rol]
];

campos.forEach(([titulo, valor]) => {
  const linea = document.createElement("p");
  const etiqueta = document.createElement("strong");

  etiqueta.textContent = titulo + ": ";

  linea.append(
    etiqueta,
    document.createTextNode(valor || "No disponible")
  );

  datos.append(linea);
});
    const contenedor=document.getElementById("avatares");
    this.opciones.forEach(opcion=>{
      const boton=document.createElement("button");boton.type="button";boton.className="avatar-opcion";boton.textContent=opcion;
      boton.setAttribute("aria-label","Elegir avatar "+opcion);boton.setAttribute("aria-pressed",String((usuario.avatar||"👤")===opcion));
      boton.addEventListener("click",()=>{
        const actuales=JSON.parse(localStorage.getItem("grupo5_usuarios")||"[]");const indice=actuales.findIndex(u=>u.id===usuario.id);
        if(indice<0)return;
        actuales[indice].avatar=opcion;
        try{localStorage.setItem("grupo5_usuarios",JSON.stringify(actuales));usuario.avatar=opcion;icono.textContent=opcion;
          contenedor.querySelectorAll("button").forEach(b=>b.setAttribute("aria-pressed",String(b===boton)));
          document.getElementById("mensaje-avatar").textContent="Avatar guardado correctamente.";
          const encabezado=document.getElementById("encabezado-avatar");if(encabezado)encabezado.textContent=opcion;
        }catch(e){document.getElementById("mensaje-avatar").textContent="No se pudo guardar el avatar.";}
      });contenedor.append(boton);
      });
const botonEditar = document.getElementById("boton-editar-perfil");
const formularioEditar = document.getElementById("form-editar-perfil");

botonEditar.addEventListener("click", () => {
  document.getElementById("perfil-nombre").value = usuario.nombre || "";
  document.getElementById("perfil-telefono").value = usuario.telefono || "";
  document.getElementById("perfil-correo-personal").value = usuario.correoPersonal || "";
  document.getElementById("perfil-nacimiento").value = usuario.nacimiento || "";
  document.getElementById("perfil-genero").value = usuario.genero || "";

  formularioEditar.hidden = false;
  formularioEditar.scrollIntoView({ behavior: "smooth" });
});

// Cancelar la modificación del perfil
const botonCancelar = document.getElementById("cancelar-edicion-perfil");

botonCancelar.addEventListener("click", () => {
  formularioEditar.reset();
  formularioEditar.hidden = true;
});
    formularioEditar.addEventListener("submit", (evento) => {
      evento.preventDefault();

      const nombre = document.getElementById("perfil-nombre").value.trim();
      const telefono = document.getElementById("perfil-telefono").value.trim();
      const correoPersonal = document.getElementById("perfil-correo-personal").value.trim().toLowerCase();
      const nacimiento = document.getElementById("perfil-nacimiento").value;
      const genero = document.getElementById("perfil-genero").value;

      if (nombre.split(/\s+/).length < 2) {
        alert("Ingrese su nombre y al menos un apellido.");
        return;
      }

      if (!/^[0-9]{4}-?[0-9]{4}$/.test(telefono)) {
        alert("Ingrese un teléfono válido de 8 dígitos.");
        return;
      }

      if (correoPersonal && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correoPersonal)) {
        alert("Ingrese un correo personal válido.");
        return;
      }

      const fecha = new Date(nacimiento + "T00:00:00");

      if (
        !nacimiento ||
        Number.isNaN(fecha.getTime()) ||
        fecha.toISOString().slice(0, 10) !== nacimiento ||
        fecha > new Date()
      ) {
        alert("Ingrese una fecha de nacimiento válida.");
        return;
      }

      if (!["f", "m", "o", "n"].includes(genero)) {
        alert("Seleccione un género válido.");
        return;
      }

      const actuales = JSON.parse(localStorage.getItem("grupo5_usuarios") || "[]");
      const indice = actuales.findIndex(u => u.id === usuario.id);

      if (indice === -1) {
        alert("No se encontró el usuario.");
        return;
      }

      actuales[indice] = {
        ...actuales[indice],
        nombre,
        telefono,
        correoPersonal,
        nacimiento,
        genero,
        fechaModificacion: new Date().toISOString()
      };

      try {
        localStorage.setItem("grupo5_usuarios", JSON.stringify(actuales));
        alert("Perfil actualizado correctamente.");
        window.location.reload();
      } catch {
        alert("No se pudieron guardar los cambios.");
      }
    });
  }
};

console.log("Perfil.js se está ejecutando correctamente");
document.addEventListener("DOMContentLoaded",()=>Perfil.iniciar());

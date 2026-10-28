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
    for (const [titulo,valor] of [["Nombre",usuario.nombre],["Correo",usuario.correo],["Rol",usuario.rol],["Fecha de nacimiento",usuario.nacimiento]]) {
      const linea=document.createElement("p"); const etiqueta=document.createElement("strong"); etiqueta.textContent=titulo+": ";linea.append(etiqueta,document.createTextNode(valor||"No disponible"));datos.append(linea);
    }
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
  }
};
document.addEventListener("DOMContentLoaded",()=>Perfil.iniciar());

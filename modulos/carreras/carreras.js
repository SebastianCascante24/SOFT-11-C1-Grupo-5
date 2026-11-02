"use strict";
const Carreras = {
  clave: "grupo5_carreras",
  leer(clave) { try { const x=JSON.parse(localStorage.getItem(clave)||"[]");return Array.isArray(x)?x:[]; } catch {return [];} },
  opciones(select,items,valor,texto){items.forEach(item=>{const opcion=document.createElement("option");opcion.value=String(valor(item));opcion.textContent=texto(item);select.append(opcion);});},
  iniciar(){
    const formulario=document.getElementById("form-carrera");
    const parametros = new URLSearchParams(window.location.search);
const codigoEditar = parametros.get("codigo");
const modoEdicion = codigoEditar !== null;
const botonSalirCarrera = document.getElementById("botonSalirCarrera");

if (botonSalirCarrera && modoEdicion) {
  botonSalirCarrera.textContent = "Cancelar";
}

if (formulario && modoEdicion) {
  const carreras = this.leer(this.clave);
  const carreraEditar = carreras.find(
    c => c.codigo === codigoEditar
  );

  if (!carreraEditar) {
    alert("No se encontró la carrera seleccionada.");
    window.location.href = "listado.html";
    return;
  }

  document.getElementById("tituloCarrera").textContent = "Modificar carrera";
  document.getElementById("botonGuardarCarrera").textContent = "Guardar cambios";
  document.getElementById("botonRestablecerCarrera").hidden = false;

  document.getElementById("codigo").value = carreraEditar.codigo;
  document.getElementById("nombre").value = carreraEditar.nombre;
  document.getElementById("codigo").readOnly = true;
}
    if(formulario){
      const escuelas=this.leer("grupo5_escuelas");const usuarios=this.leer("grupo5_usuarios");
      this.opciones(document.getElementById("escuela"),escuelas,e=>e.codigo,e=>e.nombre+" ("+e.codigo+")");
      this.opciones(document.getElementById("director"),usuarios.filter(u=>u.rol==="dir"),u=>u.id,u=>u.nombre+" — "+u.correo);
      if (modoEdicion) {
  const carreraEditar = this.leer(this.clave).find(
    c => c.codigo === codigoEditar
  );

  if (carreraEditar) {
    document.getElementById("escuela").value = carreraEditar.escuelaCodigo;
    document.getElementById("director").value = carreraEditar.directorId;

    const botonRestablecer = document.getElementById("botonRestablecerCarrera");

    botonRestablecer.addEventListener("click", () => {
      document.getElementById("codigo").value = carreraEditar.codigo;
      document.getElementById("nombre").value = carreraEditar.nombre;
      document.getElementById("escuela").value = carreraEditar.escuelaCodigo;
      document.getElementById("director").value = carreraEditar.directorId;
    });
  }
}
      const mensaje=document.getElementById("mensaje-carrera");
      if(!escuelas.length)mensaje.textContent="Primero registre una escuela.";
      else if(!usuarios.some(u=>u.rol==="dir"))mensaje.textContent="Primero registre un usuario con rol Dirección de Escuela / Carrera.";
      formulario.addEventListener("submit",evento=>{
        evento.preventDefault();
        const codigo=document.getElementById("codigo").value.trim().toUpperCase();
        const nombre=document.getElementById("nombre").value.trim();
        const escuelaCodigo=document.getElementById("escuela").value;
        const directorId=document.getElementById("director").value;
        if(!codigo||codigo.length>20||!nombre||nombre.length>100||!escuelas.some(e=>e.codigo===escuelaCodigo)||!usuarios.some(u=>u.id===directorId&&u.rol==="dir")){
          mensaje.textContent="Complete los campos y seleccione una escuela y un director válidos.";return;
        }
        const carreras=this.leer(this.clave);
        
if (modoEdicion) {
  const indice = carreras.findIndex(
    c => c.codigo === codigoEditar
  );

  if (indice === -1) {
    mensaje.textContent = "No se encontró la carrera que desea modificar.";
    return;
  }

  carreras[indice].nombre = nombre;
  carreras[indice].escuelaCodigo = escuelaCodigo;
  carreras[indice].directorId = directorId;

  try {
    localStorage.setItem(
      this.clave,
      JSON.stringify(carreras)
    );

    mensaje.textContent = "Carrera modificada correctamente.";
  } catch (error) {
    mensaje.textContent = "No fue posible guardar los cambios.";
    console.error("Error al modificar carrera:", error);
  }

  return;
}

        if(carreras.some(c=>c.codigo===codigo)){mensaje.textContent="Ya existe una carrera con ese código.";return;}
        carreras.push({id:crypto.randomUUID(),codigo,nombre,escuelaCodigo,directorId,fechaRegistro:new Date().toISOString()});
        try{localStorage.setItem(this.clave,JSON.stringify(carreras));formulario.reset();mensaje.textContent="Carrera y director asociados correctamente.";}
        catch{mensaje.textContent="No se pudo guardar la carrera.";}
      });
    }
    const tabla=document.getElementById("tabla-carreras");if(!tabla)return;
    const buscador = document.getElementById("buscar-carrera");

if (buscador) {
  buscador.addEventListener("input", () => {
    const texto = buscador.value.trim().toLowerCase();
    const filas = tabla.querySelectorAll("tr");

    filas.forEach(fila => {
      const codigo = fila.cells[0]?.textContent.toLowerCase() || "";
      const nombre = fila.cells[1]?.textContent.toLowerCase() || "";

      fila.hidden = !(
        codigo.includes(texto) ||
        nombre.includes(texto)
      );
    });
  });
}
    const carreras=this.leer(this.clave), escuelas=this.leer("grupo5_escuelas"),usuarios=this.leer("grupo5_usuarios");
    const filtroEscuela = document.getElementById("filtrar-escuela");

if (filtroEscuela) {
  escuelas.forEach(escuela => {
    const opcion = document.createElement("option");
    opcion.value = escuela.codigo;
    opcion.textContent = escuela.nombre;
    filtroEscuela.appendChild(opcion);
  });

  filtroEscuela.addEventListener("change", () => {
    const codigoSeleccionado = filtroEscuela.value;

    tabla.querySelectorAll("tr").forEach(fila => {
      const codigoCarrera = fila.dataset.escuelaCodigo;

      fila.hidden = codigoSeleccionado !== "" &&
                    codigoCarrera !== codigoSeleccionado;
    });
  });
}
    document.getElementById("total-carreras").textContent="Total de carreras registradas: "+carreras.length;
    if(!carreras.length)document.getElementById("mensaje-carreras").textContent="No hay carreras registradas.";
    carreras.forEach(c=>{
      const fila=document.createElement("tr");
      fila.dataset.escuelaCodigo = c.escuelaCodigo;
      const escuela=escuelas.find(e=>e.codigo===c.escuelaCodigo);
      const director=usuarios.find(u=>u.id===c.directorId);
      [c.codigo,c.nombre,escuela?.nombre||"Escuela no disponible",director?.nombre||"Director no disponible"].forEach(valor=>{const td=document.createElement("td");td.textContent=valor;fila.append(td);});
      const td=document.createElement("td"),boton=document.createElement("button");boton.type="button";boton.className="boton-secundario";boton.textContent="Cambiar director"; 
      const botonModificar = document.createElement("button");
botonModificar.type = "button";
botonModificar.className = "boton-secundario";
botonModificar.textContent = "Modificar carrera";

botonModificar.addEventListener("click", () => {
  window.location.href =
    "formulario.html?codigo=" + encodeURIComponent(c.codigo);
});

td.append(botonModificar);
      boton.addEventListener("click",()=>{
        const disponibles=this.leer("grupo5_usuarios").filter(u=>u.rol==="dir");
        const selector=document.createElement("select");selector.setAttribute("aria-label","Seleccionar director de "+c.nombre);
        this.opciones(selector,disponibles,u=>u.id,u=>u.nombre+" — "+u.correo);selector.value=c.directorId;
        const guardar=document.createElement("button");guardar.type="button";guardar.textContent="Guardar";guardar.className="boton";
        guardar.addEventListener("click",()=>{
          const actuales=this.leer(this.clave),item=actuales.find(x=>x.id===c.id);
          if(!item||!disponibles.some(u=>u.id===selector.value)){document.getElementById("mensaje-carreras").textContent="Seleccione un director válido.";return;}
          item.directorId=selector.value;
          try{localStorage.setItem(this.clave,JSON.stringify(actuales));location.reload();}catch{document.getElementById("mensaje-carreras").textContent="No se pudo guardar.";}
        });td.replaceChildren(selector,guardar);
      });td.append(boton);fila.append(td);tabla.append(fila);
    });
  }
};
document.addEventListener("DOMContentLoaded",()=>Carreras.iniciar());

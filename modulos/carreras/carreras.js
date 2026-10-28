"use strict";
const Carreras = {
  clave: "grupo5_carreras",
  leer(clave) { try { const x=JSON.parse(localStorage.getItem(clave)||"[]");return Array.isArray(x)?x:[]; } catch {return [];} },
  opciones(select,items,valor,texto){items.forEach(item=>{const opcion=document.createElement("option");opcion.value=String(valor(item));opcion.textContent=texto(item);select.append(opcion);});},
  iniciar(){
    const formulario=document.getElementById("form-carrera");
    if(formulario){
      const escuelas=this.leer("grupo5_escuelas");const usuarios=this.leer("grupo5_usuarios");
      this.opciones(document.getElementById("escuela"),escuelas,e=>e.codigo,e=>e.nombre+" ("+e.codigo+")");
      this.opciones(document.getElementById("director"),usuarios.filter(u=>u.rol==="dir"),u=>u.id,u=>u.nombre+" — "+u.correo);
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
        if(carreras.some(c=>c.codigo===codigo)){mensaje.textContent="Ya existe una carrera con ese código.";return;}
        carreras.push({id:crypto.randomUUID(),codigo,nombre,escuelaCodigo,directorId,fechaRegistro:new Date().toISOString()});
        try{localStorage.setItem(this.clave,JSON.stringify(carreras));formulario.reset();mensaje.textContent="Carrera y director asociados correctamente.";}
        catch{mensaje.textContent="No se pudo guardar la carrera.";}
      });
    }
    const tabla=document.getElementById("tabla-carreras");if(!tabla)return;
    const carreras=this.leer(this.clave), escuelas=this.leer("grupo5_escuelas"),usuarios=this.leer("grupo5_usuarios");
    document.getElementById("total-carreras").textContent="Total de carreras registradas: "+carreras.length;
    if(!carreras.length)document.getElementById("mensaje-carreras").textContent="No hay carreras registradas.";
    carreras.forEach(c=>{
      const fila=document.createElement("tr");
      const escuela=escuelas.find(e=>e.codigo===c.escuelaCodigo);
      const director=usuarios.find(u=>u.id===c.directorId);
      [c.codigo,c.nombre,escuela?.nombre||"Escuela no disponible",director?.nombre||"Director no disponible"].forEach(valor=>{const td=document.createElement("td");td.textContent=valor;fila.append(td);});
      const td=document.createElement("td"),boton=document.createElement("button");boton.type="button";boton.className="boton-secundario";boton.textContent="Cambiar director";
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
